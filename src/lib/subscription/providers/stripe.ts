import { SubscriptionProvider } from '../types';
import { prisma } from '../prisma';

type StripeModule = typeof import('stripe');

export class StripeSubscriptionProvider implements SubscriptionProvider {
  stripe: StripeModule | null = null;
  constructor() {
    try {
      // Dynamic import to avoid hard dependency at runtime
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // @ts-ignore
      const Stripe = require('stripe');
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' });
    } catch (err) {
      this.stripe = null;
    }
  }

  async createCustomer(userId: string) {
    if (!this.stripe) return { providerCustomerId: undefined };
    // In practice, attach metadata with userId
    const customer = await (this.stripe as any).customers.create({ metadata: { userId } });
    return { providerCustomerId: customer.id };
  }

  async createSubscription(userId: string, planId: string) {
    if (!this.stripe) throw new Error('Stripe not configured');
    // Create checkout session or subscription using saved price id from env
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) throw new Error('STRIPE_PRICE_ID missing');

    // This provider expects a customer has been created; in practice look up or create
    const customer = await (this.stripe as any).customers.create({ metadata: { userId } });

    const subscription = await (this.stripe as any).subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      trial_period_days: 0,
    });

    // persist subscription
    const currentPeriodEnd = subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : undefined;

    await prisma.subscription.create({ data: {
      userId,
      planId,
      status: 'active',
      provider: 'stripe',
      providerCustomerId: customer.id,
      providerSubscriptionId: subscription.id,
      currentPeriodEnd,
    }});

    return { providerSubscriptionId: subscription.id, currentPeriodEnd };
  }

  async cancelSubscription(userId: string) {
    if (!this.stripe) return;
    // find active subscription
    const sub = await prisma.subscription.findFirst({ where: { userId, status: { in: ['active','trial'] }, provider: 'stripe' } });
    if (!sub || !sub.providerSubscriptionId) return;
    await (this.stripe as any).subscriptions.del(sub.providerSubscriptionId);
    await prisma.subscription.updateMany({ where: { id: sub.id }, data: { status: 'canceled', currentPeriodEnd: new Date() } });
  }

  async handleWebhook(payload: any, signature?: string) {
    if (!this.stripe) return;
    const stripe = this.stripe as any;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event = payload;
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      } catch (err) {
        throw err;
      }
    }

    // Handle subscription events
    if (event.type === 'invoice.payment_succeeded' || event.type === 'checkout.session.completed') {
      // map and update DB as needed
    }
  }
}

export default StripeSubscriptionProvider;
