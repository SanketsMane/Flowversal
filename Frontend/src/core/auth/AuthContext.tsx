/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */
import { authService, User } from '@/core/api/services/auth.service';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string  }>;
  signup: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'avatar'>>) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
interface AuthProviderProps {
  children: ReactNode;
}
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Supabase OAuth logic removal for Neon Migration
        // const hasCode = typeof window !== 'undefined' && window.location.search.includes('code=');
        // if (hasCode) { ... }
        // First, try to hydrate from Supabase (handles OAuth redirect)
        if (!authService.isAuthenticated()) {
          const hydrated = await authService.hydrateFromSupabase();
          if (hydrated && authService.isAuthenticated()) {
            const currentUser = authService.getCurrentUser();
            setUser(currentUser);
          }
        }
        if (authService.isAuthenticated()) {
          // ✅ Verify session to get fresh user data (role, onboarding status)
          // Author: Sanket - Fixes stale data race condition
          const freshUser = await authService.verifySession();
          if (freshUser) {
            setUser(freshUser);
          } else {
            const currentUser = authService.getCurrentUser();
            setUser(currentUser);
          }
          // Refresh session if needed
          await authService.refreshSession();
        } else {
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
    // Set up session refresh interval (every 4 minutes to handle 15-min tokens)
    const refreshInterval = setInterval(async () => {
      if (authService.isAuthenticated()) {
        await authService.refreshSession();
      }
    }, 4 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, []);
  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };
  const loginWithGoogle = async () => {
    const result = await authService.loginWithGoogle();
    // OAuth will redirect, so we don't update state here
    return result;
  };

  const signup = async (email: string, password: string, name?: string) => {
    const result = await authService.signUp(email, password, name);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };
  const logout = async () => {
    await authService.logout();
    setUser(null);
  };
  const updateProfile = async (updates: Partial<Pick<User, 'name' | 'avatar'>>) => {
    const result = await authService.updateProfile(updates);
    if (result.success) {
      const updatedUser = authService.getCurrentUser();
      setUser(updatedUser);
    }
    return result;
  };
  const changePassword = async (currentPassword: string, newPassword: string) => {
    return await authService.changePassword(currentPassword, newPassword);
  };
  const resetPassword = async (email: string) => {
    return await authService.resetPassword(email);
  };
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle,
    signup,
    logout,
    updateProfile,
    changePassword,
    resetPassword,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
