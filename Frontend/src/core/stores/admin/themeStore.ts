/**
 * Theme Store for Admin Panel
 * Manages dark/light mode with localStorage persistence
 */

import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>((set) => {
  // Initialize theme immediately
  const savedTheme = (typeof window !== 'undefined' && localStorage.getItem('admin-theme') as Theme) || 'dark';
  
  // Apply theme class immediately during initialization
  if (typeof window !== 'undefined') {
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  
  return {
    theme: savedTheme,
    
    toggleTheme: () => set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin-theme', newTheme);
        // Update document class for Tailwind dark mode
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { theme: newTheme };
    }),
    
    setTheme: (theme: Theme) => set(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin-theme', theme);
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { theme };
    }),
  };
});