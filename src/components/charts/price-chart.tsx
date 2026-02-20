"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { TimeRange } from "@/types/charts";
import { usd } from "@/lib/format";

type PriceChartProps = {
  data: Array<{
    timestamp: number;
    price: number;
    date: string;
    formattedDate: string;
  }>;
  timeRange: TimeRange;
  isLoading?: boolean;
};

export function PriceChart({ data, timeRange, isLoading = false }: PriceChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return <div className="h-80 w-full animate-pulse rounded-lg bg-slate-900/40" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-80 w-full items-center justify-center rounded-lg border border-slate-700/40 bg-slate-900/20">
        <p className="text-slate-400">No price data available</p>
      </div>
    );
  }

  const formatXAxisLabel = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    switch (timeRange) {
      case "1D":
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case "7D":
      case "30D":
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case "90D":
      case "1Y":
      case "ALL":
        return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
      default:
        return date.toLocaleDateString();
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-slate-700/40 bg-slate-900/95 p-3 shadow-xl backdrop-blur-xl">
          <p className="text-sm text-slate-300">{formatXAxisLabel(data.timestamp)}</p>
          <p className="text-lg font-semibold text-slate-100">
            {usd(data.price)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="timestamp"
            stroke="#64748B"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#64748B" }}
            tickFormatter={formatXAxisLabel}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#64748B"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#64748B" }}
            tickFormatter={(value) => usd(value)}
            domain={['dataMin * 0.95', 'dataMax * 1.05']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#22D3EE"
            strokeWidth={2}
            fill="url(#priceGradient)"
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}