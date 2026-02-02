/**
 * Trigger Types
 * Extracted from WorkflowBuilderV2.tsx - Phase 1 Refactor
 */

import { LucideIcon } from 'lucide-react';
import { WorkflowNode } from './node.types';

export interface Trigger {
  id: string;
  type: string;
  label: string;
  config: Record<string, any>;
  enabled?: boolean;
  nodes?: WorkflowNode[];  // Allow nodes to be added inside triggers
}

export interface TriggerTemplate {
  type: string;
  label: string;
  icon: LucideIcon;
  category?: string;
  description?: string;
  defaultConfig?: Record<string, any>;
}

export type TriggerLogic = 'OR' | 'AND';