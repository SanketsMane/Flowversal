import mongoose from 'mongoose';
import { eq } from 'drizzle-orm';
import { neonDb } from '../../../core/database/neon.config';
import { users } from '../../../core/database/schema/auth.schema';
import { User } from '../../../shared/types/auth.types';
import { decryptField, encryptField } from '../../../shared/utils/encryption.util';
import { IUser, UserModel } from '../models/User.model';

export interface CreateUserData {
  neonUserId: string;
  email: string;
  metadata?: Record<string, any>;
}

export interface UpdateUserData {
  fullName?: string | null;
  role?: string;
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
   * Find user by Neon ID
   */
  async findByNeonId(neonUserId: string): Promise<IUser | null> {
    if (mongoose.connection.readyState !== 1) {
       const { connectMongoDB } = require('../../../core/database/mongodb');
       await connectMongoDB();
    }
    return UserModel.findOne({ neonUserId });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
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
   * Create a new user (Neon-linked)
   */
  async createUser(data: CreateUserData): Promise<IUser> {
    const existingUser = await this.findByNeonId(data.neonUserId);
    if (existingUser) return existingUser;

    const emailValue = encryptField(data.email);
    const user = new UserModel({
      neonUserId: data.neonUserId,
      email: emailValue,
      metadata: data.metadata || {},
      supabaseId: `neon_${data.neonUserId}`, // Legacy compatibility
    });
    return user.save();
  }

  /**
   * Update user with sync to Neon PostgreSQL
   */
  async updateUser(userId: string, data: UpdateUserData): Promise<IUser | null> {
    if (mongoose.connection.readyState !== 1) {
       const { connectMongoDB } = require('../../../core/database/mongodb');
       await connectMongoDB();
    }
    const updateData: any = {};
    if (data.email) updateData.email = encryptField(data.email);
    if (data.metadata !== undefined) updateData.metadata = data.metadata;
    
    // Onboarding fields
    if (data.onboardingCompleted !== undefined) updateData.onboardingCompleted = data.onboardingCompleted;
    if (data.organizationName !== undefined) updateData.organizationName = data.organizationName;
    if (data.organizationSize !== undefined) updateData.organizationSize = data.organizationSize;
    if (data.referralSource !== undefined) updateData.referralSource = data.referralSource;
    if (data.automationExperience !== undefined) updateData.automationExperience = data.automationExperience;
    if (data.techStack !== undefined) updateData.techStack = data.techStack;
    if (data.automationGoal !== undefined) updateData.automationGoal = data.automationGoal;
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.role !== undefined) updateData.role = data.role;

    const mongoUser = await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    // Sync to Neon PostgreSQL (Single Source of Truth)
    if (mongoUser && mongoUser.neonUserId && neonDb) {
        try {
            await neonDb.update(users)
                .set({
                    onboardingCompleted: data.onboardingCompleted ?? undefined,
                    organizationName: data.organizationName,
                    organizationSize: data.organizationSize,
                    referralSource: data.referralSource,
                    automationExperience: data.automationExperience,
                    automationGoal: data.automationGoal,
                    techStack: data.techStack,
                    fullName: data.fullName,
                    role: data.role,
                })
                .where(eq(users.id, mongoUser.neonUserId));
        } catch (err: any) {
            console.error(`[UserService] Sync failed:`, err.message);
        }
    }

    return mongoUser;
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(userId);
    return result !== null;
  }

  /**
   * Ensure user exists in both Neon and MongoDB, returning the MongoDB user.
   * This is the single source of truth for loading a user into memory.
   * Author: Sanket - Unifies identity across systems
   */
  async ensureUser(id: string, email: string, fullName?: string | null, role?: string): Promise<IUser> {
    if (mongoose.connection.readyState !== 1) {
      const { connectMongoDB } = require('../../../core/database/mongodb');
      await connectMongoDB();
    }

    // 1. Try to find user in MongoDB by Neon ID
    let user = await UserModel.findOne({ neonUserId: id });
    if (user) {
      // Sync from Neon (SSOT) if role changed
      if (role && user.role !== role) {
          user.role = role as 'user' | 'admin' | 'super_admin';
          await user.save();
      }
      return user;
    }

    // 2. Fallback: Find by email (for legacy users not yet linked)
    const encryptedEmail = encryptField(email);
    user = await UserModel.findOne({ email: encryptedEmail });
    if (user) {
      user.neonUserId = id;
      if (role) user.role = role;
      await user.save();
      return user;
    }

    // 3. Create new user in MongoDB linked to Neon
    user = new UserModel({
      neonUserId: id,
      email: encryptedEmail,
      supabaseId: `neon_${id}`, // Keep for legacy compat
      metadata: {
          fullName: fullName,
          source: 'neon_auth',
      },
      role: (role as 'user' | 'admin' | 'super_admin') || 'user',
      onboardingCompleted: false,
    });
    
    return user.save();
  }

  /**
   * Get or create user from Neon Auth (Deprecated - use ensureUser)
   */
  async getOrCreateUserFromNeon(neonUser: { id: string; email: string; fullName?: string | null }): Promise<IUser> {
    return this.ensureUser(neonUser.id, neonUser.email, neonUser.fullName);
  }

  /**
   * Convert IUser to User type
   * Author: Sanket - Standardized ID mapping (id = MongoDB ID)
   */
  toUserType(user: IUser): User {
    const email = user.email ? decryptField(user.email) : '';
    return {
      id: user._id.toString(), // ALWAYS use MongoDB ID for internal logic
      neonUserId: user.neonUserId,
      email,
      full_name: user.metadata?.fullName || user.metadata?.full_name,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt ? user.updatedAt.toISOString() : user.createdAt.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : user.createdAt.toISOString(),
      role: user.role,
      onboardingCompleted: user.onboardingCompleted,
    };
  }

  async getUserProfile(userId: string): Promise<IUser | null> {
    return this.findById(userId);
  }

  async listUsers(page: number = 1, limit: number = 20): Promise<any> {
    const skip = (page - 1) * limit;
    const [usersList, total] = await Promise.all([
      UserModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      UserModel.countDocuments(),
    ]);
    return {
      users: usersList,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const userService = new UserService();
