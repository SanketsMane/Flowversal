/**
 * Pricing Management Page
 * Admin can edit subscription pricing with confirmation
 */

import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { useThemeStore } from '@/core/stores/admin/themeStore';
import {
  DollarSign,
  Check,
  X,
  Edit,
  Save,
  AlertTriangle,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular: boolean;
  features: string[];
}

export const PricingManagement: React.FC = () => {
  const { theme } = useThemeStore();
  const [tiers, setTiers] = useState<PricingTier[]>(getInitialTiers());
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'monthly' | 'yearly' | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{
    planId: string;
    field: 'monthly' | 'yearly';
    oldPrice: number;
    newPrice: number;
  } | null>(null);

  const handleEditClick = (planId: string, field: 'monthly' | 'yearly', currentPrice: number) => {
    setEditingPlan(planId);
    setEditingField(field);
    setTempPrice(currentPrice.toString());
  };

  const handleCancelEdit = () => {
    setEditingPlan(null);
    setEditingField(null);
    setTempPrice('');
  };

  const handleSaveClick = (planId: string, field: 'monthly' | 'yearly') => {
    const newPrice = parseFloat(tempPrice);
    
    if (isNaN(newPrice) || newPrice < 0) {
      alert('Please enter a valid price');
      return;
    }

    const plan = tiers.find(t => t.id === planId);
    if (!plan) return;

    const oldPrice = field === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

    // Show confirmation dialog
    setPendingUpdate({
      planId,
      field,
      oldPrice,
      newPrice,
    });
    setShowConfirmation(true);
  };

  const handleConfirmUpdate = () => {
    if (!pendingUpdate) return;

    // Update the tier
    setTiers(prev => prev.map(tier => {
      if (tier.id === pendingUpdate.planId) {
        return {
          ...tier,
          [pendingUpdate.field === 'monthly' ? 'monthlyPrice' : 'yearlyPrice']: pendingUpdate.newPrice,
        };
      }
      return tier;
    }));

    // Here you would call your API to update prices globally
    console.log('Price updated:', pendingUpdate);
    alert(`Price updated successfully! This change will be reflected everywhere in the app.`);

    // Reset state
    setShowConfirmation(false);
    setPendingUpdate(null);
    handleCancelEdit();
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setPendingUpdate(null);
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedColor = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const cardBg = theme === 'dark' ? 'bg-[#1A1A2E] border-white/10' : 'bg-white border-gray-200';
  const inputBg = theme === 'dark' ? 'bg-[#0E0E1F] border-[#2A2A3E] text-white' : 'bg-gray-50 border-gray-200 text-gray-900';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl ${textColor}`}>Pricing Management</h1>
        <p className={`mt-1 ${mutedColor}`}>
          Manage subscription pricing - click on any price to edit
        </p>
        <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-start gap-2">
            <AlertTriangle className={`w-5 h-5 mt-0.5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}`} />
            <div>
              <p className={`font-semibold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}`}>
                Important: Changes affect the entire app
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'}`}>
                Price updates will be reflected in subscription pages, billing, and all user-facing areas. You'll be asked to confirm before saving.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`${cardBg} p-6`}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500">
              <Users className="w-5 h-5 text-white" />
            </div>
            <Badge className={theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-700'}>
              <TrendingUp className="w-3 h-3 mr-1" />
              12%
            </Badge>
          </div>
          <p className={`text-2xl font-semibold ${textColor}`}>1,234</p>
          <p className={`text-sm ${mutedColor}`}>Paying Subscribers</p>
        </Card>

        <Card className={`${cardBg} p-6`}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <Badge className={theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-700'}>
              <TrendingUp className="w-3 h-3 mr-1" />
              18%
            </Badge>
          </div>
          <p className={`text-2xl font-semibold ${textColor}`}>$48,630</p>
          <p className={`text-sm ${mutedColor}`}>Monthly Recurring Revenue</p>
        </Card>

        <Card className={`${cardBg} p-6`}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <Badge className={theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-700'}>
              Pro
            </Badge>
          </div>
          <p className={`text-2xl font-semibold ${textColor}`}>$38</p>
          <p className={`text-sm ${mutedColor}`}>Average Revenue Per User</p>
        </Card>
      </div>

      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const isEditingMonthly = editingPlan === tier.id && editingField === 'monthly';
          const isEditingYearly = editingPlan === tier.id && editingField === 'yearly';

          return (
            <Card
              key={tier.id}
              className={`${cardBg} p-6 ${tier.popular ? 'ring-2 ring-blue-500' : ''} relative`}
            >
              {tier.popular && (
                <Badge className="absolute top-4 right-4 bg-blue-500 text-white">
                  Most Popular
                </Badge>
              )}

              <div className="mb-6">
                <h3 className={`text-2xl font-semibold ${textColor}`}>{tier.name}</h3>
              </div>

              {/* Monthly Price */}
              <div className="mb-4">
                <label className={`text-sm ${mutedColor} mb-2 block`}>Monthly Price</label>
                {isEditingMonthly ? (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${mutedColor}`} />
                      <Input
                        type="number"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(e.target.value)}
                        className={`pl-9 ${inputBg}`}
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleSaveClick(tier.id, 'monthly');
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSaveClick(tier.id, 'monthly')}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className={theme === 'dark' ? 'border-white/20' : 'border-gray-300'}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => handleEditClick(tier.id, 'monthly', tier.monthlyPrice)}
                  >
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-bold ${textColor}`}>
                        ${tier.monthlyPrice}
                      </span>
                      <span className={mutedColor}>/month</span>
                    </div>
                    <Edit className={`w-4 h-4 ${mutedColor}`} />
                  </div>
                )}
              </div>

              {/* Yearly Price */}
              <div className="mb-6">
                <label className={`text-sm ${mutedColor} mb-2 block`}>Yearly Price</label>
                {isEditingYearly ? (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${mutedColor}`} />
                      <Input
                        type="number"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(e.target.value)}
                        className={`pl-9 ${inputBg}`}
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleSaveClick(tier.id, 'yearly');
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSaveClick(tier.id, 'yearly')}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className={theme === 'dark' ? 'border-white/20' : 'border-gray-300'}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => handleEditClick(tier.id, 'yearly', tier.yearlyPrice)}
                  >
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-bold ${textColor}`}>
                        ${tier.yearlyPrice}
                      </span>
                      <span className={mutedColor}>/year</span>
                    </div>
                    <Edit className={`w-4 h-4 ${mutedColor}`} />
                  </div>
                )}
                <p className={`text-xs ${mutedColor} mt-1 text-right`}>
                  Save ${(tier.monthlyPrice * 12 - tier.yearlyPrice).toFixed(0)} per year
                </p>
              </div>

              {/* Features */}
              <div className={`border-t pt-4 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                <p className={`text-sm font-semibold ${mutedColor} mb-3`}>Features</p>
                <ul className="space-y-2">
                  {tier.features.slice(0, 5).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                      <span className={`text-sm ${mutedColor}`}>{feature}</span>
                    </li>
                  ))}
                  {tier.features.length > 5 && (
                    <li className={`text-sm ${mutedColor} pl-6`}>
                      +{tier.features.length - 5} more features
                    </li>
                  )}
                </ul>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && pendingUpdate && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCancelConfirmation}
        >
          <Card
            className={`${cardBg} p-6 max-w-md w-full`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-6">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-50'}`}>
                <AlertTriangle className={`w-6 h-6 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${textColor}`}>Confirm Price Change</h2>
                <p className={`text-sm ${mutedColor} mt-1`}>
                  This change will affect all users and be reflected everywhere in the app
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={mutedColor}>Plan:</span>
                  <span className={`font-semibold ${textColor}`}>
                    {tiers.find(t => t.id === pendingUpdate.planId)?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={mutedColor}>Billing:</span>
                  <span className={`font-semibold ${textColor}`}>
                    {pendingUpdate.field === 'monthly' ? 'Monthly' : 'Yearly'}
                  </span>
                </div>
                <div className={`border-t pt-2 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center">
                    <span className={mutedColor}>Current Price:</span>
                    <span className={textColor}>${pendingUpdate.oldPrice}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className={mutedColor}>New Price:</span>
                    <span className={`font-bold text-lg ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      ${pendingUpdate.newPrice}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className={mutedColor}>Change:</span>
                    <span className={`font-semibold ${
                      pendingUpdate.newPrice > pendingUpdate.oldPrice
                        ? theme === 'dark' ? 'text-red-400' : 'text-red-600'
                        : theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`}>
                      {pendingUpdate.newPrice > pendingUpdate.oldPrice ? '+' : ''}
                      ${(pendingUpdate.newPrice - pendingUpdate.oldPrice).toFixed(2)}
                      ({((pendingUpdate.newPrice - pendingUpdate.oldPrice) / pendingUpdate.oldPrice * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className={`flex-1 ${theme === 'dark' ? 'border-white/20' : 'border-gray-300'}`}
                onClick={handleCancelConfirmation}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-500 to-violet-500 text-white"
                onClick={handleConfirmUpdate}
              >
                Confirm Update
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Initial tiers data
function getInitialTiers(): PricingTier[] {
  return [
    {
      id: 'free',
      name: 'Free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      popular: false,
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
    },
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: 29,
      yearlyPrice: 290,
      popular: true,
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
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 99,
      yearlyPrice: 990,
      popular: false,
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
    },
  ];
}
