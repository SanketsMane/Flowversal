/**
 * Workflow Registry Store - Central Workflow Management
 * Shared across app and admin
 * Stores ALL saved workflows from all users
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedWorkflow {
  id: string;
  name: string;
  description: string;
  
  // Owner info
  userId: string;
  userName: string;
  
  // Workflow structure (from workflow builder)
  triggers: any[];
  containers: any[];
  formFields: any[];
  
  // Metadata
  createdAt: number;
  updatedAt: number;
  
  // Status
  status: 'draft' | 'published' | 'archived';
  isPublic: boolean;
  
  // Stats
  stats: {
    executions: number;
    lastExecuted?: number;
    avgExecutionTime: number;
    successRate: number;
  };
  
  // Tags & categorization
  category?: string;
  tags: string[];
  
  // Version (for future use)
  version: number;
}

interface WorkflowRegistryStore {
  workflows: SavedWorkflow[];
  
  // Actions
  saveWorkflow: (workflow: Omit<SavedWorkflow, 'id' | 'createdAt' | 'updatedAt' | 'stats' | 'version'>) => string;
  updateWorkflow: (id: string, updates: Partial<SavedWorkflow>) => void;
  deleteWorkflow: (id: string) => void;
  publishWorkflow: (id: string) => void;
  archiveWorkflow: (id: string) => void;
  
  // Queries
  getWorkflowById: (id: string) => SavedWorkflow | undefined;
  getWorkflowsByUser: (userId: string) => SavedWorkflow[];
  getPublicWorkflows: () => SavedWorkflow[];
  getWorkflowsByCategory: (category: string) => SavedWorkflow[];
  
  // Stats
  getTotalWorkflows: () => number;
  getActiveWorkflows: () => number;
  getPublishedWorkflows: () => number;
  getWorkflowStats: (workflowId: string) => SavedWorkflow['stats'] | undefined;
  
  // Execution tracking
  incrementExecutionCount: (workflowId: string) => void;
  updateExecutionStats: (workflowId: string, executionTime: number, success: boolean) => void;
}

export const useWorkflowRegistryStore = create<WorkflowRegistryStore>()(
  persist(
    (set, get) => ({
      workflows: [],

      saveWorkflow: (workflowData) => {
        const newWorkflow: SavedWorkflow = {
          ...workflowData,
          id: `wf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          stats: {
            executions: 0,
            avgExecutionTime: 0,
            successRate: 0,
          },
          version: 1,
        };
        
        set((state) => ({
          workflows: [newWorkflow, ...state.workflows],
        }));
        
        return newWorkflow.id;
      },

      updateWorkflow: (id, updates) => {
        set((state) => ({
          workflows: state.workflows.map((wf) =>
            wf.id === id
              ? { ...wf, ...updates, updatedAt: Date.now() }
              : wf
          ),
        }));
      },

      deleteWorkflow: (id) => {
        set((state) => ({
          workflows: state.workflows.filter((wf) => wf.id !== id),
        }));
      },

      publishWorkflow: (id) => {
        get().updateWorkflow(id, { status: 'published', isPublic: true });
      },

      archiveWorkflow: (id) => {
        get().updateWorkflow(id, { status: 'archived' });
      },

      getWorkflowById: (id) => {
        return get().workflows.find((wf) => wf.id === id);
      },

      getWorkflowsByUser: (userId) => {
        return get().workflows.filter((wf) => wf.userId === userId);
      },

      getPublicWorkflows: () => {
        return get().workflows.filter((wf) => wf.isPublic && wf.status === 'published');
      },

      getWorkflowsByCategory: (category) => {
        return get().workflows.filter((wf) => wf.category === category);
      },

      getTotalWorkflows: () => {
        return get().workflows.length;
      },

      getActiveWorkflows: () => {
        return get().workflows.filter((wf) => wf.status !== 'archived').length;
      },

      getPublishedWorkflows: () => {
        return get().workflows.filter((wf) => wf.status === 'published').length;
      },

      getWorkflowStats: (workflowId) => {
        const workflow = get().getWorkflowById(workflowId);
        return workflow?.stats;
      },

      incrementExecutionCount: (workflowId) => {
        const workflow = get().getWorkflowById(workflowId);
        if (workflow) {
          get().updateWorkflow(workflowId, {
            stats: {
              ...workflow.stats,
              executions: workflow.stats.executions + 1,
              lastExecuted: Date.now(),
            },
          });
        }
      },

      updateExecutionStats: (workflowId, executionTime, success) => {
        const workflow = get().getWorkflowById(workflowId);
        if (workflow) {
          const stats = workflow.stats;
          const totalExecutions = stats.executions + 1;
          const successCount = success
            ? Math.round((stats.successRate / 100) * stats.executions) + 1
            : Math.round((stats.successRate / 100) * stats.executions);
          
          const newAvgTime =
            (stats.avgExecutionTime * stats.executions + executionTime) / totalExecutions;
          const newSuccessRate = (successCount / totalExecutions) * 100;

          get().updateWorkflow(workflowId, {
            stats: {
              executions: totalExecutions,
              lastExecuted: Date.now(),
              avgExecutionTime: Math.round(newAvgTime),
              successRate: Math.round(newSuccessRate),
            },
          });
        }
      },
    }),
    {
      name: 'flowversal-workflows',
    }
  )
);
