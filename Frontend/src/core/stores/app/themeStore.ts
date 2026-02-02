/**
 * Theme Store for Main Application
 * Manages dark/light mode with localStorage persistence
 * Centralized theme management for easy maintenance
 */

import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useAppThemeStore = create<ThemeStore>((set) => ({
  // Initialize from localStorage or default to light
  theme: (typeof window !== 'undefined' && localStorage.getItem('app-theme') as Theme) || 'light',
  
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-theme', newTheme);
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
      localStorage.setItem('app-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    return { theme };
  }),
}));

// Initialize theme on load
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('app-theme') as Theme;
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * Theme Class Helper
 * Provides consistent theme-aware class names
 * Makes it easy to apply theming throughout the app
 */
export const getThemeClasses = (theme: Theme) => ({
  // Main Backgrounds
  bgMain: theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50',
  bgCard: theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white',
  bgSecondary: theme === 'dark' ? 'bg-[#2A2A3E]' : 'bg-gray-100',
  bgInput: theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white',
  
  // Text Colors
  textPrimary: theme === 'dark' ? 'text-white' : 'text-gray-900',
  textSecondary: theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600',
  textTertiary: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
  textMuted: theme === 'dark' ? 'text-gray-500' : 'text-gray-400',
  
  // Borders
  border: theme === 'dark' ? 'border-white/10' : 'border-gray-200',
  borderSecondary: theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-300',
  borderHover: theme === 'dark' ? 'hover:border-[#00C6FF]/50' : 'hover:border-blue-500',
  
  // Hover States
  hoverBg: theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100',
  hoverBgSecondary: theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-200',
  
  // Dividers
  divider: theme === 'dark' ? 'bg-white/10' : 'bg-gray-200',
  
  // Shadows
  shadow: theme === 'dark' ? 'shadow-2xl shadow-black/50' : 'shadow-xl shadow-gray-200',
});