import { langChainService } from '../../modules/ai/services/ai/langchain.service';
import { ExecutionContext } from '../../modules/workflows/services/workflow-execution.service';

export interface ConditionalNodeConfig {
  condition: string;
  trueAction?: string;
  falseAction?: string;
  modelType?: 'vllm' | 'openrouter' | 'local';
  remoteModel?: 'gpt4' | 'claude' | 'gemini';
  useAI?: boolean; // Use AI to evaluate condition, otherwise use simple JS evaluation
}

export class ConditionalNodeExecutor {
  /**
   * Execute conditional node
   */
  async executeConditionalNode(node: any, context: ExecutionContext): Promise<any> {
    const config: ConditionalNodeConfig = node.config || {};

    if (!config.condition) {
      throw new Error('Condition is required for conditional node');
    }

    const condition = this.resolveCondition(config.condition, context);
    let conditionResult: boolean;

    // Evaluate condition
    if (config.useAI) {
      // Use LangChain to evaluate complex conditions
      conditionResult = await this.evaluateConditionWithAI(condition, context, config);
    } else {
      // Simple JavaScript evaluation
      conditionResult = this.evaluateConditionSimple(condition, context);
    }

    // Execute appropriate branch
    if (conditionResult) {
      if (config.trueAction) {
        return await this.executeAction(config.trueAction, context, config);
      }
      return { condition: condition, result: true, branch: 'true' };
    } else {
      if (config.falseAction) {
        return await this.executeAction(config.falseAction, context, config);
      }
      return { condition: condition, result: false, branch: 'false' };
    }
  }

  /**
   * Evaluate condition using AI (LangChain)
   */
  private async evaluateConditionWithAI(
    condition: string,
    context: ExecutionContext,
    config: ConditionalNodeConfig
  ): Promise<boolean> {
    const evaluationPrompt = `Evaluate the following condition and respond with only "true" or "false":

Condition: ${condition}

Context Variables:
${JSON.stringify(context.variables, null, 2)}

Input Data:
${JSON.stringify(context.input, null, 2)}

Step Results:
${JSON.stringify(Object.fromEntries(context.stepResults), null, 2)}

Respond with only "true" or "false":`;

    try {
      const response = await langChainService.generateText(evaluationPrompt, {
        modelType: config.modelType || 'vllm',
        remoteModel: config.remoteModel || 'claude',
        temperature: 0.1, // Low temperature for deterministic evaluation
        maxTokens: 10,
        useLangChain: true,
      });

      const result = response.trim().toLowerCase();
      return result === 'true' || result.startsWith('true');
    } catch (error) {
      console.error('AI condition evaluation failed:', error);
      // Fallback to simple evaluation
      return this.evaluateConditionSimple(condition, context);
    }
  }

  /**
   * Evaluate condition using simple JavaScript
   */
  private evaluateConditionSimple(condition: string, context: ExecutionContext): boolean {
    try {
      // Create a safe evaluation context
      const evalContext = {
        ...context.variables,
        input: context.input,
        steps: Object.fromEntries(context.stepResults),
      };

      // Replace variable references in condition
      let evalCondition = condition;
      for (const [key, value] of Object.entries(evalContext)) {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        if (typeof value === 'string') {
          evalCondition = evalCondition.replace(regex, `"${value}"`);
        } else {
          evalCondition = evalCondition.replace(regex, JSON.stringify(value));
        }
      }

      // Evaluate condition (with safety checks)
      // Only allow simple comparisons and logical operators
      if (!/^[a-zA-Z0-9_\.\s\(\)"',<>=!&|]+$/.test(evalCondition)) {
        throw new Error('Invalid condition format');
      }

      // Use Function constructor for safer evaluation
      const result = new Function('return ' + evalCondition)();
      return Boolean(result);
    } catch (error) {
      console.error('Condition evaluation failed:', error);
      return false;
    }
  }

  /**
   * Execute action based on condition result
   */
  private async executeAction(
    action: string,
    context: ExecutionContext,
    config: ConditionalNodeConfig
  ): Promise<any> {
    // If action is a prompt, use AI to generate response
    if (action.startsWith('ai:') || action.startsWith('prompt:')) {
      const prompt = action.replace(/^(ai:|prompt:)\s*/, '');
      const resolvedPrompt = this.resolveCondition(prompt, context);

      return await langChainService.generateText(resolvedPrompt, {
        modelType: config.modelType || 'vllm',
        remoteModel: config.remoteModel || 'claude',
        useLangChain: true,
      });
    }

    // Otherwise, return action as result
    return { action: this.resolveCondition(action, context) };
  }

  /**
   * Resolve condition with context variables
   */
  private resolveCondition(condition: string, context: ExecutionContext): string {
    let resolved = condition;

    // Replace context variables
    for (const [key, value] of Object.entries(context.variables)) {
      resolved = resolved.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
      resolved = resolved.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), String(value));
    }

    // Replace step results
    for (const [stepId, result] of context.stepResults.entries()) {
      resolved = resolved.replace(new RegExp(`\\{\\{${stepId}\\}\\}`, 'g'), JSON.stringify(result));
      resolved = resolved.replace(new RegExp(`\\$\\{${stepId}\\}`, 'g'), JSON.stringify(result));
    }

    // Replace input variables
    for (const [key, value] of Object.entries(context.input)) {
      resolved = resolved.replace(new RegExp(`\\{\\{input\\.${key}\\}\\}`, 'g'), String(value));
      resolved = resolved.replace(new RegExp(`\\$\\{input\\.${key}\\}`, 'g'), String(value));
    }

    return resolved;
  }
}

export const conditionalNodeExecutor = new ConditionalNodeExecutor();

