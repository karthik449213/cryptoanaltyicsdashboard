'use client';

import { useState, useCallback } from 'react';

export function useSubscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = useCallback(
    async (userId: string, planId: string, trial: boolean = false) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/subscription/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, planId, trial }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to subscribe');
        }

        return await response.json();
      } catch (err: any) {
        const message = err.message || 'An error occurred';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const cancel = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel');
      }

      return await response.json();
    } catch (err: any) {
      const message = err.message || 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStatus = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/subscription/status?userId=${userId}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch status');
      }

      return await response.json();
    } catch (err: any) {
      const message = err.message || 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { subscribe, cancel, getStatus, loading, error };
}

export default useSubscription;
