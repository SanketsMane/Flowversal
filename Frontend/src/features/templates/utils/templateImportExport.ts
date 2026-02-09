/**
 * Template Import/Export Utilities
 * Handle importing and exporting workflow templates as JSON
 */
import { WorkflowTemplate } from '../types/template.types';
/**
 * Export a workflow template as JSON file
 */
export const exportTemplateAsJSON = (template: WorkflowTemplate) => {
  try {
    const jsonString = JSON.stringify(template, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.id || 'workflow-template'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('❌ Error exporting template:', error);
    return false;
  }
};
/**
 * Import a workflow template from JSON file
 */
export const importTemplateFromJSON = (file: File): Promise<WorkflowTemplate> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const data = JSON.parse(jsonString);
        // Check if this is a full template format or an exported workflow
        let template: WorkflowTemplate;
        if (data.workflowData) {
          // This is a full template format
          template = data as WorkflowTemplate;
          // Basic validation
          if (!template.name) {
            throw new Error('Invalid template: missing name');
          }
        } else if (data.containers && data.version) {
          // This is an exported workflow format - convert to template format
          template = {
            id: `imported-${Date.now()}`,
            name: data.name || 'Imported Workflow',
            description: data.description || 'Imported from exported workflow',
            category: 'custom',
            icon: 'FileText',
            tags: ['imported', 'custom'],
            difficulty: 'intermediate',
            estimatedTime: '10 minutes',
            useCases: ['Custom workflow'],
            featured: false,
            popularity: 0,
            author: 'Import',
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            workflowData: {
              workflowName: data.name || 'Imported Workflow',
              workflowDescription: data.description || '',
              triggers: data.triggers || [],
              triggerLogic: data.triggerLogic || [],
              containers: data.containers || [],
              formFields: data.formFields || []
            }
          };
        } else {
          // Invalid format
          throw new Error('Invalid file format: must be either a template or exported workflow');
        }
        resolve(template);
      } catch (error) {
        console.error('❌ Error parsing template JSON:', error);
        reject(error);
      }
    };
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    reader.readAsText(file);
  });
};
/**
 * Export current workflow as a template
 */
export const exportCurrentWorkflowAsTemplate = (workflowData: any, metadata: Partial<WorkflowTemplate>) => {
  const template: WorkflowTemplate = {
    id: metadata.id || `custom-${Date.now()}`,
    name: metadata.name || 'Custom Template',
    description: metadata.description || 'Custom workflow template',
    category: metadata.category || 'custom',
    icon: metadata.icon || 'FileText',
    tags: metadata.tags || ['custom'],
    difficulty: metadata.difficulty || 'intermediate',
    estimatedTime: metadata.estimatedTime || '10 minutes',
    useCases: metadata.useCases || ['Custom workflow'],
    featured: false,
    popularity: 0,
    author: metadata.author || 'Custom',
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    workflowData: workflowData
  };
  return exportTemplateAsJSON(template);
};