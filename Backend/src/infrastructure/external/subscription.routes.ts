import { FastifyPluginAsync } from 'fastify';
import { billingService } from './subscription/billing.service';
import { ensureAuth } from './subscription/utils/auth';

const subscriptionRoutes: FastifyPluginAsync = async (fastify) => {
  // Get current subscription
  fastify.get('/current', { preHandler: ensureAuth }, async (request, reply) => {
    try {
      const userId = (request as any).user?.id;
      const subscription = await billingService.getSubscription(userId);
      return reply.send({ success: true, subscription });
    } catch (error: any) {
      return reply.code(500).send({ success: false, error: error.message || 'Failed to fetch subscription' });
    }
  });

  // Create checkout session
  fastify.post('/checkout', { preHandler: ensureAuth }, async (request, reply) => {
    try {
      const userId = (request as any).user?.id;
      const body = request.body as { tier: string; billingCycle: 'monthly' | 'yearly' };
      const sessionUrl = await billingService.createCheckoutSession(userId, body.tier, body.billingCycle);
      return reply.send({ success: true, sessionUrl });
    } catch (error: any) {
      return reply.code(500).send({ success: false, error: error.message || 'Failed to create checkout session' });
    }
  });

  // Create portal session
  fastify.post('/portal', { preHandler: ensureAuth }, async (request, reply) => {
    try {
      const userId = (request as any).user?.id;
      const portalUrl = await billingService.createPortalSession(userId);
      return reply.send({ success: true, portalUrl });
    } catch (error: any) {
      return reply.code(500).send({ success: false, error: error.message || 'Failed to create portal session' });
    }
  });

  // Cancel subscription
  fastify.post('/cancel', { preHandler: ensureAuth }, async (request, reply) => {
    try {
      const userId = (request as any).user?.id;
      const result = await billingService.cancelSubscription(userId);
      return reply.send({ success: true, ...result });
    } catch (error: any) {
      return reply.code(500).send({ success: false, error: error.message || 'Failed to cancel subscription' });
    }
  });

  // Resume subscription
  fastify.post('/resume', { preHandler: ensureAuth }, async (request, reply) => {
    try {
      const userId = (request as any).user?.id;
      const result = await billingService.resumeSubscription(userId);
      return reply.send({ success: true, ...result });
    } catch (error: any) {
      return reply.code(500).send({ success: false, error: error.message || 'Failed to resume subscription' });
    }
  });

  // Webhook endpoint (no auth)
  fastify.post('/webhook', async (request, reply) => {
    try {
      const signature = request.headers['stripe-signature'] as string | undefined;
      // For webhooks, we need the raw body as a string
      const rawBody = request.body as any;
      const result = await billingService.handleWebhook(rawBody, signature);
      return reply.send({ received: true, result });
    } catch (error: any) {
      return reply.code(400).send({ error: error.message || 'Webhook error' });
    }
  });

  // Feature-flag: if billing is disabled, expose a simple “disabled” response
  fastify.get('/status', async (_req, reply) => {
    const enabled = billingService.isEnabled();
    return reply.send({ success: true, enabled, message: enabled ? 'Billing enabled' : 'Billing disabled' });
  });
};

export default subscriptionRoutes;

