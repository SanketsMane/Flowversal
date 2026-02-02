# Subscription System Quick Reference

## 🎯 Quick Access

**Admin Panel**: `http://localhost:3000/` → Subscriptions tab
*(Root temporarily set to admin for testing)*

## 💳 Pricing Tiers

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| **Price** | $0 | $29/mo | $99/mo |
| **Workflows** | 3 | 50 | Unlimited |
| **Executions** | 100/mo | 10K/mo | Unlimited |
| **Storage** | 100 MB | 10 GB | Unlimited |
| **Team** | 1 | 5 | Unlimited |
| **Support** | Email | Priority | Dedicated |

## 🔧 Usage in Code

### Check Current Plan
```typescript
import { useSubscription } from './contexts/SubscriptionContext';

const { subscription } = useSubscription();
console.log(subscription?.tier); // 'free', 'pro', or 'enterprise'
```

### Check if Action Allowed
```typescript
const { canPerformAction } = useSubscription();

if (!canPerformAction('workflows')) {
  alert('Upgrade to create more workflows!');
  return;
}
```

### Track Usage
```typescript
const { updateUsage } = useSubscription();

await createWorkflow(data);
await updateUsage('workflows', 1);
```

### Upgrade User
```typescript
const { createCheckout } = useSubscription();

await createCheckout('pro', 'monthly'); // Redirects to Stripe
```

### Open Billing Portal
```typescript
const { openBillingPortal } = useSubscription();

await openBillingPortal(); // Opens in new tab
```

## 🌐 API Endpoints

Base: `https://PROJECT.supabase.co/functions/v1/make-server-020d2c80/subscription/`

- `GET /current` - Get subscription
- `POST /checkout` - Create checkout session
- `POST /portal` - Open billing portal
- `POST /cancel` - Cancel subscription
- `POST /resume` - Resume subscription
- `POST /usage` - Update usage
- `GET /billing` - Get billing info
- `POST /webhook` - Stripe webhooks

## 📊 Usage Limits

```typescript
type UsageLimits = {
  workflows: number;
  executions: number;
  storage: number;
  apiCalls: number;
  collaborators: number;
  templates: number;
  formSubmissions: number;
  webhooks: number;
};
```

## 🧪 Test Cards

**Success**: `4242 4242 4242 4242`  
**Declined**: `4000 0000 0000 0002`  
**3D Secure**: `4000 0027 6000 3184`

Expiry: Any future date  
CVC: Any 3 digits  
ZIP: Any 5 digits

## ⚙️ Environment Variables

### Frontend
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Backend (Supabase)
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...
STRIPE_PRICE_ENTERPRISE_YEARLY=price_...
```

## 🚀 Quick Setup

1. **Create Stripe Account**: [stripe.com](https://stripe.com)
2. **Get API Keys**: Dashboard → Developers → API keys
3. **Create Products**: Products → Add product
4. **Set Up Webhook**: Developers → Webhooks
5. **Configure Env Vars**: Add to `.env` and Supabase
6. **Enable Portal**: Settings → Billing → Customer portal
7. **Test**: Use test card `4242 4242 4242 4242`

## 📱 Common Operations

### Show Upgrade Modal
```typescript
if (subscription?.tier === 'free') {
  showUpgradeModal({
    title: 'Upgrade to Pro',
    feature: 'Create unlimited workflows',
    price: '$29/month'
  });
}
```

### Feature Gating
```typescript
const isPro = subscription?.tier !== 'free';

<Button disabled={!isPro}>
  {isPro ? 'Advanced Feature' : 'Upgrade for This'}
</Button>
```

### Display Usage
```typescript
const usage = subscription?.usage.workflows || 0;
const limit = SUBSCRIPTION_TIERS[tier].limits.workflows;
const percentage = (usage / limit) * 100;

<Progress value={percentage} />
<Text>{usage}/{limit} workflows used</Text>
```

## 🔔 Event Handlers

### Checkout Success
```typescript
// URL: /app?checkout=success&session_id=xxx
if (searchParams.get('checkout') === 'success') {
  await refreshSubscription();
  showSuccessMessage('Subscription activated!');
}
```

### Checkout Cancel
```typescript
// URL: /app?checkout=cancel
if (searchParams.get('checkout') === 'cancel') {
  showMessage('Checkout canceled');
}
```

## 🎨 UI Components

### Pricing Card
```typescript
<Card>
  <Badge>{tier.name}</Badge>
  <Price>${tier.price}/month</Price>
  <Features>{tier.features.map(f => ...)}</Features>
  <Button onClick={() => createCheckout(tier.tier, 'monthly')}>
    Upgrade Now
  </Button>
</Card>
```

### Usage Progress
```typescript
<UsageCard
  label="Workflows"
  current={usage.workflows}
  limit={limits.workflows}
  icon={<Zap />}
/>
```

## 🐛 Debug Commands

### Check Subscription
```typescript
const { subscription } = useSubscription();
console.log('Current plan:', subscription);
```

### Test Webhook
```bash
stripe listen --forward-to localhost:54321/functions/v1/make-server-020d2c80/subscription/webhook
```

### View Logs
```bash
# Supabase logs
supabase functions logs make-server-020d2c80

# Or in Dashboard:
# Supabase → Edge Functions → Logs
```

## 📚 Documentation

- **Full Guide**: `/docs/PHASE_3_STRIPE_SUBSCRIPTION.md`
- **Stripe Setup**: `/docs/STRIPE_SETUP.md`
- **Stripe Docs**: [stripe.com/docs](https://stripe.com/docs)

## 🆘 Support

**Issues?**
- Check `/docs/STRIPE_SETUP.md` troubleshooting section
- Email: info@flowversal.com
- Stripe Support: support@stripe.com

---

**Last Updated**: Phase 3 Complete
