"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

type HeatmapData = {
  symbol: string;
  name: string;
  value: number;
  change: number;
};

type MarketHeatmapProps = {
  data: HeatmapData[];
  className?: string;
  title?: string;
  subtitle?: string;
};

export function MarketHeatmap({ data, className, title, subtitle }: MarketHeatmapProps) {
  const { minChange, maxChange, gridData } = useMemo(() => {
    if (!data.length) return { minChange: 0, maxChange: 0, gridData: [] };

    const changes = data.map((item) => item.change);
    const minChange = Math.min(...changes);
    const maxChange = Math.max(...changes);

    // Create a 5x4 grid (20 items max for top 20)
    const gridSize = Math.min(data.length, 20);
    const cols = 5;
    const rows = Math.ceil(gridSize / cols);

    const gridData = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        const index = i * cols + j;
        if (index < gridSize) {
          row.push(data[index]);
        } else {
          row.push(null);
        }
      }
      gridData.push(row);
    }

    return { minChange, maxChange, gridData };
  }, [data]);

  const getHeatmapColor = (change: number) => {
    if (change === 0) return "bg-slate-700/60";

    const intensity = Math.abs(change) / Math.max(Math.abs(minChange), Math.abs(maxChange));
    const alpha = Math.max(0.3, Math.min(1, intensity * 0.8));

    if (change > 0) {
      // Green gradient for positive changes
      return `rgba(16, 185, 129, ${alpha})`;
    } else {
      // Red gradient for negative changes
      return `rgba(239, 68, 68, ${alpha})`;
    }
  };

  const getTextColor = (change: number) => {
    return change >= 0 ? "text-emerald-100" : "text-rose-100";
  };

  return (
    <section
      className={cn(
        "rounded-xl border border-slate-700/40 bg-panel/80 p-6 backdrop-blur-xl",
        className,
      )}
    >
      {(title || subtitle) && (
        <header className="mb-6">
          {title && <h3 className="text-lg font-semibold text-slate-100">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </header>
      )}

      <div className="space-y-2">
        {gridData.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2">
            {row.map((item, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  "group relative flex h-16 w-full flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border border-slate-600/30 p-2 text-center transition-all duration-200 hover:scale-105 hover:shadow-lg",
                  item ? "hover:border-slate-500/50" : "bg-slate-800/30",
                )}
                style={{
                  backgroundColor: item ? getHeatmapColor(item.change) : undefined,
                }}
              >
                {item ? (
                  <>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-white">
                      {item.symbol.toUpperCase()}
                    </div>
                    <div
                      className={cn(
                        "text-xs font-medium transition-colors",
                        getTextColor(item.change),
                      )}
                    >
                      {item.change >= 0 ? "+" : ""}
                      {item.change.toFixed(1)}%
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 left-1/2 z-20 -translate-x-1/2 transform rounded-lg bg-slate-900/95 px-3 py-2 text-xs text-slate-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      <div className="font-medium">{item.name}</div>
                      <div className={cn("text-xs", getTextColor(item.change))}>
                        {item.change >= 0 ? "+" : ""}
                        {item.change.toFixed(2)}%
                      </div>
                      <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 transform rotate-45 bg-slate-900/95"></div>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-600">-</div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-rose-500/60"></div>
          <span>Declining</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-slate-600"></div>
          <span>Neutral</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-emerald-500/60"></div>
          <span>Gaining</span>
        </div>
      </div>
    </section>
  );
}