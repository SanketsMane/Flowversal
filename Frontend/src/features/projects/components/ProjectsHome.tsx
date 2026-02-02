/**
 * Projects Home Dashboard
 * Shows aggregated stats across all projects with filtering
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useProjectStore } from '@/core/stores/projectStore';
import { Users, ChevronDown, Check, BarChart3, ListChecks, Clock, CheckCircle2 } from 'lucide-react';

interface ProjectsHomeProps {
  onManageTeam: () => void;
}

export function ProjectsHome({ onManageTeam }: ProjectsHomeProps) {
  const { theme } = useTheme();
  const { projects } = useProjectStore();
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showDashboard, setShowDashboard] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Theme colors
  const bgPage = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-[#252540]' : 'hover:bg-gray-100';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock stats data (in real app, this would come from actual task data)
  const allStats = {
    totalTasks: 156,
    activeTasks: 89,
    completedTasks: 52,
    overdueTasks: 15,
    totalProjects: projects.length,
    activeBoards: projects.reduce((sum, p) => sum + p.boards.length, 0)
  };

  // Calculate filtered stats based on selected projects
  const getFilteredStats = () => {
    if (selectedProjects.length === 0) {
      return allStats;
    }
    
    // In real app, filter stats by selected projects
    // For now, return mock filtered data
    const ratio = selectedProjects.length / projects.length;
    return {
      totalTasks: Math.floor(allStats.totalTasks * ratio),
      activeTasks: Math.floor(allStats.activeTasks * ratio),
      completedTasks: Math.floor(allStats.completedTasks * ratio),
      overdueTasks: Math.floor(allStats.overdueTasks * ratio),
      totalProjects: selectedProjects.length,
      activeBoards: selectedProjects.reduce((sum, projectId) => {
        const project = projects.find(p => p.id === projectId);
        return sum + (project?.boards.length || 0);
      }, 0)
    };
  };

  const stats = getFilteredStats();

  const toggleProject = (projectId: string) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  const toggleAll = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map(p => p.id));
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0E0E1F] overflow-hidden"
    >
      {/* Header */}
      <div className={`${bgPage} border-b ${borderColor} px-8 py-6 flex items-center justify-between sticky top-0 z-10`}>
        <div>
          <h1 className={`text-3xl ${textPrimary} mb-1`}>Projects Dashboard</h1>
          <p className={`text-sm ${textSecondary}`}>
            Overview of all your projects and tasks
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} ${hoverBg} transition-all`}
            >
              <ListChecks className="w-4 h-4" />
              <span className="text-sm">
                {selectedProjects.length === 0 
                  ? 'All Projects' 
                  : `${selectedProjects.length} Project${selectedProjects.length > 1 ? 's' : ''}`}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showFilterDropdown && (
              <div className={`absolute top-full right-0 mt-2 w-72 ${bgCard} rounded-lg border ${borderColor} shadow-xl z-20 py-2`}>
                {/* Dashboard Toggle */}
                <div className={`px-4 py-2 border-b ${borderColor}`}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showDashboard}
                      onChange={(e) => setShowDashboard(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-sm ${textPrimary}`}>Show Dashboard Stats</span>
                  </label>
                </div>

                {/* Projects List */}
                <div className={`px-4 py-3 border-b ${borderColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs ${textSecondary} uppercase tracking-wider`}>Projects</span>
                    <button
                      onClick={toggleAll}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      {selectedProjects.length === projects.length ? 'Clear All' : 'Select All'}
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => toggleProject(project.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 ${hoverBg} transition-colors`}
                    >
                      <div className="w-4 h-4 rounded border ${borderColor} flex items-center justify-center flex-shrink-0">
                        {selectedProjects.includes(project.id) && (
                          <Check className="w-3 h-3 text-blue-500" />
                        )}
                      </div>
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" 
                        style={{ backgroundColor: project.color }}
                      >
                        <span className="text-sm">{project.icon}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className={`text-sm ${textPrimary}`}>{project.name}</div>
                        <div className={`text-xs ${textSecondary}`}>{project.boards.length} boards</div>
                      </div>
                    </button>
                  ))}
                </div>

                {projects.length === 0 && (
                  <div className={`px-4 py-6 text-center ${textSecondary} text-sm`}>
                    No projects yet
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onManageTeam}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border ${borderColor} ${textPrimary} ${hoverBg} transition-all`}
          >
            <Users className="w-4 h-4" />
            Manage Team
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {showDashboard && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Tasks */}
              <div className={`${bgCard} rounded-xl border ${borderColor} p-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className={`text-3xl ${textPrimary} mb-1`}>{stats.totalTasks}</div>
                  <div className={`text-sm ${textSecondary}`}>Total Tasks</div>
                </div>
              </div>

              {/* Active Tasks */}
              <div className={`${bgCard} rounded-xl border ${borderColor} p-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-bl-full"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-8 h-8 text-cyan-500" />
                  </div>
                  <div className={`text-3xl ${textPrimary} mb-1`}>{stats.activeTasks}</div>
                  <div className={`text-sm ${textSecondary}`}>Active Tasks</div>
                </div>
              </div>

              {/* Completed Tasks */}
              <div className={`${bgCard} rounded-xl border ${borderColor} p-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-full"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <div className={`text-3xl ${textPrimary} mb-1`}>{stats.completedTasks}</div>
                  <div className={`text-sm ${textSecondary}`}>Completed</div>
                </div>
              </div>

              {/* Overdue Tasks */}
              <div className={`${bgCard} rounded-xl border ${borderColor} p-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/20 to-transparent rounded-bl-full"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className={`text-3xl ${textPrimary} mb-1`}>{stats.overdueTasks}</div>
                  <div className={`text-sm ${textSecondary}`}>Overdue</div>
                </div>
              </div>
            </div>

            {/* Projects Summary */}
            <div className={`${bgCard} rounded-xl border ${borderColor} p-6 mb-8`}>
              <h2 className={`text-xl ${textPrimary} mb-4`}>Projects Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className={`text-2xl ${textPrimary} mb-1`}>{stats.totalProjects}</div>
                  <div className={`text-sm ${textSecondary}`}>Active Projects</div>
                </div>
                <div>
                  <div className={`text-2xl ${textPrimary} mb-1`}>{stats.activeBoards}</div>
                  <div className={`text-sm ${textSecondary}`}>Total Boards</div>
                </div>
                <div>
                  <div className={`text-2xl ${textPrimary} mb-1`}>
                    {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                  </div>
                  <div className={`text-sm ${textSecondary}`}>Completion Rate</div>
                </div>
              </div>
            </div>

            {/* Projects List */}
            <div className={`${bgCard} rounded-xl border ${borderColor} overflow-hidden`}>
              <div className="p-6 border-b ${borderColor}">
                <h2 className={`text-xl ${textPrimary}`}>Your Projects</h2>
              </div>
              <div className="divide-y ${borderColor}">
                {(selectedProjects.length > 0 
                  ? projects.filter(p => selectedProjects.includes(p.id))
                  : projects
                ).map((project) => (
                  <div key={project.id} className={`p-6 ${hoverBg} transition-colors`}>
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      >
                        {project.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg ${textPrimary} mb-1`}>{project.name}</h3>
                        <p className={`text-sm ${textSecondary}`}>{project.description}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm ${textPrimary} mb-1`}>{project.boards.length} Boards</div>
                        <div className={`text-xs ${textSecondary}`}>
                          Created {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!showDashboard && (
          <div className="text-center py-16">
            <BarChart3 className={`w-16 h-16 ${textSecondary} mx-auto mb-4 opacity-50`} />
            <p className={`text-lg ${textSecondary}`}>Dashboard stats hidden</p>
            <p className={`text-sm ${textSecondary} mt-2`}>Enable "Show Dashboard Stats" in the filter menu</p>
          </div>
        )}
      </div>
    </div>
  );
}