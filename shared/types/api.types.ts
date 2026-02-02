/**
 * Shared API Types
 * 
 * Common types and interfaces shared between frontend and backend.
 * This ensures type safety and consistency across the application.
 */

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard API Response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
  code?: string;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Standard Error Response
 */
export interface ApiError {
  error: string;
  message: string;
  details?: any;
  code?: string;
  statusCode?: number;
}

/**
 * Validation Error
 */
export interface ValidationError extends ApiError {
  error: 'Validation Error';
  validation?: Array<{
    field: string;
    message: string;
  }>;
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

/**
 * User Information
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Auth Session
 */
export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  user: User;
  expiresAt?: number;
}

// ============================================================================
// PROJECT TYPES
// ============================================================================

/**
 * Project
 */
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

/**
 * Board
 */
export interface Board {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

/**
 * Task
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  boardId: string;
  projectId: string;
  assignedTo?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// ============================================================================
// WORKFLOW TYPES
// ============================================================================

/**
 * Workflow Status
 */
export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived';

/**
 * Workflow Execution Status
 */
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'stopped';

/**
 * Workflow
 */
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  nodes: any[];
  edges: any[];
  triggers: any[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

/**
 * Workflow Execution
 */
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
  };
  progress?: number;
  currentStep?: string;
  stepsExecuted?: number;
  totalSteps?: number;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * Create Project Request
 */
export interface CreateProjectRequest {
  name: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  configuration?: Record<string, any>;
}

/**
 * Update Project Request
 */
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  configuration?: Record<string, any>;
}

/**
 * Create Board Request
 */
export interface CreateBoardRequest {
  name: string;
  description?: string;
  projectId: string;
  order?: number;
}

/**
 * Create Task Request
 */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'done' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  boardId: string;
  projectId: string;
  assignedTo?: string;
  tags?: string[];
}

// All types are already exported above with their declarations

