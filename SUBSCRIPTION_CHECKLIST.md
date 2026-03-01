# Subscription Integration Checklist

## Pre-Installation
- [ ] Read SUBSCRIPTION_SETUP.md
- [ ] Decide on payment provider (fake for testing, Stripe for production)
- [ ] Have PostgreSQL database ready

## Installation & Setup
- [ ] Run `npm install` to install dependencies
- [ ] Copy `.env.example` to `.env.local`
- [ ] Update `.env.local` with database URL and provider settings
- [ ] Run `npm run prisma:push` to sync database schema
- [ ] Run `npm run prisma:seed` to create default plans

## Verify Installation
- [ ] Check that `/api/subscription/plans` returns default plans
- [ ] Visit `/pricing` page in browser
- [ ] Verify authentication redirects work properly

## Customize for Your Project
- [ ] Create or modify plans in database for your use case
- [ ] Update PlanCard and SubscriptionStatus UI to match brand
- [ ] Customize `/pricing` page with your copy and branding
- [ ] Update dashboard route protection if needed

## Testing (with Fake Provider)
- [ ] Test signup flow
- [ ] Test free trial subscription
- [ ] Test active subscription access to dashboard
- [ ] Test subscription cancellation
- [ ] Test expired subscription redirect to pricing

## Production Setup (Stripe)
- [ ] Create Stripe account
- [ ] Create Stripe products and prices
- [ ] Get Stripe API keys
- [ ] Set up webhook endpoint in Stripe Dashboard
- [ ] Update `.env.local` with Stripe credentials
- [ ] Test Stripe Webhook locally (use `stripe listen`)
- [ ] Test full checkout flow
- [ ] Test webhook handling

## Deployment
- [ ] Add environment variables to production environment
- [ ] Run database migrations on production database
- [ ] Test payment flow on production
- [ ] Monitor webhook processing
- [ ] Set up alerts for subscription failures

## Ongoing
- [ ] Monitor subscription metrics
- [ ] Handle failed payments
- [ ] Regular backup of subscription data
- [ ] Update feature flags as business changes
- [ ] Monitor API usage

## Features to Consider Adding Later
- [ ] Payment method management
- [ ] Invoice history
- [ ] Plan upgrades/downgrades
- [ ] Proration for mid-cycle changes
- [ ] Annual vs. monthly pricing
- [ ] Multiple currencies support
- [ ] Admin dashboard for managing subscriptions
- [ ] Email notifications
- [ ] Refund processing
- [ ] Usage-based billing

## File Structure Review
Verify that these files exist:
- [ ] `src/lib/subscription/services.ts`
- [ ] `src/lib/subscription/types.ts`
- [ ] `src/lib/subscription/prisma.ts`
- [ ] `src/lib/subscription/providers/fake.ts`
- [ ] `src/lib/subscription/providers/stripe.ts`
- [ ] `src/app/api/subscription/subscribe/route.ts`
- [ ] `src/app/api/subscription/cancel/route.ts`
- [ ] `src/app/api/subscription/status/route.ts`
- [ ] `src/app/api/subscription/webhook/route.ts`
- [ ] `src/app/api/subscription/plans/route.ts`
- [ ] `src/components/subscription/PlanCard.tsx`
- [ ] `src/components/subscription/SubscriptionStatus.tsx`
- [ ] `src/hooks/subscription/useSubscription.ts`
- [ ] `src/hooks/subscription/useHasFeature.ts`
- [ ] `src/app/pricing/page.tsx`
- [ ] `src/middleware.ts`
- [ ] `prisma/schema.prisma`
- [ ] `prisma/seed.ts`
- [ ] `.env.example`
- [ ] `SUBSCRIPTION_SETUP.md`
