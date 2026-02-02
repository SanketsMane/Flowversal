/**
 * Templates Feature - Main Export
 */

// Components
export { TemplateLibrary } from './components/TemplateLibrary';
export { TemplateCard } from './components/TemplateCard';
export { TemplatePreview } from './components/TemplatePreview';

// Store
export { useTemplateStore } from './store/templateStore';

// Types
export type { WorkflowTemplate, TemplateCategory, TemplateFilterOptions } from './types/template.types';

// Utilities
export { loadFullTemplate } from './utils/templateLoader';
export { exportTemplateAsJSON, importTemplateFromJSON } from './utils/templateImportExport';

// Metadata (lightweight - NO workflowData)
export { TEMPLATE_METADATA } from './data/templateMetadata';

// NOTE: WORKFLOW_TEMPLATES is NOT exported to prevent loading massive data
// Use loadFullTemplate() utility to lazy-load templates when needed