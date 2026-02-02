/**
 * Enhanced Projects Component
 * - Preserves ALL original functionality
 * - Adds Home/Board/My Tasks navigation
 * - Inline task creation in boards (original behavior)
 * - Project and Board creation with icons
 * - Task move/copy between projects
 * - My Tasks organized by time segments
 */

import { useModal } from '@/core/stores/ModalContext';
import { Task, useProjectStore } from '@/core/stores/projectStore';
import { useTheme } from '@/core/theme/ThemeContext';
import { FilterOptions } from '@/shared/components/ui/AdvancedFilters';
import { SortOption } from '@/shared/components/ui/AdvancedSort';
import { EmptyBoardState } from '@/shared/components/ui/EmptyBoardState';
import { useEffect, useRef, useState } from 'react';
import { BoardTabs, HomeView, ModalRenderer, MyTasksPanel, ProjectBoardSelector, ViewNavigation } from './ProjectsEnhanced/components';
import { useDropdownState } from './ProjectsEnhanced/hooks/useDropdownState';
import { useModalState } from './ProjectsEnhanced/hooks/useModalState';
import { useProjectFiltering } from './ProjectsEnhanced/hooks/useProjectFiltering';

const LOGGED_IN_USER_ID = '4'; // Justin (justin@gmail.com)
const SELECTION_STORAGE_KEY = 'flowversal_project_selection';

interface DeepLinkTarget {
  projectName: string;
  boardName: string;
  taskId: string;
}

interface ProjectsProps {
  externalNewTaskTrigger?: number;
  externalTeamManagementTrigger?: number;
  externalTemplateGalleryTrigger?: number;
  deepLinkTarget?: DeepLinkTarget;
}

export function Projects({ externalNewTaskTrigger, externalTeamManagementTrigger, externalTemplateGalleryTrigger, deepLinkTarget }: ProjectsProps = {}) {
  const { theme } = useTheme();
  const { showError } = useModal();
  const { projects, boards, tasks, updateTask, addTask, addBoard, addProject, getBoardsByProject, getTasksByBoard } = useProjectStore();

  
  // Main view state
  const [mainView, setMainView] = useState<'home' | 'board' | 'my-tasks'>(projects.length === 0 ? 'home' : 'board');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const hasProjects = projects.length > 0;
  const [hasUserSetMainView, setHasUserSetMainView] = useState(false);
  
  // Board view state
  const [activeTab, setActiveTab] = useState<'active' | 'backlogs' | 'archive'>('active');
  const [view, setView] = useState<'list' | 'kanban' | 'chart'>('kanban');
  const [archiveFilter, setArchiveFilter] = useState<'all' | 'Done' | 'Cancelled'>('all');
  
  // UI state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string[]>([]);
  const [showMyTasks, setShowMyTasks] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  
  // Advanced filter state
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({
    members: [],
    statuses: [],
    priorities: [],
    labels: [],
    dueDateRange: 'all'
  });

  // no additional refs needed
  
  // Modal and dropdown state
  const { modalState, modalHandlers } = useModalState();
  const {
    showProjectDropdown,
    showBoardDropdown,
    projectDropdownRef,
    boardDropdownRef,
    dropdownHandlers,
  } = useDropdownState();
  const [newTaskStatus, setNewTaskStatus] = useState('To do');
  const hasHandledDeepLink = useRef(false);
  const selectionLoadedRef = useRef(false);

  // Auto-select project/board (use saved selection if available), keep user on Board view when data exists
  useEffect(() => {
    if (!projects.length) {
      setSelectedProjectId('');
      setSelectedBoardId('');
      if (mainView !== 'home') setMainView('home');
      return;
    }

    // Load saved selection once
    if (!selectionLoadedRef.current) {
      selectionLoadedRef.current = true;
      try {
        const saved = localStorage.getItem(SELECTION_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.projectId && projects.some((p) => p.id === parsed.projectId)) {
            setSelectedProjectId(parsed.projectId);
            const boardsForProject = getBoardsByProject(parsed.projectId);
            if (parsed.boardId && boards.some((b) => b.id === parsed.boardId)) {
              setSelectedBoardId(parsed.boardId);
            } else if (boardsForProject.length > 0) {
              setSelectedBoardId(boardsForProject[0].id);
            }
            if (mainView === 'home') setMainView('board');
            return;
          }
        }
      } catch {
        // ignore parse errors
      }
    }

    // Fallback to first project/board
    if (!selectedProjectId && projects[0]) {
      setSelectedProjectId(projects[0].id);
    }
    const activeProjectId = selectedProjectId || projects[0].id;
    const projectBoards = getBoardsByProject(activeProjectId);
    if (projectBoards.length > 0 && !selectedBoardId) {
      setSelectedBoardId(projectBoards[0].id);
    }
    if (mainView === 'home' && !hasUserSetMainView) {
      setMainView('board');
    }
  }, [projects, boards, selectedProjectId, selectedBoardId, mainView, getBoardsByProject, hasUserSetMainView]);

  // Persist selection
  useEffect(() => {
    if (selectedProjectId) {
      try {
        localStorage.setItem(
          SELECTION_STORAGE_KEY,
          JSON.stringify({ projectId: selectedProjectId, boardId: selectedBoardId })
        );
      } catch {
        // ignore storage errors
      }
    }
  }, [selectedProjectId, selectedBoardId]);

  // Auto-select first board when project changes or boards load
  useEffect(() => {
    if (selectedProjectId) {
      const projectBoards = getBoardsByProject(selectedProjectId);
      if (projectBoards.length > 0) {
        setSelectedBoardId(projectBoards[0].id);
      } else {
        setSelectedBoardId('');
      }
    }
  }, [selectedProjectId, getBoardsByProject, boards]);

  // Deep link: /Project Name/Board Name/Task ID
  useEffect(() => {
    if (hasHandledDeepLink.current) return;
    if (!deepLinkTarget) return;

    const { projectName, boardName, taskId } = deepLinkTarget;

    const project = projects.find(
      (p) =>
        p.name === projectName ||
        encodeURIComponent(p.name) === encodeURIComponent(projectName)
    );
    if (!project) return;

    const board = boards.find(
      (b) =>
        b.projectId === project.id &&
        (b.name === boardName || encodeURIComponent(b.name) === encodeURIComponent(boardName))
    );
    if (!board) return;

    const task = tasks.find(
      (t) =>
        (t.taskId && t.taskId.toLowerCase() === taskId.toLowerCase()) ||
        (t.id && t.id.toLowerCase() === taskId.toLowerCase())
    );
    if (!task) return;

    setSelectedProjectId(project.id);
    setSelectedBoardId(board.id);
    setMainView('board');
    setSelectedTask(task);
    setIsCreatingTask(false);
    hasHandledDeepLink.current = true;
  }, [deepLinkTarget, projects, boards, tasks, setSelectedProjectId, setSelectedBoardId, setMainView, setSelectedTask]);

  // Keep selections sensible when projects are missing/added
  useEffect(() => {
    if (!projects.length) {
      setSelectedProjectId('');
      setSelectedBoardId('');
      if (mainView !== 'home') {
        setMainView('home');
      }
      return;
    }

    if (!selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId, mainView]);

  // Handle external triggers
  useEffect(() => {
    if (externalNewTaskTrigger) {
      handleCreateTask();
    }
  }, [externalNewTaskTrigger]);

  useEffect(() => {
    if (externalTeamManagementTrigger) {
      modalHandlers.openTeamManagement();
    }
  }, [externalTeamManagementTrigger, modalHandlers]);

  useEffect(() => {
    if (externalTemplateGalleryTrigger) {
      modalHandlers.openTemplateGallery();
    }
  }, [externalTemplateGalleryTrigger, modalHandlers]);


  const handleDrop = (taskId: string, newStatus: string, targetIndex?: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Update status first
    updateTask(taskId, { status: newStatus });

    // If targetIndex is provided, we need to reorder within the same status
    if (targetIndex !== undefined) {
      // Get all tasks with the new status (including the one we just moved)
      const tasksInStatus = tasks
        .filter(t => t.status === newStatus || t.id === taskId)
        .map(t => t.id === taskId ? { ...t, status: newStatus } : t);
      
      // Find current and target positions
      const currentIndex = tasksInStatus.findIndex(t => t.id === taskId);
      if (currentIndex === -1 || currentIndex === targetIndex) return;

      // Reorder by updating a position field
      // Note: This is a visual reorder. For persistence, you'd need to add an 'order' field to Task
      const reordered = [...tasksInStatus];
      const [moved] = reordered.splice(currentIndex, 1);
      reordered.splice(targetIndex, 0, moved);
      
      // Update order field for all affected tasks
      reordered.forEach((t, idx) => {
        if (t.id === taskId || idx === targetIndex || idx === currentIndex) {
          updateTask(t.id, { order: idx });
        }
      });
    }
  };

  // ORIGINAL INLINE TASK CREATION
  const handleCreateTask = (status: string = 'To do') => {
    setNewTaskStatus(status);
    setSelectedTask({
      id: `new-${Date.now()}`,
      taskId: `TSK-${String(tasks.length + 1).padStart(3, '0')}`,
      name: '',
      description: '',
      assignedTo: [],
      status: status === 'To do' ? 'Todo' : status, // Normalize status
      priority: 'Medium',
      labels: [],
      hasWorkflow: false,
      boardId: selectedBoardId,
      projectId: selectedProjectId,
      createdBy: { id: LOGGED_IN_USER_ID, name: 'Current User', avatar: 'CU' },
      createdAt: new Date(),
      updatedAt: new Date()
    } as Task);
    setIsCreatingTask(true);
  };

  const handleTaskUpdate = (taskId: string, updates: any) => {
    // Check if this is a new task (ID starts with 'new-' or task doesn't exist)
    const isNewTask = taskId.startsWith('new-') || isCreatingTask;
    const existingTask = !isNewTask ? tasks.find(t => t.id === taskId) : null;
    
    // Map TaskDetailModal fields to Task fields - include ALL fields
    const mappedUpdates = {
      taskId: updates.taskId || `TSK-${String(tasks.length + 1).padStart(3, '0')}`,
      name: updates.title || updates.name || '',
      description: updates.description || '',
      status: updates.status,
      priority: updates.priority || 'Medium',
      assignedTo: updates.members || updates.assignedTo || [],
      labels: updates.labels || [],
      dueDate: updates.dueDate,
      hasWorkflow: updates.hasWorkflow || false,
      // Include projectId and boardId if they're being updated (for move/copy)
      ...(updates.projectId && { projectId: updates.projectId }),
      ...(updates.boardId && { boardId: updates.boardId }),
      // Include all additional fields from TaskDetailModal
      checklists: updates.checklists || [],
      comments: updates.comments || [],
      attachments: updates.attachments || [],
      workflows: updates.workflows || [],
      recurring: updates.recurring || 'Never',
      reminder: updates.reminder || 'None',
      startDate: updates.startDate || undefined,
    };
    
    if (existingTask && !isNewTask) {
      // Update existing task
      console.log('[ProjectsEnhanced] Updating task:', taskId);
      updateTask(taskId, mappedUpdates).catch((error) => {
        console.error('[ProjectsEnhanced] Failed to update task:', error);
        showError('Update Failed', 'Failed to update task. Please try again.');
      });
    } else {
      // Create new task
      const taskBoardId = updates.boardId || selectedBoardId;
      const taskProjectId = updates.projectId || selectedProjectId;
      
      if (!taskBoardId || !taskProjectId) {
        console.error('[ProjectsEnhanced] Cannot create task: missing boardId or projectId', {
          boardId: taskBoardId,
          projectId: taskProjectId,
          selectedBoardId,
          selectedProjectId,
        });
        showError('Create Failed', 'Please select a board and project before creating a task.');
        setIsCreatingTask(false);
        return;
      }
      
      console.log('[ProjectsEnhanced] Creating new task:', mappedUpdates.name, {
        boardId: taskBoardId,
        projectId: taskProjectId,
      });
      
      addTask({
        ...mappedUpdates,
        boardId: taskBoardId,
        projectId: taskProjectId,
        createdBy: { id: LOGGED_IN_USER_ID, name: 'Current User', avatar: 'CU' },
      }).catch((error) => {
        console.error('[ProjectsEnhanced] Failed to create task:', error);
        const errorMessage = error.message || 'Failed to create task. Please try again.';
        showError('Create Failed', errorMessage);
      });
    }
    setIsCreatingTask(false);
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      console.log('[ProjectsEnhanced] Deleting task:', taskId);
      await useProjectStore.getState().deleteTask(taskId);
      console.log('[ProjectsEnhanced] Task deleted successfully');
    } catch (error) {
      console.error('[ProjectsEnhanced] Failed to delete task:', error);
      showError('Delete Failed', 'Failed to delete task. Please try again.');
    }
  };

  const handleCreateProject = async (projectData: { name: string; description: string; icon: string; iconColor: string }) => {
    try {
      console.log('[ProjectsEnhanced] Creating project:', projectData.name);
      const newProjectId = await addProject(projectData);
      console.log('[ProjectsEnhanced] Project created with ID:', newProjectId);
      setSelectedProjectId(newProjectId);
      setMainView('home');
    } catch (error) {
      console.error('[ProjectsEnhanced] Failed to create project:', error);
      showError('Create Failed', 'Failed to create project. Please try again.');
    }
  };

  const handleCreateBoard = async (boardData: { name: string; icon: string; iconColor: string }) => {
    if (selectedProjectId) {
      try {
        console.log('[ProjectsEnhanced] Creating board:', boardData.name, 'in project:', selectedProjectId);
        const newBoardId = await addBoard({
          ...boardData,
          projectId: selectedProjectId,
        });
        console.log('[ProjectsEnhanced] Board created with ID:', newBoardId);
        setSelectedBoardId(newBoardId);
        setMainView('board');

        // Open setup wizard for newly created board
        setTimeout(() => {
          modalHandlers.openSetupWizard(newBoardId, true);
        }, 100);
      } catch (error) {
        console.error('[ProjectsEnhanced] Failed to create board:', error);
        showError('Create Failed', 'Failed to create board. Please try again.');
      }
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    console.log('[ProjectsEnhanced] handleDeleteProject called with:', projectId);
    try {
      console.log('[ProjectsEnhanced] Deleting project:', projectId);
      await useProjectStore.getState().deleteProject(projectId);

      // If deleted project was selected, clear selection
      if (selectedProjectId === projectId) {
        setSelectedProjectId(projects[0]?.id || '');
        setSelectedBoardId('');
      }

      console.log('[ProjectsEnhanced] Project deleted successfully');
    } catch (error) {
      console.error('[ProjectsEnhanced] Failed to delete project:', error);
      showError('Delete Failed', 'Failed to delete project. Please try again.');
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    try {
      console.log('[ProjectsEnhanced] Deleting board:', boardId);
      await useProjectStore.getState().deleteBoard(boardId);

      // If deleted board was selected, clear selection
      if (selectedBoardId === boardId) {
        setSelectedBoardId('');
      }

      console.log('[ProjectsEnhanced] Board deleted successfully');
    } catch (error) {
      console.error('[ProjectsEnhanced] Failed to delete board:', error);
      showError('Delete Failed', 'Failed to delete board. Please try again.');
    }
  };

const statusColors: Record<string, string> = {
  'Backlog': '#94A3B8',
  'Todo': '#F59E0B', // Use normalized status
  'In Progress': '#3B82F6',
  'Blocked': '#EF4444', // red dot for blocked
  'Review': '#8B5CF6',
  'Done': '#10B981',
  'Cancelled': '#0F172A' // dark dot for cancelled
};

  const priorityColors: Record<string, string> = {
    'Critical': 'text-red-500',
    'High': 'text-orange-500',
    'Medium': 'text-yellow-500',
    'Low': 'text-gray-500'
  };

const columns: { status: string; title: string; color: string }[] = [
  { status: 'Backlog', title: 'Backlog', color: statusColors['Backlog'] },
  { status: 'Todo', title: 'To do', color: statusColors['Todo'] }, // Use normalized status
  { status: 'In Progress', title: 'In Progress', color: statusColors['In Progress'] },
  { status: 'Blocked', title: 'Blocked', color: statusColors['Blocked'] },
  { status: 'Review', title: 'Review', color: statusColors['Review'] },
  { status: 'Done', title: 'Done', color: statusColors['Done'] },
  { status: 'Cancelled', title: 'Cancelled', color: statusColors['Cancelled'] },
];

const { filteredTasks, archiveTasksByMonth, myTasksSegments } = useProjectFiltering({
  tasks,
  mainView,
  selectedProjectId,
  selectedBoardId,
  advancedFilters,
  searchQuery,
  activeTab,
  selectedStatus,
  selectedPriority,
  showMyTasks,
  sortBy,
  getBoardsTasks: getTasksByBoard,
});

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const selectedBoard = boards.find(b => b.id === selectedBoardId);
  const projectBoards = selectedProjectId ? getBoardsByProject(selectedProjectId) : [];

  const activeTasks = tasks.filter(t => t.projectId === selectedProjectId && t.status !== 'Done').length;
  const completedTasks = tasks.filter(t => t.projectId === selectedProjectId && t.status === 'Done').length;
  const boardSummaries = projectBoards.map((board) => {
    const boardTasks = getTasksByBoard(board.id);
    return {
      id: board.id,
      name: board.name,
      icon: board.icon,
      iconColor: board.iconColor,
      taskCount: boardTasks.length,
      active: boardTasks.filter((task) => task.status !== 'Done').length,
      completed: boardTasks.filter((task) => task.status === 'Done').length,
    };
  });

  // Status counts for chart view
  const statusCounts = columns.map(col => ({
    status: col.status,
    count: filteredTasks.filter(t => t.status === col.status).length,
    color: col.color
  }));
  const maxCount = Math.max(...statusCounts.map(s => s.count), 1);

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgPanel = theme === 'dark' ? 'bg-[#252540]' : 'bg-gray-100';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  return (
    <>
      <div 
        className={`min-h-full h-full flex flex-col transition-colors duration-300 ${bgMain}`}
        onClick={() => {
          setShowFilters(false);
          setShowSort(false);
        }}
      >
        {/* Top Navigation */}
        <div className={`border-b ${borderColor} px-8 pt-6`}>
          {/* Project and Board Selector */}
          <ProjectBoardSelector
            projects={projects}
            boards={boards}
            selectedProjectId={selectedProjectId}
            selectedBoardId={selectedBoardId}
            showProjectDropdown={showProjectDropdown}
            showBoardDropdown={showBoardDropdown}
            projectDropdownRef={projectDropdownRef}
            boardDropdownRef={boardDropdownRef}
            onProjectSelect={(projectId) => {
              setSelectedProjectId(projectId);
              const projectBoards = getBoardsByProject(projectId);
              setSelectedBoardId(projectBoards[0]?.id || '');
              setMainView('board');
              // Close dropdowns after selection
              if (showProjectDropdown) {
                dropdownHandlers.toggleProjectDropdown();
              }
              if (showBoardDropdown) {
                dropdownHandlers.toggleBoardDropdown();
              }
            }}
            onBoardSelect={(boardId) => {
              setSelectedBoardId(boardId);
              setMainView('board');
              // Close dropdown after selection
              if (showBoardDropdown) {
                dropdownHandlers.toggleBoardDropdown();
              }
            }}
            onToggleProjectDropdown={dropdownHandlers.toggleProjectDropdown}
            onToggleBoardDropdown={dropdownHandlers.toggleBoardDropdown}
            onCreateProject={modalHandlers.openCreateProject}
            onCreateBoard={modalHandlers.openCreateBoard}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            bgPanel={bgPanel}
            borderColor={borderColor}
            hoverBg={hoverBg}
          />

          {/* View Navigation */}
          <ViewNavigation
            mainView={mainView}
            onViewChange={(view) => {
              setHasUserSetMainView(true);
              setMainView(view);
            }}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            bgPanel={bgPanel}
            hoverBg={hoverBg}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* HOME VIEW */}
          {mainView === 'home' && (
            <HomeView
              selectedProjectName={selectedProject?.name}
              selectedProjectId={selectedProjectId}
              selectedBoardId={selectedBoardId}
              projects={projects}
              boards={boards}
              projectBoards={boardSummaries}
              activeTasks={activeTasks}
              completedTasks={completedTasks}
              onCreateBoard={modalHandlers.openCreateBoard}
              onManageTeam={modalHandlers.openTeamManagement}
              onOpenTemplateGallery={modalHandlers.openTemplateGallery}
              onCreateProject={modalHandlers.openCreateProject}
              onBoardSelect={(boardId) => {
                setSelectedBoardId(boardId);
                setMainView('board');
              }}
              onProjectSelect={(projectId) => {
                setSelectedProjectId(projectId);
                const projectBoards = getBoardsByProject(projectId);
                setSelectedBoardId(projectBoards[0]?.id || '');
              }}
              onEditProject={modalHandlers.openEditProject}
              onDeleteProject={handleDeleteProject}
              onEditBoard={modalHandlers.openEditBoard}
              onDeleteBoard={handleDeleteBoard}
              bgCard={bgCard}
              bgPanel={bgPanel}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              borderColor={borderColor}
              hoverBg={hoverBg}
            />
          )}

          {/* BOARD VIEW - PRESERVES ALL ORIGINAL FUNCTIONALITY */}
          {mainView === 'board' && (
            <>
              {!hasProjects ? (
                <div className="px-8 py-12">
                  <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className={`${bgCard} rounded-2xl border ${borderColor} p-8 shadow-sm`}>
                      <h3 className={`text-2xl ${textPrimary} mb-2`}>Add your first project</h3>
                      <p className={`text-sm ${textSecondary} mb-6`}>
                        Projects group boards and tasks. Start from scratch or use a template to get going faster.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={modalHandlers.openCreateProject}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:opacity-90 transition"
                        >
                          + New Project
                        </button>
                        <button
                          onClick={modalHandlers.openTemplateGallery}
                          className={`px-4 py-2 rounded-lg border ${borderColor} ${hoverBg} ${textPrimary} transition`}
                        >
                          Project Templates
                        </button>
                      </div>
                    </div>
                    <div className={`${bgCard} rounded-2xl border ${borderColor} p-8 shadow-sm`}>
                      <h3 className={`text-2xl ${textPrimary} mb-2`}>Add a board</h3>
                      <p className={`text-sm ${textSecondary} mb-6`}>
                        Boards live inside a project. Create a project first, then add the board where tasks will live.
                      </p>
                      <button
                        onClick={() => {
                          if (!hasProjects) return;
                          modalHandlers.openCreateBoard();
                        }}
                        disabled={!hasProjects}
                        className={`px-4 py-2 rounded-lg transition ${
                          hasProjects
                            ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:opacity-90'
                            : `border ${borderColor} ${textSecondary} cursor-not-allowed`
                        }`}
                      >
                        + New Board
                      </button>
                    </div>
                  </div>
                </div>
              ) : !selectedBoardId ? (
                <EmptyBoardState onCreateBoard={modalHandlers.openCreateBoard} />
              ) : (
                <BoardTabs
                  filteredTasks={filteredTasks}
                  columns={columns}
                  statusColors={statusColors}
                  priorityColors={priorityColors}
                  statusCounts={statusCounts}
                  maxCount={maxCount}
                  view={view}
                  activeTab={activeTab}
                  setView={setView}
                  setActiveTab={setActiveTab}
                  handleDrop={handleDrop}
                  setSelectedTask={setSelectedTask}
                  onAddTask={handleCreateTask}
                  archiveTasksByMonth={archiveTasksByMonth}
                  archiveFilter={archiveFilter}
                  setArchiveFilter={setArchiveFilter}
                  bgCard={bgCard}
                  bgPanel={bgPanel}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  borderColor={borderColor}
                  hoverBg={hoverBg}
                />
              )}
            </>
          )}

          {/* MY TASKS VIEW - TIME SEGMENTS */}
          {mainView === 'my-tasks' && (
            <MyTasksPanel
              segments={myTasksSegments as any}
              projects={projects.map(p => ({ id: p.id, name: p.name, icon: p.icon, iconColor: p.iconColor }))}
              boards={boards.map(b => ({ id: b.id, name: b.name, icon: b.icon, iconColor: b.iconColor }))}
              statusColors={statusColors}
              priorityColors={priorityColors}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              bgCard={bgCard}
              borderColor={borderColor}
              hoverBg={hoverBg}
              onSelectTask={setSelectedTask}
            />
          )}

        </div>
      </div>

      <ModalRenderer
        selectedTask={selectedTask}
        isCreatingTask={isCreatingTask}
        newTaskStatus={newTaskStatus}
        onTaskModalClose={() => {
          setSelectedTask(null);
          setIsCreatingTask(false);
          setNewTaskStatus('To do');
        }}
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={handleTaskDelete}
        showTeamManagement={modalState.showTeamManagement}
        showTemplateGallery={modalState.showTemplateGallery}
        showProjectSettings={modalState.showProjectSettings}
        showSetupWizard={modalState.showSetupWizard}
        showEditProject={modalState.showEditProject}
        showEditBoard={modalState.showEditBoard}
        showCreateProject={modalState.showCreateProject}
        showCreateBoard={modalState.showCreateBoard}
        selectedProjectForSettings={modalState.selectedProjectForSettings}
        selectedBoardForWizard={modalState.selectedBoardForWizard}
        selectedProjectForEdit={modalState.selectedProjectForEdit}
        selectedBoardForEdit={modalState.selectedBoardForEdit}
        selectedProjectId={selectedProjectId}
        selectedBoardId={selectedBoardId}
        isInitialBoardSetup={modalState.isInitialBoardSetup}
        onCloseTeamManagement={modalHandlers.setShowTeamManagement.bind(null, false)}
        onCloseTemplateGallery={modalHandlers.setShowTemplateGallery.bind(null, false)}
        onCloseProjectSettings={modalHandlers.closeProjectSettings}
        onCloseSetupWizard={modalHandlers.closeSetupWizard}
        onCloseEditProject={modalHandlers.closeEditProject}
        onCloseEditBoard={modalHandlers.closeEditBoard}
        onCloseCreateProject={modalHandlers.setShowCreateProject.bind(null, false)}
        onCloseCreateBoard={modalHandlers.setShowCreateBoard.bind(null, false)}
        onCreateProject={handleCreateProject}
        onCreateBoard={handleCreateBoard}
      />
    </>
  );
}
