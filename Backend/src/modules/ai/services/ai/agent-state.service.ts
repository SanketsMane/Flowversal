import { Document, Model, model, Schema } from 'mongoose';
import { logger } from '../../../../shared/utils/logger.util';
import { broadcastAgentEvent } from '../../../workflows/routes/workflow-websocket.routes';

export interface Thought {
  id: string;
  content: string;
  timestamp: Date;
  confidence?: number;
  reasoning?: string;
}

export interface ToolCall {
  id: string;
  toolName: string;
  arguments: Record<string, any>;
  result?: any;
  timestamp: Date;
  duration?: number;
  success: boolean;
  error?: string;
}

export interface Decision {
  id: string;
  decisionPoint: string;
  options: Array<{ label: string; value: any; score?: number }>;
  selectedOption: any;
  reasoning: string;
  timestamp: Date;
  confidence?: number;
}

export interface ReflectionRound {
  round: number;
  originalResponse: string;
  reflection: string;
  confidence: number;
  timestamp: Date;
  improvements?: string[];
}

export interface SelfImprovementPass {
  pass: number;
  originalResponse: string;
  improvedResponse: string;
  improvementType: 'reflection' | 'self_pass' | 'critique';
  timestamp: Date;
  changes: string[];
}

export interface IAgentState extends Document {
  agentId: string;
  executionId: string;
  nodeId?: string;
  userId: string;
  thoughts: Thought[];
  toolCalls: ToolCall[];
  decisions: Decision[];
  currentState: Record<string, any>;
  metadata?: Record<string, any>;

  // Enhanced agent patterns
  reflectionRounds?: ReflectionRound[];
  selfImprovementPasses?: SelfImprovementPass[];
  finalConfidence?: number;
  improvementHistory?: Array<{
    timestamp: Date;
    fromVersion: string;
    toVersion: string;
    changes: string[];
  }>;

  createdAt: Date;
  updatedAt: Date;
}

const ThoughtSchema = new Schema(
  {
    id: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    confidence: { type: Number },
    reasoning: { type: String },
  },
  { _id: false }
);

const ToolCallSchema = new Schema(
  {
    id: { type: String, required: true },
    toolName: { type: String, required: true },
    arguments: { type: Schema.Types.Mixed },
    result: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
    duration: { type: Number },
    success: { type: Boolean, default: true },
    error: { type: String },
  },
  { _id: false }
);

const DecisionSchema = new Schema(
  {
    id: { type: String, required: true },
    decisionPoint: { type: String, required: true },
    options: [
      {
        label: String,
        value: Schema.Types.Mixed,
        score: Number,
      },
    ],
    selectedOption: { type: Schema.Types.Mixed },
    reasoning: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    confidence: { type: Number },
  },
  { _id: false }
);

// Enhanced agent pattern schemas
const ReflectionRoundSchema = new Schema(
  {
    round: { type: Number, required: true },
    originalResponse: { type: String, required: true },
    reflection: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    timestamp: { type: Date, default: Date.now },
    improvements: [{ type: String }],
  },
  { _id: false }
);

const SelfImprovementPassSchema = new Schema(
  {
    pass: { type: Number, required: true },
    originalResponse: { type: String, required: true },
    improvedResponse: { type: String, required: true },
    improvementType: {
      type: String,
      required: true,
      enum: ['reflection', 'self_pass', 'critique']
    },
    timestamp: { type: Date, default: Date.now },
    changes: [{ type: String }],
  },
  { _id: false }
);

const ImprovementHistorySchema = new Schema(
  {
    timestamp: { type: Date, default: Date.now },
    fromVersion: { type: String, required: true },
    toVersion: { type: String, required: true },
    changes: [{ type: String }],
  },
  { _id: false }
);

const AgentStateSchema = new Schema<IAgentState>(
  {
    agentId: { type: String, required: true },
    executionId: { type: String, required: true },
    nodeId: { type: String },
    userId: { type: String, required: true },
    thoughts: { type: [ThoughtSchema], default: [] },
    toolCalls: { type: [ToolCallSchema], default: [] },
    decisions: { type: [DecisionSchema], default: [] },
    currentState: { type: Schema.Types.Mixed, default: {} },
    metadata: { type: Schema.Types.Mixed },

    // Enhanced agent patterns
    reflectionRounds: { type: [ReflectionRoundSchema], default: [] },
    selfImprovementPasses: { type: [SelfImprovementPassSchema], default: [] },
    finalConfidence: { type: Number, min: 0, max: 1 },
    improvementHistory: { type: [ImprovementHistorySchema], default: [] },
  },
  {
    timestamps: true,
    collection: 'agent_states',
  }
);

// Indexes
AgentStateSchema.index({ executionId: 1, agentId: 1 });
AgentStateSchema.index({ userId: 1, createdAt: -1 });
AgentStateSchema.index({ nodeId: 1 });

export const AgentStateModel: Model<IAgentState> = model<IAgentState>('AgentState', AgentStateSchema);

export class AgentStateService {
  /**
   * Create or update agent state
   */
  async createOrUpdateAgentState(
    agentId: string,
    executionId: string,
    userId: string,
    nodeId?: string,
    initialState?: Record<string, any>
  ): Promise<IAgentState> {
    try {
      const existing = await AgentStateModel.findOne({ agentId, executionId });
      
      if (existing) {
        return existing;
      }

      const agentState = new AgentStateModel({
        agentId,
        executionId,
        nodeId,
        userId,
        currentState: initialState || {},
        thoughts: [],
        toolCalls: [],
        decisions: [],
      });

      await agentState.save();
      logger.info('Agent state created', { agentId, executionId, nodeId });
      
      return agentState;
    } catch (error: any) {
      logger.error('Failed to create agent state', { error: error.message, agentId, executionId });
      throw error;
    }
  }

  /**
   * Add a reasoning thought
   */
  async addThought(
    agentId: string,
    executionId: string,
    content: string,
    reasoning?: string,
    confidence?: number
  ): Promise<void> {
    try {
      const thought: Thought = {
        id: `thought-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content,
        reasoning,
        confidence,
        timestamp: new Date(),
      };

      await AgentStateModel.updateOne(
        { agentId, executionId },
        { $push: { thoughts: thought } }
      );

      // Broadcast reasoning step event
      broadcastAgentEvent(executionId, agentId, 'agent_reasoning_step', {
        thought,
        totalThoughts: (await AgentStateModel.findOne({ agentId, executionId }))?.thoughts.length || 0,
      });

      logger.debug('Thought added to agent state', { agentId, executionId, thoughtId: thought.id });
    } catch (error: any) {
      logger.error('Failed to add thought', { error: error.message, agentId, executionId });
    }
  }

  /**
   * Record a tool call
   */
  async recordToolCall(
    agentId: string,
    executionId: string,
    toolName: string,
    args: Record<string, any>,
    result?: any,
    duration?: number,
    success: boolean = true,
    error?: string
  ): Promise<void> {
    try {
      const toolCall: ToolCall = {
        id: `toolcall-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        toolName,
        arguments: args,
        result,
        duration,
        success,
        error,
        timestamp: new Date(),
      };

      await AgentStateModel.updateOne(
        { agentId, executionId },
        { $push: { toolCalls: toolCall } }
      );

      // Broadcast tool call event
      broadcastAgentEvent(executionId, agentId, 'agent_tool_call', {
        toolCall,
        totalToolCalls: (await AgentStateModel.findOne({ agentId, executionId }))?.toolCalls.length || 0,
      });

      logger.debug('Tool call recorded', { agentId, executionId, toolName, success });
    } catch (error: any) {
      logger.error('Failed to record tool call', { error: error.message, agentId, executionId });
    }
  }

  /**
   * Record a decision point
   */
  async recordDecision(
    agentId: string,
    executionId: string,
    decisionPoint: string,
    options: Array<{ label: string; value: any; score?: number }>,
    selectedOption: any,
    reasoning: string,
    confidence?: number
  ): Promise<void> {
    try {
      const decision: Decision = {
        id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        decisionPoint,
        options,
        selectedOption,
        reasoning,
        confidence,
        timestamp: new Date(),
      };

      await AgentStateModel.updateOne(
        { agentId, executionId },
        { $push: { decisions: decision } }
      );

      // Broadcast decision event
      broadcastAgentEvent(executionId, agentId, 'agent_decision', {
        decision,
        totalDecisions: (await AgentStateModel.findOne({ agentId, executionId }))?.decisions.length || 0,
      });

      logger.debug('Decision recorded', { agentId, executionId, decisionPoint });
    } catch (error: any) {
      logger.error('Failed to record decision', { error: error.message, agentId, executionId });
    }
  }

  /**
   * Update agent current state
   */
  async updateState(
    agentId: string,
    executionId: string,
    stateUpdate: Record<string, any>
  ): Promise<void> {
    try {
      const agentState = await AgentStateModel.findOne({ agentId, executionId });
      if (!agentState) {
        logger.warn('Agent state not found for update', { agentId, executionId });
        return;
      }

      agentState.currentState = {
        ...agentState.currentState,
        ...stateUpdate,
      };

      await agentState.save();
      logger.debug('Agent state updated', { agentId, executionId });
    } catch (error: any) {
      logger.error('Failed to update agent state', { error: error.message, agentId, executionId });
    }
  }

  /**
   * Get agent state
   */
  async getAgentState(agentId: string, executionId: string): Promise<IAgentState | null> {
    try {
      return await AgentStateModel.findOne({ agentId, executionId });
    } catch (error: any) {
      logger.error('Failed to get agent state', { error: error.message, agentId, executionId });
      return null;
    }
  }

  /**
   * Get all agent states for an execution (multi-agent scenarios)
   */
  async getExecutionAgentStates(executionId: string): Promise<IAgentState[]> {
    try {
      return await AgentStateModel.find({ executionId }).sort({ createdAt: 1 });
    } catch (error: any) {
      logger.error('Failed to get execution agent states', { error: error.message, executionId });
      return [];
    }
  }

  /**
   * Record a reflection round
   */
  async recordReflectionRound(
    agentId: string,
    executionId: string,
    round: number,
    originalResponse: string,
    reflection: string,
    confidence: number,
    improvements?: string[]
  ): Promise<void> {
    try {
      const reflectionRound: ReflectionRound = {
        round,
        originalResponse,
        reflection,
        confidence,
        timestamp: new Date(),
        improvements,
      };

      await AgentStateModel.updateOne(
        { agentId, executionId },
        {
          $push: { reflectionRounds: reflectionRound },
          $set: { finalConfidence: confidence },
        },
        { upsert: true }
      );

      logger.debug('Recorded reflection round', { agentId, executionId, round, confidence });
    } catch (error: any) {
      logger.error('Failed to record reflection round', { agentId, executionId, error: error.message });
    }
  }

  /**
   * Record a self-improvement pass
   */
  async recordSelfImprovementPass(
    agentId: string,
    executionId: string,
    pass: number,
    originalResponse: string,
    improvedResponse: string,
    improvementType: 'reflection' | 'self_pass' | 'critique',
    changes?: string[]
  ): Promise<void> {
    try {
      const improvementPass: SelfImprovementPass = {
        pass,
        originalResponse,
        improvedResponse,
        improvementType,
        timestamp: new Date(),
        changes: changes || [],
      };

      await AgentStateModel.updateOne(
        { agentId, executionId },
        {
          $push: { selfImprovementPasses: improvementPass },
        },
        { upsert: true }
      );

      logger.debug('Recorded self-improvement pass', { agentId, executionId, pass, improvementType });
    } catch (error: any) {
      logger.error('Failed to record self-improvement pass', { agentId, executionId, error: error.message });
    }
  }

  /**
   * Record improvement history
   */
  async recordImprovement(
    agentId: string,
    executionId: string,
    fromVersion: string,
    toVersion: string,
    changes: string[]
  ): Promise<void> {
    try {
      const improvement = {
        timestamp: new Date(),
        fromVersion,
        toVersion,
        changes,
      };

      await AgentStateModel.updateOne(
        { agentId, executionId },
        {
          $push: { improvementHistory: improvement },
        },
        { upsert: true }
      );

      logger.debug('Recorded improvement', { agentId, executionId, fromVersion, toVersion });
    } catch (error: any) {
      logger.error('Failed to record improvement', { agentId, executionId, error: error.message });
    }
  }

  /**
   * Get agent performance analytics
   */
  async getAgentAnalytics(agentId: string, days: number = 30): Promise<{
    totalExecutions: number;
    averageConfidence: number;
    reflectionRounds: number;
    selfImprovementPasses: number;
    successRate: number;
  }> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const result = await AgentStateModel.aggregate([
        {
          $match: {
            agentId,
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: null,
            totalExecutions: { $sum: 1 },
            averageConfidence: { $avg: '$finalConfidence' },
            totalReflectionRounds: { $sum: { $size: '$reflectionRounds' } },
            totalSelfImprovementPasses: { $sum: { $size: '$selfImprovementPasses' } },
            successfulExecutions: {
              $sum: {
                $cond: [
                  { $gt: ['$finalConfidence', 0.7] },
                  1,
                  0
                ]
              }
            },
          },
        },
      ]);

      const stats = result[0] || {
        totalExecutions: 0,
        averageConfidence: 0,
        totalReflectionRounds: 0,
        totalSelfImprovementPasses: 0,
        successfulExecutions: 0,
      };

      return {
        totalExecutions: stats.totalExecutions,
        averageConfidence: stats.averageConfidence || 0,
        reflectionRounds: stats.totalReflectionRounds,
        selfImprovementPasses: stats.totalSelfImprovementPasses,
        successRate: stats.totalExecutions > 0 ? stats.successfulExecutions / stats.totalExecutions : 0,
      };
    } catch (error: any) {
      logger.error('Failed to get agent analytics', { agentId, error: error.message });
      return {
        totalExecutions: 0,
        averageConfidence: 0,
        reflectionRounds: 0,
        selfImprovementPasses: 0,
        successRate: 0,
      };
    }
  }

  /**
   * Clean up old agent states (retention policy)
   */
  async cleanupOldStates(retentionDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await AgentStateModel.deleteMany({
        createdAt: { $lt: cutoffDate },
      });

      logger.info('Cleaned up old agent states', { deletedCount: result.deletedCount, retentionDays });
      return result.deletedCount || 0;
    } catch (error: any) {
      logger.error('Failed to cleanup old agent states', { error: error.message });
      return 0;
    }
  }
}

export const agentStateService = new AgentStateService();
