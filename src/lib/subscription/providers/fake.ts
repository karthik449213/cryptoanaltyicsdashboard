import { SubscriptionProvider } from '../types';
import { prisma } from '../prisma';

const DAYS = (n: number) => 1000 * 60 * 60 * 24 * n;

export class FakeSubscriptionProvider implements SubscriptionProvider {
  async createCustomer(userId: string) {
    // no external customer; return a fake id
    const providerCustomerId = `fake_cust_${userId}`;
    return { providerCustomerId };
  }

  async createSubscription(userId: string, planId: string, opts?: { trial?: boolean }) {
    const now = new Date();
    const trial = !!opts?.trial;
    const periodEnd = new Date(now.getTime() + (trial ? DAYS(7) : DAYS(30)));

    // create or update subscription record in DB
    // ensure only one active subscription per user
    await prisma.subscription.updateMany({ where: { userId, status: 'trial' }, data: { status: 'expired' } }).catch(() => {});

    const sub = await prisma.subscription.create({
      data: {
        userId,
        planId,
        status: trial ? 'trial' : 'active',
        provider: 'fake',
        providerCustomerId: `fake_cust_${userId}`,
        providerSubscriptionId: `fake_sub_${Date.now()}`,
        currentPeriodEnd: periodEnd,
      },
    });

    return { providerSubscriptionId: sub.providerSubscriptionId ?? undefined, currentPeriodEnd: sub.currentPeriodEnd ?? undefined };
  }

  async cancelSubscription(userId: string) {
    // mark active subscription canceled and set period end to now
    const now = new Date();
    await prisma.subscription.updateMany({ where: { userId, status: { in: ['active','trial'] } }, data: { status: 'canceled', currentPeriodEnd: now } });
  }

  async handleWebhook(_payload: any) {
    // Fake provider doesn't send webhooks. No-op.
  }
}

export default FakeSubscriptionProvider;
