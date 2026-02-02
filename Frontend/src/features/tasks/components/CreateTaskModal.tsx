/**
 * Universal Task Creation Modal
 * Can be used from anywhere - Home, Board, My Tasks
 * Allows selecting project and board dynamically
 */

import { useState, useEffect } from 'react';
import { X, Calendar, User, Tag, AlertCircle, Workflow, ChevronDown } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useProjectStore } from '@/core/stores/projectStore';
import { RenderIcon } from './IconLibrary';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: any) => void;
  defaultProjectId?: string;
  defaultBoardId?: string;
  defaultStatus?: string;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onSave,
  defaultProjectId,
  defaultBoardId,
  defaultStatus = 'To do',
}: CreateTaskModalProps) {
  const { theme } = useTheme();
  const { projects, boards, getBoardsByProject } = useProjectStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectId: defaultProjectId || '',
    boardId: defaultBoardId || '',
    status: defaultStatus,
    priority: 'Medium',
    assignedTo: [] as Array<{ id: string; name: string; avatar: string }>,
    labels: [] as Array<{ id: string; name: string; color: string }>,
    dueDate: undefined as Date | undefined,
    hasWorkflow: false,
  });

  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  // Update boards when project changes
  const availableBoards = formData.projectId
    ? getBoardsByProject(formData.projectId)
    : [];

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      setFormData({
        name: '',
        description: '',
        projectId: defaultProjectId || projects[0]?.id || '',
        boardId: defaultBoardId || '',
        status: defaultStatus,
        priority: 'Medium',
        assignedTo: [],
        labels: [],
        dueDate: undefined,
        hasWorkflow: false,
      });
    }
  }, [isOpen, defaultProjectId, defaultBoardId, defaultStatus, projects]);

  // Auto-select first board when project changes
  useEffect(() => {
    if (formData.projectId && !defaultBoardId) {
      const projectBoards = getBoardsByProject(formData.projectId);
      if (projectBoards.length > 0 && !formData.boardId) {
        setFormData(prev => ({ ...prev, boardId: projectBoards[0].id }));
      }
    }
  }, [formData.projectId, defaultBoardId, getBoardsByProject]);

  const handleSave = () => {
    if (!formData.name.trim()) return;
    if (!formData.projectId || !formData.boardId) return;

    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const bgPanel = theme === 'dark' ? 'bg-[#252540]' : 'bg-gray-100';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  const statuses = ['Backlog', 'To do', 'In Progress', 'Review', 'Blocked', 'Done'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  const selectedProject = projects.find(p => p.id === formData.projectId);
  const selectedBoard = boards.find(b => b.id === formData.boardId);

  const statusColors: Record<string, string> = {
    'Backlog': '#94A3B8',
    'To do': '#F59E0B',
    'In Progress': '#3B82F6',
    'Review': '#8B5CF6',
    'Blocked': '#EF4444',
    'Done': '#10B981'
  };

  const priorityColors: Record<string, string> = {
    'Critical': 'text-red-500',
    'High': 'text-orange-500',
    'Medium': 'text-yellow-500',
    'Low': 'text-gray-500'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`${bgMain} rounded-xl border ${borderColor} w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 ${bgMain} border-b ${borderColor} p-6 flex items-center justify-between z-10`}>
          <h2 className={`text-2xl ${textPrimary}`}>Create New Task</h2>
          <button onClick={onClose} className={`p-2 rounded-lg ${hoverBg} ${textSecondary}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Task Name */}
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>Task Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter task name..."
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} placeholder:${textSecondary} focus:outline-none focus:ring-2 focus:ring-[#00C6FF]`}
            />
          </div>

          {/* Project Selection */}
          <div className="relative">
            <label className={`block text-sm ${textSecondary} mb-2`}>Project *</label>
            <button
              onClick={() => {
                setShowProjectDropdown(!showProjectDropdown);
                setShowBoardDropdown(false);
                setShowStatusDropdown(false);
                setShowPriorityDropdown(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} ${hoverBg}`}
            >
              {selectedProject ? (
                <>
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: selectedProject.iconColor + '20' }}
                  >
                    <RenderIcon 
                      name={selectedProject.icon} 
                      className="w-5 h-5" 
                      style={{ color: selectedProject.iconColor }}
                    />
                  </div>
                  <span className="flex-1 text-left">{selectedProject.name}</span>
                </>
              ) : (
                <span className={`flex-1 text-left ${textSecondary}`}>Select a project</span>
              )}
              <ChevronDown className="w-4 h-4" />
            </button>

            {showProjectDropdown && (
              <div className={`absolute top-full left-0 right-0 mt-2 ${bgCard} border ${borderColor} rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto`}>
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setFormData({ ...formData, projectId: project.id, boardId: '' });
                      setShowProjectDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 ${hoverBg} ${
                      formData.projectId === project.id ? 'bg-[#00C6FF]/10' : ''
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: project.iconColor + '20' }}
                    >
                      <RenderIcon 
                        name={project.icon} 
                        className="w-5 h-5" 
                        style={{ color: project.iconColor }}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={textPrimary}>{project.name}</p>
                      {project.description && (
                        <p className={`text-xs ${textSecondary}`}>{project.description}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Board Selection */}
          <div className="relative">
            <label className={`block text-sm ${textSecondary} mb-2`}>Board *</label>
            <button
              onClick={() => {
                if (availableBoards.length > 0) {
                  setShowBoardDropdown(!showBoardDropdown);
                  setShowProjectDropdown(false);
                  setShowStatusDropdown(false);
                  setShowPriorityDropdown(false);
                }
              }}
              disabled={availableBoards.length === 0}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} ${
                availableBoards.length > 0 ? hoverBg : 'opacity-50 cursor-not-allowed'
              }`}
            >
              {selectedBoard ? (
                <>
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: selectedBoard.iconColor + '20' }}
                  >
                    <RenderIcon 
                      name={selectedBoard.icon} 
                      className="w-5 h-5" 
                      style={{ color: selectedBoard.iconColor }}
                    />
                  </div>
                  <span className="flex-1 text-left">{selectedBoard.name}</span>
                </>
              ) : (
                <span className={`flex-1 text-left ${textSecondary}`}>
                  {availableBoards.length === 0 ? 'No boards available' : 'Select a board'}
                </span>
              )}
              <ChevronDown className="w-4 h-4" />
            </button>

            {showBoardDropdown && (
              <div className={`absolute top-full left-0 right-0 mt-2 ${bgCard} border ${borderColor} rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto`}>
                {availableBoards.map((board) => (
                  <button
                    key={board.id}
                    onClick={() => {
                      setFormData({ ...formData, boardId: board.id });
                      setShowBoardDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 ${hoverBg} ${
                      formData.boardId === board.id ? 'bg-[#00C6FF]/10' : ''
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: board.iconColor + '20' }}
                    >
                      <RenderIcon 
                        name={board.icon} 
                        className="w-5 h-5" 
                        style={{ color: board.iconColor }}
                      />
                    </div>
                    <span className={`flex-1 text-left ${textPrimary}`}>{board.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="relative">
              <label className={`block text-sm ${textSecondary} mb-2`}>Status</label>
              <button
                onClick={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowProjectDropdown(false);
                  setShowBoardDropdown(false);
                  setShowPriorityDropdown(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} ${hoverBg}`}
              >
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: statusColors[formData.status] }}
                ></div>
                <span className="flex-1 text-left">{formData.status}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showStatusDropdown && (
                <div className={`absolute top-full left-0 right-0 mt-2 ${bgCard} border ${borderColor} rounded-lg shadow-xl z-20`}>
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFormData({ ...formData, status });
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2 ${hoverBg}`}
                    >
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: statusColors[status] }}
                      ></div>
                      <span className={textPrimary}>{status}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Priority */}
            <div className="relative">
              <label className={`block text-sm ${textSecondary} mb-2`}>Priority</label>
              <button
                onClick={() => {
                  setShowPriorityDropdown(!showPriorityDropdown);
                  setShowProjectDropdown(false);
                  setShowBoardDropdown(false);
                  setShowStatusDropdown(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} ${hoverBg}`}
              >
                <AlertCircle className={`w-4 h-4 ${priorityColors[formData.priority]}`} />
                <span className="flex-1 text-left">{formData.priority}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showPriorityDropdown && (
                <div className={`absolute top-full left-0 right-0 mt-2 ${bgCard} border ${borderColor} rounded-lg shadow-xl z-20`}>
                  {priorities.map((priority) => (
                    <button
                      key={priority}
                      onClick={() => {
                        setFormData({ ...formData, priority });
                        setShowPriorityDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2 ${hoverBg}`}
                    >
                      <AlertCircle className={`w-4 h-4 ${priorityColors[priority]}`} />
                      <span className={textPrimary}>{priority}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter task description..."
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} placeholder:${textSecondary} focus:outline-none focus:ring-2 focus:ring-[#00C6FF] resize-none`}
            />
          </div>

          {/* Due Date */}
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>Due Date</label>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${borderColor} ${bgCard}`}>
              <Calendar className={`w-5 h-5 ${textSecondary}`} />
              <input
                type="date"
                value={formData.dueDate ? formData.dueDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  dueDate: e.target.value ? new Date(e.target.value) : undefined 
                })}
                className={`flex-1 bg-transparent ${textPrimary} outline-none`}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`sticky bottom-0 ${bgMain} border-t ${borderColor} p-6 flex items-center justify-end gap-3`}>
          <button
            onClick={onClose}
            className={`px-6 py-3 rounded-lg border ${borderColor} ${textPrimary} ${hoverBg}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.name.trim() || !formData.projectId || !formData.boardId}
            className={`px-6 py-3 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white ${
              !formData.name.trim() || !formData.projectId || !formData.boardId
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-lg hover:shadow-[#00C6FF]/50'
            } transition-all`}
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}
