/**
 * Admin Dashboard - Real Data Only!
 * Computes everything from core stores
 */

import { useAnalyticsStore } from '@/core/stores/admin/analyticsStore';
import { useThemeStore } from '@/core/stores/admin/themeStore'; // Add theme import
import { Activity, Clock, TrendingUp, Users, Workflow, Zap } from 'lucide-react';
import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function DashboardPage() {
  const analytics = useAnalyticsStore();
  React.useEffect(() => {
    analytics.loadSummary().catch(() => {});
  }, []);
  const { theme } = useThemeStore(); // Get theme
  const metrics = analytics.getDashboardMetrics();
  const userGrowth = analytics.getUserGrowthChart();
  const executionData = analytics.getExecutionChart();
  const planDistribution = analytics.getPlanDistribution();
  const topWorkflows = analytics.getTopWorkflows(5);
  const topUsers = analytics.getTopUsers(5);

  const PLAN_COLORS = {
    Free: '#6B7280',
    Pro: '#00C6FF',
    Enterprise: '#9D50BB',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
        <p className={`mt-1 ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>Real-time analytics and insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={metrics.totalUsers}
          icon={Users}
          change={metrics.userGrowthRate}
          trend={metrics.userGrowthRate >= 0 ? 'up' : 'down'}
          subtitle={`${metrics.newUsersThisMonth} new this month`}
          color="cyan"
          theme={theme}
        />
        <StatCard
          title="Total Workflows"
          value={metrics.totalWorkflows}
          icon={Workflow}
          subtitle={`${metrics.activeWorkflows} active`}
          color="violet"
          theme={theme}
        />
        <StatCard
          title="Total Executions"
          value={metrics.totalExecutions}
          icon={Activity}
          change={metrics.successRate}
          trend="up"
          subtitle={`${metrics.successRate}% success rate`}
          color="blue"
          theme={theme}
        />
        <StatCard
          title="Pro Plan Users"
          value={metrics.proPlanUsers}
          icon={TrendingUp}
          subtitle={`${metrics.freePlanUsers} on free plan`}
          color="green"
          theme={theme}
        />
        <StatCard
          title="Avg Execution Time"
          value={`${(metrics.avgExecutionTime / 1000).toFixed(1)}s`}
          icon={Clock}
          subtitle="Average completion time"
          color="orange"
          theme={theme}
        />
        <StatCard
          title="AI Tokens Used"
          value={metrics.totalAITokensUsed.toLocaleString()}
          icon={Zap}
          subtitle="Total across all executions"
          color="yellow"
          theme={theme}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <ChartCard title="User Growth (Last 30 Days)" theme={theme}>
          {userGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" />
                <XAxis dataKey="date" stroke="#CFCFE8" fontSize={12} />
                <YAxis stroke="#CFCFE8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A2E',
                    border: '1px solid #2A2A3E',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#00C6FF"
                  strokeWidth={2}
                  dot={{ fill: '#00C6FF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No user data yet" />
          )}
        </ChartCard>

        {/* Execution Chart */}
        <ChartCard title="Workflow Executions (Last 30 Days)" theme={theme}>
          {executionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={executionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" />
                <XAxis dataKey="date" stroke="#CFCFE8" fontSize={12} />
                <YAxis stroke="#CFCFE8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A2E',
                    border: '1px solid #2A2A3E',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="success" fill="#10B981" name="Successful" />
                <Bar dataKey="failed" fill="#EF4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No executions yet - Run some workflows!" />
          )}
        </ChartCard>
      </div>

      {/* Plan Distribution & Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Distribution */}
        <ChartCard title="Plan Distribution" theme={theme}>
          {planDistribution.some(p => p.value > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PLAN_COLORS[entry.name as keyof typeof PLAN_COLORS]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A2E',
                    border: '1px solid #2A2A3E',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No users yet" />
          )}
        </ChartCard>

        {/* Top Workflows */}
        <ListCard title="Top Workflows" theme={theme}>
          {topWorkflows.length > 0 ? (
            <div className="space-y-3">
              {topWorkflows.map((workflow, index) => (
                <div key={workflow.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center text-white text-xs font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm text-white truncate max-w-[150px]">{workflow.name}</p>
                      <p className="text-xs text-[#CFCFE8]">{workflow.executions} runs</p>
                    </div>
                  </div>
                  <div className="text-xs text-green-400">{workflow.successRate}%</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No workflows executed yet" />
          )}
        </ListCard>

        {/* Top Users */}
        <ListCard title="Top Users" theme={theme}>
          {topUsers.length > 0 ? (
            <div className="space-y-3">
              {topUsers.map((user, index) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-[#9D50BB] to-[#00C6FF] flex items-center justify-center text-white text-xs font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm text-white">{user.name}</p>
                      <p className="text-xs text-[#CFCFE8]">{user.executionsRun} executions</p>
                    </div>
                  </div>
                  <div className="text-xs text-[#CFCFE8]">{user.workflowsCreated} workflows</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No active users yet" />
          )}
        </ListCard>
      </div>
    </div>
  );
}

// Reusable Components

function StatCard({
  title,
  value,
  icon: Icon,
  change,
  trend,
  subtitle,
  color,
  theme,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: number;
  trend?: 'up' | 'down';
  subtitle?: string;
  color: 'cyan' | 'violet' | 'blue' | 'green' | 'orange' | 'yellow';
  theme: 'dark' | 'light';
}) {
  const colorMap = {
    cyan: 'from-[#00C6FF] to-[#0EA5E9]',
    violet: 'from-[#9D50BB] to-[#B876D5]',
    blue: 'from-[#3B82F6] to-[#60A5FA]',
    green: 'from-[#10B981] to-[#34D399]',
    orange: 'from-[#F97316] to-[#FB923C]',
    yellow: 'from-[#EAB308] to-[#FDE047]',
  };

  return (
    <div className={`rounded-xl p-6 ${
      theme === 'dark' 
        ? 'bg-[#1A1A2E] border border-[#2A2A3E]' 
        : 'bg-white border border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <p className={`text-sm ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>{title}</p>
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorMap[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className={`text-3xl font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      {subtitle && <p className={`text-xs ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>{subtitle}</p>}
      {change !== undefined && (
        <p className={`text-xs mt-2 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {trend === 'up' ? '↑' : '↓'} {Math.abs(change)}%
        </p>
      )}
    </div>
  );
}

function ChartCard({ title, children, theme }: { title: string; children: React.ReactNode; theme: 'dark' | 'light' }) {
  return (
    <div className={`rounded-xl p-6 ${
      theme === 'dark' 
        ? 'bg-[#1A1A2E] border border-[#2A2A3E]' 
        : 'bg-white border border-gray-200'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      {children}
    </div>
  );
}

function ListCard({ title, children, theme }: { title: string; children: React.ReactNode; theme: 'dark' | 'light' }) {
  return (
    <div className={`rounded-xl p-6 ${
      theme === 'dark' 
        ? 'bg-[#1A1A2E] border border-[#2A2A3E]' 
        : 'bg-white border border-gray-200'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[200px] text-[#CFCFE8] text-sm">
      {message}
    </div>
  );
}