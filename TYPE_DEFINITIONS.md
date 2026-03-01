# Type Definitions Reference

This document provides a complete reference of all TypeScript types and interfaces available in the subscription system.

## Subscription Types

### SubscriptionStatus

Possible states for a subscription:

```typescript
type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'trial';
```

- **active** - Currently active paid subscription
- **trial** - In trial period (no payment required)
- **canceled** - User canceled, period ended
- **expired** - Subscription period ended, needs renewal

### Interval

Subscription billing interval:

```typescript
type Interval = 'monthly' | 'yearly';
```

### ProviderName

Available payment providers:

```typescript
type ProviderName = 'fake' | 'stripe';
```

## Interfaces

### SubscriptionProvider

Interface for payment providers:

```typescript
interface SubscriptionProvider {
  createCustomer(userId: string): Promise<{ providerCustomerId?: string }>;
  createSubscription(
    userId: string,
    planId: string,
    opts?: { trial?: boolean }
  ): Promise<{ 
    providerSubscriptionId?: string; 
    currentPeriodEnd?: Date 
  }>;
  cancelSubscription(userId: string): Promise<void>;
  handleWebhook(payload: any, signature?: string): Promise<void>;
}
```

## Prisma Model Types

### User

```typescript
type User = {
  id: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  subscriptions: Subscription[];
};
```

### Plan

```typescript
type Plan = {
  id: string;
  name: string;
  price: number;        // in cents (e.g., 999 = $9.99)
  interval: Interval;   // 'monthly' or 'yearly'
  features: string[];   // array of feature descriptions
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  subscriptions: Subscription[];
};
```

### Subscription

```typescript
type Subscription = {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  provider: string;              // 'fake' or 'stripe'
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  currentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  plan: Plan;
};
```

## Service Return Types

### getSubscriptionStatus Response

```typescript
type GetStatusResponse = 
  | { status: 'none' }
  | {
      status: 'active' | 'trial' | 'canceled' | 'expired';
      subscription: {
        id: string;
        userId: string;
        planId: string;
        status: SubscriptionStatus;
        provider: string;
        providerCustomerId?: string;
        providerSubscriptionId?: string;
        currentPeriodEnd?: Date;
        createdAt: Date;
        updatedAt: Date;
        plan: {
          id: string;
          name: string;
          price: number;
          interval: Interval;
          features: string[];
          isActive: boolean;
          createdAt: Date;
          updatedAt: Date;
        };
      };
    };
```

### createSubscription Response

```typescript
type CreateSubscriptionResponse = {
  providerSubscriptionId?: string;
  currentPeriodEnd?: Date;
};
```

## Hook Return Types

### useSubscription

```typescript
type UseSubscriptionReturn = {
  subscribe: (
    userId: string,
    planId: string,
    trial?: boolean
  ) => Promise<CreateSubscriptionResponse>;
  
  cancel: (userId: string) => Promise<{ ok: boolean }>;
  
  getStatus: (userId: string) => Promise<GetStatusResponse>;
  
  loading: boolean;
  error: string | null;
};
```

### useHasFeature

```typescript
type UseHasFeatureReturn = {
  hasFeature: (userId: string) => Promise<boolean>;
  loading: boolean;
  subscriptionData: SubscriptionData | null;
};

type SubscriptionData = {
  status: string;
  subscription?: {
    plan: {
      features: string[];
    };
  };
};
```

## Component Prop Types

### PlanCard

```typescript
type PlanCardProps = {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  onSubscribe?: (planId: string) => void;
  isLoading?: boolean;
};
```

### SubscriptionStatus

```typescript
type SubscriptionStatusProps = {
  status: string;
  planName?: string;
  endsAt?: string;
  onCancel?: () => void;
  isLoading?: boolean;
};
```

## API Route Request/Response Types

### Subscribe Endpoint

**Request:**
```typescript
type SubscribeRequest = {
  userId: string;
  planId: string;
  trial?: boolean;
};
```

**Response:**
```typescript
type SubscribeResponse = {
  ok: boolean;
  providerSubscriptionId?: string;
  currentPeriodEnd?: Date;
} | {
  error: string;
};
```

### Cancel Endpoint

**Request:**
```typescript
type CancelRequest = {
  userId: string;
};
```

**Response:**
```typescript
type CancelResponse = {
  ok: boolean;
} | {
  error: string;
};
```

### Status Endpoint

**Request:**
```
GET /api/subscription/status?userId=string
```

**Response:**
```typescript
type StatusResponse = GetStatusResponse | { error: string };
```

### Plans Endpoint

**GET Response:**
```typescript
type PlansResponse = Plan[] | { error: string };
```

**POST Request:**
```typescript
type CreatePlanRequest = {
  name: string;
  price: number;
  interval: Interval;
  features?: string[];
};
```

**POST Response:**
```typescript
type CreatePlanResponse = Plan | { error: string };
```

## Import Examples

```typescript
// Services
import {
  subscribeUserToPlan,
  cancelSubscription,
  getSubscriptionStatus,
  createCustomer,
  handleWebhook,
  getAllPlans,
} from '@/lib/subscription';

// Types
import type {
  SubscriptionStatus,
  Interval,
  ProviderName,
  SubscriptionProvider,
} from '@/lib/subscription';

// Components
import { PlanCard, SubscriptionStatus } from '@/components/subscription';

// Hooks
import { useSubscription, useHasFeature } from '@/hooks/subscription';

// Prisma (for direct DB access)
import { prisma } from '@/lib/subscription';
```

## Common Type Patterns

### Type Guard for Subscription Status

```typescript
const hasActiveSubscription = (
  status: SubscriptionStatus
): status is 'active' | 'trial' => {
  return status === 'active' || status === 'trial';
};
```

### Subscription with Plan Details

```typescript
type SubscriptionWithPlan = Subscription & {
  plan: Plan;
};
```

### Price in Different Formats

```typescript
// Database stores price in cents
const priceInCents: number = 2999;    // $29.99
const priceInDollars = priceInCents / 100;  // 29.99
const formatted = `$${(priceInCents / 100).toFixed(2)}`;  // "$29.99"
```
