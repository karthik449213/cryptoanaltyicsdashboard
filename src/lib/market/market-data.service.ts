import { coingeckoFetch } from "@/lib/market/coingecko-client";
import { CoinGeckoValidationError } from "@/lib/market/errors";
import { CoinMarket } from "@/types/market";
import {
  CoinHistorySeries,
  HistoryQuery,
  LivePricePoint,
  LivePriceQuery,
  SupportedVsCurrency,
} from "@/types/market-data";

type CacheRecord<T> = {
  expiresAt: number;
  value: T;
};

const memoryCache = new Map<string, CacheRecord<unknown>>();

function now() {
  return Date.now();
}

function cacheGet<T>(key: string): T | null {
  const cached = memoryCache.get(key);
  if (!cached) {
    return null;
  }

  if (cached.expiresAt < now()) {
    memoryCache.delete(key);
    return null;
  }

  return cached.value as T;
}

function cacheSet<T>(key: string, value: T, ttlMs: number) {
  memoryCache.set(key, {
    expiresAt: now() + ttlMs,
    value,
  });
}

function normalizeIds(ids: string[]) {
  const normalized = Array.from(new Set(ids.map((id) => id.trim().toLowerCase()).filter(Boolean)));

  if (!normalized.length) {
    throw new CoinGeckoValidationError("At least one coin id is required.");
  }

  return normalized;
}

function validateHistoryDays(days: number): 7 | 30 {
  if (days !== 7 && days !== 30) {
    throw new CoinGeckoValidationError("History days must be 7 or 30.");
  }

  return days;
}

function cacheKey(namespace: string, fields: string[]) {
  return `${namespace}:${fields.join(":")}`;
}

type SimplePriceResponse = Record<
  string,
  {
    usd?: number;
    eur?: number;
    gbp?: number;
    usd_market_cap?: number;
    eur_market_cap?: number;
    gbp_market_cap?: number;
    usd_24h_change?: number;
    eur_24h_change?: number;
    gbp_24h_change?: number;
    last_updated_at?: number;
  }
>;

type MarketChartResponse = {
  prices: [number, number][];
  market_caps: [number, number][];
};

const PRICE_CACHE_TTL_MS = 30_000;
const HISTORY_CACHE_TTL_MS = 300_000;
const MARKETS_CACHE_TTL_MS = 60_000;

export class MarketDataService {
  async getLivePrices(query: LivePriceQuery): Promise<LivePricePoint[]> {
    const ids = normalizeIds(query.ids);
    const vsCurrency = query.vsCurrency;
    const key = cacheKey("prices", [ids.join(","), vsCurrency]);

    const cached = cacheGet<LivePricePoint[]>(key);
    if (cached) {
      return cached;
    }

    const endpoint = `/simple/price?ids=${ids.join(",")}&vs_currencies=${vsCurrency}&include_market_cap=true&include_24hr_change=true&include_last_updated_at=true`;
    const data = await coingeckoFetch<SimplePriceResponse>(endpoint, {
      revalidateSeconds: 30,
    });

    const points = ids
      .map((id) => {
        const row = data[id];
        if (!row) {
          return null;
        }

        const price = row[vsCurrency as keyof typeof row];
        const marketCap = row[`${vsCurrency}_market_cap` as keyof typeof row];
        const change24h = row[`${vsCurrency}_24h_change` as keyof typeof row];

        if (typeof price !== "number" || typeof marketCap !== "number" || typeof change24h !== "number") {
          return null;
        }

        return {
          id,
          vsCurrency,
          price,
          marketCap,
          change24h,
          updatedAtUnix: row.last_updated_at ?? 0,
        } satisfies LivePricePoint;
      })
      .filter((value): value is LivePricePoint => Boolean(value));

    cacheSet(key, points, PRICE_CACHE_TTL_MS);
    return points;
  }

  async getCoinHistory(query: HistoryQuery): Promise<CoinHistorySeries[]> {
    const ids = normalizeIds(query.ids);
    const days = validateHistoryDays(query.days);
    const vsCurrency = query.vsCurrency;

    const series = await Promise.all(
      ids.map(async (id) => {
        const key = cacheKey("history", [id, String(days), vsCurrency]);
        const cached = cacheGet<CoinHistorySeries>(key);
        if (cached) {
          return cached;
        }

        const endpoint = `/coins/${id}/market_chart?vs_currency=${vsCurrency}&days=${days}`;
        const data = await coingeckoFetch<MarketChartResponse>(endpoint, {
          revalidateSeconds: days === 7 ? 120 : 300,
        });

        const points = data.prices.map(([timestamp, price], index) => ({
          timestamp,
          price,
          marketCap: data.market_caps[index]?.[1] ?? 0,
        }));

        const result: CoinHistorySeries = {
          id,
          days,
          vsCurrency,
          points,
        };

        cacheSet(key, result, HISTORY_CACHE_TTL_MS);
        return result;
      }),
    );

    return series;
  }

  async getTopMarkets(vsCurrency: SupportedVsCurrency, page = 1, perPage = 20): Promise<CoinMarket[]> {
    const key = cacheKey("markets", [vsCurrency, String(page), String(perPage)]);
    const cached = cacheGet<CoinMarket[]>(key);
    if (cached) {
      return cached;
    }

    const endpoint = `/coins/markets?vs_currency=${vsCurrency}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=24h`;
    const data = await coingeckoFetch<CoinMarket[]>(endpoint, {
      revalidateSeconds: 60,
    });

    cacheSet(key, data, MARKETS_CACHE_TTL_MS);
    return data;
  }
}

export const marketDataService = new MarketDataService();
