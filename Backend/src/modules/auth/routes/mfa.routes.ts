import { FastifyPluginAsync } from 'fastify';
import { mfaService } from '../services/mfa.service';
import { env } from '../../../core/config/env';

const mfaRoutes: FastifyPluginAsync = async (fastify) => {
  // Require authenticated user
  fastify.addHook('preHandler', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({ success: false, error: 'Unauthorized' });
    }
  });

  // Issue secret for setup
  fastify.post('/setup', async (request, reply) => {
    if (!env.MFA_ENFORCED && !request.user) {
      return reply.code(401).send({ success: false, error: 'Unauthorized' });
    }
    const secret = mfaService.generateSecret(request.user!.id);
    return reply.send({ success: true, secret });
  });

  // Enable MFA with provided secret and token
  fastify.post('/enable', async (request, reply) => {
    const { token, secret } = request.body as { token: string; secret: string };
    if (!token || !secret) {
      return reply.code(400).send({ success: false, error: 'Missing token or secret' });
    }
    const verified = await mfaService.verifyToken(request.user!.id, token);
    if (!verified) {
      return reply.code(400).send({ success: false, error: 'Invalid token' });
    }
    const backupCodes = await mfaService.enableMfa(request.user!.id, secret);
    return reply.send({ success: true, backupCodes });
  });

  // Verify MFA token (login step)
  fastify.post('/verify', async (request, reply) => {
    const { token, backupCode } = request.body as { token?: string; backupCode?: string };
    if (token) {
      const ok = await mfaService.verifyToken(request.user!.id, token);
      if (!ok) return reply.code(400).send({ success: false, error: 'Invalid token' });
      return reply.send({ success: true });
    }
    if (backupCode) {
      const ok = await mfaService.consumeBackupCode(request.user!.id, backupCode);
      if (!ok) return reply.code(400).send({ success: false, error: 'Invalid backup code' });
      return reply.send({ success: true });
    }
    return reply.code(400).send({ success: false, error: 'Token or backup code required' });
  });

  // Disable MFA
  fastify.post('/disable', async (request, reply) => {
    await mfaService.disableMfa(request.user!.id);
    return reply.send({ success: true });
  });
};

export default mfaRoutes;

