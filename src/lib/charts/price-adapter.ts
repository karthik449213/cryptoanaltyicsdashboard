import { marketDataService } from "@/lib/market/market-data.service";
import { TimeRange, PriceChartData, ChartDataPoint } from "@/types/charts";
import { HistoryWindowDays, SupportedVsCurrency } from "@/types/market-data";

const TIME_RANGE_TO_DAYS: Record<TimeRange, HistoryWindowDays> = {
  "1D": 7, // CoinGecko doesn't have 1D, so we use 7D and filter
  "7D": 7,
  "30D": 30,
  "90D": 30, // CoinGecko doesn't have 90D, so we use 30D
  "1Y": 30, // CoinGecko doesn't have 1Y, so we use 30D
  "ALL": 30, // CoinGecko doesn't have ALL, so we use 30D
};

const TIME_RANGE_TO_HOURS: Record<TimeRange, number> = {
  "1D": 24,
  "7D": 168,
  "30D": 720,
  "90D": 2160,
  "1Y": 8760,
  "ALL": 87600, // ~10 years
};

export async function getPriceChartData(
  coinId: string,
  timeRange: TimeRange,
  vsCurrency: SupportedVsCurrency = "usd"
): Promise<PriceChartData> {
  try {
    const days = TIME_RANGE_TO_DAYS[timeRange];
    const historyData = await marketDataService.getCoinHistory({
      ids: [coinId],
      vsCurrency,
      days,
    });

    if (!historyData || historyData.length === 0) {
      throw new Error(`No historical data found for ${coinId}`);
    }

    const coinHistory = historyData[0];
    const hoursLimit = TIME_RANGE_TO_HOURS[timeRange];

    // Filter data points based on time range
    const now = Date.now();
    const cutoffTime = now - (hoursLimit * 60 * 60 * 1000);

    const filteredPoints = coinHistory.points
      .filter(point => point.timestamp * 1000 >= cutoffTime)
      .map(point => ({
        timestamp: point.timestamp,
        value: point.price,
        date: new Date(point.timestamp * 1000).toISOString(),
      }));

    // Get current price and 24h change
    const currentPrice = filteredPoints[filteredPoints.length - 1]?.value ?? 0;
    const price24hAgo = filteredPoints[0]?.value ?? currentPrice;
    const priceChange24h = currentPrice - price24hAgo;
    const priceChangePct24h = price24hAgo > 0 ? (priceChange24h / price24hAgo) * 100 : 0;

    return {
      coinId,
      coinName: coinHistory.id, // This should be enhanced to get proper name
      symbol: coinHistory.id.toUpperCase(), // This should be enhanced to get proper symbol
      timeRange,
      data: filteredPoints,
      currentPrice,
      priceChange24h,
      priceChangePct24h,
    };
  } catch (error) {
    console.error(`Failed to fetch price chart data for ${coinId}:`, error);
    throw new Error(`Unable to load price chart data for ${coinId}`);
  }
}

export function formatPriceDataForChart(data: ChartDataPoint[]): Array<{
  timestamp: number;
  price: number;
  date: string;
  formattedDate: string;
}> {
  return data.map(point => ({
    timestamp: point.timestamp,
    price: point.value,
    date: point.date,
    formattedDate: new Date(point.timestamp * 1000).toLocaleDateString(),
  }));
}