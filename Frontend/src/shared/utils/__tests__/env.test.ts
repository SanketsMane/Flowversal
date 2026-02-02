/**
 * Environment Variables Utility Tests
 * 
 * These tests verify that environment variables can be safely accessed
 * without throwing errors.
 */

import { describe, it, expect } from 'vitest';
import { 
  getEnvVar, 
  isDevelopment, 
  isProduction,
  getApiUrl,
  getStripePublishableKey,
  getPineconeEnvironment,
} from '../env';

describe('Environment Utilities', () => {
  it('should return fallback when env var is not set', () => {
    const result = getEnvVar('VITE_NONEXISTENT_VAR', 'fallback');
    expect(result).toBe('fallback');
  });

  it('should return empty string as default fallback', () => {
    const result = getEnvVar('VITE_NONEXISTENT_VAR');
    expect(result).toBe('');
  });

  it('should not throw error when accessing undefined env', () => {
    expect(() => {
      getEnvVar('VITE_NONEXISTENT_VAR');
    }).not.toThrow();
  });

  it('should return environment mode', () => {
    const isDev = isDevelopment();
    const isProd = isProduction();
    expect(typeof isDev).toBe('boolean');
    expect(typeof isProd).toBe('boolean');
    expect(isDev || isProd).toBe(true);
  });

  it('should return API URL with fallback', () => {
    const url = getApiUrl();
    expect(url).toBeTruthy();
    expect(typeof url).toBe('string');
  });

  it('should return Stripe key (empty or set)', () => {
    const key = getStripePublishableKey();
    expect(typeof key).toBe('string');
  });

  it('should return Pinecone environment with fallback', () => {
    const env = getPineconeEnvironment();
    expect(env).toBe('us-west1-gcp'); // Default fallback
  });
});
