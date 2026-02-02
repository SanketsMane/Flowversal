export interface CreateWorkflowData {
  name: string;
  description: string;
  userId: string;
  userName: string;
  triggers: any[];
  containers: any[];
  formFields: any[];
  triggerLogic?: any[];
  status?: 'draft' | 'published' | 'archived';
  isPublic?: boolean;
  category?: string;
  tags?: string[];
  icon?: string;
  coverImage?: string;
}

export interface UpdateWorkflowData {
  name?: string;
  description?: string;
  triggers?: any[];
  containers?: any[];
  formFields?: any[];
  triggerLogic?: any[];
  status?: 'draft' | 'published' | 'archived';
  isPublic?: boolean;
  category?: string;
  tags?: string[];
  icon?: string;
  coverImage?: string;
}

export interface WorkflowFilters {
  userId?: string;
  status?: 'draft' | 'published' | 'archived';
  isPublic?: boolean;
  category?: string;
  tags?: string[];
  search?: string;
}

export interface WorkflowListOptions {
  page: number;
  limit: number;
  filters: WorkflowFilters;
}

export interface WorkflowListResult {
  workflows: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ImportWorkflowOptions {
  preserveIds?: boolean;
  mapIntegrations?: Record<string, string>;
}

export interface WorkflowValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
