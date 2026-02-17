import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { mcpServer } from '../../../../agents/mcp/server';
import { aiConfig } from '../../../../core/config/ai.config';
import { agentStateService } from './agent-state.service';
import { ModelRoutingOptions } from './model-decision.types';
import { ModelFactory } from './model-factory';
import { modelRouterService } from './model-router.service';

export interface AgentConfig {
  modelType?: 'vllm' | 'openrouter' | 'local';
  remoteModel?: 'gpt4' | 'claude' | 'gemini';
  temperature?: number;
  maxTokens?: number;
  tools?: string[];
  systemPrompt?: string;
  // Agent state tracking
  agentId?: string;
  executionId?: string;
  userId?: string;
  nodeId?: string;
  trackReasoning?: boolean;
  customModel?: any;

  // Enhanced agent patterns
  enableReflection?: boolean;     // Enable self-reflection capabilities
  enableSelfPass?: boolean;       // Enable self-improvement through multiple passes
  maxReflectionRounds?: number;   // Maximum reflection iterations (default: 2)
  reflectionThreshold?: number;   // Confidence threshold for reflection (default: 0.7)
  planningDepth?: number;          // How deep to plan ahead (default: 3)
  adaptiveLearning?: boolean;     // Learn from previous interactions
}

export class LangChainAgentService {
  /**
   * Create LangChain tools from MCP tools with reasoning tracking
   */
  private createMCPTools(
    mcpToolNames: string[],
    agentId?: string,
    executionId?: string,
    userId?: string
  ): any[] {
    const tools: any[] = [];

    for (const toolName of mcpToolNames) {
      const mcpTool = mcpServer.getConfig().tools.find((t: any) => t.name === toolName);
      if (!mcpTool) continue;

      // Build schema object to avoid deep type instantiation
      const schemaProps: Record<string, z.ZodTypeAny> = {};
      const properties = mcpTool.inputSchema.properties || {};
      
      for (const key of Object.keys(properties)) {
        const prop = properties[key];
        if (prop.type === 'string') {
          schemaProps[key] = z.string().optional();
        } else if (prop.type === 'number') {
          schemaProps[key] = z.number().optional();
        } else if (prop.type === 'boolean') {
          schemaProps[key] = z.boolean().optional();
        } else {
          schemaProps[key] = z.any().optional();
        }
      }

      // Create schema with explicit type to avoid deep instantiation
      const schema = Object.keys(schemaProps).length > 0 
        ? z.object(schemaProps) 
        : z.object({});

      // Create a LangChain tool wrapper for MCP tool with reasoning tracking
      const tool = new DynamicStructuredTool({
        name: mcpTool.name,
        description: mcpTool.description || '',
        schema: schema as z.ZodObject<any>,
        func: async (args: any) => {
          const toolStartTime = Date.now();
          
          // Record tool call start if tracking enabled
          if (agentId && executionId && userId) {
            await agentStateService.addThought(
              agentId,
              executionId,
              `Calling tool: ${toolName}`,
              `Arguments: ${JSON.stringify(args)}`,
              0.8
            );
          }

          try {
            // Execute via MCP server
            const sessionId = `agent-${Date.now()}`;
            const result = await mcpServer.executeTool(sessionId, userId || 'system', {
              tool: toolName,
              arguments: args,
            });

            const toolDuration = Date.now() - toolStartTime;

            // Record successful tool call
            if (agentId && executionId && userId) {
              await agentStateService.recordToolCall(
                agentId,
                executionId,
                toolName,
                args,
                result.result,
                toolDuration,
                result.success,
                result.error
              );
            }

            if (result.success) {
              return JSON.stringify(result.result);
            } else {
              throw new Error(result.error || 'Tool execution failed');
            }
          } catch (error: any) {
            const toolDuration = Date.now() - toolStartTime;
            
            // Record failed tool call
            if (agentId && executionId && userId) {
              await agentStateService.recordToolCall(
                agentId,
                executionId,
                toolName,
                args,
                undefined,
                toolDuration,
                false,
                error.message
              );
            }
            
            throw error;
          }
        },
      } as any);

      tools.push(tool);
    }

    return tools;
  }

  /**
   * Create and execute a LangChain agent with reasoning tracking
   */
  async createAgent(
    prompt: string,
    config: AgentConfig = {}
  ): Promise<{ response: string; toolsUsed: string[]; reasoning?: any }> {
    const modelType = config.modelType || 'vllm';
    const tools = config.tools || [];
    const trackReasoning = config.trackReasoning !== false && !!(config.agentId && config.executionId && config.userId);

    // Initialize agent state if tracking is enabled
    if (trackReasoning && config.agentId && config.executionId && config.userId) {
      await agentStateService.createOrUpdateAgentState(
        config.agentId,
        config.executionId,
        config.userId,
        config.nodeId,
        { prompt, tools }
      );

      // Record initial thought
      await agentStateService.addThought(
        config.agentId,
        config.executionId,
        `Starting agent execution with prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`,
        `Available tools: ${tools.join(', ')}`,
        1.0
      );
    }

    // Create MCP tools as LangChain tools with tracking
    const langchainTools = this.createMCPTools(
      tools,
      config.agentId,
      config.executionId,
      config.userId
    );

    if (langchainTools.length === 0) {
      // No tools, just use simple completion
      const { langChainService } = await import('./langchain.service');
      // Map modelType to LangChainOptions format
      const langChainModelType = modelType === 'vllm' ? 'vllm' : 
                                 modelType === 'local' ? 'local' : 
                                 'openrouter';
      const response = await langChainService.generateText(prompt, {
        modelType: langChainModelType,
        remoteModel: config.remoteModel,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        useLangChain: true,
      });
      return { response, toolsUsed: [] };
    }

    // Create agent with tools using intelligent routing
    const model = await this.createModel(config, prompt);
    const systemPrompt = config.systemPrompt || 'You are a helpful AI assistant with access to tools.';

    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', systemPrompt],
      ['human', '{input}'],
      new MessagesPlaceholder('agent_scratchpad'),
    ]);

    try {
      // In LangChain v1.x, agent creation API has changed
      // For now, use a simplified tool-calling approach
      // TODO: Update to use new LangChain v1.x agent API when available
      
      // Use model with tool calling directly
      // Use any[] to allow flexible message types (system, user, assistant, tool)
      const messages: any[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ];

      // Try to use model's built-in tool calling if available
      let response: string;
      let toolsUsed: string[] = [];

      if ('bindTools' in model && typeof (model as any).bindTools === 'function') {
        // Model supports tool calling
        const modelWithTools = (model as any).bindTools(langchainTools);
        const result = await modelWithTools.invoke(messages);
        
        // Track reasoning: model's initial response
        if (trackReasoning && config.agentId && config.executionId) {
          const initialContent = Array.isArray(result.content) 
            ? result.content.map((c: any) => c.text || c).join(' ') 
            : (typeof result.content === 'string' ? result.content : String(result));
          
          await agentStateService.addThought(
            config.agentId,
            config.executionId,
            `Model response: ${initialContent.substring(0, 200)}${initialContent.length > 200 ? '...' : ''}`,
            result.tool_calls ? `Decided to use ${result.tool_calls.length} tool(s)` : 'No tools needed',
            0.9
          );
        }
        
        // Check if model wants to call tools
        if (result.tool_calls && result.tool_calls.length > 0) {
          // Record decision to use tools
          if (trackReasoning && config.agentId && config.executionId) {
            const toolOptions = result.tool_calls.map((tc: any) => ({
              label: tc.name,
              value: tc.name,
              score: 0.9,
            }));
            
            await agentStateService.recordDecision(
              config.agentId,
              config.executionId,
              'Tool Selection',
              toolOptions,
              toolOptions.map((o: any) => o.value),
              `Selected ${result.tool_calls.length} tool(s) based on task requirements`,
              0.85
            );
          }

          for (const toolCall of result.tool_calls) {
            const tool = langchainTools.find((t: any) => t.name === toolCall.name);
            if (tool) {
              const toolResult = await tool.invoke(toolCall.args);
              toolsUsed.push(toolCall.name);
              // Add tool result to messages and continue
              messages.push({ 
                role: 'assistant', 
                content: Array.isArray(result.content) ? result.content.map((c: any) => c.text || c).join(' ') : result.content || '', 
                tool_calls: result.tool_calls 
              });
              messages.push({ 
                role: 'tool', 
                content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult), 
                tool_call_id: toolCall.id 
              });
            }
          }
          // Get final response
          const finalResult = await model.invoke(messages);
          const finalContent = finalResult.content;
          response = Array.isArray(finalContent) 
            ? finalContent.map((c: any) => c.text || c).join(' ') 
            : (typeof finalContent === 'string' ? finalContent : String(finalResult));
          
          // Track final reasoning
          if (trackReasoning && config.agentId && config.executionId) {
            await agentStateService.addThought(
              config.agentId,
              config.executionId,
              `Final response generated after using ${toolsUsed.length} tool(s)`,
              `Tools used: ${toolsUsed.join(', ')}`,
              0.95
            );
          }
        } else {
          const content = result.content;
          response = Array.isArray(content) 
            ? content.map((c: any) => c.text || c).join(' ') 
            : (typeof content === 'string' ? content : String(result));
          
          // Track reasoning: no tools needed
          if (trackReasoning && config.agentId && config.executionId) {
            await agentStateService.addThought(
              config.agentId,
              config.executionId,
              'Completed without using tools',
              'Direct response generated',
              0.9
            );
          }
        }
      } else {
        // Fallback: simple completion with tool descriptions in prompt
        const toolsDescription = langchainTools.map((t: any) => `- ${t.name}: ${t.description}`).join('\n');
        const enhancedPrompt = `${prompt}\n\nAvailable tools:\n${toolsDescription}\n\nYou can describe what tools you'd like to use, and the system will execute them.`;
        const result = await model.invoke([{ role: 'user', content: enhancedPrompt }]);
        const content = result.content;
        response = Array.isArray(content) 
          ? content.map((c: any) => c.text || c).join(' ') 
          : (typeof content === 'string' ? content : String(result));
      }

      // Apply enhanced agent patterns if enabled
      if (config.enableReflection || config.enableSelfPass) {
        const enhancedResult = await this.applyAgentPatterns(
          response,
          prompt,
          config,
          model,
          trackReasoning
        );
        response = enhancedResult.response;
        toolsUsed = [...toolsUsed, ...enhancedResult.additionalTools];
      }

      // Get agent state for reasoning data if tracking was enabled
      let reasoning = undefined;
      if (trackReasoning && config.agentId && config.executionId) {
        const agentState = await agentStateService.getAgentState(config.agentId, config.executionId);
        if (agentState) {
          reasoning = {
            thoughts: agentState.thoughts,
            toolCalls: agentState.toolCalls,
            decisions: agentState.decisions,
            currentState: agentState.currentState,
            reflectionRounds: agentState.reflectionRounds,
            selfImprovementPasses: agentState.selfImprovementPasses,
          };
        }
      }

      return {
        response,
        toolsUsed,
        reasoning,
      };
    } catch (error: any) {
      // Fallback to simple completion if agent creation fails
      console.warn('Agent creation failed, falling back to simple completion:', error);
      const { langChainService } = await import('./langchain.service');
      const response = await langChainService.generateText(prompt, {
        modelType,
        remoteModel: config.remoteModel,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        useLangChain: true,
      });
      return { response, toolsUsed: [] };
    }
  }

  /**
   * Create model instance with priority: vLLM > OpenRouter > Ollama
   */
  private async createModel(config: AgentConfig, prompt: string): Promise<BaseChatModel> {
    // Use intelligent model routing for agent creation
    const routingOptions: ModelRoutingOptions = {
      taskType: 'api_execution', // Agents typically execute API calls/tools
      userSpecifiedTemperature: config.temperature,
      userTier: 'standard',
      enableScoring: true,
      forceProvider: config.modelType as any,
    };

    if (config.customModel) {
        return config.customModel;
    }

    try {
      const routingResult = await modelRouterService.smartRoute(prompt, undefined, routingOptions);
      return routingResult.model;
    } catch (error) {
      // Fallback to old method if routing fails
      console.warn('Model routing failed for agent, using fallback:', error);
      return ModelFactory.createModelWithFallback({
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        modelName: this.getModelNameForProvider(config.remoteModel),
      }) as any;
    }
  }

  /**
   * Get model name based on remote model type
   */
  private getModelNameForProvider(remoteModel?: 'gpt4' | 'claude' | 'gemini'): string {
    if (!remoteModel) return aiConfig.remote.models.claude;
    
    switch (remoteModel) {
      case 'gpt4':
        return aiConfig.remote.models.gpt4;
      case 'gemini':
        return aiConfig.remote.models.gemini;
      case 'claude':
      default:
        return aiConfig.remote.models.claude;
    }
  }

  /**
   * Extract tools used from agent execution result
   */
  private extractToolsUsed(result: any): string[] {
    const toolsUsed: string[] = [];

    if (result.intermediateSteps) {
      for (const step of result.intermediateSteps) {
        if (step.action && step.action.tool) {
          toolsUsed.push(step.action.tool);
        }
      }
    }

    return toolsUsed;
  }

  /**
   * Apply enhanced agent patterns: reflection and self-pass
   */
  private async applyAgentPatterns(
    initialResponse: string,
    originalPrompt: string,
    config: AgentConfig,
    model: BaseChatModel,
    trackReasoning: boolean
  ): Promise<{ response: string; additionalTools: string[] }> {
    let currentResponse = initialResponse;
    let additionalToolsUsed: string[] = [];
    const maxReflectionRounds = config.maxReflectionRounds || 2;
    const reflectionThreshold = config.reflectionThreshold || 0.7;

    // Self-Pass Pattern: Multiple improvement passes
    if (config.enableSelfPass) {
      for (let pass = 0; pass < (config.planningDepth || 2); pass++) {
        const improvementPrompt = `Review your previous response and improve it:

Original task: ${originalPrompt}
Your previous response: ${currentResponse}

Please provide an improved version that is more accurate, comprehensive, and well-structured. Focus on:
1. Clarity and precision
2. Completeness of information
3. Better organization
4. More helpful insights

Improved response:`;

        try {
          const improvementResult = await model.invoke([{ role: 'user', content: improvementPrompt }]);
          const improvedResponse = Array.isArray(improvementResult.content)
            ? improvementResult.content.map((c: any) => c.text || c).join(' ')
            : (typeof improvementResult.content === 'string' ? improvementResult.content : String(improvementResult));

          // Record self-improvement pass
          if (trackReasoning && config.agentId && config.executionId) {
            await agentStateService.recordSelfImprovementPass(
              config.agentId,
              config.executionId,
              pass + 1,
              currentResponse,
              improvedResponse,
              'self_pass'
            );

            await agentStateService.addThought(
              config.agentId,
              config.executionId,
              `Self-improvement pass ${pass + 1} completed`,
              `Improved response from ${currentResponse.length} to ${improvedResponse.length} characters`,
              0.8
            );
          }

          currentResponse = improvedResponse;
        } catch (error) {
          console.warn('Self-improvement pass failed:', error);
          break; // Stop if improvement fails
        }
      }
    }

    // Reflection Pattern: Self-critique and improvement
    if (config.enableReflection) {
      for (let round = 0; round < maxReflectionRounds; round++) {
        const reflectionPrompt = `Reflect on your response and identify areas for improvement:

Task: ${originalPrompt}
Your current response: ${currentResponse}

Please analyze:
1. What are the strengths of this response?
2. What are the weaknesses or areas that could be improved?
3. Are there any gaps in reasoning or information?
4. How could this be more helpful or accurate?

Provide a confidence score (0-1) for your current response and suggest specific improvements:`;

        try {
          const reflectionResult = await model.invoke([{ role: 'user', content: reflectionPrompt }]);
          const reflection = Array.isArray(reflectionResult.content)
            ? reflectionResult.content.map((c: any) => c.text || c).join(' ')
            : (typeof reflectionResult.content === 'string' ? reflectionResult.content : String(reflectionResult));

          // Extract confidence from reflection
          const confidenceMatch = reflection.match(/confidence[^\d]*(\d*\.?\d+)/i);
          const confidence = confidenceMatch ? Math.min(1, parseFloat(confidenceMatch[1])) : 0.5;

          // Record reflection round
          if (trackReasoning && config.agentId && config.executionId) {
            await agentStateService.recordReflectionRound(
              config.agentId,
              config.executionId,
              round + 1,
              currentResponse,
              reflection,
              confidence
            );

            await agentStateService.addThought(
              config.agentId,
              config.executionId,
              `Reflection round ${round + 1} completed`,
              `Confidence: ${(confidence * 100).toFixed(1)}%, Analysis: ${reflection.substring(0, 100)}...`,
              confidence
            );
          }

          // If confidence is below threshold, attempt improvement
          if (confidence < reflectionThreshold) {
            const improvementPrompt = `Based on your reflection, improve your response:

Reflection analysis: ${reflection}
Original task: ${originalPrompt}
Current response: ${currentResponse}

Provide an improved version addressing the identified issues:`;

            const improvementResult = await model.invoke([{ role: 'user', content: improvementPrompt }]);
            const improvedResponse = Array.isArray(improvementResult.content)
              ? improvementResult.content.map((c: any) => c.text || c).join(' ')
              : (typeof improvementResult.content === 'string' ? improvementResult.content : String(improvementResult));

            currentResponse = improvedResponse;
          } else {
            // High confidence, stop reflecting
            break;
          }

        } catch (error) {
          console.warn('Reflection round failed:', error);
          break; // Stop if reflection fails
        }
      }
    }

    return {
      response: currentResponse,
      additionalTools: additionalToolsUsed,
    };
  }
}

export const langChainAgentService = new LangChainAgentService();

