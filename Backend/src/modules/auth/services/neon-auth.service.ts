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
   * Verify Access Token (Middleware helper)
   */
  verifyAccessToken(token: string): any {
      return jwt.verify(token, env.JWT_SECRET);
  }
}

export const neonAuthService = new NeonAuthService();
