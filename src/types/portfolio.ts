export type HoldingRecord = {
  id: string;
  user_id: string;
  coin_id: string;
  symbol: string;
  quantity: string;
  buy_price: string;
  buy_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Holding = {
  id: string;
  userId: string;
  coinId: string;
  symbol: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateHoldingInput = {
  coinId: string;
  symbol: string;
  quantity: number;
  buyPrice: number;
  buyDate?: string;
  notes?: string;
};

export type UpdateHoldingInput = {
  coinId?: string;
  symbol?: string;
  quantity?: number;
  buyPrice?: number;
  buyDate?: string;
  notes?: string | null;
};

export type HoldingWithMetrics = Holding & {
  currentPrice: number;
  currentValue: number;
  costBasis: number;
  profitLoss: number;
  profitLossPct: number;
};

export type PortfolioSummary = {
  totalCostBasis: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  totalProfitLossPct: number;
  holdingsCount: number;
  assetsCount: number;
  positions: HoldingWithMetrics[];
};
