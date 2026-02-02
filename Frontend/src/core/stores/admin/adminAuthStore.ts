/**
 * Admin Authentication Store
 * Separate from main app auth - handles admin panel login only
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminAuthState {
  isAdminLoggedIn: boolean;
  adminSessionId: string | null;
  adminUserId: string | null;
  adminEmail: string | null;
  adminName: string | null;
  adminRole: 'admin' | 'super_admin' | null;
  loginAdmin: (userId: string, email: string, name: string, role: 'admin' | 'super_admin') => void;
  logoutAdmin: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAdminLoggedIn: false,
      adminSessionId: null,
      adminUserId: null,
      adminEmail: null,
      adminName: null,
      adminRole: null,

      loginAdmin: (userId, email, name, role) => {
        set({
          isAdminLoggedIn: true,
          adminSessionId: `admin-session-${Date.now()}-${Math.random()}`,
          adminUserId: userId,
          adminEmail: email,
          adminName: name,
          adminRole: role,
        });
      },

      logoutAdmin: () => {
        set({
          isAdminLoggedIn: false,
          adminSessionId: null,
          adminUserId: null,
          adminEmail: null,
          adminName: null,
          adminRole: null,
        });
      },
    }),
    {
      name: 'flowversal-admin-auth',
    }
  )
);
