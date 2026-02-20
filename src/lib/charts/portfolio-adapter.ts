import { fetchPortfolioSummary } from "@/lib/portfolio/portfolio-api.client";
import { marketDataService } from "@/lib/market/market-data.service";
import { TimeRange, PortfolioGrowthData, ChartDataPoint } from "@/types/charts";
import { HistoryWindowDays, SupportedVsCurrency } from "@/types/market-data";

const TIME_RANGE_TO_DAYS: Record<TimeRange, HistoryWindowDays> = {
  "1D": 7,
  "7D": 7,
  "30D": 30,
  "90D": 30,
  "1Y": 30,
  "ALL": 30,
};

const TIME_RANGE_TO_HOURS: Record<TimeRange, number> = {
  "1D": 24,
  "7D": 168,
  "30D": 720,
  "90D": 2160,
  "1Y": 8760,
  "ALL": 87600,
};

export async function getPortfolioGrowthData(
  timeRange: TimeRange,
  vsCurrency: SupportedVsCurrency = "usd"
): Promise<PortfolioGrowthData> {
  try {
    // Get current portfolio summary
    const summary = await fetchPortfolioSummary();

    if (!summary || summary.positions.length === 0) {
      return {
        timeRange,
        data: [],
        totalValue: 0,
        totalChange24h: 0,
        totalChangePct24h: 0,
      };
    }

    const days = TIME_RANGE_TO_DAYS[timeRange];
    const hoursLimit = TIME_RANGE_TO_HOURS[timeRange];

    // Get unique coin IDs from portfolio
    const coinIds = [...new Set(summary.positions.map(p => p.coinId))];

    // Fetch historical data for all coins in portfolio
    const historicalData = await marketDataService.getCoinHistory({
      ids: coinIds,
      vsCurrency,
      days,
    });

    if (!historicalData || historicalData.length === 0) {
      throw new Error("No historical data found for portfolio coins");
    }

    // Create a map of coin ID to historical prices
    const priceHistoryMap = new Map<string, Array<{ timestamp: number; price: number }>>();
    historicalData.forEach(coinData => {
      priceHistoryMap.set(coinData.id, coinData.points);
    });

    // Calculate portfolio value at each historical point
    const portfolioValueOverTime: ChartDataPoint[] = [];
    const now = Date.now();
    const cutoffTime = now - (hoursLimit * 60 * 60 * 1000);

    // Get all unique timestamps from all coins
    const allTimestamps = new Set<number>();
    historicalData.forEach(coinData => {
      coinData.points.forEach(point => {
        if (point.timestamp * 1000 >= cutoffTime) {
          allTimestamps.add(point.timestamp);
        }
      });
    });

    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

    // Calculate portfolio value at each timestamp
    sortedTimestamps.forEach(timestamp => {
      let totalValue = 0;

      summary.positions.forEach(position => {
        const coinHistory = priceHistoryMap.get(position.coinId);
        if (coinHistory) {
          // Find the closest price point for this timestamp
          const pricePoint = coinHistory.find(p => p.timestamp === timestamp) ||
                           coinHistory.reduce((prev, curr) =>
                             Math.abs(curr.timestamp - timestamp) < Math.abs(prev.timestamp - timestamp) ? curr : prev
                           );

          if (pricePoint) {
            totalValue += position.quantity * pricePoint.price;
          }
        }
      });

      if (totalValue > 0) {
        portfolioValueOverTime.push({
          timestamp,
          value: totalValue,
          date: new Date(timestamp * 1000).toISOString(),
        });
      }
    });

    // Calculate 24h change
    const currentValue = summary.totalCurrentValue;
    const previousValue = portfolioValueOverTime.length > 1 ?
      portfolioValueOverTime[portfolioValueOverTime.length - 2]?.value ?? currentValue :
      currentValue;

    const totalChange24h = currentValue - previousValue;
    const totalChangePct24h = previousValue > 0 ? (totalChange24h / previousValue) * 100 : 0;

    return {
      timeRange,
      data: portfolioValueOverTime,
      totalValue: currentValue,
      totalChange24h,
      totalChangePct24h,
    };
  } catch (error) {
    console.error("Failed to fetch portfolio growth data:", error);
    throw new Error("Unable to load portfolio growth data");
  }
}

export function formatPortfolioDataForChart(data: ChartDataPoint[]): Array<{
  timestamp: number;
  value: number;
  date: string;
  formattedDate: string;
}> {
  return data.map(point => ({
    timestamp: point.timestamp,
    value: point.value,
    date: point.date,
    formattedDate: new Date(point.timestamp * 1000).toLocaleDateString(),
  }));
}