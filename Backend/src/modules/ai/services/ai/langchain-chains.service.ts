import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { aiConfig } from '../../../../core/config/ai.config';
import { ModelFactory } from './model-factory';

export interface ChainConfig {
  modelType?: 'local' | 'remote';
  remoteModel?: 'gpt4' | 'claude' | 'gemini';
  temperature?: number;
  maxTokens?: number;
}

export class LangChainChainsService {
  /**
   * Create a sequential chain for multi-step operations
   */
  async createSequentialChain(
    steps: Array<{ prompt: string; name: string }>,
    config: ChainConfig = {}
  ): Promise<any> {
    const model = this.createModel(config);

    const chains = steps.map((step) => {
      const prompt = ChatPromptTemplate.fromTemplate(step.prompt);
      return {
        name: step.name,
        chain: RunnableSequence.from([prompt, model]),
      };
    });

    // Execute chains sequentially
    const results: Record<string, any> = {};
    let previousOutput = '';

    for (const chainInfo of chains) {
      const output = await chainInfo.chain.invoke({
        ...results,
        previousOutput,
        input: previousOutput || '',
      });
      const content = typeof output.content === 'string' ? output.content : JSON.stringify(output.content);
      results[chainInfo.name] = content || String(output);
      previousOutput = content || String(output);
    }

    return results;
  }

  /**
   * Create a conditional chain (if-else logic)
   */
  async createConditionalChain(
    condition: string,
    trueBranch: string,
    falseBranch: string,
    context: Record<string, any>,
    config: ChainConfig = {}
  ): Promise<any> {
    const model = this.createModel(config);

    // Evaluate condition
    const conditionPrompt = ChatPromptTemplate.fromTemplate(
      `Evaluate this condition and respond with only "true" or "false":\n\nCondition: ${condition}\n\nContext: {context}\n\nResponse:`
    );

    const conditionChain = RunnableSequence.from([conditionPrompt, model]);
    const conditionResult = await conditionChain.invoke({
      context: JSON.stringify(context, null, 2),
    });

    const contentStr = typeof conditionResult.content === 'string' ? conditionResult.content : JSON.stringify(conditionResult.content);
    const isTrue = contentStr?.toLowerCase().trim() === 'true';

    // Execute appropriate branch
    const branchPrompt = isTrue ? trueBranch : falseBranch;
    const branchChain = RunnableSequence.from([
      ChatPromptTemplate.fromTemplate(branchPrompt),
      model,
    ]);

    const result = await branchChain.invoke(context);

    return {
      condition: condition,
      conditionResult: isTrue,
      branch: isTrue ? 'true' : 'false',
      result: result.content || result,
    };
  }

  /**
   * Create a parallel chain for concurrent operations
   */
  async createParallelChain(
    operations: Array<{ prompt: string; name: string }>,
    config: ChainConfig = {}
  ): Promise<Record<string, any>> {
    const model = this.createModel(config);

    // Execute all operations in parallel
    const promises = operations.map(async (op) => {
      const prompt = ChatPromptTemplate.fromTemplate(op.prompt);
      const chain = RunnableSequence.from([prompt, model]);
      const result = await chain.invoke({});
      return {
        name: op.name,
        result: typeof result.content === 'string' ? result.content : JSON.stringify(result.content) || String(result),
      };
    });

    const results = await Promise.all(promises);

    // Convert to object
    const resultObj: Record<string, any> = {};
    for (const r of results) {
      resultObj[r.name] = r.result;
    }

    return resultObj;
  }

  /**
   * Create a tool-calling chain with MCP tools
   */
  async createToolCallingChain(
    prompt: string,
    availableTools: string[],
    context: Record<string, any>,
    config: ChainConfig = {}
  ): Promise<any> {
    const model = this.createModel(config);

    // First, determine which tools to use
    const toolSelectionPrompt = ChatPromptTemplate.fromTemplate(
      `You have access to these tools: {tools}\n\nTask: {prompt}\n\nContext: {context}\n\nWhich tools should be used? Respond with a JSON array of tool names.`
    );

    const toolSelectionChain = RunnableSequence.from([toolSelectionPrompt, model]);
    const toolSelection = await toolSelectionChain.invoke({
      tools: availableTools.join(', '),
      prompt,
      context: JSON.stringify(context, null, 2),
    });

    // Parse tool selection (simplified - in production use structured output)
    let selectedTools: string[] = [];
    try {
      const contentStr = typeof toolSelection.content === 'string' ? toolSelection.content : JSON.stringify(toolSelection.content);
      const jsonMatch = contentStr?.match(/\[.*?\]/);
      if (jsonMatch) {
        selectedTools = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Fallback: use all available tools
      selectedTools = availableTools;
    }

    // Execute tools and get results
    const toolResults: Record<string, any> = {};
    for (const tool of selectedTools) {
      // Tool execution would happen via MCP
      toolResults[tool] = { executed: true, note: 'Tool execution via MCP' };
    }

    // Generate final response with tool results
    const finalPrompt = ChatPromptTemplate.fromTemplate(
      `Task: {prompt}\n\nTool Results: {toolResults}\n\nContext: {context}\n\nProvide the final answer:`
    );

    const finalChain = RunnableSequence.from([finalPrompt, model]);
    const finalResult = await finalChain.invoke({
      prompt,
      toolResults: JSON.stringify(toolResults, null, 2),
      context: JSON.stringify(context, null, 2),
    });

    return {
      toolsUsed: selectedTools,
      toolResults,
      finalAnswer: typeof finalResult.content === 'string' ? finalResult.content : JSON.stringify(finalResult.content) || String(finalResult),
    };
  }

  /**
   * Create a workflow chain (complex multi-step workflow)
   */
  async createWorkflowChain(
    workflowSteps: Array<{
      type: 'ai' | 'condition' | 'tool' | 'transform';
      prompt?: string;
      condition?: string;
      tool?: string;
      transform?: (input: any) => any;
    }>,
    initialContext: Record<string, any>,
    config: ChainConfig = {}
  ): Promise<any> {
    const model = this.createModel(config);
    const context = { ...initialContext };
    const results: any[] = [];

    for (const step of workflowSteps) {
      let stepResult: any;

      switch (step.type) {
        case 'ai':
          if (step.prompt) {
            const prompt = ChatPromptTemplate.fromTemplate(step.prompt);
            const chain = RunnableSequence.from([prompt, model]);
            const result = await chain.invoke(context);
            stepResult = typeof result.content === 'string' ? result.content : JSON.stringify(result.content) || String(result);
          }
          break;

        case 'condition':
          if (step.condition) {
            // Evaluate condition
            const conditionPrompt = ChatPromptTemplate.fromTemplate(
              `Evaluate: {condition}\n\nContext: {context}\n\nRespond with "true" or "false":`
            );
            const conditionChain = RunnableSequence.from([conditionPrompt, model]);
            const conditionResult = await conditionChain.invoke({
              condition: step.condition,
              context: JSON.stringify(context, null, 2),
            });
            const condContentStr = typeof conditionResult.content === 'string' ? conditionResult.content : JSON.stringify(conditionResult.content);
            stepResult = condContentStr?.toLowerCase().trim() === 'true';
          }
          break;

        case 'tool':
          // Tool execution would be handled by MCP
          stepResult = { tool: step.tool, executed: true };
          break;

        case 'transform':
          if (step.transform) {
            stepResult = step.transform(context);
          }
          break;
      }

      // Update context with step result
      context[`step_${results.length}`] = stepResult;
      results.push(stepResult);
    }

    return {
      results,
      finalContext: context,
    };
  }

  /**
   * Create model instance
   */
  private createModel(config: ChainConfig): BaseChatModel {
    const modelType = config.modelType || aiConfig.selection.defaultType;
    const provider = modelType === 'direct' ? 'openai' : 'openrouter';

    let modelName: string | undefined;
    if (provider === 'openrouter') {
      switch (config.remoteModel) {
        case 'gpt4':
          modelName = aiConfig.remote.models.gpt4;
          break;
        case 'gemini':
          modelName = aiConfig.remote.models.gemini;
          break;
        case 'claude':
        default:
          modelName = aiConfig.remote.models.claude;
          break;
      }
    }

    return ModelFactory.createModel(provider, {
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 2048,
      modelName: modelName,
    });
  }
}

export const langChainChainsService = new LangChainChainsService();

