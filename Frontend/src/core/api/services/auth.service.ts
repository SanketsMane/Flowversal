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
    // Load session from localStorage on init
    this.loadSession();
    // Drop demo/justin tokens and expired sessions
    if (this.currentSession) {
      const isExpired = this.currentSession.expiresAt && this.currentSession.expiresAt < Date.now();
      if (isExpired) {
        this.clearSession();
      }
    }
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

      // Handle both backend naming conventions - Fixes BUG-007
      const accessToken = data.accessToken || data.access_token;
      const refreshToken = data.refreshToken || data.refresh_token;

      // Extract expiry from token
      let expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // Default 7 days
      if (accessToken) {
        try {
          // Basic JWT decode without library to avoid adding dependency
          const base64Url = accessToken.split('.')[1];
          if (base64Url) {
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                  return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              const payload = JSON.parse(jsonPayload);
              if (payload.exp) {
                  expiresAt = payload.exp * 1000;
              }
          }
        } catch (e) {
          console.warn('[AuthService] Failed to decode token expiry:', e);
        }
      }

      const session: AuthSession = {
        user,
        accessToken,
        refreshToken,
        expiresAt,
      };
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
   * Update user profile - Fixes BUG-008
   * Author: Sanket
   */
  async updateProfile(updates: Partial<Pick<User, 'name' | 'avatar'>>): Promise<{ success: boolean; error?: string }> {
      try {
        // Call backend to persist changes
        const response = await api.put<any>(API_ENDPOINTS.users.me, {
          metadata: {
            name: updates.name,
            avatar: updates.avatar,
          }
        });

        if (response.success && response.data) {
          // Update local session with backend response
          if (this.currentSession) {
            this.currentSession.user = {
              ...this.currentSession.user,
              name: response.data.name || updates.name || this.currentSession.user.name,
              avatar: response.data.avatar || updates.avatar || this.currentSession.user.avatar,
            };
            this.saveSession(this.currentSession);
          }
          return { success: true };
        }
        return { success: false, error: response.error || 'Failed to update profile' };
      } catch (error: any) {
        console.error('[AuthService] Profile update error:', error);
        return { success: false, error: error.message || 'Network error' };
      }
    }
  /**
   * Change password - Fixes BUG-003
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await api.post<any>(API_ENDPOINTS.auth.changePassword, { 
        currentPassword, 
        newPassword 
      });
      if (response.success) {
        return { success: true };
      }
      return { success: false, error: response.error || 'Failed to change password' };
    } catch (error: any) {
      console.error('[AuthService] Change password error:', error);
      if (error.response?.status === 401) {
        return { success: false, error: 'Current password is incorrect' };
      }
      return { success: false, error: error.message || 'Network error' };
    }
  }
  /**
   * Reset password - Fixes BUG-002
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await api.post<any>(API_ENDPOINTS.auth.forgotPassword, { email });
      if (response.success) {
        return { success: true };
      }
      return { success: false, error: response.error || 'Failed to send reset email' };
    } catch (error: any) {
      console.error('[AuthService] Password reset error:', error);
      return { success: false, error: error.message || 'Network error' };
    }
  }
  /**
   * Save session to localStorage
   */
  private saveSession(session: AuthSession): void {
    this.currentSession = session;
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
  }
  /**
   * Load session from localStorage - Updated for BUG-007 fix
   * Author: Sanket
   */
  private loadSession(): void {
    try {
      const stored = localStorage.getItem(this.sessionKey);
      if (stored) {
        const session = JSON.parse(stored) as AuthSession;
        
        // ✅ Only load accessToken - will verify user from backend
        if (session.accessToken && Date.now() < session.expiresAt) {
          this.currentSession = {
            user: session.user, // Temporary - will verify async
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            expiresAt: session.expiresAt,
          };
          
          // ✅ Verify session is valid by fetching user from backend
          // This prevents localStorage tampering (changing role, etc.)
          this.verifySessionAsync();
        } else {
          this.clearSession();
        }
      }
    } catch (error) {
      console.error('[AuthService] Failed to load session:', error);
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
   * Verify session by fetching user data from backend.
   * If the access token is expired, attempt a refresh before giving up.
   * Author: Sanket — Fixes aggressive session clearing on 15-min token expiry
   */
  private async verifySessionAsync(): Promise<void> {
    try {
      const response = await api.get<any>('/auth/me');

      if (response.success && response.data) {
        // Update session with verified, backend-authoritative user data
        if (this.currentSession) {
          this.currentSession.user = {
            id: response.data.id,
            email: response.data.email,
            name: response.data.name || response.data.email,
            avatar: response.data.avatar,
            role: response.data.role, // Backend is the source of truth for role
            createdAt: response.data.createdAt,
            onboardingCompleted: response.data.onboardingCompleted,
          };
          this.saveSession(this.currentSession);
        }
        return;
      }

      // /auth/me failed — try refreshing the token before clearing the session.
      // This handles the common case where the 15-min access token has expired.
      if (this.currentSession?.refreshToken) {
        const refreshed = await this.refreshSession();
        if (refreshed) {
          // Refresh succeeded — re-verify with the new token
          const retryResponse = await api.get<any>('/auth/me');
          if (retryResponse.success && retryResponse.data && this.currentSession) {
            this.currentSession.user = {
              id: retryResponse.data.id,
              email: retryResponse.data.email,
              name: retryResponse.data.name || retryResponse.data.email,
              avatar: retryResponse.data.avatar,
              role: retryResponse.data.role,
              createdAt: retryResponse.data.createdAt,
              onboardingCompleted: retryResponse.data.onboardingCompleted,
            };
            this.saveSession(this.currentSession);
            return;
          }
        }
      }

      // Both verification and refresh failed — clear the session
      console.warn('[AuthService] Session verification and refresh both failed — clearing session');
      this.clearSession();
    } catch (error) {
      console.error('[AuthService] Session verification error:', error);
      // Network errors should not log the user out — keep the session
      // Only clear on explicit auth failures (handled above via response.success check)
    }
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
         // Use relative path to avoid double-prefixing
         const response = await api.post<any>('auth/refresh', { 
             refreshToken: this.currentSession.refreshToken 
         });
         if (response.success && response.data) {
             const data = response.data;
             // Ensure session still exists and handle BOTH naming conventions - Author: Sanket
             if (this.currentSession) {
                this.currentSession.accessToken = data.accessToken || data.access_token;
                this.currentSession.refreshToken = data.refreshToken || data.refresh_token; 
                
                // Update expiry (e.g. 7 days from now)
                this.currentSession.expiresAt = Date.now() + (7 * 24 * 3600 * 1000); 
                this.saveSession(this.currentSession);
                return true;
             }
         } else {
             // Only clear if it was an auth error, not network error
             console.warn('[AuthService] Refresh failed, but keeping session for now');
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