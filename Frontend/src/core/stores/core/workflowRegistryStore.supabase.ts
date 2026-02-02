/**
 * Production Workflow Registry Store with Supabase
 * Replaces localStorage with real database
 */

import { create } from 'zustand';
import { supabase, type WorkflowDB } from '@/shared/lib/supabase';
import { useAuthStore } from './authStore.supabase';

export interface SavedWorkflow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: string;
  triggers: any[];
  containers: any[];
  variables: any[];
  status: 'draft' | 'published' | 'archived';
  version: number;
  executionCount: number;
  successCount: number;
  totalExecutionTime: number;
  createdAt: number;
  updatedAt: number;
  lastExecutedAt?: number;
  publishedAt?: number;
}

interface WorkflowRegistryState {
  workflows: SavedWorkflow[];
  loading: boolean;
  
  // Actions
  loadWorkflows: () => Promise<void>;
  saveWorkflow: (workflow: Omit<SavedWorkflow, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateWorkflow: (id: string, updates: Partial<SavedWorkflow>) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  publishWorkflow: (id: string) => Promise<void>;
  archiveWorkflow: (id: string) => Promise<void>;
  incrementExecutionCount: (id: string) => Promise<void>;
  updateExecutionStats: (id: string, duration: number, success: boolean) => Promise<void>;
  
  // Queries
  getWorkflow: (id: string) => SavedWorkflow | undefined;
  getUserWorkflows: (userId: string) => SavedWorkflow[];
  getPublishedWorkflows: () => SavedWorkflow[];
}

// Helper to convert DB to store format
function dbToWorkflow(db: WorkflowDB): SavedWorkflow {
  return {
    id: db.id,
    userId: db.user_id,
    name: db.name,
    description: db.description,
    category: db.category,
    triggers: db.triggers || [],
    containers: db.containers || [],
    variables: db.variables || [],
    status: db.status,
    version: db.version,
    executionCount: db.execution_count,
    successCount: db.success_count,
    totalExecutionTime: db.total_execution_time,
    createdAt: new Date(db.created_at).getTime(),
    updatedAt: new Date(db.updated_at).getTime(),
    lastExecutedAt: db.last_executed_at ? new Date(db.last_executed_at).getTime() : undefined,
    publishedAt: db.published_at ? new Date(db.published_at).getTime() : undefined,
  };
}

export const useWorkflowRegistryStore = create<WorkflowRegistryState>((set, get) => ({
  workflows: [],
  loading: false,

  loadWorkflows: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true });

    try {
      // Load user's workflows or all if admin
      const query = supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });

      // Non-admin users only see their own workflows
      if (user.role !== 'admin') {
        query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const workflows = data.map(dbToWorkflow);
      set({ workflows, loading: false });
    } catch (error) {
      console.error('Load workflows error:', error);
      set({ loading: false });
    }
  },

  saveWorkflow: async (workflow) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');

    try {
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          user_id: user.id,
          name: workflow.name,
          description: workflow.description,
          category: workflow.category,
          triggers: workflow.triggers,
          containers: workflow.containers,
          variables: workflow.variables || [],
          status: workflow.status,
          version: workflow.version,
        })
        .select()
        .single();

      if (error) throw error;

      // Update profile stats
      await supabase
        .from('profiles')
        .update({ workflows_created: user.workflows_created + 1 })
        .eq('id', user.id);

      // Add to local state
      const newWorkflow = dbToWorkflow(data);
      set((state) => ({
        workflows: [newWorkflow, ...state.workflows],
      }));

      return data.id;
    } catch (error) {
      console.error('Save workflow error:', error);
      throw error;
    }
  },

  updateWorkflow: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .update({
          name: updates.name,
          description: updates.description,
          category: updates.category,
          triggers: updates.triggers,
          containers: updates.containers,
          variables: updates.variables,
          status: updates.status,
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      set((state) => ({
        workflows: state.workflows.map((w) =>
          w.id === id ? { ...w, ...updates, updatedAt: Date.now() } : w
        ),
      }));
    } catch (error) {
      console.error('Update workflow error:', error);
      throw error;
    }
  },

  deleteWorkflow: async (id) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        workflows: state.workflows.filter((w) => w.id !== id),
      }));
    } catch (error) {
      console.error('Delete workflow error:', error);
      throw error;
    }
  },

  publishWorkflow: async (id) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        workflows: state.workflows.map((w) =>
          w.id === id
            ? { ...w, status: 'published', publishedAt: Date.now() }
            : w
        ),
      }));
    } catch (error) {
      console.error('Publish workflow error:', error);
      throw error;
    }
  },

  archiveWorkflow: async (id) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .update({ status: 'archived' })
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        workflows: state.workflows.map((w) =>
          w.id === id ? { ...w, status: 'archived' } : w
        ),
      }));
    } catch (error) {
      console.error('Archive workflow error:', error);
      throw error;
    }
  },

  incrementExecutionCount: async (id) => {
    // This is handled by database trigger
    // Just refresh from database
    await get().loadWorkflows();
  },

  updateExecutionStats: async (id, duration, success) => {
    // This is handled by database trigger
    // Just refresh from database
    await get().loadWorkflows();
  },

  getWorkflow: (id) => {
    return get().workflows.find((w) => w.id === id);
  },

  getUserWorkflows: (userId) => {
    return get().workflows.filter((w) => w.userId === userId);
  },

  getPublishedWorkflows: () => {
    return get().workflows.filter((w) => w.status === 'published');
  },
}));
