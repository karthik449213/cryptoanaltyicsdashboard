"use client";

import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gradient-to-r from-slate-700/50 via-slate-600/50 to-slate-700/50 bg-[length:200%_100%]",
        className,
      )}
      style={{
        animation: "shimmer 1.5s ease-in-out infinite",
      }}
    />
  );
}

export function KPICardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-700/40 bg-panel/80 p-6 backdrop-blur-xl">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-slate-700/40 bg-panel/80 p-6 backdrop-blur-xl">
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="rounded-xl border border-slate-700/40 bg-panel/80 p-6 backdrop-blur-xl">
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeatmapSkeleton() {
  return (
    <div className="rounded-xl border border-slate-700/40 bg-panel/80 p-6 backdrop-blur-xl">
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {Array.from({ length: 5 }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-16 flex-1 rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}