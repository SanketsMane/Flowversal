/**
 * TypeScript Types and Interfaces
 * Centralized type definitions for the backend
 */

// ============================================================================
// User & Authentication Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    role?: string;
    avatar_url?: string;
    created_at?: string;
    updated_at?: string;
  };
}

export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export interface AuthResult {
  user?: User;
  error?: string;
  status?: number;
  code?: string;
  message?: string;
}

// ============================================================================
// Subscription Types
// ============================================================================

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete';
export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionUsage {
  workflows: number;
  executions: number;
  storage: number;
  apiCalls: number;
  collaborators: number;
  templates: number;
  formSubmissions: number;
  webhooks: number;
}

export interface Subscription {
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  usage: SubscriptionUsage;
}

export interface BillingInfo {
  customerId: string;
  paymentMethod?: {
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
  };
  invoiceHistory: Invoice[];
}

export interface Invoice {
  id: string;
  amount: number;
  status: string;
  date: string;
  invoiceUrl: string;
}

// ============================================================================
// Workflow Types
// ============================================================================

export interface Workflow {
  id: string;
  userId: string;
  name: string;
  description: string;
  data: any;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowMetadata {
  workflowId: string;
  name: string;
  description: string;
  userId: string;
  tags: string[];
}

// ============================================================================
// Project, Board, Task Types
// ============================================================================

export interface Project {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  configuration: any;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  projectId: string;
  configuration: any;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string | null;
  dueDate: string | null;
  tags: string[];
  boardId: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
  details?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  message?: string;
  details?: string;
}

// ============================================================================
// Permission Types
// ============================================================================

export type PermissionAction =
  | 'project:create'
  | 'project:read'
  | 'project:update'
  | 'project:delete'
  | 'board:create'
  | 'board:read'
  | 'board:update'
  | 'board:delete'
  | 'task:create'
  | 'task:read'
  | 'task:update'
  | 'task:delete';

export const PERMISSIONS: Record<PermissionAction, UserRole[]> = {
  'project:create': [UserRole.ADMIN, UserRole.MEMBER],
  'project:read': [UserRole.ADMIN, UserRole.MEMBER, UserRole.VIEWER],
  'project:update': [UserRole.ADMIN, UserRole.MEMBER],
  'project:delete': [UserRole.ADMIN],
  
  'board:create': [UserRole.ADMIN, UserRole.MEMBER],
  'board:read': [UserRole.ADMIN, UserRole.MEMBER, UserRole.VIEWER],
  'board:update': [UserRole.ADMIN, UserRole.MEMBER],
  'board:delete': [UserRole.ADMIN],
  
  'task:create': [UserRole.ADMIN, UserRole.MEMBER],
  'task:read': [UserRole.ADMIN, UserRole.MEMBER, UserRole.VIEWER],
  'task:update': [UserRole.ADMIN, UserRole.MEMBER],
  'task:delete': [UserRole.ADMIN, UserRole.MEMBER],
};
