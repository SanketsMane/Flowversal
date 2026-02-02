/**
 * Template Metadata (Lightweight)
 * Contains only template metadata WITHOUT workflowData for fast browsing
 */

import { WorkflowTemplate } from '../types/template.types';

type TemplateMetadata = Omit<WorkflowTemplate, 'workflowData'> & { 
  workflowData?: never; // Explicitly exclude workflowData
};

/**
 * Lightweight template metadata for browsing (NO workflowData)
 * This loads instantly without freezing the browser
 */
export const TEMPLATE_METADATA: TemplateMetadata[] = [
  {
    id: 'email-welcome-automation',
    name: 'Welcome Email Automation',
    description: 'Automatically send personalized welcome emails to new users with custom branding and follow-up sequences.',
    category: 'automation',
    icon: 'Mail',
    tags: ['email', 'onboarding', 'automation', 'customer-engagement'],
    difficulty: 'beginner',
    estimatedTime: '5 minutes',
    useCases: [
      'Onboard new customers with personalized emails',
      'Send welcome sequences with product information',
      'Track email engagement and responses'
    ],
    featured: true,
    popularity: 95,
    author: 'Flowversal',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: 'data-processing-pipeline',
    name: 'CSV Data Processing Pipeline',
    description: 'Import, validate, transform, and export CSV data with error handling and data quality checks.',
    category: 'data-processing',
    icon: 'Database',
    tags: ['csv', 'data', 'etl', 'validation'],
    difficulty: 'intermediate',
    estimatedTime: '15 minutes',
    useCases: [
      'Clean and validate customer data imports',
      'Transform data between different formats',
      'Detect and handle data quality issues'
    ],
    featured: true,
    popularity: 88,
    author: 'Flowversal',
    createdAt: '2024-01-16',
    updatedAt: '2024-01-16'
  },
  {
    id: 'slack-notification-system',
    name: 'Slack Alert System',
    description: 'Send real-time notifications to Slack channels with custom formatting, mentions, and priority levels.',
    category: 'communication',
    icon: 'MessageSquare',
    tags: ['slack', 'notifications', 'alerts', 'team-communication'],
    difficulty: 'beginner',
    estimatedTime: '5 minutes',
    useCases: [
      'Alert teams about critical system events',
      'Send daily/weekly reports to channels',
      'Notify stakeholders of important updates'
    ],
    featured: true,
    popularity: 92,
    author: 'Flowversal',
    createdAt: '2024-01-17',
    updatedAt: '2024-01-17'
  },
  {
    id: 'blog-post-generator',
    name: 'AI Blog Post Generator',
    description: 'Generate SEO-optimized blog posts with outlines, content, and meta descriptions using AI.',
    category: 'content-generation',
    icon: 'FileText',
    tags: ['ai', 'content', 'blog', 'seo', 'writing'],
    difficulty: 'intermediate',
    estimatedTime: '10 minutes',
    useCases: [
      'Generate blog posts from topic ideas',
      'Create SEO-optimized content',
      'Produce content briefs and outlines'
    ],
    featured: true,
    popularity: 90,
    author: 'Flowversal',
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18'
  },
  {
    id: 'support-ticket-router',
    name: 'Smart Support Ticket Router',
    description: 'Automatically categorize and route support tickets to the right team based on content analysis.',
    category: 'customer-service',
    icon: 'Headphones',
    tags: ['support', 'automation', 'ai', 'ticket-management'],
    difficulty: 'intermediate',
    estimatedTime: '15 minutes',
    useCases: [
      'Automatically categorize incoming support tickets',
      'Route tickets to appropriate teams',
      'Prioritize urgent customer issues'
    ],
    popularity: 85,
    author: 'Flowversal',
    createdAt: '2024-01-19',
    updatedAt: '2024-01-19'
  },
  {
    id: 'lead-scoring-automation',
    name: 'AI Lead Scoring & Qualification',
    description: 'Automatically score and qualify leads based on behavior, demographics, and engagement data.',
    category: 'automation',
    icon: 'TrendingUp',
    tags: ['sales', 'leads', 'crm', 'automation', 'ai'],
    difficulty: 'advanced',
    estimatedTime: '20 minutes',
    useCases: [
      'Score leads based on engagement',
      'Qualify leads automatically',
      'Prioritize high-value prospects'
    ],
    popularity: 82,
    author: 'Flowversal',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20'
  },
  {
    id: 'social-media-scheduler',
    name: 'Multi-Platform Content Scheduler',
    description: 'Schedule and publish content across Twitter, LinkedIn, and Facebook with optimal timing.',
    category: 'productivity',
    icon: 'Share2',
    tags: ['social-media', 'content', 'scheduling', 'marketing'],
    difficulty: 'intermediate',
    estimatedTime: '10 minutes',
    useCases: [
      'Schedule posts across multiple platforms',
      'Optimize posting times for engagement',
      'Repurpose content for different channels'
    ],
    popularity: 78,
    author: 'Flowversal',
    createdAt: '2024-01-21',
    updatedAt: '2024-01-21'
  },
  {
    id: 'invoice-processor',
    name: 'Automated Invoice Processing',
    description: 'Extract data from invoices, validate information, and sync to accounting systems automatically.',
    category: 'data-processing',
    icon: 'Receipt',
    tags: ['invoices', 'ocr', 'accounting', 'automation'],
    difficulty: 'advanced',
    estimatedTime: '25 minutes',
    useCases: [
      'Extract data from invoice PDFs',
      'Validate invoice information',
      'Auto-sync to accounting software'
    ],
    popularity: 75,
    author: 'Flowversal',
    createdAt: '2024-01-22',
    updatedAt: '2024-01-22'
  },
  {
    id: 'smart-meeting-scheduler',
    name: 'AI Meeting Scheduler',
    description: 'Automatically find optimal meeting times, send invites, and manage calendar conflicts.',
    category: 'productivity',
    icon: 'Calendar',
    tags: ['calendar', 'meetings', 'scheduling', 'productivity'],
    difficulty: 'beginner',
    estimatedTime: '10 minutes',
    useCases: [
      'Schedule meetings across time zones',
      'Find optimal meeting times',
      'Send calendar invites automatically'
    ],
    popularity: 80,
    author: 'Flowversal',
    createdAt: '2024-01-23',
    updatedAt: '2024-01-23'
  },
  {
    id: 'customer-feedback-analyzer',
    name: 'Customer Feedback Analyzer',
    description: 'Analyze customer feedback sentiment, extract insights, and categorize responses automatically.',
    category: 'analytics',
    icon: 'BarChart3',
    tags: ['sentiment', 'analytics', 'feedback', 'ai', 'insights'],
    difficulty: 'intermediate',
    estimatedTime: '15 minutes',
    useCases: [
      'Analyze customer survey responses',
      'Track sentiment trends over time',
      'Identify common pain points'
    ],
    popularity: 77,
    author: 'Flowversal',
    createdAt: '2024-01-24',
    updatedAt: '2024-01-24'
  },
  {
    id: 'image-optimization-pipeline',
    name: 'Automated Image Optimization',
    description: 'Resize, compress, and optimize images for web delivery with automatic format conversion.',
    category: 'data-processing',
    icon: 'Image',
    tags: ['images', 'optimization', 'cdn', 'web-performance'],
    difficulty: 'beginner',
    estimatedTime: '5 minutes',
    useCases: [
      'Optimize images for faster loading',
      'Generate multiple image sizes',
      'Convert images to modern formats'
    ],
    popularity: 72,
    author: 'Flowversal',
    createdAt: '2024-01-25',
    updatedAt: '2024-01-25'
  },
  {
    id: 'ecommerce-order-fulfillment',
    name: 'E-commerce Order Fulfillment',
    description: 'Automate order processing, inventory updates, and shipping notifications for e-commerce businesses.',
    category: 'automation',
    icon: 'ShoppingCart',
    tags: ['ecommerce', 'orders', 'fulfillment', 'automation'],
    difficulty: 'intermediate',
    estimatedTime: '15 minutes',
    useCases: [
      'Process orders automatically',
      'Update inventory levels',
      'Send shipping notifications'
    ],
    popularity: 76,
    author: 'Flowversal',
    createdAt: '2024-01-26',
    updatedAt: '2024-01-26'
  },
  {
    id: 'rest-api-integration',
    name: 'REST API Integration Starter',
    description: 'Connect to any REST API with authentication, error handling, and data transformation.',
    category: 'integration',
    icon: 'Plug',
    tags: ['api', 'integration', 'rest', 'webhooks'],
    difficulty: 'beginner',
    estimatedTime: '10 minutes',
    useCases: [
      'Connect to third-party APIs',
      'Build custom integrations',
      'Sync data between systems'
    ],
    popularity: 83,
    author: 'Flowversal',
    createdAt: '2024-01-27',
    updatedAt: '2024-01-27'
  },
  {
    id: 'form-submission-handler',
    name: 'Smart Form Handler',
    description: 'Process form submissions with validation, email notifications, and CRM integration.',
    category: 'automation',
    icon: 'FormInput',
    tags: ['forms', 'validation', 'crm', 'email'],
    difficulty: 'beginner',
    estimatedTime: '10 minutes',
    useCases: [
      'Process contact form submissions',
      'Validate and clean form data',
      'Send notifications and store data'
    ],
    popularity: 88,
    author: 'Flowversal',
    createdAt: '2024-01-28',
    updatedAt: '2024-01-28'
  },
  {
    id: 'daily-report-generator',
    name: 'Automated Daily Report',
    description: 'Generate and send daily reports with key metrics, charts, and insights via email.',
    category: 'analytics',
    icon: 'FileBarChart',
    tags: ['reports', 'analytics', 'email', 'automation', 'dashboards'],
    difficulty: 'intermediate',
    estimatedTime: '20 minutes',
    useCases: [
      'Send daily performance reports',
      'Track KPIs automatically',
      'Deliver insights to stakeholders'
    ],
    popularity: 81,
    author: 'Flowversal',
    createdAt: '2024-01-29',
    updatedAt: '2024-01-29'
  }
];