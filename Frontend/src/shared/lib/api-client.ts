/**
 * Standardized API Client
 * 
 * Centralized API client for all backend communication.
 * Handles authentication, error handling, and request/response transformation.
 */
import { getApiUrl } from '../utils/env';
// ============================================================================
// TYPES
// ============================================================================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean;
}
// ============================================================================
// CONFIGURATION
// ============================================================================
const API_BASE_URL = getApiUrl();
// ============================================================================
// AUTHENTICATION
// ============================================================================
/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  try {
    const sessionStr = localStorage.getItem('flowversal_auth_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      return session.accessToken || null;
    }
  } catch (error) {
    console.warn('[API Client] Failed to get token from session:', error);
  }
  // Fallback to demo token in development
  if (import.meta.env.DEV) {
    return 'justin-access-token';
  }
  return null;
}
/**
 * Build request headers
 */
function buildHeaders(options: ApiRequestOptions = {}): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  // Add authorization header if required
  if (options.requireAuth !== false) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}
// ============================================================================
// API CLIENT
// ============================================================================
/**
 * Make API request
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const method = options.method || 'GET';
  // Build URL
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const url = `${cleanBase}${cleanEndpoint}`;
  // Log in development
  if (import.meta.env.DEV) {
    if (options.body) {
    }
  }
  try {
    // Build request config
    const config: RequestInit = {
      method,
      headers: buildHeaders(options),
    };
    // Add body for non-GET requests
    if (options.body && method !== 'GET') {
      config.body = JSON.stringify(options.body);
    }
    // Make request
    const response = await fetch(url, config);
    // Parse response
    let result: ApiResponse<T>;
    try {
      const text = await response.text();
      result = text ? JSON.parse(text) : { success: false };
    } catch (parseError) {
      console.error('[API Client] Failed to parse response:', parseError);
      return {
        success: false,
        error: 'Invalid response from server',
      };
    }
    // Handle non-OK responses
    if (!response.ok) {
      return {
        success: false,
        error: result.error || result.message || `Request failed with status ${response.status}`,
        details: result.details,
      };
    }
    // Return successful response
    return {
      success: true,
      data: result.data || result,
      ...result,
    };
  } catch (error: any) {
    console.error('[API Client] Request failed:', error);
    return {
      success: false,
      error: error.message || 'Network error',
      details: error,
    };
  }
}
// ============================================================================
// CONVENIENCE METHODS
// ============================================================================
export const api = {
  get: <T = any>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),
  put: <T = any>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),
  delete: <T = any>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
  patch: <T = any>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),
};
// ============================================================================
// EXPORTS
// ============================================================================
export default api;
