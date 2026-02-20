"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { usd, pct } from "@/lib/format";

type AllocationChartProps = {
  data: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
    symbol: string;
  }>;
  isLoading?: boolean;
};

export function AllocationChart({ data, isLoading = false }: AllocationChartProps) {
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
        <p className="text-slate-400">No allocation data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-slate-700/40 bg-slate-900/95 p-3 shadow-xl backdrop-blur-xl">
          <p className="text-sm font-medium text-slate-100">{data.symbol}</p>
          <p className="text-lg font-semibold text-slate-100">
            {usd(data.value)}
          </p>
          <p className="text-sm text-slate-300">
            {pct(data.percentage)}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-slate-300">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
            animationDuration={1500}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}