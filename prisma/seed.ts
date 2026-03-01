import { prisma } from '../src/lib/subscription/prisma';

async function main() {
  console.log('Seeding database...');

  // Create default plans
  const basicPlan = await prisma.plan.upsert({
    where: { id: 'plan_basic' },
    update: {},
    create: {
      id: 'plan_basic',
      name: 'Basic',
      price: 999, // $9.99 in cents
      interval: 'monthly',
      features: ['Real-time price tracking', 'Basic portfolio tracking', 'Email alerts', '5 custom alerts'],
      isActive: true,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { id: 'plan_pro' },
    update: {},
    create: {
      id: 'plan_pro',
      name: 'Pro',
      price: 2999, // $29.99 in cents
      interval: 'monthly',
      features: [
        'All Basic features',
        'Advanced analytics',
        'Advanced portfolio tracking',
        'Unlimited alerts',
        'API access',
        'Priority support',
      ],
      isActive: true,
    },
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { id: 'plan_enterprise' },
    update: {},
    create: {
      id: 'plan_enterprise',
      name: 'Enterprise',
      price: 9999, // $99.99 in cents
      interval: 'monthly',
      features: [
        'All Pro features',
        'Custom integrations',
        'Dedicated account manager',
        'Custom reporting',
        'SLA guarantee',
        '24/7 phone support',
      ],
      isActive: true,
    },
  });

  console.log('✅ Seeded plans:');
  console.log(`  - Basic: $${(basicPlan.price / 100).toFixed(2)}/${basicPlan.interval}`);
  console.log(`  - Pro: $${(proPlan.price / 100).toFixed(2)}/${proPlan.interval}`);
  console.log(`  - Enterprise: $${(enterprisePlan.price / 100).toFixed(2)}/${enterprisePlan.interval}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
