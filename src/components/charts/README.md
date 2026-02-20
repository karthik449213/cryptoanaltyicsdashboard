# Crypto Analytics Charts

This directory contains reusable chart components built with Recharts for the Crypto Analytics Dashboard.

## 📁 Folder Structure

```
src/
├── components/charts/          # Chart components
│   ├── price-chart.tsx        # Individual coin price charts
│   ├── portfolio-growth-chart.tsx  # Portfolio value over time
│   ├── allocation-chart.tsx    # Portfolio asset allocation (pie chart)
│   ├── time-range-selector.tsx # Time range picker component
│   ├── chart-wrapper.tsx       # Wrapper with title, controls, loading states
│   ├── charts-example.tsx      # Example usage component
│   └── index.ts               # Component exports
├── lib/charts/                # Data adapters and utilities
│   ├── price-adapter.ts       # Price chart data transformation
│   ├── portfolio-adapter.ts   # Portfolio growth data transformation
│   ├── allocation-adapter.ts  # Allocation chart data transformation
│   └── index.ts              # Adapter exports
└── types/charts.ts           # Chart-related type definitions
```

## 🎯 Components Overview

### PriceChart
Displays historical price data for individual cryptocurrencies with area chart visualization.

**Features:**
- Interactive tooltips with formatted prices
- Time range selection (1D, 7D, 30D, 90D, 1Y, ALL)
- Smooth animations and dark theme styling
- Responsive design

**Usage:**
```tsx
import { PriceChart, ChartWrapper } from "@/components/charts";

<ChartWrapper
  title="Bitcoin Price"
  subtitle="Historical price data"
  timeRange={timeRange}
  onTimeRangeChange={setTimeRange}
>
  <PriceChart
    data={formattedPriceData}
    timeRange={timeRange}
    isLoading={loading}
  />
</ChartWrapper>
```

### PortfolioGrowthChart
Shows portfolio total value over time across all holdings.

**Features:**
- Aggregated portfolio value calculation
- Historical data from CoinGecko API
- Gradient fill with neon accent colors
- Time-based filtering

**Usage:**
```tsx
import { PortfolioGrowthChart } from "@/components/charts";

<PortfolioGrowthChart
  data={formattedPortfolioData}
  timeRange="30D"
  isLoading={false}
/>
```

### AllocationChart
Pie chart showing portfolio asset distribution by current value.

**Features:**
- Color-coded segments for each asset
- Percentage labels and tooltips
- Custom legend with asset symbols
- Interactive hover effects

**Usage:**
```tsx
import { AllocationChart } from "@/components/charts";

<AllocationChart
  data={formattedAllocationData}
  isLoading={false}
/>
```

### ChartWrapper
Provides consistent layout, loading states, and controls for all charts.

**Features:**
- Title and subtitle support
- Integrated time range selector
- Loading and error state handling
- Glassmorphism styling

### TimeRangeSelector
Standalone time range picker for custom chart implementations.

## 🔧 Data Adapters

### Price Adapter (`price-adapter.ts`)
Transforms CoinGecko historical data into chart-ready format.

```tsx
import { getPriceChartData } from "@/lib/charts";

const priceData = await getPriceChartData("bitcoin", "7D");
const chartData = formatPriceDataForChart(priceData.data);
```

### Portfolio Adapter (`portfolio-adapter.ts`)
Calculates portfolio value over time from holdings data.

```tsx
import { getPortfolioGrowthData } from "@/lib/charts";

const growthData = await getPortfolioGrowthData("30D");
const chartData = formatPortfolioDataForChart(growthData.data);
```

### Allocation Adapter (`allocation-adapter.ts`)
Processes portfolio holdings into allocation percentages.

```tsx
import { getAllocationChartData } from "@/lib/charts";

const allocationData = await getAllocationChartData();
const chartData = formatAllocationDataForChart(allocationData.allocations);
```

## 🎨 Styling & Design

All charts follow the project's dark theme:
- **Background**: `#0B0F14` with glassmorphism effects
- **Accents**: Cyan (`#22D3EE`) and purple (`#A78BFA`) neon colors
- **Text**: Slate color palette for readability
- **Borders**: Subtle `slate-700/40` opacity

## 📊 Chart Features

- **Animations**: Smooth entrance animations with easing
- **Tooltips**: Custom styled tooltips with backdrop blur
- **Responsive**: Mobile-first responsive design
- **Loading States**: Skeleton loading with pulse animation
- **Error Handling**: User-friendly error messages
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🚀 Integration Examples

### Basic Price Chart
```tsx
"use client";

import { useEffect, useState } from "react";
import { PriceChart, ChartWrapper } from "@/components/charts";
import { getPriceChartData, formatPriceDataForChart } from "@/lib/charts";

export function BitcoinPriceChart() {
  const [data, setData] = useState([]);
  const [timeRange, setTimeRange] = useState("7D");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await getPriceChartData("bitcoin", timeRange);
        setData(formatPriceDataForChart(result.data));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeRange]);

  return (
    <ChartWrapper
      title="Bitcoin Price"
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
      isLoading={loading}
    >
      <PriceChart data={data} timeRange={timeRange} isLoading={loading} />
    </ChartWrapper>
  );
}
```

### Portfolio Dashboard
```tsx
"use client";

import { useEffect, useState } from "react";
import { PortfolioGrowthChart, AllocationChart } from "@/components/charts";
import { getPortfolioGrowthData, getAllocationChartData } from "@/lib/charts";

export function PortfolioCharts() {
  const [growthData, setGrowthData] = useState([]);
  const [allocationData, setAllocationData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [growth, allocation] = await Promise.all([
        getPortfolioGrowthData("30D"),
        getAllocationChartData(),
      ]);

      setGrowthData(growth.data);
      setAllocationData(allocation.allocations);
    };

    loadData();
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PortfolioGrowthChart data={growthData} timeRange="30D" />
      <AllocationChart data={allocationData} />
    </div>
  );
}
```

## 🔄 Extending the Charts

### Adding New Chart Types
1. Create new component in `components/charts/`
2. Add corresponding adapter in `lib/charts/`
3. Update type definitions in `types/charts.ts`
4. Export from index files

### Customizing Styling
- Modify color schemes in component files
- Update gradient definitions for custom themes
- Adjust animation durations and easing functions

### Adding New Time Ranges
- Update `TimeRange` type in `types/charts.ts`
- Add mapping in adapter files
- Update `TimeRangeSelector` component

## 📈 Performance Considerations

- Charts use `ResponsiveContainer` for automatic sizing
- Data is cached via existing market service
- Components include loading states to prevent layout shift
- Animations are optimized for 60fps performance

## 🐛 Troubleshooting

**Chart not rendering:**
- Check if data is properly formatted
- Verify Recharts is installed
- Ensure component is client-side (`"use client"`)

**Data not loading:**
- Check network connectivity
- Verify API keys in environment
- Check browser console for errors

**Styling issues:**
- Ensure Tailwind classes are available
- Check for CSS conflicts
- Verify dark theme variables are loaded