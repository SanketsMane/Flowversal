/**
 * Workflow Template Types
 * Defines structure for reusable workflow templates
 */

import { Trigger, Container, FormField, TriggerLogic } from '../../workflow-builder/types';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  icon: string; // Lucide icon name
  coverImage?: string; // URL to preview image
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string; // e.g., "5 minutes", "30 minutes"
  useCases: string[]; // List of use cases
  
  // Workflow structure
  workflowData: {
    workflowName: string;
    workflowDescription: string;
    triggers: Trigger[];
    triggerLogic: TriggerLogic[];
    containers: Container[];
    formFields: FormField[];
  };
  
  // Metadata
  author?: string;
  featured?: boolean;
  popularity?: number; // For sorting
  createdAt: string;
  updatedAt: string;
}

export type TemplateCategory = 
  | 'automation'
  | 'data-processing'
  | 'communication'
  | 'content-generation'
  | 'integration'
  | 'customer-service'
  | 'productivity'
  | 'analytics'
  | 'all';

export interface TemplateFilterOptions {
  category?: TemplateCategory;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  searchQuery?: string;
  tags?: string[];
}
