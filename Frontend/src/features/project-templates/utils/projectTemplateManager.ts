/**
 * Project Template Manager
 * Handles importing, exporting, and instantiating project templates
 */

import { ProjectTemplate, TemplateConfigurationData, TaskTemplate } from '../types/projectTemplate.types';
import { Project, Board, Task } from '../../../stores/projectStore';

/**
 * Convert relative date to actual date
 * e.g., "+2d" -> 2 days from now
 */
const parseRelativeDate = (relativeDate?: string): string | undefined => {
  if (!relativeDate || !relativeDate.startsWith('+')) {
    return relativeDate;
  }
  
  const match = relativeDate.match(/\+(\d+)([dhwm])/);
  if (!match) return undefined;
  
  const [, amount, unit] = match;
  const amountNum = parseInt(amount, 10);
  const now = new Date();
  
  switch (unit) {
    case 'd': // days
      now.setDate(now.getDate() + amountNum);
      break;
    case 'h': // hours
      now.setHours(now.getHours() + amountNum);
      break;
    case 'w': // weeks
      now.setDate(now.getDate() + amountNum * 7);
      break;
    case 'm': // months
      now.setMonth(now.getMonth() + amountNum);
      break;
  }
  
  return now.toISOString();
};

/**
 * Replace template variables in text
 */
const replaceVariables = (text: string, config: TemplateConfigurationData): string => {
  let result = text;
  
  // Replace company name
  if (config.configuration.companyName) {
    result = result.replace(/\{\{companyName\}\}/g, config.configuration.companyName);
  }
  
  // Replace email
  if (config.configuration.email) {
    result = result.replace(/\{\{email\}\}/g, config.configuration.email);
  }
  
  // Replace custom fields
  Object.entries(config.configuration.customFields || {}).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  });
  
  return result;
};

/**
 * Convert task template to actual task
 */
const convertTaskTemplate = (
  taskTemplate: TaskTemplate,
  config: TemplateConfigurationData,
  boardId: string,
  projectId: string,
  currentUserId?: string
): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> => {
  const now = new Date();
  const dueDate = parseRelativeDate(taskTemplate.dueDate);
  
  return {
    taskId: taskTemplate.id,
    name: replaceVariables(taskTemplate.title, config),
    description: replaceVariables(taskTemplate.description, config),
    status: taskTemplate.status === 'todo' ? 'To do' : 
            taskTemplate.status === 'in-progress' ? 'In Progress' :
            taskTemplate.status === 'review' ? 'Review' :
            taskTemplate.status === 'blocked' ? 'Blocked' : 'Done',
    priority: taskTemplate.priority.charAt(0).toUpperCase() + taskTemplate.priority.slice(1),
    assignedTo: taskTemplate.assignee ? [{ 
      id: taskTemplate.assignee, 
      name: 'Assigned User', 
      avatar: 'AU' 
    }] : [],
    labels: taskTemplate.tags.map((tag, idx) => ({
      id: `label-${idx}`,
      name: tag,
      color: 'bg-blue-500',
    })),
    dueDate: dueDate ? new Date(dueDate) : undefined,
    hasWorkflow: !!taskTemplate.workflowId,
    boardId,
    projectId,
    createdBy: { id: currentUserId || '1', name: 'Current User', avatar: 'CU' },
  };
};

/**
 * Create a project from template
 */
export const createProjectFromTemplate = (
  template: ProjectTemplate,
  config: TemplateConfigurationData,
  currentUserId?: string
): Omit<Project, 'id' | 'createdAt'> => {
  const baseName = replaceVariables(template.name, config);
  // Add timestamp to ensure uniqueness
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const uniqueName = `${baseName} (${timestamp})`;

  return {
    name: uniqueName,
    description: replaceVariables(template.description, config),
    icon: template.icon || 'Folder',
    iconColor: '#00C6FF',
  };
};

/**
 * Get tasks for a board from template
 */
export const getTasksForBoard = (
  template: ProjectTemplate,
  boardTemplateId: string,
  boardId: string,
  projectId: string,
  config: TemplateConfigurationData,
  currentUserId?: string
): Array<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>> => {
  const boardTemplate = template.boards.find(b => b.id === boardTemplateId);
  if (!boardTemplate) return [];
  
  return boardTemplate.tasks.map(taskTemplate => 
    convertTaskTemplate(taskTemplate, config, boardId, projectId, currentUserId)
  );
};

/**
 * Validate API keys
 */
export const validateApiKeys = async (
  template: ProjectTemplate,
  apiKeys: Record<string, string>
): Promise<{ valid: boolean; errors: string[] }> => {
  const errors: string[] = [];
  
  // Check required API keys
  template.requiredApiKeys.forEach(keyConfig => {
    if (keyConfig.required && !apiKeys[keyConfig.key]) {
      errors.push(`${keyConfig.label} is required`);
    }
    
    // Basic validation - check if key is not empty
    if (apiKeys[keyConfig.key] && apiKeys[keyConfig.key].trim() === '') {
      errors.push(`${keyConfig.label} cannot be empty`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Export project as template
 */
export const exportProjectAsTemplate = (
  project: Project,
  metadata: {
    name: string;
    description: string;
    category: string;
    industry: string[];
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }
): ProjectTemplate => {
  const now = new Date().toISOString();
  
  return {
    id: `custom-${Date.now()}`,
    name: metadata.name,
    description: metadata.description,
    industry: metadata.industry,
    category: metadata.category as any,
    icon: project.icon || '📁',
    difficulty: metadata.difficulty,
    estimatedSetupTime: '15 minutes',
    boards: project.boards.map(board => ({
      id: board.id,
      name: board.name,
      description: board.description,
      icon: board.icon,
      color: board.color,
      tasks: board.tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        tags: task.tags,
        assignee: task.assignee,
        dueDate: task.dueDate,
      })),
    })),
    workflows: [],
    requiredIntegrations: [],
    requiredApiKeys: [],
    configurationSteps: [],
    tags: metadata.tags,
    useCases: [],
    benefits: [],
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Calculate estimated setup time based on template complexity
 */
export const calculateSetupTime = (template: ProjectTemplate): number => {
  const baseTime = 5; // minutes
  const tasksCount = template.boards.reduce((sum, board) => sum + board.tasks.length, 0);
  const apiKeysCount = template.requiredApiKeys.filter(k => k.required).length;
  
  return baseTime + (tasksCount * 0.5) + (apiKeysCount * 2);
};

/**
 * Get template statistics
 */
export const getTemplateStats = (template: ProjectTemplate) => {
  const totalBoards = template.boards.length;
  const totalTasks = template.boards.reduce((sum, board) => sum + board.tasks.length, 0);
  const totalWorkflows = template.workflows.length;
  const requiredApiKeys = template.requiredApiKeys.filter(k => k.required).length;
  const optionalApiKeys = template.requiredApiKeys.filter(k => !k.required).length;
  
  return {
    totalBoards,
    totalTasks,
    totalWorkflows,
    requiredApiKeys,
    optionalApiKeys,
    estimatedTime: calculateSetupTime(template),
  };
};
