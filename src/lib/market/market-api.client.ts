import { CoinMarket } from "@/types/market";
import { CoinHistorySeries, LivePricePoint } from "@/types/market-data";

type ApiResponse<T> = {
  data: T;
};

type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: string;
  };
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new Error(body?.error?.message ?? `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchLivePrices(ids: string[]) {
  const query = new URLSearchParams({
    ids: ids.join(","),
    vsCurrency: "usd",
  });

  const payload = await fetchJson<ApiResponse<LivePricePoint[]>>(`/api/market/prices?${query.toString()}`);
  return payload.data;
}

export async function fetchTopMarkets(vsCurrency = "usd", page = 1, perPage = 20) {
  const query = new URLSearchParams({
    vsCurrency: String(vsCurrency),
    page: String(page),
    perPage: String(perPage),
  });

  const payload = await fetchJson<ApiResponse<CoinMarket[]>>(`/api/market/markets?${query.toString()}`);
  return payload.data;
}

export async function fetchHistory(ids: string[], days: 7 | 30) {
  const query = new URLSearchParams({
    ids: ids.join(","),
    days: String(days),
    vsCurrency: "usd",
  });

  const payload = await fetchJson<ApiResponse<CoinHistorySeries[]>>(`/api/market/history?${query.toString()}`);
  return payload.data;
}
