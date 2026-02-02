/**
 * Projects Statistics Page
 * Shows aggregate stats for all projects
 */

import React from 'react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useThemeStore } from '@/core/stores/admin/themeStore';
import {
  FolderKanban,
  ListTodo,
  Clock,
  CheckCircle2,
  XCircle,
  Loader,
  AlertCircle,
  TrendingUp,
  Users,
  Activity,
  Zap,
} from 'lucide-react';

export const ProjectsStats: React.FC = () => {
  const { theme } = useThemeStore();

  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const cardBg = theme === 'dark' ? 'bg-[#1A1A2E] border-white/10' : 'bg-white border-gray-200';

  // Mock data - replace with real API calls
  const stats = {
    totalProjects: 156,
    projectsGrowth: 12,
    activeProjects: 134,
    archivedProjects: 18,
    suspendedProjects: 4,
    
    // Task board stats
    backlog: 342,
    todo: 189,
    inProgress: 95,
    inReview: 47,
    completed: 1248,
    blocked: 23,
    
    // Workflow stats
    totalWorkflows: 487,
    activeWorkflows: 423,
    draftWorkflows: 38,
    rejectedWorkflows: 26,
    pendingApproval: 15,
    
    // Activity stats
    avgTasksPerProject: 12.8,
    avgWorkflowsPerProject: 3.1,
    completionRate: 76,
    avgProjectAge: 45, // days
  };

  const taskStats = [
    { label: 'Backlog', count: stats.backlog, icon: ListTodo, color: 'gray' },
    { label: 'To Do', count: stats.todo, icon: Clock, color: 'blue' },
    { label: 'In Progress', count: stats.inProgress, icon: Loader, color: 'yellow' },
    { label: 'In Review', count: stats.inReview, icon: AlertCircle, color: 'violet' },
    { label: 'Completed', count: stats.completed, icon: CheckCircle2, color: 'green' },
    { label: 'Blocked', count: stats.blocked, icon: XCircle, color: 'red' },
  ];

  const workflowStats = [
    { label: 'Active', count: stats.activeWorkflows, color: 'green' },
    { label: 'Draft', count: stats.draftWorkflows, color: 'gray' },
    { label: 'Pending Approval', count: stats.pendingApproval, color: 'yellow' },
    { label: 'Rejected', count: stats.rejectedWorkflows, color: 'red' },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      gray: {
        bg: theme === 'dark' ? 'bg-gray-500/20' : 'bg-gray-100',
        text: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
        icon: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
      },
      blue: {
        bg: theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100',
        text: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
        icon: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      },
      yellow: {
        bg: theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100',
        text: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600',
        icon: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600',
      },
      violet: {
        bg: theme === 'dark' ? 'bg-violet-500/20' : 'bg-violet-100',
        text: theme === 'dark' ? 'text-violet-400' : 'text-violet-600',
        icon: theme === 'dark' ? 'text-violet-400' : 'text-violet-600',
      },
      green: {
        bg: theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100',
        text: theme === 'dark' ? 'text-green-400' : 'text-green-600',
        icon: theme === 'dark' ? 'text-green-400' : 'text-green-600',
      },
      red: {
        bg: theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100',
        text: theme === 'dark' ? 'text-red-400' : 'text-red-600',
        icon: theme === 'dark' ? 'text-red-400' : 'text-red-600',
      },
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${textColor}`}>Project Statistics</h1>
        <p className={`mt-1 ${mutedColor}`}>
          Aggregate stats across all projects, tasks, and workflows
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`${cardBg} p-6`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-lg ${getColorClasses('blue').bg}`}>
              <FolderKanban className={`w-5 h-5 ${getColorClasses('blue').icon}`} />
            </div>
            <Badge className={theme === 'dark' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200'}>
              <TrendingUp className="w-3 h-3 mr-1" />
              +{stats.projectsGrowth}%
            </Badge>
          </div>
          <p className={`text-3xl font-bold ${textColor}`}>{stats.totalProjects}</p>
          <p className={`text-sm ${mutedColor}`}>Total Projects</p>
        </Card>

        <Card className={`${cardBg} p-6`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-lg ${getColorClasses('green').bg}`}>
              <CheckCircle2 className={`w-5 h-5 ${getColorClasses('green').icon}`} />
            </div>
            <Badge className={theme === 'dark' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200'}>
              Active
            </Badge>
          </div>
          <p className={`text-3xl font-bold ${textColor}`}>{stats.activeProjects}</p>
          <p className={`text-sm ${mutedColor}`}>Active Projects</p>
        </Card>

        <Card className={`${cardBg} p-6`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-lg ${getColorClasses('violet').bg}`}>
              <Activity className={`w-5 h-5 ${getColorClasses('violet').icon}`} />
            </div>
            <Badge className={theme === 'dark' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'}>
              {stats.completionRate}%
            </Badge>
          </div>
          <p className={`text-3xl font-bold ${textColor}`}>{stats.completed}</p>
          <p className={`text-sm ${mutedColor}`}>Tasks Completed</p>
        </Card>

        <Card className={`${cardBg} p-6`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-lg ${getColorClasses('yellow').bg}`}>
              <Zap className={`w-5 h-5 ${getColorClasses('yellow').icon}`} />
            </div>
            <Badge className={theme === 'dark' ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' : 'bg-violet-50 text-violet-700 border-violet-200'}>
              Avg
            </Badge>
          </div>
          <p className={`text-3xl font-bold ${textColor}`}>{stats.avgTasksPerProject}</p>
          <p className={`text-sm ${mutedColor}`}>Tasks per Project</p>
        </Card>
      </div>

      {/* Task Board Stats */}
      <div>
        <h2 className={`text-xl font-bold mb-4 ${textColor}`}>Task Board Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {taskStats.map((stat) => {
            const Icon = stat.icon;
            const colors = getColorClasses(stat.color);
            
            return (
              <Card key={stat.label} className={`${cardBg} p-4`}>
                <div className={`p-3 rounded-lg mb-3 ${colors.bg}`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <p className={`text-2xl font-bold mb-1 ${textColor}`}>{stat.count}</p>
                <p className={`text-sm ${mutedColor}`}>{stat.label}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Workflow Stats */}
      <div>
        <h2 className={`text-xl font-bold mb-4 ${textColor}`}>Workflow Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={`${cardBg} p-6`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-lg ${getColorClasses('blue').bg}`}>
                <Activity className={`w-5 h-5 ${getColorClasses('blue').icon}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold ${textColor}`}>{stats.totalWorkflows}</p>
            <p className={`text-sm ${mutedColor}`}>Total Workflows</p>
          </Card>

          {workflowStats.map((stat) => {
            const colors = getColorClasses(stat.color);
            
            return (
              <Card key={stat.label} className={`${cardBg} p-6`}>
                <div className="flex items-center justify-between mb-3">
                  <Badge className={`${colors.bg} ${colors.text} border-0`}>
                    {stat.label}
                  </Badge>
                </div>
                <p className={`text-3xl font-bold ${textColor}`}>{stat.count}</p>
                <p className={`text-sm ${mutedColor}`}>{stat.label} Workflows</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Project Status Distribution */}
      <div>
        <h2 className={`text-xl font-bold mb-4 ${textColor}`}>Project Status Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={`${cardBg} p-6`}>
            <div className={`p-4 rounded-lg mb-4 ${getColorClasses('green').bg}`}>
              <div className="flex items-center justify-between">
                <CheckCircle2 className={`w-8 h-8 ${getColorClasses('green').icon}`} />
                <span className={`text-3xl font-bold ${getColorClasses('green').text}`}>
                  {stats.activeProjects}
                </span>
              </div>
            </div>
            <p className={`font-semibold ${textColor}`}>Active Projects</p>
            <p className={`text-sm ${mutedColor}`}>
              {((stats.activeProjects / stats.totalProjects) * 100).toFixed(1)}% of total
            </p>
          </Card>

          <Card className={`${cardBg} p-6`}>
            <div className={`p-4 rounded-lg mb-4 ${getColorClasses('gray').bg}`}>
              <div className="flex items-center justify-between">
                <FolderKanban className={`w-8 h-8 ${getColorClasses('gray').icon}`} />
                <span className={`text-3xl font-bold ${getColorClasses('gray').text}`}>
                  {stats.archivedProjects}
                </span>
              </div>
            </div>
            <p className={`font-semibold ${textColor}`}>Archived Projects</p>
            <p className={`text-sm ${mutedColor}`}>
              {((stats.archivedProjects / stats.totalProjects) * 100).toFixed(1)}% of total
            </p>
          </Card>

          <Card className={`${cardBg} p-6`}>
            <div className={`p-4 rounded-lg mb-4 ${getColorClasses('red').bg}`}>
              <div className="flex items-center justify-between">
                <AlertCircle className={`w-8 h-8 ${getColorClasses('red').icon}`} />
                <span className={`text-3xl font-bold ${getColorClasses('red').text}`}>
                  {stats.suspendedProjects}
                </span>
              </div>
            </div>
            <p className={`font-semibold ${textColor}`}>Suspended Projects</p>
            <p className={`text-sm ${mutedColor}`}>
              {((stats.suspendedProjects / stats.totalProjects) * 100).toFixed(1)}% of total
            </p>
          </Card>
        </div>
      </div>

      {/* Additional Metrics */}
      <div>
        <h2 className={`text-xl font-bold mb-4 ${textColor}`}>Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={`${cardBg} p-6`}>
            <p className={`text-sm ${mutedColor} mb-2`}>Avg Workflows/Project</p>
            <p className={`text-3xl font-bold ${textColor}`}>{stats.avgWorkflowsPerProject}</p>
          </Card>

          <Card className={`${cardBg} p-6`}>
            <p className={`text-sm ${mutedColor} mb-2`}>Avg Tasks/Project</p>
            <p className={`text-3xl font-bold ${textColor}`}>{stats.avgTasksPerProject}</p>
          </Card>

          <Card className={`${cardBg} p-6`}>
            <p className={`text-sm ${mutedColor} mb-2`}>Completion Rate</p>
            <p className={`text-3xl font-bold ${textColor}`}>{stats.completionRate}%</p>
          </Card>

          <Card className={`${cardBg} p-6`}>
            <p className={`text-sm ${mutedColor} mb-2`}>Avg Project Age</p>
            <p className={`text-3xl font-bold ${textColor}`}>{stats.avgProjectAge} days</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
