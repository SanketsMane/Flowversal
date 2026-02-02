/**
 * JSON Schemas for Fastify validation - AI Chat
 */

export const chatCompletionSchema = {
  body: {
    type: 'object',
    required: ['messages'],
    properties: {
      messages: {
        type: 'array',
        items: {
          type: 'object',
          required: ['role', 'content'],
          properties: {
            role: {
              type: 'string',
              enum: ['system', 'user', 'assistant'],
            },
            content: {
              type: 'string',
            },
          },
        },
      },
      modelType: {
        type: 'string',
        enum: ['local', 'remote', 'vllm'],
      },
      remoteModel: {
        type: 'string',
        enum: ['gpt4', 'claude', 'gemini'],
      },
      temperature: {
        type: 'number',
        minimum: 0,
        maximum: 2,
      },
      maxTokens: {
        type: 'number',
        minimum: 1,
        maximum: 8192,
      },
      useLangChain: {
        type: 'boolean',
      },
      tools: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      mode: {
        type: 'string',
        enum: ['agent', 'plan', 'debug', 'ask'],
      },
      conversationId: {
        type: 'string',
      },
    },
  },
};

