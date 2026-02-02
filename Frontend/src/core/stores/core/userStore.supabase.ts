/**
 * Production User Store with Supabase
 * Replaces localStorage with real database
 */

import { create } from 'zustand';
import { supabase, type Profile } from '@/shared/lib/supabase';
import { useAuthStore } from './authStore.supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  workflowsCreated: number;
  workflowsExecuted: number;
  aiTokensUsed: number;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  subscriptionStatus: string;
  joinedAt: number;
  lastLoginAt: number;
}

interface UserState {
  users: User[];
  loading: boolean;
  
  // Actions
  loadUsers: () => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'joinedAt'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  suspendUser: (id: string) => Promise<void>;
  activateUser: (id: string) => Promise<void>;
  incrementWorkflowCreated: (id: string) => Promise<void>;
  incrementWorkflowExecuted: (id: string) => Promise<void>;
  addAITokenUsage: (id: string, tokens: number) => Promise<void>;
  
  // Queries
  getUser: (id: string) => User | undefined;
  getActiveUsers: () => User[];
  getSuspendedUsers: () => User[];
  getAdminUsers: () => User[];
}

// Helper to convert DB to store format
function profileToUser(profile: Profile): User {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar,
    role: profile.role,
    status: profile.status,
    workflowsCreated: profile.workflows_created,
    workflowsExecuted: profile.workflows_executed,
    aiTokensUsed: profile.ai_tokens_used,
    subscriptionTier: profile.subscription_tier,
    subscriptionStatus: profile.subscription_status,
    joinedAt: new Date(profile.created_at).getTime(),
    lastLoginAt: new Date(profile.last_login_at).getTime(),
  };
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,

  loadUsers: async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser || currentUser.role !== 'admin') {
      // Non-admin users only see themselves
      if (currentUser) {
        set({ users: [profileToUser(currentUser)] });
      }
      return;
    }

    set({ loading: true });

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const users = data.map(profileToUser);
      set({ users, loading: false });
    } catch (error) {
      console.error('Load users error:', error);
      set({ loading: false });
    }
  },

  addUser: async (user) => {
    // Users are created via Supabase auth signup
    // This method is for admin manual user creation
    const currentUser = useAuthStore.getState().user;
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Only admins can create users');
    }

    try {
      // This would require Supabase admin API
      // For now, users are created via signup
      console.warn('User creation should be done via signup');
    } catch (error) {
      console.error('Add user error:', error);
      throw error;
    }
  },

  updateUser: async (id, updates) => {
    try {
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.avatar) updateData.avatar = updates.avatar;
      if (updates.role) updateData.role = updates.role;
      if (updates.status) updateData.status = updates.status;
      if (updates.subscriptionTier) updateData.subscription_tier = updates.subscriptionTier;
      if (updates.subscriptionStatus) updateData.subscription_status = updates.subscriptionStatus;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Update local state
      set((state) => ({
        users: state.users.map((u) =>
          u.id === id ? { ...u, ...updates } : u
        ),
      }));

      // Update auth store if it's the current user
      const currentUser = useAuthStore.getState().user;
      if (currentUser && currentUser.id === id) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (data) {
          useAuthStore.setState({ user: data });
        }
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    // Deleting users requires admin API
    // This is a placeholder
    console.warn('User deletion requires Supabase admin API');
  },

  suspendUser: async (id) => {
    await get().updateUser(id, { status: 'suspended' });
  },

  activateUser: async (id) => {
    await get().updateUser(id, { status: 'active' });
  },

  incrementWorkflowCreated: async (id) => {
    // This is handled by database automatically
    // Just reload users
    await get().loadUsers();
  },

  incrementWorkflowExecuted: async (id) => {
    // This is handled by database triggers
    // Just reload users
    await get().loadUsers();
  },

  addAITokenUsage: async (id, tokens) => {
    // This is handled by database triggers
    // Just reload users
    await get().loadUsers();
  },

  getUser: (id) => {
    return get().users.find((u) => u.id === id);
  },

  getActiveUsers: () => {
    return get().users.filter((u) => u.status === 'active');
  },

  getSuspendedUsers: () => {
    return get().users.filter((u) => u.status === 'suspended');
  },

  getAdminUsers: () => {
    return get().users.filter((u) => u.role === 'admin');
  },
}));
