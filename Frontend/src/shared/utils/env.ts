/**
 * Environment Variables Utility
 * 
 * Safe access to Vite environment variables with proper fallbacks.
 * This prevents "Cannot read properties of undefined" errors.
 */
/**
 * Safely get environment variable
 */
function getEnvVar(key: string, fallback: string = ''): string {
  try {
    // Check if import.meta is available (Vite environment)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const value = import.meta.env[key];
      return value !== undefined ? String(value) : fallback;
    }
    return fallback;
  } catch (error) {
    console.warn(`Failed to access environment variable: ${key}`, error);
    return fallback;
  }
}
/**
 * Get environment variable with validation
 */
function getRequiredEnvVar(key: string): string {
  const value = getEnvVar(key);
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}
/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return getEnvVar('MODE', 'development') === 'development';
}
/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return getEnvVar('MODE', 'development') === 'production';
}
/**
 * Get API URL for Node.js backend
 */
export function getApiUrl(): string {
  // Default to relative proxy path so Vite dev server can proxy to backend
  return getEnvVar('VITE_API_URL', '/api/v1');
}
/**
 * Get Stripe publishable key
 */
export function getStripePublishableKey(): string {
  return getEnvVar('VITE_STRIPE_PUBLISHABLE_KEY', '');
}
/**
 * Get Pinecone environment
 */
export function getPineconeEnvironment(): string {
  return getEnvVar('VITE_PINECONE_ENV', 'us-west1-gcp');
}
/**
 * Get Pinecone host URL (new API - replaces environment)
 */
export function getPineconeHost(): string {
  return getEnvVar('VITE_PINECONE_HOST', '');
}
/**
 * Get Pinecone index name
 */
export function getPineconeIndex(): string {
  return getEnvVar('VITE_PINECONE_INDEX', 'flowversal-vectors');
}
/**
 * Get all environment variables (for debugging)
 */
export function getAllEnvVars(): Record<string, string> {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // Only return VITE_ prefixed variables for security
      const env: Record<string, string> = {};
      Object.keys(import.meta.env).forEach((key) => {
        if (key.startsWith('VITE_')) {
          env[key] = String(import.meta.env[key]);
        }
      });
      return env;
    }
    return {};
  } catch (error) {
    console.warn('Failed to access environment variables', error);
    return {};
  }
}
/**
 * Log environment configuration (for debugging)
 */
export function logEnvConfig(): void {
  if (isDevelopment()) {
  }
}
// Export the main getter functions
export { getEnvVar, getRequiredEnvVar };