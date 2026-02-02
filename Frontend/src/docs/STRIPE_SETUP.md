# Stripe Integration Setup Guide

Complete guide to setting up Stripe for Flowversal's subscription system.

## Overview

Flowversal uses Stripe for:
- Subscription billing (Free/Pro/Enterprise tiers)
- Payment processing
- Customer portal
- Invoice management
- Webhook handling

## Prerequisites

- Stripe account (sign up at [stripe.com](https://stripe.com))
- Supabase project
- Access to environment variables

## Step 1: Create Stripe Account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up with your email
3. Complete account verification
4. Navigate to Dashboard

## Step 2: Get API Keys

### Test Mode (Development)

1. In Stripe Dashboard, click **Developers** → **API keys**
2. Find your **Test mode** keys:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

3. Copy these keys for environment variables

### Live Mode (Production)

1. Toggle to **Live mode** in top-right corner
2. Complete Stripe account activation
3. Get your live keys:
   - **Publishable key**: `pk_live_...`
   - **Secret key**: `sk_live_...`

## Step 3: Create Products and Prices

### Create Pro Plan

1. Go to **Products** → **Add product**
2. Fill in details:
   ```
   Name: Flowversal Pro
   Description: For professionals and growing teams
   ```
3. Add **Monthly** price:
   ```
   Price: $29.00 USD
   Billing period: Monthly
   ```
4. Click **Add price** and copy the Price ID: `price_xxxxx`
5. Add **Yearly** price:
   ```
   Price: $290.00 USD
   Billing period: Yearly
   ```
6. Click **Add price** and copy the Price ID: `price_yyyyy`

### Create Enterprise Plan

1. Go to **Products** → **Add product**
2. Fill in details:
   ```
   Name: Flowversal Enterprise
   Description: For large teams and organizations
   ```
3. Add **Monthly** price:
   ```
   Price: $99.00 USD
   Billing period: Monthly
   ```
4. Copy the Price ID: `price_zzzzz`
5. Add **Yearly** price:
   ```
   Price: $990.00 USD
   Billing period: Yearly
   ```
6. Copy the Price ID: `price_aaaaa`

## Step 4: Configure Webhooks

Webhooks notify your server about subscription events.

### Create Webhook Endpoint

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter endpoint URL:
   ```
   https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-020d2c80/subscription/webhook
   ```

4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Click **Add endpoint**

6. Copy the **Signing secret**: `whsec_...`

## Step 5: Configure Environment Variables

### Frontend (.env)

Create `.env` in project root:

```env
# Stripe Publishable Key (Public - Frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### Backend (Supabase Edge Functions)

1. Go to Supabase Dashboard
2. Navigate to **Settings** → **Edge Functions**
3. Add secrets:

```bash
# Using Supabase CLI
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
supabase secrets set STRIPE_PRICE_PRO_MONTHLY=price_xxxxx
supabase secrets set STRIPE_PRICE_PRO_YEARLY=price_yyyyy
supabase secrets set STRIPE_PRICE_ENTERPRISE_MONTHLY=price_zzzzz
supabase secrets set STRIPE_PRICE_ENTERPRISE_YEARLY=price_aaaaa
```

Or via Dashboard:
1. Go to **Settings** → **Edge Functions** → **Manage secrets**
2. Add each secret individually

## Step 6: Enable Customer Portal

The customer portal allows users to manage their subscriptions.

1. Go to **Settings** → **Billing** → **Customer portal**
2. Click **Activate** to enable
3. Configure portal settings:
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to update billing information
   - ✅ Allow customers to view invoices
   - ✅ Allow customers to cancel subscriptions
   - ✅ Allow customers to switch plans

4. Set cancellation policy:
   - "Cancel at end of billing period" (recommended)
   - Or "Cancel immediately"

5. Save settings

## Step 7: Test the Integration

### Test Checkout Flow

1. Start your app in development mode
2. Navigate to subscription page
3. Click "Upgrade to Pro"
4. Use Stripe test card:
   ```
   Card number: 4242 4242 4242 4242
   Expiry: Any future date (e.g., 12/34)
   CVC: Any 3 digits (e.g., 123)
   ZIP: Any 5 digits (e.g., 12345)
   ```

5. Complete checkout
6. Verify subscription activated in your app

### Test Webhook

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. View **Webhook attempts** to see events
4. Check Supabase logs for webhook processing

### Test Other Scenarios

**Test Successful Payment:**
```
Card: 4242 4242 4242 4242
Result: Payment succeeds
```

**Test Declined Payment:**
```
Card: 4000 0000 0000 0002
Result: Payment declined
```

**Test Requires Authentication:**
```
Card: 4000 0027 6000 3184
Result: 3D Secure authentication
```

**Test Insufficient Funds:**
```
Card: 4000 0000 0000 9995
Result: Insufficient funds
```

More test cards: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

## Step 8: Billing Portal Testing

1. After creating a subscription, get the customer portal URL
2. Click "Manage Billing" in your app
3. Verify you can:
   - Update payment method
   - View invoices
   - Cancel subscription
   - Update billing info

## Step 9: Go Live Checklist

Before switching to production:

### Stripe Account

- [ ] Complete business verification in Stripe
- [ ] Enable live mode
- [ ] Set up bank account for payouts
- [ ] Configure tax settings (if applicable)
- [ ] Set up email notifications

### Products & Prices

- [ ] Create live mode products
- [ ] Create live mode prices
- [ ] Update Price IDs in environment variables

### Webhooks

- [ ] Create live mode webhook endpoint
- [ ] Update webhook URL to production
- [ ] Test webhook delivery

### Security

- [ ] Rotate all test keys to live keys
- [ ] Verify webhook signatures
- [ ] Enable HTTPS only
- [ ] Set up monitoring/alerts

### Legal & Compliance

- [ ] Add Terms of Service
- [ ] Add Privacy Policy
- [ ] Add Refund Policy
- [ ] Configure tax collection (if needed)
- [ ] GDPR compliance (for EU customers)

## Common Issues & Solutions

### Webhook Not Receiving Events

**Problem**: Webhook endpoint not receiving events

**Solutions**:
1. Verify URL is correct and accessible
2. Check Supabase Edge Function logs
3. Test endpoint with Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:54321/functions/v1/make-server-020d2c80/subscription/webhook
   ```

### Invalid API Key

**Problem**: "Invalid API key provided"

**Solutions**:
1. Verify correct key (test vs live)
2. Check environment variables loaded correctly
3. Ensure no extra spaces in key

### Customer Portal Not Working

**Problem**: Portal link doesn't work

**Solutions**:
1. Ensure Customer Portal is activated in Stripe
2. Verify customer has a Stripe customer ID
3. Check return URL is correct

### Subscription Not Activating

**Problem**: Payment succeeds but subscription doesn't activate

**Solutions**:
1. Check webhook is configured correctly
2. Verify `checkout.session.completed` event is listened to
3. Check server logs for errors
4. Ensure KV store is working

## Monitoring & Analytics

### Stripe Dashboard

Monitor these metrics:
- Total revenue
- Active subscriptions
- Churn rate
- Failed payments
- Upcoming renewals

### Supabase Logs

Check these logs:
1. **Edge Function logs**: Subscription operations
2. **Auth logs**: User signups
3. **Database logs**: Subscription data

### Set Up Alerts

1. **Failed payments**: Email notification
2. **Subscription cancellations**: Slack notification
3. **Webhook failures**: PagerDuty alert
4. **Revenue milestones**: Celebrate! 🎉

## Advanced Features

### Proration

Handle plan upgrades/downgrades:

```typescript
await stripe.subscriptions.update(subscriptionId, {
  items: [{ id: itemId, price: newPriceId }],
  proration_behavior: 'create_prorations', // Charge difference
});
```

### Trials

Add 14-day free trial:

```typescript
await stripe.checkout.sessions.create({
  // ...other options
  subscription_data: {
    trial_period_days: 14,
  },
});
```

### Coupons

Create discount codes:

1. Go to **Products** → **Coupons**
2. Create coupon (e.g., "LAUNCH50" for 50% off)
3. Apply in checkout:
   ```typescript
   discounts: [{ coupon: 'LAUNCH50' }]
   ```

### Metered Billing

Charge for usage:

```typescript
await stripe.subscriptionItems.createUsageRecord(
  subscriptionItemId,
  { quantity: 100, timestamp: Math.floor(Date.now() / 1000) }
);
```

## Security Best Practices

1. **Never expose secret key** - Keep server-side only
2. **Validate webhooks** - Always verify webhook signatures
3. **Use HTTPS** - Required for production
4. **Rotate keys** - Periodically update API keys
5. **Monitor logs** - Watch for suspicious activity
6. **Test thoroughly** - Use test mode extensively
7. **Handle errors** - Graceful error handling
8. **Rate limiting** - Protect against abuse

## Resources

### Documentation
- [Stripe Docs](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Webhook Events](https://stripe.com/docs/api/events/types)
- [Testing Guide](https://stripe.com/docs/testing)

### Tools
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Webhook Tester](https://webhook.site)

### Support
- [Stripe Support](https://support.stripe.com)
- [Community Forum](https://stripe.com/community)
- [Status Page](https://status.stripe.com)

## Pricing ID Reference

After setup, document your Price IDs:

```typescript
// Development (Test Mode)
const TEST_PRICE_IDS = {
  pro_monthly: 'price_xxxxx',
  pro_yearly: 'price_yyyyy',
  enterprise_monthly: 'price_zzzzz',
  enterprise_yearly: 'price_aaaaa',
};

// Production (Live Mode)
const LIVE_PRICE_IDS = {
  pro_monthly: 'price_xxxxx',
  pro_yearly: 'price_yyyyy',
  enterprise_monthly: 'price_zzzzz',
  enterprise_yearly: 'price_aaaaa',
};
```

## Next Steps

After Stripe is configured:

1. ✅ Test all subscription flows
2. ✅ Test webhook handling
3. ✅ Test customer portal
4. ✅ Verify usage tracking
5. ✅ Test limit enforcement
6. ✅ Prepare for production launch

---

**Need Help?**
- Email: info@flowversal.com
- Phone: +91 97194 30007
- Stripe Support: support@stripe.com

**Estimated Setup Time**: 30-45 minutes
**Difficulty**: Intermediate
**Cost**: Free (Stripe takes 2.9% + $0.30 per transaction)
