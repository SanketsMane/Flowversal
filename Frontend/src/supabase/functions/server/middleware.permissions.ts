/**
 * Permissions Middleware
 * Role-based access control (RBAC)
 */

import type { User, UserRole, PermissionAction } from './types.ts';
import { PERMISSIONS } from './types.ts';
import { getUserRole } from './utils.helpers.ts';
import { logInfo, logError } from './utils.helpers.ts';
import * as kv from './kv_store.tsx';
import {
  getUserProjectsKey,
  getUserBoardsKey,
  getUserTasksKey,
} from './utils.helpers.ts';

const SERVICE = 'PermissionsMiddleware';

// ============================================================================
// Permission Checking
// ============================================================================

/**
 * Check if user has permission for an operation
 */
export function hasPermission(user: User, operation: PermissionAction): boolean {
  const userRole = getUserRole(user);
  const allowedRoles = PERMISSIONS[operation];

  if (!allowedRoles) {
    logError(SERVICE, `Unknown operation: ${operation}`);
    return false;
  }

  const hasAccess = allowedRoles.includes(userRole);
  logInfo(SERVICE, `Permission check: ${operation} for role ${userRole} = ${hasAccess}`);
  
  return hasAccess;
}

/**
 * Require specific permission or return error
 */
export function requirePermission(
  user: User,
  operation: PermissionAction
): { success: true } | { error: string; status: number } {
  if (!hasPermission(user, operation)) {
    const userRole = getUserRole(user);
    logError(SERVICE, `Permission denied: ${operation} for role ${userRole}`);
    return {
      error: `Permission denied. You do not have permission to perform this action.`,
      status: 403,
    };
  }

  return { success: true };
}

// ============================================================================
// Resource Ownership Verification
// ============================================================================

/**
 * Verify user owns a specific resource
 */
export async function verifyOwnership(
  userId: string,
  resourceType: 'project' | 'board' | 'task',
  resourceId: string
): Promise<boolean> {
  try {
    if (resourceType === 'project') {
      const projectsKey = getUserProjectsKey(userId);
      const projects = await kv.get(projectsKey) || [];
      return projects.some((p: any) => p.id === resourceId);
    } else if (resourceType === 'board') {
      const boardsKey = getUserBoardsKey(userId);
      const boards = await kv.get(boardsKey) || [];
      return boards.some((b: any) => b.id === resourceId);
    } else if (resourceType === 'task') {
      const tasksKey = getUserTasksKey(userId);
      const tasks = await kv.get(tasksKey) || [];
      return tasks.some((t: any) => t.id === resourceId);
    }
    return false;
  } catch (error) {
    logError(SERVICE, 'Error verifying ownership', error);
    return false;
  }
}

/**
 * Require ownership or return error
 */
export async function requireOwnership(
  userId: string,
  resourceType: 'project' | 'board' | 'task',
  resourceId: string
): Promise<{ success: true } | { error: string; status: number }> {
  const owns = await verifyOwnership(userId, resourceType, resourceId);

  if (!owns) {
    logError(SERVICE, `Ownership verification failed: ${resourceType} ${resourceId}`);
    return {
      error: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} not found or access denied`,
      status: 404,
    };
  }

  return { success: true };
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User): boolean {
  return getUserRole(user) === 'admin';
}

/**
 * Check if user is member or higher
 */
export function isMemberOrHigher(user: User): boolean {
  const role = getUserRole(user);
  return role === 'admin' || role === 'member';
}

/**
 * Require admin role
 */
export function requireAdmin(user: User): { success: true } | { error: string; status: number } {
  if (!isAdmin(user)) {
    return {
      error: 'Permission denied. Only administrators can perform this action.',
      status: 403,
    };
  }
  return { success: true };
}
