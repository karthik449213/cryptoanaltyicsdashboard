export type AlertType = "above" | "below";

export type PriceAlertRecord = {
  id: string;
  user_id: string;
  coin_id: string;
  symbol: string;
  alert_type: AlertType;
  threshold_price: string;
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PriceAlert = {
  id: string;
  userId: string;
  coinId: string;
  symbol: string;
  alertType: AlertType;
  thresholdPrice: number;
  isActive: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePriceAlertInput = {
  coinId: string;
  symbol: string;
  alertType: AlertType;
  thresholdPrice: number;
};

export type UpdatePriceAlertInput = {
  coinId?: string;
  symbol?: string;
  alertType?: AlertType;
  thresholdPrice?: number;
  isActive?: boolean;
};

export type PriceAlertWithStatus = PriceAlert & {
  currentPrice: number;
  isTriggered: boolean;
  priceDifference: number;
  priceDifferencePct: number;
};

export type NotificationChannel = "telegram" | "email";

export type NotificationPayload = {
  alertId: string;
  userId: string;
  coinId: string;
  symbol: string;
  alertType: AlertType;
  thresholdPrice: number;
  currentPrice: number;
  channel: NotificationChannel;
};

export type TelegramConfig = {
  botToken: string;
  chatId?: string;
};

export type EmailConfig = {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  fromName: string;
};