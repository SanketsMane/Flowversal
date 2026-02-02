/**
 * Pricing Page
 * Subscription tiers and feature comparison
 */

import React, { useState } from 'react';
import { Check, Zap, Crown, Building2, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { Switch } from '@/shared/components/ui/switch';
import { MarketingRoute } from '../MarketingApp';
import { usePricingStore } from '@/core/stores/admin/pricingStore';
import { useTheme } from '@/core/theme/ThemeContext';

interface PricingPageProps {
  onNavigate: (route: MarketingRoute) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { plans: globalPlans } = usePricingStore();
  const { theme } = useTheme();

  // Map global plans to display format
  const plans = globalPlans.map(plan => ({
    name: plan.name,
    icon: plan.id === 'free' ? Zap : plan.id === 'pro' ? Crown : Building2,
    description: plan.description,
    monthlyPrice: plan.monthlyPrice,
    annualPrice: plan.yearlyPrice,
    badge: plan.popular ? 'Most Popular' : plan.id === 'enterprise' ? 'Custom' : null,
    features: plan.features.filter(f => f.enabled).map(f => f.text),
    cta: plan.id === 'free' ? 'Start Free' : plan.id === 'pro' ? 'Start Free Trial' : 'Contact Sales',
    ctaVariant: (plan.popular ? 'default' : 'outline') as 'default' | 'outline',
    popular: plan.popular,
    highlighted: plan.id === 'pro', // Add highlighted property
  }));

  const comparisonFeatures = [
    {
      category: 'Workflow Features',
      items: [
        { name: 'Workflow runs per month', free: '100', pro: 'Unlimited', enterprise: 'Unlimited' },
        { name: 'Active workflows', free: '5', pro: 'Unlimited', enterprise: 'Unlimited' },
        { name: 'Workflow nodes', free: 'Basic', pro: 'All', enterprise: 'All + Custom' },
        { name: 'Conditional logic', free: false, pro: true, enterprise: true },
        { name: 'Branch workflows', free: false, pro: true, enterprise: true },
      ],
    },
    {
      category: 'Form Builder',
      items: [
        { name: 'Form fields', free: '5 max', pro: 'Unlimited', enterprise: 'Unlimited' },
        { name: 'Field types', free: 'Basic', pro: '14+ types', enterprise: '14+ types' },
        { name: 'Conditional fields', free: false, pro: true, enterprise: true },
        { name: 'Custom validation', free: false, pro: true, enterprise: true },
      ],
    },
    {
      category: 'Integrations',
      items: [
        { name: 'API access', free: false, pro: true, enterprise: true },
        { name: 'Webhook triggers', free: false, pro: true, enterprise: true },
        { name: 'AI models (GPT-4, Claude)', free: false, pro: true, enterprise: true },
        { name: 'Custom integrations', free: false, pro: false, enterprise: true },
      ],
    },
    {
      category: 'Team & Collaboration',
      items: [
        { name: 'Team members', free: '1', pro: '5', enterprise: 'Unlimited' },
        { name: 'Role-based access', free: false, pro: true, enterprise: true },
        { name: 'SSO & SAML', free: false, pro: false, enterprise: true },
      ],
    },
    {
      category: 'Support',
      items: [
        { name: 'Community support', free: true, pro: true, enterprise: true },
        { name: 'Email support', free: false, pro: 'Priority', enterprise: '24/7' },
        { name: 'Phone support', free: false, pro: false, enterprise: true },
        { name: 'Dedicated account manager', free: false, pro: false, enterprise: true },
      ],
    },
  ];

  const faqs = [
    {
      question: 'Can I switch plans anytime?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we will prorate any charges.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and offer invoicing for annual Enterprise plans.',
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! Pro plans come with a 14-day free trial. No credit card required to start.',
    },
    {
      question: 'What happens when I hit my workflow run limit?',
      answer: 'On the Free plan, workflows will pause once you hit 100 runs. You can upgrade to Pro for unlimited runs anytime.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee on all paid plans. Contact support if you are not satisfied.',
    },
    {
      question: 'Can I cancel my subscription?',
      answer: 'Yes, you can cancel anytime from your account settings. You will retain access until the end of your billing period.',
    },
  ];

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === null) return 'Custom';
    if (plan.monthlyPrice === 0) return 'Free';
    
    const price = isAnnual ? plan.annualPrice / 12 : plan.monthlyPrice;
    return `$${Math.round(price)}`;
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (!isAnnual || plan.monthlyPrice === null || plan.monthlyPrice === 0) return null;
    const annualTotal = plan.monthlyPrice * 12;
    const savings = annualTotal - plan.annualPrice;
    return `Save $${savings}/year`;
  };

  return (
    <div className="pt-24 pb-20">
      {/* Header */}
      <section className="px-4 mb-16">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className={`mb-4 border ${
            theme === 'dark'
              ? 'bg-white/10 text-white border-white/20'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            Pricing
          </Badge>
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Simple, Transparent Pricing
          </h1>
          <p className={`text-xl mb-8 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Choose the plan that's right for you. All plans include a 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className={`text-sm ${
              !isAnnual 
                ? theme === 'dark' ? 'text-white font-semibold' : 'text-gray-900 font-semibold'
                : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Monthly
            </span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span className={`text-sm ${
              isAnnual 
                ? theme === 'dark' ? 'text-white font-semibold' : 'text-gray-900 font-semibold'
                : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Annual
            </span>
            {isAnnual && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Save 17%
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 mb-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative p-8 border ${
                  plan.popular
                    ? theme === 'dark'
                      ? 'bg-gradient-to-b from-[#1A1A2E] to-[#0E0E1F] border-blue-500/50 shadow-2xl shadow-blue-500/20 scale-105'
                      : 'bg-gradient-to-b from-blue-50 to-white border-blue-300 shadow-2xl shadow-blue-200/50 scale-105'
                    : theme === 'dark'
                    ? 'bg-[#1A1A2E] border-white/10'
                    : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 text-white border-0">
                    {plan.badge}
                  </Badge>
                )}

                {/* Header */}
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                    plan.highlighted
                      ? 'bg-gradient-to-br from-blue-500 via-violet-500 to-cyan-500'
                      : theme === 'dark'
                      ? 'bg-white/10'
                      : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      plan.highlighted ? 'text-white' : theme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`} />
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{plan.name}</h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className={`text-center mb-6 pb-6 border-b ${
                  theme === 'dark' ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-4xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{getPrice(plan)}</span>
                    {plan.monthlyPrice !== null && plan.monthlyPrice !== 0 && (
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>/month</span>
                    )}
                  </div>
                  {getSavings(plan) && (
                    <p className="text-sm text-green-400 mt-1">{getSavings(plan)}</p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plan.ctaVariant}
                  className={`w-full cursor-pointer ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 hover:opacity-90 text-white border-0'
                      : theme === 'dark'
                      ? 'border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-transparent'
                      : 'border-2 border-gray-300 text-gray-900 hover:bg-gray-100 hover:border-gray-400 bg-transparent'
                  }`}
                  onClick={() => {
                    if (plan.name === 'Enterprise') {
                      window.location.href = 'mailto:sales@flowversal.com';
                    } else {
                      window.location.href = '/app?signup=true';
                    }
                  }}
                >
                  {plan.cta}
                  {plan.name !== 'Enterprise' && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="px-4 mb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Compare All Features
            </h2>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              See exactly what's included in each plan
            </p>
          </div>

          <div className={`border rounded-xl overflow-hidden ${
            theme === 'dark'
              ? 'bg-[#1A1A2E] border-white/10'
              : 'bg-white border-gray-200 shadow-sm'
          }`}>
            {comparisonFeatures.map((section, sectionIndex) => (
              <div key={section.category}>
                {/* Category Header */}
                <div className={`px-6 py-3 border-b ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <h3 className={`font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{section.category}</h3>
                </div>

                {/* Feature Rows */}
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`grid grid-cols-4 gap-4 px-6 py-4 ${
                      itemIndex !== section.items.length - 1 
                        ? theme === 'dark' 
                          ? 'border-b border-white/5' 
                          : 'border-b border-gray-100'
                        : ''
                    }`}
                  >
                    <div className={`col-span-1 text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>{item.name}</div>
                    <div className="text-center">
                      {typeof item.free === 'boolean' ? (
                        item.free ? (
                          <Check className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <span className="text-gray-600">—</span>
                        )
                      ) : (
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>{item.free}</span>
                      )}
                    </div>
                    <div className="text-center">
                      {typeof item.pro === 'boolean' ? (
                        item.pro ? (
                          <Check className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <span className="text-gray-600">—</span>
                        )
                      ) : (
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>{item.pro}</span>
                      )}
                    </div>
                    <div className="text-center">
                      {typeof item.enterprise === 'boolean' ? (
                        item.enterprise ? (
                          <Check className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <span className="text-gray-600">—</span>
                        )
                      ) : (
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>{item.enterprise}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 mb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className={`mb-4 border ${
              theme === 'dark'
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              FAQ
            </Badge>
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className={`p-6 border ${
                theme === 'dark'
                  ? 'bg-[#1A1A2E] border-white/10'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}>
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
                  <div>
                    <h3 className={`font-semibold mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{faq.question}</h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>{faq.answer}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className={`mb-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>Still have questions?</p>
            <Button
              variant="outline"
              onClick={() => window.location.href = 'mailto:support@flowversal.com'}
              className={`cursor-pointer border-2 ${
                theme === 'dark'
                  ? 'border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-transparent'
                  : 'border-gray-300 text-gray-900 hover:bg-gray-100 hover:border-gray-400 bg-transparent'
              }`}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4">
        <div className={`max-w-4xl mx-auto text-center rounded-2xl border p-12 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-cyan-500/10 border-white/10'
            : 'bg-gradient-to-r from-blue-50 via-violet-50 to-cyan-50 border-gray-200'
        }`}>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Start Building Today
          </h2>
          <p className={`text-lg mb-8 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Join thousands of teams automating their workflows with Flowversal
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = '/app?signup=true'}
            className="bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 hover:opacity-90 text-white border-0 text-lg px-8 py-6 cursor-pointer"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className={`text-sm mt-4 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
};