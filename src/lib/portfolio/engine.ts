import { marketDataService } from "@/lib/market/market-data.service";
import { Holding, HoldingWithMetrics, PortfolioSummary } from "@/types/portfolio";

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export async function calculatePortfolioSummary(holdings: Holding[]): Promise<PortfolioSummary> {
  if (!holdings.length) {
    return {
      totalCostBasis: 0,
      totalCurrentValue: 0,
      totalProfitLoss: 0,
      totalProfitLossPct: 0,
      holdingsCount: 0,
      assetsCount: 0,
      positions: [],
    };
  }

  const coinIds = Array.from(new Set(holdings.map((holding) => holding.coinId)));
  const livePrices = await marketDataService.getLivePrices({ ids: coinIds, vsCurrency: "usd" });

  const priceMap = new Map(livePrices.map((point) => [point.id, point.price]));

  const positions: HoldingWithMetrics[] = holdings.map((holding) => {
    const currentPrice = priceMap.get(holding.coinId) ?? 0;
    const costBasis = holding.quantity * holding.buyPrice;
    const currentValue = holding.quantity * currentPrice;
    const profitLoss = currentValue - costBasis;
    const profitLossPct = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;

    return {
      ...holding,
      currentPrice: round(currentPrice),
      costBasis: round(costBasis),
      currentValue: round(currentValue),
      profitLoss: round(profitLoss),
      profitLossPct: round(profitLossPct),
    };
  });

  const totalCostBasis = positions.reduce((sum, position) => sum + position.costBasis, 0);
  const totalCurrentValue = positions.reduce((sum, position) => sum + position.currentValue, 0);
  const totalProfitLoss = totalCurrentValue - totalCostBasis;
  const totalProfitLossPct = totalCostBasis > 0 ? (totalProfitLoss / totalCostBasis) * 100 : 0;

  return {
    totalCostBasis: round(totalCostBasis),
    totalCurrentValue: round(totalCurrentValue),
    totalProfitLoss: round(totalProfitLoss),
    totalProfitLossPct: round(totalProfitLossPct),
    holdingsCount: positions.length,
    assetsCount: coinIds.length,
    positions,
  };
}
