/**
 * Projects Service
 * 
 * Backend-agnostic service for managing projects, boards, and tasks.
 * Works with both Supabase Edge Functions and Node.js backend.
 */
import { buildApiUrl, getAuthHeaders } from '@/core/api/api.config';
import type { ApiResponse } from '@/core/api/types';
import { projectId } from '@/shared/utils/supabase/info';
import { authService } from './auth.service';
// ============================================================================
// API SERVICE CONFIGURATION
// ============================================================================
const API_BASE_URL = buildApiUrl('');
/**
 * Generic API call wrapper with logging and error handling
 */
async function apiCall<T>(
  endpoint: string,
  method: string,
  body?: any
): Promise<ApiResponse<T>> {
  // Check if user is authenticated before making API calls
  let isAuthenticated = authService.isAuthenticated();
  // Attempt to refresh/hydrate session if not authenticated
  if (!isAuthenticated) {
    console.warn(`[API Service] ${method} ${endpoint} - not authenticated; trying to refresh session`);
    const refreshed = await authService.refreshSession();
    if (!refreshed) {
      const hydrated = await authService.hydrateFromSupabase?.();
      if (hydrated) {
        isAuthenticated = authService.isAuthenticated();
      }
    } else {
      isAuthenticated = authService.isAuthenticated();
    }
  }
  const getDirectToken = () => authService.getAccessToken();
  // Grab token early from authService if available
  let directToken = getDirectToken();
  if (!isAuthenticated && !directToken) {
    console.warn(`[API Service] Skipping ${method} ${endpoint} - User not authenticated after refresh/hydrate`);
    return {
      success: false,
      error: 'Not authenticated',
      details: 'User must be authenticated to make API calls'
    };
  }
  // Ensure endpoint starts with / and base URL doesn't end with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const url = `${cleanBase}${cleanEndpoint}`;
  if (body) {
  }
  try {
    const extractAuth = (bh: HeadersInit | undefined | null) => {
      if (!bh) return '';
      if (bh instanceof Headers) return bh.get('Authorization') || '';
      if (Array.isArray(bh)) {
        const entry = bh.find(([key]) => key === 'Authorization');
        return entry ? entry[1] : '';
      }
      return (bh as Record<string, string>)['Authorization'] || '';
    };
    const buildHeaders = async () => {
      const freshToken = getDirectToken() || directToken || undefined;
      const baseHeaders = await getAuthHeaders(freshToken);
      let headers: Record<string, string> = {};
      // Extract Authorization
      let authHeader = extractAuth(baseHeaders);
      // Fallback: pull token directly from stored session if missing
      if (!authHeader) {
        try {
          const sessionStr = localStorage.getItem('flowversal_auth_session');
          if (sessionStr) {
            const session = JSON.parse(sessionStr);
            const token = session?.accessToken;
            if (token) {
              authHeader = `Bearer ${token}`;
            }
          }
        } catch (err) {
          console.warn('[API Service] Failed to parse stored session for auth fallback', err);
        }
      }
      // Final fallback: use direct token from authService if still missing
      const finalDirect = getDirectToken();
      if (!authHeader && finalDirect) {
        authHeader = `Bearer ${finalDirect}`;
      }
      if (authHeader) {
        headers['Authorization'] = authHeader;
      } else {
        console.warn('[API Service] Authorization header missing; request may be unauthorized');
      }
      // For requests with body, also include Content-Type
      if (body) {
        headers['Content-Type'] = 'application/json';
      }
      return headers;
    };
    let headers = await buildHeaders();
    const doFetch = async () =>
      fetch(url, {
        method,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
    let response = await doFetch();
    // If unauthorized, attempt one retry after refreshing headers/session (in case token just refreshed elsewhere)
    if (response.status === 401) {
      console.warn('[API Service] 401 Unauthorized, attempting refresh + header retry');
      // Try to refresh session
      await authService.refreshSession();
      // Rebuild headers after refresh
      headers = await buildHeaders();
      response = await doFetch();
    }
    // Handle unauthorized explicitly
    if (response.status === 401) {
      console.warn('[API Service] Received 401 Unauthorized for', method, endpoint);
      return {
        success: false,
        error: 'Unauthorized',
        details: 'Authentication failed',
      };
    }
    // Try to get response text first
    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`[API Service] Failed to parse JSON response:`, parseError);
      return {
        success: false,
        error: 'Invalid JSON response from server',
        details: responseText.substring(0, 200),
      };
    }
    if (!response.ok) {
      // Handle backend/proxy unavailable gracefully
      const backendUnavailable =
        response.status === 503 &&
        (result?.error === 'Backend server is not available' ||
          result?.message?.toLowerCase?.().includes('backend server is not available'));
      if (backendUnavailable) {
        return {
          success: false,
          error: 'Backend server is not available',
          details: result?.message || 'Proxy could not reach backend on port 3001',
        };
      }
      const errorMessage = result.error || result.message || 'Request failed';
      const errorDetails = result.details || result.code || undefined;
      console.error(`[API Service] ${method} ${endpoint} - Error:`, errorMessage);
      console.error(`[API Service] Full error object:`, result);
      return {
        success: false,
        error: errorMessage,
        details: errorDetails,
      };
    }
    // Ensure we always return ApiResponse<T>
    return {
      success: result?.success ?? true,
      data: result?.data ?? result,
      error: result?.error,
      details: result?.details,
    };
  } catch (error: any) {
    console.error(`[API Service] ${method} ${endpoint} - Network/Parse error:`, error);
    return {
      success: false,
      error: 'Network error or failed to parse response',
      details: error.message,
    };
  }
}
// ============================================================================
// PROJECT API
// ============================================================================
export interface Project {
  id: string;
  name: string;
  description?: string;
  icon: string;
  iconColor: string;
  configuration?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  userId: string;
}
export interface CreateProjectData {
  name: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  configuration?: Record<string, any>;
}
export interface UpdateProjectData {
  name?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  configuration?: Record<string, any>;
}
/**
 * Fetch all projects for the current user
 */
export async function fetchProjects() {
  return apiCall<Project[]>('/projects', 'GET');
}
/**
 * Create a new project
 */
export async function createProject(data: CreateProjectData) {
  return apiCall<Project>('/projects', 'POST', data);
}
/**
 * Update an existing project
 */
export async function updateProject(id: string, data: UpdateProjectData) {
  return apiCall<Project>(`/projects/${id}`, 'PUT', data);
}
/**
 * Delete a project
 */
export async function deleteProject(id: string) {
  return apiCall(`/projects/${id}`, 'DELETE');
}
// ============================================================================
// BOARD API
// ============================================================================
export interface Board {
  id: string;
  name: string;
  description?: string;
  icon: string;
  iconColor: string;
  projectId: string;
  configuration?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  userId: string;
}
export interface CreateBoardData {
  name: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  projectId: string;
  configuration?: Record<string, any>;
}
export interface UpdateBoardData {
  name?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  configuration?: Record<string, any>;
}
/**
 * Fetch all boards (optionally filtered by project)
 */
export async function fetchBoards(projectId?: string) {
  const endpoint = projectId ? `/projects/boards?projectId=${projectId}` : '/projects/boards';
  return apiCall<Board[]>(endpoint, 'GET');
}
/**
 * Create a new board
 */
export async function createBoard(data: CreateBoardData) {
  return apiCall<Board>('/projects/boards', 'POST', data);
}
/**
 * Update an existing board
 */
export async function updateBoard(id: string, data: UpdateBoardData) {
  return apiCall<Board>(`/projects/boards/${id}`, 'PUT', data);
}
/**
 * Delete a board
 */
export async function deleteBoard(id: string) {
  return apiCall(`/projects/boards/${id}`, 'DELETE');
}
// ============================================================================
// TASK API
// ============================================================================
export interface Task {
  id: string;
  taskId: string;
  name: string;
  description: string;
  assignedTo: Array<{ id: string; name: string; avatar: string }>;
  status: string;
  priority: string;
  labels: Array<{ id: string; name: string; color: string }>;
  dueDate?: string;
  startDate?: string;
  recurring?: string;
  reminder?: string;
  selectedDays?: string[];
  hasWorkflow: boolean;
  boardId: string;
  projectId: string;
  createdBy: { id: string; name: string; avatar: string };
  order?: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}
export interface CreateTaskData {
  name: string;
  description?: string;
  assignedTo?: Array<{ id: string; name: string; avatar: string; email?: string }>;
  status?: string;
  priority?: string;
  labels?: Array<{ id: string; name: string; color: string }> | string[];
  dueDate?: string;
  hasWorkflow?: boolean;
  boardId: string;
  projectId: string;
  createdBy?: { id: string; name: string; avatar: string };
  order?: number;
  // Additional fields for full task details
  checklists?: any[];
  comments?: any[];
  attachments?: any[];
  workflows?: any[];
  recurring?: string;
  reminder?: string;
  selectedDays?: string[];
  startDate?: string;
}
export interface UpdateTaskData {
  name?: string;
  description?: string;
  assignedTo?: Array<{ id: string; name: string; avatar: string; email?: string }>;
  status?: string;
  priority?: string;
  labels?: Array<{ id: string; name: string; color: string }> | string[];
  dueDate?: string;
  hasWorkflow?: boolean;
  order?: number;
  // Additional fields for full task details
  checklists?: any[];
  comments?: any[];
  attachments?: any[];
  workflows?: any[];
  recurring?: string;
  reminder?: string;
  selectedDays?: string[];
  startDate?: string;
  boardId?: string;
  projectId?: string;
}
export interface FetchTasksFilters {
  boardId?: string;
  projectId?: string;
  userId?: string;
}
/**
 * Fetch all tasks (with optional filters)
 */
export async function fetchTasks(filters?: FetchTasksFilters) {
  const params = new URLSearchParams();
  if (filters?.boardId) params.append('boardId', filters.boardId);
  if (filters?.projectId) params.append('projectId', filters.projectId);
  if (filters?.userId) params.append('userId', filters.userId);
  const endpoint = `/projects/tasks${params.toString() ? `?${params.toString()}` : ''}`;
  return apiCall<Task[]>(endpoint, 'GET');
}
/**
 * Create a new task
 */
export async function createTask(data: CreateTaskData) {
  return apiCall<Task>('/projects/tasks', 'POST', data);
}
/**
 * Update an existing task
 */
export async function updateTask(id: string, data: UpdateTaskData) {
  return apiCall<Task>(`/projects/tasks/${id}`, 'PUT', data);
}
/**
 * Delete a task
 */
export async function deleteTask(id: string) {
  return apiCall(`/projects/tasks/${id}`, 'DELETE');
}
// ============================================================================
// BULK OPERATIONS
// ============================================================================
/**
 * Fetch complete project data (project + boards + tasks)
 */
export async function fetchCompleteProjectData(projectId: string) {
  const [projectsResult, boardsResult, tasksResult] = await Promise.all([
    fetchProjects(),
    fetchBoards(projectId),
    fetchTasks({ projectId }),
  ]);
  if (!projectsResult.success) {
    return { success: false, error: projectsResult.error };
  }
  const project = projectsResult.data?.find(p => p.id === projectId);
  if (!project) {
    return { success: false, error: 'Project not found' };
  }
  return {
    success: true,
    data: {
      project,
      boards: boardsResult.data || [],
      tasks: tasksResult.data || [],
    },
  };
}
/**
 * Fetch all data for the current user
 */
export async function fetchAllUserData() {
  const [projectsResult, boardsResult, tasksResult] = await Promise.all([
    fetchProjects(),
    fetchBoards(),
    fetchTasks(),
  ]);
  return {
    success: projectsResult.success && boardsResult.success && tasksResult.success,
    data: {
      projects: projectsResult.data || [],
      boards: boardsResult.data || [],
      tasks: tasksResult.data || [],
    },
    errors: {
      projects: projectsResult.error,
      boards: boardsResult.error,
      tasks: tasksResult.error,
    },
  };
}