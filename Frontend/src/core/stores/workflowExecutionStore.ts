import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { WorkflowExecutionUpdate } from '@/core/api/services/workflow.service';

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'stopped';

export interface ExecutionEntry {
  id: string;
  workflowId?: string;
  status: ExecutionStatus;
  progress?: number;
  stepsExecuted?: number;
  totalSteps?: number;
  currentStep?: string | null;
  error?: string;
  result?: any;
  startedAt?: number;
  completedAt?: number;
}

interface WorkflowExecutionState {
  executions: Record<string, ExecutionEntry>;
  upsertExecution: (entry: ExecutionEntry) => void;
  updateExecution: (executionId: string, update: Partial<ExecutionEntry>) => void;
  completeExecution: (executionId: string, status: ExecutionStatus, result?: any, error?: string) => void;
  removeExecution: (executionId: string) => void;
  reset: () => void;
}

export const useWorkflowExecutionStore = create<WorkflowExecutionState>()(
  devtools(
    (set) => ({
      executions: {},
      upsertExecution: (entry) =>
        set((state) => ({
          executions: {
            ...state.executions,
            [entry.id]: {
              ...state.executions[entry.id],
              ...entry,
              startedAt: entry.startedAt ?? state.executions[entry.id]?.startedAt ?? Date.now(),
            },
          },
        })),
      updateExecution: (executionId, update) =>
        set((state) => {
          const existing = state.executions[executionId];
          if (!existing) return state;
          return {
            executions: {
              ...state.executions,
              [executionId]: { ...existing, ...update },
            },
          };
        }),
      completeExecution: (executionId, status, result, error) =>
        set((state) => {
          const existing = state.executions[executionId];
          if (!existing) return state;
          return {
            executions: {
              ...state.executions,
              [executionId]: {
                ...existing,
                status,
                result,
                error,
                completedAt: Date.now(),
              },
            },
          };
        }),
      removeExecution: (executionId) =>
        set((state) => {
          const { [executionId]: _, ...rest } = state.executions;
          return { executions: rest };
        }),
      reset: () => set({ executions: {} }),
    }),
    { name: 'workflowExecutionStore' }
  )
);

/**
 * Helper to apply WebSocket update payloads to the store.
 */
export function applyExecutionUpdate(update: WorkflowExecutionUpdate) {
  const { executionId, ...rest } = update;
  useWorkflowExecutionStore.getState().updateExecution(executionId, rest);
}

