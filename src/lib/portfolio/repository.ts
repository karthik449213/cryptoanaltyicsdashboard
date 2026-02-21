import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser, AppUser } from "@/lib/auth/service";
import { CreateHoldingInput, Holding, HoldingRecord, UpdateHoldingInput } from "@/types/portfolio";
import {
  PortfolioError,
  PortfolioNotFoundError,
  PortfolioUnauthorizedError,
} from "@/lib/portfolio/errors";

function mapHolding(record: HoldingRecord): Holding {
  return {
    id: record.id,
    userId: record.user_id,
    coinId: record.coin_id,
    symbol: record.symbol,
    quantity: Number(record.quantity),
    buyPrice: Number(record.buy_price),
    buyDate: record.buy_date,
    notes: record.notes,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new PortfolioUnauthorizedError();
  }
  return user;
}

export class PortfolioRepository {
  async listHoldings(): Promise<Holding[]> {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("portfolio_holdings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new PortfolioError(error.message, "QUERY_FAILED", 500);
    }

    return (data as HoldingRecord[]).map(mapHolding);
  }

  async createHolding(input: CreateHoldingInput): Promise<Holding> {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    const payload = {
      user_id: user.id,
      coin_id: input.coinId,
      symbol: input.symbol,
      quantity: input.quantity,
      buy_price: input.buyPrice,
      buy_date: input.buyDate,
      notes: input.notes?.trim() ? input.notes.trim() : null,
    };

    const { data, error } = await supabase
      .from("portfolio_holdings")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      throw new PortfolioError(error.message, "QUERY_FAILED", 500);
    }

    return mapHolding(data as HoldingRecord);
  }

  async updateHolding(holdingId: string, input: UpdateHoldingInput): Promise<Holding> {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    const payload: Record<string, unknown> = {};
    if (input.coinId !== undefined) payload.coin_id = input.coinId;
    if (input.symbol !== undefined) payload.symbol = input.symbol;
    if (input.quantity !== undefined) payload.quantity = input.quantity;
    if (input.buyPrice !== undefined) payload.buy_price = input.buyPrice;
    if (input.buyDate !== undefined) payload.buy_date = input.buyDate;
    if (input.notes !== undefined) payload.notes = input.notes?.trim() ? input.notes.trim() : null;

    const { data, error } = await supabase
      .from("portfolio_holdings")
      .update(payload)
      .eq("id", holdingId)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error?.code === "PGRST116") {
      throw new PortfolioNotFoundError();
    }

    if (error) {
      throw new PortfolioError(error.message, "QUERY_FAILED", 500);
    }

    return mapHolding(data as HoldingRecord);
  }

  async deleteHolding(holdingId: string): Promise<void> {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    const { error, count } = await supabase
      .from("portfolio_holdings")
      .delete({ count: "exact" })
      .eq("id", holdingId)
      .eq("user_id", user.id);

    if (error) {
      throw new PortfolioError(error.message, "QUERY_FAILED", 500);
    }

    if (!count) {
      throw new PortfolioNotFoundError();
    }
  }
}

export const portfolioRepository = new PortfolioRepository();
