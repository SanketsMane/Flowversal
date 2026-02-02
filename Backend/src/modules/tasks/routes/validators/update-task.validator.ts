import { UpdateTaskBody } from '../types/task-routes.types';

export function validateUpdateTask(body: UpdateTaskBody): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Optional field validations - only validate if provided
  if (body.name !== undefined) {
    if (typeof body.name !== 'string') {
      errors.push('Task name must be a string');
    } else if (body.name.trim().length === 0) {
      errors.push('Task name cannot be empty');
    } else if (body.name.length > 200) {
      errors.push('Task name must be less than 200 characters');
    }
  }

  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.push('Description must be a string');
  } else if (body.description && body.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  if (body.boardId !== undefined) {
    if (typeof body.boardId !== 'string') {
      errors.push('Board ID must be a string');
    } else if (!/^[0-9a-fA-F]{24}$/.test(body.boardId)) {
      errors.push('Board ID must be a valid MongoDB ObjectId');
    }
  }

  if (body.projectId !== undefined) {
    if (typeof body.projectId !== 'string') {
      errors.push('Project ID must be a string');
    } else if (!/^[0-9a-fA-F]{24}$/.test(body.projectId)) {
      errors.push('Project ID must be a valid MongoDB ObjectId');
    }
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
  if (body.status !== undefined) {
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

    if (!statusVariations.includes(body.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  return { isValid: errors.length === 0, errors };
}
