'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlanCard, SubscriptionStatus } from '@/components/subscription';
import { useSubscription } from '@/hooks/subscription';
import { getCurrentUser } from '@/lib/auth/service';

type Plan = {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  isActive: boolean;
};

export default function PricingPage() {
  const router = useRouter();
  const { subscribe, loading, error: subscriptionError } = useSubscription();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading_plans, setLoadingPlans] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const user = await getCurrentUser();
        setCurrentUser(user);

        // Fetch plans
        const plansRes = await fetch('/api/subscription/plans');
        if (plansRes.ok) {
          const plansData = await plansRes.json();
          setPlans(plansData);
        }

        // Fetch current subscription status
        if (user) {
          const statusRes = await fetch(`/api/subscription/status?userId=${user.id}`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            setSubscriptionStatus(statusData);
          }
        }
      } catch (err) {
        console.error('Failed to fetch pricing data:', err);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchData();
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      setSelectedPlanId(planId);
      const result = await subscribe(currentUser.id, planId, false);
      
      // Subscription successful, redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Subscription failed:', err);
      setSelectedPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Crypto Analytics Plans</h1>
          <p className="text-zinc-400 text-lg">Choose the perfect plan for your trading needs</p>
        </div>

        {/* Current Subscription Status */}
        {currentUser && subscriptionStatus && (
          <div className="mb-12 text-center">
            <SubscriptionStatus
              status={subscriptionStatus.status}
              planName={subscriptionStatus.subscription?.plan?.name}
              endsAt={subscriptionStatus.subscription?.currentPeriodEnd}
            />
          </div>
        )}

        {/* Error Message */}
        {subscriptionError && (
          <div className="mb-8 p-4 bg-red-900 text-red-100 rounded-lg border border-red-700">
            {subscriptionError}
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {loading_plans ? (
            <div className="col-span-full text-center text-zinc-400">Loading plans...</div>
          ) : plans.length > 0 ? (
            plans.map((plan) => (
              <PlanCard
                key={plan.id}
                id={plan.id}
                name={plan.name}
                price={plan.price}
                interval={plan.interval}
                features={Array.isArray(plan.features) ? plan.features : []}
                onSubscribe={handleSubscribe}
                isLoading={loading && selectedPlanId === plan.id}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-zinc-400">
              No plans available. Please check back soon.
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center text-zinc-400 text-sm">
          <p>All plans include a 7-day free trial. Cancel anytime with no penalties.</p>
          {currentUser ? (
            <p>Logged in as: <span className="text-zinc-200">{currentUser.email}</span></p>
          ) : (
            <p className="mt-2">
              <button onClick={() => router.push('/login')} className="text-blue-400 hover:text-blue-300">
                Log in
              </button>
              {' '}or{' '}
              <button onClick={() => router.push('/signup')} className="text-blue-400 hover:text-blue-300">
                sign up
              </button>
              {' '}to subscribe
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
