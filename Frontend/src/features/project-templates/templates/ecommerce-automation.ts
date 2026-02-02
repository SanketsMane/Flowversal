/**
 * E-commerce Automation Project Template
 * Complete project setup for e-commerce order processing and customer management
 */

import { ProjectTemplate } from '../types/projectTemplate.types';

export const ecommerceAutomationTemplate: ProjectTemplate = {
  id: 'ecommerce-automation-v1',
  name: 'E-commerce Automation Suite',
  description: 'Complete automation system for order processing, inventory management, and customer communications',
  industry: ['E-commerce', 'Retail', 'Online Business'],
  category: 'ecommerce',
  icon: 'ShoppingCart',
  coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
  difficulty: 'intermediate',
  estimatedSetupTime: '10 minutes',
  
  boards: [
    {
      id: 'order-processing',
      name: 'Order Processing',
      description: 'Manage and automate order fulfillment',
      icon: 'Package',
      color: '#00C6FF',
      tasks: [
        {
          id: 'new-order-notification',
          title: 'Set up new order notifications',
          description: 'Configure Slack/email notifications for new orders',
          status: 'todo',
          priority: 'high',
          tags: ['setup', 'notifications'],
          workflowId: 'new-order-slack-notification',
          dueDate: '+1d',
        },
        {
          id: 'order-confirmation-email',
          title: 'Automate order confirmation emails',
          description: 'Send personalized order confirmations to customers',
          status: 'todo',
          priority: 'high',
          tags: ['email', 'automation'],
          workflowId: 'order-confirmation-email',
          dueDate: '+1d',
        },
        {
          id: 'inventory-update',
          title: 'Sync inventory levels',
          description: 'Update inventory after each order',
          status: 'todo',
          priority: 'medium',
          tags: ['inventory', 'automation'],
          workflowId: 'inventory-sync',
          dueDate: '+2d',
        },
        {
          id: 'shipping-label',
          title: 'Generate shipping labels',
          description: 'Auto-create shipping labels for fulfilled orders',
          status: 'todo',
          priority: 'medium',
          tags: ['shipping', 'automation'],
          dueDate: '+3d',
        },
      ],
    },
    {
      id: 'customer-management',
      name: 'Customer Management',
      description: 'Automated customer support and engagement',
      icon: 'Users',
      color: '#9D50BB',
      tasks: [
        {
          id: 'welcome-sequence',
          title: 'Set up welcome email sequence',
          description: 'Create 3-part welcome email series for new customers',
          status: 'todo',
          priority: 'high',
          tags: ['email', 'onboarding'],
          workflowId: 'customer-welcome-sequence',
          dueDate: '+2d',
        },
        {
          id: 'review-request',
          title: 'Automate review requests',
          description: 'Send review requests 7 days after delivery',
          status: 'todo',
          priority: 'medium',
          tags: ['email', 'reviews'],
          workflowId: 'review-request-automation',
          dueDate: '+3d',
        },
        {
          id: 'abandoned-cart',
          title: 'Recover abandoned carts',
          description: 'Send reminder emails for abandoned carts',
          status: 'todo',
          priority: 'high',
          tags: ['email', 'conversion'],
          workflowId: 'abandoned-cart-recovery',
          dueDate: '+2d',
        },
      ],
    },
    {
      id: 'analytics-reporting',
      name: 'Analytics & Reporting',
      description: 'Daily sales reports and insights',
      icon: 'BarChart',
      color: '#6EE7B7',
      tasks: [
        {
          id: 'daily-sales-report',
          title: 'Generate daily sales reports',
          description: 'Send daily sales summary to team',
          status: 'todo',
          priority: 'medium',
          tags: ['reporting', 'analytics'],
          workflowId: 'daily-sales-report',
          dueDate: '+4d',
        },
        {
          id: 'low-stock-alert',
          title: 'Set up low stock alerts',
          description: 'Get notified when inventory is low',
          status: 'todo',
          priority: 'high',
          tags: ['inventory', 'alerts'],
          workflowId: 'low-stock-alert',
          dueDate: '+3d',
        },
      ],
    },
  ],
  
  workflows: [], // Workflow templates will be referenced by ID
  
  requiredIntegrations: ['Stripe', 'SendGrid', 'Slack'],
  requiredApiKeys: [
    {
      key: 'STRIPE_API_KEY',
      label: 'Stripe API Key',
      description: 'Your Stripe secret key for payment processing',
      placeholder: 'sk_live_...',
      required: true,
    },
    {
      key: 'SENDGRID_API_KEY',
      label: 'SendGrid API Key',
      description: 'SendGrid API key for sending emails',
      placeholder: 'SG...',
      required: true,
    },
    {
      key: 'SLACK_WEBHOOK_URL',
      label: 'Slack Webhook URL',
      description: 'Slack webhook for order notifications',
      placeholder: 'https://hooks.slack.com/services/...',
      required: false,
    },
  ],
  
  configurationSteps: [
    'Connect your Stripe account',
    'Set up SendGrid for email delivery',
    'Configure Slack notifications (optional)',
    'Customize email templates',
    'Review and activate workflows',
  ],
  
  tags: ['ecommerce', 'automation', 'orders', 'customers', 'inventory'],
  useCases: [
    'Automate order processing from payment to fulfillment',
    'Send personalized customer communications',
    'Track inventory levels in real-time',
    'Generate daily sales reports',
    'Recover abandoned shopping carts',
  ],
  benefits: [
    'Save 10+ hours per week on manual order processing',
    'Increase customer satisfaction with instant confirmations',
    'Reduce cart abandonment by 30%',
    'Never run out of stock unexpectedly',
    'Get real-time insights into your business',
  ],
  
  author: 'Flowversal Team',
  featured: true,
  usageCount: 247,
  createdAt: new Date('2024-01-15').toISOString(),
  updatedAt: new Date('2024-01-15').toISOString(),
};
