/**
 * Action Executor Service
 * Handles execution of actions from chat messages
 * Integrates with workflow builder nodes
 */

import { chatService } from './chat.service';

export interface ActionIntent {
  type: 'tool' | 'workflow' | 'node' | 'query';
  toolName?: string;
  workflowAction?: string;
  nodeType?: string;
  parameters?: Record<string, any>;
  confidence?: number;
}

export interface ActionExecutionResult {
  success: boolean;
  actionType: string;
  result?: any;
  error?: string;
  workflowNode?: any; // Workflow builder node data
}

/**
 * Action Executor Service
 * Executes actions based on chat intents and integrates with workflow builder
 */
export class ActionExecutorService {
  private static instance: ActionExecutorService;

  private constructor() {}

  static getInstance(): ActionExecutorService {
    if (!ActionExecutorService.instance) {
      ActionExecutorService.instance = new ActionExecutorService();
    }
    return ActionExecutorService.instance;
  }

  /**
   * Parse action intent from message
   */
  parseActionIntent(message: string, selectedTools: string[]): ActionIntent | null {
    const lowerMessage = message.toLowerCase();

    // Check for workflow creation
    if (lowerMessage.includes('workflow') || lowerMessage.includes('automation') || 
        (lowerMessage.includes('create') && lowerMessage.includes('process'))) {
      return {
        type: 'workflow',
        workflowAction: 'create',
        confidence: 0.9,
      };
    }

    // Check for tool usage
    for (const tool of selectedTools) {
      if (lowerMessage.includes(tool.toLowerCase())) {
        return {
          type: 'tool',
          toolName: tool,
          confidence: 0.8,
        };
      }
    }

    // Check for common action patterns
    if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
      return {
        type: 'tool',
        toolName: 'websearch',
        confidence: 0.7,
      };
    }

    if (lowerMessage.includes('database') || lowerMessage.includes('query') || lowerMessage.includes('data')) {
      return {
        type: 'tool',
        toolName: 'database',
        confidence: 0.7,
      };
    }

    if (lowerMessage.includes('file') || lowerMessage.includes('read') || lowerMessage.includes('write')) {
      return {
        type: 'tool',
        toolName: 'filesystem',
        confidence: 0.7,
      };
    }

    // Default to query if no clear intent
    return {
      type: 'query',
      confidence: 0.5,
    };
  }

  /**
   * Execute action based on intent
   */
  async executeAction(intent: ActionIntent, message: string, context?: Record<string, any>): Promise<ActionExecutionResult> {
    try {
      switch (intent.type) {
        case 'tool':
          return await this.executeToolAction(intent, message, context);
        
        case 'workflow':
          return await this.executeWorkflowAction(intent, message, context);
        
        case 'node':
          return await this.executeNodeAction(intent, message, context);
        
        default:
          return {
            success: false,
            actionType: 'query',
            error: 'No actionable intent found',
          };
      }
    } catch (error: any) {
      console.error('[ActionExecutor] Error executing action:', error);
      return {
        success: false,
        actionType: intent.type,
        error: error.message || 'Action execution failed',
      };
    }
  }

  /**
   * Execute tool action
   */
  private async executeToolAction(intent: ActionIntent, message: string, context?: Record<string, any>): Promise<ActionExecutionResult> {
    if (!intent.toolName) {
      return {
        success: false,
        actionType: 'tool',
        error: 'Tool name not specified',
      };
    }

    // Extract parameters from message (simplified - could use NLP)
    const parameters = this.extractToolParameters(message, intent.toolName);

    const sessionId = context?.sessionId || `action-${Date.now()}`;
    const result = await chatService.executeTool(intent.toolName, parameters, sessionId);

    return {
      success: result.success,
      actionType: 'tool',
      result: result.data,
      error: result.error?.message,
    };
  }

  /**
   * Execute workflow action
   */
  private async executeWorkflowAction(intent: ActionIntent, message: string, context?: Record<string, any>): Promise<ActionExecutionResult> {
    const tools = context?.selectedTools || [];
    
    const workflow = await chatService.generateWorkflow(
      message,
      context?.mode || 'agent',
      tools
    );

    return {
      success: true,
      actionType: 'workflow',
      result: workflow,
      workflowNode: this.convertWorkflowToNode(workflow),
    };
  }

  /**
   * Execute node action (workflow builder node)
   */
  private async executeNodeAction(intent: ActionIntent, message: string, context?: Record<string, any>): Promise<ActionExecutionResult> {
    // This would execute a specific workflow builder node
    // For now, return a placeholder
    return {
      success: false,
      actionType: 'node',
      error: 'Node execution not yet implemented',
    };
  }

  /**
   * Extract tool parameters from message
   */
  private extractToolParameters(message: string, toolName: string): Record<string, any> {
    // Simple parameter extraction - can be enhanced with NLP
    const params: Record<string, any> = {};

    switch (toolName) {
      case 'websearch':
        // Extract search query
        const searchMatch = message.match(/(?:search|find|look for|get).*?(?:for|about)?\s+(.+?)(?:\.|$)/i);
        if (searchMatch) {
          params.query = searchMatch[1].trim();
        } else {
          params.query = message;
        }
        break;

      case 'database':
        // Extract query
        const queryMatch = message.match(/(?:query|select|get|fetch).*?(?:from|in)?\s+(.+?)(?:\.|$)/i);
        if (queryMatch) {
          params.query = queryMatch[1].trim();
        }
        break;

      case 'filesystem':
        // Extract file path
        const pathMatch = message.match(/(?:read|write|open|file).*?(?:at|in|path)?\s+([\/\w\.]+)/i);
        if (pathMatch) {
          params.path = pathMatch[1].trim();
        }
        break;

      default:
        // Generic parameter extraction
        params.input = message;
    }

    return params;
  }

  /**
   * Convert workflow to workflow builder node format
   * Returns node data compatible with NodeRegistry
   */
  private convertWorkflowToNode(workflow: any): any {
    if (!workflow) return null;

    // Import NodeRegistry dynamically to avoid circular dependencies
    const { NodeRegistry } = require('../../workflow-builder/registries/nodeRegistry');
    
    // Try to create a workflow node or use a generic node type
    const nodeType = workflow.nodes?.length > 0 ? 'workflow-generator' : 'ai-chat-agent';
    const node = NodeRegistry.createInstance(nodeType, {
      workflowId: workflow.id,
      workflowData: workflow,
      name: workflow.name,
      description: workflow.description,
    });

    return node || {
      id: `workflow-${Date.now()}`,
      type: 'workflow-generator',
      label: workflow.name || 'Generated Workflow',
      config: {
        workflowId: workflow.id,
        workflowData: workflow,
      },
    };
  }

  /**
   * Create workflow builder node from action result
   */
  createWorkflowNodeFromAction(actionResult: ActionExecutionResult, containerId: string): any | null {
    if (actionResult.workflowNode) {
      return {
        ...actionResult.workflowNode,
        containerId,
      };
    }
    return null;
  }

  /**
   * Get workflow builder node types that can be executed from chat
   */
  getExecutableNodeTypes(): string[] {
    return [
      'ai-chat-agent',
      'ai-agent-executor',
      'workflow-generator',
      'rag-search',
      'semantic-analyzer',
      'ai-decision-maker',
      'data-transform',
    ];
  }
}

export const actionExecutorService = ActionExecutorService.getInstance();
