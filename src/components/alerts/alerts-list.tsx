"use client";

import { useState, useEffect } from "react";
import { PriceAlert } from "@/types/alerts";
import { fetchUserAlerts, deleteAlert, toggleAlert } from "@/lib/alerts/alerts-api.client";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, Eye, EyeOff } from "lucide-react";
import { usd } from "@/lib/format";
import { clsx } from "clsx";

interface AlertsListProps {
  onCreateAlert?: () => void;
}

export function AlertsList({ onCreateAlert }: AlertsListProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserAlerts();
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      await toggleAlert(alertId, !isActive);
      setAlerts(alerts.map(alert =>
        alert.id === alertId ? { ...alert, isActive: !isActive } : alert
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle alert");
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm("Are you sure you want to delete this alert?")) {
      return;
    }

    try {
      await deleteAlert(alertId);
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete alert");
    }
  };

  if (loading) {
    return (
      <GlassCard title="Price Alerts" subtitle="Loading your alerts...">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-slate-700/40 bg-slate-900/40 p-4">
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard title="Price Alerts" subtitle="Error loading alerts">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-400 font-medium">Error</p>
            <p className="text-red-300/70 text-sm">{error}</p>
            <Button
              onClick={loadAlerts}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              Retry
            </Button>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard
      title="Price Alerts"
      subtitle={`${alerts.length} active alert${alerts.length !== 1 ? 's' : ''}`}
    >
      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No alerts yet</h3>
          <p className="text-slate-400 mb-4">Create your first price alert to get notified when cryptocurrencies reach your target prices.</p>
          {onCreateAlert && (
            <Button onClick={onCreateAlert} className="bg-neon-cyan hover:bg-cyan-400">
              Create Alert
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onToggle={() => handleToggleAlert(alert.id, alert.isActive)}
              onDelete={() => handleDeleteAlert(alert.id)}
            />
          ))}
        </div>
      )}
    </GlassCard>
  );
}

interface AlertItemProps {
  alert: PriceAlert;
  onToggle: () => void;
  onDelete: () => void;
}

function AlertItem({ alert, onToggle, onDelete }: AlertItemProps) {
  const isTriggered = alert.lastTriggeredAt &&
    (new Date().getTime() - new Date(alert.lastTriggeredAt).getTime()) < (60 * 60 * 1000); // Within last hour

  return (
    <div className={clsx(
      "rounded-lg border p-4 transition-all duration-200",
      alert.isActive
        ? "border-slate-700/40 bg-slate-900/40 hover:bg-slate-800/40"
        : "border-slate-700/20 bg-slate-900/20 opacity-60",
      isTriggered && "border-neon-cyan/50 bg-cyan-500/5"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={clsx(
            "w-3 h-3 rounded-full",
            alert.alertType === "above" ? "bg-emerald-400" : "bg-red-400"
          )} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100">
                {alert.symbol.toUpperCase()}
              </span>
              <span className="text-sm text-slate-400">
                {alert.alertType === "above" ? "Above" : "Below"}
              </span>
              <span className="font-mono text-neon-cyan">
                ${usd(alert.thresholdPrice)}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Created {new Date(alert.createdAt).toLocaleDateString()}
              {alert.lastTriggeredAt && (
                <span className="ml-2 text-cyan-400">
                  • Last triggered {new Date(alert.lastTriggeredAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className={clsx(
              "h-8 w-8 p-0",
              alert.isActive ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-300"
            )}
          >
            {alert.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button
            onClick={onDelete}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}