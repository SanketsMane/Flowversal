/**
 * Production Execution Store with Supabase
 * Replaces localStorage with real database
 */

import { create } from 'zustand';
import { supabase, type ExecutionDB } from '@/shared/lib/supabase';
import { useAuthStore } from './authStore.supabase';

export interface ExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  userId: string;
  userName: string;
  status: 'running' | 'success' | 'failed' | 'canceled';
  startedAt: number;
  completedAt?: number;
  duration?: number;
  triggerType: string;
  stepsExecuted: number;
  totalSteps: number;
  aiTokensUsed: number;
  apiCallsMade: number;
  result?: any;
  error?: {
    message: string;
    step: string;
    code: string;
  };
}

interface ExecutionState {
  executions: ExecutionLog[];
  loading: boolean;
  realtimeChannel: any | null;
  
  // Actions
  loadExecutions: () => Promise<void>;
  addExecution: (execution: Omit<ExecutionLog, 'id'>) => Promise<string>;
  updateExecution: (id: string, updates: Partial<ExecutionLog>) => Promise<void>;
  completeExecution: (id: string, status: 'success' | 'failed' | 'canceled', result?: any, error?: any) => Promise<void>;
  subscribeToExecutions: () => void;
  unsubscribeFromExecutions: () => void;
  
  // Queries
  getExecution: (id: string) => ExecutionLog | undefined;
  getWorkflowExecutions: (workflowId: string) => ExecutionLog[];
  getRunningExecutions: () => ExecutionLog[];
  getRecentExecutions: (limit: number) => ExecutionLog[];
}

// Helper to convert DB to store format
function dbToExecution(db: ExecutionDB, userName?: string): ExecutionLog {
  return {
    id: db.id,
    workflowId: db.workflow_id,
    workflowName: db.workflow_name,
    userId: db.user_id,
    userName: userName || 'Unknown',
    status: db.status,
    startedAt: new Date(db.started_at).getTime(),
    completedAt: db.completed_at ? new Date(db.completed_at).getTime() : undefined,
    duration: db.duration,
    triggerType: db.trigger_type,
    stepsExecuted: db.steps_executed,
    totalSteps: db.total_steps,
    aiTokensUsed: db.ai_tokens_used,
    apiCallsMade: db.api_calls_made,
    result: db.result,
    error: db.error,
  };
}

export const useExecutionStore = create<ExecutionState>((set, get) => ({
  executions: [],
  loading: false,
  realtimeChannel: null,

  loadExecutions: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true });

    try {
      // Build query
      const query = supabase
        .from('executions')
        .select(`
          *,
          profiles:user_id (name)
        `)
        .order('started_at', { ascending: false })
        .limit(100);

      // Non-admin users only see their own executions
      if (user.role !== 'admin') {
        query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const executions = data.map((item: any) => {
        const userName = item.profiles?.name || 'Unknown';
        delete item.profiles;
        return dbToExecution(item, userName);
      });

      set({ executions, loading: false });
    } catch (error) {
      console.error('Load executions error:', error);
      set({ loading: false });
    }
  },

  addExecution: async (execution) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');

    try {
      const { data, error } = await supabase
        .from('executions')
        .insert({
          workflow_id: execution.workflowId,
          user_id: user.id,
          workflow_name: execution.workflowName,
          status: execution.status,
          trigger_type: execution.triggerType,
          steps_executed: execution.stepsExecuted,
          total_steps: execution.totalSteps,
          ai_tokens_used: execution.aiTokensUsed,
          api_calls_made: execution.apiCallsMade,
          started_at: new Date(execution.startedAt).toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newExecution = dbToExecution(data, user.name);
      set((state) => ({
        executions: [newExecution, ...state.executions],
      }));

      return data.id;
    } catch (error) {
      console.error('Add execution error:', error);
      throw error;
    }
  },

  updateExecution: async (id, updates) => {
    try {
      const updateData: any = {};
      
      if (updates.status) updateData.status = updates.status;
      if (updates.stepsExecuted !== undefined) updateData.steps_executed = updates.stepsExecuted;
      if (updates.aiTokensUsed !== undefined) updateData.ai_tokens_used = updates.aiTokensUsed;
      if (updates.apiCallsMade !== undefined) updateData.api_calls_made = updates.apiCallsMade;
      if (updates.completedAt) {
        updateData.completed_at = new Date(updates.completedAt).toISOString();
        updateData.duration = updates.completedAt - (get().getExecution(id)?.startedAt || 0);
      }

      const { error } = await supabase
        .from('executions')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Update local state
      set((state) => ({
        executions: state.executions.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        ),
      }));
    } catch (error) {
      console.error('Update execution error:', error);
      throw error;
    }
  },

  completeExecution: async (id, status, result, error) => {
    try {
      const completedAt = new Date().toISOString();
      const execution = get().getExecution(id);
      const duration = execution ? Date.now() - execution.startedAt : 0;

      const { error: updateError } = await supabase
        .from('executions')
        .update({
          status,
          completed_at: completedAt,
          duration,
          result,
          error,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update local state
      set((state) => ({
        executions: state.executions.map((e) =>
          e.id === id
            ? {
                ...e,
                status,
                completedAt: new Date(completedAt).getTime(),
                duration,
                result,
                error,
              }
            : e
        ),
      }));
    } catch (error) {
      console.error('Complete execution error:', error);
      throw error;
    }
  },

  subscribeToExecutions: () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Clean up existing subscription
    get().unsubscribeFromExecutions();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('executions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'executions',
          filter: user.role === 'admin' ? undefined : `user_id=eq.${user.id}`,
        },
        () => {
          // Reload executions on any change
          get().loadExecutions();
        }
      )
      .subscribe();

    set({ realtimeChannel: channel });
  },

  unsubscribeFromExecutions: () => {
    const { realtimeChannel } = get();
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      set({ realtimeChannel: null });
    }
  },

  getExecution: (id) => {
    return get().executions.find((e) => e.id === id);
  },

  getWorkflowExecutions: (workflowId) => {
    return get().executions.filter((e) => e.workflowId === workflowId);
  },

  getRunningExecutions: () => {
    return get().executions.filter((e) => e.status === 'running');
  },

  getRecentExecutions: (limit) => {
    return get().executions.slice(0, limit);
  },
}));
