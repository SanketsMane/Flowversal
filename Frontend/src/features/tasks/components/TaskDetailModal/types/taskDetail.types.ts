export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Checklist {
  id: string;
  name: string;
  items: ChecklistItem[];
  isEditingName?: boolean;
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: Date;
}

export interface Workflow {
  id: string;
  workflowId: string;
  name: string;
  category: string;
  description: string;
}

export interface Member {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'file' | 'link';
  url: string;
  size?: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface TaskDetailModalProps {
  task: {
    id: string;
    taskId?: string;
    name: string;
    status: string;
    description?: string;
    assignee?: string;
    avatar?: string;
    dueDate?: Date | string;
    startDate?: Date | string;
    recurring?: string;
    reminder?: string;
    selectedDays?: string[];
    boardName?: string;
    folderName?: string;
    projectId?: string;
    boardId?: string;
    priority?: string;
    labels?: Array<{ id?: string; name: string; color?: string }> | string[];
    members?: Array<{ id: string; name: string; avatar?: string; email?: string }>;
    assignedTo?: Array<{ id: string; name: string; avatar?: string; email?: string }>;
    hasWorkflow?: boolean;
    attachedWorkflows?: any[];
    checklists?: any[];
    comments?: any[];
    attachments?: any[];
  };
  onClose: () => void;
  onUpdate: (taskId: string, updates: any) => void;
  onDelete: (taskId: string) => void;
  onOpenWorkflow?: (workflowId: string) => void;
  preAttachedWorkflow?: any;
}

