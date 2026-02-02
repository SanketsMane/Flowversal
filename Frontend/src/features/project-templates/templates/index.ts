/**
 * Project Templates Registry
 * Central registry of all available project templates
 */

import { ProjectTemplate, ProjectTemplateCategory } from '../types/projectTemplate.types';
import { ecommerceAutomationTemplate } from './ecommerce-automation';
import { marketingCampaignsTemplate } from './marketing-campaigns';
import { salesPipelineTemplate } from './sales-pipeline';
import { customerSupportTemplate } from './customer-support';
import { hrOnboardingTemplate } from './hr-onboarding';
import { contentProductionTemplate } from './content-production';
import { ShoppingCart, Megaphone, Briefcase, Headphones, Users, PenTool, Code } from 'lucide-react';

/**
 * All available project templates
 */
export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  ecommerceAutomationTemplate,
  marketingCampaignsTemplate,
  salesPipelineTemplate,
  customerSupportTemplate,
  hrOnboardingTemplate,
  contentProductionTemplate,
];

/**
 * Get template by ID
 */
export const getTemplateById = (id: string): ProjectTemplate | undefined => {
  return PROJECT_TEMPLATES.find(template => template.id === id);
};

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category: ProjectTemplateCategory): ProjectTemplate[] => {
  if (category === 'all') {
    return PROJECT_TEMPLATES;
  }
  return PROJECT_TEMPLATES.filter(template => template.category === category);
};

/**
 * Get featured templates
 */
export const getFeaturedTemplates = (): ProjectTemplate[] => {
  return PROJECT_TEMPLATES.filter(template => template.featured === true);
};

/**
 * Search templates
 */
export const searchTemplates = (query: string): ProjectTemplate[] => {
  const lowerQuery = query.toLowerCase();
  return PROJECT_TEMPLATES.filter(template => 
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    template.industry.some(ind => ind.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Get templates by difficulty
 */
export const getTemplatesByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced'): ProjectTemplate[] => {
  return PROJECT_TEMPLATES.filter(template => template.difficulty === difficulty);
};

/**
 * Get popular templates
 */
export const getPopularTemplates = (limit: number = 3): ProjectTemplate[] => {
  return [...PROJECT_TEMPLATES]
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, limit);
};

/**
 * Category metadata with icon names
 */
export const CATEGORY_INFO: Record<ProjectTemplateCategory, { label: string; description: string; iconName: string }> = {
  all: {
    label: 'All Templates',
    description: 'Browse all available project templates',
    iconName: 'Folder',
  },
  ecommerce: {
    label: 'E-commerce',
    description: 'Online store and retail automation',
    iconName: 'ShoppingCart',
  },
  marketing: {
    label: 'Marketing',
    description: 'Campaign and social media automation',
    iconName: 'Megaphone',
  },
  sales: {
    label: 'Sales',
    description: 'CRM and pipeline management',
    iconName: 'Briefcase',
  },
  'customer-support': {
    label: 'Customer Support',
    description: 'Ticket management and service automation',
    iconName: 'Headphones',
  },
  hr: {
    label: 'Human Resources',
    description: 'Employee onboarding and HR workflows',
    iconName: 'Users',
  },
  content: {
    label: 'Content Production',
    description: 'Content creation and publishing',
    iconName: 'PenTool',
  },
  development: {
    label: 'Development',
    description: 'Developer workflows and CI/CD',
    iconName: 'Code',
  },
  finance: {
    label: 'Finance',
    description: 'Accounting and financial automation',
    iconName: 'DollarSign',
  },
};
