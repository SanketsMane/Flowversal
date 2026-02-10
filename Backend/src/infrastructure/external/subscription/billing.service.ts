import Stripe from 'stripe';
import { env } from '../../../core/config/env';
import { logger } from '../../../shared/utils/logger.util';

// Basic interface; expand as needed
interface SubscriptionInfo {
  tier: string;
  status: string;
  usage?: Record<string, any>;
}

class BillingService {
  private stripe: Stripe | null;
  private enabled: boolean;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.STRIPE_SECRET_KEY;
    this.enabled = !!key;
    this.stripe = key ? new Stripe(key, { apiVersion: '2025-01-27.clover' as any }) : null;
  }

  isEnabled() {
    return this.enabled;
  }

  async getSubscription(userId: string): Promise<SubscriptionInfo> {
    if (!this.enabled || !this.stripe) {
      return { tier: 'free', status: 'disabled', usage: {} };
    }

    // Placeholder: lookup by userId in your DB to map to a Stripe customer
    // Example:
    // const customerId = await this.lookupCustomerId(userId);
    // const subs = await this.stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 1 });
    // const sub = subs.data[0];
    // return { tier: mapPriceToTier(sub.items.data[0].price.id), status: sub.status };

    return { tier: 'free', status: 'active', usage: {} };
  }

  async createCheckoutSession(userId: string, tier: string, billingCycle: 'monthly' | 'yearly') {
    if (!this.enabled || !this.stripe) {
      throw new Error('Billing disabled');
    }
    // TODO: map tier + billingCycle to Stripe price ID
    const priceId = this.lookupPriceId(tier, billingCycle);
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/billing/success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/billing/cancel`,
    });
    return session.url;
  }

  async createPortalSession(userId: string) {
    if (!this.enabled || !this.stripe) {
      throw new Error('Billing disabled');
    }
    // TODO: lookup customer by userId
    // const customerId = await this.lookupCustomerId(userId);
    const session = await this.stripe.billingPortal.sessions.create({
      customer: 'replace-with-customer-id',
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/billing`,
    });
    return session.url;
  }

  async cancelSubscription(userId: string) {
    if (!this.enabled || !this.stripe) {
      throw new Error('Billing disabled');
    }
    // TODO: cancel subscription by customer/sub ID
    return { cancelled: true };
  }

  async resumeSubscription(userId: string) {
    if (!this.enabled || !this.stripe) {
      throw new Error('Billing disabled');
    }
    // TODO: resume subscription logic
    return { resumed: true };
  }

  async handleWebhook(payload: any, signature?: string) {
    if (!this.enabled || !this.stripe) {
      throw new Error('Billing disabled');
    }
    // Verify webhook if signing secret is set
    if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
      this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    }
    // TODO: process events (checkout.session.completed, customer.subscription.updated, etc.)
    logger.info('Stripe webhook received', { hasSignature: !!signature });
    return { processed: true };
  }

  private lookupPriceId(tier: string, billingCycle: 'monthly' | 'yearly'): string {
    // TODO: map your product catalog to Stripe price IDs
    // For now, throw to force configuration
    const key = `${tier}-${billingCycle}`;
    const priceId = process.env[`STRIPE_PRICE_${key.toUpperCase()}`];
    if (!priceId) {
      throw new Error(`Missing Stripe price ID for ${key}`);
    }
    return priceId;
  }
}

export const billingService = new BillingService();
export { BillingService };

