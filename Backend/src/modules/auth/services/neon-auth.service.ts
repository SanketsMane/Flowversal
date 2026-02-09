// Author: Sanket
// Authentication Service using Neon PostgreSQL
// Replaces Supabase Auth functionality

import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { env } from '../../../core/config/env';
import { neonDb } from '../../../core/database/neon.config'; // Using the singleton instance
import { NewSession, NewUser, sessions, users } from '../../../core/database/schema/auth.schema';
import { logger } from '../../../shared/utils/logger.util';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName?: string | null;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: 'bearer';
  };
}

export class NeonAuthService {
  private db = neonDb;
  private SALT_ROUNDS = 10;

  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, fullName?: string): Promise<AuthResponse> {
    // 1. Check if user already exists
    const existingUser = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length > 0) {
      throw new Error('User already exists');
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // 3. Create user
    const newUser: NewUser = {
      email,
      passwordHash,
      fullName: fullName || undefined,
      emailVerified: false, // Default to false
    };

    const [createdUser] = await this.db.insert(users).values(newUser).returning();

    if (!createdUser) {
      throw new Error('Failed to create user');
    }

    // 4. Generate session
    return this.createSession(createdUser.id, createdUser.email, createdUser.fullName);
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    // 1. Find user
    const [user] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // 3. Generate session
    return this.createSession(user.id, user.email, user.fullName);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshSession(refreshToken: string): Promise<AuthResponse> {
    try {
      // 1. Verify refresh token signature
      const decoded = jwt.verify(refreshToken, env.JWT_SECRET) as any;
      if (!decoded || !decoded.sessionId) {
        throw new Error('Invalid token payload');
      }

      // 2. Check if session exists in DB
      const [session] = await this.db.select().from(sessions).where(eq(sessions.id, decoded.sessionId)).limit(1);
      
      if (!session) {
        throw new Error('Session not found or expired');
      }

      // 3. Check expiry
      if (new Date() > session.expiresAt) {
        // Build cleanup - delete expired session
        await this.db.delete(sessions).where(eq(sessions.id, session.id));
        throw new Error('Session expired');
      }

      // 4. Verify user exists
      const [user] = await this.db.select().from(users).where(eq(users.id, session.userId)).limit(1);
      if (!user) {
        throw new Error('User not found');
      }

      // 5. Generate NEW session (rotate refresh token for security)
      // Optional: Delete old session or keep it valid until expiry? 
      // Security best practice: Rotate token.
      await this.db.delete(sessions).where(eq(sessions.id, session.id));

      return this.createSession(user.id, user.email, user.fullName);

    } catch (error) {
       logger.error('Refresh token failed', error);
       throw new Error('Invalid refresh token');
    }
  }

  /**
   * Helper to create session and tokens
   */
  private async createSession(userId: string, email: string, fullName: string | null = null): Promise<AuthResponse> {
    // 1. Parse expiry
    const expiresInStr = env.JWT_EXPIRES_IN || '7d';
    // parse '7d' logic roughly or just set Date directly
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Hardcoded 7 days for DB persistence if env parsing is complex, or use ms if env is number

    // 2. Create DB Session Entry first to get ID
    // We need a unique placeholder or generate ID first?
    // Drizzle defaults defaultRandom() for ID, so we insert and get ID.
    
    // Actually, we need to sign the JWT *with* the session ID to link them.
    // So we need to insert first.
    // But we also want the token stored in the session? Circular?
    // Pattern:
    // a. Create Session Record (with temp token or null?) -> Get SessionID
    // b. Generate Refresh Token (include SessionID payload)
    // c. Update Session Record with Refresh Token hash (or value if we trust database security)

    // Simplified approach: 
    // Generate Random Token String (opaque) -> Store in DB
    // Or Use JWT as Refresh Token?
    // Let's use JWT as Refresh Token.
    
    // Step A: Insert Session with dummy token
    const newSessionValues: NewSession = {
        userId,
        token: 'pending', // Placeholder
        expiresAt: expiresAt,
    };
    
    const [session] = await this.db.insert(sessions).values(newSessionValues).returning();
    
    // Step B: Generate Tokens
    const accessToken = jwt.sign(
      { userId, email, type: 'access' }, 
      env.JWT_SECRET, 
      { expiresIn: '15m' } as jwt.SignOptions // Explicit cast to fix overload issue
    );

    const refreshToken = jwt.sign(
      { userId, sessionId: session.id, type: 'refresh' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
    );

    // Step C: Update Session with real refresh token
    await this.db.update(sessions)
      .set({ token: refreshToken })
      .where(eq(sessions.id, session.id));

    return {
      user: {
        id: userId,
        email,
        fullName,
      },
      session: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 900, // 15 min
        token_type: 'bearer',
      },
    };
  }
  
  /**
   * Request a password reset.
   * Generates a password reset token and sends it (in a real app, this would be emailed).
   */
  async requestPasswordReset(email: string): Promise<void> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      // For security, don't reveal if the email exists or not
      logger.warn(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    // Generate a unique, time-limited token
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      env.JWT_SECRET,
      { expiresIn: '1h' } // Token valid for 1 hour
    );

    // In a real application, you would store this token in the database
    // associated with the user, and send it to the user's email.
    // For this example, we'll just log it.
    logger.info(`Password reset token for ${email}: ${resetToken}`);

    // You would typically send an email here:
    // await emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  /**
   * Reset user's password using a valid reset token.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;

      if (!decoded || decoded.type !== 'password_reset' || !decoded.userId) {
        throw new Error('Invalid or expired password reset token');
      }

      // In a real application, you would also verify this token against
      // a stored token in the database to ensure it hasn't been used or revoked.

      const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

      await this.db.update(users)
        .set({ passwordHash })
        .where(eq(users.id, decoded.userId));

      // In a real application, you might also invalidate the token in the database
      // to prevent reuse.
      logger.info(`Password for user ${decoded.userId} has been reset.`);

    } catch (error) {
      logger.error('Password reset failed', error);
      throw new Error('Invalid or expired password reset token');
    }
  }

  async getUserById(userId: string): Promise<{ id: string; email: string; fullName?: string | null; user_metadata?: any; created_at?: string } | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return undefined;
    }
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      user_metadata: {
        name: user.fullName,
        role: 'user', // TODO: Add role to users table
      },
      created_at: user.createdAt?.toISOString(),
    };
  }

  /**
   * Alias for getUserById - for /me endpoint compatibility
   */
  async getUser(userId: string) {
    return this.getUserById(userId);
  }

  /**
   * Confirm password reset with email and token
   */
  async confirmPasswordReset(email: string, token: string, newPassword: string): Promise<void> {
    // Verify the token and extract userId
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;

      if (!decoded || decoded.type !== 'password_reset' || !decoded.userId) {
        throw new Error('Invalid or expired password reset token');
      }

      // Verify the email matches the user in the token
      const [user] = await this.db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
      
      if (!user || user.email !== email) {
        throw new Error('Invalid reset token for this email');
      }

      // Hash the new password
      const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

      // Update the password
      await this.db.update(users)
        .set({ passwordHash })
        .where(eq(users.id, decoded.userId));

      logger.info(`Password reset confirmed for user ${decoded.userId}`);
    } catch (error) {
      logger.error('Password reset confirmation failed', error);
      throw new Error('Invalid or expired reset token');
    }
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Get the user
    const [user] = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new Error('Incorrect current password');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Update password
    await this.db.update(users)
      .set({ passwordHash })
      .where(eq(users.id, userId));

    logger.info(`Password changed for user ${userId}`);
  }
  
  /**
   * Verify Access Token (Middleware helper)
   */
  verifyAccessToken(token: string): any {
      return jwt.verify(token, env.JWT_SECRET);
  }
}

export const neonAuthService = new NeonAuthService();
