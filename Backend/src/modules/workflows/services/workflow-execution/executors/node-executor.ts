import { conditionalNodeExecutor } from '../../../../../services/nodes/conditional-node-executor';
import { triggerExecutor } from '../../../../../services/nodes/trigger-executor';
import { ExecutionContext, NodeExecutionResult } from '../types/workflow-execution.types';
import { AINodeExecutor } from './ai-node.executor';
import { humanApprovalExecutor } from './human-approval-executor';
import { IntegrationNodeExecutor } from './integration-node.executor';
import { UtilityNodeExecutor } from './utility-node.executor';

export class NodeExecutor {
  private aiExecutor = new AINodeExecutor();
  private integrationExecutor = new IntegrationNodeExecutor();
  private utilityExecutor = new UtilityNodeExecutor();

  async execute(node: any, context: ExecutionContext): Promise<NodeExecutionResult> {
    const startTime = Date.now();

    try {
      let result: any;

      switch (node.type) {
        case 'ai-chat':
        case 'ai-agent':
        case 'ai-generate':
        case 'ai-workflow-generator':
          result = await this.aiExecutor.execute(node, context);
          break;

        case 'http-request':
        case 'email':
        case 'webhook':
          result = await this.integrationExecutor.execute(node, context);
          break;

        case 'conditional':
          result = await conditionalNodeExecutor.executeConditionalNode(node, context);
          break;

        case 'trigger':
          result = await triggerExecutor.executeTrigger(node, context);
          break;

        case 'delay':
          result = await this.utilityExecutor.executeDelayNode(node, context);
          break;

        case 'log':
          result = await this.utilityExecutor.executeLogNode(node, context);
          break;

        case 'set-variable':
          result = await this.utilityExecutor.executeSetVariableNode(node, context);
          break;

        case 'human-approval':
          result = await humanApprovalExecutor.execute(node.id, node.config, context);
          break;

        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        output: result,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        error: error.message,
        duration,
      };
    }
  }
}
