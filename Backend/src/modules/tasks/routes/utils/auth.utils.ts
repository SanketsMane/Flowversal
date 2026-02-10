import { FastifyRequest, FastifyReply } from 'fastify';
import { supabaseClient } from '../../../../core/config/supabase.config';
export async function authenticateRequest(request: FastifyRequest, reply: FastifyReply): Promise<boolean> {
  // Extract token from Authorization header
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.code(401).send({
      success: false,
      error: 'Unauthorized',
      message: 'Missing or invalid authorization header',
    });
    return false;
  }
  const token = authHeader.substring(7);
  // Try Supabase first
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    if (user) {
      (request as any).user = {
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
      return true;
    }
  } catch (error) {
  }
  // If Supabase fails, try JWT token verification (legacy support)
  try {
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as any;
    if (decoded && decoded.userId) {
      (request as any).user = {
        id: decoded.userId,
        email: decoded.email || '',
      };
      return true;
    }
  } catch (jwtError) {
  }
  // If both fail, return unauthorized
  reply.code(401).send({
    success: false,
    error: 'Unauthorized',
    message: 'Authentication failed. Please check your credentials.',
  });
  return false;
}
