import { FastifyPluginAsync } from 'fastify';
import { openAIService } from '../modules/ai/services/ai/openai.service';

/**
 * Tanchat API Route
 * Author: Sanket
 * Provides streaming chat responses with provider selection (OpenAI, Ollama, etc.)
 * This endpoint supports the Flowversal AI Integration pattern
 */

interface TanchatRequest {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  data?: {
    provider?: 'openai' | 'ollama' | 'openrouter';
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

const tanchatRoutes: FastifyPluginAsync = async (fastify) => {
  // Main tanchat endpoint with streaming support
  fastify.post<{ Body: TanchatRequest }>('/tanchat', async (request, reply) => {
    try {
      const { messages, data } = request.body;

      // Validate messages
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Messages array is required and must not be empty',
        });
      }

      // Extract provider and model from data
      const provider = data?.provider || 'openai'; // Default to OpenAI
      const model = data?.model || 'gpt-4o-mini';
      const temperature = data?.temperature ?? 0.7;
      const maxTokens = data?.maxTokens ?? 2000;

      // Set up streaming response
      reply.raw.setHeader('Content-Type', 'text/plain; charset=utf-8');
      reply.raw.setHeader('Transfer-Encoding', 'chunked');
      reply.raw.setHeader('X-Content-Type-Options', 'nosniff');

      // Handle different providers
      if (provider === 'openai') {
        // Use OpenAI for instant streaming responses
        if (!openAIService.isAvailable()) {
          reply.raw.write('Error: OpenAI service is not configured or enabled\n');
          reply.raw.end();
          return;
        }

        try {
          const response = await openAIService.chatCompletion(messages, {
            temperature,
            max_tokens: maxTokens,
          });

          const content = response.choices[0]?.message?.content || 'No response';
          
          // Stream the response character by character for better UX
          for (const char of content) {
            reply.raw.write(char);
            // Small delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 10));
          }

          reply.raw.end();
        } catch (error: any) {
          reply.raw.write(`Error: ${error.message}\n`);
          reply.raw.end();
        }
      } else if (provider === 'ollama') {
        // Ollama provider - you can implement this based on your setup
        reply.raw.write('Error: Ollama provider is not yet implemented in this endpoint\n');
        reply.raw.end();
      } else if (provider === 'openrouter') {
        // OpenRouter provider - fallback to existing service
        reply.raw.write('Error: OpenRouter provider not implemented yet in tanchat endpoint\n');
        reply.raw.end();
      } else {
        reply.raw.write(`Error: Unknown provider: ${provider}\n`);
        reply.raw.end();
      }
    } catch (error: any) {
      fastify.log.error('Error in tanchat endpoint:', error);
      
      // If headers not sent, send error response
      if (!reply.raw.headersSent) {
        return reply.code(500).send({
          error: 'Internal Server Error',
          message: error.message || 'Failed to process chat request',
        });
      } else {
        // If streaming already started, write error to stream
        reply.raw.write(`\n\nError: ${error.message}\n`);
        reply.raw.end();
      }
    }
  });
};

export default tanchatRoutes;
