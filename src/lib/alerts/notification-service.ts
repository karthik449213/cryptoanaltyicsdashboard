import { NotificationPayload, NotificationChannel, TelegramConfig, EmailConfig } from "@/types/alerts";
import { AlertsError } from "./errors";

export class NotificationService {
  private telegramConfig?: TelegramConfig;
  private emailConfig?: EmailConfig;

  constructor(telegramConfig?: TelegramConfig, emailConfig?: EmailConfig) {
    this.telegramConfig = telegramConfig;
    this.emailConfig = emailConfig;
  }

  async sendNotification(payload: NotificationPayload): Promise<void> {
    const { channel } = payload;

    try {
      switch (channel) {
        case "telegram":
          await this.sendTelegramNotification(payload);
          break;
        case "email":
          await this.sendEmailNotification(payload);
          break;
        default:
          throw new AlertsError(`Unsupported notification channel: ${channel}`, "INVALID_CHANNEL");
      }
    } catch (error) {
      console.error(`Failed to send ${channel} notification:`, error);

      // If primary channel fails and we have email as fallback, try email
      if (channel === "telegram" && this.emailConfig) {
        console.log("Attempting email fallback...");
        try {
          await this.sendEmailNotification({ ...payload, channel: "email" });
        } catch (fallbackError) {
          console.error("Email fallback also failed:", fallbackError);
          throw fallbackError;
        }
      } else {
        throw error;
      }
    }
  }

  private async sendTelegramNotification(payload: NotificationPayload): Promise<void> {
    if (!this.telegramConfig?.botToken) {
      throw new AlertsError("Telegram bot token not configured", "CONFIG_ERROR");
    }

    const { botToken, chatId } = this.telegramConfig;
    const { symbol, alertType, thresholdPrice, currentPrice } = payload;

    // If no specific chatId, we'll need to get it from user preferences
    // For now, assume it's configured per user or globally
    if (!chatId) {
      throw new AlertsError("Telegram chat ID not configured", "CONFIG_ERROR");
    }

    const message = this.formatTelegramMessage(payload);

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AlertsError(
        `Telegram API error: ${errorData.description || response.statusText}`,
        "TELEGRAM_ERROR"
      );
    }

    const result = await response.json();
    if (!result.ok) {
      throw new AlertsError(`Telegram API error: ${result.description}`, "TELEGRAM_ERROR");
    }
  }

  private async sendEmailNotification(payload: NotificationPayload): Promise<void> {
    if (!this.emailConfig) {
      throw new AlertsError("Email configuration not available", "CONFIG_ERROR");
    }

    const { symbol, alertType, thresholdPrice, currentPrice } = payload;
    const subject = `🚨 Price Alert: ${symbol.toUpperCase()} ${alertType === "above" ? "Above" : "Below"} $${thresholdPrice.toLocaleString()}`;
    const htmlBody = this.formatEmailMessage(payload);

    // For production, you'd use a proper email service like SendGrid, Mailgun, etc.
    // For now, we'll use a simple SMTP approach (you'd need to install nodemailer)
    const emailData = {
      to: payload.userId, // This should be the user's email, not ID
      subject,
      html: htmlBody,
      from: this.emailConfig.fromEmail,
    };

    // Mock email sending - replace with actual email service
    console.log("Sending email notification:", emailData);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));

    // In production, uncomment and configure:
    /*
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransporter({
      host: this.emailConfig.smtpHost,
      port: this.emailConfig.smtpPort,
      secure: this.emailConfig.smtpPort === 465,
      auth: {
        user: this.emailConfig.smtpUser,
        pass: this.emailConfig.smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"${this.emailConfig.fromName}" <${this.emailConfig.fromEmail}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    });
    */
  }

  private formatTelegramMessage(payload: NotificationPayload): string {
    const { symbol, alertType, thresholdPrice, currentPrice } = payload;
    const direction = alertType === "above" ? "📈" : "📉";
    const action = alertType === "above" ? "rose above" : "fell below";
    const difference = currentPrice - thresholdPrice;
    const percentChange = ((difference / thresholdPrice) * 100).toFixed(2);

    return `
🚨 *Price Alert Triggered*

${direction} *${symbol.toUpperCase()}* ${action} your alert threshold!

**Alert Details:**
• Threshold: $${thresholdPrice.toLocaleString()}
• Current Price: $${currentPrice.toLocaleString()}
• Difference: ${difference >= 0 ? '+' : ''}$${difference.toFixed(2)} (${percentChange}%)

**Time:** ${new Date().toLocaleString()}
    `.trim();
  }

  private formatEmailMessage(payload: NotificationPayload): string {
    const { symbol, alertType, thresholdPrice, currentPrice } = payload;
    const direction = alertType === "above" ? "📈" : "📉";
    const action = alertType === "above" ? "rose above" : "fell below";
    const difference = currentPrice - thresholdPrice;
    const percentChange = ((difference / thresholdPrice) * 100).toFixed(2);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Price Alert: ${symbol.toUpperCase()}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22D3EE, #A78BFA); color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .alert-box { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .price { font-size: 24px; font-weight: bold; color: #22D3EE; }
            .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Price Alert Triggered</h1>
            </div>

            <div class="alert-box">
              <h2>${direction} ${symbol.toUpperCase()} Alert</h2>
              <p>Your ${symbol.toUpperCase()} price has ${action} your alert threshold!</p>

              <div style="margin: 20px 0;">
                <p><strong>Alert Threshold:</strong> <span class="price">$${thresholdPrice.toLocaleString()}</span></p>
                <p><strong>Current Price:</strong> <span class="price">$${currentPrice.toLocaleString()}</span></p>
                <p><strong>Difference:</strong> <span class="price">${difference >= 0 ? '+' : ''}$${difference.toFixed(2)} (${percentChange}%)</span></p>
              </div>

              <p><strong>Triggered at:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <div class="footer">
              <p>This alert was generated by Crypto Analytics Dashboard</p>
              <p>You can manage your alerts in your dashboard settings.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

// Factory function to create notification service with config
export function createNotificationService() {
  const telegramConfig: TelegramConfig | undefined = process.env.TELEGRAM_BOT_TOKEN ? {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  } : undefined;

  const emailConfig: EmailConfig | undefined = process.env.SMTP_HOST ? {
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT || "587"),
    smtpUser: process.env.SMTP_USER || "",
    smtpPass: process.env.SMTP_PASS || "",
    fromEmail: process.env.FROM_EMAIL || "",
    fromName: process.env.FROM_NAME || "Crypto Analytics",
  } : undefined;

  return new NotificationService(telegramConfig, emailConfig);
}