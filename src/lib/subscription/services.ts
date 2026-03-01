import { SubscriptionProvider } from './types';
import FakeSubscriptionProvider from './providers/fake';
import StripeSubscriptionProvider from './providers/stripe';
import { prisma } from './prisma';

function resolveProvider(): SubscriptionProvider {
  const provider = (process.env.SUBSCRIPTION_PROVIDER || 'fake').toLowerCase();
  if (provider === 'stripe') {
    const p = new StripeSubscriptionProvider();
    // fallback to fake if stripe not configured
    // @ts-ignore
    if (!p.stripe) return new FakeSubscriptionProvider();
    return p;
  }
  return new FakeSubscriptionProvider();
}

const provider = resolveProvider();

export const createCustomer = async (userId: string) => {
  const res = await provider.createCustomer(userId);
  if (res.providerCustomerId) {
    // attach to user if desired
  }
  return res;
};

export const subscribeUserToPlan = async (userId: string, planId: string, opts?: { trial?: boolean }) => {
  // enforce one active subscription per user
  await prisma.subscription.updateMany({ where: { userId, status: { in: ['active','trial'] } }, data: { status: 'expired' } });

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error('Plan not found');

  const res = await provider.createSubscription(userId, planId, opts);

  return res;
};

export const cancelSubscription = async (userId: string) => {
  await provider.cancelSubscription(userId);
};

export const getSubscriptionStatus = async (userId: string) => {
  const sub = await prisma.subscription.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' }, include: { plan: true } });
  if (!sub) return { status: 'none' };
  const now = new Date();
  if (sub.currentPeriodEnd && sub.currentPeriodEnd < now && sub.status === 'active') {
    // expire subscription
    await prisma.subscription.update({ where: { id: sub.id }, data: { status: 'expired' } });
    return { status: 'expired', subscription: sub };
  }
  return { status: sub.status, subscription: sub };
};

export const handleWebhook = async (payload: any, signature?: string) => {
  return provider.handleWebhook(payload, signature);
};

export const getAllPlans = async () => {
  return prisma.plan.findMany({ where: { isActive: true } });
};
