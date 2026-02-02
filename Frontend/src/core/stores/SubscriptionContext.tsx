/**
 * Subscription Context
 * Provides subscription state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/core/auth/AuthContext';
import { subscriptionService, type UserSubscription } from '@/core/api/services/subscription.service';
import type { SubscriptionTier } from '../config/subscription.config';
import { isLimitExceeded } from '../config/subscription.config';

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  isLoading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  createCheckout: (tier: SubscriptionTier, billingCycle: 'monthly' | 'yearly') => Promise<void>;
  openBillingPortal: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  resumeSubscription: () => Promise<void>;
  canPerformAction: (limitType: keyof UserSubscription['usage']) => boolean;
  updateUsage: (limitType: keyof UserSubscription['usage'], increment?: number) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSubscription = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const accessToken = localStorage.getItem('flowversal_auth_session');
      if (!accessToken) {
        // No token, use default subscription
        setSubscription(subscriptionService.getDefaultSubscription(user.id));
        setIsLoading(false);
        return;
      }

      const session = JSON.parse(accessToken);
      const result = await subscriptionService.getSubscription(session.accessToken);

      if (result.success && result.subscription) {
        setSubscription(result.subscription);
      } else {
        // Only log if it's not a "server not available" error
        if (result.error !== 'SERVER_NOT_AVAILABLE' && result.error !== 'UNAUTHORIZED') {
          console.warn('Subscription fetch failed, using default:', result.error);
        }
        // Clear bad session on unauthorized so we don't spam 401s
        if (result.error === 'UNAUTHORIZED') {
          localStorage.removeItem('flowversal_auth_session');
        }
        // Set default free subscription (server might not be deployed)
        setSubscription(subscriptionService.getDefaultSubscription(user.id));
      }
    } catch (err: any) {
      // Only log unexpected errors
      console.error('Unexpected subscription error:', err.message);
      // Set default free subscription on error (graceful degradation)
      if (user) {
        setSubscription(subscriptionService.getDefaultSubscription(user.id));
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Load subscription on auth change
  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  const createCheckout = useCallback(async (tier: SubscriptionTier, billingCycle: 'monthly' | 'yearly') => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      setError(null);

      const accessToken = localStorage.getItem('flowversal_auth_session');
      if (!accessToken) {
        throw new Error('No access token');
      }

      const session = JSON.parse(accessToken);
      const result = await subscriptionService.createCheckoutSession(
        session.accessToken,
        tier,
        billingCycle
      );

      if (result.success && result.sessionUrl) {
        // Redirect to Stripe checkout
        window.location.href = result.sessionUrl;
      } else {
        throw new Error(result.error || 'Failed to create checkout session');
      }
    } catch (err: any) {
      console.error('Create checkout error:', err);
      setError(err.message);
      throw err;
    }
  }, [isAuthenticated]);

  const openBillingPortal = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      setError(null);

      const accessToken = localStorage.getItem('flowversal_auth_session');
      if (!accessToken) {
        throw new Error('No access token');
      }

      const session = JSON.parse(accessToken);
      const result = await subscriptionService.createPortalSession(session.accessToken);

      if (result.success && result.portalUrl) {
        // Open billing portal in new tab
        window.open(result.portalUrl, '_blank');
      } else {
        throw new Error(result.error || 'Failed to open billing portal');
      }
    } catch (err: any) {
      console.error('Open billing portal error:', err);
      setError(err.message);
      throw err;
    }
  }, [isAuthenticated]);

  const cancelSubscription = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      setError(null);

      const accessToken = localStorage.getItem('flowversal_auth_session');
      if (!accessToken) {
        throw new Error('No access token');
      }

      const session = JSON.parse(accessToken);
      const result = await subscriptionService.cancelSubscription(session.accessToken);

      if (result.success) {
        await refreshSubscription();
      } else {
        throw new Error(result.error || 'Failed to cancel subscription');
      }
    } catch (err: any) {
      console.error('Cancel subscription error:', err);
      setError(err.message);
      throw err;
    }
  }, [isAuthenticated, refreshSubscription]);

  const resumeSubscription = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      setError(null);

      const accessToken = localStorage.getItem('flowversal_auth_session');
      if (!accessToken) {
        throw new Error('No access token');
      }

      const session = JSON.parse(accessToken);
      const result = await subscriptionService.resumeSubscription(session.accessToken);

      if (result.success) {
        await refreshSubscription();
      } else {
        throw new Error(result.error || 'Failed to resume subscription');
      }
    } catch (err: any) {
      console.error('Resume subscription error:', err);
      setError(err.message);
      throw err;
    }
  }, [isAuthenticated, refreshSubscription]);

  const canPerformAction = useCallback((limitType: keyof UserSubscription['usage']): boolean => {
    if (!subscription) return false;

    const currentUsage = subscription.usage[limitType];
    const tier = subscription.tier;

    // Import directly
    const exceeded = isLimitExceeded(tier, limitType, currentUsage);

    return !exceeded;
  }, [subscription]);

  const updateUsage = useCallback(async (
    limitType: keyof UserSubscription['usage'],
    increment: number = 1
  ) => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      const accessToken = localStorage.getItem('flowversal_auth_session');
      if (!accessToken) {
        throw new Error('No access token');
      }

      const session = JSON.parse(accessToken);
      const result = await subscriptionService.updateUsage(
        session.accessToken,
        limitType,
        increment
      );

      if (result.success) {
        // Update local state
        if (subscription) {
          setSubscription({
            ...subscription,
            usage: {
              ...subscription.usage,
              [limitType]: subscription.usage[limitType] + increment,
            },
          });
        }
      }
    } catch (err: any) {
      console.error('Update usage error:', err);
      // Don't throw - usage tracking is non-critical
    }
  }, [isAuthenticated, subscription]);

  const value: SubscriptionContextType = {
    subscription,
    isLoading,
    error,
    refreshSubscription,
    createCheckout,
    openBillingPortal,
    cancelSubscription,
    resumeSubscription,
    canPerformAction,
    updateUsage,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}