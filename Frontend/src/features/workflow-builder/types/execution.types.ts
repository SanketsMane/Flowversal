/**
 * Execution Types
 * Phase 4 Part 2 - Workflow Execution Engine
 */

export type ExecutionStatus = 
  | 'idle'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'stopped';

export type ExecutionStepStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped';

export type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'debug';

export interface ExecutionLog {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  stepId?: string;
  stepName?: string;
  data?: any;
  error?: Error;
}

export interface ExecutionStepResult {
  stepId: string;
  stepName: string;
  status: ExecutionStepStatus;
  startTime: number;
  endTime?: number;
  duration?: number;
  input?: any;
  output?: any;
  error?: Error;
  logs: ExecutionLog[];
}

export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: ExecutionStatus;
  currentStepIndex: number;
  steps: ExecutionStepResult[];
  logs: ExecutionLog[];
  variables: Record<string, any>;
  errors: Error[];
}

export interface ExecutionConfig {
  stepDelay?: number; // Delay between steps (ms)
  timeout?: number; // Max execution time (ms)
  retryOnError?: boolean;
  maxRetries?: number;
  breakpoints?: string[]; // Step IDs to pause at
  logLevel?: LogLevel;
  variables?: Record<string, any>; // Initial variables
}

export interface ExecutionState {
  // Current execution
  currentExecution: ExecutionContext | null;
  isExecuting: boolean;
  isPaused: boolean;
  
  // History
  executionHistory: ExecutionContext[];
  
  // Config
  config: ExecutionConfig;
}

export interface ExecutionControls {
  start: (workflowId: string, config?: Partial<ExecutionConfig>) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  stepForward: () => Promise<void>;
  stepBackward: () => void;
  restart: () => Promise<void>;
  clearLogs: () => void;
  clearHistory: () => void;
}

export interface StepExecutor {
  id: string;
  name: string;
  type: 'trigger' | 'node' | 'tool' | 'condition' | 'loop';
  execute: (input: any, context: ExecutionContext) => Promise<any>;
  validate?: (input: any) => boolean;
  shouldSkip?: (context: ExecutionContext) => boolean;
}

export interface ExecutionMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: number;
  totalSteps: number;
  averageStepsPerExecution: number;
}
