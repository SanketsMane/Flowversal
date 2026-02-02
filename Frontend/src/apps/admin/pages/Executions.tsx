/**
 * Executions Page
 * Shows real execution logs from executionStore
 */

import React, { useState } from 'react';
import { Search, Eye, Filter, Rocket } from 'lucide-react';
import { useExecutionStore, ExecutionLog } from '@/core/stores/core/executionStore';
import { useThemeStore } from '@/core/stores/admin/themeStore';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { ExecutionLiveIndicator } from '@/shared/components/ui/ExecutionLiveIndicator';

export function ExecutionsPage() {
  const { theme } = useThemeStore();
  const executionStore = useExecutionStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | ExecutionLog['status']>('all');

  const allExecutions = executionStore.executions;

  // Filter executions
  const filteredExecutions = allExecutions.filter((exec) => {
    const matchesSearch =
      exec.workflowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exec.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || exec.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ExecutionLog['status']) => {
    const variants = {
      success: { variant: 'default' as const, className: 'bg-green-500/10 text-green-400 border-green-500/20' },
      failed: { variant: 'destructive' as const, className: 'bg-red-500/10 text-red-400 border-red-500/20' },
      running: { variant: 'secondary' as const, className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
      canceled: { variant: 'outline' as const, className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
    };

    const config = variants[status];
    return (
      <span className={`px-2 py-1 rounded text-xs border ${config.className}`}>
        {status}
      </span>
    );
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Execution Logs</h1>
        <p className={`mt-1 ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>
          {allExecutions.length} total executions
        </p>
      </div>

      {/* Live Execution Indicator */}
      <ExecutionLiveIndicator />

      {/* Filters */}
      <div className={`border rounded-xl p-6 ${theme === 'dark' ? 'bg-[#1A1A2E] border-[#2A2A3E]' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-500'}`} />
            <Input
              placeholder="Search by workflow or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${theme === 'dark' ? 'bg-[#0E0E1F] border-[#2A2A3E]' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'success' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('success')}
            >
              Success
            </Button>
            <Button
              variant={filterStatus === 'failed' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('failed')}
            >
              Failed
            </Button>
            <Button
              variant={filterStatus === 'running' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('running')}
            >
              Running
            </Button>
          </div>
        </div>
      </div>

      {/* Executions Table */}
      <div className={`border rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-[#1A1A2E] border-[#2A2A3E]' : 'bg-white border-gray-200'}`}>
        {filteredExecutions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No Executions Yet</h3>
            <p className={theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}>
              Execution logs will appear here when workflows are run.
              <br />
              Try running a workflow from the main app!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b ${theme === 'dark' ? 'bg-[#0E0E1F] border-[#2A2A3E]' : 'bg-gray-50 border-gray-200'}`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>
                    Workflow
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>
                    User
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>
                    Status
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>
                    Progress
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>
                    Duration
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>
                    Started
                  </th>
                  <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-[#2A2A3E]' : 'divide-gray-200'}`}>
                {filteredExecutions.map((exec) => (
                  <tr key={exec.id} className={`transition-colors ${theme === 'dark' ? 'hover:bg-[#2A2A3E]/30' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4">
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{exec.workflowName}</p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>{exec.triggerType}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>{exec.userName}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(exec.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`flex-1 h-2 rounded-full overflow-hidden max-w-[100px] ${theme === 'dark' ? 'bg-[#2A2A3E]' : 'bg-gray-200'}`}>
                          <div
                            className="h-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB]"
                            style={{
                              width: `${(exec.stepsExecuted / exec.totalSteps) * 100}%`,
                            }}
                          />
                        </div>
                        <span className={`text-xs ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>
                          {exec.stepsExecuted}/{exec.totalSteps}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>
                        {formatDuration(exec.duration)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>
                        {new Date(exec.startedAt).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={theme === 'dark' ? 'text-[#CFCFE8] hover:text-white' : 'text-gray-600 hover:text-gray-900'}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}