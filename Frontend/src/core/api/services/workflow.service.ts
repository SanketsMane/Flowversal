import { buildApiUrl, getAuthHeaders } from '@/core/api/api.config';
import { executeWorkflow, getExecutionStatus, stopExecution } from '@/core/api/services/workflow-execution.service';

export interface WorkflowExecuteOptions {
  workflowId: string;
  input?: Record<string, any>;
  triggeredBy?: 'manual' | 'webhook' | 'scheduled' | 'event';
  accessToken?: string;
}

export interface WorkflowExecutionUpdate {
  executionId: string;
  status?: string;
  progress?: number;
  stepsExecuted?: number;
  totalSteps?: number;
  currentStep?: string | null;
  error?: string;
  result?: any;
}

/**
 * Execute workflow via REST
 */
export async function runWorkflow(options: WorkflowExecuteOptions) {
  const { workflowId, input, triggeredBy, accessToken } = options;
  return executeWorkflow(workflowId, { input, triggeredBy }, accessToken);
}

/**
 * Stop workflow execution
 */
export async function stopWorkflow(executionId: string, accessToken?: string) {
  return stopExecution(executionId, accessToken);
}

/**
 * Get workflow execution status
 */
export async function fetchExecutionStatus(executionId: string, accessToken?: string) {
  return getExecutionStatus(executionId, accessToken);
}

/**
 * Subscribe to execution updates via WebSocket.
 * Note: backend websocket route is /api/v1/workflows/:executionId/stream
 */
export function subscribeExecutionStream(
  executionId: string,
  onMessage: (update: WorkflowExecutionUpdate) => void,
  onError?: (err: any) => void
): () => void {
  const url = buildApiUrl(`/workflows/${executionId}/stream`).replace('http', 'ws');
  const socket = new WebSocket(url);

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage({
        executionId,
        status: data.status,
        progress: data.progress,
        stepsExecuted: data.stepsExecuted,
        totalSteps: data.totalSteps,
        currentStep: data.currentStep,
        error: data.error,
        result: data.result,
      });
    } catch (err) {
      onError?.(err);
    }
  };

  socket.onerror = (err) => {
    onError?.(err);
  };

  return () => {
    try {
      socket.close();
    } catch {
      // ignore
    }
  };
}

