/**
 * Workflow Template Library
 * Pre-built workflow templates for quick start
 */

import { WorkflowTemplate } from '../types/template.types';

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  // 1. Email Automation Template
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
    updatedAt: '2024-01-15',
    workflowData: {
      workflowName: 'Welcome Email Automation',
      workflowDescription: 'Send personalized welcome emails to new users',
      triggers: [
        {
          id: 'trigger-1',
          type: 'webhook',
          label: 'Webhook Trigger',
          config: { endpoint: '/new-user', method: 'POST' },
          enabled: true
        }
      ],
      triggerLogic: [],
      containers: [
        {
          id: 'container-1',
          type: 'container',
          title: 'Step 1: Process User Data',
          subtitle: 'Extract and validate user information',
          elements: [],
          nodes: [
            {
              id: 'node-1',
              type: 'edit_fields',
              label: 'Extract User Info',
              category: 'data',
              config: {
                fields: ['email', 'name', 'signupDate']
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-2',
          type: 'container',
          title: 'Step 2: Generate Email',
          subtitle: 'Create personalized email content',
          elements: [],
          nodes: [
            {
              id: 'node-2',
              type: 'prompt_builder',
              label: 'Generate Welcome Email',
              category: 'ai',
              config: {
                systemPrompt: 'You are a friendly customer success manager.',
                userPrompt: 'Create a warm welcome email for {{name}} who just signed up. Include company overview and next steps.',
                model: 'gpt-4',
                temperature: 0.7
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-3',
          type: 'container',
          title: 'Step 3: Send Email',
          subtitle: 'Deliver email to user',
          elements: [],
          nodes: [
            {
              id: 'node-3',
              type: 'http',
              label: 'Send via Email API',
              category: 'core',
              config: {
                method: 'POST',
                url: 'https://api.sendgrid.com/v3/mail/send',
                headers: { 'Authorization': 'Bearer {{SENDGRID_API_KEY}}' }
              },
              enabled: true
            }
          ]
        }
      ],
      formFields: []
    }
  },

  // 2. Data Processing Pipeline
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
    updatedAt: '2024-01-16',
    workflowData: {
      workflowName: 'CSV Data Processing Pipeline',
      workflowDescription: 'Process and validate CSV data',
      triggers: [
        {
          id: 'trigger-1',
          type: 'manual',
          label: 'Manual Trigger',
          config: {},
          enabled: true
        }
      ],
      triggerLogic: [],
      containers: [
        {
          id: 'container-1',
          type: 'container',
          title: 'Step 1: Import Data',
          subtitle: 'Load CSV file',
          elements: [],
          nodes: [
            {
              id: 'node-1',
              type: 'http',
              label: 'Fetch CSV',
              category: 'core',
              config: {
                method: 'GET',
                url: '{{csv_url}}'
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-2',
          type: 'container',
          title: 'Step 2: Validate & Transform',
          subtitle: 'Check data quality and transform',
          elements: [],
          nodes: [
            {
              id: 'node-2',
              type: 'code',
              label: 'Validate Data',
              category: 'data',
              config: {
                language: 'javascript',
                code: '// Validate required fields\nconst valid = data.every(row => row.email && row.name);\nreturn { valid, rowCount: data.length };'
              },
              enabled: true
            },
            {
              id: 'node-3',
              type: 'if',
              label: 'Check Valid',
              category: 'flow',
              config: {
                condition: '{{valid}} === true'
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-3',
          type: 'container',
          title: 'Step 3: Export Results',
          subtitle: 'Save processed data',
          elements: [],
          nodes: [
            {
              id: 'node-4',
              type: 'http',
              label: 'Upload Processed Data',
              category: 'core',
              config: {
                method: 'POST',
                url: 'https://api.example.com/data/import'
              },
              enabled: true
            }
          ]
        }
      ],
      formFields: []
    }
  },

  // 3. Slack Notification System
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
    updatedAt: '2024-01-17',
    workflowData: {
      workflowName: 'Slack Alert System',
      workflowDescription: 'Send formatted notifications to Slack',
      triggers: [
        {
          id: 'trigger-1',
          type: 'webhook',
          label: 'Event Webhook',
          config: { endpoint: '/alert', method: 'POST' },
          enabled: true
        }
      ],
      triggerLogic: [],
      containers: [
        {
          id: 'container-1',
          type: 'container',
          title: 'Step 1: Format Message',
          subtitle: 'Create Slack message blocks',
          elements: [],
          nodes: [
            {
              id: 'node-1',
              type: 'code',
              label: 'Build Slack Blocks',
              category: 'data',
              config: {
                language: 'javascript',
                code: 'return { blocks: [{ type: "section", text: { type: "mrkdwn", text: `*Alert:* ${message}` }}]};'
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-2',
          type: 'container',
          title: 'Step 2: Send to Slack',
          subtitle: 'Post message to channel',
          elements: [],
          nodes: [
            {
              id: 'node-2',
              type: 'http',
              label: 'Post to Slack',
              category: 'core',
              config: {
                method: 'POST',
                url: 'https://slack.com/api/chat.postMessage',
                headers: { 'Authorization': 'Bearer {{SLACK_BOT_TOKEN}}' }
              },
              enabled: true
            }
          ]
        }
      ],
      formFields: []
    }
  },

  // 4. Content Generation
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
    updatedAt: '2024-01-18',
    workflowData: {
      workflowName: 'AI Blog Post Generator',
      workflowDescription: 'Generate complete blog posts with AI',
      triggers: [
        {
          id: 'trigger-1',
          type: 'manual',
          label: 'Manual Trigger',
          config: {},
          enabled: true
        }
      ],
      triggerLogic: [],
      containers: [
        {
          id: 'container-1',
          type: 'container',
          title: 'Step 1: Generate Outline',
          subtitle: 'Create blog structure',
          elements: [],
          nodes: [
            {
              id: 'node-1',
              type: 'prompt_builder',
              label: 'Create Outline',
              category: 'ai',
              config: {
                systemPrompt: 'You are an expert content strategist.',
                userPrompt: 'Create a detailed blog post outline for: {{topic}}. Include introduction, 5-7 main sections, and conclusion.',
                model: 'gpt-4',
                temperature: 0.8
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-2',
          type: 'container',
          title: 'Step 2: Write Content',
          subtitle: 'Generate full blog post',
          elements: [],
          nodes: [
            {
              id: 'node-2',
              type: 'prompt_builder',
              label: 'Write Blog Post',
              category: 'ai',
              config: {
                systemPrompt: 'You are a professional blog writer.',
                userPrompt: 'Write a complete 1500-word blog post based on this outline: {{outline}}. Make it engaging and SEO-friendly.',
                model: 'gpt-4',
                temperature: 0.7
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-3',
          type: 'container',
          title: 'Step 3: Generate Meta',
          subtitle: 'Create SEO metadata',
          elements: [],
          nodes: [
            {
              id: 'node-3',
              type: 'prompt_builder',
              label: 'Create Meta Description',
              category: 'ai',
              config: {
                systemPrompt: 'You are an SEO expert.',
                userPrompt: 'Create an engaging 155-character meta description for this blog post: {{content}}',
                model: 'gpt-3.5-turbo',
                temperature: 0.5
              },
              enabled: true
            }
          ]
        }
      ],
      formFields: []
    }
  },

  // 5. Customer Support Ticket Routing
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
    updatedAt: '2024-01-19',
    workflowData: {
      workflowName: 'Smart Support Ticket Router',
      workflowDescription: 'Route support tickets intelligently',
      triggers: [
        {
          id: 'trigger-1',
          type: 'webhook',
          label: 'New Ticket Webhook',
          config: { endpoint: '/ticket', method: 'POST' },
          enabled: true
        }
      ],
      triggerLogic: [],
      containers: [
        {
          id: 'container-1',
          type: 'container',
          title: 'Step 1: Analyze Ticket',
          subtitle: 'Categorize and assess priority',
          elements: [],
          nodes: [
            {
              id: 'node-1',
              type: 'prompt_builder',
              label: 'Categorize Ticket',
              category: 'ai',
              config: {
                systemPrompt: 'You are a support ticket classifier.',
                userPrompt: 'Analyze this ticket and return JSON: {category: "technical/billing/general", priority: "low/medium/high", urgency: "routine/urgent/critical"}. Ticket: {{ticket_content}}',
                model: 'gpt-4',
                temperature: 0.3
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-2',
          type: 'container',
          title: 'Step 2: Route Ticket',
          subtitle: 'Assign to appropriate team',
          elements: [],
          nodes: [
            {
              id: 'node-2',
              type: 'if',
              label: 'Check Category',
              category: 'flow',
              config: {
                condition: '{{category}} === "technical"'
              },
              enabled: true
            },
            {
              id: 'node-3',
              type: 'http',
              label: 'Assign to Team',
              category: 'core',
              config: {
                method: 'POST',
                url: 'https://api.support.com/assign'
              },
              enabled: true
            }
          ]
        }
      ],
      formFields: []
    }
  },

  // 6. Lead Scoring System
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
    updatedAt: '2024-01-20',
    workflowData: {
      workflowName: 'AI Lead Scoring & Qualification',
      workflowDescription: 'Score and qualify leads automatically',
      triggers: [
        {
          id: 'trigger-1',
          type: 'webhook',
          label: 'New Lead Webhook',
          config: { endpoint: '/lead', method: 'POST' },
          enabled: true
        }
      ],
      triggerLogic: [],
      containers: [
        {
          id: 'container-1',
          type: 'container',
          title: 'Step 1: Enrich Lead Data',
          subtitle: 'Gather additional information',
          elements: [],
          nodes: [
            {
              id: 'node-1',
              type: 'http',
              label: 'Enrich via Clearbit',
              category: 'core',
              config: {
                method: 'GET',
                url: 'https://person.clearbit.com/v2/combined/find?email={{email}}'
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-2',
          type: 'container',
          title: 'Step 2: Calculate Score',
          subtitle: 'Assess lead quality',
          elements: [],
          nodes: [
            {
              id: 'node-2',
              type: 'code',
              label: 'Score Lead',
              category: 'data',
              config: {
                language: 'javascript',
                code: 'let score = 0;\nif (company_size > 100) score += 30;\nif (job_title.includes("Director")) score += 20;\nif (engagement > 5) score += 25;\nreturn { score, qualified: score > 60 };'
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-3',
          type: 'container',
          title: 'Step 3: Update CRM',
          subtitle: 'Sync to sales system',
          elements: [],
          nodes: [
            {
              id: 'node-3',
              type: 'http',
              label: 'Update Salesforce',
              category: 'core',
              config: {
                method: 'PATCH',
                url: 'https://api.salesforce.com/lead/{{lead_id}}'
              },
              enabled: true
            }
          ]
        }
      ],
      formFields: []
    }
  },

  // 7. Social Media Content Scheduler
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
    updatedAt: '2024-01-21',
    workflowData: {
      workflowName: 'Multi-Platform Content Scheduler',
      workflowDescription: 'Schedule social media posts',
      triggers: [
        {
          id: 'trigger-1',
          type: 'schedule',
          label: 'Daily Schedule',
          config: { cron: '0 9 * * *' },
          enabled: true
        }
      ],
      triggerLogic: [],
      containers: [
        {
          id: 'container-1',
          type: 'container',
          title: 'Step 1: Prepare Content',
          subtitle: 'Format for each platform',
          elements: [],
          nodes: [
            {
              id: 'node-1',
              type: 'prompt_builder',
              label: 'Adapt Content',
              category: 'ai',
              config: {
                systemPrompt: 'You adapt content for social media platforms.',
                userPrompt: 'Rewrite this for Twitter (280 chars), LinkedIn (professional), and Facebook (casual): {{content}}',
                model: 'gpt-4',
                temperature: 0.7
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-2',
          type: 'container',
          title: 'Step 2: Publish',
          subtitle: 'Post to all platforms',
          elements: [],
          nodes: [
            {
              id: 'node-2',
              type: 'http',
              label: 'Post to Twitter',
              category: 'core',
              config: {
                method: 'POST',
                url: 'https://api.twitter.com/2/tweets'
              },
              enabled: true
            },
            {
              id: 'node-3',
              type: 'http',
              label: 'Post to LinkedIn',
              category: 'core',
              config: {
                method: 'POST',
                url: 'https://api.linkedin.com/v2/ugcPosts'
              },
              enabled: true
            }
          ]
        }
      ],
      formFields: []
    }
  },

  // 8. Invoice Processing
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
    updatedAt: '2024-01-22',
    workflowData: {
      workflowName: 'Automated Invoice Processing',
      workflowDescription: 'Process invoices automatically',
      triggers: [
        {
          id: 'trigger-1',
          type: 'webhook',
          label: 'Invoice Upload',
          config: { endpoint: '/invoice', method: 'POST' },
          enabled: true
        }
      ],
      triggerLogic: [],
      containers: [
        {
          id: 'container-1',
          type: 'container',
          title: 'Step 1: Extract Data',
          subtitle: 'OCR invoice information',
          elements: [],
          nodes: [
            {
              id: 'node-1',
              type: 'http',
              label: 'OCR Processing',
              category: 'core',
              config: {
                method: 'POST',
                url: 'https://api.ocr.space/parse/image'
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-2',
          type: 'container',
          title: 'Step 2: Validate',
          subtitle: 'Check data accuracy',
          elements: [],
          nodes: [
            {
              id: 'node-2',
              type: 'code',
              label: 'Validate Invoice',
              category: 'data',
              config: {
                language: 'javascript',
                code: 'const valid = invoice_number && amount && date;\nreturn { valid, invoice_number, amount, date };'
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-3',
          type: 'container',
          title: 'Step 3: Sync to QuickBooks',
          subtitle: 'Create invoice record',
          elements: [],
          nodes: [
            {
              id: 'node-3',
              type: 'http',
              label: 'Create in QuickBooks',
              category: 'core',
              config: {
                method: 'POST',
                url: 'https://quickbooks.api.intuit.com/v3/company/{{companyId}}/invoice'
              },
              enabled: true
            }
          ]
        }
      ],
      formFields: []
    }
  },

  // 9. Meeting Scheduler
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
    updatedAt: '2024-01-23',
    workflowData: {
      workflowName: 'AI Meeting Scheduler',
      workflowDescription: 'Schedule meetings intelligently',
      triggers: [
        {
          id: 'trigger-1',
          type: 'webhook',
          label: 'Meeting Request',
          config: { endpoint: '/schedule-meeting', method: 'POST' },
          enabled: true
        }
      ],
      triggerLogic: [],
      containers: [
        {
          id: 'container-1',
          type: 'container',
          title: 'Step 1: Check Availability',
          subtitle: 'Find open time slots',
          elements: [],
          nodes: [
            {
              id: 'node-1',
              type: 'http',
              label: 'Get Calendar Free/Busy',
              category: 'core',
              config: {
                method: 'GET',
                url: 'https://www.googleapis.com/calendar/v3/freeBusy'
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-2',
          type: 'container',
          title: 'Step 2: Create Event',
          subtitle: 'Schedule meeting',
          elements: [],
          nodes: [
            {
              id: 'node-2',
              type: 'http',
              label: 'Create Calendar Event',
              category: 'core',
              config: {
                method: 'POST',
                url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events'
              },
              enabled: true
            }
          ]
        }
      ],
      formFields: []
    }
  },

  // 10. Sentiment Analysis
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
    updatedAt: '2024-01-24',
    workflowData: {
      workflowName: 'Customer Feedback Analyzer',
      workflowDescription: 'Analyze customer feedback sentiment',
      triggers: [
        {
          id: 'trigger-1',
          type: 'webhook',
          label: 'Feedback Submitted',
          config: { endpoint: '/feedback', method: 'POST' },
          enabled: true
        }
      ],
      triggerLogic: [],
      containers: [
        {
          id: 'container-1',
          type: 'container',
          title: 'Step 1: Analyze Sentiment',
          subtitle: 'Determine sentiment score',
          elements: [],
          nodes: [
            {
              id: 'node-1',
              type: 'prompt_builder',
              label: 'Sentiment Analysis',
              category: 'ai',
              config: {
                systemPrompt: 'You analyze customer feedback sentiment.',
                userPrompt: 'Analyze this feedback and return JSON: {sentiment: "positive/neutral/negative", score: 0-100, key_themes: []}. Feedback: {{feedback}}',
                model: 'gpt-4',
                temperature: 0.2
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-2',
          type: 'container',
          title: 'Step 2: Store Results',
          subtitle: 'Save to analytics database',
          elements: [],
          nodes: [
            {
              id: 'node-2',
              type: 'http',
              label: 'Store in Database',
              category: 'core',
              config: {
                method: 'POST',
                url: 'https://api.database.com/feedback'
              },
              enabled: true
            }
          ]
        }
      ],
      formFields: []
    }
  },

  // 11. Image Processing
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
    updatedAt: '2024-01-25',
    workflowData: {
      workflowName: 'Automated Image Optimization',
      workflowDescription: 'Optimize and resize images',
      triggers: [
        {
          id: 'trigger-1',
          type: 'webhook',
          label: 'Image Upload',
          config: { endpoint: '/upload-image', method: 'POST' },
          enabled: true
        }
      ],
      triggerLogic: [],
      containers: [
        {
          id: 'container-1',
          type: 'container',
          title: 'Step 1: Process Image',
          subtitle: 'Resize and optimize',
          elements: [],
          nodes: [
            {
              id: 'node-1',
              type: 'http',
              label: 'Optimize via Cloudinary',
              category: 'core',
              config: {
                method: 'POST',
                url: 'https://api.cloudinary.com/v1_1/{{cloud_name}}/image/upload'
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-2',
          type: 'container',
          title: 'Step 2: Store URLs',
          subtitle: 'Save optimized versions',
          elements: [],
          nodes: [
            {
              id: 'node-2',
              type: 'http',
              label: 'Save to Database',
              category: 'core',
              config: {
                method: 'POST',
                url: 'https://api.database.com/images'
              },
              enabled: true
            }
          ]
        }
      ],
      formFields: []
    }
  },

  // 12. E-commerce Order Processing
  {
    id: 'ecommerce-order-fulfillment',
    name: 'E-commerce Order Fulfillment',
    description: 'Automate order processing from payment confirmation to shipping notification.',
    category: 'integration',
    icon: 'ShoppingCart',
    tags: ['ecommerce', 'orders', 'fulfillment', 'automation'],
    difficulty: 'advanced',
    estimatedTime: '30 minutes',
    useCases: [
      'Process orders automatically',
      'Send order confirmations',
      'Track inventory and shipping'
    ],
    popularity: 86,
    author: 'Flowversal',
    createdAt: '2024-01-26',
    updatedAt: '2024-01-26',
    workflowData: {
      workflowName: 'E-commerce Order Fulfillment',
      workflowDescription: 'Automate order processing',
      triggers: [
        {
          id: 'trigger-1',
          type: 'webhook',
          label: 'Order Paid',
          config: { endpoint: '/order-paid', method: 'POST' },
          enabled: true
        }
      ],
      triggerLogic: [],
      containers: [
        {
          id: 'container-1',
          type: 'container',
          title: 'Step 1: Validate Order',
          subtitle: 'Check payment and inventory',
          elements: [],
          nodes: [
            {
              id: 'node-1',
              type: 'http',
              label: 'Check Inventory',
              category: 'core',
              config: {
                method: 'GET',
                url: 'https://api.inventory.com/check/{{product_id}}'
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-2',
          type: 'container',
          title: 'Step 2: Create Shipment',
          subtitle: 'Generate shipping label',
          elements: [],
          nodes: [
            {
              id: 'node-2',
              type: 'http',
              label: 'Create Shipment',
              category: 'core',
              config: {
                method: 'POST',
                url: 'https://api.shippo.com/shipments'
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-3',
          type: 'container',
          title: 'Step 3: Notify Customer',
          subtitle: 'Send confirmation email',
          elements: [],
          nodes: [
            {
              id: 'node-3',
              type: 'http',
              label: 'Send Confirmation',
              category: 'core',
              config: {
                method: 'POST',
                url: 'https://api.sendgrid.com/v3/mail/send'
              },
              enabled: true
            }
          ]
        }
      ],
      formFields: []
    }
  },

  // 13. API Integration Template
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
    updatedAt: '2024-01-27',
    workflowData: {
      workflowName: 'REST API Integration Starter',
      workflowDescription: 'Connect to external APIs',
      triggers: [
        {
          id: 'trigger-1',
          type: 'manual',
          label: 'Manual Trigger',
          config: {},
          enabled: true
        }
      ],
      triggerLogic: [],
      containers: [
        {
          id: 'container-1',
          type: 'container',
          title: 'Step 1: API Request',
          subtitle: 'Call external API',
          elements: [],
          nodes: [
            {
              id: 'node-1',
              type: 'http',
              label: 'GET Request',
              category: 'core',
              config: {
                method: 'GET',
                url: 'https://api.example.com/data',
                headers: { 'Authorization': 'Bearer {{API_KEY}}' }
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-2',
          type: 'container',
          title: 'Step 2: Transform Data',
          subtitle: 'Process API response',
          elements: [],
          nodes: [
            {
              id: 'node-2',
              type: 'code',
              label: 'Transform Response',
              category: 'data',
              config: {
                language: 'javascript',
                code: '// Transform API response\nconst transformed = data.map(item => ({ id: item.id, name: item.name }));\nreturn transformed;'
              },
              enabled: true
            }
          ]
        }
      ],
      formFields: []
    }
  },

  // 14. Form Submission Handler
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
    updatedAt: '2024-01-28',
    workflowData: {
      workflowName: 'Smart Form Handler',
      workflowDescription: 'Handle form submissions',
      triggers: [
        {
          id: 'trigger-1',
          type: 'webhook',
          label: 'Form Submit',
          config: { endpoint: '/form-submit', method: 'POST' },
          enabled: true
        }
      ],
      triggerLogic: [],
      containers: [
        {
          id: 'container-1',
          type: 'container',
          title: 'Step 1: Validate',
          subtitle: 'Check form data',
          elements: [],
          nodes: [
            {
              id: 'node-1',
              type: 'code',
              label: 'Validate Input',
              category: 'data',
              config: {
                language: 'javascript',
                code: 'const emailValid = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);\nconst phoneValid = phone && phone.length >= 10;\nreturn { valid: emailValid && phoneValid };'
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-2',
          type: 'container',
          title: 'Step 2: Send Notification',
          subtitle: 'Email to admin',
          elements: [],
          nodes: [
            {
              id: 'node-2',
              type: 'http',
              label: 'Send Email',
              category: 'core',
              config: {
                method: 'POST',
                url: 'https://api.sendgrid.com/v3/mail/send'
              },
              enabled: true
            }
          ]
        }
      ],
      formFields: []
    }
  },

  // 15. Daily Report Generator
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
    updatedAt: '2024-01-29',
    workflowData: {
      workflowName: 'Automated Daily Report',
      workflowDescription: 'Generate daily reports',
      triggers: [
        {
          id: 'trigger-1',
          type: 'schedule',
          label: 'Daily at 8 AM',
          config: { cron: '0 8 * * *' },
          enabled: true
        }
      ],
      triggerLogic: [],
      containers: [
        {
          id: 'container-1',
          type: 'container',
          title: 'Step 1: Gather Data',
          subtitle: 'Collect metrics from sources',
          elements: [],
          nodes: [
            {
              id: 'node-1',
              type: 'http',
              label: 'Fetch Analytics',
              category: 'core',
              config: {
                method: 'GET',
                url: 'https://api.analytics.com/metrics?date=today'
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-2',
          type: 'container',
          title: 'Step 2: Generate Report',
          subtitle: 'Create formatted report',
          elements: [],
          nodes: [
            {
              id: 'node-2',
              type: 'prompt_builder',
              label: 'Write Summary',
              category: 'ai',
              config: {
                systemPrompt: 'You create executive summaries.',
                userPrompt: 'Create a daily report summary from this data: {{metrics}}. Include key insights and trends.',
                model: 'gpt-4',
                temperature: 0.5
              },
              enabled: true
            }
          ]
        },
        {
          id: 'container-3',
          type: 'container',
          title: 'Step 3: Send Email',
          subtitle: 'Deliver to recipients',
          elements: [],
          nodes: [
            {
              id: 'node-3',
              type: 'http',
              label: 'Send Report',
              category: 'core',
              config: {
                method: 'POST',
                url: 'https://api.sendgrid.com/v3/mail/send'
              },
              enabled: true
            }
          ]
        }
      ],
      formFields: []
    }
  }
];

// Helper functions
export const getTemplateById = (id: string): WorkflowTemplate | undefined => {
  return WORKFLOW_TEMPLATES.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): WorkflowTemplate[] => {
  if (category === 'all') return WORKFLOW_TEMPLATES;
  return WORKFLOW_TEMPLATES.filter(template => template.category === category);
};

export const getFeaturedTemplates = (): WorkflowTemplate[] => {
  return WORKFLOW_TEMPLATES.filter(template => template.featured).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
};

export const searchTemplates = (query: string): WorkflowTemplate[] => {
  const lowerQuery = query.toLowerCase();
  return WORKFLOW_TEMPLATES.filter(template => 
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};