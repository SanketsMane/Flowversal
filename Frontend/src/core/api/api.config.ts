/**
 * API Configuration
 * 
 * This file centralizes all API endpoints and configuration.
 * When migrating to Node.js backend, only change the API_BASE_URL.
 * 
 * Current: Supabase Edge Functions (Deno)
 * Future: Node.js Backend (Express/Fastify/NestJS)
 */

import { supabase } from '@/shared/lib/supabase';
import { getApiUrl, getPineconeHost, getPineconeIndex, getStripePublishableKey } from '@/shared/utils/env';
import { projectId, publicAnonKey } from '@/shared/utils/supabase/info';

// ============================================================================
// BACKEND CONFIGURATION
// ============================================================================

/**
 * Backend Type
 * - 'supabase-edge': Deno-based Supabase Edge Functions (legacy)
 * - 'nodejs': Node.js backend (Fastify)
 */
export const BACKEND_TYPE: 'supabase-edge' | 'nodejs' = 'nodejs';

/**
 * API Base URL
 * 
 * CURRENT (Supabase Edge Functions):
 * https://{projectId}.supabase.co/functions/v1/make-server-020d2c80
 * 
 * FUTURE (Node.js Backend):
 * - Development: http://localhost:3001/api/v1
 * - Production: https://api.flowversal.com/api/v1
 */
export const API_BASE_URL = 
  BACKEND_TYPE === 'nodejs'
    ? getApiUrl()
    : `https://${projectId}.supabase.co/functions/v1/make-server-020d2c80`;

/**
 * API Endpoints
 * These paths work with both Supabase Edge Functions and Node.js backend
 */
export const API_ENDPOINTS = {
  // Health & Status
  health: '/health',
  
  // Authentication (handled by Supabase directly)
  auth: {
    signup: '/auth/signup',
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    session: '/auth/session',
  },

  // Users
  users: {
    me: '/users/me',
    onboarding: '/users/me/onboarding',
  },
  
  // Projects, Boards, Tasks
  projects: {
    list: '/projects',
    create: '/projects',
    update: (id: string) => `/projects/${id}`,
    delete: (id: string) => `/projects/${id}`,
  },
  
  boards: {
    list: '/projects/boards',
    create: '/projects/boards',
    update: (id: string) => `/projects/boards/${id}`,
    delete: (id: string) => `/projects/boards/${id}`,
  },
  
  tasks: {
    list: '/projects/tasks',
    create: '/projects/tasks',
    update: (id: string) => `/projects/tasks/${id}`,
    delete: (id: string) => `/projects/tasks/${id}`,
  },
  
  // Workflows (Node.js will handle these)
  workflows: {
    list: '/workflows',
    create: '/workflows',
    update: (id: string) => `/workflows/${id}`,
    delete: (id: string) => `/workflows/${id}`,
    execute: (id: string) => `/workflows/${id}/execute`,
    stop: (id: string) => `/workflows/${id}/stop`,
    // Execution endpoints
    getExecution: (executionId: string) => `/workflows/executions/${executionId}`,
    stopExecution: (executionId: string) => `/workflows/executions/${executionId}/stop`,
    listExecutions: (workflowId: string) => `/workflows/${workflowId}/executions`,
  },
  
  // AI Features (Node.js will handle these)
  ai: {
    chat: '/chat',
    generateWorkflow: '/ai/generate-workflow',
    semanticSearch: '/ai/search',
  },
  
  // Templates
  templates: {
    list: '/templates',
    get: (id: string) => `/templates/${id}`,
    install: (id: string) => `/templates/${id}/install`,
  },
  
  // Subscriptions (Stripe)
  subscriptions: {
    create: '/subscriptions/create-checkout',
    portal: '/subscriptions/portal',
    webhook: '/subscriptions/webhook',
    status: '/subscriptions/status',
  },
};

// ============================================================================
// AUTHENTICATION CONFIGURATION
// ============================================================================

/**
 * Auth Token Strategy
 * 
 * CURRENT: Demo tokens (justin-access-token, demo-access-token)
 * FUTURE: Supabase JWT tokens
 */
export const AUTH_CONFIG = {
  // Storage keys
  tokenKey: 'flowversal_auth_token',
  sessionKey: 'flowversal_session',
  
  // Token refresh
  refreshBeforeExpiry: 5 * 60 * 1000, // 5 minutes
  
  // Demo mode disabled (must use real Supabase tokens)
  demoMode: false,
  demoToken: '',
};

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

/**
 * Supabase Configuration
 * Used for: Auth, Storage, Database tables
 * NOT used for: Business logic (that's in Node.js backend)
 */
export const SUPABASE_CONFIG = {
  url: `https://${projectId}.supabase.co`,
  anonKey: publicAnonKey,
  
  // Tables (when using Supabase DB directly)
  tables: {
    projects: 'projects',
    boards: 'boards', 
    tasks: 'tasks',
    workflows: 'workflows',
    executions: 'workflow_executions',
    templates: 'workflow_templates',
  },
  
  // Storage buckets
  storage: {
    avatars: 'avatars',
    uploads: 'uploads',
    exports: 'exports',
  },
};

// ============================================================================
// EXTERNAL SERVICES CONFIGURATION
// ============================================================================

/**
 * External APIs (called from Node.js backend, NOT frontend)
 */
export const EXTERNAL_SERVICES = {
  openai: {
    // API key stored in Node.js backend environment
    baseUrl: 'https://api.openai.com/v1',
  },
  
  pinecone: {
    // API key stored in Node.js backend environment
    host: getPineconeHost(),
    index: getPineconeIndex(),
  },
  
  stripe: {
    // Public key (safe to expose)
    publishableKey: getStripePublishableKey(),
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build full API URL
 */
export function buildApiUrl(endpoint: string): string {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Ensure API_BASE_URL doesn't have trailing slash
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  
  // Build URL without double slashes
  return cleanEndpoint ? `${baseUrl}/${cleanEndpoint}` : baseUrl;
}

/**
 * Get auth headers
 */
export async function getAuthHeaders(token?: string): Promise<HeadersInit> {
  console.log('[API Config] Getting auth headers...');
  
  // If token is provided, use it
  if (token) {
    console.log('[API Config] Using provided token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }
  
  // Try to get token from auth session
  try {
    const sessionStr = localStorage.getItem('flowversal_auth_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      const authToken = session?.accessToken;
      if (authToken) {
        console.log('[API Config] Using token from session');
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        };
      }
      console.log('[API Config] No token in stored session, clearing it');
      localStorage.removeItem('flowversal_auth_session');
    }
  } catch (error) {
    console.warn('[API Config] Failed to get token from session:', error);
  }
  
  // Try Supabase client session (handles OAuth redirects)
  try {
    const { data, error } = await supabase.auth.getSession();
    if (!error && data.session?.access_token) {
      const supaToken = data.session.access_token;
      console.log('[API Config] Using token from Supabase session');
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supaToken}`,
      };
    }
  } catch (error) {
    console.warn('[API Config] Failed to get Supabase session:', error);
  }
  
  // No token available
  console.warn('[API Config] No auth token available; requests will be unauthorized');
  return {
    'Content-Type': 'application/json',
  };
}

/**
 * Check if backend is Node.js
 */
export function isNodeJsBackend(): boolean {
  return BACKEND_TYPE === 'nodejs';
}

/**
 * Check if backend is Supabase Edge Functions
 */
export function isSupabaseBackend(): boolean {
  return BACKEND_TYPE === 'supabase-edge';
}