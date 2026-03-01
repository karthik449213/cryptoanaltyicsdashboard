# Quick Reference Guide

A quick lookup guide for common subscription operations and code snippets.

## Common Tasks

### Get All Plans

```typescript
// API Endpoint
GET /api/subscription/plans

// Service Function
import { getAllPlans } from '@/lib/subscription';
const plans = await getAllPlans();
```

### Subscribe User to Plan

```typescript
// Using Hook (recommended for components)
import { useSubscription } from '@/hooks/subscription';

const MyComponent = () => {
  const { subscribe, loading, error } = useSubscription();
  
  const handleSubscribe = async (planId: string) => {
    try {
      const result = await subscribe(userId, planId, false);
      console.log('Subscription created:', result);
    } catch (err) {
      console.error('Failed to subscribe:', err);
    }
  };
  
  return <button onClick={() => handleSubscribe('plan_pro')}>Subscribe</button>;
};
```

```typescript
// Using Service (server-side)
import { subscribeUserToPlan } from '@/lib/subscription';

const result = await subscribeUserToPlan(userId, planId, { trial: false });
```

### Get Subscription Status

```typescript
// Using Hook
const { getStatus } = useSubscription();
const status = await getStatus(userId);

// Using Service
import { getSubscriptionStatus } from '@/lib/subscription';
const status = await getSubscriptionStatus(userId);

// API Endpoint
GET /api/subscription/status?userId=user123
```

### Cancel Subscription

```typescript
// Using Hook
const { cancel } = useSubscription();
await cancel(userId);

// Using Service
import { cancelSubscription } from '@/lib/subscription';
await cancelSubscription(userId);

// API Endpoint
POST /api/subscription/cancel
Body: { userId: "user123" }
```

### Display Pricing Page

```typescript
// Page is automatically available at /pricing
// Just navigate to it
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/pricing');
```

### Gate Feature by Subscription

```typescript
import { useHasFeature } from '@/hooks/subscription';

const AdvancedDashboard = ({ userId }: { userId: string }) => {
  const { hasFeature, loading } = useHasFeature('advanced-analytics');
  const [canAccess, setCanAccess] = useState(false);
  
  useEffect(() => {
    hasFeature(userId).then(setCanAccess);
  }, [userId, hasFeature]);
  
  if (loading) return <div>Loading...</div>;
  if (!canAccess) return <div>This feature requires Pro plan</div>;
  
  return <div>Advanced Analytics</div>;
};
```

### Display User's Subscription

```typescript
import { SubscriptionStatus } from '@/components/subscription';
import { useSubscription } from '@/hooks/subscription';

const MyComponent = ({ userId }: { userId: string }) => {
  const { getStatus, cancel, loading } = useSubscription();
  const [status, setStatus] = useState<any>(null);
  
  useEffect(() => {
    getStatus(userId).then(setStatus);
  }, [userId, getStatus]);
  
  if (!status) return <div>Loading...</div>;
  
  return (
    <SubscriptionStatus
      status={status.status}
      planName={status.subscription?.plan?.name}
      endsAt={status.subscription?.currentPeriodEnd}
      onCancel={() => cancel(userId)}
      isLoading={loading}
    />
  );
};
```

### Create a New Plan (Admin)

```typescript
// API Endpoint
POST /api/subscription/plans
Content-Type: application/json

{
  "name": "Premium",
  "price": 4999,
  "interval": "monthly",
  "features": ["Feature 1", "Feature 2", "Feature 3"]
}
```

```typescript
// Using Prisma directly
import { prisma } from '@/lib/subscription';

const plan = await prisma.plan.create({
  data: {
    name: 'Premium',
    price: 4999,
    interval: 'monthly',
    features: ['Feature 1', 'Feature 2'],
    isActive: true,
  },
});
```

## Component Snippets

### Plan Card

```tsx
import { PlanCard } from '@/components/subscription';

<PlanCard
  id="plan_pro"
  name="Pro"
  price={2999}
  interval="monthly"
  features={['Unlimited alerts', 'API access', 'Priority support']}
  onSubscribe={(planId) => handleSubscribe(planId)}
  isLoading={isSubscribing}
/>
```

### Subscription Status

```tsx
import { SubscriptionStatus } from '@/components/subscription';

<SubscriptionStatus
  status="active"
  planName="Pro"
  endsAt="2026-04-01T00:00:00Z"
  onCancel={() => handleCancel()}
  isLoading={false}
/>
```

## Stripe Setup

### Enable Stripe in Environment

1. Update `.env.local`:
```env
SUBSCRIPTION_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

2. Restart development server:
```bash
npm run dev
```

### Test with Stripe CLI

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to your Stripe account
stripe login

# Listen for webhooks
stripe listen --forward-to localhost:3000/api/subscription/webhook

# Get webhook signing secret from the output
# Add it to your .env.local as STRIPE_WEBHOOK_SECRET
```

## Database Operations

### View All Subscriptions for a User

```typescript
import { prisma } from '@/lib/subscription';

const subscriptions = await prisma.subscription.findMany({
  where: { userId: 'user123' },
  include: { plan: true },
  orderBy: { createdAt: 'desc' },
});
```

### Update a Plan

```typescript
import { prisma } from '@/lib/subscription';

const updatedPlan = await prisma.plan.update({
  where: { id: 'plan_pro' },
  data: {
    price: 3499,  // Change price to $34.99
    features: ['New feature 1', 'New feature 2'],
  },
});
```

### Deactivate a Plan

```typescript
import { prisma } from '@/lib/subscription';

await prisma.plan.update({
  where: { id: 'plan_basic' },
  data: { isActive: false },
});
```

### Query Expired Subscriptions

```typescript
import { prisma } from '@/lib/subscription';

const expired = await prisma.subscription.findMany({
  where: {
    status: 'expired',
    currentPeriodEnd: {
      lt: new Date(),
    },
  },
});
```

## Environment Variables

### Minimum Required
```env
DATABASE_URL=postgresql://...
SUBSCRIPTION_PROVIDER=fake
```

### For Stripe
```env
SUBSCRIPTION_PROVIDER=stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Debugging

### Check Database Connection
```bash
npm run prisma:push
```

### Reset Database (⚠️ WARNING: Deletes all data)
```bash
npx prisma migrate reset
npm run prisma:seed
```

### View Database
```bash
npx prisma studio
# Opens interactive database browser
```

### Check API Endpoints
```bash
# Test subscribe endpoint
curl -X POST http://localhost:3000/api/subscription/subscribe \
  -H "Content-Type: application/json" \
  -d '{"userId":"user1","planId":"plan_pro","trial":false}'

# Test status endpoint
curl http://localhost:3000/api/subscription/status?userId=user1

# Test plans endpoint
curl http://localhost:3000/api/subscription/plans
```

## Error Handling

### Common Errors

```typescript
// Plan not found
if (error.message === 'Plan not found') {
  // Handle: Plan doesn't exist or was deleted
}

// User already subscribed
if (error.message.includes('subscription')) {
  // Handle: User already has active subscription
}

// Stripe not configured
if (error.message === 'Stripe not configured') {
  // Check: STRIPE_SECRET_KEY is set
}
```

## File Locations

| Feature | Location |
|---------|----------|
| Services | `src/lib/subscription/services.ts` |
| Types | `src/lib/subscription/types.ts` |
| Prisma | `src/lib/subscription/prisma.ts` |
| Providers | `src/lib/subscription/providers/` |
| API Routes | `src/app/api/subscription/` |
| Components | `src/components/subscription/` |
| Hooks | `src/hooks/subscription/` |
| Pricing Page | `src/app/pricing/page.tsx` |
| Database Schema | `prisma/schema.prisma` |
| Seed Script | `prisma/seed.ts` |
| Middleware | `src/middleware.ts` |

## Related Documentation

- [SUBSCRIPTION_SETUP.md](./SUBSCRIPTION_SETUP.md) - Complete setup guide
- [SUBSCRIPTION_INTEGRATION_SUMMARY.md](./SUBSCRIPTION_INTEGRATION_SUMMARY.md) - Overview
- [SUBSCRIPTION_CHECKLIST.md](./SUBSCRIPTION_CHECKLIST.md) - Implementation checklist
- [TYPE_DEFINITIONS.md](./TYPE_DEFINITIONS.md) - Type reference
- [Prisma Docs](https://www.prisma.io/docs/)
- [Stripe Docs](https://stripe.com/docs)
