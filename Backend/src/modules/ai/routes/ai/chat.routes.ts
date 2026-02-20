import { FastifyPluginAsync } from 'fastify';
import { chatCompletionSchema } from '../../../../schemas/chat.schema';
import { commandExecutionService } from '../../../../services/command-execution.service';
import { chatService } from '../../services/ai/chat.service';
import { openAIService } from '../../services/ai/openai.service';
import { webSearchService } from '../../services/ai/web-search.service';

const chatRoutes: FastifyPluginAsync = async (fastify) => {
  // Standard chat completion endpoint
  fastify.post<{ Body: any }>('/', { schema: chatCompletionSchema }, async (request, reply) => {
    const user = request.user as { id: string } | undefined;
    if (!user) {
      return reply.code(401).send({ error: 'Unauthorized', message: 'Authentication required' });
    }

    try {
      const body = request.body as any;
      const { messages, tools, mode, conversationId } = body;

      // Flowversal Remote — highest priority
      if (process.env.FLOWVERSAL_REMOTE_ENABLED === 'true') {
        const { flowversalRemoteService } = await import('../../services/ai/flowversal-remote.service');

        // Author: Sanket — inject web search results for real-time queries
        let augmentedMessages = [...messages];
        const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user');
        if (lastUserMsg && webSearchService.needsWebSearch(lastUserMsg.content)) {
          const searchContext = await webSearchService.search(lastUserMsg.content);
          if (searchContext) {
            // Prepend search results as a system message so the AI can reference them
            const searchSystemMsg = {
              role: 'system',
              content: `You have access to the following real-time web search results. Use them to answer accurately.\n\n${searchContext}`,
            };
            // Insert after any existing system messages
            const sysIdx = augmentedMessages.findIndex((m: any) => m.role !== 'system');
            augmentedMessages.splice(sysIdx === -1 ? 0 : sysIdx, 0, searchSystemMsg);
          }
        }

        const responseContent = await flowversalRemoteService.chatCompletion(augmentedMessages, body.remoteModel);
        return reply.send({
          success: true,
          data: {
            response: responseContent,
            conversationId: conversationId || `conv-${Date.now()}-${user.id}`,
            model: 'flowversal-remote',
          },
        });
      }

      // Agent mode with tools — use LangChain
      if (tools && Array.isArray(tools) && tools.length > 0 && (mode === 'agent' || !mode)) {
        const { langChainAgentService } = await import('../../services/ai/langchain-agent.service');
        const userMessages = messages.filter((m: any) => m.role === 'user');
        const userMessage = userMessages.length > 0
          ? userMessages[userMessages.length - 1].content
          : messages[messages.length - 1]?.content || '';
        const systemMessage = messages.find((m: any) => m.role === 'system');
        const systemPrompt = systemMessage?.content ||
          'You are Flowversal AI, a helpful assistant with access to tools.';
        const modelType = body.modelType === 'vllm' ? 'vllm' : 'openrouter';
        const agentResult = await langChainAgentService.createAgent(userMessage, {
          modelType,
          remoteModel: body.remoteModel || 'claude',
          temperature: body.temperature || 0.7,
          maxTokens: body.maxTokens || 2000,
          tools,
          systemPrompt,
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
        useLangChain: body.useLangChain !== false,
      });

      return reply.send({
        success: true,
        data: { ...response, conversationId: conversationId || `conv-${Date.now()}-${user.id}` },
      });
    } catch (error: any) {
      fastify.log.error({ err: error }, 'Error in chat completion');
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: error.message || 'Failed to generate chat completion',
      });
    }
  });

  /**
   * Streaming chat endpoint — Server-Sent Events
   * Author: Sanket — streams OpenAI tokens to the client for typewriter effect
   */
  fastify.post<{ Body: any }>('/stream', async (request, reply) => {
    const user = request.user as { id: string } | undefined;
    if (!user) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const body = request.body as any;
    const { messages, temperature, maxTokens } = body;

    // Set SSE headers — must be done before writing any data
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    reply.raw.flushHeaders();

    try {
      if (openAIService.isAvailable()) {
        // Stream real tokens from OpenAI
        for await (const token of openAIService.streamChatCompletion(messages, {
          temperature: temperature || 0.7,
          max_tokens: maxTokens || 2000,
        })) {
          reply.raw.write(`data: ${JSON.stringify({ token })}\n\n`);
        }
      } else {
        // Fallback: get full response and simulate word-by-word streaming
        const response = await chatService.chatCompletion({
          messages,
          temperature,
          maxTokens,
          useLangChain: true,
        });
        const words = response.response.split(' ');
        for (const word of words) {
          reply.raw.write(`data: ${JSON.stringify({ token: word + ' ' })}\n\n`);
          // Small delay between words to create typewriter illusion
          await new Promise((r) => setTimeout(r, 25));
        }
      }

      reply.raw.write('data: [DONE]\n\n');
    } catch (error: any) {
      fastify.log.error({ err: error }, 'Error in streaming chat');
      reply.raw.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    } finally {
      reply.raw.end();
    }
  });

  /**
   * Image generation endpoint — DALL-E 3
   * Author: Sanket — generates images from text prompts via OpenAI DALL-E
   */
  fastify.post<{ Body: { prompt: string } }>('/image', async (request, reply) => {
    const user = request.user as { id: string } | undefined;
    if (!user) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const { prompt } = request.body;
    if (!prompt) {
      return reply.code(400).send({ error: 'Prompt is required' });
    }

    try {
      if (!openAIService.isAvailable()) {
        return reply.code(503).send({
          success: false,
          error: 'Image generation requires OpenAI. Please set OPENAI_API_KEY and OPENAI_ENABLED=true in your environment.',
        });
      }

      const result = await openAIService.generateImage(prompt);
      return reply.send({
        success: true,
        data: { url: result.url, revisedPrompt: result.revisedPrompt },
      });
    } catch (error: any) {
      fastify.log.error({ err: error }, 'Error generating image');
      return reply.code(500).send({ success: false, error: error.message || 'Failed to generate image' });
    }
  });

  // Command execution endpoint
  fastify.post<{ Body: { command: string } }>('/command', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({ error: 'Unauthorized', message: 'User not authenticated' });
    }
    try {
      const command = request.body.command;
      if (!command || typeof command !== 'string') {
        return reply.code(400).send({ error: 'Bad Request', message: 'Command is required' });
      }
      const parsedCommand = await chatService.parseCommand(command, request.user.id);
      const result = await commandExecutionService.executeCommand(parsedCommand, request.user.id);
      return reply.send({
        success: result.success,
        data: { command: parsedCommand.command, action: parsedCommand.action, result: result.result, error: result.error },
      });
    } catch (error: any) {
      fastify.log.error('Error executing command:', error);
      return reply.code(500).send({ error: 'Internal Server Error', message: error.message });
    }
  });

  // Health check
  fastify.get('/health', async (_request, reply) => {
    return reply.send({ success: true, services: { local: 'available', remote: 'available' } });
  });
};

export default chatRoutes;
