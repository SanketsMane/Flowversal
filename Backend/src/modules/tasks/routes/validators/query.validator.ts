import { ListTasksQuery } from '../types/task-routes.types';

export function validateListTasksQuery(query: ListTasksQuery): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate optional query parameters
  if (query.projectId !== undefined) {
    if (typeof query.projectId !== 'string') {
      errors.push('projectId must be a string');
    } else if (!/^[0-9a-fA-F]{24}$/.test(query.projectId)) {
      errors.push('projectId must be a valid MongoDB ObjectId');
    }
  }

  if (query.boardId !== undefined) {
    if (typeof query.boardId !== 'string') {
      errors.push('boardId must be a string');
    } else if (!/^[0-9a-fA-F]{24}$/.test(query.boardId)) {
      errors.push('boardId must be a valid MongoDB ObjectId');
    }
  }

  if (query.assignedTo !== undefined) {
    if (typeof query.assignedTo !== 'string') {
      errors.push('assignedTo must be a string');
    } else if (!/^[0-9a-fA-F]{24}$/.test(query.assignedTo)) {
      errors.push('assignedTo must be a valid MongoDB ObjectId');
    }
  }

  // Status validation (if provided)
  if (query.status !== undefined) {
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

    if (!statusVariations.includes(query.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  // Priority validation (if provided)
  if (query.priority !== undefined) {
    const validPriorities = ['Critical', 'High', 'Medium', 'Low'];
    const priorityVariations = [
      'Critical', 'critical', 'CRITICAL',
      'High', 'high', 'HIGH',
      'Medium', 'medium', 'MEDIUM',
      'Low', 'low', 'LOW',
    ];

    if (!priorityVariations.includes(query.priority)) {
      errors.push(`Priority must be one of: ${validPriorities.join(', ')}`);
    }
  }

  return { isValid: errors.length === 0, errors };
}
