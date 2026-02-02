/**
 * Model Decision Types
 * Centralized type definitions for the intelligent model selection system
 * Defines decision enums, interfaces, and data structures for AI model routing
 */

// TaskType defined here to avoid circular imports
export type TaskType =
  | 'structured_json'
  | 'code_generation'
  | 'creative_writing'
  | 'complex_reasoning'
  | 'api_execution'
  | 'data_analysis'
  | 'mathematical_reasoning'
  | 'conversational_chat'
  | 'real_time_information'
  | 'multimodal_tasks'
  | 'safety_critical'
  | 'cost_optimized';

/**
 * Model Decision Enum
 * Defines the possible actions the scoring system can take based on confidence levels
 */
export type ModelDecision =
  | 'ACCEPT'                    // ≥60 confidence: Accept the response as-is
  | 'RETRY_VLLM'               // 50-60 confidence: Retry vLLM with adjusted temperature
  | 'FALLBACK_DIRECT'          // 40-50 confidence: Try direct API providers
  | 'FALLBACK_OPENROUTER'      // <50 confidence: Fallback to OpenRouter
  | 'FALLBACK_VLLM_TUNED'      // <50 confidence: Final fallback to vLLM with heavy tuning
  | 'FORCE_PREMIUM';           // <40 confidence: Force premium models (Claude/GPT-4)

/**
 * Direct API Provider Types
 * Supported direct API providers for model routing
 */
export type DirectApiProvider = 'openai' | 'gemini' | 'claude' | 'grok' | 'deepseek';

/**
 * Model Provider Types
 * All supported model provider types including direct APIs
 */
export type ModelProvider = 'vllm' | 'openrouter' | DirectApiProvider;

/**
 * Score Factor Interface
 * Represents individual scoring components that contribute to final confidence
 */
export interface ScoreFactor {
  name: string;           // Factor name (e.g., 'response_quality', 'response_time')
  score: number;          // 0-100 score for this factor
  weight: number;         // 0-1 weight in final calculation
  reasoning: string;      // Explanation of this factor's score
}

/**
 * Model Score Result Interface
 * Complete result from the model scoring system
 */
export interface ModelScoreResult {
  score: number;                    // 0-100 overall confidence score
  decision: ModelDecision;          // Recommended action based on score
  reasoning: string;                // Detailed explanation of the decision
  factors: ScoreFactor[];           // Individual scoring factors
  recommendations: string[];        // Suggestions for improvement
}

/**
 * Response Evaluation Interface
 * Input data for evaluating a model response
 */
export interface ResponseEvaluation {
  response: string;                 // The actual model response
  taskType: TaskType;               // Detected task type
  provider: string;                 // Which provider was used
  temperature: number;              // Temperature setting used
  responseTime: number;             // Response time in milliseconds
  tokenCount?: number;              // Number of tokens used
  errorCount?: number;              // Number of errors encountered
}

/**
 * Model Routing Options Interface
 * Configuration options for the intelligent model router
 */
export interface ModelRoutingOptions {
  taskType?: TaskType;                    // Override detected task type
  userSpecifiedTemperature?: number;      // User-specified temperature
  userTier?: 'free' | 'standard' | 'premium' | 'enterprise';
  forceProvider?: ModelProvider;          // Force specific provider
  enableScoring?: boolean;               // Enable confidence scoring
  maxRetries?: number;                   // Maximum retry attempts
  timeout?: number;                      // Request timeout in milliseconds
}

/**
 * Model Routing Result Interface
 * Complete result from the model routing system
 */
export interface ModelRoutingResult {
  model: any;                           // The selected LangChain model instance
  provider: string;                    // Which provider was selected
  temperature: number;                 // Optimal temperature for the task
  taskType: TaskType;                  // Final task type used for routing
  confidence: number;                  // Confidence in the selection (0-100)
  routingPath: string[];               // Path of providers tried
  scoreResult?: ModelScoreResult;      // Detailed scoring if available
  temperatureRecommendation: {
    recommendedTemperature: number;
    reasoning: string;
    confidence: number;
    alternatives: number[];
  };
}

/**
 * Task Type Mapping Interface
 * Defines how task types map to preferred providers
 */
export interface TaskTypeMapping {
  taskType: TaskType;
  primaryProvider: DirectApiProvider;
  secondaryProviders: DirectApiProvider[];
  reasoning: string;
  optimalTemperature: number;
  requiredCapabilities: string[];
}

/**
 * Direct API Configuration Interface
 * Configuration for direct API provider connections
 */
export interface DirectApiConfig {
  enabled: boolean;
  apiKey: string;
  baseUrl: string;
  models: Record<string, string>;
  capabilities: {
    jsonMode: boolean;
    functionCalling: boolean;
    vision: boolean;
    streaming: boolean;
    maxTokens: number;
    costPerToken: number;
  };
  specialties: string[];
}

/**
 * Temperature Recommendation Interface
 * Result from the temperature mapping service
 */
export interface TemperatureRecommendation {
  recommendedTemperature: number;
  reasoning: string;
  confidence: number;        // How confident we are in this recommendation
  alternatives: number[];    // Alternative temperatures to try
}

/**
 * Temperature Configuration Interface
 * Configuration for temperature optimization per task type
 */
export interface TemperatureConfig {
  baseTemperature: number;
  minTemperature: number;
  maxTemperature: number;
  retryAdjustment: number;
  providerAdjustments: Record<string, number>;
}

/**
 * Agent Configuration Interface
 * Configuration for AI agent creation and execution
 */
export interface AgentConfig {
  modelType?: ModelProvider;
  remoteModel?: 'gpt4' | 'claude' | 'gemini';
  temperature?: number;
  maxTokens?: number;
  tools?: string[];
  systemPrompt?: string;
  agentId?: string;
  executionId?: string;
  userId?: string;
  nodeId?: string;
  trackReasoning?: boolean;
  customModel?: any; // LangChain model instance
}

/**
 * Workflow Execution Context Interface
 * Context information for workflow execution
 */
export interface WorkflowExecutionContext {
  workflowId: string;
  executionId: string;
  userId: string;
  nodeResults: Map<string, any>;
  variables: Record<string, any>;
  input: Record<string, any>;
  steps: Array<{
    stepId: string;
    stepName: string;
    stepType: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startedAt?: Date;
    completedAt?: Date;
    duration?: number;
    input?: any;
    output?: any;
    error?: string;
  }>;
}

/**
 * Performance Metrics Interface
 * Metrics collected for model performance analysis
 */
export interface PerformanceMetrics {
  responseTime: number;
  tokenCount: number;
  cost: number;
  success: boolean;
  errorType?: string;
  confidence: number;
  temperature: number;
  provider: string;
  taskType: TaskType;
}

/**
 * Analytics Query Options Interface
 * Options for querying performance analytics
 */
export interface AnalyticsQueryOptions {
  provider?: string;
  taskType?: TaskType;
  days?: number;
  limit?: number;
  minConfidence?: number;
  maxResponseTime?: number;
}

/**
 * Routing Statistics Interface
 * Statistics about model routing performance
 */
export interface RoutingStatistics {
  availableProviders: string[];
  taskTypeMappings: Record<TaskType, string[]>;
  successRates: Record<string, number>;
  averageConfidence: Record<string, number>;
  averageResponseTime: Record<string, number>;
  totalRequests: number;
  totalFallbacks: number;
}

/**
 * Model Factory Options Interface
 * Options for model creation in the factory
 */
export interface ModelFactoryOptions {
  temperature?: number;
  maxTokens?: number;
  modelName?: string;
}

/**
 * LangChain Options Interface
 * Options for LangChain service calls
 */
export interface LangChainOptions {
  modelType?: ModelProvider;
  remoteModel?: 'gpt4' | 'claude' | 'gemini';
  temperature?: number;
  maxTokens?: number;
  useLangChain?: boolean;
  enableAccuracyCheck?: boolean;
  accuracyThreshold?: number;
  customModel?: any; // LangChain model instance
}

/**
 * Chat Message Interface
 * Standard chat message format
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Model Accuracy Result Interface
 * Result from model accuracy evaluation
 */
export interface ModelAccuracyResult {
  model: string;
  accuracy: number;
  response: string;
  processingTime: number;
}