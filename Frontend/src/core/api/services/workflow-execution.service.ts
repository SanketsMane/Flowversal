/**
 * Workflow Execution Service
 * Handles workflow execution API calls and status polling
 */

import { formatErrorMessage, handleApiResponse, isRetryableError, retryWithBackoff } from '../../../shared/utils/error-handler';
import { buildApiUrl, getAuthHeaders } from '../api.config';

export interface ExecutionInput {
  [key: string]: any;
}

export interface ExecutionStatus {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped';
  input?: ExecutionInput;
  output?: any;
  error?: {
    message: string;
    step?: string;
    code?: string;
  };
  startedAt: string;
  completedAt?: string;
  duration?: number;
  stepsExecuted?: number;
  totalSteps?: number;
  aiTokensUsed?: number;
  apiCallsMade?: number;
  triggeredBy?: 'manual' | 'webhook' | 'scheduled' | 'event';
  triggerData?: Record<string, any>;
}

export interface ExecutionRequest {
  input?: ExecutionInput;
  triggeredBy?: 'manual' | 'webhook' | 'scheduled' | 'event';
  triggerData?: Record<string, any>;
  workflow?: any; // For unsaved workflows
}

export interface ExecutionResponse {
  success: boolean;
  data?: ExecutionStatus;
  executionId?: string;
  message?: string;
  error?: string;
}

/**
 * Execute a workflow (saved or unsaved)
 */
export async function executeWorkflow(
  workflowId: string | undefined,
  request: ExecutionRequest = {},
  accessToken?: string
): Promise<ExecutionResponse> {
  // #region agent log
  console.log('[DEBUG] executeWorkflow entry', { workflowId, hasRequest: !!request, hasWorkflow: !!request.workflow, hasAccessToken: !!accessToken });
  fetch('http://127.0.0.1:7242/ingest/4eca190d-c843-4d4a-a868-56d71e69b49f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'workflow-execution.service.ts:52',message:'executeWorkflow entry',data:{workflowId,hasRequest:!!request,hasWorkflow:!!request.workflow,hasAccessToken:!!accessToken},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  try {
    const headers = await getAuthHeaders(accessToken);
    
    // Determine endpoint: use /execute for unsaved workflows, /:id/execute for saved
    const url = workflowId 
      ? buildApiUrl(`/workflows/${workflowId}/execute`)
      : buildApiUrl(`/workflows/execute`);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4eca190d-c843-4d4a-a868-56d71e69b49f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'workflow-execution.service.ts:59',message:'Before fetch',data:{url,hasHeaders:!!headers,isUnsaved:!workflowId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    const result = await retryWithBackoff(
      async () => {
        const body: any = {
          input: request.input || {},
          triggeredBy: request.triggeredBy || 'manual',
          triggerData: request.triggerData || {},
        };
        
        // Include workflow data for unsaved workflows
        if (!workflowId && request.workflow) {
          body.workflow = request.workflow;
        }
        
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4eca190d-c843-4d4a-a868-56d71e69b49f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'workflow-execution.service.ts:72',message:'Fetch response',data:{status:response.status,statusText:response.statusText,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        return handleApiResponse<ExecutionStatus>(response, 'Failed to execute workflow');
      },
      {
        maxRetries: 3,
        retryable: (error) => isRetryableError(error),
      }
    );

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4eca190d-c843-4d4a-a868-56d71e69b49f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'workflow-execution.service.ts:79',message:'After retryWithBackoff',data:{success:result.success,hasData:!!result.data,executionId:result.data?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    if (!result.success) {
      return {
        success: false,
        error: formatErrorMessage(result.error, 'Failed to execute workflow'),
      };
    }

    // Extract execution ID with fallback
    const executionId = result.data?.id || result.data?._id || result.data?.executionId;
    
    // #region agent log
    console.log('[DEBUG] Returning success response', { hasData: !!result.data, executionId, dataKeys: result.data ? Object.keys(result.data) : [], resultData: result.data });
    fetch('http://127.0.0.1:7242/ingest/4eca190d-c843-4d4a-a868-56d71e69b49f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'workflow-execution.service.ts:102',message:'Returning success response',data:{hasData:!!result.data,executionId,dataKeys:result.data?Object.keys(result.data):[]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    return {
      success: true,
      data: result.data,
      executionId,
      message: 'Workflow execution started',
    };
  } catch (error: any) {
    console.error('[Workflow Execution] Execute error:', error);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/4eca190d-c843-4d4a-a868-56d71e69b49f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'workflow-execution.service.ts:94',message:'executeWorkflow error',data:{errorMessage:error?.message,errorName:error?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return {
      success: false,
      error: formatErrorMessage(error, 'Network error: Failed to execute workflow'),
    };
  }
}

/**
 * Get execution status
 */
export async function getExecutionStatus(
  executionId: string,
  accessToken?: string
): Promise<ExecutionResponse> {
  try {
    const headers = await getAuthHeaders(accessToken);
    
    const result = await retryWithBackoff(
      async () => {
        const response = await fetch(buildApiUrl(`/workflows/executions/${executionId}`), {
          method: 'GET',
          headers,
        });

        return handleApiResponse<ExecutionStatus>(response, 'Failed to get execution status');
      },
      {
        maxRetries: 2,
        retryable: (error) => isRetryableError(error),
      }
    );

    if (!result.success) {
      return {
        success: false,
        error: formatErrorMessage(result.error, 'Failed to get execution status'),
      };
    }

    return {
      success: true,
      data: result.data,
      executionId: result.data?.id || executionId,
    };
  } catch (error: any) {
    console.error('[Workflow Execution] Get status error:', error);
    return {
      success: false,
      error: formatErrorMessage(error, 'Network error: Failed to get execution status'),
    };
  }
}

/**
 * Stop execution
 */
export async function stopExecution(
  executionId: string,
  accessToken?: string
): Promise<ExecutionResponse> {
  try {
    const headers = await getAuthHeaders(accessToken);
    
    const response = await fetch(buildApiUrl(`/workflows/executions/${executionId}/stop`), {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to stop execution' }));
      return {
        success: false,
        error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    
    return {
      success: data.success || false,
      message: data.message || 'Execution stopped successfully',
    };
  } catch (error: any) {
    console.error('[Workflow Execution] Stop error:', error);
    return {
      success: false,
      error: error.message || 'Network error: Failed to stop execution',
    };
  }
}

/**
 * List executions for a workflow
 */
export async function listWorkflowExecutions(
  workflowId: string,
  options: { page?: number; limit?: number } = {},
  accessToken?: string
): Promise<{ success: boolean; executions?: ExecutionStatus[]; pagination?: any; error?: string }> {
  try {
    const headers = await getAuthHeaders(accessToken);
    const { page = 1, limit = 20 } = options;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    const response = await fetch(buildApiUrl(`/workflows/${workflowId}/executions?${queryParams}`), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to list executions' }));
      return {
        success: false,
        error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    
    return {
      success: data.success || false,
      executions: data.data || [],
      pagination: data.pagination,
    };
  } catch (error: any) {
    console.error('[Workflow Execution] List executions error:', error);
    return {
      success: false,
      error: error.message || 'Network error: Failed to list executions',
    };
  }
}

