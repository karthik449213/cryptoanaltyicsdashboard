import { NextRequest, NextResponse } from "next/server";
import { marketDataService } from "@/lib/market/market-data.service";
import { errorResponse, parseIds, parseVsCurrency } from "@/lib/market/http";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const ids = parseIds(searchParams.get("ids"));
    const vsCurrency = parseVsCurrency(searchParams.get("vsCurrency"));

    const prices = await marketDataService.getLivePrices({ ids, vsCurrency });

    return NextResponse.json(
      {
        data: prices,
        meta: {
          count: prices.length,
          vsCurrency,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
