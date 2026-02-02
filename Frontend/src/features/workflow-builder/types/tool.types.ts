/**
 * Tool Types
 * Extracted from WorkflowBuilderV2.tsx - Phase 1 Refactor
 */

import { LucideIcon } from 'lucide-react';

export interface AddedTool {
  type: string;
  label: string;
  config: Record<string, any>;
  enabled?: boolean;
}

export interface ToolTemplate {
  type: string;
  label: string;
  icon: LucideIcon;
  category?: string;
  description?: string;
  defaultConfig?: Record<string, any>;
  tags?: string[];
}
