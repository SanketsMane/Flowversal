/**
 * Projects and Boards Store
 * Manages projects, boards, and tasks with localStorage persistence and API integration
 */

import { create } from 'zustand';
import { tasksService, CreateTaskData, UpdateTaskData } from '@/core/api/services/tasks.service';
import { createProject, createBoard, fetchProjects, fetchBoards, fetchTasks } from '@/core/api/services/projects.service';

// Unique ID generator with counter to avoid collisions
let idCounter = 0;
const generateUniqueId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${++idCounter}`;
};

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'blocked' | 'done';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  assignee?: string;
  dueDate?: string;
  startDate?: string;
  recurring?: string;
  reminder?: string;
  selectedDays?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  boards: Board[];
  isExpanded: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProjectStore {
  projects: Project[];
  selectedProjectId: string | null;
  selectedBoardId: string | null;
  showMyTasks: boolean;
  
  // Project actions
  addProject: (name: string, description?: string) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  toggleProjectExpansion: (id: string) => void;
  
  // Board actions
  addBoard: (projectId: string, name: string, description?: string) => Promise<void>;
  updateBoard: (projectId: string, boardId: string, updates: Partial<Board>) => void;
  deleteBoard: (projectId: string, boardId: string) => void;
  
  // Task actions
  addTask: (projectId: string, boardId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (projectId: string, boardId: string, taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (projectId: string, boardId: string, taskId: string) => Promise<void>;
  moveTask: (projectId: string, boardId: string, taskId: string, newStatus: Task['status']) => void;
  
  // Selection actions
  selectProject: (id: string) => void;
  selectBoard: (projectId: string, boardId: string) => void;
  clearSelection: () => void;
  setShowMyTasks: (show: boolean) => void;
  
  // Getters
  getSelectedProject: () => Project | null;
  getSelectedBoard: () => Board | null;
}

// Default onboarding project with demo tasks
const createDefaultProject = (): Project => ({
  id: 'default-project-1',
  name: 'Getting Started',
  description: 'Learn how to use Flowversal',
  color: '#00C6FF',
  icon: '🚀',
  isExpanded: true,
  boards: [
    {
      id: 'default-board-1',
      name: 'Onboarding Tasks',
      description: 'Complete these tasks to learn Flowversal',
      color: '#9D50BB',
      icon: '✨',
      tasks: [
        {
          id: 'task-1',
          title: 'Create your first workflow',
          description: 'Go to Workflows tab and create your first automation workflow',
          status: 'todo',
          priority: 'high',
          tags: ['onboarding', 'workflow'],
          assignee: '1',
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-2',
          title: 'Try creating a new task',
          description: 'Click the "New Task" button to create your own task',
          status: 'todo',
          priority: 'high',
          tags: ['onboarding'],
          assignee: '1',
          dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-3',
          title: 'Add your team members',
          description: 'Invite team members to collaborate on projects',
          status: 'todo',
          priority: 'medium',
          tags: ['onboarding', 'team'],
          assignee: '1',
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-4',
          title: 'Share about us on social media',
          description: 'Help us grow by sharing Flowversal with your network',
          status: 'todo',
          priority: 'low',
          tags: ['social', 'community'],
          assignee: '1',
          dueDate: new Date(Date.now() + 86400000 * 7).toISOString(), // 1 week
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-5',
          title: 'Refer your friends',
          description: 'Invite friends to join Flowversal and earn rewards',
          status: 'todo',
          priority: 'low',
          tags: ['referral', 'community'],
          assignee: '1',
          dueDate: new Date(Date.now() + 86400000 * 7).toISOString(), // 1 week
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'task-6',
          title: 'Explore workflow templates',
          description: 'Check out pre-built workflow templates to get started faster',
          status: 'in-progress',
          priority: 'medium',
          tags: ['onboarding', 'workflow', 'templates'],
          assignee: '1',
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [createDefaultProject()],
  selectedProjectId: 'default-project-1',
  selectedBoardId: 'default-board-1',
  showMyTasks: false,
  
  // Project actions
  addProject: async (name, description) => {
    try {
      const result = await createProject({
      name,
      description,
      icon: 'FolderKanban',
        iconColor: '#00C6FF',
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to create project');
      }

      const newProject: Project = {
        id: result.data!.id,
        name: result.data!.name,
        description: result.data!.description,
        icon: result.data!.icon,
        color: result.data!.iconColor,
      boards: [],
      isExpanded: true,
        createdAt: result.data!.createdAt,
        updatedAt: result.data!.updatedAt,
    };
    
    set((state) => ({
      projects: [...state.projects, newProject],
    }));
    } catch (error) {
      console.error('[ProjectStore] Failed to create project:', error);
      throw error;
    }
  },
  
  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id
          ? { ...project, ...updates, updatedAt: new Date().toISOString() }
          : project
      ),
    }));
  },
  
  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
      selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId,
      selectedBoardId: state.selectedProjectId === id ? null : state.selectedBoardId,
    }));
  },
  
  toggleProjectExpansion: (id) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id
          ? { ...project, isExpanded: !project.isExpanded }
          : project
      ),
    }));
  },
  
  // Board actions
  addBoard: async (projectId, name, description) => {
    try {
      const result = await createBoard({
        projectId,
      name,
      description,
      icon: 'LayoutDashboard',
        iconColor: '#9D50BB',
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to create board');
      }

      const newBoard: Board = {
        id: result.data!.id,
        name: result.data!.name,
        description: result.data!.description,
        icon: result.data!.icon,
        color: result.data!.iconColor,
      tasks: [],
        createdAt: result.data!.createdAt,
        updatedAt: result.data!.updatedAt,
    };
    
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              boards: [...project.boards, newBoard],
              updatedAt: new Date().toISOString(),
            }
          : project
      ),
    }));
    } catch (error) {
      console.error('[ProjectStore] Failed to create board:', error);
      throw error;
    }
  },
  
  updateBoard: (projectId, boardId, updates) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              boards: project.boards.map((board) =>
                board.id === boardId
                  ? { ...board, ...updates, updatedAt: new Date().toISOString() }
                  : board
              ),
              updatedAt: new Date().toISOString(),
            }
          : project
      ),
    }));
  },
  
  deleteBoard: (projectId, boardId) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              boards: project.boards.filter((board) => board.id !== boardId),
              updatedAt: new Date().toISOString(),
            }
          : project
      ),
      selectedBoardId: state.selectedBoardId === boardId ? null : state.selectedBoardId,
    }));
  },
  
  // Task actions
  addTask: async (projectId, boardId, taskData) => {
    try {
      // Prepare data for API call
      const apiTaskData: CreateTaskData = {
        name: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        labels: taskData.tags,
        dueDate: taskData.dueDate,
        boardId,
        projectId,
      };

      // Call API to create task
      const createdTask = await tasksService.createTask(apiTaskData);

      // Convert API response to local Task format
    const newTask: Task = {
        id: createdTask.id,
        title: createdTask.name,
        description: createdTask.description || '',
        status: createdTask.status || 'todo',
        priority: createdTask.priority || 'medium',
        tags: createdTask.labels || [],
        dueDate: createdTask.dueDate,
        assignee: createdTask.assignedTo?.[0]?.name,
        createdAt: createdTask.createdAt,
        updatedAt: createdTask.updatedAt,
    };
    
      // Update local state
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              boards: project.boards.map((board) =>
                board.id === boardId
                  ? {
                      ...board,
                      tasks: [...board.tasks, newTask],
                      updatedAt: new Date().toISOString(),
                    }
                  : board
              ),
              updatedAt: new Date().toISOString(),
            }
          : project
      ),
    }));
    } catch (error) {
      console.error('[ProjectStore] Failed to create task:', error);
      throw error; // Re-throw to let the UI handle the error
    }
  },
  
  updateTask: async (projectId, boardId, taskId, updates) => {
    try {
      // Prepare data for API call
      const apiUpdateData: UpdateTaskData = {
        name: updates.title,
        description: updates.description,
        status: updates.status,
        priority: updates.priority,
        labels: updates.tags,
        dueDate: updates.dueDate,
        startDate: (updates as any).startDate,
        recurring: (updates as any).recurring,
        reminder: (updates as any).reminder,
        selectedDays: (updates as any).selectedDays,
        assignedTo: (updates as any).assignedTo,
        checklists: (updates as any).checklists,
        comments: (updates as any).comments,
        attachments: (updates as any).attachments,
        workflows: (updates as any).workflows,
        boardId: (updates as any).boardId,
        projectId: (updates as any).projectId,
      };

      // Call API to update task
      const updatedTask = await tasksService.updateTask(taskId, apiUpdateData);

      // Convert API response to local Task format
      const localUpdates: Partial<Task> = {
        title: updatedTask.name,
        description: updatedTask.description || '',
        status: updatedTask.status || 'todo',
        priority: updatedTask.priority || 'medium',
        tags: updatedTask.labels || [],
        dueDate: updatedTask.dueDate,
        startDate: updatedTask.startDate,
        recurring: updatedTask.recurring,
        reminder: updatedTask.reminder,
        selectedDays: updatedTask.selectedDays,
        assignee: updatedTask.assignedTo?.[0]?.name,
        updatedAt: updatedTask.updatedAt,
      };

      // Update local state
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              boards: project.boards.map((board) =>
                board.id === boardId
                  ? {
                      ...board,
                      tasks: board.tasks.map((task) =>
                        task.id === taskId
                            ? { ...task, ...localUpdates, updatedAt: new Date().toISOString() }
                          : task
                      ),
                      updatedAt: new Date().toISOString(),
                    }
                  : board
              ),
              updatedAt: new Date().toISOString(),
            }
          : project
      ),
    }));
    } catch (error) {
      console.error('[ProjectStore] Failed to update task:', error);
      throw error;
    }
  },
  
  deleteTask: async (projectId, boardId, taskId) => {
    try {
      // Call API to delete task
      await tasksService.deleteTask(taskId);

      // Update local state
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              boards: project.boards.map((board) =>
                board.id === boardId
                  ? {
                      ...board,
                      tasks: board.tasks.filter((task) => task.id !== taskId),
                      updatedAt: new Date().toISOString(),
                    }
                  : board
              ),
              updatedAt: new Date().toISOString(),
            }
          : project
      ),
    }));
    } catch (error) {
      console.error('[ProjectStore] Failed to delete task:', error);
      throw error;
    }
  },
  
  moveTask: (projectId, boardId, taskId, newStatus) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              boards: project.boards.map((board) =>
                board.id === boardId
                  ? {
                      ...board,
                      tasks: board.tasks.map((task) =>
                        task.id === taskId
                          ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
                          : task
                      ),
                      updatedAt: new Date().toISOString(),
                    }
                  : board
              ),
              updatedAt: new Date().toISOString(),
            }
          : project
      ),
    }));
  },
  
  // Selection actions
  selectProject: (id) => {
    set({ selectedProjectId: id, showMyTasks: false });
  },
  
  selectBoard: (projectId, boardId) => {
    set({ selectedProjectId: projectId, selectedBoardId: boardId, showMyTasks: false });
  },
  
  clearSelection: () => {
    set({ selectedProjectId: null, selectedBoardId: null });
  },
  
  setShowMyTasks: (show) => {
    set({ showMyTasks: show });
  },
  
  // Getters
  getSelectedProject: () => {
    const state = get();
    return state.projects.find((p) => p.id === state.selectedProjectId) || null;
  },
  
  getSelectedBoard: () => {
    const state = get();
    const project = state.projects.find((p) => p.id === state.selectedProjectId);
    if (!project) return null;
    return project.boards.find((b) => b.id === state.selectedBoardId) || null;
  },
}));