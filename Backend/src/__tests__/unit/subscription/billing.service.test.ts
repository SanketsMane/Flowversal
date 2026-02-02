/**
 * Billing service (Stripe) - disabled mode tests
 * Ensures we return sensible defaults when Stripe is not configured.
 */

describe('billingService (disabled)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env.STRIPE_SECRET_KEY = '';
    process.env.GCS_BUCKET = '';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('isEnabled should be false when no STRIPE_SECRET_KEY', () => {
    const { BillingService } = require('../../../infrastructure/external/subscription/billing.service');
    const service = new BillingService('');
    expect(service.isEnabled()).toBe(false);
  });

  it('getSubscription should return free/disabled when billing is off', async () => {
    const { BillingService } = require('../../../infrastructure/external/subscription/billing.service');
    const service = new BillingService('');
    const sub = await service.getSubscription('user-123');
    expect(sub.tier).toBe('free');
    expect(sub.status).toBe('disabled');
  });
});

