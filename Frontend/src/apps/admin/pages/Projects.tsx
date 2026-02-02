/**
 * Projects Management Page
 * Admin view of all user projects
 */

import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { useThemeStore } from '@/core/stores/admin/themeStore';
import {
  Search,
  FolderKanban,
  User,
  Calendar,
  Eye,
  Trash2,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  workflowCount: number;
  executionCount: number;
  status: 'active' | 'archived' | 'suspended';
  visibility: 'private' | 'public';
}

export const Projects: React.FC = () => {
  const { theme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | Project['status']>('all');
  const [filterVisibility, setFilterVisibility] = useState<'all' | Project['visibility']>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'workflows' | 'executions'>('date');

  const projects = getMockProjects();

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.owner.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesVisibility = filterVisibility === 'all' || project.visibility === filterVisibility;

    return matchesSearch && matchesStatus && matchesVisibility;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'workflows':
        return b.workflowCount - a.workflowCount;
      case 'executions':
        return b.executionCount - a.executionCount;
      default:
        return 0;
    }
  });

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return theme === 'dark'
          ? 'bg-green-500/20 text-green-400 border-green-500/30'
          : 'bg-green-50 text-green-700 border-green-200';
      case 'archived':
        return theme === 'dark'
          ? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
          : 'bg-gray-50 text-gray-700 border-gray-200';
      case 'suspended':
        return theme === 'dark'
          ? 'bg-red-500/20 text-red-400 border-red-500/30'
          : 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedColor = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const cardBg = theme === 'dark' ? 'bg-[#1A1A2E] border-white/10' : 'bg-white border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl ${textColor}`}>Projects</h1>
          <p className={`mt-1 ${mutedColor}`}>
            Manage all user projects - {projects.length} total
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className={`${cardBg} p-6`}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${mutedColor}`} />
            <Input
              placeholder="Search by project name, owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${theme === 'dark' ? 'bg-[#0E0E1F] border-[#2A2A3E] text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {(['all', 'active', 'archived', 'suspended'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white'
                    : theme === 'dark'
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Visibility Filter */}
          <div className="flex gap-2">
            {(['all', 'private', 'public'] as const).map((visibility) => (
              <button
                key={visibility}
                onClick={() => setFilterVisibility(visibility)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filterVisibility === visibility
                    ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white'
                    : theme === 'dark'
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
              </button>
            ))}
          </div>

          {/* Sort By */}
          <div className="flex gap-2">
            {(['name', 'date', 'workflows', 'executions'] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  sortBy === sort
                    ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white'
                    : theme === 'dark'
                    ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <Card
              key={project.id}
              className={`${cardBg} p-6 ${hoverBg} cursor-pointer transition-all`}
              onClick={() => setSelectedProject(project)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500">
                    <FolderKanban className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${textColor}`}>{project.name}</h3>
                    <p className={`text-xs ${mutedColor}`}>{project.owner.name}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>

              <p className={`text-sm ${mutedColor} mb-4 line-clamp-2`}>
                {project.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-2xl font-semibold ${textColor}`}>{project.workflowCount}</p>
                  <p className={`text-xs ${mutedColor}`}>Workflows</p>
                </div>
                <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-2xl font-semibold ${textColor}`}>{project.executionCount}</p>
                  <p className={`text-xs ${mutedColor}`}>Executions</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <Badge variant="outline" className={`text-xs ${theme === 'dark' ? 'border-white/20' : 'border-gray-300'}`}>
                  {project.visibility}
                </Badge>
              </div>
            </Card>
          ))
        ) : (
          <div className={`col-span-full text-center py-12 ${mutedColor}`}>
            No projects found matching your filters
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProject(null)}
        >
          <Card
            className={`${cardBg} p-6 max-w-2xl w-full max-h-[80vh] overflow-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500">
                  <FolderKanban className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl ${textColor}`}>{selectedProject.name}</h2>
                  <Badge className={getStatusColor(selectedProject.status)}>
                    {selectedProject.status}
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => setSelectedProject(null)}
                variant="outline"
                className={theme === 'dark' ? 'border-white/20' : 'border-gray-300'}
              >
                Close
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <label className={`text-sm ${mutedColor}`}>Description</label>
                <p className={textColor}>{selectedProject.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm ${mutedColor}`}>Owner</label>
                  <p className={textColor}>{selectedProject.owner.name}</p>
                  <p className={`text-sm ${mutedColor}`}>{selectedProject.owner.email}</p>
                </div>
                <div>
                  <label className={`text-sm ${mutedColor}`}>Visibility</label>
                  <p className={textColor}>{selectedProject.visibility}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-2xl font-semibold ${textColor}`}>{selectedProject.workflowCount}</p>
                  <p className={`text-sm ${mutedColor}`}>Workflows</p>
                </div>
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-2xl font-semibold ${textColor}`}>{selectedProject.executionCount}</p>
                  <p className={`text-sm ${mutedColor}`}>Executions</p>
                </div>
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-2xl font-semibold ${textColor}`}>
                    {selectedProject.executionCount > 0 ? Math.round((selectedProject.executionCount / selectedProject.workflowCount) * 100) / 100 : 0}
                  </p>
                  <p className={`text-sm ${mutedColor}`}>Avg per Workflow</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm ${mutedColor}`}>Created</label>
                  <p className={textColor}>{new Date(selectedProject.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className={`text-sm ${mutedColor}`}>Last Updated</label>
                  <p className={textColor}>{new Date(selectedProject.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  className={`flex-1 ${theme === 'dark' ? 'border-white/20' : 'border-gray-300'}`}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Workflows
                </Button>
                <Button
                  variant="outline"
                  className={`flex-1 ${theme === 'dark' ? 'border-white/20' : 'border-gray-300'}`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button
                  variant="outline"
                  className={`${theme === 'dark' ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-red-300 text-red-700 hover:bg-red-50'}`}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Mock data
function getMockProjects(): Project[] {
  return [
    {
      id: '1',
      name: 'Customer Onboarding',
      description: 'Automated customer onboarding workflows with email notifications and data collection',
      owner: { id: '1', name: 'John Doe', email: 'john@example.com' },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-11-18T15:30:00Z',
      workflowCount: 12,
      executionCount: 456,
      status: 'active',
      visibility: 'private',
    },
    {
      id: '2',
      name: 'Sales Pipeline',
      description: 'Lead qualification and nurturing automation',
      owner: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      createdAt: '2024-02-20T09:00:00Z',
      updatedAt: '2024-11-19T10:00:00Z',
      workflowCount: 8,
      executionCount: 234,
      status: 'active',
      visibility: 'public',
    },
    {
      id: '3',
      name: 'Support Tickets',
      description: 'Automated ticket routing and response system',
      owner: { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
      createdAt: '2024-03-10T14:00:00Z',
      updatedAt: '2024-10-15T12:00:00Z',
      workflowCount: 5,
      executionCount: 789,
      status: 'archived',
      visibility: 'private',
    },
    {
      id: '4',
      name: 'Marketing Campaigns',
      description: 'Multi-channel marketing automation',
      owner: { id: '1', name: 'John Doe', email: 'john@example.com' },
      createdAt: '2024-04-05T11:00:00Z',
      updatedAt: '2024-11-10T16:00:00Z',
      workflowCount: 15,
      executionCount: 1234,
      status: 'active',
      visibility: 'public',
    },
    {
      id: '5',
      name: 'Data Synchronization',
      description: 'Sync data between multiple systems',
      owner: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      createdAt: '2024-05-12T08:00:00Z',
      updatedAt: '2024-08-20T09:00:00Z',
      workflowCount: 3,
      executionCount: 45,
      status: 'suspended',
      visibility: 'private',
    },
    {
      id: '6',
      name: 'HR Automation',
      description: 'Employee onboarding and offboarding processes',
      owner: { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
      createdAt: '2024-06-01T13:00:00Z',
      updatedAt: '2024-11-15T14:00:00Z',
      workflowCount: 7,
      executionCount: 123,
      status: 'active',
      visibility: 'private',
    },
  ];
}