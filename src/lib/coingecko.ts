import { CoinMarket, MarketSummary } from "@/types/market";
import { marketDataService } from "@/lib/market/market-data.service";

export async function getTopMarkets(): Promise<CoinMarket[]> {
  return marketDataService.getTopMarkets("usd", 1, 20);
}

export function buildMarketSummary(markets: CoinMarket[]): MarketSummary {
  const totalMarketCap = markets.reduce((sum, coin) => sum + coin.market_cap, 0);
  const totalVolume = markets.reduce((sum, coin) => sum + coin.total_volume, 0);
  const bitcoin = markets.find((coin) => coin.symbol.toLowerCase() === "btc");

  return {
    totalMarketCap,
    totalVolume,
    btcDominanceProxy: bitcoin ? (bitcoin.market_cap / totalMarketCap) * 100 : 0,
  };
}
