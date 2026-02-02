export interface CreateWorkflowBody {
  name: string;
  description: string;
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

export interface UpdateWorkflowBody {
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

export interface ListWorkflowsQuery {
  page?: string;
  limit?: string;
  status?: string;
  isPublic?: string;
  category?: string;
  tags?: string;
  search?: string;
}

export interface TestWorkflowBody {
  mockContext?: Record<string, any>;
}

export interface ImportWorkflowBody {
  workflowData: any;
  options?: {
    preserveIds?: boolean;
    mapIntegrations?: Record<string, string>;
  };
}
