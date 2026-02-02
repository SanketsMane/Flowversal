/**
 * Input Validation Utilities
 * Centralized validation functions
 */

import type { ApiResponse } from './types.ts';

// ============================================================================
// Email Validation
// ============================================================================

export function validateEmail(email: string): ApiResponse {
  if (!email) {
    return { success: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Invalid email format' };
  }

  return { success: true };
}

// ============================================================================
// Password Validation
// ============================================================================

export function validatePassword(password: string): ApiResponse {
  if (!password) {
    return { success: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long' };
  }

  return { success: true };
}

// ============================================================================
// String Validation
// ============================================================================

export function validateRequiredString(value: any, fieldName: string): ApiResponse {
  if (!value || typeof value !== 'string' || !value.trim()) {
    return { success: false, error: `${fieldName} is required` };
  }
  return { success: true };
}

export function validateOptionalString(value: any): boolean {
  return value === undefined || value === null || typeof value === 'string';
}

// ============================================================================
// ID Validation
// ============================================================================

export function validateId(id: any, fieldName: string = 'ID'): ApiResponse {
  if (!id || typeof id !== 'string') {
    return { success: false, error: `${fieldName} is required` };
  }
  return { success: true };
}

// ============================================================================
// Tier and Billing Cycle Validation
// ============================================================================

export function validateSubscriptionTier(tier: any): ApiResponse {
  const validTiers = ['free', 'pro', 'enterprise'];
  if (!tier || !validTiers.includes(tier)) {
    return { success: false, error: 'Invalid subscription tier' };
  }
  return { success: true };
}

export function validateBillingCycle(billingCycle: any): ApiResponse {
  const validCycles = ['monthly', 'yearly'];
  if (!billingCycle || !validCycles.includes(billingCycle)) {
    return { success: false, error: 'Invalid billing cycle' };
  }
  return { success: true };
}

// ============================================================================
// Workflow Validation
// ============================================================================

export function validateWorkflowData(data: any): ApiResponse {
  if (!data.name) {
    return { success: false, error: 'Workflow name is required' };
  }

  if (typeof data.name !== 'string' || !data.name.trim()) {
    return { success: false, error: 'Invalid workflow name' };
  }

  return { success: true };
}

// ============================================================================
// Project Validation
// ============================================================================

export function validateProjectData(data: any): ApiResponse {
  if (!data.name) {
    return { success: false, error: 'Project name is required' };
  }

  if (typeof data.name !== 'string' || !data.name.trim()) {
    return { success: false, error: 'Invalid project name' };
  }

  return { success: true };
}

// ============================================================================
// Board Validation
// ============================================================================

export function validateBoardData(data: any): ApiResponse {
  if (!data.name) {
    return { success: false, error: 'Board name is required' };
  }

  if (typeof data.name !== 'string' || !data.name.trim()) {
    return { success: false, error: 'Invalid board name' };
  }

  if (!data.projectId) {
    return { success: false, error: 'Project ID is required' };
  }

  return { success: true };
}

// ============================================================================
// Task Validation
// ============================================================================

export function validateTaskData(data: any): ApiResponse {
  if (!data.title) {
    return { success: false, error: 'Task title is required' };
  }

  if (typeof data.title !== 'string' || !data.title.trim()) {
    return { success: false, error: 'Invalid task title' };
  }

  if (!data.boardId) {
    return { success: false, error: 'Board ID is required' };
  }

  if (!data.projectId) {
    return { success: false, error: 'Project ID is required' };
  }

  return { success: true };
}
