/**
 * Subscription Service
 * Handles all subscription and billing operations
 */

import { buildApiUrl, getAuthHeaders } from '@/core/api/api.config';
import type { SubscriptionTier, UsageLimits } from '@/core/config/subscription.config';
import { SUBSCRIPTION_TIERS, isLimitExceeded } from '@/core/config/subscription.config';
import { authService } from './auth.service';

export interface UserSubscription {
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  billingCycle: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  usage: UsageLimits;
}

export interface BillingInfo {
  customerId: string;
  paymentMethod?: {
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
  };
  nextInvoice?: {
    amount: number;
    date: string;
  };
  invoiceHistory: Array<{
    id: string;
    amount: number;
    status: string;
    date: string;
    invoiceUrl: string;
  }>;
}

class SubscriptionService {
  private baseUrl = buildApiUrl(''); // Use centralized API URL
  private serverAvailable: boolean | null = null; // null = unknown, true = available, false = unavailable

  /**
   * Check if the server is available
   */
  private async checkServerHealth(): Promise<boolean> {
    // Return cached result if we already checked
    if (this.serverAvailable !== null) {
      return this.serverAvailable;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout

      // Use the prefixed health route so it goes through the Vite proxy in dev
      // Registered at /api/v1/health/live (and also unprefixed), but proxy only forwards /api/*
      const healthUrl = buildApiUrl('health/live');

      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      this.serverAvailable = response.ok;
      return response.ok;
    } catch (error) {
      // Server not available - this is expected, don't log
      this.serverAvailable = false;
      return false;
    }
  }

  /**
   * Get current user's subscription
   */
  async getSubscription(accessToken: string): Promise<{ success: boolean; subscription?: UserSubscription; error?: string }> {
    // Return mock subscription data in demo mode
    const isDemoMode = authService.isDemoMode ? authService.isDemoMode() : false;
    if (isDemoMode) {
      console.log('[Subscription Service] DEMO MODE - Returning mock subscription data');
      const mockSubscription: UserSubscription = {
        userId: 'demo-user-123',
        tier: 'free',
        status: 'active',
        billingCycle: 'monthly',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        usage: {
          projects: 2,
          boards: 5,
          tasks: 20,
          aiChats: 100,
          workflows: 3,
          storage: 100,
        },
      };
      return { success: true, subscription: mockSubscription };
    }

    // Check if server is available first
    const serverReady = await this.checkServerHealth();
    if (!serverReady) {
      // Silently return error - server not deployed
      return { success: false, error: 'SERVER_NOT_AVAILABLE' };
    }

    try {
      const headers = await getAuthHeaders(accessToken);
      const response = await fetch(`${this.baseUrl}/subscription/current`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));

        // If unauthorized, clear cached session so we don't keep sending bad tokens
        if (response.status === 401) {
          localStorage.removeItem('flowversal_auth_session');
          return { success: false, error: 'UNAUTHORIZED' };
        }

        const backendUnavailable =
          response.status === 503 &&
          (data?.error === 'Backend server is not available' ||
            data?.message?.toLowerCase?.().includes('backend server is not available'));

        if (backendUnavailable) {
          this.serverAvailable = false;
          return { success: false, error: 'SERVER_NOT_AVAILABLE' };
        }

        return { success: false, error: data.error || `HTTP ${response.status}: Failed to fetch subscription` };
      }

      const data = await response.json();
      return { success: true, subscription: data.subscription };
    } catch (error: any) {
      // Server became unavailable after health check
      this.serverAvailable = false;
      return { success: false, error: 'SERVER_NOT_AVAILABLE' };
    }
  }

  /**
   * Create Stripe checkout session
   */
  async createCheckoutSession(
    accessToken: string,
    tier: SubscriptionTier,
    billingCycle: 'monthly' | 'yearly'
  ): Promise<{ success: boolean; sessionUrl?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/subscription/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ tier, billingCycle }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to create checkout session' };
      }

      return { success: true, sessionUrl: data.sessionUrl };
    } catch (error) {
      console.error('Create checkout session error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  /**
   * Create billing portal session
   */
  async createPortalSession(accessToken: string): Promise<{ success: boolean; portalUrl?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/subscription/portal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to create portal session' };
      }

      return { success: true, portalUrl: data.portalUrl };
    } catch (error) {
      console.error('Create portal session error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(accessToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to cancel subscription' };
      }

      return { success: true };
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  /**
   * Resume subscription
   */
  async resumeSubscription(accessToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/subscription/resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to resume subscription' };
      }

      return { success: true };
    } catch (error) {
      console.error('Resume subscription error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  /**
   * Get billing info
   */
  async getBillingInfo(accessToken: string): Promise<{ success: boolean; billing?: BillingInfo; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/subscription/billing`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch billing info' };
      }

      return { success: true, billing: data.billing };
    } catch (error) {
      console.error('Get billing info error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  /**
   * Update usage tracking
   */
  async updateUsage(
    accessToken: string,
    limitType: keyof UsageLimits,
    increment: number = 1
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/subscription/usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ limitType, increment }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to update usage' };
      }

      return { success: true };
    } catch (error) {
      console.error('Update usage error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  /**
   * Check if user can perform action based on limits
   */
  async canPerformAction(
    accessToken: string,
    limitType: keyof UsageLimits
  ): Promise<{ success: boolean; allowed: boolean; error?: string }> {
    try {
      const subResult = await this.getSubscription(accessToken);
      
      if (!subResult.success || !subResult.subscription) {
        return { success: false, allowed: false, error: subResult.error };
      }

      const { tier, usage } = subResult.subscription;
      const currentUsage = usage[limitType];
      const exceeded = isLimitExceeded(tier, limitType, currentUsage);

      return { success: true, allowed: !exceeded };
    } catch (error) {
      console.error('Can perform action error:', error);
      return { success: false, allowed: false, error: 'Network error' };
    }
  }

  /**
   * Get default subscription for new users
   */
  getDefaultSubscription(userId: string): UserSubscription {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return {
      userId,
      tier: 'free',
      status: 'active',
      billingCycle: 'monthly',
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: nextMonth.toISOString(),
      cancelAtPeriodEnd: false,
      usage: {
        workflows: 0,
        executions: 0,
        storage: 0,
        apiCalls: 0,
        collaborators: 0,
        templates: 0,
        formSubmissions: 0,
        webhooks: 0,
      },
    };
  }

  /**
   * Format price for display
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  }

  /**
   * Get tier name with emoji
   */
  getTierDisplay(tier: SubscriptionTier): string {
    const emojis = {
      free: '🆓',
      pro: '⭐',
      enterprise: '🚀',
    };
    
    return `${emojis[tier]} ${SUBSCRIPTION_TIERS[tier].name}`;
  }
}

export const subscriptionService = new SubscriptionService();