"use client";

import { TimeRange } from "@/types/charts";
import { clsx } from "clsx";

type TimeRangeSelectorProps = {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  disabled?: boolean;
};

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "1D", label: "1D" },
  { value: "7D", label: "7D" },
  { value: "30D", label: "30D" },
  { value: "90D", label: "90D" },
  { value: "1Y", label: "1Y" },
  { value: "ALL", label: "ALL" },
];

export function TimeRangeSelector({
  selectedRange,
  onRangeChange,
  disabled = false
}: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-700/40 bg-slate-900/40 p-1 backdrop-blur-xl">
      {TIME_RANGES.map((range) => (
        <button
          key={range.value}
          onClick={() => onRangeChange(range.value)}
          disabled={disabled}
          className={clsx(
            "px-3 py-1 text-xs font-medium rounded-md transition-all duration-200",
            selectedRange === range.value
              ? "bg-neon-cyan text-slate-900 shadow-lg"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}