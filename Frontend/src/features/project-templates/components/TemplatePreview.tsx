/**
 * Template Preview Component
 * Detailed preview of a project template before using it
 */

import React, { useState } from 'react';
import { ProjectTemplate } from '../types/projectTemplate.types';
import { getTemplateStats } from '../utils/projectTemplateManager';
import { useTheme } from '@/core/theme/ThemeContext';
import {
  X,
  Layers,
  CheckSquare,
  Zap,
  Clock,
  Users,
  Star,
  ChevronDown,
  ChevronUp,
  Check,
  Key,
  TrendingUp,
} from 'lucide-react';
import { RenderIconByName } from '@/shared/components/ui/SimpleIconPicker';

interface TemplatePreviewProps {
  template: ProjectTemplate;
  onUse: () => void;
  onClose: () => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onUse, onClose }) => {
  const { theme } = useTheme();
  const [expandedBoards, setExpandedBoards] = useState<Set<string>>(new Set([template.boards[0]?.id]));
  // Track selected boards and tasks
  const [selectedBoards, setSelectedBoards] = useState<Set<string>>(new Set(template.boards.map(b => b.id)));
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set(
    template.boards.flatMap(board => board.tasks.map(task => task.id))
  ));
  const stats = getTemplateStats(template);

  // Theme colors
  const bgModal = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgPage = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  const toggleBoard = (boardId: string) => {
    setExpandedBoards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(boardId)) {
        newSet.delete(boardId);
      } else {
        newSet.add(boardId);
      }
      return newSet;
    });
  };

  const toggleBoardSelection = (boardId: string) => {
    setSelectedBoards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(boardId)) {
        newSet.delete(boardId);
        // Also deselect all tasks in this board
        const board = template.boards.find(b => b.id === boardId);
        if (board) {
          setSelectedTasks(prevTasks => {
            const newTasks = new Set(prevTasks);
            board.tasks.forEach(task => newTasks.delete(task.id));
            return newTasks;
          });
        }
      } else {
        newSet.add(boardId);
        // Also select all tasks in this board
        const board = template.boards.find(b => b.id === boardId);
        if (board) {
          setSelectedTasks(prevTasks => {
            const newTasks = new Set(prevTasks);
            board.tasks.forEach(task => newTasks.add(task.id));
            return newTasks;
          });
        }
      }
      return newSet;
    });
  };

  const toggleTaskSelection = (boardId: string, taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      
      // Check if all tasks in board are selected/deselected
      const board = template.boards.find(b => b.id === boardId);
      if (board) {
        const allTasksSelected = board.tasks.every(task => 
          task.id === taskId ? newSet.has(taskId) : newSet.has(task.id)
        );
        const noTasksSelected = board.tasks.every(task => 
          task.id === taskId ? !newSet.has(taskId) : !newSet.has(task.id)
        );
        
        if (allTasksSelected) {
          setSelectedBoards(prevBoards => new Set([...prevBoards, boardId]));
        } else if (noTasksSelected) {
          setSelectedBoards(prevBoards => {
            const newBoards = new Set(prevBoards);
            newBoards.delete(boardId);
            return newBoards;
          });
        }
      }
      
      return newSet;
    });
  };

  const handleUseTemplate = () => {
    // You could pass the selected boards and tasks to the onUse handler
    // For now, we'll just call the original onUse
    // In a full implementation, you'd modify the template based on selections
    console.log('Selected boards:', Array.from(selectedBoards));
    console.log('Selected tasks:', Array.from(selectedTasks));
    onUse();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className={`${bgModal} rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className={`px-8 py-6 border-b ${borderColor}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 flex items-center justify-center flex-shrink-0">
                <RenderIconByName name={template.icon} className="w-10 h-10 text-[#00C6FF]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className={`text-3xl ${textPrimary}`}>{template.name}</h2>
                  {template.featured && (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white">
                      <Star className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                </div>
                <p className={`${textSecondary} mb-4`}>{template.description}</p>
                
                {/* Industries */}
                <div className="flex flex-wrap gap-2">
                  {template.industry.map((ind, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-3 py-1 rounded-full ${
                        theme === 'dark' ? 'bg-[#2A2A3E] text-[#CFCFE8]' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`${textMuted} hover:text-red-500 transition-colors ml-4`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className={`${bgPage} border ${borderColor} rounded-xl p-4`}>
                <Layers className={`w-8 h-8 ${textMuted} mb-2`} />
                <div className={`text-2xl ${textPrimary} mb-1`}>{stats.totalBoards}</div>
                <div className={`text-sm ${textMuted}`}>Boards</div>
              </div>
              <div className={`${bgPage} border ${borderColor} rounded-xl p-4`}>
                <CheckSquare className={`w-8 h-8 ${textMuted} mb-2`} />
                <div className={`text-2xl ${textPrimary} mb-1`}>{stats.totalTasks}</div>
                <div className={`text-sm ${textMuted}`}>Tasks</div>
              </div>
              <div className={`${bgPage} border ${borderColor} rounded-xl p-4`}>
                <Zap className={`w-8 h-8 ${textMuted} mb-2`} />
                <div className={`text-2xl ${textPrimary} mb-1`}>{stats.totalWorkflows}</div>
                <div className={`text-sm ${textMuted}`}>Workflows</div>
              </div>
              <div className={`${bgPage} border ${borderColor} rounded-xl p-4`}>
                <Clock className={`w-8 h-8 ${textMuted} mb-2`} />
                <div className={`text-2xl ${textPrimary} mb-1`}>~{template.estimatedSetupTime}</div>
                <div className={`text-sm ${textMuted}`}>Setup Time</div>
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h3 className={`text-xl ${textPrimary} mb-4 flex items-center gap-2`}>
                <TrendingUp className="w-5 h-5 text-[#00C6FF]" />
                Key Benefits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {template.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className={`text-sm ${textSecondary}`}>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Use Cases */}
            <div>
              <h3 className={`text-xl ${textPrimary} mb-4`}>Use Cases</h3>
              <ul className="space-y-2">
                {template.useCases.map((useCase, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">{idx + 1}</span>
                    </div>
                    <span className={`text-sm ${textSecondary}`}>{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Boards Preview */}
            <div>
              <h3 className={`text-xl ${textPrimary} mb-4`}>Included Boards</h3>
              <div className="space-y-3">
                {template.boards.map(board => {
                  const isExpanded = expandedBoards.has(board.id);
                  
                  return (
                    <div
                      key={board.id}
                      className={`${bgPage} border ${borderColor} rounded-xl overflow-hidden`}
                    >
                      <div className={`w-full px-6 py-4 flex items-center justify-between`}>
                        <div className="flex items-center gap-3 flex-1">
                          {/* Board Checkbox */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBoardSelection(board.id);
                            }}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              selectedBoards.has(board.id)
                                ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] border-[#00C6FF]'
                                : theme === 'dark' ? 'border-[#2A2A3E] hover:border-[#00C6FF]' : 'border-gray-300 hover:border-[#00C6FF]'
                            }`}
                          >
                            {selectedBoards.has(board.id) && <Check className="w-3 h-3 text-white" />}
                          </button>
                          
                          <button
                            onClick={() => toggleBoard(board.id)}
                            className="flex items-center gap-3 flex-1"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#00C6FF]/10 to-[#9D50BB]/10 flex items-center justify-center">
                              <RenderIconByName name={board.icon || 'LayoutDashboard'} className="w-5 h-5 text-[#00C6FF]" />
                            </div>
                            <div className="text-left">
                              <div className={`${textPrimary} mb-1`}>{board.name}</div>
                              <div className={`text-sm ${textMuted}`}>
                                {board.tasks.filter(t => selectedTasks.has(t.id)).length} of {board.tasks.length} tasks selected
                              </div>
                            </div>
                          </button>
                        </div>
                        <button
                          onClick={() => toggleBoard(board.id)}
                          className="flex-shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronUp className={`w-5 h-5 ${textMuted}`} />
                          ) : (
                            <ChevronDown className={`w-5 h-5 ${textMuted}`} />
                          )}
                        </button>
                      </div>
                      
                      {isExpanded && (
                        <div className={`px-6 pb-4 border-t ${borderColor}`}>
                          {board.description && (
                            <p className={`${textSecondary} text-sm mb-4 mt-4`}>{board.description}</p>
                          )}
                          <div className="space-y-2">
                            {board.tasks.map(task => (
                              <div
                                key={task.id}
                                className={`flex items-start gap-3 p-3 rounded-lg ${
                                  theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white'
                                }`}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTaskSelection(board.id, task.id);
                                  }}
                                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                    selectedTasks.has(task.id)
                                      ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] border-[#00C6FF]'
                                      : theme === 'dark' ? 'border-[#2A2A3E] hover:border-[#00C6FF]' : 'border-gray-300 hover:border-[#00C6FF]'
                                  }`}
                                >
                                  {selectedTasks.has(task.id) && <Check className="w-3 h-3 text-white" />}
                                </button>
                                <div className="flex-1">
                                  <div className={`text-sm ${textPrimary} mb-1`}>{task.title}</div>
                                  <div className={`text-xs ${textMuted}`}>{task.description}</div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                      task.priority === 'high'
                                        ? 'bg-red-500/20 text-red-400'
                                        : task.priority === 'medium'
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : 'bg-blue-500/20 text-blue-400'
                                    }`}>
                                      {task.priority}
                                    </span>
                                    {task.workflowId && (
                                      <span className={`text-xs px-2 py-0.5 rounded ${
                                        theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                                      }`}>
                                        <Zap className="w-3 h-3 inline mr-1" />
                                        Workflow attached
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Required Integrations */}
            {template.requiredIntegrations.length > 0 && (
              <div>
                <h3 className={`text-xl ${textPrimary} mb-4`}>Required Integrations</h3>
                <div className="flex flex-wrap gap-2">
                  {template.requiredIntegrations.map((integration, idx) => (
                    <span
                      key={idx}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                        theme === 'dark' ? 'bg-[#2A2A3E] text-[#CFCFE8]' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      <Key className="w-4 h-4" />
                      {integration}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Usage Count */}
            {template.usageCount && (
              <div className={`${bgPage} border ${borderColor} rounded-xl p-6 text-center`}>
                <Users className={`w-12 h-12 ${textMuted} mx-auto mb-3`} />
                <div className={`text-2xl ${textPrimary} mb-1`}>
                  {template.usageCount.toLocaleString()}+
                </div>
                <div className={`text-sm ${textMuted}`}>Teams using this template</div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-8 py-4 border-t ${borderColor} flex items-center justify-between`}>
          <div className={`text-sm ${textMuted}`}>
            Created by {template.author || 'Flowversal Team'}
          </div>
          <button
            onClick={handleUseTemplate}
            className="px-8 py-3 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white rounded-lg hover:opacity-90 transition-opacity text-lg"
            disabled={selectedBoards.size === 0}
          >
            Use This Template ({selectedBoards.size} board{selectedBoards.size !== 1 ? 's' : ''})
          </button>
        </div>
      </div>
    </div>
  );
};
