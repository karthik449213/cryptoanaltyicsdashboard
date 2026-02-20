export class CoinGeckoServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly details?: string,
  ) {
    super(message);
    this.name = "CoinGeckoServiceError";
  }
}

export class CoinGeckoRateLimitError extends CoinGeckoServiceError {
  constructor(message: string, details?: string) {
    super(message, "RATE_LIMITED", 429, details);
    this.name = "CoinGeckoRateLimitError";
  }
}

export class CoinGeckoValidationError extends CoinGeckoServiceError {
  constructor(message: string, details?: string) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "CoinGeckoValidationError";
  }
}

export function toServiceError(error: unknown): CoinGeckoServiceError {
  if (error instanceof CoinGeckoServiceError) {
    return error;
  }

  if (error instanceof Error) {
    return new CoinGeckoServiceError(error.message, "INTERNAL_ERROR", 500);
  }

  return new CoinGeckoServiceError("Unknown service error", "INTERNAL_ERROR", 500);
}
