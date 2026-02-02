import { workflowService } from '../../../modules/workflows/services/workflow.service';
import { workflowExecutionService } from '../../../modules/workflows/services/workflow-execution.service';
import { MCPTool, MCPContext } from '../types';
import { mcpToolRegistry } from '../registry';

export const workflowTool: MCPTool = {
  name: 'workflow',
  description: 'Execute and manage workflows',
  inputSchema: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['execute', 'list', 'get', 'create'],
        description: 'Workflow operation',
      },
      workflowId: {
        type: 'string',
        description: 'Workflow ID',
      },
      input: {
        type: 'object',
        description: 'Input data for workflow execution',
      },
    },
    required: ['operation'],
  },
};

export const workflowToolHandler = {
  execute: async (args: any, context: MCPContext): Promise<any> => {
    const { operation, workflowId, input } = args;

    switch (operation) {
      case 'execute':
        if (!workflowId) {
          throw new Error('workflowId is required for execute operation');
        }
        const execution = await workflowExecutionService.startExecution(
          workflowId,
          context.userId,
          input || {}
        );
        return { executionId: execution._id.toString(), status: execution.status };
      case 'list':
        const workflows = await workflowService.getUserWorkflows(context.userId, 1, 10);
        return workflows.workflows;
      case 'get':
        if (!workflowId) {
          throw new Error('workflowId is required for get operation');
        }
        const workflow = await workflowService.getWorkflowById(workflowId, context.userId);
        return workflow;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  },
};

// Register tool
mcpToolRegistry.register(workflowTool);

