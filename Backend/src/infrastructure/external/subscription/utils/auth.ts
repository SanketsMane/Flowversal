import { FastifyRequest, FastifyReply } from 'fastify';

export async function ensureAuth(request: FastifyRequest, reply: FastifyReply) {
  if (!(request as any).user) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'User not authenticated',
    });
  }
}

