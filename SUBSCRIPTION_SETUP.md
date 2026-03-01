# Subscription Module Integration Guide

This document explains how to use the subscription-based functionality that has been added to the Crypto Analytics Dashboard.

## Overview

The subscription module is a provider-agnostic system that supports both a **fake provider** (for testing) and **Stripe** (for production). It includes:

- Prisma models for User, Plan, and Subscription management
- API routes for subscription operations
- React components (PlanCard, SubscriptionStatus)
- Custom hooks (useSubscription, useHasFeature)
- Middleware for route protection
- Pricing page

## Project Structure

```
cryptoanaltyicsdashboard/
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed script for default plans
├── src/
│   ├── app/
│   │   ├── api/subscription/
│   │   │   ├── subscribe/
│   │   │   ├── cancel/
│   │   │   ├── status/
│   │   │   ├── webhook/
│   │   │   └── plans/
│   │   ├── pricing/
│   │   │   └── page.tsx        # Pricing page
│   │   └── page.tsx             # Home page (redirects based on auth/subscription)
│   ├── lib/subscription/
│   │   ├── services.ts          # Business logic
│   │   ├── types.ts             # TypeScript types
│   │   ├── prisma.ts            # Prisma client
│   │   └── providers/
│   │       ├── fake.ts          # Fake provider (testing)
│   │       └── stripe.ts        # Stripe provider (production)
│   ├── components/subscription/
│   │   ├── PlanCard.tsx
│   │   ├── SubscriptionStatus.tsx
│   │   └── index.ts
│   ├── hooks/subscription/
│   │   ├── useSubscription.ts
│   │   ├── useHasFeature.ts
│   │   └── index.ts
│   └── middleware.ts            # Route protection middleware
├── package.json                 # Updated with Prisma and Stripe
└── .env.example                 # Environment variables template
```

## Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

This installs `@prisma/client`, `prisma`, and `stripe` (already added to package.json).

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration:

```env
# Use 'fake' for testing, 'stripe' for production
SUBSCRIPTION_PROVIDER=fake

# PostgreSQL Database URL (required)
DATABASE_URL=postgresql://user:password@localhost:5432/crypto_dashboard

# Stripe Configuration (only if using Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Step 3: Set Up the Database

Initialize the Prisma database:

```bash
npm run prisma:push
# or
npm run prisma:migrate -- init
```

### Step 4: Seed Default Plans

Run the seed script to create the default plans (Basic, Pro, Enterprise):

```bash
npm run prisma:seed
```

## Usage

### API Routes

#### 1. Get Available Plans

```bash
GET /api/subscription/plans
```

Response:
```json
[
  {
    "id": "plan_basic",
    "name": "Basic",
    "price": 999,
    "interval": "monthly",
    "features": ["Feature 1", "Feature 2"]
  }
]
```

#### 2. Subscribe to a Plan

```bash
POST /api/subscription/subscribe
Content-Type: application/json

{
  "userId": "user123",
  "planId": "plan_pro",
  "trial": false
}
```

#### 3. Get Subscription Status

```bash
GET /api/subscription/status?userId=user123
```

Response:
```json
{
  "status": "active",
  "subscription": {
    "id": "sub123",
    "userId": "user123",
    "planId": "plan_pro",
    "currentPeriodEnd": "2026-04-01T00:00:00Z",
    "plan": {
      "name": "Pro",
      "features": ["Feature 1", "Feature 2"]
    }
  }
}
```

#### 4. Cancel Subscription

```bash
POST /api/subscription/cancel
Content-Type: application/json

{
  "userId": "user123"
}
```

#### 5. Webhook (Stripe)

```bash
POST /api/subscription/webhook
Content-Type: application/json

# Stripe sends webhook data here
```

### React Components

#### PlanCard

Display a pricing tier:

```tsx
import { PlanCard } from '@/components/subscription';

<PlanCard
  id="plan_pro"
  name="Pro"
  price={2999}
  interval="monthly"
  features={['Feature 1', 'Feature 2']}
  onSubscribe={(planId) => console.log('Subscribe to:', planId)}
  isLoading={false}
/>
```

#### SubscriptionStatus

Show user's current subscription:

```tsx
import { SubscriptionStatus } from '@/components/subscription';

<SubscriptionStatus
  status="active"
  planName="Pro"
  endsAt="2026-04-01T00:00:00Z"
  onCancel={() => console.log('Cancel subscription')}
/>
```

### React Hooks

#### useSubscription

Manage subscription operations:

```tsx
import { useSubscription } from '@/hooks/subscription';

const { subscribe, cancel, getStatus, loading, error } = useSubscription();

// Subscribe to a plan
const result = await subscribe(userId, planId, false);

// Get subscription status
const status = await getStatus(userId);

// Cancel subscription
await cancel(userId);
```

#### useHasFeature

Check if user has access to specific features:

```tsx
import { useHasFeature } from '@/hooks/subscription';

const { hasFeature, loading } = useHasFeature('advanced-analytics');
const hasAccess = await hasFeature(userId);
```

## Pages

### Pricing Page (`/pricing`)

Shows all available plans and allows users to subscribe. Redirects to login if not authenticated.

**Features:**
- Display all active plans
- Show current subscription status
- Allow new subscriptions
- Allow cancellations

## Flow & Redirects

```
Home (/)
├─ Not Authenticated → /pricing
├─ Authenticated + Active Subscription → /dashboard
└─ Authenticated + No Subscription → /pricing

Pricing (/pricing)
├─ Not Authenticated → Show "Log in / Sign up" prompts
├─ Authenticated + No Subscription → Show Plans
├─ Authenticated + Active Subscription → Show Status + Plans (for upgrade)
└─ Subscribe Success → /dashboard

Dashboard (/dashboard)
├─ Middleware checks authentication & active subscription
└─ Not Authorized → /pricing
```

## Using the Fake Provider (Development)

The fake provider is perfect for development and testing. It:

- Creates mock subscriptions immediately
- Generates fake Stripe IDs
- Supports trial periods (7 days)
- Supports regular subscriptions (30 days)
- Stores everything in the database

Set in `.env.local`:
```env
SUBSCRIPTION_PROVIDER=fake
```

## Using Stripe (Production)

To use Stripe:

1. Create a Stripe account at https://stripe.com
2. Get API keys from the Dashboard
3. Create prices/products in Stripe
4. Set up webhook endpoint (e.g., `https://yourapp.com/api/subscription/webhook`)

Set in `.env.local`:
```env
SUBSCRIPTION_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Database Schema

The subscription system uses three main Prisma models:

### User

```prisma
model User {
  id            String
  email         String @unique
  password      String
  role          String @default("user")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  subscriptions Subscription[]
}
```

### Plan

```prisma
model Plan {
  id            String
  name          String
  price         Int        # in cents
  interval      Interval   # 'monthly' or 'yearly'
  features      Json       # array of feature strings
  isActive      Boolean
  createdAt     DateTime
  updatedAt     DateTime
  subscriptions Subscription[]
}
```

### Subscription

```prisma
model Subscription {
  id                     String
  userId                 String
  planId                 String
  status                 SubscriptionStatus # 'active', 'trial', 'canceled', 'expired'
  provider               String             # 'fake' or 'stripe'
  providerCustomerId     String?
  providerSubscriptionId String?
  currentPeriodEnd       DateTime?
  createdAt              DateTime
  updatedAt              DateTime
  user                   User    @relation(fields: [userId])
  plan                   Plan    @relation(fields: [planId])
}
```

## Protecting Routes

The middleware (`src/middleware.ts`) automatically protects:

- `/dashboard` - Requires authentication
- `/api/subscription/*` - Requires authentication

You can extend it to check subscription status:

```typescript
// In src/middleware.ts, add subscription verification
const status = await getSubscriptionStatus(userId);
if (status.status !== 'active' && status.status !== 'trial') {
  // Redirect to pricing
}
```

## Troubleshooting

### Prisma Client Generation Issues

```bash
npm run prisma:generate
```

### Database Sync Issues

```bash
npm run prisma:push
```

### Reset Database (Development Only!)

```bash
npx prisma migrate reset
```

## Next Steps

1. **Add payment processing**: Implement Stripe Checkout or Billing Portal
2. **Email notifications**: Send confirmation/cancellation emails
3. **Feature flags**: Use `useHasFeature` hook to gate features
4. **Analytics**: Track subscription metrics
5. **Admin panel**: Create a plan management interface

## Support

For issues or questions:
- Check the [Prisma documentation](https://www.prisma.io/docs/)
- Check the [Stripe documentation](https://stripe.com/docs)
- Review the source code in `src/lib/subscription/`
