/**
 * Authentication Middleware
 * Production-secure JWT verification - NO DEMO/TEST USERS
 * Author: Sanket
 */

import type { AuthResult, User } from './types.ts';
import { supabase } from './utils.config.ts';
import { logError, logInfo, logSuccess } from './utils.helpers.ts';

const SERVICE = 'AuthMiddleware';

// ============================================================================
// Strict Authentication Only - No Fallbacks
// ============================================================================

/**
 * Verify user authentication from Authorization header
 * Production mode: Returns error if authentication fails
 * NO demo users, NO fallbacks, STRICT validation only
 */
export async function verifyAuth(authHeader: string | null | undefined): Promise<AuthResult> {
  logInfo(SERVICE, 'Starting authentication verification');
  
  // No authorization header - reject
  if (!authHeader) {
    logError(SERVICE, 'Missing Authorization header');
    return { error: 'Missing Authorization header', status: 401 };
  }

  // Parse Bearer token
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    logError(SERVICE, 'Invalid Authorization format - expected "Bearer <token>"');
    return { error: 'Invalid Authorization format', status: 401 };
  }

  const token = parts[1]?.trim();
  
  if (!token || token.length === 0) {
    logError(SERVICE, 'Empty authorization token');
    return { error: 'Invalid authorization token', status: 401 };
  }

  logInfo(SERVICE, `Verifying JWT token (length: ${token.length})`);

  // Verify with Supabase - only valid JWT tokens allowed
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      logError(SERVICE, `Supabase auth error: ${error.message}`);
      return { error: 'Invalid or expired token', status: 401 };
    }

    if (!user) {
      logError(SERVICE, 'No user found for provided token');
      return { error: 'Unauthorized - user not found', status: 401 };
    }

    logSuccess(SERVICE, `Authentication successful: ${user.email}`);
    return { user: user as User };
    
  } catch (err: any) {
    logError(SERVICE, 'Exception during authentication', err);
    return { error: 'Authentication failed', status: 500 };
  }
}

/**
 * Strict authentication (same as verifyAuth now - kept for compatibility)
 * Use for production endpoints that require real authentication
 */
export async function verifyAuthStrict(authHeader: string | null | undefined): Promise<AuthResult> {
  // In production mode, both functions behave identically - strict auth only
  return verifyAuth(authHeader);
}

/**
 * Extract user from auth result or return error response
 */
export function requireAuth(authResult: AuthResult): { user: User } | { error: string; status: number } {
  if ('error' in authResult && authResult.error) {
    return { error: authResult.error, status: authResult.status || 401 };
  }

  if (!authResult.user) {
    return { error: 'Unauthorized', status: 401 };
  }

  return { user: authResult.user };
}
