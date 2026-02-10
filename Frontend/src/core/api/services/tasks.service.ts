/**
 * Tasks API Service
 * Handles all task-related API calls to the backend
 */
import { API_ENDPOINTS, buildApiUrl, getAuthHeaders } from '../api.config';
export interface CreateTaskData {
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  labels?: string[];
  dueDate?: string;
  startDate?: string;
  recurring?: string;
  reminder?: string;
  selectedDays?: string[];
  assignedTo?: Array<{ id: string; name: string; avatar?: string; email?: string }>;
  boardId: string;
  projectId: string;
  hasWorkflow?: boolean;
  checklists?: any[];
  comments?: any[];
  attachments?: any[];
  workflows?: any[];
  createdBy?: { id: string; name: string; avatar?: string };
  order?: number;
}
export interface UpdateTaskData {
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  labels?: string[];
  dueDate?: string;
  startDate?: string;
  recurring?: string;
  reminder?: string;
  selectedDays?: string[];
  assignedTo?: Array<{ id: string; name: string; avatar?: string; email?: string }>;
  boardId?: string;
  projectId?: string;
  hasWorkflow?: boolean;
  checklists?: any[];
  comments?: any[];
  attachments?: any[];
  workflows?: any[];
  order?: number;
}
export interface TaskFilters {
  projectId?: string;
  boardId?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
}
export class TasksService {
  /**
   * Create a new task
   */
  async createTask(data: CreateTaskData): Promise<any> {
    try {
      const headers = await getAuthHeaders();
      const url = buildApiUrl(API_ENDPOINTS.tasks.create);
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        console.error('[TasksService] Create task failed:', result);
        throw new Error(result.message || `Failed to create task: ${response.status}`);
      }
      return result.data;
    } catch (error) {
      console.error('[TasksService] Error creating task:', error);
      throw error;
    }
  }
  /**
   * Get all tasks with optional filters
   */
  async getTasks(filters?: TaskFilters): Promise<any[]> {
    try {
      const headers = await getAuthHeaders();
      let url = buildApiUrl(API_ENDPOINTS.tasks.list);
      // Add query parameters
      const params = new URLSearchParams();
      if (filters?.projectId) params.append('projectId', filters.projectId);
      if (filters?.boardId) params.append('boardId', filters.boardId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      const result = await response.json();
      if (!response.ok) {
        console.error('[TasksService] Get tasks failed:', result);
        throw new Error(result.message || `Failed to get tasks: ${response.status}`);
      }
      return result.data || [];
    } catch (error) {
      console.error('[TasksService] Error getting tasks:', error);
      throw error;
    }
  }
  /**
   * Get a single task by ID
   */
  async getTaskById(taskId: string): Promise<any> {
    try {
      const headers = await getAuthHeaders();
      const url = buildApiUrl(API_ENDPOINTS.tasks.update(taskId));
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      const result = await response.json();
      if (!response.ok) {
        console.error('[TasksService] Get task failed:', result);
        throw new Error(result.message || `Failed to get task: ${response.status}`);
      }
      return result.data;
    } catch (error) {
      console.error('[TasksService] Error getting task:', error);
      throw error;
    }
  }
  /**
   * Update a task
   */
  async updateTask(taskId: string, data: UpdateTaskData): Promise<any> {
    try {
      const headers = await getAuthHeaders();
      const url = buildApiUrl(API_ENDPOINTS.tasks.update(taskId));
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        console.error('[TasksService] Update task failed:', result);
        throw new Error(result.message || `Failed to update task: ${response.status}`);
      }
      return result.data;
    } catch (error) {
      console.error('[TasksService] Error updating task:', error);
      throw error;
    }
  }
  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      const url = buildApiUrl(API_ENDPOINTS.tasks.update(taskId));
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        const result = await response.json();
        console.error('[TasksService] Delete task failed:', result);
        throw new Error(result.message || `Failed to delete task: ${response.status}`);
      }
    } catch (error) {
      console.error('[TasksService] Error deleting task:', error);
      throw error;
    }
  }
}
export const tasksService = new TasksService();
