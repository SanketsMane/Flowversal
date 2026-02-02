import { CreateTaskBody } from '../types/task-routes.types';
import mongoose from 'mongoose';

export function validateCreateTask(body: CreateTaskBody): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required field validations
  if (!body.name || typeof body.name !== 'string') {
    errors.push('Task name is required and must be a string');
  } else if (body.name.trim().length === 0) {
    errors.push('Task name cannot be empty');
  } else if (body.name.length > 200) {
    errors.push('Task name must be less than 200 characters');
  }

  if (!body.boardId || typeof body.boardId !== 'string') {
    errors.push('Valid board ID is required');
  } else if (!mongoose.Types.ObjectId.isValid(body.boardId)) {
    errors.push('Board ID must be a valid MongoDB ObjectId');
  }

  if (!body.projectId || typeof body.projectId !== 'string') {
    errors.push('Valid project ID is required');
  } else if (!mongoose.Types.ObjectId.isValid(body.projectId)) {
    errors.push('Project ID must be a valid MongoDB ObjectId');
  }

  // Optional field validations
  if (body.description && typeof body.description !== 'string') {
    errors.push('Description must be a string');
  } else if (body.description && body.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  // Selected days validation (weekly recurring only)
  if (body.selectedDays !== undefined) {
    if (!Array.isArray(body.selectedDays)) {
      errors.push('selectedDays must be an array of strings');
    } else {
      const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      for (const day of body.selectedDays) {
        if (typeof day !== 'string' || !validDays.includes(day.toLowerCase())) {
          errors.push(`Invalid day "${day}". Must be one of: ${validDays.join(', ')}`);
        }
      }
    }
  }

  // Status validation (will be normalized later)
  const validStatuses = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done', 'Cancelled', 'Blocked'];
  const statusVariations = [
    'Backlog', 'backlog', 'BACKLOG',
    'To do', 'to do', 'TO DO', 'todo', 'Todo',
    'In Progress', 'in progress', 'IN PROGRESS', 'inprogress',
    'Review', 'review', 'REVIEW',
    'Done', 'done', 'DONE',
    'Cancelled', 'cancelled', 'CANCELLED',
    'Blocked', 'blocked', 'BLOCKED',
  ];

  if (body.status && !statusVariations.includes(body.status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  return { isValid: errors.length === 0, errors };
}
