export type ProviderName = 'fake' | 'stripe';

export interface SubscriptionProvider {
  createCustomer(userId: string): Promise<{ providerCustomerId?: string }>;
  createSubscription(userId: string, planId: string, opts?: { trial?: boolean }): Promise<{ providerSubscriptionId?: string; currentPeriodEnd?: Date }>
  cancelSubscription(userId: string): Promise<void>;
  handleWebhook(payload: any, signature?: string): Promise<void>;
}

export type Interval = 'monthly' | 'yearly';

export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'trial';
