import { aiNodeExecutor } from '../../../../../services/nodes/ai-node-executor';
import { ExecutionContext } from '../types/workflow-execution.types';

export class AINodeExecutor {
  async execute(node: any, context: ExecutionContext): Promise<any> {
    const nodeType = node.type || 'ai-chat';
    let result: any;

    switch (nodeType) {
      case 'ai-chat':
        result = await aiNodeExecutor.executeAIChatNode(node, context);
        break;
      case 'ai-agent':
        result = await aiNodeExecutor.executeAIAgentNode(node, context);
        break;
      case 'ai-generate':
        result = await aiNodeExecutor.executeAIGenerateNode(node, context);
        break;
      case 'ai-workflow-generator':
        result = await aiNodeExecutor.executeAIWorkflowGeneratorNode(node, context);
        break;
      default:
        // Default to AI chat
        result = await aiNodeExecutor.executeAIChatNode(node, context);
    }

    // Track AI token usage if available in result
    if (result && typeof result === 'object') {
      if (result.tokensUsed) {
        context.execution.aiTokensUsed = (context.execution.aiTokensUsed || 0) + result.tokensUsed;
      }
      if (result.totalTokens) {
        context.execution.aiTokensUsed = (context.execution.aiTokensUsed || 0) + result.totalTokens;
      }
      await context.execution.save();
    }

    return result;
  }
}
