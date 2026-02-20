import { NextResponse } from "next/server";
import { PortfolioError, toPortfolioError } from "@/lib/portfolio/errors";

export function portfolioErrorResponse(error: unknown) {
  const normalized = toPortfolioError(error);

  return NextResponse.json(
    {
      error: {
        code: normalized.code,
        message: normalized.message,
      },
    },
    { status: normalized.status },
  );
}

export function parseHoldingId(value: string): string {
  const normalized = value.trim();
  if (!/^[0-9a-f-]{36}$/i.test(normalized)) {
    throw new PortfolioError("holdingId format is invalid.", "VALIDATION_ERROR", 400);
  }

  return normalized;
}
