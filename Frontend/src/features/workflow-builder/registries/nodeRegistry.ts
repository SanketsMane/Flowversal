/**
 * Node Registry - Dynamic Registration System
 * Phase 1 Refactor
 * 
 * This registry allows for easy addition of new nodes without modifying core logic.
 * Simply add a new entry here and the node will automatically appear in the UI.
 */

import { ComponentType } from 'react';
import { NodeTemplate, WorkflowNode, NodeCategory } from '../types';
import { nodeTemplates } from '../../../components/workflow-builder/nodeTemplates';
import { FormNode } from '@/shared/components/ui/nodes/FormNode';
import { FileText } from 'lucide-react';
import { aiAgentNodes } from './aiAgentNodes';

export interface NodeDefinition extends NodeTemplate {
  // Component to render the node in the canvas (optional override)
  canvasComponent?: ComponentType<any>;
  // Component to render node properties in the right panel (optional override)
  propertyComponent?: ComponentType<any>;
  // Validation function for node config
  validate?: (config: Record<string, any>) => boolean | string;
  // Whether this node supports tools (like Prompt Builder)
  supportsTools?: boolean;
  // Whether this node is conditional (like If/Switch)
  isConditional?: boolean;
}

/**
 * Node Registry
 * Maps node types to their definitions
 */
export class NodeRegistry {
  private static nodes = new Map<string, NodeDefinition>();

  /**
   * Register a node definition
   */
  static register(type: string, definition: NodeDefinition) {
    this.nodes.set(type, definition);
  }

  /**
   * Get a node definition by type
   */
  static get(type: string): NodeDefinition | undefined {
    return this.nodes.get(type);
  }

  /**
   * Get all registered nodes
   */
  static getAll(): NodeDefinition[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Check if a node type is registered
   */
  static has(type: string): boolean {
    return this.nodes.has(type);
  }

  /**
   * Search nodes by query
   */
  static search(query: string): NodeDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(node => 
      node.label.toLowerCase().includes(lowerQuery) ||
      node.type.toLowerCase().includes(lowerQuery) ||
      node.description?.toLowerCase().includes(lowerQuery) ||
      node.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get nodes by category
   */
  static getByCategory(category: NodeCategory): NodeDefinition[] {
    return this.getAll().filter(node => node.category === category);
  }

  /**
   * Get all unique categories
   */
  static getCategories(): NodeCategory[] {
    const categories = new Set<NodeCategory>();
    this.getAll().forEach(node => categories.add(node.category as NodeCategory));
    return Array.from(categories);
  }

  /**
   * Create a new node instance from template
   */
  static createInstance(type: string, customConfig?: Record<string, any>): WorkflowNode | null {
    const definition = this.get(type);
    if (!definition) return null;

    return {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: definition.type,
      label: definition.label,
      category: definition.category,
      icon: definition.icon,
      config: { ...definition.defaultConfig, ...customConfig },
      enabled: true,
    };
  }
}

/**
 * Initialize registry with existing node templates
 */
export function initializeNodeRegistry() {
  // Register standard node templates (including Form node)
  nodeTemplates.forEach(template => {
    NodeRegistry.register(template.type, {
      ...template,
      defaultConfig: template.defaultConfig || {},
      supportsTools: template.type === 'prompt_builder',
      isConditional: template.type === 'if' || template.type === 'switch',
      // Use FormNode component for 'form' type
      canvasComponent: template.type === 'form' ? FormNode : undefined,
    });
  });

  // Register AI Agent nodes
  aiAgentNodes.forEach(aiNode => {
    NodeRegistry.register(aiNode.type, aiNode);
  });
}

// Auto-initialize on module load
initializeNodeRegistry();

export default NodeRegistry;