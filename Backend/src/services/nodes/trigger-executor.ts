import { langChainService } from '../../modules/ai/services/ai/langchain.service';
import { ExecutionContext } from '../../modules/workflows/services/workflow-execution.service';

export interface TriggerConfig {
  type: string;
  condition?: string;
  prompt?: string;
  modelType?: 'vllm' | 'openrouter' | 'local';
  remoteModel?: 'gpt4' | 'claude' | 'gemini';
  [key: string]: any;
}

export class TriggerExecutor {
  /**
   * Execute trigger and check if it should fire
   */
  async executeTrigger(trigger: any, context: ExecutionContext): Promise<boolean> {
    const config: TriggerConfig = trigger.config || {};
    const triggerType = trigger.type || config.type || 'manual';

    switch (triggerType) {
      case 'manual':
        return true; // Manual triggers always fire
      case 'ai-condition':
        return await this.executeAIConditionTrigger(trigger, context);
      case 'form-submit':
        return await this.executeFormSubmitTrigger(trigger, context);
      case 'webhook':
        return await this.executeWebhookTrigger(trigger, context);
      case 'scheduled':
        return await this.executeScheduledTrigger(trigger, context);
      default:
        console.warn(`Unknown trigger type: ${triggerType}`);
        return false;
    }
  }

  /**
   * Execute AI condition trigger (uses LangChain to evaluate condition)
   */
  private async executeAIConditionTrigger(trigger: any, context: ExecutionContext): Promise<boolean> {
    const config: TriggerConfig = trigger.config || {};
    const condition = this.resolveCondition(config.condition || '', context);

    if (!condition) {
      return false;
    }

    // Use LangChain to evaluate condition
    const evaluationPrompt = `Evaluate the following condition and respond with only "true" or "false":

Condition: ${condition}

Context:
${JSON.stringify(context.variables, null, 2)}

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
      return false;
    }
  }

  /**
   * Execute form submit trigger
   */
  private async executeFormSubmitTrigger(_trigger: any, context: ExecutionContext): Promise<boolean> {
    // Form submit triggers fire when form data is present in input
    return context.input && Object.keys(context.input).length > 0;
  }

  /**
   * Execute webhook trigger
   */
  private async executeWebhookTrigger(_trigger: any, context: ExecutionContext): Promise<boolean> {
    // Webhook triggers fire when triggerData is present
    return !!(context.execution.triggerData && Object.keys(context.execution.triggerData).length > 0);
  }

  /**
   * Execute scheduled trigger
   */
  private async executeScheduledTrigger(_trigger: any, context: ExecutionContext): Promise<boolean> {
    // Scheduled triggers are handled by external scheduler (e.g., Inngest)
    // This just checks if it's a scheduled trigger type
    return context.execution.triggeredBy === 'scheduled';
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

    // Replace input variables
    for (const [key, value] of Object.entries(context.input)) {
      resolved = resolved.replace(new RegExp(`\\{\\{input\\.${key}\\}\\}`, 'g'), String(value));
      resolved = resolved.replace(new RegExp(`\\$\\{input\\.${key}\\}`, 'g'), String(value));
    }

    return resolved;
  }
}

export const triggerExecutor = new TriggerExecutor();

