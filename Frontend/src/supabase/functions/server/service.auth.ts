/**
 * Authentication Service
 * Business logic for user authentication and profile management
 */

import { supabase } from './utils.config.ts';
import { validateEmail, validatePassword } from './utils.validators.ts';
import { logInfo, logSuccess, logError } from './utils.helpers.ts';
import type { ApiResponse, User } from './types.ts';

const SERVICE = 'AuthService';

// ============================================================================
// User Registration
// ============================================================================

export async function createUser(
  email: string,
  password: string,
  name?: string
): Promise<ApiResponse<User>> {
  logInfo(SERVICE, `Creating user: ${email}`);

  // Validate inputs
  const emailValidation = validateEmail(email);
  if (!emailValidation.success) {
    return emailValidation;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.success) {
    return passwordValidation;
  }

  try {
    // Create user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name: name || email.split('@')[0],
        created_at: new Date().toISOString(),
      },
      // Automatically confirm email since email server isn't configured
      email_confirm: true,
    });

    if (error) {
      logError(SERVICE, 'Signup error', error);

      // Handle specific error cases
      if (error.message.includes('already registered')) {
        return {
          success: false,
          error: 'An account with this email already exists',
        };
      }

      return {
        success: false,
        error: error.message || 'Failed to create account',
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Failed to create user',
      };
    }

    logSuccess(SERVICE, `User created: ${data.user.id}`);

    return {
      success: true,
      data: {
        id: data.user.id,
        email: data.user.email!,
        user_metadata: {
          name: data.user.user_metadata?.name,
        },
      } as User,
    };
  } catch (error: any) {
    logError(SERVICE, 'Signup exception', error);
    return {
      success: false,
      error: 'Internal server error during signup',
    };
  }
}

// ============================================================================
// Profile Management
// ============================================================================

export async function updateUserProfile(
  userId: string,
  updates: {
    name?: string;
    avatar_url?: string;
  }
): Promise<ApiResponse<User>> {
  logInfo(SERVICE, `Updating profile for user: ${userId}`);

  try {
    // Get current user data
    const { data: currentUser, error: getUserError } = await supabase.auth.admin.getUserById(userId);

    if (getUserError || !currentUser.user) {
      logError(SERVICE, 'Failed to get user', getUserError);
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Update user metadata
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...currentUser.user.user_metadata,
        name: updates.name !== undefined ? updates.name : currentUser.user.user_metadata?.name,
        avatar_url: updates.avatar_url !== undefined ? updates.avatar_url : currentUser.user.user_metadata?.avatar_url,
        updated_at: new Date().toISOString(),
      },
    });

    if (error) {
      logError(SERVICE, 'Profile update error', error);
      return {
        success: false,
        error: error.message || 'Failed to update profile',
      };
    }

    logSuccess(SERVICE, `Profile updated for user: ${userId}`);

    return {
      success: true,
      data: {
        id: data.user.id,
        email: data.user.email!,
        user_metadata: {
          name: data.user.user_metadata?.name,
          avatar_url: data.user.user_metadata?.avatar_url,
        },
      } as User,
    };
  } catch (error: any) {
    logError(SERVICE, 'Update profile exception', error);
    return {
      success: false,
      error: 'Internal server error during profile update',
    };
  }
}

// ============================================================================
// User Retrieval
// ============================================================================

export async function getUserById(userId: string): Promise<ApiResponse<User>> {
  logInfo(SERVICE, `Getting user by ID: ${userId}`);

  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId);

    if (error || !data.user) {
      logError(SERVICE, 'Failed to get user', error);
      return {
        success: false,
        error: 'User not found',
      };
    }

    return {
      success: true,
      data: data.user as User,
    };
  } catch (error: any) {
    logError(SERVICE, 'Get user exception', error);
    return {
      success: false,
      error: 'Failed to retrieve user',
    };
  }
}
