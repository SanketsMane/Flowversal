/**
 * Analytics Store - Admin Panel
 * Computes real-time analytics from core stores
 * NO MOCK DATA - Everything is computed!
 */

import { create } from 'zustand';
import { useUserStore } from '../core/userStore';
import { useExecutionStore } from '../core/executionStore';
import { useWorkflowRegistryStore } from '../core/workflowRegistryStore';
import { fetchAnalyticsSummary } from '@/core/api/services/analytics.service';

interface DashboardMetrics {
  // User metrics
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
  
  // Workflow metrics
  totalWorkflows: number;
  activeWorkflows: number;
  
  // Execution metrics
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  avgExecutionTime: number;
  
  // Subscription metrics
  freePlanUsers: number;
  proPlanUsers: number;
  enterprisePlanUsers: number;
  
  // AI usage
  totalAITokensUsed: number;
}

interface AnalyticsStore {
  summary?: DashboardMetrics;
  loading: boolean;
  error?: string;
  loadSummary: () => Promise<void>;
  // Computed metrics (no state needed - computed on demand)
  getDashboardMetrics: () => DashboardMetrics;
  
  // Chart data
  getUserGrowthChart: () => { date: string; count: number }[];
  getExecutionChart: () => { date: string; count: number; success: number; failed: number }[];
  getPlanDistribution: () => { name: string; value: number }[];
  
  // Top lists
  getTopWorkflows: (limit?: number) => Array<{
    id: string;
    name: string;
    executions: number;
    successRate: number;
  }>;
  getTopUsers: (limit?: number) => Array<{
    id: string;
    name: string;
    workflowsCreated: number;
    executionsRun: number;
  }>;
}

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  loading: false,
  loadSummary: async () => {
    try {
      set({ loading: true, error: undefined });
      const summary = await fetchAnalyticsSummary();
      set({
        summary: {
          totalUsers: summary.users.total,
          activeUsers: summary.users.total, // backend does not track active separately yet
          newUsersThisMonth: 0,
          userGrowthRate: 0,
          totalWorkflows: summary.workflows.total,
          activeWorkflows: summary.workflows.total,
          totalExecutions: summary.executions.total,
          successfulExecutions: summary.executions.successful,
          failedExecutions: summary.executions.failed,
          successRate: summary.executions.successRate,
          avgExecutionTime: summary.executions.avgDurationMs,
          freePlanUsers: 0,
          proPlanUsers: 0,
          enterprisePlanUsers: 0,
          totalAITokensUsed: 0,
        },
      });
    } catch (error: any) {
      set({ error: error?.message || 'Failed to load analytics summary' });
    } finally {
      set({ loading: false });
    }
  },
  getDashboardMetrics: () => {
    const remote = get().summary;
    if (remote) return remote;

    // Get data from core stores
    const userStore = useUserStore.getState();
    const executionStore = useExecutionStore.getState();
    const workflowStore = useWorkflowRegistryStore.getState();
    
    // Get workflow metrics from registry
    const totalWorkflows = workflowStore.getTotalWorkflows();
    const activeWorkflows = workflowStore.getActiveWorkflows();
    
    const totalUsers = userStore.getTotalUsers();
    const activeUsers = userStore.getActiveUsers().length;
    const newUsersThisMonth = userStore.getNewUsersThisMonth();
    
    // Calculate user growth rate
    const now = Date.now();
    const lastMonth = now - 30 * 24 * 60 * 60 * 1000;
    const previousMonth = lastMonth - 30 * 24 * 60 * 60 * 1000;
    
    const usersLastMonth = userStore.users.filter(
      (u) => u.createdAt >= previousMonth && u.createdAt < lastMonth && u.status !== 'deleted'
    ).length;
    
    const userGrowthRate = usersLastMonth > 0
      ? Math.round(((newUsersThisMonth - usersLastMonth) / usersLastMonth) * 100)
      : 0;
    
    const totalExecutions = executionStore.getTotalExecutions();
    const successfulExecutions = executionStore.getExecutionsByStatus('success').length;
    const failedExecutions = executionStore.getExecutionsByStatus('failed').length;
    const successRate = executionStore.getSuccessRate();
    const avgExecutionTime = executionStore.getAverageExecutionTime();
    
    const freePlanUsers = userStore.getUsersByPlan('free').length;
    const proPlanUsers = userStore.getUsersByPlan('pro').length;
    const enterprisePlanUsers = userStore.getUsersByPlan('enterprise').length;
    
    const totalAITokensUsed = executionStore.getTotalAITokensUsed();
    
    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      userGrowthRate,
      totalWorkflows,
      activeWorkflows,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      successRate,
      avgExecutionTime,
      freePlanUsers,
      proPlanUsers,
      enterprisePlanUsers,
      totalAITokensUsed,
    };
  },

  getUserGrowthChart: () => {
    const userStore = useUserStore.getState();
    return userStore.getUserGrowthData();
  },

  getExecutionChart: () => {
    const executionStore = useExecutionStore.getState();
    return executionStore.getExecutionGrowthData();
  },

  getPlanDistribution: () => {
    const userStore = useUserStore.getState();
    return [
      { name: 'Free', value: userStore.getUsersByPlan('free').length },
      { name: 'Pro', value: userStore.getUsersByPlan('pro').length },
      { name: 'Enterprise', value: userStore.getUsersByPlan('enterprise').length },
    ];
  },

  getTopWorkflows: (limit = 5) => {
    const executionStore = useExecutionStore.getState();
    
    // Group executions by workflow
    const workflowStats: {
      [workflowId: string]: {
        name: string;
        total: number;
        successful: number;
      };
    } = {};
    
    executionStore.executions.forEach((exec) => {
      if (!workflowStats[exec.workflowId]) {
        workflowStats[exec.workflowId] = {
          name: exec.workflowName,
          total: 0,
          successful: 0,
        };
      }
      workflowStats[exec.workflowId].total += 1;
      if (exec.status === 'success') {
        workflowStats[exec.workflowId].successful += 1;
      }
    });
    
    return Object.entries(workflowStats)
      .map(([id, stats]) => ({
        id,
        name: stats.name,
        executions: stats.total,
        successRate: stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0,
      }))
      .sort((a, b) => b.executions - a.executions)
      .slice(0, limit);
  },

  getTopUsers: (limit = 5) => {
    const userStore = useUserStore.getState();
    const executionStore = useExecutionStore.getState();
    
    return userStore.getActiveUsers()
      .map((user) => ({
        id: user.id,
        name: user.name,
        workflowsCreated: user.stats.workflowsCreated,
        executionsRun: executionStore.getExecutionsByUser(user.id).length,
      }))
      .sort((a, b) => b.executionsRun - a.executionsRun)
      .slice(0, limit);
  },
}));