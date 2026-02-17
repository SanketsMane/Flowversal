import mongoose from 'mongoose';
import { supabaseAdmin } from '../../../core/config/supabase.config';
import { User } from '../../../shared/types/auth.types';
import { decryptField, encryptField } from '../../../shared/utils/encryption.util';
import { IUser, UserModel } from '../models/User.model';
export interface CreateUserData {
  supabaseId: string;
  email: string;
  metadata?: Record<string, any>;
}
export interface UpdateUserData {
  email?: string;
  metadata?: Record<string, any>;
  onboardingCompleted?: boolean;
  organizationName?: string;
  organizationSize?: string;
  referralSource?: string;
  automationExperience?: string;
  techStack?: string[];
  automationGoal?: string;
}
export class UserService {
  /**
   * Find user by Supabase ID
   */
  async findBySupabaseId(supabaseId: string): Promise<IUser | null> {
    if (mongoose.connection.readyState !== 1) {
       const { connectMongoDB } = require('../../../core/database/mongodb');
       await connectMongoDB();
    }
    return UserModel.findOne({ supabaseId });
  }
  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    // Always encrypt emails for security and GDPR compliance
    const encryptedEmail = encryptField(email);
    return UserModel.findOne({ email: encryptedEmail });
  }
  /**
   * Find user by MongoDB ID
   */
  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id);
  }
  /**
   * Get user model by MongoDB ID (alias for findById for clarity)
   */
  async getUserModel(id: string): Promise<IUser | null> {
    return this.findById(id);
  }
  /**
   * Create a new user (sync from Supabase)
   */
  async createUser(data: CreateUserData): Promise<IUser> {
    // Check if user already exists
    const existingUser = await this.findBySupabaseId(data.supabaseId);
    if (existingUser) {
      return existingUser;
    }
    // Always encrypt emails for security and GDPR compliance
    const emailValue = encryptField(data.email);
    const user = new UserModel({
      supabaseId: data.supabaseId,
      email: emailValue,
      metadata: data.metadata || {},
    });
    return user.save();
  }
  /**
   * Update user
   */
  async updateUser(userId: string, data: UpdateUserData): Promise<IUser | null> {
    if (mongoose.connection.readyState !== 1) {
       const { connectMongoDB } = require('../../../core/database/mongodb');
       await connectMongoDB();
    }
    const updateData: any = {};
    if (data.email) {
      updateData.email = encryptField(data.email);
    }
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata;
    }
    // Onboarding fields
    if (data.onboardingCompleted !== undefined) updateData.onboardingCompleted = data.onboardingCompleted;
    if (data.organizationName !== undefined) updateData.organizationName = data.organizationName;
    if (data.organizationSize !== undefined) updateData.organizationSize = data.organizationSize;
    if (data.referralSource !== undefined) updateData.referralSource = data.referralSource;
    if (data.automationExperience !== undefined) updateData.automationExperience = data.automationExperience;
    if (data.techStack !== undefined) updateData.techStack = data.techStack;
    if (data.automationGoal !== undefined) updateData.automationGoal = data.automationGoal;
    return UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });
  }
  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(userId);
    return result !== null;
  }
  /**
   * Get or create user from Supabase auth
   * This syncs the user from Supabase to MongoDB
   */
    async getOrCreateUserFromSupabase(supabaseUserId: string, userData?: any): Promise<IUser> {
    try {
      // Ensure DB is connected
      if (mongoose.connection.readyState !== 1) {
          const { connectMongoDB } = require('../../../core/database/mongodb');
          await connectMongoDB();
      }
      // Check if user exists in MongoDB
      let user = await this.findBySupabaseId(supabaseUserId);
      if (user) {
        // 
        return user;
      }
      // Try to create user using JWT data first (more reliable)
      if (userData) {
        try {
          user = await this.createUser({
            supabaseId: supabaseUserId,
            email: userData.email || '',
            metadata: {
              name: userData.user_metadata?.name || userData.user_metadata?.full_name || '',
              avatar: userData.user_metadata?.avatar_url || userData.user_metadata?.picture || '',
              lastSyncedAt: new Date().toISOString(),
            },
          });
          return user;
        } catch (createError: any) {
          // If duplicate key error, it means another request created the user in the meantime
          if (createError.code === 11000) {
            const existingUser = await this.findBySupabaseId(supabaseUserId);
            if (existingUser) return existingUser;
          }
          console.warn(`[UserService] Failed to create user from JWT data, trying Supabase admin:`, createError);
        }
      }
      // Fallback: Fetch user from Supabase admin API
      try {
        const { data: supabaseUser, error } = await supabaseAdmin.auth.admin.getUserById(
          supabaseUserId
        );
        if (error || !supabaseUser) {
          console.error(`[UserService] Failed to fetch user from Supabase:`, error);
          throw new Error(`User not found in Supabase: ${error?.message || 'Unknown error'}`);
        }
        if (!supabaseUser.user) {
          throw new Error('Supabase user data is missing');
        }
        // Create user in MongoDB
        try {
          user = await this.createUser({
            supabaseId: supabaseUserId,
            email: supabaseUser.user.email || '',
            metadata: {
              ...supabaseUser.user.user_metadata,
              lastSyncedAt: new Date().toISOString(),
            },
          });
        } catch (createError: any) {
           // Handle race condition again
           if (createError.code === 11000) {
             const existingUser = await this.findBySupabaseId(supabaseUserId);
             if (existingUser) return existingUser;
           }
           throw createError;
        }
        return user;
      } catch (supabaseError: any) {
        // Final check for race condition
        if (supabaseError.code === 11000) {
             const existingUser = await this.findBySupabaseId(supabaseUserId);
             if (existingUser) return existingUser;
        }
        console.error(`[UserService] Supabase admin API failed:`, supabaseError);
        throw new Error('Unable to create or retrieve user account. Please contact support.');
      }
    } catch (error: any) {
      console.error(`[UserService] Error syncing user from Supabase to MongoDB:`, error);
      throw error;
    }
  }
  /**
   * Get or create user from Neon Auth
   * Author: Sanket
   * Synchronizes users from Neon PostgreSQL to MongoDB with proper encryption
   */
  async getOrCreateUserFromNeon(neonUser: { id: string; email: string; fullName?: string | null }): Promise<IUser> {
    // Ensure DB is connected before proceeding - Author: Sanket
    if (mongoose.connection.readyState !== 1) {
      const { connectMongoDB } = require('../../../core/database/mongodb');
      await connectMongoDB();
    }

    // 1. Check if user exists by neonUserId
    const existingUser = await UserModel.findOne({ neonUserId: neonUser.id });
    if (existingUser) {
      return existingUser;
    }

    // 2. Check by email (migration scenario) - Author: Sanket
    // Must encrypt email before searching MongoDB
    const legacyUser = await this.findByEmail(neonUser.email);
    if (legacyUser) {
        // Link Neon ID to legacy user
        legacyUser.neonUserId = neonUser.id;
        await legacyUser.save();
        return legacyUser;
    }

    // 3. Create new user - Author: Sanket
    // Ensure email is encrypted for storage
    const encryptedEmail = encryptField(neonUser.email);
    const newUser = new UserModel({
      neonUserId: neonUser.id,
      email: encryptedEmail,
      supabaseId: `neon_${neonUser.id}`, // Maintain compatibility with older systems
      metadata: {
          fullName: neonUser.fullName,
          source: 'neon_auth',
      },
      onboardingCompleted: false,
    });
    return newUser.save();
  }
  /**
   * Convert IUser to User type
   */
  toUserType(user: IUser): User {
    // Decrypt email (all emails are encrypted)
    const email = user.email ? decryptField(user.email) : '';
    return {
      id: user._id.toString(),
      email,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
      // Include onboarding status
      onboardingCompleted: user.onboardingCompleted,
    };
  }
  /**
   * Get user profile with additional data
   */
  async getUserProfile(userId: string): Promise<IUser | null> {
    return this.findById(userId);
  }
  /**
   * List users with pagination
   */
  async listUsers(page: number = 1, limit: number = 20): Promise<{
    users: IUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      UserModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      UserModel.countDocuments(),
    ]);
    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
export const userService = new UserService();
