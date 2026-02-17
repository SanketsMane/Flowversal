/**
 * Model Score Model
 * Stores confidence scores and performance metrics for AI model selection
 * Used for learning and optimization over time
 */

import mongoose, { Schema } from 'mongoose';
import { ModelDecision, TaskType } from '../services/ai/model-decision.types';

export interface IModelScore {
  // Execution context
  executionId: string;
  nodeId: string;
  workflowId?: string;
  userId?: string;

  // Model information
  provider: string;
  modelName: string;
  taskType: TaskType;

  // Performance metrics
  confidence: number; // 0-100 score
  decision: ModelDecision;
  responseTime: number; // in milliseconds
  tokenCount?: number;
  cost?: number;

  // Quality factors
  responseQuality: number; // 0-100
  tokenEfficiency: number; // 0-100
  errorRate: number; // 0-100

  // Configuration
  temperature: number;
  maxTokens?: number;

  // Routing information
  routingPath: string[]; // Which providers were tried
  fallbackCount: number; // How many fallbacks occurred

  // Context and metadata
  promptLength?: number;
  hasTools?: boolean;
  toolCount?: number;
  isRetry: boolean;

  // Results
  success: boolean;
  errorType?: string;
  userFeedback?: number; // 1-5 user satisfaction rating

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Model Score Schema
const ModelScoreSchema = new Schema({
  // Execution context
  executionId: { type: String, required: true },
  nodeId: { type: String, required: true },
  workflowId: { type: String },
  userId: { type: String },

  // Model information
  provider: {
    type: String,
    required: true,
    enum: ['vllm', 'openai', 'gemini', 'claude', 'grok', 'deepseek', 'openrouter'],
  },
  modelName: { type: String, required: true },
  taskType: {
    type: String,
    required: true,
    enum: [
      'structured_json',
      'code_generation',
      'creative_writing',
      'complex_reasoning',
      'api_execution',
      'data_analysis',
      'mathematical_reasoning',
      'conversational_chat',
      'real_time_information',
      'multimodal_tasks',
      'safety_critical',
      'cost_optimized',
    ],
  },

  // Performance metrics
  confidence: { type: Number, required: true, min: 0, max: 100 },
  decision: {
    type: String,
    required: true,
    enum: [
      'ACCEPT',
      'RETRY_VLLM',
      'FALLBACK_DIRECT',
      'FALLBACK_OPENROUTER',
      'FALLBACK_VLLM_TUNED',
      'FORCE_PREMIUM',
    ],
  },
  responseTime: { type: Number, required: true, min: 0 },
  tokenCount: { type: Number, min: 0 },
  cost: { type: Number, min: 0 },

  // Quality factors
  responseQuality: { type: Number, required: true, min: 0, max: 100 },
  tokenEfficiency: { type: Number, required: true, min: 0, max: 100 },
  errorRate: { type: Number, required: true, min: 0, max: 100 },

  // Configuration
  temperature: { type: Number, required: true, min: 0, max: 2 },
  maxTokens: { type: Number, min: 1 },

  // Routing information
  routingPath: [{
    type: String,
    enum: ['vllm', 'openai', 'gemini', 'claude', 'grok', 'deepseek', 'openrouter'],
  }],
  fallbackCount: { type: Number, default: 0, min: 0 },

  // Context and metadata
  promptLength: { type: Number, min: 0 },
  hasTools: { type: Boolean, default: false },
  toolCount: { type: Number, default: 0, min: 0 },
  isRetry: { type: Boolean, default: false },

  // Results
  success: { type: Boolean, required: true },
  errorType: {
    type: String,
    enum: ['network', 'rate_limit', 'auth', 'content_filter', 'server_error', 'timeout', 'other'],
  },
  userFeedback: { type: Number, min: 1, max: 5 },
}, {
  timestamps: true,
  collection: 'model_scores',
});

// Indexes for performance
ModelScoreSchema.index({ provider: 1, taskType: 1, confidence: -1 });
ModelScoreSchema.index({ userId: 1, createdAt: -1 });
ModelScoreSchema.index({ taskType: 1, confidence: -1, responseTime: 1 });
ModelScoreSchema.index({ decision: 1, createdAt: -1 });
ModelScoreSchema.index({ success: 1, provider: 1, taskType: 1 });


// Instance methods
ModelScoreSchema.methods = {
  // Calculate overall performance score
  calculatePerformanceScore(): number {
    const weights = {
      confidence: 0.4,
      responseQuality: 0.3,
      tokenEfficiency: 0.2,
      errorRate: 0.1,
    };

    const normalizedErrorRate = 100 - this.errorRate; // Invert error rate

    return (
      this.confidence * weights.confidence +
      this.responseQuality * weights.responseQuality +
      this.tokenEfficiency * weights.tokenEfficiency +
      normalizedErrorRate * weights.errorRate
    );
  },

  // Get routing efficiency (lower is better)
  getRoutingEfficiency(): number {
    return this.routingPath.length + this.fallbackCount;
  },
};

export const ModelScoreModel = mongoose.model<IModelScore>('ModelScore', ModelScoreSchema);

// Service class for managing model scores
export class ModelScoreService {
  /**
   * Record a model score
   */
  async recordScore(scoreData: Partial<IModelScore>): Promise<IModelScore> {
    const score = new ModelScoreModel({
      ...scoreData,
      success: scoreData.success ?? true,
      isRetry: scoreData.isRetry ?? false,
      fallbackCount: scoreData.routingPath?.length ? scoreData.routingPath.length - 1 : 0,
    });

    return score.save();
  }

  /**
   * Get analytics for model performance
   */
  async getAnalytics(options: {
    provider?: string;
    taskType?: TaskType;
    days?: number;
    limit?: number;
  } = {}) {
    const {
      provider,
      taskType,
      days = 30,
      limit = 10,
    } = options;

    return this.getAverageConfidence(provider, taskType, days);
  }

  /**
   * Get performance trends
   */
  async getTrends(provider: string, taskType: TaskType, days: number = 7) {
    return this.getPerformanceTrends(provider, taskType, days);
  }

  /**
   * Get average confidence by provider and task type
   */
  async getAverageConfidence(provider?: string, taskType?: TaskType, days: number = 30) {
    const matchConditions: any = {
      createdAt: {
        $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      },
    };

    if (provider) matchConditions.provider = provider;
    if (taskType) matchConditions.taskType = taskType;

    return ModelScoreModel.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: { provider: '$provider', taskType: '$taskType' },
          avgConfidence: { $avg: '$confidence' },
          avgResponseTime: { $avg: '$responseTime' },
          count: { $sum: 1 },
          successRate: {
            $avg: { $cond: ['$success', 1, 0] }
          },
        },
      },
      { $sort: { avgConfidence: -1 } },
      { $limit: 50 }, // Reasonable limit for analytics
    ]);
  }

  /**
   * Get performance trends over time
   */
  async getPerformanceTrends(provider: string, taskType: TaskType, days: number = 7) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return ModelScoreModel.aggregate([
      {
        $match: {
          provider,
          taskType,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
              },
            },
          },
          avgConfidence: { $avg: '$confidence' },
          avgResponseTime: { $avg: '$responseTime' },
          successRate: { $avg: { $cond: ['$success', 1, 0] } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);
  }

  /**
   * Get recommendations for task type
   */
  async getRecommendations(taskType: TaskType) {
    return ModelScoreModel.aggregate([
      { $match: { taskType, success: true } },
      {
        $group: {
          _id: '$provider',
          avgConfidence: { $avg: '$confidence' },
          avgResponseTime: { $avg: '$responseTime' },
          successRate: { $avg: 1 },
          count: { $sum: 1 },
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ['$avgConfidence', 0.5] },
              { $multiply: [{ $subtract: [1, { $divide: ['$avgResponseTime', 10000] }] }, 0.3] },
              { $multiply: ['$successRate', 0.2] },
            ],
          },
        },
      },
      { $sort: { score: -1 } },
      { $limit: 3 },
    ]);
  }

  /**
   * Get best performing providers for a task type
   */
  async getBestProvidersForTask(taskType: TaskType, limit: number = 5) {
    return ModelScoreModel.aggregate([
      { $match: { taskType, success: true } },
      {
        $group: {
          _id: '$provider',
          avgConfidence: { $avg: '$confidence' },
          avgResponseTime: { $avg: '$responseTime' },
          successRate: { $avg: 1 },
          count: { $sum: 1 },
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ['$avgConfidence', 0.5] },
              { $multiply: [{ $subtract: [1, { $divide: ['$avgResponseTime', 10000] }] }, 0.3] },
              { $multiply: ['$successRate', 0.2] },
            ],
          },
        },
      },
      { $sort: { score: -1 } },
      { $limit: limit },
    ]);
  }

  /**
   * Clean up old scores (keep last 90 days)
   */
  async cleanupOldScores(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const result = await ModelScoreModel.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    return result.deletedCount || 0;
  }
}

export const modelScoreService = new ModelScoreService();