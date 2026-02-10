import { AuthenticatedUser } from '../core/middleware/jwt-auth.middleware';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
  interface FastifyInstance {
    authenticate: any;
  }
}
