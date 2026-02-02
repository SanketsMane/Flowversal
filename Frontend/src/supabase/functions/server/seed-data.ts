/**
 * Seed Data Utility
 * Creates initial data for justin@gmail.com user
 */

import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

/**
 * POST /seed-justin-data
 * Seeds data for justin@gmail.com user
 */
app.post('/seed-justin-data', async (c) => {
  try {
    console.log('[Seed] Seeding data for justin@gmail.com');
    
    const userId = 'justin-user-id'; // This should match the actual user ID from Supabase
    
    // Clear existing data
    await kv.del(`user:${userId}:projects`);
    await kv.del(`user:${userId}:boards`);
    await kv.del(`user:${userId}:tasks`);
    
    // Create sample projects
    const projects = [
      {
        id: 'proj-1',
        name: 'Website Redesign',
        description: 'Complete overhaul of company website',
        icon: '🎨',
        iconColor: '#6366f1',
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'proj-2',
        name: 'Mobile App',
        description: 'iOS and Android mobile application',
        icon: '📱',
        iconColor: '#8b5cf6',
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'proj-3',
        name: 'AI Integration',
        description: 'Integrate AI capabilities into platform',
        icon: '🤖',
        iconColor: '#06b6d4',
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    
    // Create sample boards
    const boards = [
      {
        id: 'board-1',
        name: 'Design Sprint',
        description: 'UI/UX Design Phase',
        icon: '✨',
        iconColor: '#ec4899',
        projectId: 'proj-1',
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'board-2',
        name: 'Development',
        description: 'Frontend & Backend Development',
        icon: '💻',
        iconColor: '#10b981',
        projectId: 'proj-1',
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'board-3',
        name: 'App Development',
        description: 'Mobile app development board',
        icon: '🚀',
        iconColor: '#f59e0b',
        projectId: 'proj-2',
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    
    // Create sample tasks
    const tasks = [
      // Board 1 tasks
      {
        id: 'task-1',
        taskId: 'TASK-1',
        name: 'Create wireframes',
        description: 'Design initial wireframes for all pages',
        status: 'To Do',
        priority: 'High',
        labels: [{ id: 'label-1', name: 'Design', color: '#ec4899' }],
        assignedTo: [{ id: userId, name: 'Justin', avatar: '' }],
        hasWorkflow: false,
        boardId: 'board-1',
        projectId: 'proj-1',
        userId: userId,
        createdBy: { id: userId, name: 'Justin', avatar: '' },
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-2',
        taskId: 'TASK-2',
        name: 'Design system',
        description: 'Create comprehensive design system',
        status: 'In Progress',
        priority: 'High',
        labels: [{ id: 'label-1', name: 'Design', color: '#ec4899' }],
        assignedTo: [{ id: userId, name: 'Justin', avatar: '' }],
        hasWorkflow: false,
        boardId: 'board-1',
        projectId: 'proj-1',
        userId: userId,
        createdBy: { id: userId, name: 'Justin', avatar: '' },
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-3',
        taskId: 'TASK-3',
        name: 'User testing',
        description: 'Conduct user testing sessions',
        status: 'Review',
        priority: 'Medium',
        labels: [{ id: 'label-2', name: 'Research', color: '#8b5cf6' }],
        assignedTo: [{ id: userId, name: 'Justin', avatar: '' }],
        hasWorkflow: false,
        boardId: 'board-1',
        projectId: 'proj-1',
        userId: userId,
        createdBy: { id: userId, name: 'Justin', avatar: '' },
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Board 2 tasks
      {
        id: 'task-4',
        taskId: 'TASK-4',
        name: 'Setup project',
        description: 'Initialize React project with Tailwind',
        status: 'Done',
        priority: 'High',
        labels: [{ id: 'label-3', name: 'Development', color: '#10b981' }],
        assignedTo: [{ id: userId, name: 'Justin', avatar: '' }],
        hasWorkflow: true,
        boardId: 'board-2',
        projectId: 'proj-1',
        userId: userId,
        createdBy: { id: userId, name: 'Justin', avatar: '' },
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-5',
        taskId: 'TASK-5',
        name: 'Build components',
        description: 'Create reusable UI components',
        status: 'In Progress',
        priority: 'High',
        labels: [{ id: 'label-3', name: 'Development', color: '#10b981' }],
        assignedTo: [{ id: userId, name: 'Justin', avatar: '' }],
        hasWorkflow: false,
        boardId: 'board-2',
        projectId: 'proj-1',
        userId: userId,
        createdBy: { id: userId, name: 'Justin', avatar: '' },
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    
    // Save to KV store
    await kv.set(`user:${userId}:projects`, projects);
    await kv.set(`user:${userId}:boards`, boards);
    await kv.set(`user:${userId}:tasks`, tasks);
    
    console.log('[Seed] Successfully seeded data for justin@gmail.com');
    console.log('[Seed] Created:', projects.length, 'projects,', boards.length, 'boards,', tasks.length, 'tasks');
    
    return c.json({
      success: true,
      message: 'Data seeded successfully for justin@gmail.com',
      data: {
        projects: projects.length,
        boards: boards.length,
        tasks: tasks.length,
      },
    });
  } catch (error: any) {
    console.error('[Seed] Error seeding data:', error);
    return c.json({
      success: false,
      error: 'Failed to seed data',
      details: error.message,
    }, 500);
  }
});

export default app;
