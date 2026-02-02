/**
 * Subscription Management Page
 * Admin view for managing subscriptions and billing
 */

import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { useSubscription } from '../../../contexts/SubscriptionContext';
import { SUBSCRIPTION_TIERS, getUsagePercentage, getYearlySavings } from '../../../config/subscription.config';
import type { SubscriptionTier } from '../../../config/subscription.config';
import { 
  Check, 
  X, 
  Zap, 
  TrendingUp, 
  Users, 
  Database, 
  Activity,
  CreditCard,
  Calendar,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const SubscriptionManagement: React.FC = () => {
  const { subscription, isLoading, createCheckout, openBillingPortal, cancelSubscription, resumeSubscription } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (tier === 'free') return;
    
    try {
      setSelectedTier(tier);
      await createCheckout(tier, billingCycle);
    } catch (error) {
      console.error('Upgrade error:', error);
      setSelectedTier(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      await openBillingPortal();
    } catch (error) {
      console.error('Billing portal error:', error);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    try {
      await cancelSubscription();
      alert('Subscription canceled. You will retain access until the end of your billing period.');
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel subscription');
    }
  };

  const handleResumeSubscription = async () => {
    try {
      await resumeSubscription();
      alert('Subscription resumed successfully!');
    } catch (error) {
      console.error('Resume error:', error);
      alert('Failed to resume subscription');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0E0E1F]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0E1F] text-white p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl mb-2 bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
          Subscription Management
        </h1>
        <p className="text-gray-400">Manage your billing, view usage, and upgrade your plan</p>
      </div>

      {/* Current Subscription Status */}
      {subscription && (
        <div className="max-w-7xl mx-auto mb-8">
          <Card className="bg-[#1A1A2E] border-white/10 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl">Current Plan</h2>
                  <Badge className={`
                    ${subscription.tier === 'free' ? 'bg-gray-500' : ''}
                    ${subscription.tier === 'pro' ? 'bg-gradient-to-r from-blue-500 to-violet-500' : ''}
                    ${subscription.tier === 'enterprise' ? 'bg-gradient-to-r from-violet-500 to-cyan-500' : ''}
                  `}>
                    {SUBSCRIPTION_TIERS[subscription.tier].name}
                  </Badge>
                  {subscription.status === 'active' && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                  {subscription.cancelAtPeriodEnd && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Canceling
                    </Badge>
                  )}
                </div>
                <p className="text-gray-400">
                  {subscription.tier === 'free' 
                    ? 'Free forever, upgrade anytime'
                    : `${subscription.billingCycle === 'yearly' ? 'Billed annually' : 'Billed monthly'}`
                  }
                </p>
                {subscription.tier !== 'free' && (
                  <p className="text-sm text-gray-500 mt-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              {subscription.tier !== 'free' && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleManageBilling}
                    variant="outline"
                    className="border-white/20 hover:bg-white/10"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Billing
                  </Button>
                  {!subscription.cancelAtPeriodEnd ? (
                    <Button
                      onClick={handleCancelSubscription}
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      Cancel Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={handleResumeSubscription}
                      variant="outline"
                      className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                    >
                      Resume Plan
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Usage Stats */}
            {subscription.tier !== 'enterprise' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <UsageCard
                  label="Workflows"
                  current={subscription.usage.workflows}
                  limit={SUBSCRIPTION_TIERS[subscription.tier].limits.workflows}
                  icon={<Zap className="w-4 h-4" />}
                />
                <UsageCard
                  label="Executions"
                  current={subscription.usage.executions}
                  limit={SUBSCRIPTION_TIERS[subscription.tier].limits.executions}
                  icon={<Activity className="w-4 h-4" />}
                  suffix="/month"
                />
                <UsageCard
                  label="Storage"
                  current={subscription.usage.storage}
                  limit={SUBSCRIPTION_TIERS[subscription.tier].limits.storage}
                  icon={<Database className="w-4 h-4" />}
                  suffix="MB"
                />
                <UsageCard
                  label="Collaborators"
                  current={subscription.usage.collaborators}
                  limit={SUBSCRIPTION_TIERS[subscription.tier].limits.collaborators}
                  icon={<Users className="w-4 h-4" />}
                />
              </div>
            )}

            {subscription.tier === 'enterprise' && (
              <div className="bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  <div>
                    <h3 className="font-semibold text-violet-400">Unlimited Everything</h3>
                    <p className="text-sm text-gray-400">Your enterprise plan includes unlimited access to all features</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Billing Cycle Toggle */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg transition-all ${
              billingCycle === 'monthly'
                ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-lg transition-all ${
              billingCycle === 'yearly'
                ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Yearly
            <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">
              Save 17%
            </Badge>
          </button>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(SUBSCRIPTION_TIERS).map((tier) => {
            const isCurrentTier = subscription?.tier === tier.tier;
            const price = billingCycle === 'yearly' ? tier.yearlyPrice : tier.price;
            const displayPrice = billingCycle === 'yearly' ? price / 12 : price;
            const savings = getYearlySavings(tier.tier);

            return (
              <Card
                key={tier.tier}
                className={`
                  bg-[#1A1A2E] border-white/10 p-6 relative overflow-hidden
                  ${tier.popular ? 'ring-2 ring-violet-500' : ''}
                  ${isCurrentTier ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-xs px-3 py-1 rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}
                
                {isCurrentTier && (
                  <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-br-lg">
                    CURRENT PLAN
                  </div>
                )}

                <div className="mb-6 mt-2">
                  <h3 className="text-2xl mb-2">{tier.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{tier.description}</p>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl">
                      ${displayPrice.toFixed(tier.tier === 'free' ? 0 : 2)}
                    </span>
                    <span className="text-gray-400">
                      {tier.tier === 'free' ? '' : '/month'}
                    </span>
                  </div>
                  
                  {billingCycle === 'yearly' && tier.tier !== 'free' && (
                    <p className="text-sm text-green-400 mt-1">
                      Save ${savings.toFixed(0)}/year
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => handleUpgrade(tier.tier)}
                  disabled={isCurrentTier || selectedTier === tier.tier}
                  className={`
                    w-full mb-6
                    ${tier.popular ? 'bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-90' : ''}
                    ${!tier.popular && !isCurrentTier ? 'bg-white/10 hover:bg-white/20' : ''}
                  `}
                >
                  {isCurrentTier ? 'Current Plan' : selectedTier === tier.tier ? 'Processing...' : tier.tier === 'free' ? 'Free Forever' : 'Upgrade Now'}
                </Button>

                <div className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {tier.tier === 'enterprise' && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <Button
                      variant="outline"
                      className="w-full border-white/20 hover:bg-white/10"
                      onClick={() => window.open('mailto:info@flowversal.com?subject=Enterprise Plan Inquiry', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Contact Sales
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="max-w-7xl mx-auto mt-12">
        <h2 className="text-2xl mb-6 text-center">Feature Comparison</h2>
        <Card className="bg-[#1A1A2E] border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-gray-400">Feature</th>
                  <th className="text-center p-4">Free</th>
                  <th className="text-center p-4">Pro</th>
                  <th className="text-center p-4">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <FeatureRow feature="Active Workflows" free="3" pro="50" enterprise="Unlimited" />
                <FeatureRow feature="Executions/month" free="100" pro="10,000" enterprise="Unlimited" />
                <FeatureRow feature="Storage" free="100 MB" pro="10 GB" enterprise="Unlimited" />
                <FeatureRow feature="Team Members" free="1" pro="5" enterprise="Unlimited" />
                <FeatureRow feature="Premium Integrations" free={false} pro={true} enterprise={true} />
                <FeatureRow feature="Priority Support" free={false} pro={true} enterprise={true} />
                <FeatureRow feature="Phone Support" free={false} pro={false} enterprise={true} />
                <FeatureRow feature="Custom Integrations" free={false} pro={false} enterprise={true} />
                <FeatureRow feature="SSO/SAML" free={false} pro={false} enterprise={true} />
                <FeatureRow feature="SLA Guarantee" free={false} pro={false} enterprise={true} />
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Usage Card Component
const UsageCard: React.FC<{
  label: string;
  current: number;
  limit: number;
  icon: React.ReactNode;
  suffix?: string;
}> = ({ label, current, limit, icon, suffix = '' }) => {
  const percentage = limit === -1 ? 0 : Math.min(100, (current / limit) * 100);
  const isNearLimit = percentage > 80 && limit !== -1;
  
  return (
    <div className="bg-white/5 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-gray-400">
          {icon}
          <span className="text-sm">{label}</span>
        </div>
        <span className={`text-xs ${isNearLimit ? 'text-yellow-400' : 'text-gray-500'}`}>
          {current}/{limit === -1 ? '∞' : limit}{suffix}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={`h-2 ${isNearLimit ? 'bg-yellow-500/20' : ''}`}
      />
    </div>
  );
};

// Feature Row Component
const FeatureRow: React.FC<{
  feature: string;
  free: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}> = ({ feature, free, pro, enterprise }) => {
  const renderCell = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-400 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-gray-600 mx-auto" />
      );
    }
    return <span className="text-gray-300">{value}</span>;
  };

  return (
    <tr className="border-b border-white/5 hover:bg-white/5">
      <td className="p-4 text-gray-300">{feature}</td>
      <td className="p-4 text-center">{renderCell(free)}</td>
      <td className="p-4 text-center">{renderCell(pro)}</td>
      <td className="p-4 text-center">{renderCell(enterprise)}</td>
    </tr>
  );
};
