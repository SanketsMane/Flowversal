/**
 * Project and Board Store
 * Manages projects, boards, and tasks with icon support
 * Integrated with backend API for data persistence
 */
import * as projectsAPI from '@/core/api/services/projects.service';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// Unique ID generator with counter to avoid collisions
let idCounter = 0;
const generateUniqueId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${++idCounter}`;
};
const labelColorMap: Record<string, string> = {
  Red: 'bg-red-500',
  Orange: 'bg-orange-500',
  Yellow: 'bg-yellow-500',
  Green: 'bg-emerald-500',
  Blue: 'bg-blue-500',
  Indigo: 'bg-indigo-500',
  Purple: 'bg-purple-500',
  Pink: 'bg-pink-500',
  Teal: 'bg-teal-500',
  Cyan: 'bg-cyan-500',
  Gray: 'bg-gray-500'
};
type LabelHint = { name: string; color: string };
type ApiProject = projectsAPI.Project;
type ApiBoard = projectsAPI.Board;
type ApiTask = projectsAPI.Task;
const buildLabelHintMap = (hints?: LabelHint[]) => {
  const map = new Map<string, string>();
  hints?.forEach((hint) => {
    if (!hint?.name) return;
    const normalizedColor = hint.color || labelColorMap[hint.name] || 'bg-blue-500';
    map.set(hint.name, normalizedColor);
  });
  return map;
};
const toLabelHints = (labels?: any[]): LabelHint[] => {
  if (!Array.isArray(labels)) return [];
  return labels
    .map((label) => {
      if (typeof label === 'string') {
        return {
          name: label,
          color: labelColorMap[label] || 'bg-blue-500'
        };
      }
      if (label && typeof label === 'object') {
        return {
          name: label.name || label.id || '',
          color: label.color || labelColorMap[label.name] || 'bg-blue-500'
        };
      }
      return null;
    })
    .filter((hint): hint is LabelHint => hint !== null && hint.name.trim().length > 0)
    .map((hint) => ({ name: hint.name.trim(), color: hint.color }));
};
const normalizeLabelEntry = (
  label: any,
  index: number,
  taskId: string,
  hintMap: Map<string, string>
): { id: string; name: string; color: string } | null => {
  if (typeof label === 'string') {
    const name = label.trim();
    if (!name) return null;
    return {
      id: `label-${taskId}-${index}`,
      name,
      color: hintMap.get(name) || labelColorMap[name] || 'bg-blue-500'
    };
  }
  if (label && typeof label === 'object') {
    const name = (label.name || label.id || '').toString().trim();
    if (!name) return null;
    return {
      id: label.id || `label-${taskId}-${index}`,
      name,
      color: label.color || hintMap.get(name) || labelColorMap[name] || 'bg-blue-500'
    };
  }
  return null;
};
const normalizeLabels = (labels: any, taskId: string, hints?: LabelHint[]) => {
  if (!Array.isArray(labels)) return [];
  const hintMap = buildLabelHintMap(hints);
  return labels
    .map((label, index) => normalizeLabelEntry(label, index, taskId, hintMap))
    .filter((label): label is { id: string; name: string; color: string } => label !== null);
};
const mapApiProjectToProject = (apiProject: ApiProject): Project => ({
  id: apiProject.id,
  name: apiProject.name,
  description: apiProject.description,
  icon: apiProject.icon,
  iconColor: apiProject.iconColor,
  createdAt: new Date(apiProject.createdAt),
  updatedAt: apiProject.updatedAt ? new Date(apiProject.updatedAt) : undefined,
  configuration: apiProject.configuration,
});
const mapApiTaskToTask = (apiTask: ApiTask & Partial<Task>, labelHints?: LabelHint[]): Task => {
  const safeId = apiTask.id || apiTask.taskId || generateUniqueId('task');
  const hints = labelHints ?? toLabelHints(apiTask.labels as any);
  return {
    id: safeId,
    taskId: apiTask.taskId || safeId,
    name: apiTask.name || '',
    description: apiTask.description || '',
    assignedTo: Array.isArray(apiTask.assignedTo)
      ? apiTask.assignedTo.map((assignee: any) => ({
          id: assignee.id || assignee.name || generateUniqueId('user'),
          name: assignee.name || 'Unknown',
          avatar: assignee.avatar || (assignee.name ? assignee.name.charAt(0).toUpperCase() : 'U'),
          email: assignee.email || '',
        }))
      : [],
    status: apiTask.status || 'Todo',
    priority: apiTask.priority || 'Medium',
    labels: normalizeLabels(apiTask.labels, safeId, hints),
    dueDate: apiTask.dueDate ? new Date(apiTask.dueDate) : undefined,
    startDate: apiTask.startDate ? new Date(apiTask.startDate) : undefined,
    recurring: apiTask.recurring,
    reminder: apiTask.reminder,
    hasWorkflow: !!apiTask.hasWorkflow,
    checklists: Array.isArray(apiTask.checklists) ? apiTask.checklists : [],
    comments: Array.isArray(apiTask.comments)
      ? apiTask.comments.map((comment: any) => ({
          ...comment,
          timestamp: comment?.timestamp ? new Date(comment.timestamp) : new Date(),
        }))
      : [],
    attachments: Array.isArray(apiTask.attachments) ? apiTask.attachments : [],
    attachedWorkflows: Array.isArray(apiTask.attachedWorkflows) ? apiTask.attachedWorkflows : [],
    boardId: apiTask.boardId,
    projectId: apiTask.projectId,
    createdBy: apiTask.createdBy || { id: 'system', name: 'System', avatar: 'S' },
    createdAt: apiTask.createdAt ? new Date(apiTask.createdAt) : new Date(),
    updatedAt: apiTask.updatedAt ? new Date(apiTask.updatedAt) : new Date(),
    order: apiTask.order ?? 0,
  };
};
export interface Task {
  id: string;
  taskId: string;
  name: string;
  description: string;
  assignedTo: Array<{ id: string; name: string; avatar: string; email?: string }>;
  status: string;
  priority: string;
  labels: Array<{ id: string; name: string; color: string }>;
  dueDate?: Date;
  startDate?: Date; // Start date for recurring tasks
  recurring?: string; // Recurring pattern
  reminder?: string; // Reminder setting
  hasWorkflow: boolean;
  checklists?: Array<{ id: string; name: string; items: Array<{ id: string; text: string; completed: boolean }> }>; // Task checklists
  comments?: Array<{ id: string; author: string; avatar: string; text: string; timestamp: Date }>; // Task comments
  attachments?: Array<{ id: string; name: string; type: 'file' | 'link'; url: string; size?: string }>; // Task attachments
  attachedWorkflows?: Array<{ id: string; workflowId: string; name: string; category: string; description: string }>; // Attached workflows
  boardId: string;
  projectId: string;
  createdBy: { id: string; name: string; avatar: string };
  createdAt: Date;
  updatedAt: Date;
  order?: number; // For drag-and-drop reordering within a column
}
export interface BoardConfiguration {
  companyName?: string;
  email?: string;
  apiKeys?: Record<string, string>; // e.g., { stripe: 'sk_...', sendgrid: 'SG...' }
  templateId?: string; // If created from template
  customFields?: Record<string, any>;
}
export interface Board {
  id: string;
  name: string;
  description?: string;
  icon: string; // Lucide icon name
  iconColor: string;
  projectId: string;
  createdAt: Date;
  updatedAt?: Date;
  userId?: string;
  configuration?: BoardConfiguration; // Board-specific configuration and API keys
}
// Keep project configuration for backward compatibility
export interface ProjectConfiguration {
  companyName?: string;
  email?: string;
  apiKeys?: Record<string, string>; // e.g., { stripe: 'sk_...', sendgrid: 'SG...' }
  templateId?: string; // If created from template
  customFields?: Record<string, any>;
}
export interface Project {
  id: string;
  name: string;
  description?: string;
  icon: string; // Lucide icon name
  iconColor: string;
  createdAt: Date;
  updatedAt?: Date;
  userId?: string;
  configuration?: ProjectConfiguration; // Project configuration and API keys
}
interface ProjectStore {
  projects: Project[];
  boards: Board[];
  tasks: Task[];
  // Project actions
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<string>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateProjectConfiguration: (id: string, config: ProjectConfiguration) => void;
  getProjectConfiguration: (id: string) => ProjectConfiguration | undefined;
  // Board actions
  addBoard: (board: Omit<Board, 'id' | 'createdAt'>) => Promise<string>;
  updateBoard: (id: string, updates: Partial<Board>) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  getBoardsByProject: (projectId: string) => Board[];
  updateBoardConfiguration: (id: string, config: BoardConfiguration) => void;
  getBoardConfiguration: (id: string) => BoardConfiguration | undefined;
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTasksByBoard: (boardId: string) => Task[];
  getTasksByProject: (projectId: string) => Task[];
  getAllUserTasks: (userId: string) => Task[];
  // Data loading
  loadAllData: () => Promise<void>;
  isLoading: boolean;
  isInitialized: boolean;
}
const LOGGED_IN_USER_ID = '4'; // Current logged-in user - Justin (justin@gmail.com)
export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [
        {
          id: 'proj-1',
          name: 'Marketing Projects',
          description: 'All marketing related work',
          icon: 'Megaphone',
          iconColor: '#EC4899',
          createdAt: new Date('2025-01-01'),
        },
        {
          id: 'proj-2',
          name: 'Development',
          description: 'Software development projects',
          icon: 'Code',
          iconColor: '#3B82F6',
          createdAt: new Date('2025-01-01'),
        },
      ],
      boards: [
        {
          id: 'board-1',
          name: 'Marketing Campaign',
          icon: 'Target',
          iconColor: '#EC4899',
          projectId: 'proj-1',
          createdAt: new Date('2025-01-02'),
        },
        {
          id: 'board-2',
          name: 'Content Calendar',
          icon: 'Calendar',
          iconColor: '#F59E0B',
          projectId: 'proj-1',
          createdAt: new Date('2025-01-03'),
        },
        {
          id: 'board-3',
          name: 'Sprint Planning',
          icon: 'Zap',
          iconColor: '#3B82F6',
          projectId: 'proj-2',
          createdAt: new Date('2025-01-02'),
        },
        {
          id: 'board-4',
          name: 'Bug Tracking',
          icon: 'Bug',
          iconColor: '#EF4444',
          projectId: 'proj-2',
          createdAt: new Date('2025-01-04'),
        },
      ],
      tasks: [
        // BACKLOG TASKS
        {
          id: 'task-backlog-1',
          taskId: 'TSK-001',
          name: 'Research competitor landing pages',
          description: 'Analyze top 10 competitor landing pages for inspiration',
          assignedTo: [
            { id: '1', name: 'John Doe', avatar: 'JD' },
          ],
          status: 'Backlog',
          priority: 'Low',
          labels: [
            { id: '1', name: 'Research', color: 'bg-purple-500' },
          ],
          dueDate: new Date('2025-12-30'),
          hasWorkflow: false,
          boardId: 'board-1',
          projectId: 'proj-1',
          createdBy: { id: '1', name: 'John Doe', avatar: 'JD' },
          createdAt: new Date('2025-10-15'),
          updatedAt: new Date('2025-10-15'),
        },
        {
          id: 'task-backlog-2',
          taskId: 'TSK-002',
          name: 'Plan Q1 marketing strategy',
          description: 'Define goals and tactics for next quarter',
          assignedTo: [
            { id: '2', name: 'Jane Smith', avatar: 'JS' },
          ],
          status: 'Backlog',
          priority: 'Medium',
          labels: [
            { id: '2', name: 'Planning', color: 'bg-blue-500' },
          ],
          hasWorkflow: false,
          boardId: 'board-1',
          projectId: 'proj-1',
          createdBy: { id: '2', name: 'Jane Smith', avatar: 'JS' },
          createdAt: new Date('2025-10-10'),
          updatedAt: new Date('2025-10-10'),
        },
        // TO DO TASKS - Various due dates
        {
          id: 'task-todo-past',
          taskId: 'TSK-003',
          name: 'Update social media assets (OVERDUE)',
          description: 'Refresh all social media profile images and covers',
          assignedTo: [
            { id: '1', name: 'John Doe', avatar: 'JD' },
          ],
          status: 'To do',
          priority: 'High',
          labels: [
            { id: '3', name: 'Design', color: 'bg-pink-500' },
          ],
          dueDate: new Date('2025-11-15'), // Past date
          hasWorkflow: true,
          boardId: 'board-1',
          projectId: 'proj-1',
          createdBy: { id: '1', name: 'John Doe', avatar: 'JD' },
          createdAt: new Date('2025-10-20'),
          updatedAt: new Date('2025-11-01'),
        },
        {
          id: 'task-todo-today',
          taskId: 'TSK-004',
          name: 'Finalize email campaign copy (TODAY)',
          description: 'Review and approve email campaign for launch',
          assignedTo: [
            { id: '2', name: 'Jane Smith', avatar: 'JS' },
          ],
          status: 'To do',
          priority: 'Critical',
          labels: [
            { id: '4', name: 'Content', color: 'bg-green-500' },
          ],
          dueDate: new Date(), // Today
          hasWorkflow: false,
          boardId: 'board-1',
          projectId: 'proj-1',
          createdBy: { id: '2', name: 'Jane Smith', avatar: 'JS' },
          createdAt: new Date('2025-11-18'),
          updatedAt: new Date('2025-11-19'),
        },
        {
          id: 'task-todo-tomorrow',
          taskId: 'TSK-005',
          name: 'Schedule blog posts (TOMORROW)',
          description: 'Queue up next weeks blog content',
          assignedTo: [
            { id: '3', name: 'Bob Wilson', avatar: 'BW' },
          ],
          status: 'To do',
          priority: 'Medium',
          labels: [
            { id: '4', name: 'Content', color: 'bg-green-500' },
          ],
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          hasWorkflow: false,
          boardId: 'board-2',
          projectId: 'proj-1',
          createdBy: { id: '3', name: 'Bob Wilson', avatar: 'BW' },
          createdAt: new Date('2025-11-15'),
          updatedAt: new Date('2025-11-18'),
        },
        {
          id: 'task-todo-thisweek',
          taskId: 'TSK-006',
          name: 'Create Instagram reels (THIS WEEK)',
          description: 'Produce 5 Instagram reels for product launch',
          assignedTo: [
            { id: '1', name: 'John Doe', avatar: 'JD' },
          ],
          status: 'To do',
          priority: 'High',
          labels: [
            { id: '5', name: 'Video', color: 'bg-purple-500' },
          ],
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          hasWorkflow: true,
          boardId: 'board-1',
          projectId: 'proj-1',
          createdBy: { id: '1', name: 'John Doe', avatar: 'JD' },
          createdAt: new Date('2025-11-10'),
          updatedAt: new Date('2025-11-12'),
        },
        {
          id: 'task-todo-thismonth',
          taskId: 'TSK-007',
          name: 'Launch holiday campaign (THIS MONTH)',
          description: 'Execute full holiday marketing campaign',
          assignedTo: [
            { id: '2', name: 'Jane Smith', avatar: 'JS' },
            { id: '1', name: 'John Doe', avatar: 'JD' },
          ],
          status: 'To do',
          priority: 'High',
          labels: [
            { id: '6', name: 'Campaign', color: 'bg-red-500' },
          ],
          dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
          hasWorkflow: true,
          boardId: 'board-1',
          projectId: 'proj-1',
          createdBy: { id: '2', name: 'Jane Smith', avatar: 'JS' },
          createdAt: new Date('2025-11-01'),
          updatedAt: new Date('2025-11-05'),
        },
        // IN PROGRESS TASKS
        {
          id: 'task-progress-1',
          taskId: 'TSK-008',
          name: 'Design landing page mockups',
          description: 'Create wireframes and high-fidelity mockups',
          assignedTo: [
            { id: '1', name: 'John Doe', avatar: 'JD' },
            { id: '2', name: 'Jane Smith', avatar: 'JS' },
          ],
          status: 'In Progress',
          priority: 'High',
          labels: [
            { id: '3', name: 'Design', color: 'bg-pink-500' },
            { id: '7', name: 'Frontend', color: 'bg-blue-500' },
          ],
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          hasWorkflow: true,
          boardId: 'board-1',
          projectId: 'proj-1',
          createdBy: { id: '1', name: 'John Doe', avatar: 'JD' },
          createdAt: new Date('2025-11-10'),
          updatedAt: new Date('2025-11-18'),
        },
        {
          id: 'task-progress-2',
          taskId: 'TSK-009',
          name: 'Implement user authentication',
          description: 'Setup OAuth 2.0 and session management',
          assignedTo: [
            { id: '3', name: 'Bob Wilson', avatar: 'BW' },
          ],
          status: 'In Progress',
          priority: 'Critical',
          labels: [
            { id: '8', name: 'Backend', color: 'bg-green-500' },
            { id: '9', name: 'Security', color: 'bg-red-500' },
          ],
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          hasWorkflow: false,
          boardId: 'board-3',
          projectId: 'proj-2',
          createdBy: { id: '3', name: 'Bob Wilson', avatar: 'BW' },
          createdAt: new Date('2025-11-05'),
          updatedAt: new Date('2025-11-17'),
        },
        // REVIEW TASKS
        {
          id: 'task-review-1',
          taskId: 'TSK-010',
          name: 'Review API documentation',
          description: 'Check all endpoints are properly documented',
          assignedTo: [
            { id: '3', name: 'Bob Wilson', avatar: 'BW' },
          ],
          status: 'Review',
          priority: 'Medium',
          labels: [
            { id: '10', name: 'Documentation', color: 'bg-gray-500' },
          ],
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          hasWorkflow: false,
          boardId: 'board-3',
          projectId: 'proj-2',
          createdBy: { id: '3', name: 'Bob Wilson', avatar: 'BW' },
          createdAt: new Date('2025-11-12'),
          updatedAt: new Date('2025-11-19'),
        },
        // BLOCKED TASKS
        {
          id: 'task-blocked-1',
          taskId: 'TSK-011',
          name: 'Deploy staging environment',
          description: 'Waiting for DevOps team approval',
          assignedTo: [
            { id: '3', name: 'Bob Wilson', avatar: 'BW' },
          ],
          status: 'Blocked',
          priority: 'High',
          labels: [
            { id: '11', name: 'DevOps', color: 'bg-orange-500' },
          ],
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          hasWorkflow: false,
          boardId: 'board-3',
          projectId: 'proj-2',
          createdBy: { id: '3', name: 'Bob Wilson', avatar: 'BW' },
          createdAt: new Date('2025-11-15'),
          updatedAt: new Date('2025-11-18'),
        },
        // DONE TASKS - Recent (this month)
        {
          id: 'task-done-recent-1',
          taskId: 'TSK-012',
          name: 'Setup CI/CD pipeline',
          description: 'Configure GitHub Actions for automated deployment',
          assignedTo: [
            { id: '3', name: 'Bob Wilson', avatar: 'BW' },
          ],
          status: 'Done',
          priority: 'High',
          labels: [
            { id: '11', name: 'DevOps', color: 'bg-orange-500' },
          ],
          hasWorkflow: false,
          boardId: 'board-3',
          projectId: 'proj-2',
          createdBy: { id: '3', name: 'Bob Wilson', avatar: 'BW' },
          createdAt: new Date('2025-11-01'),
          updatedAt: new Date('2025-11-10'),
        },
        {
          id: 'task-done-recent-2',
          taskId: 'TSK-013',
          name: 'Fix payment gateway bug',
          description: 'Resolved Stripe webhook issues',
          assignedTo: [
            { id: '3', name: 'Bob Wilson', avatar: 'BW' },
            { id: '2', name: 'Jane Smith', avatar: 'JS' },
          ],
          status: 'Done',
          priority: 'Critical',
          labels: [
            { id: '12', name: 'Bug', color: 'bg-red-500' },
            { id: '8', name: 'Backend', color: 'bg-green-500' },
          ],
          hasWorkflow: false,
          boardId: 'board-4',
          projectId: 'proj-2',
          createdBy: { id: '3', name: 'Bob Wilson', avatar: 'BW' },
          createdAt: new Date('2025-11-08'),
          updatedAt: new Date('2025-11-15'),
        },
        // DONE TASKS - Last month (October 2025)
        {
          id: 'task-done-lastmonth-1',
          taskId: 'TSK-014',
          name: 'Launch brand refresh',
          description: 'New logo and brand guidelines released',
          assignedTo: [
            { id: '1', name: 'John Doe', avatar: 'JD' },
          ],
          status: 'Done',
          priority: 'High',
          labels: [
            { id: '3', name: 'Design', color: 'bg-pink-500' },
          ],
          hasWorkflow: true,
          boardId: 'board-1',
          projectId: 'proj-1',
          createdBy: { id: '1', name: 'John Doe', avatar: 'JD' },
          createdAt: new Date('2025-09-20'),
          updatedAt: new Date('2025-10-25'),
        },
        {
          id: 'task-done-lastmonth-2',
          taskId: 'TSK-015',
          name: 'Migrate database to PostgreSQL',
          description: 'Successfully migrated from MySQL to PostgreSQL',
          assignedTo: [
            { id: '3', name: 'Bob Wilson', avatar: 'BW' },
          ],
          status: 'Done',
          priority: 'Critical',
          labels: [
            { id: '8', name: 'Backend', color: 'bg-green-500' },
            { id: '13', name: 'Database', color: 'bg-indigo-500' },
          ],
          hasWorkflow: false,
          boardId: 'board-3',
          projectId: 'proj-2',
          createdBy: { id: '3', name: 'Bob Wilson', avatar: 'BW' },
          createdAt: new Date('2025-09-15'),
          updatedAt: new Date('2025-10-20'),
        },
        // DONE TASKS - 2 months ago (September 2025)
        {
          id: 'task-done-2months-1',
          taskId: 'TSK-016',
          name: 'Launch summer campaign',
          description: 'Successful summer marketing campaign',
          assignedTo: [
            { id: '2', name: 'Jane Smith', avatar: 'JS' },
          ],
          status: 'Done',
          priority: 'High',
          labels: [
            { id: '6', name: 'Campaign', color: 'bg-red-500' },
          ],
          hasWorkflow: true,
          boardId: 'board-1',
          projectId: 'proj-1',
          createdBy: { id: '2', name: 'Jane Smith', avatar: 'JS' },
          createdAt: new Date('2025-08-01'),
          updatedAt: new Date('2025-09-15'),
        },
        // Future tasks (no due date)
        {
          id: 'task-future-1',
          taskId: 'TSK-017',
          name: 'Explore AI integration opportunities',
          description: 'Research potential AI features for the product',
          assignedTo: [
            { id: '1', name: 'John Doe', avatar: 'JD' },
          ],
          status: 'To do',
          priority: 'Low',
          labels: [
            { id: '14', name: 'Innovation', color: 'bg-cyan-500' },
          ],
          hasWorkflow: false,
          boardId: 'board-3',
          projectId: 'proj-2',
          createdBy: { id: '1', name: 'John Doe', avatar: 'JD' },
          createdAt: new Date('2025-11-01'),
          updatedAt: new Date('2025-11-01'),
        },
        // JUSTIN'S TASKS - justin@gmail.com (id: '4')
        {
          id: 'task-justin-1',
          taskId: 'TSK-018',
          name: 'Design new dashboard UI',
          description: 'Create modern dashboard design with data visualizations',
          assignedTo: [
            { id: '4', name: 'Justin', avatar: 'JU' },
          ],
          status: 'In Progress',
          priority: 'High',
          labels: [
            { id: '3', name: 'Design', color: 'bg-pink-500' },
            { id: '15', name: 'UI/UX', color: 'bg-purple-500' },
          ],
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          hasWorkflow: true,
          boardId: 'board-1',
          projectId: 'proj-1',
          createdBy: { id: '4', name: 'Justin', avatar: 'JU' },
          createdAt: new Date('2025-11-18'),
          updatedAt: new Date('2025-11-19'),
        },
        {
          id: 'task-justin-2',
          taskId: 'TSK-019',
          name: 'Update project documentation',
          description: 'Add API documentation and usage examples',
          assignedTo: [
            { id: '4', name: 'Justin', avatar: 'JU' },
            { id: '3', name: 'Bob Wilson', avatar: 'BW' },
          ],
          status: 'To do',
          priority: 'Medium',
          labels: [
            { id: '10', name: 'Documentation', color: 'bg-gray-500' },
          ],
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          hasWorkflow: false,
          boardId: 'board-3',
          projectId: 'proj-2',
          createdBy: { id: '4', name: 'Justin', avatar: 'JU' },
          createdAt: new Date('2025-11-17'),
          updatedAt: new Date('2025-11-17'),
        },
        {
          id: 'task-justin-3',
          taskId: 'TSK-020',
          name: 'Optimize mobile performance',
          description: 'Improve load times and responsiveness on mobile devices',
          assignedTo: [
            { id: '4', name: 'Justin', avatar: 'JU' },
          ],
          status: 'Review',
          priority: 'High',
          labels: [
            { id: '7', name: 'Frontend', color: 'bg-blue-500' },
            { id: '16', name: 'Performance', color: 'bg-yellow-500' },
          ],
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          hasWorkflow: true,
          boardId: 'board-3',
          projectId: 'proj-2',
          createdBy: { id: '4', name: 'Justin', avatar: 'JU' },
          createdAt: new Date('2025-11-15'),
          updatedAt: new Date('2025-11-19'),
        },
        {
          id: 'task-justin-4',
          taskId: 'TSK-021',
          name: 'Setup email notifications',
          description: 'Implement transactional email system',
          assignedTo: [
            { id: '4', name: 'Justin', avatar: 'JU' },
            { id: '1', name: 'John Doe', avatar: 'JD' },
          ],
          status: 'Backlog',
          priority: 'Low',
          labels: [
            { id: '8', name: 'Backend', color: 'bg-green-500' },
          ],
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
          hasWorkflow: false,
          boardId: 'board-3',
          projectId: 'proj-2',
          createdBy: { id: '4', name: 'Justin', avatar: 'JU' },
          createdAt: new Date('2025-11-10'),
          updatedAt: new Date('2025-11-10'),
        },
      ],
      isLoading: false,
      isInitialized: false,
      // Data loading
      loadAllData: async () => {
        const state = get();
        if (state.isInitialized || state.isLoading) {
          return;
        }
        try {
          set({ isLoading: true });
          const result = await projectsAPI.fetchAllUserData();
          if (result.success && result.data) {
            // Normalize tasks: convert string labels to objects and dates to Date objects
            const normalizedTasks = result.data.tasks.map((task: any) => ({
              ...task,
              labels: normalizeLabels(task.labels, task.id),
              dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
              startDate: task.startDate ? new Date(task.startDate) : undefined,
              createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
              updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
              // Ensure all additional fields are properly typed
              assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo.map((assignee: any) => ({
                id: assignee.id || assignee.name,
                name: assignee.name || 'Unknown',
                avatar: assignee.avatar || (assignee.name ? assignee.name.charAt(0).toUpperCase() : 'U'),
                email: assignee.email || ''
              })) : [],
              checklists: Array.isArray(task.checklists) ? task.checklists : [],
              comments: Array.isArray(task.comments) ? task.comments.map((comment: any) => ({
                ...comment,
                timestamp: comment.timestamp ? new Date(comment.timestamp) : new Date()
              })) : [],
              attachments: Array.isArray(task.attachments) ? task.attachments : [],
              attachedWorkflows: Array.isArray(task.attachedWorkflows) ? task.attachedWorkflows : [],
              recurring: task.recurring || 'Never',
              reminder: task.reminder || 'None',
            }));
            set({
              projects: result.data.projects as any[],
              boards: result.data.boards as any[],
              tasks: normalizedTasks,
              isLoading: false,
              isInitialized: true,
            });
          } else {
            console.error('[Project Store] Failed to load data:', result.errors);
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('[Project Store] Error loading data:', error);
          set({ isLoading: false });
        }
      },
      // Project actions
      addProject: async (project) => {
        // Optimistic update
        const tempId = generateUniqueId('proj');
        const tempProject: Project = {
          ...project,
          id: tempId,
          createdAt: new Date(),
        };
        set((state) => ({
          projects: [...state.projects, tempProject],
        }));
        // API call
        try {
          const result = await projectsAPI.createProject({
            name: project.name,
            description: project.description,
            icon: project.icon,
            iconColor: project.iconColor,
            configuration: project.configuration,
          });
          if (result.success && result.data) {
            // Replace temp with real data
            set((state) => ({
              projects: state.projects.map(p => p.id === tempId ? result.data as any : p),
            }));
            return result.data.id;
          } else {
            console.error('[Project Store] Failed to create project:', result.error);
            // Rollback optimistic update
            set((state) => ({
              projects: state.projects.filter(p => p.id !== tempId),
            }));
            throw new Error(result.error || 'Failed to create project');
          }
        } catch (error) {
          console.error('[Project Store] Error creating project:', error);
          // Rollback optimistic update
          set((state) => ({
            projects: state.projects.filter(p => p.id !== tempId),
          }));
          throw error;
        }
      },
      updateProject: async (id, updates) => {
        // Optimistic update
        const previousProjects = get().projects;
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
        // API call
        try {
          const result = await projectsAPI.updateProject(id, updates);
          const apiResponse = result as {
            success?: boolean;
            data?: ApiProject;
            error?: string;
            details?: string;
          };
          const success = apiResponse.success ?? !!apiResponse.data;
          const updatedProject = apiResponse.data ? mapApiProjectToProject(apiResponse.data) : undefined;
          if (success && updatedProject) {
            set((state) => ({
              projects: state.projects.map(p => p.id === id ? updatedProject : p),
            }));
          } else {
            console.warn('[Project Store] Project update returned non-success response; keeping optimistic update', apiResponse.error || apiResponse.details);
          }
        } catch (error) {
          console.error('[Project Store] Error updating project:', error);
          console.warn('[Project Store] Keeping optimistic update despite failure');
        }
      },
      deleteProject: async (id) => {
        // Optimistic update
        const previousState = {
          projects: get().projects,
          boards: get().boards,
          tasks: get().tasks,
        };
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          boards: state.boards.filter((b) => b.projectId !== id),
          tasks: state.tasks.filter((t) => t.projectId !== id),
        }));
        // API call
        try {
          const result = await projectsAPI.deleteProject(id);
          if (result.success) {
          } else {
            console.error('[Project Store] Failed to delete project:', result.error);
            // Rollback
            set(previousState);
            throw new Error(result.error || 'Failed to delete project');
          }
        } catch (error) {
          console.error('[Project Store] Error deleting project:', error);
          // Rollback
          set(previousState);
          throw error;
        }
      },
      updateProjectConfiguration: (id, config) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, configuration: { ...p.configuration, ...config } } : p
          ),
        }));
      },
      getProjectConfiguration: (id) => {
        return get().projects.find((p) => p.id === id)?.configuration;
      },
      // Board actions
      addBoard: async (board) => {
        // Optimistic update
        const tempId = generateUniqueId('board');
        const tempBoard: Board = {
          ...board,
          id: tempId,
          createdAt: new Date(),
        };
        set((state) => ({
          boards: [...state.boards, tempBoard],
        }));
        // API call
        try {
          const result = await projectsAPI.createBoard({
            name: board.name,
            description: board.description,
            icon: board.icon,
            iconColor: board.iconColor,
            projectId: board.projectId,
            configuration: board.configuration,
          });
          if (result.success && result.data) {
            set((state) => ({
              boards: state.boards.map(b => b.id === tempId ? result.data as any : b),
            }));
            return result.data.id;
          } else {
            console.error('[Project Store] Failed to create board:', result.error);
            set((state) => ({
              boards: state.boards.filter(b => b.id !== tempId),
            }));
            throw new Error(result.error || 'Failed to create board');
          }
        } catch (error) {
          console.error('[Project Store] Error creating board:', error);
          set((state) => ({
            boards: state.boards.filter(b => b.id !== tempId),
          }));
          throw error;
        }
      },
      updateBoard: async (id, updates) => {
        const previousBoards = get().boards;
        set((state) => ({
          boards: state.boards.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        }));
        try {
          const result = await projectsAPI.updateBoard(id, updates);
          if (result.success && result.data) {
            set((state) => ({
              boards: state.boards.map(b => b.id === id ? result.data as any : b),
            }));
          } else {
            console.error('[Project Store] Failed to update board:', result.error);
            set({ boards: previousBoards });
            throw new Error(result.error || 'Failed to update board');
          }
        } catch (error) {
          console.error('[Project Store] Error updating board:', error);
          set({ boards: previousBoards });
          throw error;
        }
      },
      deleteBoard: async (id) => {
        const previousState = {
          boards: get().boards,
          tasks: get().tasks,
        };
        set((state) => ({
          boards: state.boards.filter((b) => b.id !== id),
          tasks: state.tasks.filter((t) => t.boardId !== id),
        }));
        try {
          const result = await projectsAPI.deleteBoard(id);
          if (result.success) {
          } else {
            console.error('[Project Store] Failed to delete board:', result.error);
            set(previousState);
            throw new Error(result.error || 'Failed to delete board');
          }
        } catch (error) {
          console.error('[Project Store] Error deleting board:', error);
          set(previousState);
          throw error;
        }
      },
      getBoardsByProject: (projectId) => {
        return get().boards.filter((b) => b.projectId === projectId);
      },
      updateBoardConfiguration: (id, config) => {
        set((state) => ({
          boards: state.boards.map((b) =>
            b.id === id ? { ...b, configuration: config } : b
          ),
        }));
      },
      getBoardConfiguration: (id) => {
        const board = get().boards.find((b) => b.id === id);
        return board?.configuration;
      },
      // Task actions
      addTask: async (task) => {
        // Optimistic update
        const tempId = generateUniqueId('task');
        const taskId = `TSK-${String(get().tasks.length + 1).padStart(3, '0')}`;
        const tempTask: Task = {
          ...task,
          id: tempId,
          taskId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          tasks: [...state.tasks, tempTask],
        }));
        // API call
        try {
          // Validate required fields before API call
          if (!task.boardId || !task.projectId) {
            throw new Error('Board ID and Project ID are required to create a task');
          }
          // Normalize labels to strings for API (backend expects string array)
          const normalizedLabels = Array.isArray(task.labels)
            ? task.labels.map((label: any) => typeof label === 'string' ? label : label.name || label.id || '')
            : [];
          // Normalize assignedTo to ensure proper format
          const normalizedAssignedTo = Array.isArray(task.assignedTo) ? task.assignedTo : [];
          const result = await projectsAPI.createTask({
            name: task.name,
            description: task.description || '',
            assignedTo: normalizedAssignedTo,
            status: task.status,
            priority: task.priority,
            labels: normalizedLabels,
            dueDate: task.dueDate
              ? (task.dueDate instanceof Date
                  ? task.dueDate.toISOString()
                  : typeof task.dueDate === 'string'
                    ? task.dueDate
                    : undefined)
              : undefined,
            startDate: task.startDate
              ? (task.startDate instanceof Date
                  ? task.startDate.toISOString()
                  : typeof task.startDate === 'string'
                    ? task.startDate
                    : undefined)
              : undefined,
            recurring: task.recurring || 'Never',
            reminder: task.reminder || 'None',
            hasWorkflow: task.hasWorkflow || false,
            checklists: task.checklists || [],
            comments: task.comments || [],
            attachments: task.attachments || [],
            workflows: task.attachedWorkflows || [],
            boardId: task.boardId,
            projectId: task.projectId,
            createdBy: task.createdBy || { id: 'system', name: 'System', avatar: 'S' },
            order: task.order || 0,
          });
          if (result.success && result.data) {
            const normalizedTask = mapApiTaskToTask(
              result.data as ApiTask & Partial<Task>,
              toLabelHints(task.labels)
            );
            set((state) => ({
              tasks: state.tasks.map(t => t.id === tempId ? {
                ...normalizedTask,
              } : t),
            }));
            return normalizedTask.id;
          } else {
            console.error('[Project Store] Failed to create task:', result.error);
            console.error('[Project Store] Validation details:', result.details);
            set((state) => ({
              tasks: state.tasks.filter(t => t.id !== tempId),
            }));
            const errorMessage = result.details && Array.isArray(result.details) 
              ? result.details.join(', ')
              : result.error || 'Failed to create task';
            throw new Error(errorMessage);
          }
        } catch (error) {
          console.error('[Project Store] Error creating task:', error);
          set((state) => ({
            tasks: state.tasks.filter(t => t.id !== tempId),
          }));
          throw error;
        }
      },
      updateTask: async (id, updates) => {
        const previousTasks = get().tasks;
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
          ),
        }));
        try {
          const apiUpdates = {
            ...updates,
            dueDate: updates.dueDate instanceof Date ? updates.dueDate.toISOString() : updates.dueDate,
            startDate: updates.startDate instanceof Date ? updates.startDate.toISOString() : updates.startDate,
          };
          const result = await projectsAPI.updateTask(id, apiUpdates);
          if (result.success && result.data) {
            const normalizedTask = mapApiTaskToTask(
              result.data as ApiTask & Partial<Task>,
              toLabelHints(updates.labels)
            );
            set((state) => ({
              tasks: state.tasks.map(t => t.id === id ? {
                ...normalizedTask,
              } : t),
            }));
          } else {
            console.error('[Project Store] Failed to update task:', result.error);
            set({ tasks: previousTasks });
            throw new Error(result.error || 'Failed to update task');
          }
        } catch (error) {
          console.error('[Project Store] Error updating task:', error);
          set({ tasks: previousTasks });
          throw error;
        }
      },
      deleteTask: async (id) => {
        const previousTasks = get().tasks;
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
        try {
          const result = await projectsAPI.deleteTask(id);
          if (result.success) {
          } else {
            console.error('[Project Store] Failed to delete task:', result.error);
            set({ tasks: previousTasks });
            throw new Error(result.error || 'Failed to delete task');
          }
        } catch (error) {
          console.error('[Project Store] Error deleting task:', error);
          set({ tasks: previousTasks });
          throw error;
        }
      },
      getTasksByBoard: (boardId) => {
        return get().tasks.filter((t) => t.boardId === boardId);
      },
      getTasksByProject: (projectId) => {
        return get().tasks.filter((t) => t.projectId === projectId);
      },
      getAllUserTasks: (userId) => {
        return get().tasks.filter((t) => 
          t.assignedTo.some(user => user.id === userId) ||
          t.createdBy.id === userId
        );
      },
    }),
    {
      name: 'flowversal-project-store',
      // Disable persistence for development (memory-only)
      storage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      },
    }
  )
);