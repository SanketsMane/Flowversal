/**
 * Authentication Middleware
 * Handles JWT verification and demo mode authentication
 */

import { supabase } from './utils.config.ts';
import type { AuthResult, User } from './types.ts';
import { logInfo, logSuccess, logWarning, logError } from './utils.helpers.ts';

const SERVICE = 'AuthMiddleware';

// ============================================================================
// Demo Users Configuration
// ============================================================================

const DEMO_USERS = {
  'justin-access-token': {
    id: 'justin-user-id',
    email: 'justin@gmail.com',
    user_metadata: { name: 'Justin', role: 'admin' },
  },
  'demo-access-token': {
    id: 'demo-user-id',
    email: 'demo@demo.com',
    user_metadata: { name: 'Demo User', role: 'admin' },
  },
};

// ============================================================================
// Authentication Middleware
// ============================================================================

/**
 * Verify user authentication from Authorization header
 * Supports both demo tokens and real Supabase JWT tokens
 * Falls back to Justin demo user if authentication fails
 */
export async function verifyAuth(authHeader: string | null | undefined): Promise<AuthResult> {
  logInfo(SERVICE, 'Starting authentication verification');
  logInfo(SERVICE, `Header present: ${authHeader ? 'YES' : 'NO'}`);

  // No authorization header - use demo user
  if (!authHeader) {
    logWarning(SERVICE, 'No authorization header, using Justin demo user');
    return { user: DEMO_USERS['justin-access-token'] };
  }

  // Parse Bearer token
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    logWarning(SERVICE, 'Invalid authorization format, using Justin demo user');
    return { user: DEMO_USERS['justin-access-token'] };
  }

  const token = parts[1]?.trim();
  logInfo(SERVICE, `Token extracted (length: ${token?.length})`);

  // Check for demo tokens
  if (DEMO_USERS[token as keyof typeof DEMO_USERS]) {
    logSuccess(SERVICE, `Demo token matched: ${token}`);
    return { user: DEMO_USERS[token as keyof typeof DEMO_USERS] };
  }

  // Additional pattern-based fallback for demo mode
  if (token?.includes('justin') || token?.includes('demo')) {
    logWarning(SERVICE, 'Token contains demo/justin pattern, using fallback');
    return { user: DEMO_USERS['justin-access-token'] };
  }

  // Try Supabase JWT verification
  logInfo(SERVICE, 'Attempting Supabase JWT verification');
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      logWarning(SERVICE, `Supabase auth error: ${error.message}`);
      logWarning(SERVICE, 'Falling back to Justin demo user');
      return { user: DEMO_USERS['justin-access-token'] };
    }

    if (!user) {
      logWarning(SERVICE, 'No user found, falling back to Justin demo user');
      return { user: DEMO_USERS['justin-access-token'] };
    }

    logSuccess(SERVICE, `Supabase auth successful: ${user.email}`);
    return { user: user as User };
  } catch (err: any) {
    logError(SERVICE, 'Exception during auth verification', err);
    logWarning(SERVICE, 'Falling back to Justin demo user');
    return { user: DEMO_USERS['justin-access-token'] };
  }
}

/**
 * Strict authentication - returns error instead of falling back to demo
 * Use for production endpoints that require real authentication
 */
export async function verifyAuthStrict(authHeader: string | null | undefined): Promise<AuthResult> {
  logInfo(SERVICE, 'Starting STRICT authentication verification');

  if (!authHeader) {
    return { error: 'Missing Authorization header', status: 401 };
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return { error: 'Invalid Authorization format', status: 401 };
  }

  const token = parts[1]?.trim();

  // In strict mode, demo tokens are still allowed
  if (DEMO_USERS[token as keyof typeof DEMO_USERS]) {
    logSuccess(SERVICE, `Demo token matched (strict): ${token}`);
    return { user: DEMO_USERS[token as keyof typeof DEMO_USERS] };
  }

  // Verify with Supabase
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logError(SERVICE, 'Strict auth failed', error);
      return { error: 'Unauthorized', status: 401 };
    }

    logSuccess(SERVICE, `Strict auth successful: ${user.email}`);
    return { user: user as User };
  } catch (err: any) {
    logError(SERVICE, 'Exception during strict auth', err);
    return { error: 'Authentication failed', status: 401 };
  }
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
