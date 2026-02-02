import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { X, Search, Filter, ChevronDown, CheckSquare } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  assignee: string;
  avatar: string;
  status: 'To do' | 'In Progress' | 'Review' | 'Done' | 'Blocked' | 'Backlog';
  description?: string;
  boardName?: string;
  folderName?: string;
}

interface AttachTaskModalProps {
  workflowName: string;
  onClose: () => void;
  onTaskSelect: (task: Task) => void;
}

export function AttachTaskModal({ workflowName, onClose, onTaskSelect }: AttachTaskModalProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('None');
  const [selectedBoard, setSelectedBoard] = useState<string>('None');
  const [selectedStatus, setSelectedStatus] = useState<string>('Backlog');
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const folderRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgPanel = theme === 'dark' ? 'bg-[#252540]' : 'bg-gray-100';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  // Mock data - In real app, this would come from Projects
  const folders = ['None', 'SGA', 'Marketing', 'Development'];
  const boards = ['None', 'New Phase', 'Sales Pipeline', 'F3 SGA - Work', 'F4 SGA - Work'];
  const statuses = ['Backlog', 'To do', 'In Progress', 'Review', 'Done', 'Blocked'];

  const allTasks: Task[] = [
    { id: '1', name: 'Website Redesign', assignee: 'VS', avatar: 'VS', status: 'Backlog', description: 'Complete homepage redesign', boardName: 'New Phase', folderName: 'None' },
    { id: '2', name: 'Marketing Campaign', assignee: 'MP', avatar: 'MP', status: 'Backlog', description: 'Launch Q1 campaign', boardName: 'Sales Pipeline', folderName: 'Marketing' },
    { id: '3', name: 'Product Launch', assignee: 'DS', avatar: 'DS', status: 'Backlog', description: 'Final review before launch', boardName: 'New Phase', folderName: 'None' },
    { id: '4', name: 'API Integration', assignee: 'AK', avatar: 'AK', status: 'Backlog', description: 'Backend API setup', boardName: 'F3 SGA - Work', folderName: 'SGA' },
    { id: '5', name: 'Database Migration', assignee: 'KK', avatar: 'KK', status: 'To do', description: 'Migrate to new database', boardName: 'New Phase', folderName: 'Development' },
    { id: '6', name: 'UI/UX Updates', assignee: 'YS', avatar: 'YS', status: 'In Progress', description: 'Update design system', boardName: 'Sales Pipeline', folderName: 'None' },
    { id: '7', name: 'Content Writing', assignee: 'N', avatar: 'N', status: 'Backlog', description: 'Write blog posts', boardName: 'F4 SGA - Work', folderName: 'SGA' },
    { id: '8', name: 'SEO Optimization', assignee: 'SK', avatar: 'SK', status: 'Review', description: 'Optimize site for SEO', boardName: 'New Phase', folderName: 'Marketing' },
  ];

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
      if (folderRef.current && !folderRef.current.contains(event.target as Node)) {
        setShowFolderDropdown(false);
      }
      if (boardRef.current && !boardRef.current.contains(event.target as Node)) {
        setShowBoardDropdown(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter tasks based on search and filters
  const filteredTasks = allTasks.filter(task => {
    // Search filter
    const matchesSearch = searchQuery.trim() === '' || 
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Folder filter
    const matchesFolder = selectedFolder === 'None' || task.folderName === selectedFolder;

    // Board filter
    const matchesBoard = selectedBoard === 'None' || task.boardName === selectedBoard;

    // Status filter
    const matchesStatus = task.status === selectedStatus;

    return matchesSearch && matchesFolder && matchesBoard && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To do':
        return 'bg-red-500';
      case 'In Progress':
        return 'bg-yellow-500';
      case 'Review':
        return 'bg-blue-500';
      case 'Done':
        return 'bg-green-500';
      case 'Blocked':
        return 'bg-pink-500';
      case 'Backlog':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className={`${bgCard} rounded-xl w-full max-w-3xl border ${borderColor} max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b ${borderColor} flex-shrink-0`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl ${textPrimary}`}>Attach to Task</h2>
            <button onClick={onClose} className={`p-2 rounded-lg ${hoverBg}`}>
              <X className={`w-5 h-5 ${textSecondary}`} />
            </button>
          </div>

          <div className="mb-4">
            <p className={`${textSecondary} text-sm mb-2`}>Workflow: <span className={textPrimary}>{workflowName}</span></p>
          </div>

          {/* Search Bar */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${borderColor} ${bgMain} mb-4`}>
            <Search className={`w-4 h-4 ${textSecondary}`} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 bg-transparent outline-none ${textPrimary}`}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className={`p-1 rounded ${hoverBg}`}>
                <X className={`w-4 h-4 ${textSecondary}`} />
              </button>
            )}
          </div>

          {/* Filter Section */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`${textSecondary} text-sm`}>Filter:</span>

            {/* Folder Dropdown */}
            <div className="relative" ref={folderRef}>
              <button
                onClick={() => {
                  setShowFolderDropdown(!showFolderDropdown);
                  setShowBoardDropdown(false);
                  setShowStatusDropdown(false);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${bgPanel} border ${borderColor} ${hoverBg} ${textPrimary} text-sm`}
              >
                <span className={textSecondary}>Folder:</span>
                {selectedFolder}
                <ChevronDown className={`w-3 h-3 ${textSecondary}`} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFolderDropdown(false);
                  }}
                  className={`p-0.5 rounded ${hoverBg}`}
                >
                  <X className={`w-3 h-3 ${textSecondary}`} />
                </button>
              </button>

              {showFolderDropdown && (
                <div className={`absolute top-full left-0 mt-1 w-48 ${bgCard} border ${borderColor} rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto`}>
                  {folders.map((folder) => (
                    <button
                      key={folder}
                      onClick={() => {
                        setSelectedFolder(folder);
                        setShowFolderDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm ${hoverBg} transition-colors ${
                        selectedFolder === folder 
                          ? theme === 'dark'
                            ? 'bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 text-white'
                            : 'bg-gradient-to-r from-[#00C6FF]/30 to-[#9D50BB]/30 text-[#0072FF]'
                          : textPrimary
                      } first:rounded-t-lg last:rounded-b-lg`}
                    >
                      {folder}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Board Dropdown */}
            <div className="relative" ref={boardRef}>
              <button
                onClick={() => {
                  setShowBoardDropdown(!showBoardDropdown);
                  setShowFolderDropdown(false);
                  setShowStatusDropdown(false);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${bgPanel} border ${borderColor} ${hoverBg} ${textPrimary} text-sm`}
              >
                <span className={textSecondary}>Board:</span>
                {selectedBoard}
                <ChevronDown className={`w-3 h-3 ${textSecondary}`} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBoardDropdown(false);
                  }}
                  className={`p-0.5 rounded ${hoverBg}`}
                >
                  <X className={`w-3 h-3 ${textSecondary}`} />
                </button>
              </button>

              {showBoardDropdown && (
                <div className={`absolute top-full left-0 mt-1 w-56 ${bgCard} border ${borderColor} rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto`}>
                  {boards.map((board) => (
                    <button
                      key={board}
                      onClick={() => {
                        setSelectedBoard(board);
                        setShowBoardDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm ${hoverBg} transition-colors ${
                        selectedBoard === board 
                          ? theme === 'dark'
                            ? 'bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 text-white'
                            : 'bg-gradient-to-r from-[#00C6FF]/30 to-[#9D50BB]/30 text-[#0072FF]'
                          : textPrimary
                      } first:rounded-t-lg last:rounded-b-lg`}
                    >
                      {board}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="relative" ref={statusRef}>
              <button
                onClick={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowFolderDropdown(false);
                  setShowBoardDropdown(false);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${bgPanel} border ${borderColor} ${hoverBg} ${textPrimary} text-sm`}
              >
                <span className={textSecondary}>Status:</span>
                {selectedStatus}
                <ChevronDown className={`w-3 h-3 ${textSecondary}`} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowStatusDropdown(false);
                  }}
                  className={`p-0.5 rounded ${hoverBg}`}
                >
                  <X className={`w-3 h-3 ${textSecondary}`} />
                </button>
              </button>

              {showStatusDropdown && (
                <div className={`absolute top-full left-0 mt-1 w-48 ${bgCard} border ${borderColor} rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto`}>
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm ${hoverBg} transition-colors ${
                        selectedStatus === status 
                          ? theme === 'dark'
                            ? 'bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 text-white'
                            : 'bg-gradient-to-r from-[#00C6FF]/30 to-[#9D50BB]/30 text-[#0072FF]'
                          : textPrimary
                      } first:rounded-t-lg last:rounded-b-lg flex items-center gap-2`}
                    >
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}></div>
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => onTaskSelect(task)}
                className={`w-full text-left p-4 rounded-lg border ${borderColor} ${hoverBg} transition-all group hover:border-[#00C6FF]/50`}
              >
                <div className="flex items-center gap-3">
                  <CheckSquare className={`w-5 h-5 ${textSecondary} group-hover:text-[#00C6FF]`} />
                  <div className="flex-1">
                    <h3 className={`${textPrimary} mb-1`}>{task.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {task.folderName && task.folderName !== 'None' && (
                        <span className={`${textSecondary} text-xs`}>{task.folderName} /</span>
                      )}
                      <span className={`${textSecondary} text-xs`}>{task.boardName}</span>
                      <span className={`${textSecondary} text-xs`}>•</span>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`}></div>
                        <span className={`${textSecondary} text-xs`}>{task.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] flex items-center justify-center text-white text-sm flex-shrink-0">
                    {task.avatar}
                  </div>
                </div>
              </button>
            ))}

            {filteredTasks.length === 0 && (
              <div className="text-center py-16">
                <p className={`${textSecondary}`}>No tasks found matching your criteria.</p>
                <p className={`${textSecondary} text-sm mt-2`}>Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${borderColor} flex justify-between items-center flex-shrink-0`}>
          <p className={`${textSecondary} text-sm`}>
            Showing {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${bgPanel} ${textSecondary} ${hoverBg}`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
