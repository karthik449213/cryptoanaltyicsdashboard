import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PriceAlertRecord, PriceAlert, CreatePriceAlertInput, UpdatePriceAlertInput } from "@/types/alerts";
import { AlertsError } from "./errors";

export class PriceAlertsRepository {
  async findByUserId(userId: string): Promise<PriceAlert[]> {
    try {
      const supabase = await createSupabaseServerClient();

      const { data, error } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new AlertsError(`Failed to fetch alerts: ${error.message}`, error.code);
      }

      return (data || []).map(this.mapRecordToEntity);
    } catch (error) {
      if (error instanceof AlertsError) {
        throw error;
      }
      throw new AlertsError("Failed to fetch price alerts", "DATABASE_ERROR");
    }
  }

  async findActiveAlerts(): Promise<PriceAlert[]> {
    try {
      const supabase = await createSupabaseServerClient();

      const { data, error } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        throw new AlertsError(`Failed to fetch active alerts: ${error.message}`, error.code);
      }

      return (data || []).map(this.mapRecordToEntity);
    } catch (error) {
      if (error instanceof AlertsError) {
        throw error;
      }
      throw new AlertsError("Failed to fetch active alerts", "DATABASE_ERROR");
    }
  }

  async findById(alertId: string, userId: string): Promise<PriceAlert | null> {
    try {
      const supabase = await createSupabaseServerClient();

      const { data, error } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("id", alertId)
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") { // No rows returned
          return null;
        }
        throw new AlertsError(`Failed to fetch alert: ${error.message}`, error.code);
      }

      return this.mapRecordToEntity(data);
    } catch (error) {
      if (error instanceof AlertsError) {
        throw error;
      }
      throw new AlertsError("Failed to fetch price alert", "DATABASE_ERROR");
    }
  }

  async create(input: CreatePriceAlertInput, userId: string): Promise<PriceAlert> {
    try {
      const supabase = await createSupabaseServerClient();

      const record: Omit<PriceAlertRecord, "id" | "created_at" | "updated_at"> = {
        user_id: userId,
        coin_id: input.coinId,
        symbol: input.symbol,
        alert_type: input.alertType,
        threshold_price: input.thresholdPrice.toString(),
        is_active: true,
        last_triggered_at: null,
      };

      const { data, error } = await supabase
        .from("price_alerts")
        .insert(record)
        .select()
        .single();

      if (error) {
        throw new AlertsError(`Failed to create alert: ${error.message}`, error.code);
      }

      return this.mapRecordToEntity(data);
    } catch (error) {
      if (error instanceof AlertsError) {
        throw error;
      }
      throw new AlertsError("Failed to create price alert", "DATABASE_ERROR");
    }
  }

  async update(alertId: string, userId: string, input: UpdatePriceAlertInput): Promise<PriceAlert> {
    try {
      const supabase = await createSupabaseServerClient();

      const updateData: Partial<PriceAlertRecord> = {};

      if (input.coinId !== undefined) updateData.coin_id = input.coinId;
      if (input.symbol !== undefined) updateData.symbol = input.symbol;
      if (input.alertType !== undefined) updateData.alert_type = input.alertType;
      if (input.thresholdPrice !== undefined) updateData.threshold_price = input.thresholdPrice.toString();
      if (input.isActive !== undefined) updateData.is_active = input.isActive;

      const { data, error } = await supabase
        .from("price_alerts")
        .update(updateData)
        .eq("id", alertId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new AlertsError("Alert not found or access denied", "NOT_FOUND");
        }
        throw new AlertsError(`Failed to update alert: ${error.message}`, error.code);
      }

      return this.mapRecordToEntity(data);
    } catch (error) {
      if (error instanceof AlertsError) {
        throw error;
      }
      throw new AlertsError("Failed to update price alert", "DATABASE_ERROR");
    }
  }

  async delete(alertId: string, userId: string): Promise<void> {
    try {
      const supabase = await createSupabaseServerClient();

      const { error } = await supabase
        .from("price_alerts")
        .delete()
        .eq("id", alertId)
        .eq("user_id", userId);

      if (error) {
        throw new AlertsError(`Failed to delete alert: ${error.message}`, error.code);
      }
    } catch (error) {
      if (error instanceof AlertsError) {
        throw error;
      }
      throw new AlertsError("Failed to delete price alert", "DATABASE_ERROR");
    }
  }

  async updateLastTriggered(alertId: string): Promise<void> {
    try {
      const supabase = await createSupabaseServerClient();

      const { error } = await supabase
        .from("price_alerts")
        .update({ last_triggered_at: new Date().toISOString() })
        .eq("id", alertId);

      if (error) {
        throw new AlertsError(`Failed to update last triggered: ${error.message}`, error.code);
      }
    } catch (error) {
      if (error instanceof AlertsError) {
        throw error;
      }
      throw new AlertsError("Failed to update alert trigger time", "DATABASE_ERROR");
    }
  }

  private mapRecordToEntity(record: PriceAlertRecord): PriceAlert {
    return {
      id: record.id,
      userId: record.user_id,
      coinId: record.coin_id,
      symbol: record.symbol,
      alertType: record.alert_type as "above" | "below",
      thresholdPrice: parseFloat(record.threshold_price),
      isActive: record.is_active,
      lastTriggeredAt: record.last_triggered_at,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }
}

export const priceAlertsRepository = new PriceAlertsRepository();