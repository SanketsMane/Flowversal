import { useState } from 'react';
import { X, LinkIcon, Search, Check } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';

interface AttachToTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowName: string;
  onAttach: (taskId: string) => void;
  availableTasks?: Array<{ id: string; name: string; projectName?: string; boardName?: string }>;
}

export function AttachToTaskModal({ 
  isOpen, 
  onClose, 
  workflowName, 
  onAttach,
  availableTasks = []
}: AttachToTaskModalProps) {
  const [taskId, setTaskId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const { theme } = useTheme();

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgPanel = theme === 'dark' ? 'bg-[#252540]' : 'bg-gray-100';
  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  const handleAttach = () => {
    const idToUse = selectedTaskId || taskId;
    if (idToUse.trim()) {
      onAttach(idToUse);
      setTaskId('');
      setSelectedTaskId('');
      setSearchQuery('');
      onClose();
    }
  };

  const handleTaskSelect = (task: { id: string; name: string }) => {
    setSelectedTaskId(task.id);
    setTaskId(task.id);
  };

  const filteredTasks = availableTasks.filter(task => 
    task.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.boardName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className={`${bgCard} rounded-xl w-full max-w-lg border ${borderColor} flex flex-col max-h-[80vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-4 py-3 border-b ${borderColor} flex items-center justify-between flex-shrink-0`}>
          <div className="flex items-center gap-2">
            <LinkIcon className={`w-5 h-5 text-[#00C6FF]`} />
            <h2 className={`${textPrimary} text-lg`}>Attach to Task</h2>
          </div>
          <button onClick={onClose} className={`p-1 rounded ${hoverBg}`}>
            <X className={`w-4 h-4 ${textSecondary}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <p className={`${textSecondary} text-sm mb-3`}>
              Attach "<span className={textPrimary}>{workflowName}</span>" workflow to an existing task
            </p>

            {/* Manual Task ID Input */}
            <div className="mb-4">
              <label className={`block text-xs ${textSecondary} mb-1.5`}>Enter Task ID</label>
              <input
                type="text"
                value={taskId}
                onChange={(e) => {
                  setTaskId(e.target.value);
                  setSelectedTaskId('');
                }}
                placeholder="e.g., TSK-A1B2C3"
                className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${bgMain} ${textPrimary} text-sm outline-none focus:border-[#00C6FF]/50 focus:ring-2 focus:ring-[#00C6FF]/20 transition-all`}
              />
            </div>

            {/* Task Selection List */}
            {availableTasks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`block text-xs ${textSecondary}`}>Or select from existing tasks</label>
                  <span className={`text-xs ${textSecondary}`}>{filteredTasks.length} tasks</span>
                </div>

                {/* Search */}
                <div className="relative mb-2">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border ${borderColor} ${bgMain} ${textPrimary} text-sm outline-none focus:border-[#00C6FF]/50 focus:ring-2 focus:ring-[#00C6FF]/20 transition-all`}
                  />
                </div>

                {/* Task List */}
                <div className={`max-h-60 overflow-y-auto border ${borderColor} rounded-lg ${bgMain}`}>
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => handleTaskSelect(task)}
                        className={`w-full flex items-center justify-between px-3 py-2 ${
                          selectedTaskId === task.id ? 'bg-blue-500/10' : hoverBg
                        } transition-colors text-left border-b ${borderColor} last:border-b-0`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`${textPrimary} text-sm truncate`}>{task.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs ${textSecondary}`}>{task.id}</span>
                            {task.projectName && (
                              <>
                                <span className={`text-xs ${textSecondary}`}>•</span>
                                <span className={`text-xs ${textSecondary}`}>{task.projectName}</span>
                              </>
                            )}
                            {task.boardName && (
                              <>
                                <span className={`text-xs ${textSecondary}`}>•</span>
                                <span className={`text-xs ${textSecondary}`}>{task.boardName}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {selectedTaskId === task.id && (
                          <Check className="w-4 h-4 text-blue-500 flex-shrink-0 ml-2" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className={`px-3 py-8 text-center ${textSecondary} text-sm`}>
                      No tasks found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-4 py-3 border-t ${borderColor} flex gap-2 flex-shrink-0`}>
          <button
            onClick={onClose}
            className={`flex-1 px-3 py-2 rounded-lg border ${borderColor} ${textSecondary} ${hoverBg} text-sm`}
          >
            Cancel
          </button>
          <button
            onClick={handleAttach}
            disabled={!taskId.trim() && !selectedTaskId}
            className={`flex-1 px-3 py-2 rounded-lg text-sm ${
              (taskId.trim() || selectedTaskId)
                ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50'
                : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
            } transition-all`}
          >
            Attach Workflow
          </button>
        </div>
      </div>
    </div>
  );
}

export default AttachToTaskModal;
