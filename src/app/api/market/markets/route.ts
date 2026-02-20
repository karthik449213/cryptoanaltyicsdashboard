import { NextRequest, NextResponse } from "next/server";
import { marketDataService } from "@/lib/market/market-data.service";
import { errorResponse, parsePositiveInt, parseVsCurrency } from "@/lib/market/http";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const vsCurrency = parseVsCurrency(searchParams.get("vsCurrency"));
    const page = parsePositiveInt(searchParams.get("page"), "page", 1, 100);
    const perPage = parsePositiveInt(searchParams.get("perPage"), "perPage", 20, 250);

    const markets = await marketDataService.getTopMarkets(vsCurrency, page, perPage);

    return NextResponse.json(
      {
        data: markets,
        meta: {
          count: markets.length,
          page,
          perPage,
          vsCurrency,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=180",
        },
      },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
