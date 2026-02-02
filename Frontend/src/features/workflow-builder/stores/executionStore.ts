/**
 * Execution Store
 * Phase 4 Part 2 - Workflow Execution Engine
 * 
 * Zustand store for execution state management
 */

import { create } from 'zustand';
import {
  ExecutionState,
  ExecutionContext,
  ExecutionConfig,
  ExecutionLog,
  ExecutionStepResult,
  ExecutionStatus,
} from '../types/execution.types';
import { ExecutionEngine } from '../engine/ExecutionEngine';

interface ExecutionStore extends ExecutionState {
  // Engine instance
  engine: ExecutionEngine | null;
  
  // Actions
  initializeEngine: () => void;
  startExecution: (workflowId: string, steps: any[], config?: Partial<ExecutionConfig>) => Promise<void>;
  pauseExecution: () => void;
  resumeExecution: () => void;
  stopExecution: () => void;
  clearLogs: () => void;
  clearHistory: () => void;
  updateContext: (context: ExecutionContext) => void;
  addLog: (log: ExecutionLog) => void;
  updateStepResult: (result: ExecutionStepResult) => void;
  setStatus: (status: ExecutionStatus) => void;
}

export const useExecutionStore = create<ExecutionStore>((set, get) => ({
  // Initial state
  currentExecution: null,
  isExecuting: false,
  isPaused: false,
  executionHistory: [],
  config: {
    stepDelay: 500,
    timeout: 300000,
    retryOnError: false,
    maxRetries: 3,
    breakpoints: [],
    logLevel: 'info',
    variables: {},
  },
  engine: null,

  // Initialize engine
  initializeEngine: () => {
    const engine = new ExecutionEngine();

    // Set up callbacks
    engine.onStatusChanged((status) => {
      get().setStatus(status);
    });

    engine.onStepCompleted((result) => {
      get().updateStepResult(result);
    });

    engine.onLogAdded((log) => {
      get().addLog(log);
    });

    set({ engine });
  },

  // Start execution
  startExecution: async (workflowId, steps, config = {}) => {
    const { engine, config: storeConfig } = get();
    
    if (!engine) {
      console.error('Execution engine not initialized');
      return;
    }

    if (get().isExecuting) {
      console.warn('Execution already in progress');
      return;
    }

    const finalConfig = { ...storeConfig, ...config };

    set({ 
      isExecuting: true, 
      isPaused: false,
      config: finalConfig,
    });

    try {
      const context = await engine.start(workflowId, steps, finalConfig);
      
      set((state) => ({
        currentExecution: context,
        isExecuting: false,
        executionHistory: [...state.executionHistory, context],
      }));
    } catch (error) {
      console.error('Execution failed:', error);
      set({ isExecuting: false });
    }
  },

  // Pause execution
  pauseExecution: () => {
    const { engine } = get();
    if (engine) {
      engine.pause();
      set({ isPaused: true });
    }
  },

  // Resume execution
  resumeExecution: () => {
    const { engine } = get();
    if (engine) {
      engine.resume();
      set({ isPaused: false });
    }
  },

  // Stop execution
  stopExecution: () => {
    const { engine } = get();
    if (engine) {
      engine.stop();
      set({ isExecuting: false, isPaused: false });
    }
  },

  // Clear logs
  clearLogs: () => {
    set((state) => ({
      currentExecution: state.currentExecution
        ? { ...state.currentExecution, logs: [] }
        : null,
    }));
  },

  // Clear history
  clearHistory: () => {
    set({ executionHistory: [] });
  },

  // Update context
  updateContext: (context) => {
    set({ currentExecution: context });
  },

  // Add log
  addLog: (log) => {
    set((state) => ({
      currentExecution: state.currentExecution
        ? {
            ...state.currentExecution,
            logs: [...state.currentExecution.logs, log],
          }
        : null,
    }));
  },

  // Update step result
  updateStepResult: (result) => {
    set((state) => {
      if (!state.currentExecution) return state;

      const existingIndex = state.currentExecution.steps.findIndex(
        (s) => s.stepId === result.stepId
      );

      const newSteps = [...state.currentExecution.steps];
      if (existingIndex >= 0) {
        newSteps[existingIndex] = result;
      } else {
        newSteps.push(result);
      }

      return {
        currentExecution: {
          ...state.currentExecution,
          steps: newSteps,
        },
      };
    });
  },

  // Set status
  setStatus: (status) => {
    set((state) => ({
      currentExecution: state.currentExecution
        ? { ...state.currentExecution, status }
        : null,
      isExecuting: status === 'running',
      isPaused: status === 'paused',
    }));
  },
}));

// Initialize engine on first use
let initialized = false;
export function useExecution() {
  const store = useExecutionStore();

  if (!initialized && !store.engine) {
    store.initializeEngine();
    initialized = true;
  }

  return store;
}
