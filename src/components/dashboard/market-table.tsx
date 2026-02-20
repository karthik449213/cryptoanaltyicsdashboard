import Image from "next/image";
import { pct, usd } from "@/lib/format";
import { CoinMarket } from "@/types/market";

type MarketTableProps = {
  markets: CoinMarket[];
};

export function MarketTable({ markets }: MarketTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-700/40 text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="px-3 py-2">Asset</th>
            <th className="px-3 py-2">Price</th>
            <th className="px-3 py-2">24h</th>
            <th className="px-3 py-2">Volume</th>
            <th className="px-3 py-2">Mkt Cap</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {markets.map((coin) => {
            const positive = coin.price_change_percentage_24h >= 0;
            return (
              <tr key={coin.id} className="text-slate-200">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Image src={coin.image} alt={coin.name} width={20} height={20} />
                    <div>
                      <p className="font-medium">{coin.name}</p>
                      <p className="text-xs uppercase text-slate-500">{coin.symbol}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">{usd(coin.current_price)}</td>
                <td className={`px-3 py-3 ${positive ? "text-emerald-400" : "text-rose-400"}`}>
                  {pct(coin.price_change_percentage_24h)}
                </td>
                <td className="px-3 py-3">{usd(coin.total_volume)}</td>
                <td className="px-3 py-3">{usd(coin.market_cap)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
