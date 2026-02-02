/**
 * Project Template Types
 * Defines structure for complete project templates with boards, tasks, and workflows
 */

import { WorkflowTemplate } from '../../templates/types/template.types';

export interface ApiKeyConfig {
  key: string;
  label: string;
  description: string;
  placeholder?: string;
  required: boolean;
  validationUrl?: string; // Optional URL to validate the API key
}

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'blocked' | 'done';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  assignee?: string;
  dueDate?: string; // Relative date like "+2d" for 2 days from now
  workflowId?: string; // Reference to attached workflow template
}

export interface BoardTemplate {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  tasks: TaskTemplate[];
}

export interface ProjectTemplateConfig {
  companyName?: string;
  email?: string;
  slackWebhook?: string;
  customFields?: Record<string, string>;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  industry: string[];
  category: ProjectTemplateCategory;
  icon: string; // Lucide icon name or emoji
  coverImage?: string;
  
  // Difficulty and time
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedSetupTime: string; // e.g., "5 minutes", "15 minutes"
  
  // Template structure
  boards: BoardTemplate[];
  workflows: WorkflowTemplate[]; // Bundled workflow templates
  
  // Configuration requirements
  requiredIntegrations: string[]; // e.g., ['stripe', 'sendgrid', 'slack']
  requiredApiKeys: ApiKeyConfig[];
  configurationSteps: string[]; // Wizard steps description
  
  // Metadata
  tags: string[];
  useCases: string[];
  benefits: string[];
  author?: string;
  featured?: boolean;
  usageCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectTemplateCategory =
  | 'ecommerce'
  | 'marketing'
  | 'sales'
  | 'customer-support'
  | 'hr'
  | 'content'
  | 'development'
  | 'finance'
  | 'all';

export interface ProjectTemplateFilterOptions {
  category?: ProjectTemplateCategory;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  searchQuery?: string;
  industry?: string;
  tags?: string[];
}

export interface TemplateConfigurationData {
  templateId: string;
  companyName?: string;
  email?: string;
  apiKeys: Record<string, string>; // key -> value
  configuration: ProjectTemplateConfig;
  customFields?: Record<string, any>;
}
