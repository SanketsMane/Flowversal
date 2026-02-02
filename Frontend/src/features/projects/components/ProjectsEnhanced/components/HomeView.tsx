import { Globe, Briefcase, Sparkles, Users, Edit2, Trash2, MoreVertical, Check } from 'lucide-react';
import { Task, Project } from '@/core/stores/projectStore';
import { RenderIconByName } from '@/shared/components/ui/SimpleIconPicker';
import { useState, useEffect, useRef } from 'react';
import { useModal } from '@/core/stores/ModalContext';

interface ThemeTokens {
  bgCard: string;
  bgPanel: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
  hoverBg: string;
}

interface BoardSummary {
  id: string;
  name: string;
  icon: string;
  iconColor: string;
  taskCount: number;
  active: number;
  completed: number;
}

interface HomeViewProps extends ThemeTokens {
  selectedProjectName?: string;
  selectedProjectId?: string;
  selectedBoardId?: string;
  projects: Project[];
  boards: Board[];
  projectBoards: BoardSummary[];
  activeTasks: number;
  completedTasks: number;
  onCreateBoard: () => void;
  onManageTeam: () => void;
  onOpenTemplateGallery: () => void;
  onBoardSelect: (boardId: string) => void;
  onCreateProject: () => void;
  onProjectSelect: (projectId: string) => void;
  onEditProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onEditBoard: (boardId: string) => void;
  onDeleteBoard: (boardId: string) => void;
}

export function HomeView({
  selectedProjectName,
  selectedProjectId,
  selectedBoardId,
  projects,
  boards,
  projectBoards,
  activeTasks,
  completedTasks,
  onCreateBoard,
  onManageTeam,
  onOpenTemplateGallery,
  onCreateProject,
  onBoardSelect,
  onProjectSelect,
  onEditProject,
  onDeleteProject,
  onEditBoard,
  onDeleteBoard,
  bgCard,
  bgPanel,
  textPrimary,
  textSecondary,
  borderColor,
  hoverBg,
}: HomeViewProps) {
  const { showError } = useModal();

  console.log('[HomeView] Projects available:', projects?.length || 0, projects);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [boardDeleteConfirmation, setBoardDeleteConfirmation] = useState('');
  const [showProjectMenu, setShowProjectMenu] = useState<string | null>(null);
  const [showBoardMenu, setShowBoardMenu] = useState<string | null>(null);

  // Refs for click outside detection (per item to avoid stale refs)
  const projectMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const boardMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Project menu
      if (showProjectMenu) {
        const ref = projectMenuRefs.current[showProjectMenu];
        if (ref && !ref.contains(event.target as Node)) {
          setShowProjectMenu(null);
        }
      }
      // Board menu
      if (showBoardMenu) {
        const ref = boardMenuRefs.current[showBoardMenu];
        if (ref && !ref.contains(event.target as Node)) {
          setShowBoardMenu(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showProjectMenu, showBoardMenu]);

  const handleProjectDelete = async (projectId: string) => {
    console.log('[HomeView] handleProjectDelete called with:', projectId);
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      console.log('[HomeView] Project not found:', projectId);
      return;
    }

    if (deleteConfirmation !== project.name) {
      console.log('[HomeView] Confirmation failed:', deleteConfirmation, '!==', project.name);
      showError('Confirmation Required', 'Please type the project name to confirm deletion');
      return;
    }

    console.log('[HomeView] Confirmation passed, calling onDeleteProject');
    try {
      await onDeleteProject(projectId);
      console.log('[HomeView] onDeleteProject completed');
      setProjectToDelete(null);
      setDeleteConfirmation('');
    } catch (error) {
      console.log('[HomeView] onDeleteProject failed:', error);
      showError('Delete Failed', 'Failed to delete project. Please try again.');
    }
  };

  const handleBoardDelete = async (boardId: string) => {
    const board = projectBoards.find(b => b.id === boardId);
    if (!board) return;

    if (boardDeleteConfirmation !== board.name) {
      showError('Confirmation Required', 'Please type the board name to confirm deletion');
      return;
    }

    try {
      await onDeleteBoard(boardId);
      setBoardToDelete(null);
      setBoardDeleteConfirmation('');
    } catch (error) {
      showError('Delete Failed', 'Failed to delete board. Please try again.');
    }
  };

  return (
    <>
      <div className="p-8 space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[{
            title: 'Active Tasks',
            value: activeTasks,
            subtitle: 'In progress',
            icon: Globe,
            colorClass: 'text-blue-500 bg-blue-500/20',
          }, {
            title: 'Completed',
            value: completedTasks,
            subtitle: 'This month',
            icon: Briefcase,
            colorClass: 'text-green-500 bg-green-500/20',
          }, {
            title: 'Boards',
            value: projectBoards.length,
            subtitle: selectedProjectName
              ? (selectedProjectName.length > 20 ? `${selectedProjectName.substring(0, 20)}...` : selectedProjectName)
              : 'All projects',
            icon: Sparkles,
            colorClass: 'text-purple-500 bg-purple-500/20',
          }].map((card) => (
            <div key={card.title} className={`${bgCard} rounded-xl border ${borderColor} p-6`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg ${card.colorClass} flex items-center justify-center`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className={`text-lg ${textPrimary}`}>{card.title}</h3>
              </div>
              <p className={`text-3xl ${textPrimary} mb-1`}>{card.value}</p>
              <p className={`text-sm ${textSecondary}`}>{card.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects List */}
          <div className={`${bgCard} rounded-xl border ${borderColor} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl ${textPrimary}`}>Projects</h3>
              <button
                onClick={onCreateProject}
                className="px-3 py-1.5 rounded-full border border-dashed border-current text-xs text-[#00C6FF]"
              >
                + New
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {projects.map((project) => {
                const isSelected = project.id === selectedProjectId;
                return (
                  <div
                    key={project.id}
                    className={`relative rounded-lg border transition-all ${
                      isSelected
                        ? 'border-[#00C6FF] bg-[#00C6FF]/5 shadow-md'
                        : `${borderColor} ${hoverBg}`
                    }`}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: project.iconColor + '20' }}
                      >
                        <RenderIconByName
                          name={project.icon}
                          className="w-4 h-4"
                          style={{ color: project.iconColor }}
                        />
                      </div>
                      <button
                        onClick={() => onProjectSelect(project.id)}
                        className="flex-1 text-left"
                      >
                        <h4
                          className={`${textPrimary} text-sm font-medium truncate`}
                          title={project.name}
                        >
                          {project.name.length > 20 ? `${project.name.substring(0, 20)}...` : project.name}
                        </h4>
                        <p className={`text-xs ${textSecondary}`}>
                          {boards.filter(b => b.projectId === project.id).length} boards
                        </p>
                      </button>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#00C6FF] flex-shrink-0" />
                      )}
                <div
                  className="relative"
                  ref={(el) => {
                    projectMenuRefs.current[project.id] = el;
                  }}
                >
                        <button
                          onClick={() => setShowProjectMenu(showProjectMenu === project.id ? null : project.id)}
                          className={`p-1 rounded ${hoverBg} ${textSecondary}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {showProjectMenu === project.id && (
                          <div className={`absolute right-0 top-full mt-1 ${bgCard} border ${borderColor} rounded-lg shadow-lg z-10 min-w-32`}>
                            <button
                              onClick={() => {
                                console.log('[HomeView] Edit project clicked for:', project.id);
                                onEditProject(project.id);
                                setShowProjectMenu(null);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm ${hoverBg} ${textPrimary} flex items-center gap-2`}
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setProjectToDelete(project.id);
                                setShowProjectMenu(null);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm ${hoverBg} text-red-500 flex items-center gap-2`}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Boards List */}
          <div className={`${bgCard} rounded-xl border ${borderColor} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-xl ${textPrimary}`}>Boards</h3>
                <p
                  className={`text-sm ${textSecondary}`}
                  title={selectedProjectName && selectedProjectName.length > 20 ? selectedProjectName : undefined}
                >
                  {selectedProjectName
                    ? (selectedProjectName.length > 20 ? `${selectedProjectName.substring(0, 20)}...` : selectedProjectName)
                    : 'Select a project'
                  }
                </p>
              </div>
              <button
                onClick={onCreateBoard}
                disabled={!selectedProjectId}
                className={`px-3 py-1.5 rounded-full border border-dashed text-xs ${
                  selectedProjectId
                    ? 'border-[#00C6FF] text-[#00C6FF]'
                    : 'border-gray-300 text-gray-400 cursor-not-allowed'
                }`}
              >
                + New Board
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {projectBoards.map((board) => {
                const isSelected = board.id === selectedBoardId;
                const completionRate =
                  board.taskCount > 0 ? Math.round((board.completed / board.taskCount) * 100) : 0;

                return (
                  <div
                    key={board.id}
                    className={`relative rounded-lg border transition-all ${
                      isSelected
                        ? 'border-[#00C6FF] bg-[#00C6FF]/5 shadow-md'
                        : `${borderColor} ${hoverBg}`
                    }`}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: board.iconColor + '20' }}
                      >
                        <RenderIconByName
                          name={board.icon}
                          className="w-4 h-4"
                          style={{ color: board.iconColor }}
                        />
                      </div>
                      <button
                        onClick={() => onBoardSelect(board.id)}
                        className="flex-1 text-left"
                      >
                        <h4
                          className={`${textPrimary} text-sm font-medium`}
                          title={board.name}
                        >
                          {board.name.length > 20 ? `${board.name.substring(0, 20)}...` : board.name}
                        </h4>
                        <p className={`text-xs ${textSecondary}`}>
                          {board.taskCount} tasks • {board.active} active
                        </p>
                      </button>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#00C6FF] flex-shrink-0" />
                      )}
                <div
                  className="relative"
                  ref={(el) => {
                    boardMenuRefs.current[board.id] = el;
                  }}
                >
                        <button
                          onClick={() => setShowBoardMenu(showBoardMenu === board.id ? null : board.id)}
                          className={`p-1 rounded ${hoverBg} ${textSecondary}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {showBoardMenu === board.id && (
                          <div className={`absolute right-0 top-full mt-1 ${bgCard} border ${borderColor} rounded-lg shadow-lg z-10 min-w-32`}>
                            <button
                              onClick={() => {
                                onEditBoard(board.id);
                                setShowBoardMenu(null);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm ${hoverBg} ${textPrimary} flex items-center gap-2`}
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setBoardToDelete(board.id);
                                setShowBoardMenu(null);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm ${hoverBg} text-red-500 flex items-center gap-2`}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="px-3 pb-3">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-[#00C6FF] h-1.5 rounded-full transition-all"
                            style={{ width: `${completionRate}%` }}
                          ></div>
                        </div>
                        <p className={`text-xs ${textSecondary} mt-1`}>
                          {completionRate}% complete
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
              {projectBoards.length === 0 && selectedProjectId && (
                <div className="text-center py-8">
                  <Sparkles className={`w-12 h-12 mx-auto mb-3 ${textSecondary} opacity-50`} />
                  <p className={`text-sm ${textSecondary} mb-2`}>No boards yet</p>
                  <button
                    onClick={onCreateBoard}
                    className="text-[#00C6FF] text-sm hover:underline"
                  >
                    Create your first board
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`${bgCard} rounded-xl border ${borderColor} p-6`}>
            <h3 className={`text-xl ${textPrimary} mb-4`}>Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={onCreateProject}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${borderColor} ${hoverBg} ${textPrimary}`}
              >
                <Briefcase className="w-4 h-4" /> New Project
              </button>
              <button
                onClick={onCreateBoard}
                disabled={!selectedProjectId}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
                  selectedProjectId
                    ? `${borderColor} ${hoverBg} ${textPrimary}`
                    : 'border-gray-300 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4" /> Create Board
              </button>
              <button
                onClick={onManageTeam}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${borderColor} ${hoverBg} ${textPrimary}`}
              >
                <Users className="w-4 h-4" /> Manage Team
              </button>
              <button
                onClick={onOpenTemplateGallery}
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:opacity-90"
              >
                <Sparkles className="w-4 h-4" /> Project Templates
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Project Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${bgCard} rounded-xl border ${borderColor} p-6 max-w-md w-full`}>
            <h3 className={`text-lg ${textPrimary} mb-2`}>Delete Project</h3>
            <p className={`text-sm ${textSecondary} mb-4`}>
              This will permanently delete the project and all its boards and tasks. This action cannot be undone.
            </p>
            <div className="mb-4">
              <label className={`block text-sm ${textSecondary} mb-2`}>
                Type "{projects.find(p => p.id === projectToDelete)?.name}" to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${bgPanel} ${textPrimary}`}
                placeholder="Enter project name"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setProjectToDelete(null);
                  setDeleteConfirmation('');
                }}
                className={`flex-1 px-4 py-2 rounded-lg border ${borderColor} ${hoverBg} ${textPrimary}`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleProjectDelete(projectToDelete)}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Board Delete Confirmation Modal */}
      {boardToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${bgCard} rounded-xl border ${borderColor} p-6 max-w-md w-full`}>
            <h3 className={`text-lg ${textPrimary} mb-2`}>Delete Board</h3>
            <p className={`text-sm ${textSecondary} mb-4`}>
              This will permanently delete the board and all its tasks. This action cannot be undone.
            </p>
            <div className="mb-4">
              <label className={`block text-sm ${textSecondary} mb-2`}>
                Type "{projectBoards.find(b => b.id === boardToDelete)?.name}" to confirm:
              </label>
              <input
                type="text"
                value={boardDeleteConfirmation}
                onChange={(e) => setBoardDeleteConfirmation(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${bgPanel} ${textPrimary}`}
                placeholder="Enter board name"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setBoardToDelete(null);
                  setBoardDeleteConfirmation('');
                }}
                className={`flex-1 px-4 py-2 rounded-lg border ${borderColor} ${hoverBg} ${textPrimary}`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleBoardDelete(boardToDelete)}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Delete Board
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

