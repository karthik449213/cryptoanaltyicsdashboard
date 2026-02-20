import { NextResponse } from "next/server";
import { CoinGeckoServiceError, CoinGeckoValidationError, toServiceError } from "@/lib/market/errors";
import { ApiErrorBody, HistoryWindowDays, SupportedVsCurrency } from "@/types/market-data";

const allowedCurrencies = new Set<SupportedVsCurrency>(["usd", "eur", "gbp"]);

export function parseVsCurrency(value: string | null | undefined): SupportedVsCurrency {
  const normalized = (value ?? "usd").toLowerCase();
  if (!allowedCurrencies.has(normalized as SupportedVsCurrency)) {
    throw new CoinGeckoValidationError("vsCurrency must be one of: usd, eur, gbp.");
  }

  return normalized as SupportedVsCurrency;
}

export function parseIds(rawIds: string | null | undefined): string[] {
  const ids = (rawIds ?? "")
    .split(",")
    .map((id) => id.trim().toLowerCase())
    .filter(Boolean);

  if (!ids.length) {
    throw new CoinGeckoValidationError("ids query parameter is required.");
  }

  return ids;
}

export function parseHistoryDays(value: string | null | undefined): HistoryWindowDays {
  const parsed = Number(value ?? 7);
  if (parsed !== 7 && parsed !== 30) {
    throw new CoinGeckoValidationError("days must be 7 or 30.");
  }

  return parsed as HistoryWindowDays;
}

export function parsePositiveInt(
  value: string | null | undefined,
  fieldName: string,
  defaultValue: number,
  maxValue: number,
) {
  const parsed = Number(value ?? defaultValue);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > maxValue) {
    throw new CoinGeckoValidationError(`${fieldName} must be an integer between 1 and ${maxValue}.`);
  }

  return parsed;
}

export function errorResponse(error: unknown) {
  const serviceError = toServiceError(error);
  const body: ApiErrorBody = {
    error: {
      code: serviceError.code,
      message: serviceError.message,
      details: serviceError.details,
    },
  };

  return NextResponse.json(body, {
    status: serviceError.status,
  });
}

export function withApiErrorHandling<T>(handler: () => Promise<T>) {
  return handler().catch((error) => {
    if (error instanceof CoinGeckoServiceError) {
      throw error;
    }

    throw error;
  });
}
