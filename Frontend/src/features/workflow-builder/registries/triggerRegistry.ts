/**
 * Trigger Registry - Dynamic Registration System
 * Phase 1 Refactor
 * 
 * This registry allows for easy addition of new triggers without modifying core logic.
 * Simply add a new entry here and the trigger will automatically appear in the UI.
 */

import { ComponentType } from 'react';
import { TriggerTemplate, Trigger } from '../types';
import { triggerTemplates } from '../../../components/workflow-builder/triggerTemplates';

export interface TriggerDefinition extends TriggerTemplate {
  // Component to render the trigger in the canvas (optional override)
  canvasComponent?: ComponentType<any>;
  // Component to render trigger properties in the right panel (optional override)
  propertyComponent?: ComponentType<any>;
  // Validation function for trigger config
  validate?: (config: Record<string, any>) => boolean | string;
}

/**
 * Trigger Registry
 * Maps trigger types to their definitions
 */
export class TriggerRegistry {
  private static triggers = new Map<string, TriggerDefinition>();

  /**
   * Register a trigger definition
   */
  static register(type: string, definition: TriggerDefinition) {
    this.triggers.set(type, definition);
  }

  /**
   * Get a trigger definition by type
   */
  static get(type: string): TriggerDefinition | undefined {
    return this.triggers.get(type);
  }

  /**
   * Get all registered triggers
   */
  static getAll(): TriggerDefinition[] {
    return Array.from(this.triggers.values());
  }

  /**
   * Check if a trigger type is registered
   */
  static has(type: string): boolean {
    return this.triggers.has(type);
  }

  /**
   * Search triggers by query
   */
  static search(query: string): TriggerDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(trigger => 
      trigger.label.toLowerCase().includes(lowerQuery) ||
      trigger.type.toLowerCase().includes(lowerQuery) ||
      trigger.description?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get triggers by category
   */
  static getByCategory(category: string): TriggerDefinition[] {
    return this.getAll().filter(trigger => trigger.category === category);
  }

  /**
   * Create a new trigger instance from template
   */
  static createInstance(type: string, customConfig?: Record<string, any>): Trigger | null {
    const definition = this.get(type);
    if (!definition) return null;

    return {
      id: `trigger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: definition.type,
      label: definition.label,
      config: { ...definition.defaultConfig, ...customConfig },
      enabled: true,
    };
  }
}

/**
 * Initialize registry with existing trigger templates
 */
export function initializeTriggerRegistry() {
  triggerTemplates.forEach(template => {
    TriggerRegistry.register(template.type, {
      ...template,
      defaultConfig: {},
    });
  });
}

// Auto-initialize on module load
initializeTriggerRegistry();

export default TriggerRegistry;
