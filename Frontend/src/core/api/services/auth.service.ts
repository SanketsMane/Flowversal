/**
 * Authentication Service
 * Handles all authentication operations including:
 * - Email/password auth
 * - Google OAuth (Disabled)
 * - Session management
 * - User profile
 */

import { API_ENDPOINTS } from '@/core/api/api.config';
import api from '@/shared/lib/api-client';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'super_admin';
  onboardingCompleted?: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

class AuthService {
  private sessionKey = 'flowversal_auth_session';
  private currentSession: AuthSession | null = null;

  constructor() {
    console.log('[Auth Service] ========== CONSTRUCTOR START ==========');
    // Load session from localStorage on init
    this.loadSession();
    
    // Drop demo/justin tokens and expired sessions
    if (this.currentSession) {
      const isExpired = this.currentSession.expiresAt && this.currentSession.expiresAt < Date.now();
      if (isExpired) {
        console.log('[Auth Service] Clearing session (expired)');
        this.clearSession();
      }
    }
    console.log('[Auth Service] ========== CONSTRUCTOR END ==========');
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, name?: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const response = await api.post<any>(API_ENDPOINTS.auth.signup, { email, password, fullName: name });

      if (!response.success || !response.data) {
        return { success: false, error: response.error || 'Signup failed' };
      }

      // Backend now returns tokens on signup
      if (response.data.accessToken) {
         return this.handleAuthResponse(response.data);
      }

      // Fallback if backend requires verification (not current implementation)
      return { success: true, user: response.data.user };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false, error: error.message || 'Network error during signup' };
    }
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const response = await api.post<any>(API_ENDPOINTS.auth.login, { email, password });

      if (!response.success) {
         return { success: false, error: response.error || 'Login failed' };
      }

      return this.handleAuthResponse(response.data);
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Network error during login' };
    }
  }

  private handleAuthResponse(data: any): { success: boolean; user: User } {
      const user: User = {
        id: data.user.id || data.user._id, // Handle Mongo/Neon ID
        email: data.user.email,
        name: data.user.fullName || data.user.name || data.user.email,
        avatar: data.user.avatar,
        role: data.user.role || 'user',
        createdAt: data.user.createdAt || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        onboardingCompleted: data.user.onboardingCompleted || false,
      };

      // Extract expiry from token
      let expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // Default 7 days
      if (data.accessToken) {
        try {
          // Basic JWT decode without library to avoid adding dependency
          const base64Url = data.accessToken.split('.')[1];
          if (base64Url) {
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                  return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              const payload = JSON.parse(jsonPayload);
              if (payload.exp) {
                  expiresAt = payload.exp * 1000;
                  console.log(`[AuthService] Token expires at: ${new Date(expiresAt).toISOString()} (from JWT exp)`);
              }
          }
        } catch (e) {
          console.warn('[AuthService] Failed to decode token expiry:', e);
        }
      }

      const session: AuthSession = {
        user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: expiresAt,
      };
      
      console.log('[AuthService] Saving session with token:', data.accessToken ? data.accessToken.substring(0, 20) + '...' : 'MISSING');
      this.saveSession(session);
      return { success: true, user };
  }

  /**
   * Login with Google OAuth (Disabled/Pending Migration)
   */
  async loginWithGoogle(): Promise<{ success: boolean; error?: string }> {
      return { success: false, error: 'Google Login temporarily disabled for migration' };
  }

  /**
   * Demo login for development
   */
  async demoLogin(): Promise<{ success: boolean; error?: string; user?: User }> {
    if (!this.isDemoMode()) {
        return { success: false, error: 'Demo mode not enabled' };
    }
    
     const demoUser: User = {
      id: 'demo-user-123',
      email: 'demo@flowversal.com',
      name: 'Demo User',
      avatar: 'DU',
      role: 'user',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      onboardingCompleted: false
    };

    const demoSession: AuthSession = {
      user: demoUser,
      accessToken: 'demo-token',
      refreshToken: 'demo-refresh',
      expiresAt: Date.now() + 86400000
    };
    this.saveSession(demoSession);
    return { success: true, user: demoUser };
  }
 
  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
       // Optional: call backend to invalidate token
       // await api.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearSession();
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentSession?.user || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (!this.currentSession) return false;
    if (Date.now() > this.currentSession.expiresAt) {
      this.clearSession();
      return false;
    }
    return true;
  }

  private isDemoMode(): boolean {
    return (import.meta as any).env.DEV;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    if (this.currentSession) {
      if (this.currentSession.expiresAt < Date.now()) {
        this.clearSession();
        return null;
      }
      return this.currentSession.accessToken;
    }
    return null;
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<Pick<User, 'name' | 'avatar'>>): Promise<{ success: boolean; error?: string }> {
     // TODO: Implement backend endpoint for profile update
     console.warn('updateProfile not implemented in backend yet');
     if (this.currentSession) {
         this.currentSession.user = { ...this.currentSession.user, ...updates };
         this.saveSession(this.currentSession);
         return { success: true };
     }
     return { success: false, error: 'Not authenticated' };
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
     // TODO: Implement backend endpoint
     return { success: false, error: 'Not implemented' };
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
      // TODO: Implement backend endpoint
     return { success: false, error: 'Not implemented' };
  }

  /**
   * Save session to localStorage
   */
  private saveSession(session: AuthSession): void {
    this.currentSession = session;
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
  }

  /**
   * Load session from localStorage
   */
  private loadSession(): void {
    try {
      const stored = localStorage.getItem(this.sessionKey);
      if (stored) {
        const session = JSON.parse(stored) as AuthSession;
        if (Date.now() < session.expiresAt) {
          this.currentSession = session;
        } else {
          this.clearSession();
        }
      }
    } catch (error) {
      this.clearSession();
    }
  }

  /**
   * Clear session
   */
  private clearSession(): void {
    this.currentSession = null;
    localStorage.removeItem(this.sessionKey);
  }

  /**
   * Refresh session if needed
   */
  async refreshSession(): Promise<boolean> {
    try {
      if (!this.currentSession) return false;

      // Refresh if within 1 hour of expiry
      const oneHour = 3600000;
      if (Date.now() > this.currentSession.expiresAt - oneHour) {
         const response = await api.post<any>(API_ENDPOINTS.auth.refresh, { 
             refreshToken: this.currentSession.refreshToken 
         });
         
         if (response.success && response.data) {
             const data = response.data;
             this.currentSession.accessToken = data.accessToken;
             this.currentSession.refreshToken = data.refreshToken; // Rotate
             // Update expiry (e.g. 7 days from now)
             this.currentSession.expiresAt = Date.now() + (7 * 24 * 3600 * 1000); 
             this.saveSession(this.currentSession);
             return true;
         } else {
             this.clearSession();
             return false;
         }
      }
      return true;
    } catch (error) {
      console.error('Refresh error:', error);
      return false;
    }
  }

  /**
   * Hydrate session (legacy/noop for now)
   */
  async hydrateFromSupabase(): Promise<boolean> {
      // With Neon, we don't hydrate from Supabase client anymore.
      // We rely on localStorage session loaded in constructor.
      return !!this.currentSession;
  }
}

// Export singleton instance
export const authService = new AuthService();