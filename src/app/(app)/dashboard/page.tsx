import { LogoutButton } from "@/components/auth/logout-button";
import { MarketChart } from "@/components/dashboard/market-chart";
import { MarketTable } from "@/components/dashboard/market-table";
import { GlassCard } from "@/components/ui/glass-card";
import { buildMarketSummary, getTopMarkets } from "@/lib/coingecko";
import { getCurrentUser } from "@/lib/auth/service";
import { compact, pct, usd } from "@/lib/format";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const markets = await getTopMarkets();
  const summary = buildMarketSummary(markets);
  const avg24h =
    markets.reduce((sum, coin) => sum + coin.price_change_percentage_24h, 0) /
    markets.length;

  const chartData = markets.slice(0, 10).map((coin) => ({
    name: coin.symbol.toUpperCase(),
    marketCap: coin.market_cap,
  }));

  return (
    <div className="space-y-4 md:space-y-6">
      <section className="flex flex-col gap-3 rounded-xl border border-slate-700/40 bg-panel/70 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Signed in as</p>
          <p className="text-sm font-medium text-slate-100">{user?.email}</p>
        </div>
        <LogoutButton />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassCard title="Total Market Cap" subtitle="Top 20 assets by market cap">
          <p className="text-2xl font-semibold text-slate-100">{usd(summary.totalMarketCap)}</p>
          <p className="mt-2 text-xs text-slate-400">Tracked from live CoinGecko market stream</p>
        </GlassCard>
        <GlassCard title="24h Volume" subtitle="Aggregate spot volume">
          <p className="text-2xl font-semibold text-slate-100">{usd(summary.totalVolume)}</p>
          <p className="mt-2 text-xs text-slate-400">Liquidity pulse across top assets</p>
        </GlassCard>
        <GlassCard title="BTC Dominance" subtitle="Top-20 dominance proxy">
          <p className="text-2xl font-semibold text-neon-cyan">{pct(summary.btcDominanceProxy)}</p>
          <p className="mt-2 text-xs text-slate-400">Computed from currently loaded basket</p>
        </GlassCard>
        <GlassCard title="Market Breadth" subtitle="Average 24h change">
          <p className={`text-2xl font-semibold ${avg24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {pct(avg24h)}
          </p>
          <p className="mt-2 text-xs text-slate-400">Momentum across tracked assets</p>
        </GlassCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <GlassCard
          className="xl:col-span-2"
          title="Market Capitalization Curve"
          subtitle="Top 10 assets ordered by market cap"
        >
          <MarketChart data={chartData} />
        </GlassCard>
        <GlassCard title="Terminal Snapshot" subtitle="Operational watchlist metrics">
          <div className="space-y-4 text-sm">
            <div className="rounded-lg border border-slate-700/40 bg-slate-900/40 p-3">
              <p className="text-slate-400">Top Asset</p>
              <p className="mt-1 text-lg font-semibold text-slate-100">{markets[0]?.name ?? "N/A"}</p>
              <p className="text-slate-500">{markets[0]?.symbol.toUpperCase() ?? "-"}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-700/40 bg-slate-900/40 p-3">
                <p className="text-slate-400">Assets</p>
                <p className="mt-1 text-base font-semibold">{compact(markets.length)}</p>
              </div>
              <div className="rounded-lg border border-slate-700/40 bg-slate-900/40 p-3">
                <p className="text-slate-400">Leaders +24h</p>
                <p className="mt-1 text-base font-semibold text-emerald-400">
                  {markets.filter((coin) => coin.price_change_percentage_24h >= 0).length}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      <GlassCard title="Market Tape" subtitle="Live top 20 assets">
        <MarketTable markets={markets} />
      </GlassCard>
    </div>
  );
}
