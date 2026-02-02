import { inngest } from './inngest.client';
import { mcpServer } from '../../../agents/mcp/server';

/**
 * Inngest function for AI agent workflows
 */
export const executeAIAgent = inngest.createFunction(
  { id: 'execute-ai-agent' },
  { event: 'ai/agent' },
  async ({ event, step }) => {
    const { agentId, task, context } = event.data;

    // Execute agent task using MCP
    const result = await step.run('execute-agent', async () => {
      const sessionId = `agent-${agentId}-${Date.now()}`;
      const userId = context?.userId || 'system';

      // Use AI tool to process task
      const aiResult = await mcpServer.executeTool(sessionId, userId, {
        tool: 'ai',
        arguments: {
          prompt: task,
          modelType: 'remote',
          remoteModel: 'claude',
        },
      });

      return aiResult;
    });

    return { agentId, result, completed: true };
  }
);

