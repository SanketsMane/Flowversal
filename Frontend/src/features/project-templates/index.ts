/**
 * Project Templates Feature
 * Export all public APIs
 */

// Components
export { ProjectTemplateGallery } from './components/ProjectTemplateGallery';
export { ProjectTemplateCard } from './components/ProjectTemplateCard';
export { ConfigurationWizard } from './components/ConfigurationWizard';
export { TemplatePreview } from './components/TemplatePreview';

// Templates
export {
  PROJECT_TEMPLATES,
  getTemplateById,
  getTemplatesByCategory,
  getFeaturedTemplates,
  searchTemplates,
  getTemplatesByDifficulty,
  getPopularTemplates,
  CATEGORY_INFO,
} from './templates';

// Utils
export {
  createProjectFromTemplate,
  getTasksForBoard,
  validateApiKeys,
  exportProjectAsTemplate,
  calculateSetupTime,
  getTemplateStats,
} from './utils/projectTemplateManager';

// Types
export type {
  ProjectTemplate,
  ProjectTemplateCategory,
  TaskTemplate,
  BoardTemplate,
  ApiKeyConfig,
  ProjectTemplateConfig,
  TemplateConfigurationData,
  ProjectTemplateFilterOptions,
} from './types/projectTemplate.types';
