import { chatService } from '../../../modules/ai/services/ai/chat.service';
import { MCPTool, MCPContext } from '../types';
import { mcpToolRegistry } from '../registry';

export const aiTool: MCPTool = {
  name: 'ai',
  description: 'Call AI models for text generation and analysis',
  inputSchema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'Prompt for AI',
      },
      modelType: {
        type: 'string',
        enum: ['local', 'remote'],
        description: 'Model type to use',
      },
      remoteModel: {
        type: 'string',
        enum: ['gpt4', 'claude', 'gemini'],
        description: 'Remote model to use',
      },
    },
    required: ['prompt'],
  },
};

export const aiToolHandler = {
  execute: async (args: any, _context: MCPContext): Promise<any> => {
    const { prompt, modelType, remoteModel } = args;

    const response = await chatService.chatCompletion({
      messages: [{ role: 'user', content: prompt }],
      modelType: modelType as any,
      remoteModel: remoteModel as any,
    });

    return {
      response: response.response,
      model: response.model,
    };
  },
};

// Register tool
mcpToolRegistry.register(aiTool);

