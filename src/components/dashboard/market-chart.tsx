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
  const [animatedData, setAnimatedData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    setMounted(true);

    // Animate data points with staggered delay
    if (data.length > 0) {
      const timer = setTimeout(() => {
        setAnimatedData(data);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (!mounted) {
    return (
      <div className="h-72 w-full animate-pulse rounded-lg bg-gradient-to-r from-slate-800/60 to-slate-700/60" />
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-neon-cyan/30 bg-slate-900/95 p-4 backdrop-blur-xl shadow-neon">
          <p className="text-sm font-medium text-slate-200">{label}</p>
          <p className="text-lg font-bold text-neon-cyan">
            ${compact(payload[0].value)}
          </p>
          <div className="mt-2 h-0.5 w-full bg-gradient-to-r from-neon-cyan to-neon-purple"></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={animatedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="marketCapGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.1} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid
            strokeDasharray="2 4"
            stroke="rgba(148,163,184,0.1)"
            strokeOpacity={0.5}
          />

          <XAxis
            dataKey="name"
            stroke="#64748B"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#64748B" }}
            interval="preserveStartEnd"
          />

          <YAxis
            stroke="#64748B"
            tickLine={false}
            axisLine={false}
            tickFormatter={compact}
            tick={{ fontSize: 11, fill: "#64748B" }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Line
            type="monotone"
            dataKey="marketCap"
            stroke="url(#marketCapGradient)"
            strokeWidth={3}
            dot={false}
            activeDot={{
              r: 6,
              stroke: "#22D3EE",
              strokeWidth: 2,
              fill: "#0B0F14",
              filter: "url(#glow)",
            }}
            animationDuration={1500}
            animationEasing="ease-out"
          />

          {/* Secondary line for depth effect */}
          <Line
            type="monotone"
            dataKey="marketCap"
            stroke="#22D3EE"
            strokeWidth={1}
            strokeOpacity={0.3}
            dot={false}
            activeDot={false}
            animationDuration={1500}
            animationEasing="ease-out"
            animationBegin={200}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
