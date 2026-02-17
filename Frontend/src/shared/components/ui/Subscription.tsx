import { fetchUsageOverview } from '@/core/api/services/analytics.service';
import { useTheme } from '@/core/theme/ThemeContext';
import { Check, Crown, Info, TrendingUp, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SubscriptionProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'plans' | 'overview';
}

export function Subscription({ isOpen, onClose, initialTab = 'plans' }: SubscriptionProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'plans' | 'overview'>(initialTab);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [usageData, setUsageData] = useState<any>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadUsage = async () => {
        setIsLoadingUsage(true);
        try {
          const data = await fetchUsageOverview();
          setUsageData(data);
        } catch (err) {
          console.error('[Subscription] Failed to fetch usage overview:', err);
        } finally {
          setIsLoadingUsage(false);
        }
      };
      loadUsage();
    }
  }, [isOpen]);

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const inputBg = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';

  if (!isOpen) return null;

  const plans = [
    {
      name: 'Free',
      price: 0,
      annualPrice: 0,
      description: 'Perfect for getting started',
      popular: false,
      features: [
        { text: '5 Workflows', included: true },
        { text: '3 Projects', included: true },
        { text: '2 AI Agents per workflow', included: true },
        { text: '100 Workflow executions/month', included: true },
        { text: '1 GB Storage', included: true },
        { text: '5 Team members', included: true },
        { text: 'Basic templates', included: true },
        { text: 'Community support', included: true },
        { text: 'Advanced AI models', included: false },
        { text: 'Custom integrations', included: false },
        { text: 'Priority support', included: false },
      ],
      current: false,
    },
    {
      name: 'Plus',
      price: 29,
      annualPrice: 19,
      discount: 34,
      description: 'For growing teams',
      popular: false,
      features: [
        { text: '50 Workflows', included: true },
        { text: '15 Projects', included: true },
        { text: '10 AI Agents per workflow', included: true },
        { text: '2,000 Workflow executions/month', included: true },
        { text: '50 GB Storage', included: true },
        { text: '20 Team members', included: true },
        { text: 'Premium templates', included: true },
        { text: 'Email support', included: true },
        { text: 'Advanced AI models', included: true },
        { text: 'API access', included: true },
        { text: 'Custom integrations', included: false },
        { text: 'Priority support', included: false },
      ],
      current: false,
    },
    {
      name: 'Pro',
      price: 79,
      annualPrice: 49,
      discount: 38,
      description: 'For professional teams',
      popular: true,
      features: [
        { text: 'Unlimited Workflows', included: true },
        { text: 'Unlimited Projects', included: true },
        { text: 'Unlimited AI Agents', included: true },
        { text: '10,000 Workflow executions/month', included: true },
        { text: '500 GB Storage', included: true },
        { text: '100 Team members', included: true },
        { text: 'All templates + custom', included: true },
        { text: 'Priority support', included: true },
        { text: 'Advanced AI models', included: true },
        { text: 'Full API access', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'Workflow version control', included: true },
        { text: 'Advanced analytics', included: true },
      ],
      current: true,
    },
    {
      name: 'Enterprise',
      price: null,
      annualPrice: null,
      description: 'For large organizations',
      popular: false,
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Unlimited everything', included: true },
        { text: 'Custom AI model training', included: true },
        { text: 'Dedicated infrastructure', included: true },
        { text: 'White-label solution', included: true },
        { text: 'Custom SLA', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: '24/7 Phone support', included: true },
        { text: 'On-premise deployment option', included: true },
        { text: 'Advanced security features', included: true },
      ],
      current: false,
    },
  ];

  // Current plan usage data (for Overview tab) - Updated with REAL data!
  const currentUsage = {
    plan: 'Pro',
    price: 49,
    billingCycle: 'monthly',
    nextReset: '07 Mar 2026',
    workflows: { used: usageData?.workflows ?? 0, limit: 'Unlimited' },
    projects: { used: usageData?.projects ?? 0, limit: 'Unlimited' },
    aiAgents: { used: usageData?.aiAgents ?? 0, limit: 'Unlimited' },
    executions: { used: usageData?.executions ?? 0, limit: 10000 },
    storage: { used: usageData?.storage ?? 0, limit: 500, unit: 'GB' },
    teamMembers: { used: usageData?.teamMembers ?? 0, limit: 100 },
  };

  const getUsagePercentage = (used: number, limit: number | string) => {
    if (limit === 'Unlimited') return 0;
    return (used / (limit as number)) * 100;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className={`${bgMain} rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden border ${borderColor} shadow-2xl my-8`}>
        {/* Header */}
        <div className={`${bgCard} border-b ${borderColor} px-6 py-4 flex items-center justify-between sticky top-0 z-10`}>
          <div>
            <h2 className={`text-2xl ${textPrimary} mb-1`}>Subscription Management</h2>
            <p className={textSecondary}>Manage your plan and view usage details</p>
          </div>
          <button
            onClick={onClose}
            className={`w-10 h-10 rounded-lg ${inputBg} border ${borderColor} flex items-center justify-center hover:border-[#00C6FF]/50 transition-all`}
          >
            <X className={`w-5 h-5 ${textSecondary}`} />
          </button>
        </div>

        {/* Tabs */}
        <div className={`${bgCard} border-b ${borderColor} px-6`}>
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-6 py-3 relative transition-all ${
                activeTab === 'plans'
                  ? textPrimary
                  : textSecondary
              }`}
            >
              Pricing Plans
              {activeTab === 'plans' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00C6FF] via-[#0072FF] to-[#9D50BB]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 relative transition-all ${
                activeTab === 'overview'
                  ? textPrimary
                  : textSecondary
              }`}
            >
              Usage Overview
              {activeTab === 'overview' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00C6FF] via-[#0072FF] to-[#9D50BB]"></div>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(95vh - 180px)' }}>
          {activeTab === 'plans' ? (
            <div className="p-6 space-y-6">
              {/* Limited Time Offer Banner */}
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <p className="text-green-500">Limited Time: Up to 38% off annual plans!</p>
              </div>

              {/* Billing Cycle Toggle */}
              <div className="flex items-center justify-center gap-4">
                <span className={`transition-all ${billingCycle === 'monthly' ? textPrimary + ' font-semibold' : textSecondary}`}>Monthly</span>
                <button
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                  className={`relative w-14 h-7 rounded-full transition-all ${
                    billingCycle === 'annual' ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB]' : inputBg
                  } border ${billingCycle === 'annual' ? 'border-[#00C6FF]' : borderColor}`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      billingCycle === 'annual' ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  ></div>
                </button>
                <div className="flex items-center gap-2">
                  <span className={`transition-all ${billingCycle === 'annual' ? textPrimary + ' font-semibold' : textSecondary}`}>
                    Annual
                  </span>
                  {billingCycle === 'annual' && (
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm border border-green-500/30">
                      Save 17%
                    </span>
                  )}
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan) => {
                  const displayPrice = billingCycle === 'annual' ? plan.annualPrice : plan.price;
                  const originalPrice = plan.price;
                  
                  return (
                    <div
                      key={plan.name}
                      className={`${bgCard} rounded-2xl p-6 border-2 ${
                        plan.popular
                          ? 'border-[#00C6FF] shadow-lg shadow-[#00C6FF]/20'
                          : plan.current
                          ? 'border-green-500/50'
                          : borderColor
                      } transition-all hover:border-[#00C6FF]/50 relative overflow-hidden`}
                    >
                      {/* Popular Badge */}
                      {plan.popular && !plan.current && (
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white px-4 py-1 text-xs rounded-bl-lg">
                          MOST POPULAR
                        </div>
                      )}

                      {/* Current Badge - Always on right */}
                      {plan.current && (
                        <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 text-xs rounded-bl-lg flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          ACTIVE
                        </div>
                      )}
                      
                      {/* Popular Badge when also current - shift to left */}
                      {plan.popular && plan.current && (
                        <div className="absolute top-0 left-0 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white px-4 py-1 text-xs rounded-br-lg">
                          MOST POPULAR
                        </div>
                      )}

                      {/* Plan Header */}
                      <div className="mb-6 mt-4">
                        <h3 className={`text-xl mb-2 ${textPrimary}`}>{plan.name}</h3>
                        <p className={`text-sm ${textSecondary} mb-4`}>{plan.description}</p>
                        
                        {displayPrice !== null ? (
                          <div className="flex items-baseline gap-2">
                            <span className={`text-4xl ${textPrimary}`}>${displayPrice}</span>
                            <span className={textSecondary}>/month</span>
                          </div>
                        ) : (
                          <div className={`text-3xl ${textPrimary}`}>Custom</div>
                        )}

                        {billingCycle === 'annual' && plan.discount && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`line-through text-sm ${textSecondary}`}>${originalPrice}</span>
                            <span className="text-sm text-green-500">Save {plan.discount}%</span>
                          </div>
                        )}

                        {billingCycle === 'monthly' && displayPrice !== null && displayPrice > 0 && (
                          <p className={`text-xs ${textSecondary} mt-2`}>
                            Billed monthly
                          </p>
                        )}

                        {billingCycle === 'annual' && displayPrice !== null && displayPrice > 0 && (
                          <p className={`text-xs ${textSecondary} mt-2`}>
                            ${displayPrice * 12} billed annually
                          </p>
                        )}
                      </div>

                      {/* Features List */}
                      <div className="space-y-3 mb-6">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            {feature.included ? (
                              <Check className="w-5 h-5 text-[#00C6FF] flex-shrink-0 mt-0.5" />
                            ) : (
                              <X className={`w-5 h-5 ${textSecondary} opacity-30 flex-shrink-0 mt-0.5`} />
                            )}
                            <span className={`text-sm ${feature.included ? textPrimary : textSecondary + ' opacity-50'}`}>
                              {feature.text}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      {plan.current ? (
                        <button
                          disabled
                          className={`w-full py-3 px-6 rounded-lg border-2 ${borderColor} ${textSecondary} cursor-not-allowed flex items-center justify-center transition-all`}
                        >
                          <span className="text-center">Current Plan</span>
                        </button>
                      ) : plan.name === 'Enterprise' ? (
                        <button className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-[#00C6FF] via-[#0072FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all flex items-center justify-center hover:scale-105">
                          <span className="text-center">Contact Sales</span>
                        </button>
                      ) : plan.name === 'Free' ? (
                        <button className={`w-full py-3 px-6 rounded-lg border-2 ${borderColor} bg-transparent hover:bg-gradient-to-r hover:from-[#00C6FF]/10 hover:to-[#9D50BB]/10 transition-all flex items-center justify-center hover:border-[#00C6FF]/50`}>
                          <span className={`text-center ${theme === 'dark' ? 'text-[#00C6FF]' : 'text-blue-600'}`}>Downgrade to Free</span>
                        </button>
                      ) : (
                        <button className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-[#00C6FF] via-[#0072FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all flex items-center justify-center hover:scale-105">
                          <span className="text-center">{plan.name === 'Pro' ? 'Current Plan' : 'Upgrade to ' + plan.name}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* FAQ or Additional Info */}
              <div className={`${bgCard} border ${borderColor} rounded-xl p-6 mt-8`}>
                <h3 className={`text-xl mb-4 ${textPrimary}`}>Why upgrade?</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00C6FF]/20 to-[#9D50BB]/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-[#00C6FF]" />
                    </div>
                    <div>
                      <h4 className={`mb-1 ${textPrimary}`}>More AI Power</h4>
                      <p className={`text-sm ${textSecondary}`}>Create unlimited AI agents and workflows to automate any process</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00C6FF]/20 to-[#9D50BB]/20 flex items-center justify-center flex-shrink-0">
                      <Crown className="w-5 h-5 text-[#00C6FF]" />
                    </div>
                    <div>
                      <h4 className={`mb-1 ${textPrimary}`}>Premium Features</h4>
                      <p className={`text-sm ${textSecondary}`}>Access advanced AI models, custom integrations, and priority support</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00C6FF]/20 to-[#9D50BB]/20 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-[#00C6FF]" />
                    </div>
                    <div>
                      <h4 className={`mb-1 ${textPrimary}`}>Scale Your Team</h4>
                      <p className={`text-sm ${textSecondary}`}>Collaborate with more team members and manage unlimited projects</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Overview Tab */
            <div className="p-6 space-y-6">
              {/* Current Plan Header */}
              <div className={`${bgCard} border ${borderColor} rounded-xl p-6`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-2xl ${textPrimary}`}>{currentUsage.plan} Plan</h3>
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-sm border border-green-500/30">
                        Active
                      </span>
                    </div>
                    <p className={textSecondary}>Your current subscription plan</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${textSecondary} mb-1`}>Total per {currentUsage.billingCycle}</p>
                    <p className={`text-3xl ${textPrimary}`}>${currentUsage.price}.00</p>
                  </div>
                </div>
              </div>

              {/* Usage Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Workflows */}
                <div className={`${bgCard} border ${borderColor} rounded-xl p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`${textPrimary}`}>Workflows</h4>
                    <span className={textSecondary}>
                      {currentUsage.workflows.used} / {currentUsage.workflows.limit}
                    </span>
                  </div>
                  <div className={`h-2 ${inputBg} rounded-full overflow-hidden`}>
                    <div
                      className="h-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] transition-all"
                      style={{ width: currentUsage.workflows.limit === 'Unlimited' ? '23%' : '100%' }}
                    ></div>
                  </div>
                  <p className={`text-sm ${textSecondary} mt-2`}>
                    {currentUsage.workflows.limit === 'Unlimited' ? 'Unlimited workflows available' : 'Workflows used this month'}
                  </p>
                </div>

                {/* Projects */}
                <div className={`${bgCard} border ${borderColor} rounded-xl p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`${textPrimary}`}>Projects</h4>
                    <span className={textSecondary}>
                      {currentUsage.projects.used} / {currentUsage.projects.limit}
                    </span>
                  </div>
                  <div className={`h-2 ${inputBg} rounded-full overflow-hidden`}>
                    <div
                      className="h-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] transition-all"
                      style={{ width: currentUsage.projects.limit === 'Unlimited' ? '8%' : '100%' }}
                    ></div>
                  </div>
                  <p className={`text-sm ${textSecondary} mt-2`}>
                    {currentUsage.projects.limit === 'Unlimited' ? 'Unlimited projects available' : 'Active projects'}
                  </p>
                </div>

                {/* AI Agents */}
                <div className={`${bgCard} border ${borderColor} rounded-xl p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`${textPrimary}`}>AI Agents</h4>
                    <span className={textSecondary}>
                      {currentUsage.aiAgents.used} / {currentUsage.aiAgents.limit}
                    </span>
                  </div>
                  <div className={`h-2 ${inputBg} rounded-full overflow-hidden`}>
                    <div
                      className="h-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] transition-all"
                      style={{ width: currentUsage.aiAgents.limit === 'Unlimited' ? '47%' : '100%' }}
                    ></div>
                  </div>
                  <p className={`text-sm ${textSecondary} mt-2`}>
                    {currentUsage.aiAgents.limit === 'Unlimited' ? 'Unlimited AI agents available' : 'AI agents deployed'}
                  </p>
                </div>

                {/* Workflow Executions */}
                <div className={`${bgCard} border ${borderColor} rounded-xl p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`${textPrimary}`}>Workflow Executions</h4>
                    <span className={textSecondary}>
                      {currentUsage.executions.used.toLocaleString()} / {currentUsage.executions.limit.toLocaleString()}
                    </span>
                  </div>
                  <div className={`h-2 ${inputBg} rounded-full overflow-hidden`}>
                    <div
                      className="h-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] transition-all"
                      style={{ width: `${getUsagePercentage(currentUsage.executions.used, currentUsage.executions.limit)}%` }}
                    ></div>
                  </div>
                  <p className={`text-sm ${textSecondary} mt-2`}>
                    {((currentUsage.executions.limit - currentUsage.executions.used) as number).toLocaleString()} executions remaining this month
                  </p>
                </div>

                {/* Storage */}
                <div className={`${bgCard} border ${borderColor} rounded-xl p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`${textPrimary}`}>Storage</h4>
                    <span className={textSecondary}>
                      {currentUsage.storage.used} {currentUsage.storage.unit} / {currentUsage.storage.limit} {currentUsage.storage.unit}
                    </span>
                  </div>
                  <div className={`h-2 ${inputBg} rounded-full overflow-hidden`}>
                    <div
                      className="h-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] transition-all"
                      style={{ width: `${getUsagePercentage(currentUsage.storage.used, currentUsage.storage.limit as number)}%` }}
                    ></div>
                  </div>
                  <p className={`text-sm ${textSecondary} mt-2`}>
                    {((currentUsage.storage.limit as number) - currentUsage.storage.used).toFixed(1)} {currentUsage.storage.unit} available
                  </p>
                </div>

                {/* Team Members */}
                <div className={`${bgCard} border ${borderColor} rounded-xl p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`${textPrimary}`}>Team Members</h4>
                    <span className={textSecondary}>
                      {currentUsage.teamMembers.used} / {currentUsage.teamMembers.limit}
                    </span>
                  </div>
                  <div className={`h-2 ${inputBg} rounded-full overflow-hidden`}>
                    <div
                      className="h-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] transition-all"
                      style={{ width: `${getUsagePercentage(currentUsage.teamMembers.used, currentUsage.teamMembers.limit as number)}%` }}
                    ></div>
                  </div>
                  <p className={`text-sm ${textSecondary} mt-2`}>
                    {(currentUsage.teamMembers.limit as number) - currentUsage.teamMembers.used} more members can be added
                  </p>
                </div>
              </div>

              {/* Reset Information */}
              <div className={`${bgCard} border ${borderColor} rounded-xl p-6`}>
                <div className="flex items-start gap-3">
                  <Info className={`w-5 h-5 ${textSecondary} flex-shrink-0 mt-0.5`} />
                  <div>
                    <h4 className={`mb-2 ${textPrimary}`}>Usage Reset Information</h4>
                    <p className={textSecondary}>
                      Your monthly usage limits will reset on <span className={textPrimary}>{currentUsage.nextReset}</span>. 
                      Workflow executions and API calls are tracked monthly, while storage and team members are cumulative.
                    </p>
                  </div>
                </div>
              </div>

              {/* Upgrade CTA */}
              <div className="bg-gradient-to-r from-[#00C6FF]/10 to-[#9D50BB]/10 border border-[#00C6FF]/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`mb-2 ${textPrimary}`}>Need more resources?</h4>
                    <p className={textSecondary}>Upgrade to get unlimited workflows, projects, and AI agents</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('plans')}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#00C6FF] via-[#0072FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all whitespace-nowrap flex items-center justify-center hover:scale-105"
                  >
                    <span className="text-center">View Plans</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}