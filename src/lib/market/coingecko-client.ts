import { CoinGeckoRateLimitError, CoinGeckoServiceError } from "@/lib/market/errors";

const API_BASE = "https://api.coingecko.com/api/v3";
const MAX_RETRIES = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelay(attempt: number, retryAfterHeader: string | null) {
  if (retryAfterHeader) {
    const retryAfterSeconds = Number(retryAfterHeader);
    if (!Number.isNaN(retryAfterSeconds)) {
      return retryAfterSeconds * 1000;
    }
  }

  const exponential = Math.min(1000 * 2 ** attempt, 8000);
  const jitter = Math.floor(Math.random() * 250);
  return exponential + jitter;
}

function headers() {
  const key = process.env.COINGECKO_API_KEY;
  return key ? { "x-cg-demo-api-key": key } : undefined;
}

export async function coingeckoFetch<T>(
  endpoint: string,
  options?: {
    revalidateSeconds?: number;
  },
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    let response: Response;

    try {
      response = await fetch(`${API_BASE}${endpoint}`, {
        headers: headers(),
        next: { revalidate: options?.revalidateSeconds ?? 60 },
      });
    } catch (error) {
      lastError = error;
      if (attempt === MAX_RETRIES) {
        throw new CoinGeckoServiceError(
          "CoinGecko network request failed after retries",
          "NETWORK_ERROR",
          503,
          error instanceof Error ? error.message : String(error),
        );
      }

      await sleep(retryDelay(attempt, null));
      continue;
    }

    if (response.ok) {
      return (await response.json()) as T;
    }

    if (response.status === 429) {
      const delay = retryDelay(attempt, response.headers.get("retry-after"));
      lastError = new CoinGeckoRateLimitError(
        "CoinGecko rate limit reached. Retrying with backoff.",
        `retry_in_ms:${delay}`,
      );

      if (attempt === MAX_RETRIES) {
        throw lastError;
      }

      await sleep(delay);
      continue;
    }

    const body = await response.text();
    throw new CoinGeckoServiceError(
      `CoinGecko request failed with status ${response.status}`,
      "UPSTREAM_ERROR",
      response.status,
      body,
    );
  }

  throw new CoinGeckoServiceError(
    "CoinGecko request failed after retries",
    "RETRY_EXHAUSTED",
    503,
    String(lastError),
  );
}
