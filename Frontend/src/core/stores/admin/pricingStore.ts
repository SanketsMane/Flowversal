/**
 * Pricing Store - Global Pricing Configuration
 * Admin can edit, changes reflect everywhere in the app
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PricingFeature {
  id: string;
  text: string;
  enabled: boolean;
}

export interface PricingPlan {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  popular: boolean;
  description: string;
  features: PricingFeature[];
  limits: {
    workflows: number;
    executions: number;
    storage: number;
    apiCalls: number;
    collaborators: number;
    templates: number;
    formSubmissions: number;
    webhooks: number;
  };
}

interface PricingStore {
  plans: PricingPlan[];
  updatePlanPrice: (planId: string, field: 'monthlyPrice' | 'yearlyPrice', value: number) => void;
  updatePlanDescription: (planId: string, description: string) => void;
  updatePlanName: (planId: string, name: string) => void;
  addFeature: (planId: string, feature: string) => void;
  removeFeature: (planId: string, featureId: string) => void;
  updateFeature: (planId: string, featureId: string, text: string) => void;
  toggleFeature: (planId: string, featureId: string) => void;
  resetToDefaults: () => void;
}

const defaultPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    popular: false,
    description: 'Perfect for trying out Flowversal and small projects',
    features: [
      { id: 'f1', text: '3 active workflows', enabled: true },
      { id: 'f2', text: '100 executions/month', enabled: true },
      { id: 'f3', text: '100 MB storage', enabled: true },
      { id: 'f4', text: 'Access to template library', enabled: true },
      { id: 'f5', text: 'Basic integrations', enabled: true },
      { id: 'f6', text: 'Community support', enabled: true },
      { id: 'f7', text: 'Email notifications', enabled: true },
      { id: 'f8', text: 'Basic analytics', enabled: true },
    ],
    limits: {
      workflows: 3,
      executions: 100,
      storage: 100,
      apiCalls: 1000,
      collaborators: 1,
      templates: 5,
      formSubmissions: 50,
      webhooks: 2,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 29,
    yearlyPrice: 290,
    popular: true,
    description: 'For professionals and growing teams',
    features: [
      { id: 'p1', text: '50 active workflows', enabled: true },
      { id: 'p2', text: '10,000 executions/month', enabled: true },
      { id: 'p3', text: '10 GB storage', enabled: true },
      { id: 'p4', text: 'Unlimited templates', enabled: true },
      { id: 'p5', text: 'Premium integrations', enabled: true },
      { id: 'p6', text: 'Priority support', enabled: true },
      { id: 'p7', text: 'Advanced analytics', enabled: true },
      { id: 'p8', text: 'Custom branding', enabled: true },
      { id: 'p9', text: 'API access', enabled: true },
      { id: 'p10', text: 'Webhook automation', enabled: true },
      { id: 'p11', text: 'Team collaboration (5 members)', enabled: true },
      { id: 'p12', text: 'Version history', enabled: true },
    ],
    limits: {
      workflows: 50,
      executions: 10000,
      storage: 10000,
      apiCalls: 100000,
      collaborators: 5,
      templates: 100,
      formSubmissions: 5000,
      webhooks: 25,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 99,
    yearlyPrice: 990,
    popular: false,
    description: 'For large teams and organizations',
    features: [
      { id: 'e1', text: 'Unlimited workflows', enabled: true },
      { id: 'e2', text: 'Unlimited executions', enabled: true },
      { id: 'e3', text: 'Unlimited storage', enabled: true },
      { id: 'e4', text: 'All integrations', enabled: true },
      { id: 'e5', text: 'Custom integrations', enabled: true },
      { id: 'e6', text: 'Dedicated support', enabled: true },
      { id: 'e7', text: 'Phone support', enabled: true },
      { id: 'e8', text: 'Custom analytics', enabled: true },
      { id: 'e9', text: 'SLA guarantee', enabled: true },
      { id: 'e10', text: 'On-premise deployment option', enabled: true },
      { id: 'e11', text: 'Unlimited team members', enabled: true },
      { id: 'e12', text: 'Advanced security', enabled: true },
      { id: 'e13', text: 'Audit logs', enabled: true },
      { id: 'e14', text: 'SSO/SAML', enabled: true },
      { id: 'e15', text: 'Custom contracts', enabled: true },
    ],
    limits: {
      workflows: -1,
      executions: -1,
      storage: -1,
      apiCalls: -1,
      collaborators: -1,
      templates: -1,
      formSubmissions: -1,
      webhooks: -1,
    },
  },
];

export const usePricingStore = create<PricingStore>()(
  persist(
    (set) => ({
      plans: defaultPlans,

      updatePlanPrice: (planId, field, value) =>
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === planId ? { ...plan, [field]: value } : plan
          ),
        })),

      updatePlanDescription: (planId, description) =>
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === planId ? { ...plan, description } : plan
          ),
        })),

      updatePlanName: (planId, name) =>
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === planId ? { ...plan, name } : plan
          ),
        })),

      addFeature: (planId, featureText) =>
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === planId
              ? {
                  ...plan,
                  features: [
                    ...plan.features,
                    {
                      id: `${planId}_${Date.now()}`,
                      text: featureText,
                      enabled: true,
                    },
                  ],
                }
              : plan
          ),
        })),

      removeFeature: (planId, featureId) =>
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === planId
              ? {
                  ...plan,
                  features: plan.features.filter((f) => f.id !== featureId),
                }
              : plan
          ),
        })),

      updateFeature: (planId, featureId, text) =>
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === planId
              ? {
                  ...plan,
                  features: plan.features.map((f) =>
                    f.id === featureId ? { ...f, text } : f
                  ),
                }
              : plan
          ),
        })),

      toggleFeature: (planId, featureId) =>
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === planId
              ? {
                  ...plan,
                  features: plan.features.map((f) =>
                    f.id === featureId ? { ...f, enabled: !f.enabled } : f
                  ),
                }
              : plan
          ),
        })),

      resetToDefaults: () => set({ plans: defaultPlans }),
    }),
    {
      name: 'flowversal-pricing-config',
    }
  )
);