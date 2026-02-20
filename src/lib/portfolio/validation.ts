import { CreateHoldingInput, UpdateHoldingInput } from "@/types/portfolio";
import { PortfolioValidationError } from "@/lib/portfolio/errors";

function sanitizeCoinId(value: unknown): string {
  const coinId = String(value ?? "").trim().toLowerCase();
  if (!coinId) {
    throw new PortfolioValidationError("coinId is required.");
  }

  if (!/^[a-z0-9-]+$/.test(coinId)) {
    throw new PortfolioValidationError("coinId format is invalid.");
  }

  return coinId;
}

function sanitizeSymbol(value: unknown): string {
  const symbol = String(value ?? "").trim().toUpperCase();
  if (!symbol) {
    throw new PortfolioValidationError("symbol is required.");
  }

  if (!/^[A-Z0-9]{2,15}$/.test(symbol)) {
    throw new PortfolioValidationError("symbol format is invalid.");
  }

  return symbol;
}

function sanitizePositiveNumber(value: unknown, fieldName: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new PortfolioValidationError(`${fieldName} must be a positive number.`);
  }

  return parsed;
}

function sanitizeDate(value: unknown, fieldName: string): string {
  const date = value ? new Date(String(value)) : new Date();
  if (Number.isNaN(date.getTime())) {
    throw new PortfolioValidationError(`${fieldName} is invalid.`);
  }

  return date.toISOString();
}

function sanitizeNotes(value: unknown): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const notes = String(value ?? "").trim();
  if (!notes) {
    return "";
  }

  if (notes.length > 500) {
    throw new PortfolioValidationError("notes must be 500 characters or less.");
  }

  return notes;
}

export function validateCreateHolding(input: unknown): CreateHoldingInput {
  const payload = (input ?? {}) as Record<string, unknown>;

  return {
    coinId: sanitizeCoinId(payload.coinId),
    symbol: sanitizeSymbol(payload.symbol),
    quantity: sanitizePositiveNumber(payload.quantity, "quantity"),
    buyPrice: sanitizePositiveNumber(payload.buyPrice, "buyPrice"),
    buyDate: sanitizeDate(payload.buyDate, "buyDate"),
    notes: sanitizeNotes(payload.notes),
  };
}

export function validateUpdateHolding(input: unknown): UpdateHoldingInput {
  const payload = (input ?? {}) as Record<string, unknown>;

  const update: UpdateHoldingInput = {};

  if (payload.coinId !== undefined) {
    update.coinId = sanitizeCoinId(payload.coinId);
  }

  if (payload.symbol !== undefined) {
    update.symbol = sanitizeSymbol(payload.symbol);
  }

  if (payload.quantity !== undefined) {
    update.quantity = sanitizePositiveNumber(payload.quantity, "quantity");
  }

  if (payload.buyPrice !== undefined) {
    update.buyPrice = sanitizePositiveNumber(payload.buyPrice, "buyPrice");
  }

  if (payload.buyDate !== undefined) {
    update.buyDate = sanitizeDate(payload.buyDate, "buyDate");
  }

  if (payload.notes !== undefined) {
    update.notes = payload.notes === null ? null : sanitizeNotes(payload.notes);
  }

  if (!Object.keys(update).length) {
    throw new PortfolioValidationError("At least one field is required to update a holding.");
  }

  return update;
}
