"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { compact } from "@/lib/format";

type ChartPoint = {
  name: string;
  marketCap: number;
};

type MarketChartProps = {
  data: ChartPoint[];
};

export function MarketChart({ data }: MarketChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-72 w-full animate-pulse rounded-lg bg-slate-900/40" />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
          <XAxis
            dataKey="name"
            stroke="#94A3B8"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            stroke="#94A3B8"
            tickLine={false}
            axisLine={false}
            tickFormatter={compact}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(17,24,39,0.95)",
              border: "1px solid rgba(34,211,238,0.35)",
              borderRadius: "0.75rem",
              color: "#E5E7EB",
            }}
            formatter={(value: number | string | undefined) => {
              const numericValue = typeof value === "number" ? value : Number(value ?? 0);
              return compact(numericValue);
            }}
          />
          <Line
            type="monotone"
            dataKey="marketCap"
            stroke="#22D3EE"
            strokeWidth={2}
            dot={{ r: 2, strokeWidth: 0, fill: "#A78BFA" }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
