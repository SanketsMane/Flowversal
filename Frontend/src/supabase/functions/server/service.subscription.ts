/**
 * Subscription Service
 * Business logic for subscription management and Stripe integration
 */

import { stripe, STRIPE_PRICE_IDS } from './utils.config.ts';
import * as kv from './kv_store.tsx';
import { getSubscriptionKey, getDefaultSubscription, calculatePeriodEnd, logInfo, logSuccess, logError } from './utils.helpers.ts';
import { validateSubscriptionTier, validateBillingCycle } from './utils.validators.ts';
import type { Subscription, BillingInfo, ApiResponse, BillingCycle, SubscriptionTier } from './types.ts';
import type Stripe from 'stripe';

const SERVICE = 'SubscriptionService';

// ============================================================================
// Subscription Retrieval
// ============================================================================

export async function getCurrentSubscription(userId: string): Promise<ApiResponse<Subscription>> {
  logInfo(SERVICE, `Getting subscription for user: ${userId}`);

  try {
    const key = getSubscriptionKey(userId);
    let subscription = await kv.get(key);

    // Create default if doesn't exist
    if (!subscription) {
      subscription = getDefaultSubscription(userId);
      await kv.set(key, subscription);
      logInfo(SERVICE, `Created default subscription for user: ${userId}`);
    }

    return { success: true, data: subscription };
  } catch (error: any) {
    logError(SERVICE, 'Get subscription error', error);
    return { success: false, error: 'Failed to fetch subscription' };
  }
}

// ============================================================================
// Stripe Checkout
// ============================================================================

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  tier: SubscriptionTier,
  billingCycle: BillingCycle,
  origin: string
): Promise<ApiResponse<{ sessionUrl: string }>> {
  logInfo(SERVICE, `Creating checkout session for user: ${userId}, tier: ${tier}`);

  // Validate inputs
  const tierValidation = validateSubscriptionTier(tier);
  if (!tierValidation.success) return tierValidation;

  const cycleValidation = validateBillingCycle(billingCycle);
  if (!cycleValidation.success) return cycleValidation;

  if (tier === 'free') {
    return { success: false, error: 'Cannot checkout for free tier' };
  }

  try {
    // Get or create Stripe customer
    let customerId: string;
    const key = getSubscriptionKey(userId);
    const subscription = await kv.get(key);

    if (subscription?.stripeCustomerId) {
      customerId = subscription.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    // Get price ID
    const priceId = STRIPE_PRICE_IDS[`${tier}_${billingCycle}` as keyof typeof STRIPE_PRICE_IDS];

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/app?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/app?checkout=cancel`,
      metadata: { userId, tier, billingCycle },
    });

    logSuccess(SERVICE, `Checkout session created: ${session.id}`);

    return { success: true, data: { sessionUrl: session.url! } };
  } catch (error: any) {
    logError(SERVICE, 'Create checkout error', error);
    return { success: false, error: error.message || 'Failed to create checkout session' };
  }
}

// ============================================================================
// Billing Portal
// ============================================================================

export async function createPortalSession(
  userId: string,
  origin: string
): Promise<ApiResponse<{ portalUrl: string }>> {
  logInfo(SERVICE, `Creating portal session for user: ${userId}`);

  try {
    const key = getSubscriptionKey(userId);
    const subscription = await kv.get(key);

    if (!subscription?.stripeCustomerId) {
      return { success: false, error: 'No billing account found' };
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${origin}/app`,
    });

    logSuccess(SERVICE, `Portal session created for user: ${userId}`);

    return { success: true, data: { portalUrl: session.url } };
  } catch (error: any) {
    logError(SERVICE, 'Create portal error', error);
    return { success: false, error: 'Failed to create portal session' };
  }
}

// ============================================================================
// Subscription Management
// ============================================================================

export async function cancelSubscription(userId: string): Promise<ApiResponse> {
  logInfo(SERVICE, `Canceling subscription for user: ${userId}`);

  try {
    const key = getSubscriptionKey(userId);
    const subscription = await kv.get(key);

    if (!subscription?.stripeSubscriptionId) {
      return { success: false, error: 'No active subscription found' };
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    subscription.cancelAtPeriodEnd = true;
    await kv.set(key, subscription);

    logSuccess(SERVICE, `Subscription canceled for user: ${userId}`);

    return { success: true };
  } catch (error: any) {
    logError(SERVICE, 'Cancel subscription error', error);
    return { success: false, error: 'Failed to cancel subscription' };
  }
}

export async function resumeSubscription(userId: string): Promise<ApiResponse> {
  logInfo(SERVICE, `Resuming subscription for user: ${userId}`);

  try {
    const key = getSubscriptionKey(userId);
    const subscription = await kv.get(key);

    if (!subscription?.stripeSubscriptionId) {
      return { success: false, error: 'No subscription found' };
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    subscription.cancelAtPeriodEnd = false;
    await kv.set(key, subscription);

    logSuccess(SERVICE, `Subscription resumed for user: ${userId}`);

    return { success: true };
  } catch (error: any) {
    logError(SERVICE, 'Resume subscription error', error);
    return { success: false, error: 'Failed to resume subscription' };
  }
}

// ============================================================================
// Usage Tracking
// ============================================================================

export async function updateUsage(
  userId: string,
  limitType: keyof Subscription['usage'],
  increment: number = 1
): Promise<ApiResponse> {
  logInfo(SERVICE, `Updating usage for user: ${userId}, type: ${limitType}`);

  try {
    const key = getSubscriptionKey(userId);
    const subscription = await kv.get(key) || getDefaultSubscription(userId);

    subscription.usage[limitType] = (subscription.usage[limitType] || 0) + increment;
    await kv.set(key, subscription);

    return { success: true };
  } catch (error: any) {
    logError(SERVICE, 'Update usage error', error);
    return { success: false, error: 'Failed to update usage' };
  }
}

// ============================================================================
// Billing Information
// ============================================================================

export async function getBillingInfo(userId: string): Promise<ApiResponse<BillingInfo>> {
  logInfo(SERVICE, `Getting billing info for user: ${userId}`);

  try {
    const key = getSubscriptionKey(userId);
    const subscription = await kv.get(key);

    if (!subscription?.stripeCustomerId) {
      return { success: false, error: 'No billing account found' };
    }

    // Get customer info
    const customer = await stripe.customers.retrieve(subscription.stripeCustomerId, {
      expand: ['invoice_settings.default_payment_method'],
    }) as Stripe.Customer;

    // Get invoices
    const invoices = await stripe.invoices.list({
      customer: subscription.stripeCustomerId,
      limit: 10,
    });

    const billing: BillingInfo = {
      customerId: subscription.stripeCustomerId,
      paymentMethod: (customer.invoice_settings?.default_payment_method as any)?.card
        ? {
            brand: (customer.invoice_settings.default_payment_method as any).card.brand,
            last4: (customer.invoice_settings.default_payment_method as any).card.last4,
            expiryMonth: (customer.invoice_settings.default_payment_method as any).card.exp_month,
            expiryYear: (customer.invoice_settings.default_payment_method as any).card.exp_year,
          }
        : undefined,
      invoiceHistory: invoices.data.map((invoice) => ({
        id: invoice.id,
        amount: invoice.amount_paid / 100,
        status: invoice.status!,
        date: new Date(invoice.created * 1000).toISOString(),
        invoiceUrl: invoice.hosted_invoice_url || '',
      })),
    };

    return { success: true, data: billing };
  } catch (error: any) {
    logError(SERVICE, 'Get billing info error', error);
    return { success: false, error: 'Failed to fetch billing info' };
  }
}

// ============================================================================
// Webhook Handling
// ============================================================================

export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  logInfo(SERVICE, `Processing webhook: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier;
  const billingCycle = session.metadata?.billingCycle;

  if (userId && tier && billingCycle) {
    const key = getSubscriptionKey(userId);
    const subscription = (await kv.get(key)) || getDefaultSubscription(userId);

    subscription.tier = tier as SubscriptionTier;
    subscription.status = 'active';
    subscription.billingCycle = billingCycle as BillingCycle;
    subscription.stripeCustomerId = session.customer as string;
    subscription.stripeSubscriptionId = session.subscription as string;
    subscription.currentPeriodStart = new Date().toISOString();
    subscription.currentPeriodEnd = calculatePeriodEnd(billingCycle as BillingCycle);

    await kv.set(key, subscription);
    logSuccess(SERVICE, `Subscription activated for user: ${userId}`);
  }
}

async function handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
  const userId = stripeSubscription.metadata?.userId;

  if (userId) {
    const key = getSubscriptionKey(userId);
    const subscription = await kv.get(key);

    if (subscription) {
      subscription.status = stripeSubscription.status as any;
      subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
      subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000).toISOString();
      subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000).toISOString();
      await kv.set(key, subscription);
      logSuccess(SERVICE, `Subscription updated for user: ${userId}`);
    }
  }
}

async function handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
  const userId = stripeSubscription.metadata?.userId;

  if (userId) {
    const key = getSubscriptionKey(userId);
    const subscription = await kv.get(key);

    if (subscription) {
      subscription.tier = 'free';
      subscription.status = 'canceled';
      subscription.stripeSubscriptionId = undefined;
      await kv.set(key, subscription);
      logSuccess(SERVICE, `Subscription canceled for user: ${userId}`);
    }
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const allSubs = await kv.getByPrefix('subscription:');
  const userSub = allSubs.find((sub: any) => sub.stripeCustomerId === customerId);

  if (userSub) {
    userSub.status = 'past_due';
    const key = getSubscriptionKey(userSub.userId);
    await kv.set(key, userSub);
    logSuccess(SERVICE, `Payment failed for user: ${userSub.userId}`);
  }
}
