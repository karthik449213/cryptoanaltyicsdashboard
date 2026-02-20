export type SupportedVsCurrency = "usd" | "eur" | "gbp";

export type HistoryWindowDays = 7 | 30;

export type LivePricePoint = {
  id: string;
  vsCurrency: SupportedVsCurrency;
  price: number;
  marketCap: number;
  change24h: number;
  updatedAtUnix: number;
};

export type CoinHistoryPoint = {
  timestamp: number;
  price: number;
  marketCap: number;
};

export type CoinHistorySeries = {
  id: string;
  vsCurrency: SupportedVsCurrency;
  days: HistoryWindowDays;
  points: CoinHistoryPoint[];
};

export type CoinMarketsQuery = {
  vsCurrency: SupportedVsCurrency;
  page: number;
  perPage: number;
};

export type LivePriceQuery = {
  ids: string[];
  vsCurrency: SupportedVsCurrency;
};

export type HistoryQuery = {
  ids: string[];
  vsCurrency: SupportedVsCurrency;
  days: HistoryWindowDays;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: string;
  };
};
