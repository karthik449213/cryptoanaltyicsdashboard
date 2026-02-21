"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type KPICardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
};

export function KPICard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  icon,
  className,
  isLoading = false,
}: KPICardProps) {
  const [animatedValue, setAnimatedValue] = useState(value);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (typeof value === "number" && !isLoading) {
      const startValue = typeof animatedValue === "number" ? animatedValue : 0;
      const endValue = value;
      const duration = 1000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (endValue - startValue) * easeOutCubic;

        setAnimatedValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setAnimatedValue(value);
    }
  }, [value, isLoading]);

  const formatValue = (val: string | number) => {
    if (typeof val === "number") {
      // Format large numbers
      if (val >= 1e12) return (val / 1e12).toFixed(2) + "T";
      if (val >= 1e9) return (val / 1e9).toFixed(2) + "B";
      if (val >= 1e6) return (val / 1e6).toFixed(2) + "M";
      if (val >= 1e3) return (val / 1e3).toFixed(2) + "K";
      return val.toLocaleString();
    }
    return val;
  };

  const getChangeColor = (change?: number) => {
    if (!change) return "text-slate-400";
    return change >= 0 ? "text-emerald-400" : "text-rose-400";
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return null;
    return change >= 0 ? "↗" : "↘";
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "group relative overflow-hidden rounded-xl border border-slate-700/40 bg-panel/80 p-6 backdrop-blur-xl transition-all duration-300 hover:border-slate-600/60 hover:bg-panel/90 hover:shadow-neon",
          className,
        )}
      >
        <div className="animate-pulse">
          <div className="mb-2 h-4 w-24 rounded bg-slate-700/50"></div>
          <div className="mb-4 h-8 w-32 rounded bg-slate-700/50"></div>
          <div className="h-3 w-20 rounded bg-slate-700/50"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-slate-700/40 bg-panel/80 p-6 backdrop-blur-xl transition-all duration-300 hover:border-slate-600/60 hover:bg-panel/90 hover:shadow-neon hover:scale-[1.02]",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle gradient overlay on hover */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-purple/5 opacity-0 transition-opacity duration-300",
          isHovered && "opacity-100",
        )}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="rounded-lg bg-slate-800/60 p-2 text-neon-cyan transition-colors group-hover:bg-slate-700/60">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-slate-300 transition-colors group-hover:text-slate-200">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-slate-500 transition-colors group-hover:text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {change !== undefined && (
            <div className={cn("flex items-center gap-1 text-sm font-medium", getChangeColor(change))}>
              <span className="transition-transform group-hover:scale-110">
                {getChangeIcon(change)}
              </span>
              <span>{Math.abs(change).toFixed(2)}%</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="text-3xl font-bold text-slate-100 transition-colors group-hover:text-white">
            {formatValue(animatedValue)}
          </p>
          {changeLabel && (
            <p className="mt-1 text-xs text-slate-500 transition-colors group-hover:text-slate-400">
              {changeLabel}
            </p>
          )}
        </div>

        {/* Animated border effect */}
        <div
          className={cn(
            "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-300",
            isHovered ? "w-full" : "w-0",
          )}
        />
      </div>
    </div>
  );
}