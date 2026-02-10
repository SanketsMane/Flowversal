/**
 * Projects, Boards, and Tasks API Routes
 * 
 * RESTful API for managing projects, boards, and tasks
 * Uses Supabase KV store for data persistence
 * 
 * @module projects
 */
import { createClient } from "@supabase/supabase-js";
import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";
const app = new Hono();
// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
// Health check for projects routes
app.get('/health', (c) => {
  return c.json({ 
    success: true,
    status: 'ok', 
    service: 'projects',
    timestamp: new Date().toISOString() 
  });
});
// Test endpoint - no auth required
app.get('/test', (c) => {
  return c.json({
    success: true,
    message: 'Projects API is working',
    timestamp: new Date().toISOString(),
  });
});
/**
 * User Roles and Permissions
 * Define what actions each role can perform
 */
enum UserRole {
  ADMIN = 'admin',      // Full access - can delete projects/boards
  MEMBER = 'member',    // Can create, read, update (no delete)
  VIEWER = 'viewer',    // Read-only access
}
/**
 * Permission checks for operations
 */
const PERMISSIONS = {
  // Project permissions
  'project:create': [UserRole.ADMIN, UserRole.MEMBER],
  'project:read': [UserRole.ADMIN, UserRole.MEMBER, UserRole.VIEWER],
  'project:update': [UserRole.ADMIN, UserRole.MEMBER],
  'project:delete': [UserRole.ADMIN], // Only admins can delete projects
  // Board permissions
  'board:create': [UserRole.ADMIN, UserRole.MEMBER],
  'board:read': [UserRole.ADMIN, UserRole.MEMBER, UserRole.VIEWER],
  'board:update': [UserRole.ADMIN, UserRole.MEMBER],
  'board:delete': [UserRole.ADMIN], // Only admins can delete boards
  // Task permissions
  'task:create': [UserRole.ADMIN, UserRole.MEMBER],
  'task:read': [UserRole.ADMIN, UserRole.MEMBER, UserRole.VIEWER],
  'task:update': [UserRole.ADMIN, UserRole.MEMBER],
  'task:delete': [UserRole.ADMIN, UserRole.MEMBER], // Members can delete tasks
};
/**
 * Get user role from metadata or default to MEMBER
 * In production, this would come from your database/auth system
 */
function getUserRole(user: any): UserRole {
  // Check user metadata for role
  const roleFromMetadata = user.user_metadata?.role?.toLowerCase();
  if (roleFromMetadata === 'admin') return UserRole.ADMIN;
  if (roleFromMetadata === 'viewer') return UserRole.VIEWER;
  // Default to MEMBER for regular users
  return UserRole.MEMBER;
}
/**
 * Check if user has permission for an operation
 */
function hasPermission(user: any, operation: string): boolean {
  const userRole = getUserRole(user);
  const allowedRoles = PERMISSIONS[operation as keyof typeof PERMISSIONS];
  if (!allowedRoles) {
    console.error('[API] Unknown operation:', operation);
    return false;
  }
  return allowedRoles.includes(userRole);
}
/**
 * Utility: Verify user authentication
 * Author: Sanket - Production-ready authentication (demo tokens removed for security)
 */
async function verifyAuth(authHeader: string | null | undefined) {
  if (!authHeader) {
    return { error: 'Missing Authorization header', status: 401 };
  }
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return { error: 'Invalid Authorization format', status: 401 };
  }
  const token = parts[1]?.trim();
  // Verify with Supabase (production authentication only)
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) {
      console.error('[API] Supabase auth error:', error.message);
      return { error: 'Invalid or expired token', status: 401 };
    }
    if (!user) {
      return { error: 'User not found', status: 401 };
    }
    return { user };
  } catch (err: any) {
    console.error('[API] Exception during auth verification:', err.message);
    return { error: 'Authentication failed', status: 500 };
  }
}
/**
 * Utility: Verify resource ownership
 * Ensures users can only modify their own resources
 */
async function verifyOwnership(
  userId: string,
  resourceType: 'project' | 'board' | 'task',
  resourceId: string
): Promise<boolean> {
  try {
    if (resourceType === 'project') {
      const projectsKey = `user:${userId}:projects`;
      const projects = await kv.get(projectsKey) || [];
      return projects.some((p: any) => p.id === resourceId);
    } else if (resourceType === 'board') {
      const boardsKey = `user:${userId}:boards`;
      const boards = await kv.get(boardsKey) || [];
      return boards.some((b: any) => b.id === resourceId);
    } else if (resourceType === 'task') {
      const tasksKey = `user:${userId}:tasks`;
      const tasks = await kv.get(tasksKey) || [];
      return tasks.some((t: any) => t.id === resourceId);
    }
    return false;
  } catch (error) {
    console.error('[API] Error verifying ownership:', error);
    return false;
  }
}
/**
 * Utility: Generate unique ID
 */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
// ============================================================================
// PROJECT ROUTES
// ============================================================================
/**
 * GET /projects
 * List all projects for authenticated user
 */
app.get('/', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if ('error' in authResult) {
      console.error('[API] GET /projects - Auth failed:', authResult.error);
      // Return error in consistent format
      return c.json({ 
        success: false, 
        error: authResult.error,
        code: authResult.code || authResult.status,
        message: authResult.message || authResult.error 
      }, authResult.status);
    }
    const userId = authResult.user.id;
    // Fetch projects from KV store
    const projectsKey = `user:${userId}:projects`;
    const projects = await kv.get(projectsKey) || [];
    return c.json({
      success: true,
      data: projects,
      count: projects.length,
    });
  } catch (error: any) {
    console.error('[API] GET /projects - Error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch projects',
      details: error.message,
    }, 500);
  }
});
/**
 * POST /projects
 * Create a new project
 * REQUIRES: Admin or Member role
 */
app.post('/', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if ('error' in authResult) {
      console.error('[API] POST /projects - Auth failed:', authResult.error);
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }
    const userId = authResult.user.id;
    const body = await c.req.json();
    // SECURITY: Check if user has permission to create projects
    if (!hasPermission(authResult.user, 'project:create')) {
      console.error('[API] POST /projects - Permission denied for user:', userId);
      return c.json({
        success: false,
        error: 'Permission denied. You do not have permission to create projects.',
      }, 403);
    }
    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      console.error('[API] POST /projects - Validation failed: Missing project name');
      return c.json({
        success: false,
        error: 'Project name is required',
      }, 400);
    }
    // Create project object
    const project = {
      id: generateId('proj'),
      name: body.name.trim(),
      description: body.description || '',
      icon: body.icon || 'Briefcase',
      iconColor: body.iconColor || '#3B82F6',
      configuration: body.configuration || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId,
    };
    // Save to KV store
    const projectsKey = `user:${userId}:projects`;
    const existingProjects = await kv.get(projectsKey) || [];
    const updatedProjects = [...existingProjects, project];
    await kv.set(projectsKey, updatedProjects);
    return c.json({
      success: true,
      data: project,
      message: 'Project created successfully',
    }, 201);
  } catch (error: any) {
    console.error('[API] POST /projects - Error:', error);
    return c.json({
      success: false,
      error: 'Failed to create project',
      details: error.message,
    }, 500);
  }
});
/**
 * PUT /projects/:id
 * Update an existing project
 * REQUIRES: Admin or Member role
 */
app.put('/:id', async (c) => {
  try {
    const projectId = c.req.param('id');
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if ('error' in authResult) {
      console.error('[API] PUT /projects/:id - Auth failed:', authResult.error);
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }
    const userId = authResult.user.id;
    const body = await c.req.json();
    // SECURITY: Check if user has permission to update projects
    if (!hasPermission(authResult.user, 'project:update')) {
      console.error('[API] PUT /projects/:id - Permission denied for user:', userId);
      return c.json({
        success: false,
        error: 'Permission denied. You do not have permission to update projects.',
      }, 403);
    }
    // SECURITY: Verify user owns this project
    const ownsProject = await verifyOwnership(userId, 'project', projectId);
    if (!ownsProject) {
      console.error('[API] PUT /projects/:id - User does not own project:', projectId);
      return c.json({
        success: false,
        error: 'Project not found or access denied',
      }, 404);
    }
    // Fetch existing projects
    const projectsKey = `user:${userId}:projects`;
    const projects = await kv.get(projectsKey) || [];
    const projectIndex = projects.findIndex((p: any) => p.id === projectId);
    if (projectIndex === -1) {
      console.error('[API] PUT /projects/:id - Project not found:', projectId);
      return c.json({
        success: false,
        error: 'Project not found',
      }, 404);
    }
    // Update project
    const updatedProject = {
      ...projects[projectIndex],
      ...body,
      id: projectId, // Preserve ID
      userId, // Preserve user ID
      updatedAt: new Date().toISOString(),
    };
    projects[projectIndex] = updatedProject;
    await kv.set(projectsKey, projects);
    return c.json({
      success: true,
      data: updatedProject,
      message: 'Project updated successfully',
    });
  } catch (error: any) {
    console.error('[API] PUT /projects/:id - Error:', error);
    return c.json({
      success: false,
      error: 'Failed to update project',
      details: error.message,
    }, 500);
  }
});
/**
 * DELETE /projects/:id
 * Delete a project and all associated boards and tasks
 * REQUIRES: Admin role
 */
app.delete('/:id', async (c) => {
  try {
    const projectId = c.req.param('id');
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if ('error' in authResult) {
      console.error('[API] DELETE /projects/:id - Auth failed:', authResult.error);
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }
    const userId = authResult.user.id;
    // SECURITY: Check if user has permission to delete projects
    if (!hasPermission(authResult.user, 'project:delete')) {
      console.error('[API] DELETE /projects/:id - Permission denied for user:', userId);
      return c.json({
        success: false,
        error: 'Permission denied. Only administrators can delete projects.',
      }, 403);
    }
    // SECURITY: Verify user owns this project
    const ownsProject = await verifyOwnership(userId, 'project', projectId);
    if (!ownsProject) {
      console.error('[API] DELETE /projects/:id - User does not own project:', projectId);
      return c.json({
        success: false,
        error: 'Project not found or access denied',
      }, 404);
    }
    // Delete project
    const projectsKey = `user:${userId}:projects`;
    const projects = await kv.get(projectsKey) || [];
    const filteredProjects = projects.filter((p: any) => p.id !== projectId);
    if (projects.length === filteredProjects.length) {
      console.error('[API] DELETE /projects/:id - Project not found:', projectId);
      return c.json({
        success: false,
        error: 'Project not found',
      }, 404);
    }
    await kv.set(projectsKey, filteredProjects);
    // Delete associated boards
    const boardsKey = `user:${userId}:boards`;
    const boards = await kv.get(boardsKey) || [];
    const filteredBoards = boards.filter((b: any) => b.projectId !== projectId);
    await kv.set(boardsKey, filteredBoards);
    // Delete associated tasks
    const tasksKey = `user:${userId}:tasks`;
    const tasks = await kv.get(tasksKey) || [];
    const filteredTasks = tasks.filter((t: any) => t.projectId !== projectId);
    await kv.set(tasksKey, filteredTasks);
    const deletedBoards = boards.length - filteredBoards.length;
    const deletedTasks = tasks.length - filteredTasks.length;
    return c.json({
      success: true,
      message: 'Project deleted successfully',
      deleted: {
        project: projectId,
        boards: deletedBoards,
        tasks: deletedTasks,
      },
    });
  } catch (error: any) {
    console.error('[API] DELETE /projects/:id - Error:', error);
    return c.json({
      success: false,
      error: 'Failed to delete project',
      details: error.message,
    }, 500);
  }
});
// ============================================================================
// BOARD ROUTES
// ============================================================================
/**
 * GET /boards
 * List all boards (optionally filtered by projectId)
 */
app.get('/boards', async (c) => {
  try {
    const projectId = c.req.query('projectId');
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if ('error' in authResult) {
      console.error('[API] GET /boards - Auth failed:', authResult.error);
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }
    const userId = authResult.user.id;
    // Fetch boards from KV store
    const boardsKey = `user:${userId}:boards`;
    let boards = await kv.get(boardsKey) || [];
    // Filter by projectId if provided
    if (projectId) {
      boards = boards.filter((b: any) => b.projectId === projectId);
    }
    return c.json({
      success: true,
      data: boards,
      count: boards.length,
    });
  } catch (error: any) {
    console.error('[API] GET /boards - Error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch boards',
      details: error.message,
    }, 500);
  }
});
/**
 * POST /boards
 * Create a new board
 * REQUIRES: Admin or Member role
 */
app.post('/boards', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if ('error' in authResult) {
      console.error('[API] POST /boards - Auth failed:', authResult.error);
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }
    const userId = authResult.user.id;
    const body = await c.req.json();
    // SECURITY: Check if user has permission to create boards
    if (!hasPermission(authResult.user, 'board:create')) {
      console.error('[API] POST /boards - Permission denied for user:', userId);
      return c.json({
        success: false,
        error: 'Permission denied. You do not have permission to create boards.',
      }, 403);
    }
    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      console.error('[API] POST /boards - Validation failed: Missing board name');
      return c.json({
        success: false,
        error: 'Board name is required',
      }, 400);
    }
    if (!body.projectId) {
      console.error('[API] POST /boards - Validation failed: Missing project ID');
      return c.json({
        success: false,
        error: 'Project ID is required',
      }, 400);
    }
    // Create board object
    const board = {
      id: generateId('board'),
      name: body.name.trim(),
      description: body.description || '',
      icon: body.icon || 'Folder',
      iconColor: body.iconColor || '#3B82F6',
      projectId: body.projectId,
      configuration: body.configuration || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId,
    };
    // Save to KV store
    const boardsKey = `user:${userId}:boards`;
    const existingBoards = await kv.get(boardsKey) || [];
    const updatedBoards = [...existingBoards, board];
    await kv.set(boardsKey, updatedBoards);
    return c.json({
      success: true,
      data: board,
      message: 'Board created successfully',
    }, 201);
  } catch (error: any) {
    console.error('[API] POST /boards - Error:', error);
    return c.json({
      success: false,
      error: 'Failed to create board',
      details: error.message,
    }, 500);
  }
});
/**
 * PUT /boards/:id
 * Update an existing board
 * REQUIRES: Admin or Member role
 */
app.put('/boards/:id', async (c) => {
  try {
    const boardId = c.req.param('id');
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if ('error' in authResult) {
      console.error('[API] PUT /boards/:id - Auth failed:', authResult.error);
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }
    const userId = authResult.user.id;
    const body = await c.req.json();
    // SECURITY: Check if user has permission to update boards
    if (!hasPermission(authResult.user, 'board:update')) {
      console.error('[API] PUT /boards/:id - Permission denied for user:', userId);
      return c.json({
        success: false,
        error: 'Permission denied. You do not have permission to update boards.',
      }, 403);
    }
    // SECURITY: Verify user owns this board
    const ownsBoard = await verifyOwnership(userId, 'board', boardId);
    if (!ownsBoard) {
      console.error('[API] PUT /boards/:id - User does not own board:', boardId);
      return c.json({
        success: false,
        error: 'Board not found or access denied',
      }, 404);
    }
    // Fetch existing boards
    const boardsKey = `user:${userId}:boards`;
    const boards = await kv.get(boardsKey) || [];
    const boardIndex = boards.findIndex((b: any) => b.id === boardId);
    if (boardIndex === -1) {
      console.error('[API] PUT /boards/:id - Board not found:', boardId);
      return c.json({
        success: false,
        error: 'Board not found',
      }, 404);
    }
    // Update board
    const updatedBoard = {
      ...boards[boardIndex],
      ...body,
      id: boardId, // Preserve ID
      userId, // Preserve user ID
      updatedAt: new Date().toISOString(),
    };
    boards[boardIndex] = updatedBoard;
    await kv.set(boardsKey, boards);
    return c.json({
      success: true,
      data: updatedBoard,
      message: 'Board updated successfully',
    });
  } catch (error: any) {
    console.error('[API] PUT /boards/:id - Error:', error);
    return c.json({
      success: false,
      error: 'Failed to update board',
      details: error.message,
    }, 500);
  }
});
/**
 * DELETE /boards/:id
 * Delete a board and all associated tasks
 * REQUIRES: Admin role
 */
app.delete('/boards/:id', async (c) => {
  try {
    const boardId = c.req.param('id');
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if ('error' in authResult) {
      console.error('[API] DELETE /boards/:id - Auth failed:', authResult.error);
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }
    const userId = authResult.user.id;
    // SECURITY: Check if user has permission to delete boards
    if (!hasPermission(authResult.user, 'board:delete')) {
      console.error('[API] DELETE /boards/:id - Permission denied for user:', userId);
      return c.json({
        success: false,
        error: 'Permission denied. Only administrators can delete boards.',
      }, 403);
    }
    // SECURITY: Verify user owns this board
    const ownsBoard = await verifyOwnership(userId, 'board', boardId);
    if (!ownsBoard) {
      console.error('[API] DELETE /boards/:id - User does not own board:', boardId);
      return c.json({
        success: false,
        error: 'Board not found or access denied',
      }, 404);
    }
    // Delete board
    const boardsKey = `user:${userId}:boards`;
    const boards = await kv.get(boardsKey) || [];
    const filteredBoards = boards.filter((b: any) => b.id !== boardId);
    if (boards.length === filteredBoards.length) {
      console.error('[API] DELETE /boards/:id - Board not found:', boardId);
      return c.json({
        success: false,
        error: 'Board not found',
      }, 404);
    }
    await kv.set(boardsKey, filteredBoards);
    // Delete associated tasks
    const tasksKey = `user:${userId}:tasks`;
    const tasks = await kv.get(tasksKey) || [];
    const filteredTasks = tasks.filter((t: any) => t.boardId !== boardId);
    await kv.set(tasksKey, filteredTasks);
    const deletedTasks = tasks.length - filteredTasks.length;
    return c.json({
      success: true,
      message: 'Board deleted successfully',
      deleted: {
        board: boardId,
        tasks: deletedTasks,
      },
    });
  } catch (error: any) {
    console.error('[API] DELETE /boards/:id - Error:', error);
    return c.json({
      success: false,
      error: 'Failed to delete board',
      details: error.message,
    }, 500);
  }
});
// ============================================================================
// TASK ROUTES
// ============================================================================
/**
 * GET /tasks
 * List all tasks (optionally filtered by boardId or projectId)
 */
app.get('/tasks', async (c) => {
  try {
    const boardId = c.req.query('boardId');
    const projectId = c.req.query('projectId');
    const userId = c.req.query('userId');
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if ('error' in authResult) {
      console.error('[API] GET /tasks - Auth failed:', authResult.error);
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }
    const currentUserId = authResult.user.id;
    // Fetch tasks from KV store
    const tasksKey = `user:${currentUserId}:tasks`;
    let tasks = await kv.get(tasksKey) || [];
    // Apply filters
    if (boardId) {
      tasks = tasks.filter((t: any) => t.boardId === boardId);
    }
    if (projectId) {
      tasks = tasks.filter((t: any) => t.projectId === projectId);
    }
    if (userId) {
      tasks = tasks.filter((t: any) => 
        t.assignedTo?.some((u: any) => u.id === userId) || 
        t.createdBy?.id === userId
      );
    }
    return c.json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error: any) {
    console.error('[API] GET /tasks - Error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch tasks',
      details: error.message,
    }, 500);
  }
});
/**
 * POST /tasks
 * Create a new task
 * REQUIRES: Admin or Member role
 */
app.post('/tasks', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if ('error' in authResult) {
      console.error('[API] POST /tasks - Auth failed:', authResult.error);
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }
    const userId = authResult.user.id;
    const body = await c.req.json();
    // SECURITY: Check if user has permission to create tasks
    if (!hasPermission(authResult.user, 'task:create')) {
      console.error('[API] POST /tasks - Permission denied for user:', userId);
      return c.json({
        success: false,
        error: 'Permission denied. You do not have permission to create tasks.',
      }, 403);
    }
    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      console.error('[API] POST /tasks - Validation failed: Missing task name');
      return c.json({
        success: false,
        error: 'Task name is required',
      }, 400);
    }
    if (!body.boardId) {
      console.error('[API] POST /tasks - Validation failed: Missing board ID');
      return c.json({
        success: false,
        error: 'Board ID is required',
      }, 400);
    }
    if (!body.projectId) {
      console.error('[API] POST /tasks - Validation failed: Missing project ID');
      return c.json({
        success: false,
        error: 'Project ID is required',
      }, 400);
    }
    // Get current tasks to generate task ID
    const tasksKey = `user:${userId}:tasks`;
    const existingTasks = await kv.get(tasksKey) || [];
    const taskNumber = existingTasks.length + 1;
    // Create task object
    const task = {
      id: generateId('task'),
      taskId: `TSK-${String(taskNumber).padStart(3, '0')}`,
      name: body.name.trim(),
      description: body.description || '',
      assignedTo: body.assignedTo || [],
      status: body.status || 'To do',
      priority: body.priority || 'Medium',
      labels: body.labels || [],
      dueDate: body.dueDate || null,
      hasWorkflow: body.hasWorkflow || false,
      boardId: body.boardId,
      projectId: body.projectId,
      createdBy: body.createdBy || { id: userId, name: 'User', avatar: 'U' },
      order: body.order || existingTasks.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId,
    };
    // Save to KV store
    const updatedTasks = [...existingTasks, task];
    await kv.set(tasksKey, updatedTasks);
    return c.json({
      success: true,
      data: task,
      message: 'Task created successfully',
    }, 201);
  } catch (error: any) {
    console.error('[API] POST /tasks - Error:', error);
    return c.json({
      success: false,
      error: 'Failed to create task',
      details: error.message,
    }, 500);
  }
});
/**
 * PUT /tasks/:id
 * Update an existing task
 * REQUIRES: Admin or Member role
 */
app.put('/tasks/:id', async (c) => {
  try {
    const taskId = c.req.param('id');
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if ('error' in authResult) {
      console.error('[API] PUT /tasks/:id - Auth failed:', authResult.error);
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }
    const userId = authResult.user.id;
    const body = await c.req.json();
    // SECURITY: Check if user has permission to update tasks
    if (!hasPermission(authResult.user, 'task:update')) {
      console.error('[API] PUT /tasks/:id - Permission denied for user:', userId);
      return c.json({
        success: false,
        error: 'Permission denied. You do not have permission to update tasks.',
      }, 403);
    }
    // SECURITY: Verify user owns this task
    const ownsTask = await verifyOwnership(userId, 'task', taskId);
    if (!ownsTask) {
      console.error('[API] PUT /tasks/:id - User does not own task:', taskId);
      return c.json({
        success: false,
        error: 'Task not found or access denied',
      }, 404);
    }
    // Fetch existing tasks
    const tasksKey = `user:${userId}:tasks`;
    const tasks = await kv.get(tasksKey) || [];
    const taskIndex = tasks.findIndex((t: any) => t.id === taskId);
    if (taskIndex === -1) {
      console.error('[API] PUT /tasks/:id - Task not found:', taskId);
      return c.json({
        success: false,
        error: 'Task not found',
      }, 404);
    }
    // Update task
    const updatedTask = {
      ...tasks[taskIndex],
      ...body,
      id: taskId, // Preserve ID
      taskId: tasks[taskIndex].taskId, // Preserve task number
      userId, // Preserve user ID
      updatedAt: new Date().toISOString(),
    };
    tasks[taskIndex] = updatedTask;
    await kv.set(tasksKey, tasks);
    return c.json({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully',
    });
  } catch (error: any) {
    console.error('[API] PUT /tasks/:id - Error:', error);
    return c.json({
      success: false,
      error: 'Failed to update task',
      details: error.message,
    }, 500);
  }
});
/**
 * DELETE /tasks/:id
 * Delete a task
 * REQUIRES: Admin or Member role
 */
app.delete('/tasks/:id', async (c) => {
  try {
    const taskId = c.req.param('id');
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if ('error' in authResult) {
      console.error('[API] DELETE /tasks/:id - Auth failed:', authResult.error);
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }
    const userId = authResult.user.id;
    // SECURITY: Check if user has permission to delete tasks
    if (!hasPermission(authResult.user, 'task:delete')) {
      console.error('[API] DELETE /tasks/:id - Permission denied for user:', userId);
      return c.json({
        success: false,
        error: 'Permission denied. You do not have permission to delete tasks.',
      }, 403);
    }
    // SECURITY: Verify user owns this task
    const ownsTask = await verifyOwnership(userId, 'task', taskId);
    if (!ownsTask) {
      console.error('[API] DELETE /tasks/:id - User does not own task:', taskId);
      return c.json({
        success: false,
        error: 'Task not found or access denied',
      }, 404);
    }
    // Delete task
    const tasksKey = `user:${userId}:tasks`;
    const tasks = await kv.get(tasksKey) || [];
    const filteredTasks = tasks.filter((t: any) => t.id !== taskId);
    if (tasks.length === filteredTasks.length) {
      console.error('[API] DELETE /tasks/:id - Task not found:', taskId);
      return c.json({
        success: false,
        error: 'Task not found',
      }, 404);
    }
    await kv.set(tasksKey, filteredTasks);
    return c.json({
      success: true,
      message: 'Task deleted successfully',
      deleted: {
        task: taskId,
      },
    });
  } catch (error: any) {
    console.error('[API] DELETE /tasks/:id - Error:', error);
    return c.json({
      success: false,
      error: 'Failed to delete task',
      details: error.message,
    }, 500);
  }
});
export default app;