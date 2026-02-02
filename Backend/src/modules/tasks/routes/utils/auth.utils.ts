import { FastifyRequest, FastifyReply } from 'fastify';
import { supabaseClient } from '../../../../core/config/supabase.config';

export async function authenticateRequest(request: FastifyRequest, reply: FastifyReply): Promise<boolean> {
  console.log(`[Task Route Auth] ===== AUTHENTICATING REQUEST =====`);
  console.log(`[Task Route Auth] URL: ${request.url}`);

  // Extract token from Authorization header
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(`[Task Route Auth] No auth header`);
    reply.code(401).send({
      success: false,
      error: 'Unauthorized',
      message: 'Missing or invalid authorization header',
    });
    return false;
  }

  const token = authHeader.substring(7);
  console.log(`[Task Route Auth] Token: ${token.substring(0, 20)}...`);

  // Try Supabase first
  try {
    console.log(`[Task Route Auth] Trying Supabase verification...`);
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);

    console.log(`[Task Route Auth] Supabase response - user exists: ${!!user}, error:`, error);

    if (user) {
      (request as any).user = {
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
      console.log(`[Task Route Auth] Supabase auth successful for user: ${user.email}`);
      return true;
    }

    console.log(`[Task Route Auth] Supabase auth failed:`, error?.message);
  } catch (error) {
    console.log(`[Task Route Auth] Supabase auth error:`, error);
  }

  // If Supabase fails, try JWT token verification (legacy support)
  try {
    console.log(`[Task Route Auth] Trying JWT verification...`);
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'your-secret-key';

    const decoded = jwt.verify(token, secret) as any;
    console.log(`[Task Route Auth] JWT decoded:`, decoded);

    if (decoded && decoded.userId) {
      (request as any).user = {
        id: decoded.userId,
        email: decoded.email || '',
      };
      console.log(`[Task Route Auth] JWT auth successful for user: ${decoded.email}`);
      return true;
    }

    console.log(`[Task Route Auth] JWT verification failed`);
  } catch (jwtError) {
    console.log(`[Task Route Auth] JWT error:`, jwtError);
  }

  // If both fail, return unauthorized
  console.log(`[Task Route Auth] All auth methods failed`);
  reply.code(401).send({
    success: false,
    error: 'Unauthorized',
    message: 'Authentication failed. Please check your credentials.',
  });

  return false;
}
