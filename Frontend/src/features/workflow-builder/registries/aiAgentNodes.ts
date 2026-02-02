/**
 * AI Agent Node Definitions
 * LangChain-powered intelligent nodes for workflow automation
 */

import { Brain, MessageSquare, Search, Sparkles, Zap, Database, FileSearch, Bot } from 'lucide-react';
import { NodeDefinition } from './nodeRegistry';

/**
 * AI Chat Agent Node
 * Enables conversational AI within workflows
 */
export const aiChatAgentNode: NodeDefinition = {
  type: 'ai-chat-agent',
  label: 'AI Chat Agent',
  icon: MessageSquare,
  category: 'ai-agents',
  description: 'Conversational AI agent that can understand context and respond intelligently',
  color: '#00C6FF',
  tags: ['ai', 'chat', 'langchain', 'conversation'],
  supportsTools: true,
  defaultConfig: {
    model: 'ChatGPT Model',
    systemPrompt: 'You are a helpful AI assistant in a workflow automation system.',
    temperature: 0.7,
    maxTokens: 2000,
    memory: true,
    tools: []
  },
  inputs: [
    {
      id: 'message',
      label: 'Message',
      type: 'string',
      required: true,
      description: 'The message to send to the AI agent'
    },
    {
      id: 'context',
      label: 'Context',
      type: 'string',
      required: false,
      description: 'Additional context for the conversation'
    },
    {
      id: 'conversationId',
      label: 'Conversation ID',
      type: 'string',
      required: false,
      description: 'ID to maintain conversation history'
    }
  ],
  outputs: [
    {
      id: 'response',
      label: 'AI Response',
      type: 'string',
      description: 'The AI-generated response'
    },
    {
      id: 'conversationId',
      label: 'Conversation ID',
      type: 'string',
      description: 'ID for tracking the conversation'
    },
    {
      id: 'usage',
      label: 'Token Usage',
      type: 'object',
      description: 'API usage statistics'
    }
  ]
};

/**
 * Workflow Generator Node
 * Generates workflow configurations from natural language
 */
export const workflowGeneratorNode: NodeDefinition = {
  type: 'workflow-generator',
  label: 'Workflow Generator',
  icon: Zap,
  category: 'ai-agents',
  description: 'Generate complete workflow configurations from natural language descriptions',
  color: '#9D50BB',
  tags: ['ai', 'workflow', 'generation', 'automation'],
  defaultConfig: {
    model: 'ChatGPT Model',
    autoCreate: false,
    validate: true
  },
  inputs: [
    {
      id: 'description',
      label: 'Workflow Description',
      type: 'string',
      required: true,
      description: 'Natural language description of the workflow'
    },
    {
      id: 'requirements',
      label: 'Requirements',
      type: 'string',
      required: false,
      description: 'Specific requirements or constraints'
    }
  ],
  outputs: [
    {
      id: 'workflow',
      label: 'Generated Workflow',
      type: 'object',
      description: 'Complete workflow configuration'
    },
    {
      id: 'name',
      label: 'Workflow Name',
      type: 'string',
      description: 'Generated workflow name'
    },
    {
      id: 'nodes',
      label: 'Node Count',
      type: 'number',
      description: 'Number of nodes in the workflow'
    }
  ]
};

/**
 * AI Agent Executor Node
 * Executes AI agents with reasoning and tool usage
 */
export const aiAgentExecutorNode: NodeDefinition = {
  type: 'ai-agent-executor',
  label: 'AI Agent Executor',
  icon: Brain,
  category: 'ai-agents',
  description: 'Execute AI agents that can reason, plan, and use tools to accomplish tasks',
  color: '#0072FF',
  tags: ['ai', 'agent', 'reasoning', 'tools'],
  supportsTools: true,
  defaultConfig: {
    model: 'ChatGPT Model',
    tools: ['search', 'calculate', 'analyze'],
    maxSteps: 5,
    showReasoning: true
  },
  inputs: [
    {
      id: 'task',
      label: 'Task',
      type: 'string',
      required: true,
      description: 'The task for the AI agent to accomplish'
    },
    {
      id: 'context',
      label: 'Context',
      type: 'string',
      required: false,
      description: 'Additional context or data'
    },
    {
      id: 'tools',
      label: 'Available Tools',
      type: 'array',
      required: false,
      description: 'Tools the agent can use'
    }
  ],
  outputs: [
    {
      id: 'result',
      label: 'Result',
      type: 'string',
      description: 'The final result from the agent'
    },
    {
      id: 'reasoning',
      label: 'Reasoning',
      type: 'string',
      description: 'The agent\'s thought process'
    },
    {
      id: 'steps',
      label: 'Steps Taken',
      type: 'array',
      description: 'List of steps the agent executed'
    },
    {
      id: 'toolsUsed',
      label: 'Tools Used',
      type: 'array',
      description: 'List of tools the agent used'
    }
  ]
};

/**
 * RAG Search Node
 * Retrieval-Augmented Generation for intelligent search
 */
export const ragSearchNode: NodeDefinition = {
  type: 'rag-search',
  label: 'RAG Search',
  icon: Search,
  category: 'ai-agents',
  description: 'Intelligent search using Retrieval-Augmented Generation',
  color: '#00D9FF',
  tags: ['ai', 'rag', 'search', 'retrieval'],
  defaultConfig: {
    collection: 'workflows',
    limit: 5,
    minRelevance: 0.7,
    includeEmbeddings: false
  },
  inputs: [
    {
      id: 'query',
      label: 'Search Query',
      type: 'string',
      required: true,
      description: 'The search query'
    },
    {
      id: 'collection',
      label: 'Collection',
      type: 'string',
      required: false,
      description: 'The collection to search in'
    },
    {
      id: 'limit',
      label: 'Result Limit',
      type: 'number',
      required: false,
      description: 'Maximum number of results'
    }
  ],
  outputs: [
    {
      id: 'results',
      label: 'Search Results',
      type: 'array',
      description: 'Array of search results'
    },
    {
      id: 'count',
      label: 'Result Count',
      type: 'number',
      description: 'Number of results found'
    },
    {
      id: 'topResult',
      label: 'Top Result',
      type: 'object',
      description: 'The most relevant result'
    }
  ]
};

/**
 * Semantic Analyzer Node
 * Analyzes text for sentiment, entities, intent, etc.
 */
export const semanticAnalyzerNode: NodeDefinition = {
  type: 'semantic-analyzer',
  label: 'Semantic Analyzer',
  icon: FileSearch,
  category: 'ai-agents',
  description: 'Analyze text for sentiment, entities, intent, and more',
  color: '#7C3AED',
  tags: ['ai', 'nlp', 'sentiment', 'analysis'],
  defaultConfig: {
    analysisType: 'all',
    language: 'en',
    includeEntities: true,
    includeSentiment: true
  },
  inputs: [
    {
      id: 'text',
      label: 'Text to Analyze',
      type: 'string',
      required: true,
      description: 'The text to analyze'
    },
    {
      id: 'analysisType',
      label: 'Analysis Type',
      type: 'string',
      required: false,
      description: 'Type of analysis (sentiment, entities, intent, all)'
    }
  ],
  outputs: [
    {
      id: 'sentiment',
      label: 'Sentiment',
      type: 'string',
      description: 'Sentiment analysis result (positive/negative/neutral)'
    },
    {
      id: 'sentimentScore',
      label: 'Sentiment Score',
      type: 'number',
      description: 'Sentiment score (-1 to 1)'
    },
    {
      id: 'intent',
      label: 'Intent',
      type: 'string',
      description: 'Detected intent or purpose'
    },
    {
      id: 'entities',
      label: 'Entities',
      type: 'array',
      description: 'Extracted entities'
    },
    {
      id: 'keywords',
      label: 'Keywords',
      type: 'array',
      description: 'Key words and phrases'
    },
    {
      id: 'summary',
      label: 'Summary',
      type: 'string',
      description: 'Brief summary of the text'
    },
    {
      id: 'actionItems',
      label: 'Action Items',
      type: 'array',
      description: 'Extracted action items'
    }
  ]
};

/**
 * AI Decision Maker Node
 * Makes intelligent decisions based on data and context
 */
export const aiDecisionMakerNode: NodeDefinition = {
  type: 'ai-decision-maker',
  label: 'AI Decision Maker',
  icon: Bot,
  category: 'ai-agents',
  description: 'AI-powered decision making for workflow routing',
  color: '#F59E0B',
  tags: ['ai', 'decision', 'routing', 'logic'],
  isConditional: true,
  defaultConfig: {
    model: 'ChatGPT Model',
    decisionCriteria: '',
    outputFormat: 'string',
    confidence: 0.8
  },
  inputs: [
    {
      id: 'data',
      label: 'Input Data',
      type: 'object',
      required: true,
      description: 'Data to make a decision about'
    },
    {
      id: 'criteria',
      label: 'Decision Criteria',
      type: 'string',
      required: false,
      description: 'Criteria for making the decision'
    },
    {
      id: 'options',
      label: 'Available Options',
      type: 'array',
      required: false,
      description: 'List of possible decisions/paths'
    }
  ],
  outputs: [
    {
      id: 'decision',
      label: 'Decision',
      type: 'string',
      description: 'The AI-made decision'
    },
    {
      id: 'confidence',
      label: 'Confidence',
      type: 'number',
      description: 'Confidence score (0-1)'
    },
    {
      id: 'reasoning',
      label: 'Reasoning',
      type: 'string',
      description: 'Explanation of the decision'
    },
    {
      id: 'alternatives',
      label: 'Alternative Options',
      type: 'array',
      description: 'Other considered options'
    }
  ]
};

/**
 * Smart Data Transformer Node
 * AI-powered data transformation and formatting
 */
export const smartDataTransformerNode: NodeDefinition = {
  type: 'smart-data-transformer',
  label: 'Smart Data Transformer',
  icon: Sparkles,
  category: 'ai-agents',
  description: 'Transform data intelligently using AI',
  color: '#10B981',
  tags: ['ai', 'data', 'transform', 'format'],
  defaultConfig: {
    model: 'ChatGPT Model',
    outputFormat: 'json',
    preserveStructure: true
  },
  inputs: [
    {
      id: 'inputData',
      label: 'Input Data',
      type: 'any',
      required: true,
      description: 'Data to transform'
    },
    {
      id: 'transformation',
      label: 'Transformation Instructions',
      type: 'string',
      required: true,
      description: 'How to transform the data (natural language)'
    },
    {
      id: 'outputFormat',
      label: 'Output Format',
      type: 'string',
      required: false,
      description: 'Desired output format'
    }
  ],
  outputs: [
    {
      id: 'transformedData',
      label: 'Transformed Data',
      type: 'any',
      description: 'The transformed data'
    },
    {
      id: 'summary',
      label: 'Transformation Summary',
      type: 'string',
      description: 'Summary of what was transformed'
    }
  ]
};

// Export all AI agent nodes
export const aiAgentNodes: NodeDefinition[] = [
  aiChatAgentNode,
  workflowGeneratorNode,
  aiAgentExecutorNode,
  ragSearchNode,
  semanticAnalyzerNode,
  aiDecisionMakerNode,
  smartDataTransformerNode
];
