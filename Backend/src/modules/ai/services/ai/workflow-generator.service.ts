import { langChainService } from './langchain.service';
import { WORKFLOW_GENERATION_PROMPT } from './prompts/workflow-generation.prompt';

export interface WorkflowGenerationRequest {
  description: string;
  modelType?: 'vllm' | 'openrouter' | 'local';
  remoteModel?: 'gpt4' | 'claude' | 'gemini';
}

export interface GeneratedWorkflow {
  name: string;
  description: string;
  triggers: any[];
  containers: any[];
  formFields: any[];
  triggerLogic?: any[];
  category?: string;
  tags?: string[];
}

export class WorkflowGeneratorService {
  /**
   * Generate workflow from natural language description
   */
  async generateWorkflow(request: WorkflowGenerationRequest): Promise<GeneratedWorkflow> {
    // Default to vLLM, will automatically fallback if not configured
    const modelType = request.modelType || 'vllm';
    const remoteModel = request.remoteModel || 'claude'; // Claude is best for structured output

    try {
      // Generate workflow using LangChain with prompt template
      const prompt = WORKFLOW_GENERATION_PROMPT.replace('{description}', request.description);

      const response = await langChainService.generateText(prompt, {
        modelType: modelType,
        remoteModel,
        temperature: 0.3, // Lower temperature for more consistent output
        maxTokens: 4000,
        useLangChain: true,
      });

      // Parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from model response');
      }

      const workflow = JSON.parse(jsonMatch[0]);

      // Validate and clean workflow structure
      return this.validateAndCleanWorkflow(workflow);
    } catch (error: any) {
      throw new Error(`Workflow generation failed: ${error.message}`);
    }
  }

  /**
   * Validate and clean generated workflow
   */
  private validateAndCleanWorkflow(workflow: any): GeneratedWorkflow {
    // Ensure required fields exist
    const cleaned: GeneratedWorkflow = {
      name: workflow.name || 'Generated Workflow',
      description: workflow.description || '',
      triggers: Array.isArray(workflow.triggers) ? workflow.triggers : [],
      containers: Array.isArray(workflow.containers) ? workflow.containers : [],
      formFields: Array.isArray(workflow.formFields) ? workflow.formFields : [],
    };

    // Optional fields
    if (workflow.triggerLogic) {
      cleaned.triggerLogic = Array.isArray(workflow.triggerLogic) ? workflow.triggerLogic : [];
    }

    if (workflow.category) {
      cleaned.category = workflow.category;
    }

    if (workflow.tags) {
      cleaned.tags = Array.isArray(workflow.tags) ? workflow.tags : [];
    }

    // Ensure containers have required fields
    cleaned.containers = cleaned.containers.map((container: any, index: number) => ({
      id: container.id || `node-${index}`,
      type: container.type || 'unknown',
      label: container.label || container.type || 'Node',
      config: container.config || {},
      ...container,
    }));

    return cleaned;
  }

  /**
   * Validate workflow structure
   */
  validateWorkflow(workflow: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!workflow.name) {
      errors.push('Workflow name is required');
    }

    if (!Array.isArray(workflow.containers)) {
      errors.push('Workflow containers must be an array');
    }

    if (workflow.containers && workflow.containers.length === 0) {
      errors.push('Workflow must have at least one container/node');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const workflowGeneratorService = new WorkflowGeneratorService();

