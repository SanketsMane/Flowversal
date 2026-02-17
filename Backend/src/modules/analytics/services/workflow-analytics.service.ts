import { Types } from 'mongoose';
import { logger } from '../../../shared/utils/logger.util';
import { ModelScoreModel } from '../../ai/models/ModelScore.model';
import { ProjectModel } from '../../projects/models/Project.model';
import { UserModel } from '../../users/models/User.model';
import { WorkflowModel } from '../../workflows/models/Workflow.model';
import { WorkflowExecutionModel } from '../../workflows/models/WorkflowExecution.model';

export interface AnalyticsTimeRange {
  start: Date;
  end: Date;
}

export interface WorkflowAnalytics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  avgExecutionTime: number;
  successRate: number;
  executionsByStatus: Record<string, number>;
  executionsByTrigger: Record<string, number>;
  topWorkflows: Array<{
    workflowId: string;
    workflowName: string;
    executions: number;
    successRate: number;
    avgExecutionTime: number;
  }>;
  performanceTrends: Array<{
    date: string;
    executions: number;
    successRate: number;
    avgExecutionTime: number;
  }>;
  nodePerformance: Array<{
    nodeType: string;
    executions: number;
    successRate: number;
    avgExecutionTime: number;
  }>;
}

export interface AIAnalytics {
  totalRequests: number;
  avgConfidence: number;
  providerUsage: Record<string, number>;
  taskTypeDistribution: Record<string, number>;
  responseTimeStats: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  costAnalysis: {
    totalCost: number;
    avgCostPerRequest: number;
    costByProvider: Record<string, number>;
  };
  performanceByTaskType: Array<{
    taskType: string;
    avgConfidence: number;
    avgResponseTime: number;
    successRate: number;
  }>;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  userEngagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
  };
  userWorkflowStats: Array<{
    userId: string;
    userName: string;
    totalExecutions: number;
    successRate: number;
    favoriteWorkflows: string[];
  }>;
}

export class WorkflowAnalyticsService {
  /**
   * Get comprehensive workflow analytics
   */
  async getWorkflowAnalytics(
    userId?: Types.ObjectId,
    timeRange?: AnalyticsTimeRange,
    workflowId?: string
  ): Promise<WorkflowAnalytics> {
    try {
      // Build match conditions
      const matchConditions: any = {};
      if (userId) matchConditions.userId = userId;
      if (workflowId) matchConditions.workflowId = workflowId;
      if (timeRange) {
        matchConditions.startedAt = {
          $gte: timeRange.start,
          $lte: timeRange.end,
        };
      }

      // Aggregate workflow execution statistics
      const stats = await WorkflowExecutionModel.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: null,
            totalExecutions: { $sum: 1 },
            successfulExecutions: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            failedExecutions: {
              $sum: { $cond: [{ $in: ['$status', ['failed', 'cancelled']] }, 1, 0] },
            },
            totalExecutionTime: { $sum: '$duration' },
            executionsByStatus: {
              $push: '$status',
            },
            executionsByTrigger: {
              $push: '$triggeredBy',
            },
            workflowStats: {
              $push: {
                workflowId: '$workflowId',
                duration: '$duration',
                status: '$status',
              },
            },
          },
        },
      ]);

      const result = stats[0] || {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalExecutionTime: 0,
        executionsByStatus: [],
        executionsByTrigger: [],
        workflowStats: [],
      };

      // Calculate derived metrics
      const avgExecutionTime = result.totalExecutions > 0
        ? result.totalExecutionTime / result.totalExecutions
        : 0;

      const successRate = result.totalExecutions > 0
        ? (result.successfulExecutions / result.totalExecutions) * 100
        : 0;

      // Group executions by status and trigger
      const executionsByStatus = result.executionsByStatus.reduce((acc: Record<string, number>, status: string) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const executionsByTrigger = result.executionsByTrigger.reduce((acc: Record<string, number>, trigger: string) => {
        acc[trigger] = (acc[trigger] || 0) + 1;
        return acc;
      }, {});

      // Get top workflows
      const topWorkflows = await this.getTopWorkflows(userId, timeRange);

      // Get performance trends
      const performanceTrends = await this.getPerformanceTrends(userId, timeRange);

      // Get node performance
      const nodePerformance = await this.getNodePerformance(userId, timeRange);

      return {
        totalExecutions: result.totalExecutions,
        successfulExecutions: result.successfulExecutions,
        failedExecutions: result.failedExecutions,
        avgExecutionTime,
        successRate,
        executionsByStatus,
        executionsByTrigger,
        topWorkflows,
        performanceTrends,
        nodePerformance,
      };

    } catch (error: any) {
      logger.error('Failed to get workflow analytics', {
        userId,
        workflowId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get AI model performance analytics
   */
  async getAIAnalytics(
    userId?: Types.ObjectId,
    timeRange?: AnalyticsTimeRange
  ): Promise<AIAnalytics> {
    try {
      // Build match conditions
      const matchConditions: any = {};
      if (userId) matchConditions.userId = userId;
      if (timeRange) {
        matchConditions.createdAt = {
          $gte: timeRange.start,
          $lte: timeRange.end,
        };
      }

      // Aggregate AI performance statistics
      const stats = await ModelScoreModel.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            totalConfidence: { $sum: '$confidence' },
            totalResponseTime: { $sum: '$responseTime' },
            totalCost: { $sum: '$cost' },
            totalTokenCount: { $sum: '$tokenCount' },
            providerUsage: {
              $push: '$provider',
            },
            taskTypeDistribution: {
              $push: '$taskType',
            },
            responseTimes: {
              $push: '$responseTime',
            },
            costsByProvider: {
              $push: {
                provider: '$provider',
                cost: '$cost',
              },
            },
            performanceByTaskType: {
              $push: {
                taskType: '$taskType',
                confidence: '$confidence',
                responseTime: '$responseTime',
                success: { $cond: [{ $eq: ['$success', true] }, 1, 0] },
              },
            },
          },
        },
      ]);

      const result = stats[0] || {
        totalRequests: 0,
        totalConfidence: 0,
        totalResponseTime: 0,
        totalCost: 0,
        totalTokenCount: 0,
        providerUsage: [],
        taskTypeDistribution: [],
        responseTimes: [],
        costsByProvider: [],
        performanceByTaskType: [],
      };

      // Calculate derived metrics
      const avgConfidence = result.totalRequests > 0 ? result.totalConfidence / result.totalRequests : 0;
      const avgResponseTime = result.totalRequests > 0 ? result.totalResponseTime / result.totalRequests : 0;
      const avgCostPerRequest = result.totalRequests > 0 ? result.totalCost / result.totalRequests : 0;

      // Group by provider and task type
      const providerUsage = result.providerUsage.reduce((acc: Record<string, number>, provider: string) => {
        acc[provider] = (acc[provider] || 0) + 1;
        return acc;
      }, {});

      const taskTypeDistribution = result.taskTypeDistribution.reduce((acc: Record<string, number>, taskType: string) => {
        acc[taskType] = (acc[taskType] || 0) + 1;
        return acc;
      }, {});

      // Calculate response time percentiles
      const sortedResponseTimes = result.responseTimes.sort((a: number, b: number) => a - b);
      const responseTimeStats = this.calculatePercentiles(sortedResponseTimes);

      // Calculate cost by provider
      const costByProvider = result.costsByProvider.reduce((acc: Record<string, number>, item: any) => {
        acc[item.provider] = (acc[item.provider] || 0) + item.cost;
        return acc;
      }, {});

      // Calculate performance by task type
      const taskTypePerformance = result.performanceByTaskType.reduce((acc: any, item: any) => {
        if (!acc[item.taskType]) {
          acc[item.taskType] = {
            taskType: item.taskType,
            totalConfidence: 0,
            totalResponseTime: 0,
            totalRequests: 0,
            successfulRequests: 0,
          };
        }
        acc[item.taskType].totalConfidence += item.confidence;
        acc[item.taskType].totalResponseTime += item.responseTime;
        acc[item.taskType].totalRequests += 1;
        acc[item.taskType].successfulRequests += item.success;
        return acc;
      }, {});

      const performanceByTaskType = Object.values(taskTypePerformance).map((item: any) => ({
        taskType: item.taskType,
        avgConfidence: item.totalConfidence / item.totalRequests,
        avgResponseTime: item.totalResponseTime / item.totalRequests,
        successRate: (item.successfulRequests / item.totalRequests) * 100,
      }));

      return {
        totalRequests: result.totalRequests,
        avgConfidence,
        providerUsage,
        taskTypeDistribution,
        responseTimeStats,
        costAnalysis: {
          totalCost: result.totalCost,
          avgCostPerRequest,
          costByProvider,
        },
        performanceByTaskType,
      };

    } catch (error: any) {
      logger.error('Failed to get AI analytics', {
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get user engagement analytics
   */
  async getUserAnalytics(timeRange?: AnalyticsTimeRange): Promise<UserAnalytics> {
    try {
      // This would typically query user activity logs
      // For now, return basic user workflow stats
      const userWorkflowStats = await WorkflowExecutionModel.aggregate([
        {
          $match: timeRange ? {
            startedAt: { $gte: timeRange.start, $lte: timeRange.end },
          } : {},
        },
        {
          $group: {
            _id: '$userId',
            totalExecutions: { $sum: 1 },
            successfulExecutions: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            workflows: { $addToSet: '$workflowId' },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
        {
          $project: {
            userId: '$_id',
            userName: '$user.name',
            totalExecutions: 1,
            successRate: {
              $multiply: [
                { $divide: ['$successfulExecutions', '$totalExecutions'] },
                100,
              ],
            },
            favoriteWorkflows: { $slice: ['$workflows', 5] }, // Top 5 workflows
          },
        },
        { $sort: { totalExecutions: -1 } },
        { $limit: 50 }, // Top 50 users
      ]);

      // Get basic user counts (simplified)
      const totalUsers = await WorkflowExecutionModel.distinct('userId').then(ids => ids.length);
      const activeUsers = userWorkflowStats.length;

      return {
        totalUsers,
        activeUsers,
        userEngagement: {
          dailyActiveUsers: Math.floor(activeUsers * 0.3), // Estimated
          weeklyActiveUsers: Math.floor(activeUsers * 0.7), // Estimated
          monthlyActiveUsers: activeUsers, // Estimated
        },
        userWorkflowStats,
      };

    } catch (error: any) {
      logger.error('Failed to get user analytics', { error: error.message });
      throw error;
    }
  }

  /**
   * Get real-time dashboard metrics
   */
  async getDashboardMetrics(userId?: Types.ObjectId): Promise<{
    liveStats: {
      activeExecutions: number;
      pendingApprovals: number;
      activeBreakpoints: number;
      recentErrors: number;
    };
    performanceIndicators: {
      systemHealth: 'healthy' | 'warning' | 'critical';
      avgResponseTime: number;
      successRate: number;
      throughput: number; // executions per hour
    };
    alerts: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      timestamp: Date;
      details?: any;
    }>;
  }> {
    try {
      // Get live statistics
      const activeExecutions = await WorkflowExecutionModel.countDocuments({
        status: { $in: ['running', 'waiting_for_approval'] },
        ...(userId && { userId }),
      });

      const pendingApprovals = await WorkflowExecutionModel.countDocuments({
        'pendingApprovals.0': { $exists: true },
        ...(userId && { userId }),
      });

      // Active breakpoints would need to be tracked separately
      const activeBreakpoints = 0; // Placeholder

      // Recent errors (last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentErrors = await WorkflowExecutionModel.countDocuments({
        status: 'failed',
        startedAt: { $gte: oneDayAgo },
        ...(userId && { userId }),
      });

      // Performance indicators
      const recentExecutions = await WorkflowExecutionModel.find({
        startedAt: { $gte: oneDayAgo },
        ...(userId && { userId }),
      }).select('status duration startedAt');

      const successfulRecent = recentExecutions.filter(e => e.status === 'completed').length;
      const successRate = recentExecutions.length > 0 ? (successfulRecent / recentExecutions.length) * 100 : 100;

      const totalDuration = recentExecutions.reduce((sum, e) => sum + (e.duration || 0), 0);
      const avgResponseTime = recentExecutions.length > 0 ? totalDuration / recentExecutions.length : 0;

      const throughput = recentExecutions.length / 24; // executions per hour

      // Determine system health
      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (successRate < 80 || avgResponseTime > 30000) { // 30 seconds
        systemHealth = 'warning';
      }
      if (successRate < 50 || avgResponseTime > 120000) { // 2 minutes
        systemHealth = 'critical';
      }

      // Generate alerts
      const alerts: any[] = [];

      if (recentErrors > 5) {
        alerts.push({
          type: 'error',
          message: `${recentErrors} executions failed in the last 24 hours`,
          timestamp: new Date(),
          details: { recentErrors },
        });
      }

      if (activeExecutions > 10) {
        alerts.push({
          type: 'warning',
          message: `${activeExecutions} executions currently running`,
          timestamp: new Date(),
          details: { activeExecutions },
        });
      }

      if (pendingApprovals > 0) {
        alerts.push({
          type: 'info',
          message: `${pendingApprovals} approvals pending review`,
          timestamp: new Date(),
          details: { pendingApprovals },
        });
      }

      return {
        liveStats: {
          activeExecutions,
          pendingApprovals,
          activeBreakpoints,
          recentErrors,
        },
        performanceIndicators: {
          systemHealth,
          avgResponseTime,
          successRate,
          throughput,
        },
        alerts,
      };

    } catch (error: any) {
      logger.error('Failed to get dashboard metrics', { error: error.message });
      throw error;
    }
  }

  /**
   * Get usage summary for subscription/usage modal - Fixes dummy data
   * Author: Sanket
   */
  async getUsageSummary(userId: Types.ObjectId): Promise<any> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [
        workflowsCount,
        projectsCount,
        totalExecutions,
        monthlyExecutions,
        userCount
      ] = await Promise.all([
        WorkflowModel.countDocuments({ userId }),
        ProjectModel.countDocuments({ userId }),
        WorkflowExecutionModel.countDocuments({ userId }),
        WorkflowExecutionModel.countDocuments({ 
          userId, 
          startedAt: { $gte: startOfMonth } 
        }),
        UserModel.countDocuments({})
      ]);

      // Calculate AI agents (nodes in workflows)
      const userWorkflows = await WorkflowModel.find({ userId }).select('containers');
      let aiAgentCount = 0;
      userWorkflows.forEach(wf => {
        if (wf.containers && Array.isArray(wf.containers)) {
          wf.containers.forEach(container => {
            if (container.nodes && Array.isArray(container.nodes)) {
              aiAgentCount += container.nodes.filter((n: any) => 
                n.type === 'ai' || n.type?.includes('agent') || n.type?.includes('model')
              ).length;
            }
          });
        }
      });

      return {
        workflows: workflowsCount,
        aiAgents: aiAgentCount,
        executions: monthlyExecutions,
        projects: projectsCount,
        teamMembers: 1, // Single user for now
        totalExecutions,
        storage: 0 // Placeholder
      };
    } catch (error: any) {
      logger.error('Failed to get usage summary', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Get dashboard stats - Fixes dummy data
   * Author: Sanket
   */
  async getDashboardStats(userId: Types.ObjectId): Promise<any[]> {
    try {
      const [
        totalWorkflows,
        activeWorkflows,
        completedTasks,
        aiRequests
      ] = await Promise.all([
        WorkflowModel.countDocuments({ userId }),
        WorkflowModel.countDocuments({ userId, status: 'published' }),
        WorkflowExecutionModel.countDocuments({ userId, status: 'completed' }),
        ModelScoreModel.countDocuments({ userId })
      ]);

      return [
        {
          label: 'Total Workflows',
          value: totalWorkflows.toString(),
          change: '+0%', // Dynamic change tracking not implemented yet
          color: 'from-[#9D50BB] to-[#B876D5]',
        },
        {
          label: 'Active Automations',
          value: activeWorkflows.toString(),
          change: '+0%',
          color: 'from-[#0072FF] to-[#4F7BF7]',
        },
        {
          label: 'Tasks Completed',
          value: completedTasks.toLocaleString(),
          change: '+0%',
          color: 'from-[#00C6FF] to-[#06B6D4]',
        },
        {
          label: 'AI Requests',
          value: aiRequests > 1000 ? `${(aiRequests / 1000).toFixed(1)}K` : aiRequests.toString(),
          change: '+0%',
          color: 'from-[#D946EF] to-[#E879F9]',
        },
      ];
    } catch (error: any) {
      logger.error('Failed to get dashboard stats', { userId, error: error.message });
      throw error;
    }
  }

  // Helper methods

  private async getTopWorkflows(userId?: Types.ObjectId, timeRange?: AnalyticsTimeRange): Promise<any[]> {
    const matchConditions: any = {};
    if (userId) matchConditions.userId = userId;
    if (timeRange) matchConditions.startedAt = { $gte: timeRange.start, $lte: timeRange.end };

    return await WorkflowExecutionModel.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$workflowId',
          executions: { $sum: 1 },
          successfulExecutions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          totalExecutionTime: { $sum: '$duration' },
        },
      },
      {
        $lookup: {
          from: 'workflows',
          localField: '_id',
          foreignField: '_id',
          as: 'workflow',
        },
      },
      { $unwind: '$workflow' },
      {
        $project: {
          workflowId: '$_id',
          workflowName: '$workflow.name',
          executions: 1,
          successRate: {
            $multiply: [{ $divide: ['$successfulExecutions', '$executions'] }, 100],
          },
          avgExecutionTime: { $divide: ['$totalExecutionTime', '$executions'] },
        },
      },
      { $sort: { executions: -1 } },
      { $limit: 10 },
    ]);
  }

  private async getPerformanceTrends(userId?: Types.ObjectId, timeRange?: AnalyticsTimeRange): Promise<any[]> {
    const matchConditions: any = {};
    if (userId) matchConditions.userId = userId;

    // Default to last 30 days if no time range specified
    const startDate = timeRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = timeRange?.end || new Date();

    if (timeRange) {
      matchConditions.startedAt = { $gte: startDate, $lte: endDate };
    }

    return await WorkflowExecutionModel.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$startedAt',
            },
          },
          executions: { $sum: 1 },
          successfulExecutions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          totalExecutionTime: { $sum: '$duration' },
        },
      },
      {
        $project: {
          date: '$_id',
          executions: 1,
          successRate: {
            $multiply: [{ $divide: ['$successfulExecutions', '$executions'] }, 100],
          },
          avgExecutionTime: { $divide: ['$totalExecutionTime', '$executions'] },
        },
      },
      { $sort: { date: 1 } },
    ]);
  }

  private async getNodePerformance(userId?: Types.ObjectId, timeRange?: AnalyticsTimeRange): Promise<any[]> {
    const matchConditions: any = {};
    if (userId) matchConditions.userId = userId;
    if (timeRange) matchConditions.startedAt = { $gte: timeRange.start, $lte: timeRange.end };

    return await WorkflowExecutionModel.aggregate([
      { $match: matchConditions },
      { $unwind: '$steps' },
      {
        $group: {
          _id: '$steps.stepType',
          executions: { $sum: 1 },
          successfulExecutions: {
            $sum: { $cond: [{ $eq: ['$steps.status', 'completed'] }, 1, 0] },
          },
          totalExecutionTime: { $sum: '$steps.duration' },
        },
      },
      {
        $project: {
          nodeType: '$_id',
          executions: 1,
          successRate: {
            $multiply: [{ $divide: ['$successfulExecutions', '$executions'] }, 100],
          },
          avgExecutionTime: { $divide: ['$totalExecutionTime', '$executions'] },
        },
      },
      { $sort: { executions: -1 } },
      { $limit: 20 },
    ]);
  }

  private calculatePercentiles(sortedArray: number[]): { avg: number; p50: number; p95: number; p99: number } {
    if (sortedArray.length === 0) {
      return { avg: 0, p50: 0, p95: 0, p99: 0 };
    }

    const avg = sortedArray.reduce((a, b) => a + b, 0) / sortedArray.length;
    const p50 = sortedArray[Math.floor(sortedArray.length * 0.5)] || 0;
    const p95 = sortedArray[Math.floor(sortedArray.length * 0.95)] || 0;
    const p99 = sortedArray[Math.floor(sortedArray.length * 0.99)] || 0;

    return { avg, p50, p95, p99 };
  }
}

export const workflowAnalyticsService = new WorkflowAnalyticsService();