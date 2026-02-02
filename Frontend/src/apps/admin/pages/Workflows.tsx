/**
 * Workflows Management Page
 * Shows REAL workflows from workflowRegistryStore
 */

import React, { useState } from 'react';
import { Search, Eye, Trash2, Archive, CheckCircle, Globe } from 'lucide-react';
import { useWorkflowRegistryStore, SavedWorkflow } from '@/core/stores/core/workflowRegistryStore';
import { useThemeStore } from '@/core/stores/admin/themeStore';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';

export function WorkflowsPage() {
  const { theme } = useThemeStore();
  const workflowStore = useWorkflowRegistryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | SavedWorkflow['status']>('all');

  const allWorkflows = workflowStore.workflows;

  // Filter workflows
  const filteredWorkflows = allWorkflows.filter((workflow) => {
    const matchesSearch =
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      workflowStore.deleteWorkflow(id);
    }
  };

  const handlePublish = (id: string) => {
    workflowStore.publishWorkflow(id);
  };

  const handleArchive = (id: string) => {
    if (confirm('Archive this workflow? It will no longer be visible to users.')) {
      workflowStore.archiveWorkflow(id);
    }
  };

  const getStatusBadge = (status: SavedWorkflow['status']) => {
    const variants = {
      draft: { className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
      published: { className: 'bg-green-500/10 text-green-400 border-green-500/20' },
      archived: { className: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    };

    const config = variants[status];
    return (
      <span className={`px-2 py-1 rounded text-xs border ${config.className}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Workflows</h1>
        <p className={`mt-1 ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>
          {allWorkflows.length} total workflows
        </p>
      </div>

      {/* Filters */}
      <div className={`border rounded-xl p-6 ${theme === 'dark' ? 'bg-[#1A1A2E] border-[#2A2A3E]' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-500'}`} />
            <Input
              placeholder="Search workflows..."
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
              variant={filterStatus === 'draft' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('draft')}
            >
              Draft
            </Button>
            <Button
              variant={filterStatus === 'published' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('published')}
            >
              Published
            </Button>
            <Button
              variant={filterStatus === 'archived' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('archived')}
            >
              Archived
            </Button>
          </div>
        </div>
      </div>

      {/* Workflows Table */}
      <div className={`border rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-[#1A1A2E] border-[#2A2A3E]' : 'bg-white border-gray-200'}`}>
        {filteredWorkflows.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔄</span>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {searchQuery || filterStatus !== 'all' ? 'No Workflows Found' : 'No Workflows Yet'}
            </h3>
            <p className={theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}>
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Workflows will appear here when users save them from the workflow builder'}
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
                    Owner
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>
                    Status
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>
                    Stats
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>
                    Created
                  </th>
                  <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-[#2A2A3E]' : 'divide-gray-200'}`}>
                {filteredWorkflows.map((workflow) => (
                  <tr key={workflow.id} className={`transition-colors ${theme === 'dark' ? 'hover:bg-[#2A2A3E]/30' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{workflow.name}</p>
                          {workflow.isPublic && (
                            <Globe className="w-4 h-4 text-blue-400" title="Public workflow" />
                          )}
                        </div>
                        <p className={`text-sm truncate max-w-md ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>
                          {workflow.description}
                        </p>
                        {workflow.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {workflow.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className={`text-xs px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-[#2A2A3E] text-[#CFCFE8]' : 'bg-gray-100 text-gray-700'}`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>{workflow.userName}</p>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(workflow.status)}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{workflow.stats.executions} runs</p>
                        <p className={theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}>{workflow.stats.successRate}% success</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>{formatDate(workflow.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {workflow.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePublish(workflow.id)}
                            className="text-green-400 hover:text-green-300"
                            title="Publish workflow"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {workflow.status === 'published' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchive(workflow.id)}
                            className="text-orange-400 hover:text-orange-300"
                            title="Archive workflow"
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className={theme === 'dark' ? 'text-[#CFCFE8] hover:text-white' : 'text-gray-600 hover:text-gray-900'}
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(workflow.id, workflow.name)}
                          className="text-red-400 hover:text-red-300"
                          title="Delete workflow"
                        >
                          <Trash2 className="w-4 h-4" />
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