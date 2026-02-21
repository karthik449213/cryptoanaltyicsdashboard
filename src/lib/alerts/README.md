# Crypto Price Alerts System

A comprehensive price alert system for the Crypto Analytics Dashboard that allows users to set price thresholds and receive notifications via Telegram or email.

## 📁 Folder Structure

```
src/
├── app/(app)/alerts/                    # Alerts page route
│   └── page.tsx                         # Main alerts page
├── app/api/alerts/                      # Alerts API routes
│   ├── route.ts                         # GET/POST alerts
│   ├── [alertId]/
│   │   ├── route.ts                     # GET/PUT/DELETE specific alert
│   │   └── toggle/
│   │       └── route.ts                 # PATCH toggle alert active state
│   └── cron/
│       └── route.ts                     # Cron job endpoint
├── components/alerts/                   # Alert UI components
│   ├── alerts-list.tsx                  # List user's alerts
│   ├── create-alert-form.tsx            # Form to create new alerts
│   └── index.ts                         # Component exports
├── lib/alerts/                          # Alert business logic
│   ├── repository.ts                    # Database operations
│   ├── validation.ts                    # Input validation
│   ├── errors.ts                        # Error classes
│   ├── alerts-api.client.ts             # Client-side API calls
│   ├── notification-service.ts          # Telegram/email notifications
│   ├── worker.ts                        # Background alert processing
│   └── index.ts                         # Exports
├── types/alerts.ts                      # TypeScript definitions
└── supabase/migrations/
    └── 20260221_price_alerts.sql        # Database schema
```

## 🗄️ Database Schema

### `price_alerts` Table

```sql
CREATE TABLE public.price_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    coin_id TEXT NOT NULL,
    symbol TEXT NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('above', 'below')),
    threshold_price DECIMAL(20, 8) NOT NULL CHECK (threshold_price > 0),
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Features:**
- **RLS Policies**: Users can only access their own alerts
- **Indexes**: Optimized for user queries and active alert filtering
- **Constraints**: Data validation at database level
- **Triggers**: Automatic `updated_at` timestamp updates

## 🔧 Setup Guide

### 1. Database Migration

Run the migration to create the alerts table:

```bash
# Apply the migration
supabase db push

# Or if using Supabase CLI locally
supabase migration up
```

### 2. Environment Variables

Add these to your `.env.local` file:

```env
# Telegram Bot Configuration (Required for Telegram notifications)
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# Email Configuration (Optional, fallback for Telegram)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=your_email@gmail.com
FROM_NAME=Crypto Analytics

# Cron Job Security
CRON_SECRET=your_secure_random_string
```

### 3. Telegram Bot Setup

1. **Create a Telegram Bot:**
   - Message `@BotFather` on Telegram
   - Send `/newbot` and follow instructions
   - Copy the bot token to `TELEGRAM_BOT_TOKEN`

2. **Get Chat ID:**
   - Start a conversation with your bot
   - Send a message to the bot
   - Visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Copy the `chat.id` to `TELEGRAM_CHAT_ID`

### 4. Email Setup (Optional)

For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `SMTP_PASS`

### 5. Cron Job Configuration

#### Vercel Deployment (Recommended)

1. **Add Vercel Cron Job:**
   ```json
   // vercel.json
   {
     "crons": [
       {
         "path": "/api/alerts/cron",
         "schedule": "*/5 * * * *"
       }
     ]
   }
   ```

2. **Set Environment Variables in Vercel:**
   - `CRON_SECRET`: A secure random string
   - Add `Authorization: Bearer <CRON_SECRET>` header to cron requests

#### Alternative: External Cron Service

Use services like:
- **Cron-Job.org**: Free cron service
- **GitHub Actions**: Scheduled workflows
- **Railway**: Built-in cron jobs

Example curl command:
```bash
curl -X GET "https://yourdomain.com/api/alerts/cron" \
  -H "Authorization: Bearer your_cron_secret"
```

## 🚀 API Endpoints

### Alerts CRUD

```
GET    /api/alerts              # List user's alerts
POST   /api/alerts              # Create new alert
GET    /api/alerts/:id          # Get specific alert
PUT    /api/alerts/:id          # Update alert
DELETE /api/alerts/:id          # Delete alert
PATCH  /api/alerts/:id/toggle   # Toggle active state
```

### Cron Job

```
GET/POST /api/alerts/cron       # Process alerts (internal)
```

## 📱 UI Components

### `AlertsList`
- Displays user's active alerts
- Toggle alerts on/off
- Delete alerts with confirmation
- Shows last triggered time

### `CreateAlertForm`
- Coin selection from top 100 cryptocurrencies
- Alert type selection (above/below)
- Price threshold input
- Form validation and error handling

## 🔄 Worker System

### `PriceAlertsWorker`

**Responsibilities:**
- Fetch all active alerts from database
- Get current prices for alert coins
- Check threshold conditions
- Send notifications for triggered alerts
- Update `last_triggered_at` timestamps
- Implement cooldown to prevent spam

**Cooldown Logic:**
- Alerts won't trigger again within 60 minutes of last trigger
- Prevents notification spam during volatile periods

### Notification Channels

#### Telegram
- **Primary Channel**: Fast, reliable delivery
- **Rich Formatting**: Markdown support with emojis
- **Fallback**: Automatically tries email if Telegram fails

#### Email
- **HTML Templates**: Professional email design
- **SMTP Support**: Compatible with major providers
- **Rich Content**: Price details, charts, timestamps

## 🧪 Testing Strategy

### Unit Tests

**Repository Tests:**
```typescript
// Test alert creation, updates, deletion
// Test RLS policies
// Test validation constraints
```

**Validation Tests:**
```typescript
// Test input sanitization
// Test threshold validation
// Test coin ID validation
```

**Worker Tests:**
```typescript
// Test alert triggering logic
// Test cooldown mechanism
// Mock external API calls
```

### Integration Tests

**API Route Tests:**
```typescript
// Test CRUD operations
// Test authentication
// Test error responses
// Test rate limiting
```

**Notification Tests:**
```typescript
// Mock Telegram API
// Mock SMTP server
// Test fallback logic
```

### End-to-End Tests

**User Journey:**
1. Create alert via UI
2. Verify alert appears in list
3. Simulate price change
4. Verify notification delivery
5. Test alert toggling/deletion

### Test Data Setup

```typescript
// Create test users and alerts
// Mock CoinGecko API responses
// Set up test Telegram bot
// Configure test SMTP server
```

### Performance Testing

**Load Testing:**
- 1000+ concurrent alerts
- API response times < 200ms
- Database query optimization

**Scalability:**
- Horizontal scaling considerations
- Database connection pooling
- Redis caching for high load

## 🔒 Security Considerations

### Authentication
- All API routes require user authentication
- RLS policies prevent data leakage
- Cron endpoint protected with secret token

### Input Validation
- Server-side validation on all inputs
- Database constraints as additional layer
- Sanitization of user inputs

### Rate Limiting
- API rate limiting on alert creation
- Cron job frequency controls
- Notification spam prevention

## 📊 Monitoring & Analytics

### Alert Metrics
- Total active alerts
- Trigger frequency
- Notification delivery success rate
- User engagement statistics

### System Health
- Cron job execution status
- API response times
- Error rates and types
- Database performance

### Logging
```typescript
// Structured logging for alerts
{
  alertId: "uuid",
  userId: "uuid",
  coinId: "bitcoin",
  triggeredAt: "2024-01-01T12:00:00Z",
  channel: "telegram",
  success: true
}
```

## 🚀 Deployment Checklist

- [ ] Database migration applied
- [ ] Environment variables configured
- [ ] Telegram bot set up and tested
- [ ] Email configuration (optional)
- [ ] Cron job scheduled
- [ ] SSL certificates configured
- [ ] Monitoring and alerting set up
- [ ] Backup strategy in place

## 🔧 Maintenance

### Regular Tasks
- Monitor alert delivery success rates
- Clean up old/inactive alerts
- Update coin lists periodically
- Review and optimize database queries

### Troubleshooting
- Check cron job logs
- Verify API key validity
- Test notification channels
- Monitor database performance

## 📈 Future Enhancements

- **Advanced Alert Types**: Percentage changes, volume alerts
- **Multi-channel Notifications**: Push notifications, SMS
- **Alert Groups**: Organize alerts by categories
- **Analytics Dashboard**: Alert performance insights
- **Social Features**: Share alerts with other users
- **Mobile App**: Native mobile notifications