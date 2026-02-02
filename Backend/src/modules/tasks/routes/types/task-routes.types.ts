export interface CreateTaskBody {
  name: string;
  description?: string;
  assignedTo?: Array<{ id: string; name: string; avatar?: string; email?: string }>;
  status?: string;
  priority?: string;
  labels?: string[] | Array<{ id?: string; name: string; color?: string }>;
  dueDate?: string;
  startDate?: string;
  recurring?: string;
  reminder?: string;
  selectedDays?: string[];
  hasWorkflow?: boolean;
  boardId: string;
  projectId: string;
  createdBy?: { id: string; name: string; avatar?: string };
  order?: number;
  checklists?: any[];
  comments?: any[];
  attachments?: any[];
  workflows?: any[];
}

export interface UpdateTaskBody {
  name?: string;
  description?: string;
  assignedTo?: Array<{ id: string; name: string; avatar?: string; email?: string }>;
  status?: string;
  priority?: string;
  labels?: string[] | Array<{ id?: string; name: string; color?: string }>;
  dueDate?: string;
  startDate?: string;
  recurring?: string;
  reminder?: string;
  selectedDays?: string[];
  hasWorkflow?: boolean;
  boardId?: string;
  projectId?: string;
  order?: number;
  checklists?: any[];
  comments?: any[];
  attachments?: any[];
  workflows?: any[];
}

export interface ListTasksQuery {
  projectId?: string;
  boardId?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
}

export interface AttachWorkflowBody {
  workflowId: string;
  config?: any;
}

export interface ExecuteWorkflowBody {
  input?: Record<string, any>;
}
