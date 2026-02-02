/**
 * AI Agent Executor Component
 * Handles execution of AI agent nodes during workflow runs
 */

import { buildApiUrl } from '../../../../core/api/api.config';

export interface AIAgentExecutionContext {
  nodeType: string;
  config: Record<string, any>;
  inputs: Record<string, any>;
  accessToken: string;
}

export class AIAgentExecutor {
  /**
   * Execute an AI agent node
   */
  static async execute(context: AIAgentExecutionContext): Promise<any> {
    const { nodeType, config, inputs, accessToken } = context;

    switch (nodeType) {
      case 'ai-chat-agent':
        return await this.executeChat(config, inputs, accessToken);
      
      case 'workflow-generator':
        return await this.executeWorkflowGenerator(config, inputs, accessToken);
      
      case 'ai-agent-executor':
        return await this.executeAgent(config, inputs, accessToken);
      
      case 'rag-search':
        return await this.executeRAGSearch(config, inputs, accessToken);
      
      case 'semantic-analyzer':
        return await this.executeSemanticAnalyzer(config, inputs, accessToken);
      
      case 'ai-decision-maker':
        return await this.executeDecisionMaker(config, inputs, accessToken);
      
      case 'smart-data-transformer':
        return await this.executeDataTransformer(config, inputs, accessToken);
      
      default:
        throw new Error(`Unknown AI agent node type: ${nodeType}`);
    }
  }

  /**
   * Execute AI Chat Agent
   */
  private static async executeChat(
    config: Record<string, any>,
    inputs: Record<string, any>,
    accessToken: string
  ): Promise<any> {
    const response = await fetch(
      buildApiUrl('/ai/chat'),
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputs.message || '',
          model: config.model || 'ChatGPT Model',
          conversationId: inputs.conversationId,
          context: inputs.context || config.systemPrompt
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to execute AI chat agent');
    }

    const data = await response.json();
    
    return {
      response: data.response,
      conversationId: data.conversationId,
      usage: data.usage
    };
  }

  /**
   * Execute Workflow Generator
   */
  private static async executeWorkflowGenerator(
    config: Record<string, any>,
    inputs: Record<string, any>,
    accessToken: string
  ): Promise<any> {
    const response = await fetch(
      buildApiUrl('/ai/generate-workflow'),
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: inputs.description || '',
          model: config.model || 'ChatGPT Model'
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate workflow');
    }

    const data = await response.json();
    
    return {
      workflow: data.workflow,
      name: data.workflow?.name,
      nodes: data.workflow?.nodes?.length || 0
    };
  }

  /**
   * Execute AI Agent
   */
  private static async executeAgent(
    config: Record<string, any>,
    inputs: Record<string, any>,
    accessToken: string
  ): Promise<any> {
    const response = await fetch(
      buildApiUrl('/ai/mcp/execute'),
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          task: inputs.task || '',
          tools: inputs.tools || config.tools || [],
          context: inputs.context || '',
          model: config.model || 'ChatGPT Model'
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to execute AI agent');
    }

    const data = await response.json();
    
    return {
      result: data.result?.result,
      reasoning: data.result?.reasoning,
      steps: data.result?.steps,
      toolsUsed: data.result?.toolsUsed
    };
  }

  /**
   * Execute RAG Search
   */
  private static async executeRAGSearch(
    config: Record<string, any>,
    inputs: Record<string, any>,
    accessToken: string
  ): Promise<any> {
    const response = await fetch(
      buildApiUrl('/ai/search'),
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: inputs.query || '',
          collection: inputs.collection || config.collection || 'workflows',
          limit: inputs.limit || config.limit || 5
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to execute RAG search');
    }

    const data = await response.json();
    
    return {
      results: data.results,
      count: data.count,
      topResult: data.results?.[0] || null
    };
  }

  /**
   * Execute Semantic Analyzer
   */
  private static async executeSemanticAnalyzer(
    config: Record<string, any>,
    inputs: Record<string, any>,
    accessToken: string
  ): Promise<any> {
    const response = await fetch(
      buildApiUrl('/ai/analyze'),
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: inputs.text || '',
          analysisType: inputs.analysisType || config.analysisType || 'all'
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze text');
    }

    const data = await response.json();
    
    return {
      sentiment: data.analysis?.sentiment,
      sentimentScore: data.analysis?.sentimentScore,
      intent: data.analysis?.intent,
      entities: data.analysis?.entities,
      keywords: data.analysis?.keywords,
      summary: data.analysis?.summary,
      actionItems: data.analysis?.actionItems
    };
  }

  /**
   * Execute AI Decision Maker
   */
  private static async executeDecisionMaker(
    config: Record<string, any>,
    inputs: Record<string, any>,
    accessToken: string
  ): Promise<any> {
    // Use the chat endpoint with a decision-making prompt
    const decisionPrompt = `You are a decision-making AI. Based on the following data and criteria, make a decision.

Data: ${JSON.stringify(inputs.data)}
Criteria: ${inputs.criteria || config.decisionCriteria || 'Make the best decision'}
Available Options: ${JSON.stringify(inputs.options || ['yes', 'no'])}

Return a JSON object with:
{
  "decision": "your decision",
  "confidence": 0.0-1.0,
  "reasoning": "explanation",
  "alternatives": ["other options considered"]
}`;

    const response = await fetch(
      buildApiUrl('/ai/chat'),
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: decisionPrompt,
          model: config.model || 'ChatGPT Model'
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to make decision');
    }

    const data = await response.json();
    
    try {
      const decision = JSON.parse(data.response);
      return decision;
    } catch {
      // If parsing fails, return the raw response
      return {
        decision: data.response,
        confidence: 0.5,
        reasoning: 'Decision made based on AI analysis',
        alternatives: []
      };
    }
  }

  /**
   * Execute Smart Data Transformer
   */
  private static async executeDataTransformer(
    config: Record<string, any>,
    inputs: Record<string, any>,
    accessToken: string
  ): Promise<any> {
    const transformPrompt = `Transform the following data according to the instructions.

Input Data: ${JSON.stringify(inputs.inputData)}
Transformation Instructions: ${inputs.transformation || 'Convert to a readable format'}
Output Format: ${inputs.outputFormat || config.outputFormat || 'json'}

Return the transformed data in the requested format.`;

    const response = await fetch(
      buildApiUrl('/ai/chat'),
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: transformPrompt,
          model: config.model || 'ChatGPT Model'
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to transform data');
    }

    const data = await response.json();
    
    return {
      transformedData: data.response,
      summary: `Data transformed to ${inputs.outputFormat || config.outputFormat || 'json'} format`
    };
  }
}

/**
 * Helper function to execute AI agent nodes in workflows
 */
export async function executeAIAgentNode(
  nodeType: string,
  config: Record<string, any>,
  inputs: Record<string, any>,
  accessToken: string
): Promise<any> {
  return AIAgentExecutor.execute({
    nodeType,
    config,
    inputs,
    accessToken
  });
}
