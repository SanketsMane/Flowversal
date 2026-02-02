/**
 * Subscription Configuration
 * Defines pricing tiers, features, and usage limits
 */

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface UsageLimits {
  workflows: number; // Max workflows
  executions: number; // Executions per month
  storage: number; // Storage in MB
  apiCalls: number; // API calls per month
  collaborators: number; // Team members
  templates: number; // Custom templates
  formSubmissions: number; // Form submissions per month
  webhooks: number; // Active webhooks
}

export interface SubscriptionFeatures {
  tier: SubscriptionTier;
  name: string;
  price: number; // Monthly price in USD
  yearlyPrice: number; // Yearly price in USD (with discount)
  stripePriceId: string; // Stripe Price ID for monthly
  stripeYearlyPriceId: string; // Stripe Price ID for yearly
  popular?: boolean;
  description: string;
  limits: UsageLimits;
  features: string[];
  integrations: {
    basic: boolean; // Basic integrations (email, webhooks)
    premium: boolean; // Premium integrations (Slack, Notion, etc.)
    custom: boolean; // Custom API integrations
  };
  support: {
    email: boolean;
    priority: boolean;
    phone: boolean;
    dedicated: boolean;
  };
  analytics: {
    basic: boolean;
    advanced: boolean;
    custom: boolean;
  };
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionFeatures> = {
  free: {
    tier: 'free',
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    stripePriceId: '', // No Stripe for free tier
    stripeYearlyPriceId: '',
    description: 'Perfect for trying out Flowversal and small projects',
    limits: {
      workflows: 3,
      executions: 100,
      storage: 100, // 100 MB
      apiCalls: 1000,
      collaborators: 1,
      templates: 5,
      formSubmissions: 50,
      webhooks: 2,
    },
    features: [
      '3 active workflows',
      '100 executions/month',
      '100 MB storage',
      'Access to template library',
      'Basic integrations',
      'Community support',
      'Email notifications',
      'Basic analytics',
    ],
    integrations: {
      basic: true,
      premium: false,
      custom: false,
    },
    support: {
      email: true,
      priority: false,
      phone: false,
      dedicated: false,
    },
    analytics: {
      basic: true,
      advanced: false,
      custom: false,
    },
  },
  
  pro: {
    tier: 'pro',
    name: 'Pro',
    price: 29,
    yearlyPrice: 290, // ~17% discount ($24.16/month)
    stripePriceId: 'price_pro_monthly', // Replace with actual Stripe Price ID
    stripeYearlyPriceId: 'price_pro_yearly', // Replace with actual Stripe Price ID
    popular: true,
    description: 'For professionals and growing teams',
    limits: {
      workflows: 50,
      executions: 10000,
      storage: 10000, // 10 GB
      apiCalls: 100000,
      collaborators: 5,
      templates: 100,
      formSubmissions: 5000,
      webhooks: 25,
    },
    features: [
      '50 active workflows',
      '10,000 executions/month',
      '10 GB storage',
      'Unlimited templates',
      'Premium integrations',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
      'API access',
      'Webhook automation',
      'Team collaboration (5 members)',
      'Version history',
    ],
    integrations: {
      basic: true,
      premium: true,
      custom: false,
    },
    support: {
      email: true,
      priority: true,
      phone: false,
      dedicated: false,
    },
    analytics: {
      basic: true,
      advanced: true,
      custom: false,
    },
  },
  
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    price: 99,
    yearlyPrice: 990, // ~17% discount ($82.50/month)
    stripePriceId: 'price_enterprise_monthly', // Replace with actual Stripe Price ID
    stripeYearlyPriceId: 'price_enterprise_yearly', // Replace with actual Stripe Price ID
    description: 'For large teams and organizations',
    limits: {
      workflows: -1, // Unlimited
      executions: -1, // Unlimited
      storage: -1, // Unlimited
      apiCalls: -1, // Unlimited
      collaborators: -1, // Unlimited
      templates: -1, // Unlimited
      formSubmissions: -1, // Unlimited
      webhooks: -1, // Unlimited
    },
    features: [
      'Unlimited workflows',
      'Unlimited executions',
      'Unlimited storage',
      'All integrations',
      'Custom integrations',
      'Dedicated support',
      'Phone support',
      'Custom analytics',
      'SLA guarantee',
      'On-premise deployment option',
      'Unlimited team members',
      'Advanced security',
      'Audit logs',
      'SSO/SAML',
      'Custom contracts',
    ],
    integrations: {
      basic: true,
      premium: true,
      custom: true,
    },
    support: {
      email: true,
      priority: true,
      phone: true,
      dedicated: true,
    },
    analytics: {
      basic: true,
      advanced: true,
      custom: true,
    },
  },
};

/**
 * Check if a feature is available for a tier
 */
export function hasFeature(tier: SubscriptionTier, feature: string): boolean {
  const tierConfig = SUBSCRIPTION_TIERS[tier];
  return tierConfig.features.includes(feature);
}

/**
 * Check if a limit is exceeded
 */
export function isLimitExceeded(
  tier: SubscriptionTier,
  limitType: keyof UsageLimits,
  currentUsage: number
): boolean {
  const limit = SUBSCRIPTION_TIERS[tier].limits[limitType];
  
  // -1 means unlimited
  if (limit === -1) return false;
  
  return currentUsage >= limit;
}

/**
 * Get usage percentage
 */
export function getUsagePercentage(
  tier: SubscriptionTier,
  limitType: keyof UsageLimits,
  currentUsage: number
): number {
  const limit = SUBSCRIPTION_TIERS[tier].limits[limitType];
  
  // Unlimited
  if (limit === -1) return 0;
  
  // No limit
  if (limit === 0) return 100;
  
  return Math.min(100, (currentUsage / limit) * 100);
}

/**
 * Calculate yearly savings
 */
export function getYearlySavings(tier: SubscriptionTier): number {
  const config = SUBSCRIPTION_TIERS[tier];
  const monthlyTotal = config.price * 12;
  return monthlyTotal - config.yearlyPrice;
}

/**
 * Get tier comparison
 */
export function compareTiers(currentTier: SubscriptionTier, targetTier: SubscriptionTier): {
  isUpgrade: boolean;
  isDowngrade: boolean;
  priceDifference: number;
} {
  const tiers: SubscriptionTier[] = ['free', 'pro', 'enterprise'];
  const currentIndex = tiers.indexOf(currentTier);
  const targetIndex = tiers.indexOf(targetTier);
  
  const currentPrice = SUBSCRIPTION_TIERS[currentTier].price;
  const targetPrice = SUBSCRIPTION_TIERS[targetTier].price;
  
  return {
    isUpgrade: targetIndex > currentIndex,
    isDowngrade: targetIndex < currentIndex,
    priceDifference: targetPrice - currentPrice,
  };
}

/**
 * Stripe publishable key (from environment)
 */
export const STRIPE_PUBLISHABLE_KEY = typeof import.meta !== 'undefined' 
  ? (import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY || '') 
  : '';

/**
 * Stripe configuration
 */
export const STRIPE_CONFIG = {
  successUrl: typeof window !== 'undefined' 
    ? `${window.location.origin}/app?checkout=success`
    : '/app?checkout=success',
  cancelUrl: typeof window !== 'undefined'
    ? `${window.location.origin}/app?checkout=cancel`
    : '/app?checkout=cancel',
  billingPortalUrl: '/app/billing',
};