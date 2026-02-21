"use client";

import { useState, useEffect } from "react";
import { CreatePriceAlertInput, AlertType } from "@/types/alerts";
import { createAlert } from "@/lib/alerts/alerts-api.client";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { fetchTopMarkets } from "@/lib/market/market-api.client";
import { CoinMarket } from "@/types/market";
import { AlertTriangle, Plus } from "lucide-react";

interface CreateAlertFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateAlertForm({ onSuccess, onCancel }: CreateAlertFormProps) {
  const [formData, setFormData] = useState<CreatePriceAlertInput>({
    coinId: "",
    symbol: "",
    alertType: "above",
    thresholdPrice: 0,
  });
  const [coins, setCoins] = useState<CoinMarket[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCoins, setFetchingCoins] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCoins();
  }, []);

  const loadCoins = async () => {
    try {
      setFetchingCoins(true);
      const markets = await fetchTopMarkets("usd", 1, 100); // Get top 100 coins
      setCoins(markets);
    } catch (err) {
      console.error("Failed to load coins:", err);
    } finally {
      setFetchingCoins(false);
    }
  };

  const handleCoinSelect = (coinId: string) => {
    const selectedCoin = coins.find(coin => coin.id === coinId);
    if (selectedCoin) {
      setFormData({
        ...formData,
        coinId: selectedCoin.id,
        symbol: selectedCoin.symbol,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.coinId || !formData.symbol || formData.thresholdPrice <= 0) {
      setError("Please fill in all fields with valid values");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createAlert(formData);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create alert");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard title="Create Price Alert" subtitle="Get notified when prices hit your targets">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Cryptocurrency
          </label>
          <Select
            value={formData.coinId}
            onChange={(e) => handleCoinSelect(e.target.value)}
            disabled={fetchingCoins}
            className="w-full"
          >
            <option value="">
              {fetchingCoins ? "Loading coins..." : "Select a cryptocurrency"}
            </option>
            {coins.map((coin) => (
              <option key={coin.id} value={coin.id}>
                {coin.symbol.toUpperCase()} - {coin.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Alert Type */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Alert Type
          </label>
          <Select
            value={formData.alertType}
            onChange={(e) => setFormData({ ...formData, alertType: e.target.value as AlertType })}
            className="w-full"
          >
            <option value="above">📈 Alert when price goes above threshold</option>
            <option value="below">📉 Alert when price goes below threshold</option>
          </Select>
        </div>

        {/* Threshold Price */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Threshold Price (USD)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.thresholdPrice || ""}
            onChange={(e) => setFormData({
              ...formData,
              thresholdPrice: parseFloat(e.target.value) || 0
            })}
            placeholder="Enter target price"
            className="bg-slate-900/40 border-slate-700/40"
          />
          {formData.coinId && (
            <p className="text-xs text-slate-500 mt-1">
              Selected: {formData.symbol.toUpperCase()}
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading || !formData.coinId || formData.thresholdPrice <= 0}
            className="flex-1 bg-neon-cyan hover:bg-cyan-400"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Alert
              </div>
            )}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </GlassCard>
  );
}