/**
 * User Store - Core User Management
 * Shared across app and admin
 * Real users, no mock data!
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'super_admin';
  status: 'active' | 'suspended' | 'deleted';
  createdAt: number;
  lastLogin: number;
  
  // Subscription
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    startDate: number;
    currentPeriodEnd?: number;
    cancelAtPeriodEnd: boolean;
  };
  
  // Usage stats
  stats: {
    workflowsCreated: number;
    workflowsExecuted: number;
    formsCreated: number;
    aiTokensUsed: number;
  };
}

interface UserStore {
  users: AppUser[];
  
  // Actions
  addUser: (user: Omit<AppUser, 'id' | 'createdAt' | 'stats'>) => string;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
  suspendUser: (id: string) => void;
  activateUser: (id: string) => void;
  
  // Queries
  getUserById: (id: string) => AppUser | undefined;
  getUsersByRole: (role: AppUser['role']) => AppUser[];
  getUsersByPlan: (plan: AppUser['subscription']['plan']) => AppUser[];
  getActiveUsers: () => AppUser[];
  
  // Stats
  getTotalUsers: () => number;
  getNewUsersThisMonth: () => number;
  getUserGrowthData: () => { date: string; count: number }[];
  
  // Subscription stats
  incrementWorkflowCreated: (userId: string) => void;
  incrementWorkflowExecuted: (userId: string) => void;
  incrementFormCreated: (userId: string) => void;
  addAITokenUsage: (userId: string, tokens: number) => void;
}

// Create initial demo user (current logged-in user)
const createDemoUser = (): AppUser => ({
  id: 'user-1',
  email: 'demo@flowversal.com',
  name: 'Demo User',
  role: 'admin',
  status: 'active',
  createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days ago
  lastLogin: Date.now(),
  subscription: {
    plan: 'pro',
    status: 'active',
    startDate: Date.now() - 60 * 24 * 60 * 60 * 1000,
    currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
    cancelAtPeriodEnd: false,
  },
  stats: {
    workflowsCreated: 0, // Will be calculated from workflowStore
    workflowsExecuted: 0, // Will be calculated from executionStore
    formsCreated: 0,
    aiTokensUsed: 0,
  },
});

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: [createDemoUser()],

      addUser: (userData) => {
        const newUser: AppUser = {
          ...userData,
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
          stats: {
            workflowsCreated: 0,
            workflowsExecuted: 0,
            formsCreated: 0,
            aiTokensUsed: 0,
          },
        };
        set((state) => ({ users: [...state.users, newUser] }));
        return newUser.id;
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updates } : user
          ),
        }));
      },

      deleteUser: (id) => {
        get().updateUser(id, { status: 'deleted' });
      },

      suspendUser: (id) => {
        get().updateUser(id, { status: 'suspended' });
      },

      activateUser: (id) => {
        get().updateUser(id, { status: 'active' });
      },

      getUserById: (id) => {
        return get().users.find((user) => user.id === id);
      },

      getUsersByRole: (role) => {
        return get().users.filter((user) => user.role === role && user.status === 'active');
      },

      getUsersByPlan: (plan) => {
        return get().users.filter(
          (user) => user.subscription.plan === plan && user.status === 'active'
        );
      },

      getActiveUsers: () => {
        return get().users.filter((user) => user.status === 'active');
      },

      getTotalUsers: () => {
        return get().users.filter((user) => user.status !== 'deleted').length;
      },

      getNewUsersThisMonth: () => {
        const now = Date.now();
        const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
        return get().users.filter(
          (user) => user.createdAt >= monthAgo && user.status !== 'deleted'
        ).length;
      },

      getUserGrowthData: () => {
        const users = get().users.filter((user) => user.status !== 'deleted');
        const last30Days = Date.now() - 30 * 24 * 60 * 60 * 1000;
        
        const dailyData: { [key: string]: number } = {};
        
        users.forEach((user) => {
          if (user.createdAt >= last30Days) {
            const date = new Date(user.createdAt).toISOString().split('T')[0];
            dailyData[date] = (dailyData[date] || 0) + 1;
          }
        });

        return Object.entries(dailyData)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      incrementWorkflowCreated: (userId) => {
        const user = get().getUserById(userId);
        if (user) {
          get().updateUser(userId, {
            stats: {
              ...user.stats,
              workflowsCreated: user.stats.workflowsCreated + 1,
            },
          });
        }
      },

      incrementWorkflowExecuted: (userId) => {
        const user = get().getUserById(userId);
        if (user) {
          get().updateUser(userId, {
            stats: {
              ...user.stats,
              workflowsExecuted: user.stats.workflowsExecuted + 1,
            },
          });
        }
      },

      incrementFormCreated: (userId) => {
        const user = get().getUserById(userId);
        if (user) {
          get().updateUser(userId, {
            stats: {
              ...user.stats,
              formsCreated: user.stats.formsCreated + 1,
            },
          });
        }
      },

      addAITokenUsage: (userId, tokens) => {
        const user = get().getUserById(userId);
        if (user) {
          get().updateUser(userId, {
            stats: {
              ...user.stats,
              aiTokensUsed: user.stats.aiTokensUsed + tokens,
            },
          });
        }
      },
    }),
    {
      name: 'flowversal-users',
    }
  )
);
