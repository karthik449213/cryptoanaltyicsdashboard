import { fetchPortfolioSummary } from "@/lib/portfolio/portfolio-api.client";
import { AllocationChartData, AllocationDataPoint } from "@/types/charts";

// Color palette for allocation chart
const ALLOCATION_COLORS = [
  "#22D3EE", // cyan
  "#A78BFA", // purple
  "#34D399", // emerald
  "#FBBF24", // amber
  "#F87171", // red
  "#60A5FA", // blue
  "#FB7185", // rose
  "#84CC16", // lime
  "#C084FC", // violet
  "#2DD4BF", // teal
];

export async function getAllocationChartData(): Promise<AllocationChartData> {
  try {
    const summary = await fetchPortfolioSummary();

    if (!summary || summary.positions.length === 0) {
      return {
        totalValue: 0,
        allocations: [],
      };
    }

    // Sort positions by current value (descending)
    const sortedPositions = summary.positions
      .sort((a, b) => b.currentValue - a.currentValue);

    // Create allocation data points
    const allocations: AllocationDataPoint[] = sortedPositions.map((position, index) => {
      const percentage = summary.totalCurrentValue > 0 ?
        (position.currentValue / summary.totalCurrentValue) * 100 : 0;

      return {
        coinId: position.coinId,
        symbol: position.symbol.toUpperCase(),
        name: position.coinId, // This should be enhanced to get proper name
        value: position.currentValue,
        percentage,
        color: ALLOCATION_COLORS[index % ALLOCATION_COLORS.length],
      };
    });

    return {
      totalValue: summary.totalCurrentValue,
      allocations,
    };
  } catch (error) {
    console.error("Failed to fetch allocation chart data:", error);
    throw new Error("Unable to load portfolio allocation data");
  }
}

export function formatAllocationDataForChart(allocations: AllocationDataPoint[]): Array<{
  name: string;
  value: number;
  percentage: number;
  color: string;
  symbol: string;
}> {
  return allocations.map(allocation => ({
    name: `${allocation.symbol} (${allocation.percentage.toFixed(1)}%)`,
    value: allocation.value,
    percentage: allocation.percentage,
    color: allocation.color,
    symbol: allocation.symbol,
  }));
}