import { WorkflowModel } from '../../workflows/models/Workflow.model';
import { WorkflowExecutionModel } from '../../workflows/models/WorkflowExecution.model';
import { UserModel } from '../../users/models/User.model';

export interface AnalyticsSummary {
  users: {
    total: number;
  };
  workflows: {
    total: number;
  };
  executions: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
    last30d: number;
    avgDurationMs: number;
  };
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const [totalUsers, totalWorkflows, totalExecutions, successfulExecutions, failedExecutions, executionsLast30d, avgDuration] =
    await Promise.all([
      UserModel.countDocuments({}),
      WorkflowModel.countDocuments({}),
      WorkflowExecutionModel.countDocuments({}),
      WorkflowExecutionModel.countDocuments({ status: { $in: ['completed', 'success', 'succeeded'] } }),
      WorkflowExecutionModel.countDocuments({ status: { $in: ['failed', 'cancelled', 'stopped'] } }),
      WorkflowExecutionModel.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
      WorkflowExecutionModel.aggregate([
        {
          $match: {
            startedAt: { $ne: null },
            completedAt: { $ne: null },
          },
        },
        {
          $project: {
            duration: {
              $subtract: ['$completedAt', '$startedAt'],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: '$duration' },
          },
        },
      ]),
    ]);

  const avgDurationMs = Array.isArray(avgDuration) && avgDuration.length > 0 ? avgDuration[0].avgDuration || 0 : 0;
  const successRate =
    totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0;

  return {
    users: {
      total: totalUsers,
    },
    workflows: {
      total: totalWorkflows,
    },
    executions: {
      total: totalExecutions,
      successful: successfulExecutions,
      failed: failedExecutions,
      successRate,
      last30d: executionsLast30d,
      avgDurationMs,
    },
  };
}

