import { z } from "zod";
import { AlertType, CreatePriceAlertInput, UpdatePriceAlertInput } from "@/types/alerts";

const createPriceAlertSchema = z.object({
  coinId: z.string().min(1, "Coin ID is required").max(100, "Coin ID too long"),
  symbol: z.string().min(1, "Symbol is required").max(20, "Symbol too long"),
  alertType: z.enum(["above", "below"]),
  thresholdPrice: z.number().positive("Threshold price must be positive"),
});

const updatePriceAlertSchema = z.object({
  coinId: z.string().min(1, "Coin ID is required").max(100, "Coin ID too long").optional(),
  symbol: z.string().min(1, "Symbol is required").max(20, "Symbol too long").optional(),
  alertType: z.enum(["above", "below"]).optional(),
  thresholdPrice: z.number().positive("Threshold price must be positive").optional(),
  isActive: z.boolean().optional(),
});

export function validateCreatePriceAlert(input: unknown): CreatePriceAlertInput {
  try {
    return createPriceAlertSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      throw new Error(`${firstError.path.join('.')}: ${firstError.message}`);
    }
    throw new Error("Invalid input for creating price alert");
  }
}

export function validateUpdatePriceAlert(input: unknown): UpdatePriceAlertInput {
  try {
    return updatePriceAlertSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      throw new Error(`${firstError.path.join('.')}: ${firstError.message}`);
    }
    throw new Error("Invalid input for updating price alert");
  }
}

export function validateAlertType(type: string): AlertType {
  if (type !== "above" && type !== "below") {
    throw new Error("Alert type must be 'above' or 'below'");
  }
  return type;
}

export function validateThresholdPrice(price: number): number {
  if (typeof price !== "number" || price <= 0) {
    throw new Error("Threshold price must be a positive number");
  }
  if (price > 10000000) { // Reasonable upper limit for crypto prices
    throw new Error("Threshold price is too high");
  }
  return price;
}

export function validateCoinId(coinId: string): string {
  if (!coinId || typeof coinId !== "string") {
    throw new Error("Coin ID is required");
  }
  if (coinId.length > 100) {
    throw new Error("Coin ID is too long");
  }
  // Basic validation for common crypto ID patterns
  if (!/^[a-z0-9_-]+$/.test(coinId)) {
    throw new Error("Coin ID contains invalid characters");
  }
  return coinId;
}

export function validateSymbol(symbol: string): string {
  if (!symbol || typeof symbol !== "string") {
    throw new Error("Symbol is required");
  }
  if (symbol.length > 20) {
    throw new Error("Symbol is too long");
  }
  // Allow uppercase letters, numbers, and common symbols
  if (!/^[A-Z0-9]+$/.test(symbol.toUpperCase())) {
    throw new Error("Symbol contains invalid characters");
  }
  return symbol.toUpperCase();
}