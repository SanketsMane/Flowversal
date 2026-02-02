/**
 * Tool Registry - Dynamic Registration System
 * Phase 1 Refactor
 * 
 * This registry allows for easy addition of new tools without modifying core logic.
 * Simply add a new entry here and the tool will automatically appear in the UI.
 */

import { ComponentType } from 'react';
import { ToolTemplate, AddedTool } from '../types';
import { toolTemplates } from '../../../components/workflow-builder/toolTemplates';

export interface ToolDefinition extends ToolTemplate {
  // Component to render the tool in the canvas (optional override)
  canvasComponent?: ComponentType<any>;
  // Component to render tool properties in the right panel (optional override)
  propertyComponent?: ComponentType<any>;
  // Validation function for tool config
  validate?: (config: Record<string, any>) => boolean | string;
}

/**
 * Tool Registry
 * Maps tool types to their definitions
 */
export class ToolRegistry {
  private static tools = new Map<string, ToolDefinition>();

  /**
   * Register a tool definition
   */
  static register(type: string, definition: ToolDefinition) {
    this.tools.set(type, definition);
  }

  /**
   * Get a tool definition by type
   */
  static get(type: string): ToolDefinition | undefined {
    return this.tools.get(type);
  }

  /**
   * Get all registered tools
   */
  static getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Check if a tool type is registered
   */
  static has(type: string): boolean {
    return this.tools.has(type);
  }

  /**
   * Search tools by query
   */
  static search(query: string): ToolDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(tool => 
      tool.label.toLowerCase().includes(lowerQuery) ||
      tool.type.toLowerCase().includes(lowerQuery) ||
      tool.description?.toLowerCase().includes(lowerQuery) ||
      tool.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get tools by category
   */
  static getByCategory(category: string): ToolDefinition[] {
    return this.getAll().filter(tool => tool.category === category);
  }

  /**
   * Get all unique categories
   */
  static getCategories(): string[] {
    const categories = new Set<string>();
    this.getAll().forEach(tool => {
      if (tool.category) categories.add(tool.category);
    });
    return Array.from(categories);
  }

  /**
   * Create a new tool instance from template
   */
  static createInstance(type: string, customConfig?: Record<string, any>): AddedTool | null {
    const definition = this.get(type);
    if (!definition) return null;

    return {
      type: definition.type,
      label: definition.label,
      config: { ...definition.defaultConfig, ...customConfig },
      enabled: true,
    };
  }
}

/**
 * Initialize registry with existing tool templates
 */
export function initializeToolRegistry() {
  toolTemplates.forEach(template => {
    ToolRegistry.register(template.type, {
      ...template,
      defaultConfig: {},
    });
  });
}

// Auto-initialize on module load
initializeToolRegistry();

export default ToolRegistry;
