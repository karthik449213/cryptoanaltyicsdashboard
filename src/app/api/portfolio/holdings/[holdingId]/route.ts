import { NextRequest, NextResponse } from "next/server";
import { portfolioRepository } from "@/lib/portfolio/repository";
import { parseHoldingId, portfolioErrorResponse } from "@/lib/portfolio/http";
import { validateUpdateHolding } from "@/lib/portfolio/validation";

type RouteContext = {
  params: Promise<{
    holdingId: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { holdingId: rawHoldingId } = await context.params;
    const holdingId = parseHoldingId(rawHoldingId);
    const payload = await request.json();
    const input = validateUpdateHolding(payload);

    const updated = await portfolioRepository.updateHolding(holdingId, input);
    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error) {
    return portfolioErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { holdingId: rawHoldingId } = await context.params;
    const holdingId = parseHoldingId(rawHoldingId);

    await portfolioRepository.deleteHolding(holdingId);
    return NextResponse.json({ data: { deleted: true } }, { status: 200 });
  } catch (error) {
    return portfolioErrorResponse(error);
  }
}
