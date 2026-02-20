import { NextResponse } from "next/server";
import { calculatePortfolioSummary } from "@/lib/portfolio/engine";
import { portfolioErrorResponse } from "@/lib/portfolio/http";
import { portfolioRepository } from "@/lib/portfolio/repository";

export async function GET() {
  try {
    const holdings = await portfolioRepository.listHoldings();
    const summary = await calculatePortfolioSummary(holdings);

    return NextResponse.json(
      { data: summary },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, max-age=20, stale-while-revalidate=40",
        },
      },
    );
  } catch (error) {
    return portfolioErrorResponse(error);
  }
}
