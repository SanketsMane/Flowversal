/**
 * Workflow API Client
 * Frontend utility for interacting with workflow endpoints
 */

import { buildApiUrl } from '../../../core/api/api.config';

export interface Workflow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  data?: any;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  relevanceScore?: number;
  matchedBy?: string;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  data?: any;
  tags?: string[];
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  data?: any;
  tags?: string[];
}

export interface SearchWorkflowsRequest {
  query: string;
  limit?: number;
  userId?: string;
}

/**
 * Get authorization header
 */
function getAuthHeader(accessToken: string) {
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Create a new workflow
 */
export async function createWorkflow(
  accessToken: string,
  workflow: CreateWorkflowRequest
): Promise<{ success: boolean; workflow?: Workflow; error?: string }> {
  try {
    const response = await fetch(buildApiUrl('/workflows'), {
      method: 'POST',
      headers: getAuthHeader(accessToken),
      body: JSON.stringify(workflow)
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Create workflow error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get workflow by ID
 */
export async function getWorkflow(
  accessToken: string,
  workflowId: string
): Promise<{ success: boolean; workflow?: Workflow; error?: string }> {
  try {
    const response = await fetch(buildApiUrl(`/workflows/${workflowId}`), {
      method: 'GET',
      headers: getAuthHeader(accessToken)
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Get workflow error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * List all user workflows
 */
export async function listWorkflows(
  accessToken: string
): Promise<{ success: boolean; workflows?: Workflow[]; count?: number; error?: string }> {
  try {
    const response = await fetch(buildApiUrl('/workflows'), {
      method: 'GET',
      headers: getAuthHeader(accessToken)
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('List workflows error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update workflow
 */
export async function updateWorkflow(
  accessToken: string,
  workflowId: string,
  updates: UpdateWorkflowRequest
): Promise<{ success: boolean; workflow?: Workflow; error?: string }> {
  try {
    const response = await fetch(buildApiUrl(`/workflows/${workflowId}`), {
      method: 'PUT',
      headers: getAuthHeader(accessToken),
      body: JSON.stringify(updates)
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Update workflow error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete workflow
 */
export async function deleteWorkflow(
  accessToken: string,
  workflowId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch(buildApiUrl(`/workflows/${workflowId}`), {
      method: 'DELETE',
      headers: getAuthHeader(accessToken)
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Delete workflow error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Semantic search for workflows using Pinecone RAG
 */
export async function searchWorkflows(
  accessToken: string,
  request: SearchWorkflowsRequest
): Promise<{ 
  success: boolean; 
  results?: Workflow[]; 
  count?: number; 
  searchMethod?: string;
  error?: string;
}> {
  try {
    const response = await fetch(buildApiUrl('/ai/search'), {
      method: 'POST',
      headers: getAuthHeader(accessToken),
      body: JSON.stringify({
        query: request.query,
        limit: request.limit || 5,
        userId: request.userId,
        collection: 'workflows'
      })
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Search workflows error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Index workflow manually (usually done automatically)
 */
export async function indexWorkflow(
  accessToken: string,
  workflowId: string,
  name: string,
  description?: string,
  tags?: string[]
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch(buildApiUrl('/ai/rag/index'), {
      method: 'POST',
      headers: getAuthHeader(accessToken),
      body: JSON.stringify({
        workflowId,
        name,
        description,
        tags
      })
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Index workflow error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Chat with AI
 */
export async function chatWithAI(
  accessToken: string,
  message: string,
  model?: string,
  conversationId?: string
): Promise<{ 
  success: boolean; 
  response?: string; 
  conversationId?: string;
  error?: string;
}> {
  try {
    const response = await fetch(buildApiUrl('/ai/chat'), {
      method: 'POST',
      headers: getAuthHeader(accessToken),
      body: JSON.stringify({
        message,
        model: model || 'gpt-4',
        conversationId
      })
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Chat error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate workflow from description
 */
export async function generateWorkflow(
  accessToken: string,
  description: string,
  model?: string
): Promise<{ 
  success: boolean; 
  workflow?: any;
  error?: string;
}> {
  try {
    const response = await fetch(buildApiUrl('/ai/generate-workflow'), {
      method: 'POST',
      headers: getAuthHeader(accessToken),
      body: JSON.stringify({
        description,
        model: model || 'gpt-4'
      })
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Generate workflow error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Analyze text with AI
 */
export async function analyzeText(
  accessToken: string,
  text: string,
  analysisType?: string
): Promise<{ 
  success: boolean; 
  analysis?: any;
  error?: string;
}> {
  try {
    const response = await fetch(buildApiUrl('/ai/analyze'), {
      method: 'POST',
      headers: getAuthHeader(accessToken),
      body: JSON.stringify({
        text,
        analysisType: analysisType || 'all'
      })
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Analyze text error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Execute AI agent with tools
 */
export async function executeAgent(
  accessToken: string,
  task: string,
  tools?: string[],
  context?: string,
  model?: string
): Promise<{ 
  success: boolean; 
  result?: any;
  error?: string;
}> {
  try {
    const response = await fetch(buildApiUrl('/ai/mcp/execute'), {
      method: 'POST',
      headers: getAuthHeader(accessToken),
      body: JSON.stringify({
        task,
        tools: tools || [],
        context,
        model: model || 'gpt-4'
      })
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Execute agent error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Execute workflow
 */
export async function executeWorkflow(
  accessToken: string,
  workflowId: string,
  input?: any,
  triggeredBy: 'manual' | 'webhook' | 'scheduled' | 'event' = 'manual'
): Promise<{ 
  success: boolean; 
  executionId?: string;
  data?: any;
  error?: string;
}> {
  try {
    const response = await fetch(buildApiUrl(`/workflows/${workflowId}/execute`), {
      method: 'POST',
      headers: getAuthHeader(accessToken),
      body: JSON.stringify({
        input: input || {},
        triggeredBy,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to execute workflow' }));
      return {
        success: false,
        error: errorData.message || errorData.error || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: data.success || false,
      executionId: data.data?.id || data.executionId,
      data: data.data,
    };
  } catch (error: any) {
    console.error('Execute workflow error:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}

/**
 * Get execution status
 */
export async function getExecutionStatus(
  accessToken: string,
  executionId: string
): Promise<{ 
  success: boolean; 
  data?: any;
  error?: string;
}> {
  try {
    const response = await fetch(buildApiUrl(`/workflows/executions/${executionId}`), {
      method: 'GET',
      headers: getAuthHeader(accessToken)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to get execution status' }));
      return {
        success: false,
        error: errorData.message || errorData.error || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: data.success || false,
      data: data.data,
    };
  } catch (error: any) {
    console.error('Get execution status error:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}

/**
 * Stop execution
 */
export async function stopExecution(
  accessToken: string,
  executionId: string
): Promise<{ 
  success: boolean; 
  message?: string;
  error?: string;
}> {
  try {
    const response = await fetch(buildApiUrl(`/workflows/executions/${executionId}/stop`), {
      method: 'POST',
      headers: getAuthHeader(accessToken)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to stop execution' }));
      return {
        success: false,
        error: errorData.message || errorData.error || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: data.success || false,
      message: data.message,
    };
  } catch (error: any) {
    console.error('Stop execution error:', error);
    return { success: false, error: error.message || 'Network error' };
  }
}
