export interface ExecutionInput {
  [key: string]: any;
}

export interface ExecutionContext {
  workflow: any;
  execution: any;
  input: ExecutionInput;
  variables: Record<string, any>;
  stepResults: Map<string, any>;
}

export interface NodeExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  duration?: number;
}

export interface ContainerExecutionResult {
  success: boolean;
  nodeResults: Map<string, NodeExecutionResult>;
  error?: string;
}

export interface WorkflowExecutionOptions {
  useLangGraph?: boolean;
  timeout?: number;
  useQueue?: boolean;
  enqueue?: boolean;
  retryOptions?: {
    maxAttempts: number;
    delayMs: number;
  };
}

export interface ExecutionStats {
  totalSteps: number;
  stepsExecuted: number;
  aiTokensUsed: number;
  apiCallsMade: number;
  duration: number;
}
