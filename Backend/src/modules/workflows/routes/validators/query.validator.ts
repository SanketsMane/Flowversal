import { ListWorkflowsQuery } from '../types/workflow-routes.types';

export function validateListWorkflowsQuery(query: ListWorkflowsQuery): {
  isValid: boolean;
  errors: string[];
  parsed: {
    page: number;
    limit: number;
    filters: any;
  };
} {
  const errors: string[] = [];

  // Parse and validate pagination
  const page = parseInt(query.page || '1') || 1;
  const limit = parseInt(query.limit || '20') || 20;

  if (page < 1) {
    errors.push('Page must be greater than 0');
  }

  if (limit < 1 || limit > 100) {
    errors.push('Limit must be between 1 and 100');
  }

  // Build filters object
  const filters: any = {};

  if (query.status) {
    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(query.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    } else {
      filters.status = query.status;
    }
  }

  if (query.isPublic !== undefined) {
    filters.isPublic = query.isPublic === 'true';
  }

  if (query.category) {
    filters.category = query.category;
  }

  if (query.tags) {
    filters.tags = query.tags.split(',').map((t: string) => t.trim());
  }

  if (query.search) {
    filters.search = query.search;
  }

  return {
    isValid: errors.length === 0,
    errors,
    parsed: {
      page,
      limit,
      filters,
    },
  };
}
