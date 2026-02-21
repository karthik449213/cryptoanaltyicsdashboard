import { Suspense } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { MarketChart } from "@/components/dashboard/market-chart";
import { MarketTable } from "@/components/dashboard/market-table";
import { KPICard } from "@/components/ui/kpi-card";
import { MarketHeatmap } from "@/components/ui/market-heatmap";
import { ChartSkeleton, HeatmapSkeleton, TableSkeleton } from "@/components/ui/skeleton";
import { buildMarketSummary, getTopMarkets } from "@/lib/coingecko";
import { getCurrentUser } from "@/lib/auth/service";
import { redirect } from "next/navigation";
import { DollarSign, BarChart3, Activity, Zap } from "lucide-react";

type DashboardData = {
  markets: any[];
  summary: any;
  avg24h: number;
  chartData: any[];
  heatmapData: any[];
};

async function getDashboardData() {
  const markets = await getTopMarkets();
  const summary = buildMarketSummary(markets);
  const avg24h = markets.reduce((sum, coin) => sum + coin.price_change_percentage_24h, 0) / markets.length;

  const chartData = markets.slice(0, 10).map((coin) => ({
    name: coin.symbol.toUpperCase(),
    marketCap: coin.market_cap,
  }));

  const heatmapData = markets.slice(0, 20).map((coin) => ({
    symbol: coin.symbol,
    name: coin.name,
    value: coin.market_cap,
    change: coin.price_change_percentage_24h,
  }));

  return { markets, summary, avg24h, chartData, heatmapData };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const data = await getDashboardData();

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in-up">
      {/* Header */}
      <section className="flex flex-col gap-3 rounded-xl border border-slate-700/40 bg-panel/70 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Premium Analytics Terminal</p>
          <p className="text-sm font-medium text-slate-100">
            Welcome back, <span className="text-neon-cyan">{user?.email}</span>
          </p>
        </div>
        <LogoutButton />
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Total Market Cap"
          value={data.summary.totalMarketCap}
          subtitle="Top 20 assets"
          change={data.avg24h}
          changeLabel="24h market breadth"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KPICard
          title="24h Volume"
          value={data.summary.totalVolume}
          subtitle="Trading liquidity"
          change={data.markets.filter((coin) => coin.price_change_percentage_24h >= 0).length / data.markets.length * 100}
          changeLabel="Assets in green"
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <KPICard
          title="BTC Dominance"
          value={data.summary.btcDominanceProxy}
          subtitle="Market concentration"
          change={-2.1}
          changeLabel="vs yesterday"
          icon={<Activity className="h-5 w-5" />}
        />
        <KPICard
          title="Market Momentum"
          value={data.avg24h}
          subtitle="Average 24h change"
          change={data.avg24h >= 0 ? 1.2 : -1.2}
          changeLabel="Momentum shift"
          icon={<Zap className="h-5 w-5" />}
        />
      </section>

      {/* Charts Section */}
      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Suspense fallback={<ChartSkeleton />}>
            <div className="rounded-xl border border-slate-700/40 bg-panel/80 p-6 backdrop-blur-xl">
              <header className="mb-6">
                <h3 className="text-lg font-semibold text-slate-100">Market Capitalization Curve</h3>
                <p className="mt-1 text-sm text-slate-400">Top 10 assets by market cap with live data</p>
              </header>
              <MarketChart data={data.chartData} />
            </div>
          </Suspense>
        </div>

        <Suspense fallback={<HeatmapSkeleton />}>
          <MarketHeatmap
            data={data.heatmapData}
            title="24h Performance Heatmap"
            subtitle="Price change intensity across top assets"
          />
        </Suspense>
      </section>

      {/* Market Terminal */}
      <Suspense fallback={<TableSkeleton />}>
        <section className="rounded-xl border border-slate-700/40 bg-panel/80 p-6 backdrop-blur-xl">
          <header className="mb-6">
            <h3 className="text-lg font-semibold text-slate-100">Live Market Terminal</h3>
            <p className="mt-1 text-sm text-slate-400">Real-time pricing data from CoinGecko API</p>
          </header>
          <MarketTable markets={data.markets} />
        </section>
      </Suspense>
    </div>
  );
}