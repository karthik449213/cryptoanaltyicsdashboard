import { NextRequest, NextResponse } from "next/server";
import { marketDataService } from "@/lib/market/market-data.service";
import { errorResponse, parseHistoryDays, parseIds, parseVsCurrency } from "@/lib/market/http";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const ids = parseIds(searchParams.get("ids"));
    const days = parseHistoryDays(searchParams.get("days"));
    const vsCurrency = parseVsCurrency(searchParams.get("vsCurrency"));

    const history = await marketDataService.getCoinHistory({
      ids,
      days,
      vsCurrency,
    });

    return NextResponse.json(
      {
        data: history,
        meta: {
          count: history.length,
          days,
          vsCurrency,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
