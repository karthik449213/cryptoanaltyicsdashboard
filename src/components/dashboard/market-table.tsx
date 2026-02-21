"use client";

import Image from "next/image";
import { useState } from "react";
import { pct, usd } from "@/lib/format";
import { CoinMarket } from "@/types/market";
import { cn } from "@/lib/utils";

type MarketTableProps = {
  markets: CoinMarket[];
};

export function MarketTable({ markets }: MarketTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-700/40 text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Asset</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">24h Change</th>
            <th className="px-4 py-3 font-medium">24h Volume</th>
            <th className="px-4 py-3 font-medium">Market Cap</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {markets.map((coin, index) => {
            const positive = coin.price_change_percentage_24h >= 0;
            const isHovered = hoveredRow === coin.id;

            return (
              <tr
                key={coin.id}
                className={cn(
                  "group cursor-pointer transition-all duration-200 hover:bg-slate-800/30",
                  isHovered && "bg-slate-800/20 shadow-inner",
                )}
                onMouseEnter={() => setHoveredRow(coin.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-4 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700/50 text-xs font-medium text-slate-400 group-hover:bg-slate-600/50 group-hover:text-slate-300 transition-colors">
                    {index + 1}
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Image
                        src={coin.image}
                        alt={coin.name}
                        width={32}
                        height={32}
                        className={cn(
                          "rounded-full transition-transform duration-200",
                          isHovered && "scale-110",
                        )}
                      />
                      {isHovered && (
                        <div className="absolute -inset-1 rounded-full border border-neon-cyan/30 animate-pulse-glow"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                        {coin.name}
                      </p>
                      <p className="text-xs uppercase text-slate-500 group-hover:text-slate-400 transition-colors">
                        {coin.symbol}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <p className="font-mono font-medium text-slate-200 group-hover:text-white transition-colors">
                    {usd(coin.current_price)}
                  </p>
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-all duration-200",
                        positive
                          ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20",
                      )}
                    >
                      <span className="transition-transform group-hover:scale-110">
                        {positive ? "↗" : "↘"}
                      </span>
                      <span>{pct(Math.abs(coin.price_change_percentage_24h))}</span>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <p className="font-mono text-slate-300 group-hover:text-slate-200 transition-colors">
                    {usd(coin.total_volume)}
                  </p>
                </td>

                <td className="px-4 py-4">
                  <p className="font-mono font-medium text-slate-200 group-hover:text-white transition-colors">
                    {usd(coin.market_cap)}
                  </p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
