/**
 * Template Loader - Lazy Load Full Templates
 * Only loads heavy workflowData when needed (on installation)
 */

import { WorkflowTemplate } from '../types/template.types';

/**
 * Lazy load full template with workflowData
 * This dynamically imports the template data only when needed
 */
export const loadFullTemplate = async (templateId: string): Promise<WorkflowTemplate | null> => {
  console.log('📦 Lazy loading full template:', templateId);
  
  try {
    // Dynamically import the full template library only when needed
    const { WORKFLOW_TEMPLATES } = await import('../data/templateLibrary');
    
    const template = WORKFLOW_TEMPLATES.find(t => t.id === templateId);
    
    if (!template) {
      console.error('❌ Template not found:', templateId);
      return null;
    }
    
    console.log('✅ Full template loaded successfully');
    return template;
  } catch (error) {
    console.error('❌ Error loading template:', error);
    return null;
  }
};

/**
 * Check if a template has workflowData loaded
 */
export const hasWorkflowData = (template: WorkflowTemplate): boolean => {
  return template.workflowData !== undefined && template.workflowData !== null;
};
