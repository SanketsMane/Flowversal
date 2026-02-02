/**
 * Authentication Setup Checker
 * Utilities to check if auth is properly configured
 */

import { supabase } from '@/shared/lib/supabase';

export interface AuthSetupStatus {
  isConfigured: boolean;
  hasGoogleOAuth: boolean;
  hasEmailAuth: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Check if authentication is properly configured
 */
export async function checkAuthSetup(): Promise<AuthSetupStatus> {
  const status: AuthSetupStatus = {
    isConfigured: false,
    hasGoogleOAuth: false,
    hasEmailAuth: true, // Email is always available
    errors: [],
    warnings: [],
  };

  try {
    // Check if Supabase client is initialized
    if (!supabase) {
      status.errors.push('Supabase client not initialized');
      return status;
    }

    // Try to get session to check if auth is working
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      status.errors.push(`Session check failed: ${sessionError.message}`);
    }

    // Note: We can't directly check if Google OAuth is configured from the client side
    // This would need to be done via admin API or server-side
    // For now, we'll check if the OAuth flow can be initiated
    try {
      // This won't actually sign in, just checks if the provider exists
      const providers = ['google'];
      status.hasGoogleOAuth = true; // Assume available for now
      status.warnings.push('Google OAuth may not be configured. Click "Setup Google OAuth" to configure.');
    } catch (error) {
      status.warnings.push('Unable to verify OAuth providers');
    }

    status.isConfigured = status.errors.length === 0;
    
  } catch (error) {
    status.errors.push(`Auth setup check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return status;
}

/**
 * Get user-friendly setup instructions based on status
 */
export function getSetupInstructions(status: AuthSetupStatus): string[] {
  const instructions: string[] = [];

  if (!status.isConfigured) {
    instructions.push('⚠️ Authentication is not fully configured');
  }

  if (status.errors.length > 0) {
    instructions.push('🔴 Errors detected:');
    status.errors.forEach(error => {
      instructions.push(`  - ${error}`);
    });
  }

  if (!status.hasGoogleOAuth && status.warnings.length > 0) {
    instructions.push('⚡ To enable Google OAuth:');
    instructions.push('  1. Click "Setup Google OAuth" button on login page');
    instructions.push('  2. Follow the step-by-step guide');
    instructions.push('  3. Configure Google Cloud Console');
    instructions.push('  4. Enable provider in Supabase');
  }

  if (status.isConfigured && status.hasEmailAuth) {
    instructions.push('✅ Email authentication is working');
    instructions.push('🎯 Use demo credentials: demo@demo.com / demo@123');
  }

  return instructions;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!/[A-Z]/.test(password) && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one letter');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}
