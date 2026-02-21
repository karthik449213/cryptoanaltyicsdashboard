import { marketDataService } from "@/lib/market/market-data.service";
import { priceAlertsRepository } from "@/lib/alerts/repository";
import { createNotificationService } from "@/lib/alerts/notification-service";
import { NotificationPayload } from "@/types/alerts";
import { AlertsError } from "@/lib/alerts/errors";

export class PriceAlertsWorker {
  private notificationService = createNotificationService();
  private processedAlerts = new Set<string>();
  private readonly COOLDOWN_MINUTES = 60; // Prevent spam by not triggering the same alert too frequently

  async processAlerts(): Promise<void> {
    try {
      console.log("🔄 Starting price alerts processing...");

      // Get all active alerts
      const activeAlerts = await priceAlertsRepository.findActiveAlerts();
      console.log(`📊 Found ${activeAlerts.length} active alerts`);

      if (activeAlerts.length === 0) {
        console.log("✅ No active alerts to process");
        return;
      }

      // Get unique coin IDs from alerts
      const coinIds = [...new Set(activeAlerts.map(alert => alert.coinId))];

      // Fetch current prices for all coins
      const priceData = await marketDataService.getLivePrices({
        ids: coinIds,
        vsCurrency: "usd",
      });

      console.log(`💰 Fetched prices for ${priceData.length} coins`);

      // Create a map of coin ID to current price
      const priceMap = new Map<string, number>();
      priceData.forEach(price => {
        priceMap.set(price.id, price.price);
      });

      // Process each alert
      const triggeredAlerts: NotificationPayload[] = [];

      for (const alert of activeAlerts) {
        const currentPrice = priceMap.get(alert.coinId);

        if (!currentPrice) {
          console.warn(`⚠️ No price data found for ${alert.coinId}`);
          continue;
        }

        // Check if alert should trigger
        const shouldTrigger = this.shouldTriggerAlert(alert, currentPrice);

        if (shouldTrigger) {
          console.log(`🚨 Alert triggered for ${alert.symbol}: ${alert.alertType} $${alert.thresholdPrice} (current: $${currentPrice})`);

          // Check cooldown to prevent spam
          if (this.isOnCooldown(alert)) {
            console.log(`⏰ Alert ${alert.id} is on cooldown, skipping`);
            continue;
          }

          triggeredAlerts.push({
            alertId: alert.id,
            userId: alert.userId,
            coinId: alert.coinId,
            symbol: alert.symbol,
            alertType: alert.alertType,
            thresholdPrice: alert.thresholdPrice,
            currentPrice,
            channel: "telegram", // Default to telegram, fallback to email
          });

          // Mark as processed to prevent duplicate processing
          this.processedAlerts.add(alert.id);
        }
      }

      // Send notifications for triggered alerts
      if (triggeredAlerts.length > 0) {
        console.log(`📤 Sending ${triggeredAlerts.length} notifications...`);

        for (const payload of triggeredAlerts) {
          try {
            await this.notificationService.sendNotification(payload);
            await priceAlertsRepository.updateLastTriggered(payload.alertId);
            console.log(`✅ Notification sent for ${payload.symbol}`);
          } catch (error) {
            console.error(`❌ Failed to send notification for ${payload.symbol}:`, error);
          }
        }
      } else {
        console.log("✅ No alerts triggered");
      }

      console.log("🎉 Price alerts processing completed");

    } catch (error) {
      console.error("💥 Error processing price alerts:", error);
      throw new AlertsError("Failed to process price alerts", "WORKER_ERROR");
    }
  }

  private shouldTriggerAlert(alert: any, currentPrice: number): boolean {
    const { alertType, thresholdPrice } = alert;

    switch (alertType) {
      case "above":
        return currentPrice >= thresholdPrice;
      case "below":
        return currentPrice <= thresholdPrice;
      default:
        return false;
    }
  }

  private isOnCooldown(alert: any): boolean {
    if (!alert.lastTriggeredAt) {
      return false;
    }

    const lastTriggered = new Date(alert.lastTriggeredAt);
    const now = new Date();
    const cooldownMs = this.COOLDOWN_MINUTES * 60 * 1000;

    return (now.getTime() - lastTriggered.getTime()) < cooldownMs;
  }

  // Clean up old processed alerts (memory management)
  cleanup(): void {
    // Clear processed alerts older than cooldown period
    const cutoffTime = Date.now() - (this.COOLDOWN_MINUTES * 60 * 1000);
    // In a real implementation, you might want to persist this state
    this.processedAlerts.clear();
  }
}

// Export singleton instance
export const priceAlertsWorker = new PriceAlertsWorker();

// Export function for cron job execution
export async function processPriceAlerts() {
  try {
    await priceAlertsWorker.processAlerts();
  } catch (error) {
    console.error("Price alerts worker failed:", error);
    // In production, you might want to send alerts about worker failures
  } finally {
    priceAlertsWorker.cleanup();
  }
}