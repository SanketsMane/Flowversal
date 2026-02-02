/**
 * Admin Users Store
 * Manages admin user accounts - only admins can create new admin users
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminUser {
  id: string;
  email: string;
  password: string; // In production, this would be hashed
  name: string;
  role: 'admin' | 'super_admin';
  createdAt: number;
  createdBy: string;
  lastLogin?: number;
}

interface AdminUsersState {
  adminUsers: AdminUser[];
  addAdminUser: (email: string, password: string, name: string, createdBy: string) => boolean;
  removeAdminUser: (id: string) => void;
  validateAdminCredentials: (email: string, password: string) => AdminUser | null;
  updateLastLogin: (id: string) => void;
}

// Default admin account
const defaultAdmin: AdminUser = {
  id: 'admin-1',
  email: 'admin@admin.com',
  password: 'admin', // In production, this would be hashed
  name: 'Super Admin',
  role: 'super_admin',
  createdAt: Date.now(),
  createdBy: 'system',
};

export const useAdminUsersStore = create<AdminUsersState>()(
  persist(
    (set, get) => ({
      adminUsers: [defaultAdmin],

      addAdminUser: (email, password, name, createdBy) => {
        const { adminUsers } = get();
        
        // Check if admin user already exists
        if (adminUsers.some(user => user.email.toLowerCase() === email.toLowerCase())) {
          return false;
        }

        const newAdmin: AdminUser = {
          id: `admin-${Date.now()}`,
          email,
          password, // In production, hash this
          name,
          role: 'admin',
          createdAt: Date.now(),
          createdBy,
        };

        set({ adminUsers: [...adminUsers, newAdmin] });
        return true;
      },

      removeAdminUser: (id) => {
        // Prevent removing the default super admin
        if (id === 'admin-1') return;
        
        set((state) => ({
          adminUsers: state.adminUsers.filter(user => user.id !== id),
        }));
      },

      validateAdminCredentials: (email, password) => {
        const { adminUsers } = get();
        const user = adminUsers.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        return user || null;
      },

      updateLastLogin: (id) => {
        set((state) => ({
          adminUsers: state.adminUsers.map(user =>
            user.id === id ? { ...user, lastLogin: Date.now() } : user
          ),
        }));
      },
    }),
    {
      name: 'flowversal-admin-users',
    }
  )
);
