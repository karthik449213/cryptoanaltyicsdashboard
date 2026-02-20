"use client";

import { ReactNode, useState } from "react";
import { TimeRange } from "@/types/charts";
import { TimeRangeSelector } from "./time-range-selector";

type ChartWrapperProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
};

export function ChartWrapper({
  title,
  subtitle,
  children,
  timeRange,
  onTimeRangeChange,
  isLoading = false,
  error = null,
  className = "",
}: ChartWrapperProps) {
  const [internalTimeRange, setInternalTimeRange] = useState<TimeRange>("7D");

  const currentTimeRange = timeRange ?? internalTimeRange;
  const handleTimeRangeChange = onTimeRangeChange ?? setInternalTimeRange;

  return (
    <div className={`rounded-xl border border-slate-700/40 bg-panel/70 p-6 backdrop-blur-xl ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        {onTimeRangeChange && (
          <TimeRangeSelector
            selectedRange={currentTimeRange}
            onRangeChange={handleTimeRangeChange}
            disabled={isLoading}
          />
        )}
      </div>

      {error && (
        <div className="flex items-center justify-center h-80 rounded-lg border border-red-500/20 bg-red-500/5">
          <div className="text-center">
            <p className="text-red-400 font-medium">Error loading chart</p>
            <p className="text-red-300/70 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {!error && children}
    </div>
  );
}