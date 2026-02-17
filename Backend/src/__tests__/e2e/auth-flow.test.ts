
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import type { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';

/**
 * E2E Test: Complete Authentication Flow
 * Author: Sanket
 * Tests signup, login, token refresh, and protected resource access
 * Synchronized with auth.routes.ts implementation
 */

describe('Authentication Flow (E2E)', () => {
  let server: FastifyInstance;
  let buildServer: any;
  let neonAuthService: any;
  let supabaseClient: any;
  
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'StrongTestPassword123!',
    fullName: 'Test User'
  };

  beforeAll(async () => {
    // Dynamic import to ensure env vars are set by setup.ts BEFORE we import app code
    const mongoMod = await import('../../core/database/mongodb');
    const serverMod = await import('../../server');
    const authMod = await import('../../modules/auth/services/neon-auth.service');
    const supabaseMod = await import('../../core/config/supabase.config');
    
    buildServer = serverMod.buildServer;
    neonAuthService = authMod.neonAuthService;
    supabaseClient = supabaseMod.supabaseClient;
    
    await mongoMod.connectMongoDB();
    server = await buildServer();
    await server.ready();

    // Default mock behavior - use local testUser data
    (neonAuthService.signUp as any).mockResolvedValue({
      user: { id: 'test-user-id', email: testUser.email },
      session: { access_token: 'test-token', refresh_token: 'test-refresh-token', expires_in: 3600, token_type: 'bearer' }
    });
    (neonAuthService.signIn as any).mockResolvedValue({
      user: { id: 'test-user-id', email: testUser.email },
      session: { access_token: 'test-token', refresh_token: 'test-refresh-token', expires_in: 3600, token_type: 'bearer' }
    });
    (neonAuthService.getUser as any).mockResolvedValue({
      id: 'test-user-id', 
      email: testUser.email,
      user_metadata: { name: testUser.fullName }
    });
    (supabaseClient.auth.getUser as any).mockResolvedValue({ 
      data: { user: { id: 'test-user-id', email: testUser.email } }, 
      error: null 
    });
  });

  afterAll(async () => {
    await server.close();
    await mongoose.disconnect();
  });

  describe('Signup Flow', () => {
    it('should create a new user account', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/signup',
        payload: {
          email: testUser.email,
          password: testUser.password,
          fullName: testUser.fullName,
        },
      });

      expect(response.statusCode).toBe(200); 
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body).toHaveProperty('user');
      expect(body).toHaveProperty('accessToken');
      expect(body.user.email).toBe(testUser.email);
    });

    it('should reject duplicate email signup', async () => {
      // Force service to throw the expected "User already exists" error
      (neonAuthService.signUp as any).mockRejectedValueOnce(new Error('User already exists'));

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/signup',
        payload: {
          email: testUser.email,
          password: testUser.password,
        },
      });

      // routes.ts returns 409 for 'User already exists'
      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('UserExists');
    });

    it('should reject signup with missing email', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/signup',
        payload: {
          password: testUser.password,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject weak passwords', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/signup',
        payload: {
          email: `weak-${Date.now()}@example.com`,
          password: '123',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Login Flow', () => {
    it('should login with correct credentials', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testUser.email,
          password: testUser.password,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('user');
    });

    it('should reject incorrect password', async () => {
      (neonAuthService.signIn as any).mockRejectedValueOnce(new Error('Invalid credentials'));
      
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testUser.email,
          password: 'WrongPassword123!',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject non-existent user', async () => {
      (neonAuthService.signIn as any).mockRejectedValueOnce(new Error('Invalid credentials'));

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Protected Resource Access', () => {
    let authToken: string;

    beforeAll(async () => {
      // Login to get token
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: testUser.email,
          password: testUser.password,
        },
      });

      const body = JSON.parse(response.body);
      authToken = body.accessToken;
    });

    it('should access /api/v1/auth/me with valid token', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      // /me returns { success: true, data: { email: ... } }
      expect(body.data.email).toBe(testUser.email);
    });

    it('should reject access without token', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject access with invalid token', async () => {
      // Override Supabase mock for this call
      (supabaseClient.auth.getUser as any).mockResolvedValueOnce({ 
        data: { user: null }, 
        error: new Error('Invalid token') 
      });

      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: {
          authorization: 'Bearer invalid-token-12345',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Token Refresh', () => {
    it('should refresh token successfully', async () => {
      // Prepare refresh response
      (neonAuthService.refreshSession as any).mockResolvedValueOnce({
        user: { id: 'test-user-id', email: testUser.email },
        session: { access_token: 'new-token', refresh_token: 'new-refresh-token' }
      });

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        payload: {
          refreshToken: 'valid-refresh-token',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body).toHaveProperty('accessToken');
    });

    it('should reject invalid refresh token', async () => {
      (neonAuthService.refreshSession as any).mockRejectedValueOnce(new Error('Invalid token'));

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        payload: {
          refreshToken: 'invalid-token',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
