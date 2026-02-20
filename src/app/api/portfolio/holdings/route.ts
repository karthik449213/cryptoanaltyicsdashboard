import { NextRequest, NextResponse } from "next/server";
import { portfolioRepository } from "@/lib/portfolio/repository";
import { portfolioErrorResponse } from "@/lib/portfolio/http";
import { validateCreateHolding } from "@/lib/portfolio/validation";

export async function GET() {
  try {
    const holdings = await portfolioRepository.listHoldings();
    return NextResponse.json({ data: holdings }, { status: 200 });
  } catch (error) {
    return portfolioErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const input = validateCreateHolding(payload);
    const holding = await portfolioRepository.createHolding(input);

    return NextResponse.json({ data: holding }, { status: 201 });
  } catch (error) {
    return portfolioErrorResponse(error);
  }
}
