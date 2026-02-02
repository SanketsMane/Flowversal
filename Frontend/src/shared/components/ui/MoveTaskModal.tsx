import { useState, useEffect } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { X, ArrowRightLeft, Copy, FileText, ChevronDown } from 'lucide-react';
import { useProjectStore } from '@/core/stores/projectStore';
import { RenderIcon } from './IconLibrary';

interface MoveTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus?: string;
  currentProjectId?: string;
  currentBoardId?: string;
  onMove: (projectId: string, boardId: string, status: string) => void;
  mode?: 'move' | 'copy' | 'duplicate';
}

const statusOptions = [
  { name: 'To do', color: 'bg-orange-500' },
  { name: 'In Progress', color: 'bg-blue-500' },
  { name: 'Review', color: 'bg-purple-500' },
  { name: 'Done', color: 'bg-green-500' },
  { name: 'Blocked', color: 'bg-red-500' },
  { name: 'Backlog', color: 'bg-gray-500' },
];

export function MoveTaskModal({ isOpen, onClose, currentStatus, currentProjectId, currentBoardId, onMove, mode = 'move' }: MoveTaskModalProps) {
  const { theme } = useTheme();
  const { projects, boards } = useProjectStore();
  
  const [selectedProjectId, setSelectedProjectId] = useState(currentProjectId || '');
  const [selectedBoardId, setSelectedBoardId] = useState(currentBoardId || '');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgPanel = theme === 'dark' ? 'bg-[#252540]' : 'bg-gray-100';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  // Update board selection when project changes
  useEffect(() => {
    if (selectedProjectId) {
      const projectBoards = boards.filter(b => b.projectId === selectedProjectId);
      // Reset board selection if current board doesn't belong to selected project
      if (selectedBoardId && !projectBoards.find(b => b.id === selectedBoardId)) {
        setSelectedBoardId(projectBoards[0]?.id || '');
      }
    }
  }, [selectedProjectId, boards, selectedBoardId]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedProjectId(currentProjectId || '');
      setSelectedBoardId(currentBoardId || '');
      setSelectedStatus('');
    }
  }, [isOpen, currentProjectId, currentBoardId]);

  if (!isOpen) return null;

  const handleAction = () => {
    if (selectedProjectId && selectedBoardId && selectedStatus) {
      onMove(selectedProjectId, selectedBoardId, selectedStatus);
      onClose();
      resetState();
    }
  };

  const resetState = () => {
    setSelectedProjectId('');
    setSelectedBoardId('');
    setSelectedStatus('');
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const selectedBoard = boards.find(b => b.id === selectedBoardId);
  const projectBoards = selectedProjectId ? boards.filter(b => b.projectId === selectedProjectId) : [];

  const getTitle = () => {
    switch (mode) {
      case 'copy':
        return 'Copy Task';
      case 'duplicate':
        return 'Duplicate Task';
      default:
        return 'Move Task';
    }
  };

  const getIcon = () => {
    switch (mode) {
      case 'copy':
        return <Copy className="w-5 h-5 text-blue-500" />;
      case 'duplicate':
        return <FileText className="w-5 h-5 text-blue-500" />;
      default:
        return <ArrowRightLeft className="w-5 h-5 text-blue-500" />;
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case 'copy':
        return 'Copy Task';
      case 'duplicate':
        return 'Duplicate Task';
      default:
        return 'Move Task';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => onClose()}>
      <div 
        className={`${bgCard} rounded-xl w-full max-w-md border ${borderColor} max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-4 py-3 border-b ${borderColor} flex items-center justify-between flex-shrink-0`}>
          <div className="flex items-center gap-2">
            {getIcon()}
            <h2 className={`${textPrimary} text-lg`}>{getTitle()}</h2>
          </div>
          <button onClick={() => onClose()} className={`p-1 rounded ${hoverBg}`}>
            <X className={`w-4 h-4 ${textSecondary}`} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {/* Project Selection */}
          <div>
            <label className={`block text-xs ${textSecondary} mb-1.5`}>Select Project</label>
            <div className="relative">
              <button
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border ${borderColor} ${bgPanel} ${hoverBg} text-sm`}
              >
                <span className={textPrimary}>{selectedProject?.name || 'Select a project...'}</span>
                <ChevronDown className={`w-4 h-4 ${textSecondary}`} />
              </button>
              
              {showProjectDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProjectDropdown(false)} />
                  <div className={`absolute top-full left-0 right-0 mt-1 ${bgCard} border ${borderColor} rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto`}>
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          setShowProjectDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 ${hoverBg} text-left text-sm ${
                          selectedProjectId === project.id ? 'bg-blue-500/10' : ''
                        }`}
                      >
                        <div 
                          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: project.iconColor + '20' }}
                        >
                          <RenderIcon 
                            name={project.icon} 
                            className="w-4 h-4"
                            style={{ color: project.iconColor }}
                          />
                        </div>
                        <span className={textPrimary}>{project.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Board Selection */}
          {selectedProjectId && (
            <div>
              <label className={`block text-xs ${textSecondary} mb-1.5`}>Select Board</label>
              <div className="relative">
                <button
                  onClick={() => setShowBoardDropdown(!showBoardDropdown)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border ${borderColor} ${bgPanel} ${hoverBg} text-sm`}
                >
                  <span className={textPrimary}>{selectedBoard?.name || 'Select a board...'}</span>
                  <ChevronDown className={`w-4 h-4 ${textSecondary}`} />
                </button>
                
                {showBoardDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowBoardDropdown(false)} />
                    <div className={`absolute top-full left-0 right-0 mt-1 ${bgCard} border ${borderColor} rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto`}>
                      {projectBoards.map((board) => (
                        <button
                          key={board.id}
                          onClick={() => {
                            setSelectedBoardId(board.id);
                            setShowBoardDropdown(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 ${hoverBg} text-left text-sm ${
                            selectedBoardId === board.id ? 'bg-blue-500/10' : ''
                          }`}
                        >
                          <div 
                            className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: board.iconColor + '20' }}
                          >
                            <RenderIcon 
                              name={board.icon} 
                              className="w-4 h-4"
                              style={{ color: board.iconColor }}
                            />
                          </div>
                          <span className={textPrimary}>{board.name}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Status Selection */}
          {selectedBoardId && (
            <div>
              <label className={`block text-xs ${textSecondary} mb-1.5`}>Select Status</label>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {statusOptions.map((status) => (
                  <button
                    key={status.name}
                    onClick={() => setSelectedStatus(status.name)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border ${borderColor} ${
                      selectedStatus === status.name 
                        ? 'bg-blue-500/10 border-blue-500' 
                        : `${bgPanel} ${hoverBg}`
                    } transition-colors text-sm`}
                    disabled={currentStatus === status.name && currentBoardId === selectedBoardId && mode === 'move'}
                  >
                    <div className={`w-3 h-3 rounded ${status.color}`}></div>
                    <span className={`${textPrimary} flex-1 text-left`}>{status.name}</span>
                    {selectedStatus === status.name && (
                      <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {currentStatus === status.name && currentBoardId === selectedBoardId && mode === 'move' && (
                      <span className={`text-xs ${textSecondary} px-1.5 py-0.5 rounded ${bgPanel}`}>Current</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-4 py-3 border-t ${borderColor} flex gap-2 flex-shrink-0`}>
          <button
            onClick={() => {
              onClose();
              resetState();
            }}
            className={`flex-1 px-3 py-2 rounded-lg border ${borderColor} ${textSecondary} ${hoverBg} text-sm`}
          >
            Cancel
          </button>
          <button
            onClick={handleAction}
            disabled={!selectedProjectId || !selectedBoardId || !selectedStatus}
            className={`flex-1 px-3 py-2 rounded-lg text-sm ${
              selectedProjectId && selectedBoardId && selectedStatus
                ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50'
                : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
            } transition-all`}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}