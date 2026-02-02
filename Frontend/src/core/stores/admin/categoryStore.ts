/**
 * Category Store - Workflow Category Management
 * Admin can manage categories, reflects in AI Apps
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WorkflowCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  createdAt: number;
  isActive: boolean;
}

interface CategoryStore {
  categories: WorkflowCategory[];
  
  // CRUD Operations
  addCategory: (category: Omit<WorkflowCategory, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, updates: Partial<WorkflowCategory>) => void;
  deleteCategory: (id: string) => void;
  toggleCategory: (id: string) => void;
  reorderCategories: (categories: WorkflowCategory[]) => void;
  
  // Queries
  getCategoryById: (id: string) => WorkflowCategory | undefined;
  getActiveCategories: () => WorkflowCategory[];
  getCategoryCount: () => number;
}

const defaultCategories: WorkflowCategory[] = [
  {
    id: 'cat-1',
    name: 'Customer Service',
    description: 'Automate customer support and engagement',
    icon: 'HeadphonesIcon',
    color: '#00C6FF',
    order: 1,
    createdAt: Date.now(),
    isActive: true,
  },
  {
    id: 'cat-2',
    name: 'Sales & Marketing',
    description: 'Lead generation and nurturing automation',
    icon: 'TrendingUp',
    color: '#9D50BB',
    order: 2,
    createdAt: Date.now(),
    isActive: true,
  },
  {
    id: 'cat-3',
    name: 'Data Processing',
    description: 'Transform and sync data across systems',
    icon: 'Database',
    color: '#10B981',
    order: 3,
    createdAt: Date.now(),
    isActive: true,
  },
  {
    id: 'cat-4',
    name: 'HR & Operations',
    description: 'Employee management and operations',
    icon: 'Users',
    color: '#F59E0B',
    order: 4,
    createdAt: Date.now(),
    isActive: true,
  },
  {
    id: 'cat-5',
    name: 'Finance & Accounting',
    description: 'Financial workflows and reporting',
    icon: 'DollarSign',
    color: '#EF4444',
    order: 5,
    createdAt: Date.now(),
    isActive: true,
  },
];

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      categories: defaultCategories,

      addCategory: (categoryData) => {
        const newCategory: WorkflowCategory = {
          ...categoryData,
          id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
        };
        
        set((state) => ({
          categories: [...state.categories, newCategory].sort((a, b) => a.order - b.order),
        }));
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, ...updates } : cat
          ).sort((a, b) => a.order - b.order),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
        }));
      },

      toggleCategory: (id) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, isActive: !cat.isActive } : cat
          ),
        }));
      },

      reorderCategories: (categories) => {
        const reordered = categories.map((cat, index) => ({
          ...cat,
          order: index + 1,
        }));
        set({ categories: reordered });
      },

      getCategoryById: (id) => {
        return get().categories.find((cat) => cat.id === id);
      },

      getActiveCategories: () => {
        return get().categories.filter((cat) => cat.isActive).sort((a, b) => a.order - b.order);
      },

      getCategoryCount: () => {
        return get().categories.length;
      },
    }),
    {
      name: 'flowversal-categories',
    }
  )
);
