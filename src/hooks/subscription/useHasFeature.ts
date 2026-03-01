'use client';

import { useMemo, useCallback, useState } from 'react';

type SubscriptionData = {
  status: string;
  subscription?: {
    plan: {
      features: string[];
    };
  };
};

// Hook to check if user has feature access based on subscription
export function useHasFeature(features: string[] | string) {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  const featureList = useMemo(() => Array.isArray(features) ? features : [features], [features]);

  const hasFeature = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/subscription/status?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch subscription');
      const data = await response.json();
      setSubscriptionData(data);
      
      // Check if user has any of the required features
      if (data.status === 'active' || data.status === 'trial') {
        if (!data.subscription?.plan?.features) return true; // Free plan with all features
        const userFeatures = data.subscription.plan.features;
        return featureList.some(f => userFeatures.includes(f));
      }
      return false;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [featureList]);

  return { hasFeature, loading, subscriptionData };
}

export default useHasFeature;
