export type TimeRange = "1D" | "7D" | "30D" | "90D" | "1Y" | "ALL";

export type ChartDataPoint = {
  timestamp: number;
  value: number;
  date: string;
};

export type PriceChartData = {
  coinId: string;
  coinName: string;
  symbol: string;
  timeRange: TimeRange;
  data: ChartDataPoint[];
  currentPrice: number;
  priceChange24h: number;
  priceChangePct24h: number;
};

export type PortfolioGrowthData = {
  timeRange: TimeRange;
  data: ChartDataPoint[];
  totalValue: number;
  totalChange24h: number;
  totalChangePct24h: number;
};

export type AllocationDataPoint = {
  coinId: string;
  symbol: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
};

export type AllocationChartData = {
  totalValue: number;
  allocations: AllocationDataPoint[];
};

export type ChartAnimationConfig = {
  duration: number;
  easing: string;
  delay: number;
};

export type ChartTooltipData = {
  label: string;
  value: number;
  formattedValue: string;
  color?: string;
  additionalInfo?: Record<string, string | number>;
};