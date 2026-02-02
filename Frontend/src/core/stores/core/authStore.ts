/**
 * Auth Store - Core Authentication State
 * Shared across all domains (app, admin, marketing, docs)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin';
  avatar?: string;
  createdAt: number;
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'canceled' | 'past_due';
    currentPeriodEnd?: number;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  
  // Admin check
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Simple demo login
        // In production, this would call your auth API
        
        const mockUser: User = {
          id: 'user-1',
          email,
          name: email.split('@')[0],
          role: email.includes('admin') ? 'admin' : 'user',
          createdAt: Date.now(),
          subscription: {
            plan: 'pro',
            status: 'active',
            currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
          },
        };

        set({ user: mockUser, isAuthenticated: true });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      isAdmin: () => {
        const user = get().user;
        return user?.role === 'admin' || user?.role === 'super_admin';
      },
    }),
    {
      name: 'flowversal-auth',
      onRehydrateStorage: () => (state) => {
        // Auto-login demo user if not logged in (development mode)
        if (!state?.user) {
          const demoUser: User = {
            id: 'demo-user-1',
            email: 'demo@flowversal.com',
            name: 'Demo User',
            role: 'admin',
            createdAt: Date.now(),
            subscription: {
              plan: 'pro',
              status: 'active',
              currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
            },
          };
          
          // Use setTimeout to avoid hydration conflicts
          setTimeout(() => {
            useAuthStore.setState({ user: demoUser, isAuthenticated: true });
          }, 0);
        }
      },
    }
  )
);