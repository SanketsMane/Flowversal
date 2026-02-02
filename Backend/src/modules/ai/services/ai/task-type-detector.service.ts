/**
 * Task Type Detector Service
 * Intelligently detects the type of AI task based on prompts, node config, and context
 */

import { AINodeConfig } from '../../../../services/nodes/ai-node-executor';

import { TaskType } from './model-decision.types';

export interface TaskDetectionResult {
  taskType: TaskType;
  confidence: number; // 0-1
  reasoning: string;
  detectedKeywords: string[];
  nodeType?: string;
  contextHints: string[];
}

/**
 * Keywords and patterns for task detection
 */
const TASK_PATTERNS = {
  structured_json: {
    keywords: [
      'json', 'schema', 'structured', 'format', 'parse', 'extract',
      'fields', 'properties', 'validation', 'serialize', 'deserialize'
    ],
    nodeHints: ['json', 'structured', 'schema', 'parse'],
    contextPatterns: [/return.*json/i, /structured.*output/i, /format.*as.*json/i],
  },

  code_generation: {
    keywords: [
      'code', 'function', 'class', 'script', 'programming', 'algorithm',
      'syntax', 'compile', 'debug', 'refactor', 'implement', 'api', 'endpoint'
    ],
    nodeHints: ['code', 'programming', 'api'],
    contextPatterns: [/write.*code/i, /implement.*function/i, /create.*api/i, /generate.*script/i],
  },

  creative_writing: {
    keywords: [
      'write', 'story', 'creative', 'content', 'copy', 'marketing', 'blog',
      'article', 'narrative', 'description', 'persuasive', 'engaging', 'storytelling'
    ],
    nodeHints: ['writing', 'content', 'creative', 'marketing'],
    contextPatterns: [/write.*story/i, /create.*content/i, /generate.*article/i, /write.*copy/i],
  },

  complex_reasoning: {
    keywords: [
      'analyze', 'reason', 'logic', 'step-by-step', 'evaluate', 'compare',
      'decide', 'strategy', 'planning', 'problem-solving', 'critical-thinking'
    ],
    nodeHints: ['reasoning', 'analysis', 'logic', 'planning'],
    contextPatterns: [/step.*step/i, /analyze.*and/i, /reason.*through/i, /evaluate.*options/i],
  },

  api_execution: {
    keywords: [
      'api', 'endpoint', 'request', 'call', 'integration', 'webhook',
      'http', 'rest', 'graphql', 'fetch', 'post', 'get', 'put', 'delete'
    ],
    nodeHints: ['api', 'http', 'webhook', 'integration'],
    contextPatterns: [/call.*api/i, /make.*request/i, /integrate.*with/i, /send.*to.*endpoint/i],
  },

  data_analysis: {
    keywords: [
      'analyze', 'data', 'statistics', 'insights', 'metrics', 'charts',
      'visualization', 'trends', 'patterns', 'correlation', 'dataset'
    ],
    nodeHints: ['data', 'analysis', 'statistics', 'metrics'],
    contextPatterns: [/analyze.*data/i, /find.*insights/i, /visualize.*data/i, /calculate.*statistics/i],
  },

  mathematical_reasoning: {
    keywords: [
      'calculate', 'math', 'equation', 'formula', 'computation', 'solve',
      'algebra', 'geometry', 'calculus', 'probability', 'statistics'
    ],
    nodeHints: ['math', 'calculation', 'computation'],
    contextPatterns: [/solve.*equation/i, /calculate.*value/i, /compute.*result/i, /mathematical.*problem/i],
  },

  conversational_chat: {
    keywords: [
      'chat', 'conversation', 'talk', 'discuss', 'dialogue', 'respond',
      'reply', 'converse', 'communicate', 'interaction'
    ],
    nodeHints: ['chat', 'conversation', 'dialogue'],
    contextPatterns: [/chat.*with/i, /converse.*about/i, /respond.*to/i, /continue.*conversation/i],
  },

  real_time_information: {
    keywords: [
      'current', 'latest', 'today', 'now', 'recent', 'breaking', 'news',
      'update', 'live', 'real-time', 'trending', 'what\'s happening'
    ],
    nodeHints: ['news', 'current', 'real-time'],
    contextPatterns: [/what.*happening/i, /latest.*news/i, /current.*events/i, /today.*update/i],
  },

  multimodal_tasks: {
    keywords: [
      'image', 'video', 'audio', 'visual', 'media', 'picture', 'photo',
      'diagram', 'chart', 'screenshot', 'file', 'upload', 'attachment'
    ],
    nodeHints: ['image', 'video', 'audio', 'multimodal'],
    contextPatterns: [/describe.*image/i, /analyze.*video/i, /process.*audio/i, /from.*file/i],
  },

  safety_critical: {
    keywords: [
      'safe', 'security', 'privacy', 'sensitive', 'confidential', 'compliance',
      'regulation', 'risk', 'safety', 'ethical', 'responsible', 'critical'
    ],
    nodeHints: ['security', 'safety', 'compliance'],
    contextPatterns: [/ensure.*safety/i, /comply.*with/i, /handle.*sensitive/i, /maintain.*privacy/i],
  },

  cost_optimized: {
    keywords: [
      'cheap', 'cost', 'budget', 'efficient', 'optimize', 'save', 'affordable',
      'economic', 'low-cost', 'budget-friendly', 'inexpensive'
    ],
    nodeHints: ['cost', 'budget', 'optimize'],
    contextPatterns: [/keep.*cost.*low/i, /budget.*constraint/i, /cost.*effective/i, /save.*money/i],
  },
};

/**
 * Task Type Detector Service
 */
export class TaskTypeDetectorService {
  /**
   * Detect task type from AI node configuration and context
   */
  detectTaskType(config: AINodeConfig, context?: any): TaskDetectionResult {
    const prompt = config.prompt || '';
    const systemPrompt = config.systemPrompt || '';
    const fullText = `${systemPrompt} ${prompt}`.toLowerCase();

    // Node type hints
    const nodeTypeHint = this.getNodeTypeHint(config);

    // Analyze different signals
    const keywordMatches = this.analyzeKeywords(fullText);
    const patternMatches = this.analyzePatterns(fullText);
    const nodeTypeMatches = this.analyzeNodeType(nodeTypeHint);
    const contextMatches = this.analyzeContext(context);

    // Combine all signals with weights
    const combinedScores = this.combineScores([
      { scores: keywordMatches, weight: 0.4 },
      { scores: patternMatches, weight: 0.3 },
      { scores: nodeTypeMatches, weight: 0.2 },
      { scores: contextMatches, weight: 0.1 },
    ]);

    // Find the highest scoring task type
    const bestMatch = Object.entries(combinedScores)
      .reduce((best, [taskType, score]) =>
        score > best.score ? { taskType: taskType as TaskType, score } : best,
        { taskType: 'cost_optimized' as TaskType, score: 0 }
      );

    // Collect detected keywords and reasoning
    const detectedKeywords = this.getDetectedKeywords(bestMatch.taskType, fullText);
    const reasoning = this.generateReasoning(bestMatch.taskType, bestMatch.score, detectedKeywords);

    return {
      taskType: bestMatch.taskType,
      confidence: Math.min(bestMatch.score, 1.0), // Cap at 1.0
      reasoning,
      detectedKeywords,
      nodeType: nodeTypeHint,
      contextHints: context ? this.extractContextHints(context) : [],
    };
  }

  /**
   * Get node type hint from configuration
   */
  private getNodeTypeHint(config: AINodeConfig): string {
    // Check node type from config
    if (config.modelType) return config.modelType;

    // Check for tool usage (indicates API execution)
    if (config.useTools || config.tools?.length) return 'tool-based';

    // Check for RAG (indicates information retrieval)
    if (config.rag?.enabled) return 'rag-enabled';

    return 'general';
  }

  /**
   * Analyze keywords in text
   */
  private analyzeKeywords(text: string): Record<TaskType, number> {
    const scores: Record<TaskType, number> = {} as Record<TaskType, number>;

    for (const [taskType, patterns] of Object.entries(TASK_PATTERNS)) {
      let score = 0;
      const keywords = patterns.keywords;

      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          score += matches.length * 0.1; // Each match adds 0.1 to score
        }
      }

      scores[taskType as TaskType] = Math.min(score, 1.0); // Cap at 1.0
    }

    return scores;
  }

  /**
   * Analyze regex patterns in text
   */
  private analyzePatterns(text: string): Record<TaskType, number> {
    const scores: Record<TaskType, number> = {} as Record<TaskType, number>;

    for (const [taskType, patterns] of Object.entries(TASK_PATTERNS)) {
      let score = 0;
      const contextPatterns = patterns.contextPatterns || [];

      for (const pattern of contextPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          score += 0.3; // Pattern match adds 0.3 to score
        }
      }

      scores[taskType as TaskType] = Math.min(score, 1.0);
    }

    return scores;
  }

  /**
   * Analyze node type hints
   */
  private analyzeNodeType(nodeType: string): Record<TaskType, number> {
    const scores: Record<TaskType, number> = {} as Record<TaskType, number>;

    // Initialize all scores to 0
    Object.keys(TASK_PATTERNS).forEach(taskType => {
      scores[taskType as TaskType] = 0;
    });

    // Add scores based on node type hints
    for (const [taskType, patterns] of Object.entries(TASK_PATTERNS)) {
      const nodeHints = patterns.nodeHints || [];
      for (const hint of nodeHints) {
        if (nodeType.toLowerCase().includes(hint)) {
          scores[taskType as TaskType] = 0.4; // Node type match adds 0.4
          break;
        }
      }
    }

    // Special handling for specific node types
    switch (nodeType) {
      case 'tool-based':
        scores.api_execution = Math.max(scores.api_execution, 0.5);
        break;
      case 'rag-enabled':
        scores.real_time_information = Math.max(scores.real_time_information, 0.3);
        scores.data_analysis = Math.max(scores.data_analysis, 0.3);
        break;
    }

    return scores;
  }

  /**
   * Analyze execution context
   */
  private analyzeContext(context?: any): Record<TaskType, number> {
    const scores: Record<TaskType, number> = {} as Record<TaskType, number>;

    // Initialize all scores to 0
    Object.keys(TASK_PATTERNS).forEach(taskType => {
      scores[taskType as TaskType] = 0;
    });

    if (!context) return scores;

    // Check for workflow patterns
    if (context.stepResults?.size > 5) {
      scores.complex_reasoning = Math.max(scores.complex_reasoning, 0.2);
    }

    // Check for variable usage (indicates structured processing)
    if (context.variables && Object.keys(context.variables).length > 3) {
      scores.structured_json = Math.max(scores.structured_json, 0.2);
      scores.data_analysis = Math.max(scores.data_analysis, 0.2);
    }

    // Check for loop counters (indicates iterative processing)
    if (context.loopCounters && Object.keys(context.loopCounters).length > 0) {
      scores.api_execution = Math.max(scores.api_execution, 0.3);
      scores.data_analysis = Math.max(scores.data_analysis, 0.2);
    }

    return scores;
  }

  /**
   * Combine scores from different analysis methods
   */
  private combineScores(
    scoreSets: Array<{ scores: Record<TaskType, number>; weight: number }>
  ): Record<TaskType, number> {
    const combined: Record<TaskType, number> = {} as Record<TaskType, number>;

    // Initialize combined scores
    Object.keys(TASK_PATTERNS).forEach(taskType => {
      combined[taskType as TaskType] = 0;
    });

    // Weight and combine scores
    for (const { scores, weight } of scoreSets) {
      for (const [taskType, score] of Object.entries(scores)) {
        combined[taskType as TaskType] += score * weight;
      }
    }

    return combined;
  }

  /**
   * Get detected keywords for a task type
   */
  private getDetectedKeywords(taskType: TaskType, text: string): string[] {
    const patterns = TASK_PATTERNS[taskType];
    const keywords: string[] = [];

    for (const keyword of patterns.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      if (regex.test(text)) {
        keywords.push(keyword);
      }
    }

    return keywords.slice(0, 5); // Limit to 5 keywords
  }

  /**
   * Extract context hints from execution context
   */
  private extractContextHints(context?: any): string[] {
    const hints: string[] = [];

    if (!context) return hints;

    if (context.stepResults?.size > 0) {
      hints.push(`${context.stepResults.size} previous steps`);
    }

    if (context.variables && Object.keys(context.variables).length > 0) {
      hints.push(`${Object.keys(context.variables).length} variables`);
    }

    if (context.loopCounters && Object.keys(context.loopCounters).length > 0) {
      hints.push('loop processing detected');
    }

    if (context.errors?.length > 0) {
      hints.push(`${context.errors.length} previous errors`);
    }

    return hints;
  }

  /**
   * Generate reasoning text for the detection result
   */
  private generateReasoning(taskType: TaskType, confidence: number, keywords: string[]): string {
    const confidencePercent = Math.round(confidence * 100);
    const keywordStr = keywords.length > 0 ? ` (keywords: ${keywords.join(', ')})` : '';

    let reasoning = `Detected ${taskType.replace('_', ' ')} task with ${confidencePercent}% confidence`;

    // Add task-specific reasoning
    switch (taskType) {
      case 'structured_json':
        reasoning += '. Best handled by OpenAI for precise JSON formatting.';
        break;
      case 'code_generation':
        reasoning += '. Deepseek provides excellent code generation capabilities.';
        break;
      case 'creative_writing':
        reasoning += '. Claude excels at creative and long-form content.';
        break;
      case 'complex_reasoning':
        reasoning += '. GPT-4 provides superior reasoning capabilities.';
        break;
      case 'api_execution':
        reasoning += '. Gemini offers cost-effective API interaction.';
        break;
      case 'safety_critical':
        reasoning += '. Claude provides enhanced safety and ethical reasoning.';
        break;
      case 'cost_optimized':
        reasoning += '. Using most cost-effective available provider.';
        break;
    }

    return reasoning + keywordStr;
  }
}

export const taskTypeDetector = new TaskTypeDetectorService();