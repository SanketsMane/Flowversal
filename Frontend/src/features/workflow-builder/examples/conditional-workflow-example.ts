/**
 * Example Workflow with Conditional Logic
 * Demonstrates If/Switch nodes with branching paths
 */

import { WorkflowNode, Container, Trigger } from '../types';

export const conditionalWorkflowExample = {
  name: 'User Verification Workflow',
  description: 'Workflow demonstrating conditional logic with If/Switch nodes',
  category: 'automation',
  icon: '🔀',

  triggers: [
    {
      id: 'trigger-1',
      type: 'form_submission',
      label: 'Form Submitted',
      config: {
        formId: 'user-registration',
      },
    },
  ] as Trigger[],

  containers: [
    {
      id: 'container-1',
      type: 'container',
      title: 'Validation & Routing',
      subtitle: 'Check user status and route accordingly',
      elements: [],
      nodes: [
        // Transform data node
        {
          id: 'node-1',
          type: 'transform_data',
          label: 'Extract User Data',
          category: 'data',
          config: {
            transformations: [
              { field: 'email', operation: 'lowercase' },
              { field: 'age', operation: 'to_number' },
            ],
          },
          enabled: true,
        },
        // If condition - Age verification
        {
          id: 'node-2',
          type: 'if',
          label: 'Check User Age',
          category: 'logic',
          config: {
            conditionGroups: [
              {
                id: 'group-1',
                conditions: [
                  {
                    id: 'cond-1',
                    leftOperand: '{{user.age}}',
                    operator: 'greater_than_equals',
                    rightOperand: '18',
                    dataType: 'number',
                  },
                ],
                logicalOperator: 'AND',
                convertTypes: true,
              },
            ],
            trueNodes: [
              {
                id: 'true-node-1',
                type: 'send_email',
                label: 'Send Welcome Email',
                category: 'node',
                config: {
                  template: 'welcome',
                  to: '{{user.email}}',
                },
                enabled: true,
              },
              {
                id: 'true-node-2',
                type: 'update_database',
                label: 'Create User Account',
                category: 'node',
                config: {
                  table: 'users',
                  action: 'insert',
                },
                enabled: true,
              },
              {
                id: 'true-node-3',
                type: 'http_request',
                label: 'Notify CRM',
                category: 'node',
                config: {
                  method: 'POST',
                  url: 'https://api.crm.com/users',
                },
                enabled: true,
              },
            ],
            falseNodes: [
              {
                id: 'false-node-1',
                type: 'send_email',
                label: 'Send Underage Notice',
                category: 'node',
                config: {
                  template: 'underage-notice',
                  to: '{{user.email}}',
                },
                enabled: true,
              },
              {
                id: 'false-node-2',
                type: 'log_event',
                label: 'Log Rejection',
                category: 'node',
                config: {
                  level: 'info',
                  message: 'User registration rejected - underage',
                },
                enabled: true,
              },
            ],
          },
          enabled: true,
        },
        // Switch condition - Email domain routing
        {
          id: 'node-3',
          type: 'switch',
          label: 'Route by Email Domain',
          category: 'logic',
          config: {
            conditionGroups: [
              {
                id: 'group-1',
                conditions: [
                  {
                    id: 'cond-1',
                    leftOperand: '{{user.email}}',
                    operator: 'ends_with',
                    rightOperand: '@company.com',
                    dataType: 'string',
                  },
                ],
                logicalOperator: 'AND',
              },
            ],
            trueNodes: [
              {
                id: 'switch-true-1',
                type: 'assign_role',
                label: 'Assign Employee Role',
                category: 'node',
                config: {
                  role: 'employee',
                },
                enabled: true,
              },
            ],
            falseNodes: [
              {
                id: 'switch-false-1',
                type: 'assign_role',
                label: 'Assign Customer Role',
                category: 'node',
                config: {
                  role: 'customer',
                },
                enabled: true,
              },
            ],
            evaluationStrategy: 'first_match',
          },
          enabled: true,
        },
      ] as WorkflowNode[],
      fields: [],
    },
    {
      id: 'container-2',
      type: 'container',
      title: 'Final Actions',
      subtitle: 'Complete the workflow',
      elements: [],
      nodes: [
        {
          id: 'node-4',
          type: 'send_notification',
          label: 'Send Admin Notification',
          category: 'actions',
          config: {
            channel: 'slack',
            message: 'New user registered: {{user.email}}',
          },
          enabled: true,
        },
      ] as WorkflowNode[],
      fields: [],
    },
  ] as Container[],
};

/**
 * Example: Complex Nested Conditional Logic
 */
export const nestedConditionalExample = {
  name: 'Order Processing Workflow',
  description: 'Multi-level conditional logic for order processing',
  category: 'ecommerce',
  icon: '📦',

  triggers: [
    {
      id: 'trigger-1',
      type: 'webhook',
      label: 'Order Received',
      config: {
        webhookUrl: '/api/orders',
      },
    },
  ] as Trigger[],

  containers: [
    {
      id: 'container-1',
      type: 'container',
      title: 'Order Validation',
      subtitle: 'Check order details and inventory',
      elements: [],
      nodes: [
        {
          id: 'node-1',
          type: 'if',
          label: 'Check Order Total',
          category: 'logic',
          config: {
            conditionGroups: [
              {
                id: 'group-1',
                conditions: [
                  {
                    id: 'cond-1',
                    leftOperand: '{{order.total}}',
                    operator: 'greater_than',
                    rightOperand: '1000',
                    dataType: 'number',
                  },
                ],
                logicalOperator: 'AND',
              },
            ],
            trueNodes: [
              {
                id: 'high-value-1',
                type: 'fraud_check',
                label: 'Run Fraud Check',
                category: 'tool',
                config: {
                  provider: 'stripe-radar',
                },
                enabled: true,
              },
              {
                id: 'high-value-2',
                type: 'manual_review',
                label: 'Flag for Review',
                category: 'node',
                config: {
                  priority: 'high',
                },
                enabled: true,
              },
            ],
            falseNodes: [
              {
                id: 'standard-1',
                type: 'auto_approve',
                label: 'Auto Approve',
                category: 'node',
                config: {
                  skipReview: true,
                },
                enabled: true,
              },
            ],
          },
          enabled: true,
        },
        {
          id: 'node-2',
          type: 'if',
          label: 'Check Inventory',
          category: 'logic',
          config: {
            conditionGroups: [
              {
                id: 'group-1',
                conditions: [
                  {
                    id: 'cond-1',
                    leftOperand: '{{inventory.available}}',
                    operator: 'greater_than_equals',
                    rightOperand: '{{order.quantity}}',
                    dataType: 'number',
                  },
                ],
                logicalOperator: 'AND',
              },
            ],
            trueNodes: [
              {
                id: 'in-stock-1',
                type: 'reserve_inventory',
                label: 'Reserve Items',
                category: 'node',
                config: {},
                enabled: true,
              },
              {
                id: 'in-stock-2',
                type: 'process_payment',
                label: 'Process Payment',
                category: 'node',
                config: {},
                enabled: true,
              },
            ],
            falseNodes: [
              {
                id: 'out-of-stock-1',
                type: 'send_email',
                label: 'Notify Customer',
                category: 'node',
                config: {
                  template: 'out-of-stock',
                },
                enabled: true,
              },
              {
                id: 'out-of-stock-2',
                type: 'create_backorder',
                label: 'Create Backorder',
                category: 'node',
                config: {},
                enabled: true,
              },
            ],
          },
          enabled: true,
        },
      ] as WorkflowNode[],
      fields: [],
    },
  ] as Container[],
};
