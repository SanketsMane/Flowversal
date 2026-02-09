/**
 * Production Auth Store with Supabase
 * Replaces localStorage with real authentication
 */
import { authService } from '@/core/api/services/auth.service';
import { supabase } from '@/shared/lib/supabase';
import { create } from 'zustand';
export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role?: string;
  created_at?: string;
  last_login_at?: string;
}
interface AuthState {
  user: Profile | null;
  session: any | null;
  loading: boolean;
  initialized: boolean;
  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  isAdmin: () => boolean;
}
let authListenerSetUp = false;
const getUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .catch((err: any) => {
        // Handle network errors gracefully
        if (err?.message?.includes('Failed to fetch') || err?.message?.includes('Supabase not configured')) {
          console.warn('[Auth Store] Supabase not accessible - cannot fetch profile');
          return { data: null, error: { message: 'Supabase not configured' } };
        }
        return { data: null, error: err };
      });
    if (error) {
      console.warn('Could not fetch user profile:', error.message || error);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Error in getUserProfile:', err);
    return null;
  }
};
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,
  // Actions
  initialize: async () => {
    try {
      // Check if we have a custom auth session (demo/justin mode)
      const customUser = authService.getCurrentUser();
      if (customUser && authService.isAuthenticated()) {
        const profile: Profile = {
          id: customUser.id,
          email: customUser.email,
          name: customUser.name || customUser.email,
          avatar_url: customUser.avatar,
          role: customUser.role,
          created_at: customUser.createdAt,
          last_login_at: customUser.lastLogin,
        };
        set({ user: profile, session: { access_token: authService.getAccessToken() }, loading: false, initialized: true });
        return;
      }
      if (!supabase) {
        set({ user: null, session: null, loading: false, initialized: true });
        return;
      }
      // Get current session with error handling
      const sessionResult = await supabase.auth.getSession().catch((err: any) => {
        // Handle network errors for unconfigured Supabase
        if (err?.message?.includes('Failed to fetch') || err?.message?.includes('Supabase not configured')) {
          console.warn('[Auth Store] Supabase not accessible - skipping session check');
          return { data: { session: null }, error: null };
        }
        throw err;
      });
      const session = sessionResult?.data?.session;
      if (session?.user) {
        // Get user profile
        const profile = await getUserProfile(session.user.id);
        // Update last login
        if (profile) {
          await supabase
            .from('profiles')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', session.user.id)
            .catch(() => console.warn('[Auth Store] Failed to update last login'));
        }
        set({ user: profile, session, loading: false, initialized: true });
      } else {
        set({ user: null, session: null, loading: false, initialized: true });
      }
      // Set up auth listener only once, with error handling
      if (!authListenerSetUp) {
        authListenerSetUp = true;
        try {
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const profile = await getUserProfile(session.user.id).catch(() => null);
              set({ user: profile, session });
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, session: null });
            }
          });
        } catch (err) {
          console.warn('[Auth Store] Could not set up auth listener:', err);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ user: null, session: null, loading: false, initialized: true });
    }
  },
  login: async (email: string, password: string) => {
    try {
      // Try custom auth service first (handles demo/justin credentials)
      const customResult = await authService.login(email, password);
      if (customResult.success && customResult.user) {
        const profile: Profile = {
          id: customResult.user.id,
          email: customResult.user.email,
          name: customResult.user.name || customResult.user.email,
          avatar_url: customResult.user.avatar,
          role: customResult.user.role,
          created_at: customResult.user.createdAt,
          last_login_at: customResult.user.lastLogin,
        };
        set({ user: profile, session: { access_token: authService.getAccessToken() }, loading: false });
        return { success: true };
      }
      // Fall back to Supabase
      if (!supabase) {
        return { success: false, error: 'Authentication service not available' };
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password }).catch((err: any) => {
        // Handle network errors
        if (err?.message?.includes('Failed to fetch') || err?.message?.includes('Supabase not configured')) {
          console.warn('[Auth Store] Supabase not accessible for login');
          return { data: null, error: { message: 'Supabase not configured' } };
        }
        throw err;
      });
      if (error) {
        console.error('[Auth Store] ❌ Supabase auth failed:', error.message);
        return { success: false, error: error.message };
      }
      if (data.user) {
        const profile = await getUserProfile(data.user.id);
        set({ user: profile, session: data.session });
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      console.error('[Auth Store] Login error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },
  loginWithGoogle: async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' }).catch((err: any) => {
        // Handle network errors
        if (err?.message?.includes('Failed to fetch') || err?.message?.includes('Supabase not configured')) {
          return { data: null, error: { message: 'Supabase not configured' } };
        }
        throw err;
      });
      if (error) {
        return { success: false, error: error.message || 'Google login not available' };
      }
      return { success: true };
    } catch (error: any) {
      console.error('Google login error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },
  signup: async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password }).catch((err: any) => {
        // Handle network errors
        if (err?.message?.includes('Failed to fetch') || err?.message?.includes('Supabase not configured')) {
          return { data: null, error: { message: 'Supabase not configured' } };
        }
        throw err;
      });
      if (error) {
        return { success: false, error: error.message || 'Signup not available' };
      }
      if (data.user) {
        await supabase
          .from('profiles')
          .insert({ id: data.user.id, name, email })
          .catch(() => console.warn('[Auth Store] Failed to create profile'));
      }
      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },
  logout: async () => {
    try {
      // Clear custom auth service session
      await authService.logout();
      // Clear Supabase session if available
      if (supabase) {
        await supabase.auth.signOut().catch((err: any) => {
          // Silently handle network errors during logout
          if (err?.message?.includes('Failed to fetch') || err?.message?.includes('Supabase not configured')) {
            console.warn('[Auth Store] Supabase not accessible - local session cleared');
          } else {
            console.error('[Auth Store] Logout error:', err);
          }
        });
      }
      set({ user: null, session: null });
    } catch (error) {
      console.error('[Auth Store] Logout error:', error);
    }
  },
  updateProfile: async (updates: Partial<Profile>) => {
    try {
      if (!supabase) {
        throw new Error('Supabase not available');
      }
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', updates.id)
        .catch((err: any) => {
          // Handle network errors
          if (err?.message?.includes('Failed to fetch') || err?.message?.includes('Supabase not configured')) {
            console.warn('[Auth Store] Supabase not accessible - cannot update profile');
            return { data: null, error: { message: 'Supabase not configured' } };
          }
          throw err;
        });
      if (error) {
        throw new Error(error.message || 'Failed to update profile');
      }
      set({ user: data[0] });
    } catch (error: any) {
      console.error('Update profile error:', error.message || error);
    }
  },
  isAdmin: () => {
    return (useAuthStore.getState().user?.role === 'admin');
  },
}));