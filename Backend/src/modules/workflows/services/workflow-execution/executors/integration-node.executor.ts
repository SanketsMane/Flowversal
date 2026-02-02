import { integrationNodeExecutor } from '../../../../../services/nodes/integration-node-executor';
import { ExecutionContext } from '../types/workflow-execution.types';

export class IntegrationNodeExecutor {
  async execute(node: any, context: ExecutionContext): Promise<any> {
    const nodeType = node.type || 'unknown';
    let result: any;

    switch (nodeType) {
      case 'http-request':
        result = await integrationNodeExecutor.executeHTTPRequestNode(node, context);
        break;
      case 'email':
        result = await integrationNodeExecutor.executeEmailNode(node, context);
        break;
      case 'webhook':
        result = await integrationNodeExecutor.executeWebhookNode(node, context);
        break;
      default:
        throw new Error(`Unknown integration node type: ${nodeType}`);
    }

    // Track API calls for integration nodes
    context.execution.apiCallsMade = (context.execution.apiCallsMade || 0) + 1;
    await context.execution.save();

    return result;
  }
}
