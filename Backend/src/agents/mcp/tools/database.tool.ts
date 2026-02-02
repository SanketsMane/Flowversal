import { WorkflowModel } from '../../../modules/workflows/models/Workflow.model';
import { MCPTool, MCPContext } from '../types';
import { mcpToolRegistry } from '../registry';

export const databaseTool: MCPTool = {
  name: 'database',
  description: 'Query and manipulate database records',
  inputSchema: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['find', 'create', 'update', 'delete', 'query'],
        description: 'Database operation',
      },
      collection: {
        type: 'string',
        enum: ['workflows', 'users', 'executions'],
        description: 'Collection name',
      },
      filter: {
        type: 'object',
        description: 'Filter criteria',
      },
      data: {
        type: 'object',
        description: 'Data for create/update operations',
      },
    },
    required: ['operation', 'collection'],
  },
};

export const databaseToolHandler = {
  execute: async (args: any, context: MCPContext): Promise<any> => {
    const { operation, collection, filter } = args;

    // Add user filter for security
    const userFilter = { userId: context.userId, ...filter };

    switch (collection) {
      case 'workflows':
        switch (operation) {
          case 'find':
            return await WorkflowModel.find(userFilter).limit(10);
          case 'query':
            return await WorkflowModel.find(userFilter || {}).limit(10);
          default:
            throw new Error(`Operation ${operation} not supported for workflows`);
        }
      default:
        throw new Error(`Collection ${collection} not supported`);
    }
  },
};

// Register tool
mcpToolRegistry.register(databaseTool);

