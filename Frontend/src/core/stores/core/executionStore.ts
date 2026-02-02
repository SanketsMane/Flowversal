/**
 * Execution Store - Core Execution Logs
 * Shared across app and admin
 * Tracks real workflow executions
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  userId: string;
  userName: string;
  
  status: 'success' | 'failed' | 'running' | 'canceled';
  
  startedAt: number;
  completedAt?: number;
  duration?: number; // in milliseconds
  
  // Execution details
  triggerType: string;
  stepsExecuted: number;
  totalSteps: number;
  
  // Resource usage
  aiTokensUsed: number;
  apiCallsMade: number;
  
  // Error info (if failed)
  error?: {
    message: string;
    step: string;
    code?: string;
  };
  
  // Output data
  output?: any;
}

interface ExecutionStore {
  executions: ExecutionLog[];
  
  // Actions
  addExecution: (execution: Omit<ExecutionLog, 'id'>) => string;
  updateExecution: (id: string, updates: Partial<ExecutionLog>) => void;
  completeExecution: (id: string, status: 'success' | 'failed', output?: any, error?: ExecutionLog['error']) => void;
  
  // Queries
  getExecutionById: (id: string) => ExecutionLog | undefined;
  getExecutionsByWorkflow: (workflowId: string) => ExecutionLog[];
  getExecutionsByUser: (userId: string) => ExecutionLog[];
  getRecentExecutions: (limit?: number) => ExecutionLog[];
  getRunningExecutions: () => ExecutionLog[];
  
  // Stats
  getTotalExecutions: () => number;
  getSuccessRate: () => number;
  getAverageExecutionTime: () => number;
  getExecutionsByStatus: (status: ExecutionLog['status']) => ExecutionLog[];
  getExecutionGrowthData: () => { date: string; count: number; success: number; failed: number }[];
  getTotalAITokensUsed: () => number;
}

export const useExecutionStore = create<ExecutionStore>()(
  persist(
    (set, get) => ({
      executions: [],

      addExecution: (executionData) => {
        const newExecution: ExecutionLog = {
          ...executionData,
          id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        set((state) => ({ executions: [newExecution, ...state.executions] }));
        return newExecution.id;
      },

      updateExecution: (id, updates) => {
        set((state) => ({
          executions: state.executions.map((exec) =>
            exec.id === id ? { ...exec, ...updates } : exec
          ),
        }));
      },

      completeExecution: (id, status, output, error) => {
        const execution = get().getExecutionById(id);
        if (execution) {
          const completedAt = Date.now();
          const duration = completedAt - execution.startedAt;
          
          get().updateExecution(id, {
            status,
            completedAt,
            duration,
            output,
            error,
          });
        }
      },

      getExecutionById: (id) => {
        return get().executions.find((exec) => exec.id === id);
      },

      getExecutionsByWorkflow: (workflowId) => {
        return get().executions.filter((exec) => exec.workflowId === workflowId);
      },

      getExecutionsByUser: (userId) => {
        return get().executions.filter((exec) => exec.userId === userId);
      },

      getRecentExecutions: (limit = 10) => {
        return get().executions.slice(0, limit);
      },

      getRunningExecutions: () => {
        return get().executions.filter((exec) => exec.status === 'running');
      },

      getTotalExecutions: () => {
        return get().executions.length;
      },

      getSuccessRate: () => {
        const executions = get().executions.filter(
          (exec) => exec.status === 'success' || exec.status === 'failed'
        );
        if (executions.length === 0) return 0;
        
        const successful = executions.filter((exec) => exec.status === 'success').length;
        return Math.round((successful / executions.length) * 100);
      },

      getAverageExecutionTime: () => {
        const completedExecs = get().executions.filter(
          (exec) => exec.duration !== undefined
        );
        if (completedExecs.length === 0) return 0;
        
        const totalTime = completedExecs.reduce((sum, exec) => sum + (exec.duration || 0), 0);
        return Math.round(totalTime / completedExecs.length);
      },

      getExecutionsByStatus: (status) => {
        return get().executions.filter((exec) => exec.status === status);
      },

      getExecutionGrowthData: () => {
        const executions = get().executions;
        const last30Days = Date.now() - 30 * 24 * 60 * 60 * 1000;
        
        const dailyData: { [key: string]: { count: number; success: number; failed: number } } = {};
        
        executions.forEach((exec) => {
          if (exec.startedAt >= last30Days) {
            const date = new Date(exec.startedAt).toISOString().split('T')[0];
            if (!dailyData[date]) {
              dailyData[date] = { count: 0, success: 0, failed: 0 };
            }
            dailyData[date].count += 1;
            if (exec.status === 'success') dailyData[date].success += 1;
            if (exec.status === 'failed') dailyData[date].failed += 1;
          }
        });

        return Object.entries(dailyData)
          .map(([date, data]) => ({ date, ...data }))
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      getTotalAITokensUsed: () => {
        return get().executions.reduce((sum, exec) => sum + exec.aiTokensUsed, 0);
      },
    }),
    {
      name: 'flowversal-executions',
    }
  )
);
