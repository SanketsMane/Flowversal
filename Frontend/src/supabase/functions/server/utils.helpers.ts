/**
 * Helper Utilities
 * Reusable utility functions
 */
import type { User, UserRole, Subscription, SubscriptionUsage } from './types.ts';
// ============================================================================
// ID Generation
// ============================================================================
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
// ============================================================================
// User Role Management
// ============================================================================
export function getUserRole(user: User): UserRole {
  const roleFromMetadata = user.user_metadata?.role?.toLowerCase();
  if (roleFromMetadata === 'admin') return 'admin' as UserRole;
  if (roleFromMetadata === 'viewer') return 'viewer' as UserRole;
  return 'member' as UserRole;
}
// ============================================================================
// KV Store Key Generators
// ============================================================================
export function getSubscriptionKey(userId: string): string {
  return `subscription:${userId}`;
}
export function getWorkflowKey(workflowId: string): string {
  return `workflow:${workflowId}`;
}
export function getUserWorkflowKey(userId: string, workflowId: string): string {
  return `user:${userId}:workflow:${workflowId}`;
}
export function getUserWorkflowsPrefix(userId: string): string {
  return `user:${userId}:workflow:`;
}
export function getUserProjectsKey(userId: string): string {
  return `user:${userId}:projects`;
}
export function getUserBoardsKey(userId: string): string {
  return `user:${userId}:boards`;
}
export function getUserTasksKey(userId: string): string {
  return `user:${userId}:tasks`;
}
// ============================================================================
// Default Data Generators
// ============================================================================
export function getDefaultSubscription(userId: string): Subscription {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return {
    userId,
    tier: 'free',
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: nextMonth.toISOString(),
    cancelAtPeriodEnd: false,
    usage: {
      workflows: 0,
      executions: 0,
      storage: 0,
      apiCalls: 0,
      collaborators: 0,
      templates: 0,
      formSubmissions: 0,
      webhooks: 0,
    },
  };
}
export function createEmptyUsage(): SubscriptionUsage {
  return {
    workflows: 0,
    executions: 0,
    storage: 0,
    apiCalls: 0,
    collaborators: 0,
    templates: 0,
    formSubmissions: 0,
    webhooks: 0,
  };
}
// ============================================================================
// Date Helpers
// ============================================================================
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}
export function calculatePeriodEnd(billingCycle: 'monthly' | 'yearly'): string {
  const now = new Date();
  if (billingCycle === 'yearly') {
    return addYears(now, 1).toISOString();
  } else {
    return addMonths(now, 1).toISOString();
  }
}
// ============================================================================
// Logging Helpers
// ============================================================================
export function logInfo(service: string, message: string, data?: any) {
}
export function logSuccess(service: string, message: string, data?: any) {
}
export function logWarning(service: string, message: string, data?: any) {
  console.warn(`[${service}] ⚠️ ${message}`, data ? JSON.stringify(data, null, 2) : '');
}
export function logError(service: string, message: string, error?: any) {
  console.error(`[${service}] ❌ ${message}`, error ? JSON.stringify(error, null, 2) : '');
}
