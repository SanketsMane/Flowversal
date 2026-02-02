import { FastifyPluginAsync } from 'fastify';
import { chatCompletionSchema } from '../../../../schemas/chat.schema';
import { commandExecutionService } from '../../../../services/command-execution.service';
import { chatService } from '../../services/ai/chat.service';

const chatRoutes: FastifyPluginAsync = async (fastify) => {
  // Chat completion endpoint with tool calling support
  fastify.post<{ Body: any }>('/', { schema: chatCompletionSchema }, async (request, reply) => {
    // Verify request.user is set (handled by auth layer)
    const user = request.user as { id: string } | undefined;
    
    if (!user) {
       // Should be caught by auth layer, but double check
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Authentication required: User context missing',
        });
    }

    try {
      const body = request.body as any;
      const { messages, tools, mode, conversationId } = body;

      // If tools are provided and mode is 'agent', use LangChain agent service for tool calling
      if (tools && Array.isArray(tools) && tools.length > 0 && (mode === 'agent' || !mode)) {
        const { langChainAgentService } = await import('../../services/ai/langchain-agent.service');
        
        // Extract user message from messages array (get last user message)
        const userMessages = messages.filter((m: any) => m.role === 'user');
        const userMessage = userMessages.length > 0 
          ? userMessages[userMessages.length - 1].content 
          : messages[messages.length - 1]?.content || '';
        
        // Get system prompt from messages or use default
        const systemMessage = messages.find((m: any) => m.role === 'system');
        const systemPrompt = systemMessage?.content || 
          'You are Flowversal AI, a helpful assistant with access to tools. ' +
          'When you use tools, explain what you did and why. Be conversational and helpful.';

        // Determine model type - map 'remote' to 'openrouter' for backward compatibility
        const modelType = body.modelType === 'vllm' ? 'vllm' : 
                         body.modelType === 'local' ? 'local' : 
                         body.modelType === 'remote' ? 'openrouter' : 'openrouter';

        // Use LangChain agent with tool calling
        const agentResult = await langChainAgentService.createAgent(userMessage, {
          modelType: modelType,
          remoteModel: body.remoteModel || 'claude',
          temperature: body.temperature || 0.7,
          maxTokens: body.maxTokens || 2000,
          tools: tools,
          systemPrompt: systemPrompt,
        });

        return reply.send({
          success: true,
          data: {
            response: agentResult.response,
            conversationId: conversationId || `conv-${Date.now()}-${user.id}`,
            toolsUsed: agentResult.toolsUsed || [],
            model: body.remoteModel || body.modelType || 'vllm',
          },
        });
      }

      // Standard chat completion
      const response = await chatService.chatCompletion({
        messages: messages || [],
        modelType: body.modelType,
        remoteModel: body.remoteModel,
        temperature: body.temperature,
        maxTokens: body.maxTokens,
        useLangChain: body.useLangChain !== false, // Default to true for tool support
      });

      return reply.send({
        success: true,
        data: {
          ...response,
          conversationId: conversationId || `conv-${Date.now()}-${user.id}`,
        },
      });
    } catch (error: any) {
      fastify.log.error('Error in chat completion:', error);
      
      // Debug logging to artifact dir
      try {
        const fs = require('fs');
        const logPath = 'C:/Users/rohan/.gemini/antigravity/brain/8622acbb-4c56-4c35-9298-a15ea23810c2/ai_chat_error.log';
        fs.writeFileSync(logPath, `[${new Date().toISOString()}] AI Chat Error:\\n${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}\\n\\nStack:\\n${error.stack}\\n`);
      } catch (e) {
        console.error('Failed to write debug log:', e);
      }

      return reply.code(500).send({
        error: 'Internal Server Error',
        message: error.message || 'Failed to generate chat completion',
      });
    }
  });

  // Command execution endpoint
  fastify.post<{ Body: { command: string } }>('/command', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    try {
      const command = request.body.command;
      if (!command || typeof command !== 'string') {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Command is required and must be a string',
        });
      }

      // Parse command
      const parsedCommand = await chatService.parseCommand(command, request.user.id);

      // Execute command
      const result = await commandExecutionService.executeCommand(parsedCommand, request.user.id);

      return reply.send({
        success: result.success,
        data: {
          command: parsedCommand.command,
          action: parsedCommand.action,
          result: result.result,
          error: result.error,
        },
      });
    } catch (error: any) {
      fastify.log.error('Error executing command:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: error.message || 'Failed to execute command',
      });
    }
  });

  // Health check for AI services
  fastify.get('/health', async (_request, reply) => {
    return reply.send({
      success: true,
      services: {
        local: 'available',
        remote: 'available',
      },
    });
  });
};

export default chatRoutes;

