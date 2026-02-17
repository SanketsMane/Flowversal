import { env } from '../../../../core/config/env';
import { LangChainOptions, langChainService } from './langchain.service';
import { ModelRoutingOptions } from './model-decision.types';
import { modelRouterService } from './model-router.service';
import { openAIService } from './openai.service';

export interface ChatRequest {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  modelType?: 'vllm' | 'openrouter' | 'local' | 'openai';
  remoteModel?: 'gpt4' | 'claude' | 'gemini';
  temperature?: number;
  maxTokens?: number;
  useLangChain?: boolean;
}

export interface ChatResponse {
  response: string;
  model: string;
  modelType: 'vllm' | 'openrouter' | 'local' | 'openai';
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export class ChatService {
  /**
   * Process chat completion
   * Author: Sanket - Prioritizes OpenAI for instant responses
   */
  async chatCompletion(request: ChatRequest): Promise<ChatResponse> {
    // Check if OpenAI is explicitly requested or enabled as default
    // 0. Check for Flowversal Remote (Custom Integration) - Highest Priority
    if (env.FLOWVERSAL_REMOTE_ENABLED) {
      const { flowversalRemoteService } = await import('./flowversal-remote.service');
      // If messages are available, use them, otherwise use prompt
      const msgs = (request.messages && request.messages.length > 0) 
        ? request.messages 
        : [{ role: 'system', content: 'You are a helpful assistant.' }];
      
      const responseContent = await flowversalRemoteService.chatCompletion(msgs, request.remoteModel);
      
      return {
        response: responseContent,
        model: 'flowversal-remote',
        modelType: 'openai', // Using openai type for compatibility
      };
    }

    const useOpenAI = request.modelType === 'openai' || 
                     (openAIService.isAvailable() && !request.modelType);

    // Use OpenAI for instant responses if available
    if (useOpenAI && openAIService.isAvailable()) {
      return this.chatWithOpenAI(request);
    }

    // Fallback to LangChain or direct API
    const useLangChain = request.useLangChain ?? false;

    if (useLangChain) {
      return this.chatWithLangChain(request);
    } else {
      return this.chatWithDirectAPI(request);
    }
  }

  /**
   * Chat using OpenAI Direct API
   * Author: Sanket - Provides instant responses
   */
  private async chatWithOpenAI(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await openAIService.chatCompletion(request.messages, {
        temperature: request.temperature,
        max_tokens: request.maxTokens,
      });

      return {
        response: response.choices[0]?.message?.content || '',
        model: response.model,
        modelType: 'openai',
        usage: {
          prompt_tokens: response.usage?.prompt_tokens,
          completion_tokens: response.usage?.completion_tokens,
          total_tokens: response.usage?.total_tokens,
        },
      };
    } catch (error: any) {
      console.error('OpenAI chat error, falling back:', error.message);
      // Fallback to LangChain on OpenAI error
      return this.chatWithLangChain(request);
    }
  }

  /**
   * Chat using LangChain
   * Automatically falls back: vLLM → OpenRouter → Ollama
   */
  private async chatWithLangChain(request: ChatRequest): Promise<ChatResponse> {
    const options: LangChainOptions = {
      modelType: request.modelType || 'vllm', // Default to vLLM, will fallback if not configured
      remoteModel: request.remoteModel,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      useLangChain: true,
    };

    const response = await langChainService.chatCompletion(request.messages, options);

    // Determine which model was actually used (LangChain service handles fallback)
    const actualModelType = request.modelType || 'vllm';
    let model = 'unknown';
    if (actualModelType === 'local') {
      model = 'ollama-local';
    } else if (actualModelType === 'vllm') {
      model = 'vllm-flowversal';
    } else {
      model = request.remoteModel || 'claude';
    }

    return {
      response,
      model,
      modelType: actualModelType as 'vllm' | 'openrouter' | 'local',
    };
  }

  /**
   * Chat using direct API calls (model router)
   * Note: Model router uses 'local' | 'remote', so we map accordingly
   */
  private async chatWithDirectAPI(request: ChatRequest): Promise<ChatResponse> {
    // Extract system prompt and user prompt
    const systemMessage = request.messages.find(m => m.role === 'system');
    const systemPrompt = systemMessage ? systemMessage.content : undefined;
    
    const userMessages = request.messages.filter(m => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1];
    const prompt = lastUserMessage ? lastUserMessage.content : '';

    // Map new model types to router types: vllm/openrouter → remote, local → local
    const routerModelType: 'local' | 'remote' = 
      request.modelType === 'local' ? 'local' : 'remote';

    const options: ModelRoutingOptions = {
      userSpecifiedTemperature: request.temperature,
    };

    if (request.modelType === 'local') {
      options.forceProvider = 'vllm';
    } else if (request.modelType === 'openrouter') {
      options.forceProvider = 'openrouter';
    } else if (request.modelType === 'openai') {
      options.forceProvider = 'openai';
    } else if (request.remoteModel) {
       // Map remote models to providers if possible
       const providerMap: Record<string, any> = {
         'gpt4': 'openai',
         'claude': 'claude',
         'gemini': 'gemini'
       };
       if (providerMap[request.remoteModel]) {
         options.forceProvider = providerMap[request.remoteModel];
       } else {
         options.forceProvider = 'openrouter';
       }
    }

    // Get the best model for the task
    const result = await modelRouterService.smartRoute(prompt, systemPrompt, options);

    // Execute the selected model
    // Convert messages to format expected by LangChain model
    // We pass the full history
    const modelResponse = await result.model.invoke(request.messages);
    const responseContent = typeof modelResponse.content === 'string' 
      ? modelResponse.content 
      : JSON.stringify(modelResponse.content);

    // Map back to new model types
    const responseModelType: 'vllm' | 'openrouter' | 'local' = 
      result.provider === 'local' ? 'local' : 
      (result.provider === 'vllm' ? 'vllm' : 'openrouter'); // Approximate mapping

    return {
      response: responseContent,
      model: result.provider,
      modelType: responseModelType,
    };
  }

  /**
   * Stream chat completion (for future implementation)
   */
  async *streamChatCompletion(request: ChatRequest): AsyncGenerator<string, void, unknown> {
    // Placeholder for streaming implementation
    const response = await this.chatCompletion(request);
    yield response.response;
  }

  /**
   * Detect if a message is a command
   */
  isCommand(message: string): boolean {
    const commandPatterns = [
      /^send\s+email/i,
      /^create\s+task/i,
      /^execute\s+workflow/i,
      /^search\s+for/i,
      /^get\s+(weather|task|project)/i,
    ];
    return commandPatterns.some((pattern) => pattern.test(message.trim()));
  }

  /**
   * Parse command from natural language
   * Uses LangChain agent to extract command intent and parameters
   */
  async parseCommand(message: string, userId: string): Promise<{
    command: string;
    action: 'email' | 'task' | 'workflow' | 'search' | 'unknown';
    parameters: Record<string, any>;
  }> {
    const parsePrompt = `Parse the following user command and extract the action and parameters.
Return a JSON object with: command (the action type), action (one of: email, task, workflow, search), and parameters (object with extracted values).

Command: "${message}"

Examples:
- "Send email to test@example.com with weather of Delhi" → {"command": "send_email", "action": "email", "parameters": {"to": "test@example.com", "subject": "Weather", "body": "weather of Delhi"}}
- "Create task 'Review code' in project X" → {"command": "create_task", "action": "task", "parameters": {"name": "Review code", "projectId": "X"}}
- "Execute workflow 'Daily Report'" → {"command": "execute_workflow", "action": "workflow", "parameters": {"workflowName": "Daily Report"}}

Return only valid JSON:`;

    try {
      const response = await langChainService.generateText(parsePrompt, {
        modelType: 'vllm', // Will fallback to openrouter if vLLM not configured
        remoteModel: 'claude',
        temperature: 0.1,
        maxTokens: 200,
        useLangChain: true,
      });

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          command: parsed.command || 'unknown',
          action: parsed.action || 'unknown',
          parameters: parsed.parameters || {},
        };
      }

      // Fallback parsing
      return this.fallbackCommandParsing(message);
    } catch (error) {
      console.error('Error parsing command:', error);
      return this.fallbackCommandParsing(message);
    }
  }

  /**
   * Fallback command parsing using regex
   */
  private fallbackCommandParsing(message: string): {
    command: string;
    action: 'email' | 'task' | 'workflow' | 'search' | 'unknown';
    parameters: Record<string, any>;
  } {
    const lowerMessage = message.toLowerCase();

    // Email command
    if (lowerMessage.includes('send email') || lowerMessage.includes('email to')) {
      const toMatch = message.match(/to\s+([^\s]+@[^\s]+)/i);
      const withMatch = message.match(/with\s+(.+)/i);
      return {
        command: 'send_email',
        action: 'email',
        parameters: {
          to: toMatch ? toMatch[1] : '',
          body: withMatch ? withMatch[1] : message,
        },
      };
    }

    // Task command
    if (lowerMessage.includes('create task') || lowerMessage.includes('add task')) {
      const nameMatch = message.match(/['"]([^'"]+)['"]/);
      const projectMatch = message.match(/in\s+project\s+(\w+)/i);
      return {
        command: 'create_task',
        action: 'task',
        parameters: {
          name: nameMatch ? nameMatch[1] : 'New Task',
          projectId: projectMatch ? projectMatch[1] : '',
        },
      };
    }

    // Workflow command
    if (lowerMessage.includes('execute workflow') || lowerMessage.includes('run workflow')) {
      const workflowMatch = message.match(/['"]([^'"]+)['"]/);
      return {
        command: 'execute_workflow',
        action: 'workflow',
        parameters: {
          workflowName: workflowMatch ? workflowMatch[1] : '',
        },
      };
    }

    return {
      command: 'unknown',
      action: 'unknown',
      parameters: {},
    };
  }
}

export const chatService = new ChatService();

