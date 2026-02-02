/**
 * Variable Store
 * Phase 4 Part 3 - Variable System
 * 
 * Zustand store for variable management
 */

import { create } from 'zustand';
import {
  VariableDefinition,
  VariableContext,
  VariableScope,
  VariableCategory,
  VariableGroup,
} from '../types/variable.types';

interface VariableStore {
  // Available variables
  variables: VariableDefinition[];
  
  // Current context
  context: VariableContext;
  
  // Actions
  addVariable: (variable: VariableDefinition) => void;
  removeVariable: (id: string) => void;
  updateVariable: (id: string, updates: Partial<VariableDefinition>) => void;
  clearVariables: () => void;
  
  // Context management
  setContext: (context: VariableContext) => void;
  updateContext: (updates: Partial<VariableContext>) => void;
  setVariableValue: (path: string, value: any) => void;
  
  // Query functions
  getVariable: (id: string) => VariableDefinition | undefined;
  getVariablesByScope: (scope: VariableScope) => VariableDefinition[];
  getVariablesByCategory: (category: VariableCategory) => VariableDefinition[];
  getVariablesBySource: (source: string) => VariableDefinition[];
  searchVariables: (query: string) => VariableDefinition[];
  getVariableGroups: () => VariableGroup[];
  
  // Initialization
  initializeFromWorkflow: (workflowData: any) => void;
  initializeFromExecution: (executionContext: any) => void;
}

export const useVariableStore = create<VariableStore>((set, get) => ({
  // Initial state
  variables: [],
  context: {
    variables: {},
    stepOutputs: {},
    globalVariables: {},
  },

  // Add variable
  addVariable: (variable) => {
    set((state) => ({
      variables: [...state.variables, variable],
    }));
  },

  // Remove variable
  removeVariable: (id) => {
    set((state) => ({
      variables: state.variables.filter(v => v.id !== id),
    }));
  },

  // Update variable
  updateVariable: (id, updates) => {
    set((state) => ({
      variables: state.variables.map(v =>
        v.id === id ? { ...v, ...updates } : v
      ),
    }));
  },

  // Clear all variables
  clearVariables: () => {
    set({ variables: [] });
  },

  // Set entire context
  setContext: (context) => {
    set({ context });
  },

  // Update context partially
  updateContext: (updates) => {
    set((state) => ({
      context: { ...state.context, ...updates },
    }));
  },

  // Set variable value in context
  setVariableValue: (path, value) => {
    set((state) => {
      const parts = path.split('.');
      const newVariables = { ...state.context.variables };
      
      // Navigate to nested property
      let current: any = newVariables;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current)) {
          current[part] = {};
        }
        current = current[part];
      }
      
      // Set value
      current[parts[parts.length - 1]] = value;
      
      return {
        context: {
          ...state.context,
          variables: newVariables,
        },
      };
    });
  },

  // Get variable by ID
  getVariable: (id) => {
    return get().variables.find(v => v.id === id);
  },

  // Get variables by scope
  getVariablesByScope: (scope) => {
    return get().variables.filter(v => v.scope === scope);
  },

  // Get variables by category
  getVariablesByCategory: (category) => {
    return get().variables.filter(v => v.category === category);
  },

  // Get variables by source
  getVariablesBySource: (source) => {
    return get().variables.filter(v => v.source === source);
  },

  // Search variables
  searchVariables: (query) => {
    const lowerQuery = query.toLowerCase();
    return get().variables.filter(v =>
      v.name.toLowerCase().includes(lowerQuery) ||
      v.path.toLowerCase().includes(lowerQuery) ||
      v.description?.toLowerCase().includes(lowerQuery)
    );
  },

  // Get variables grouped by category
  getVariableGroups: () => {
    const variables = get().variables;
    const groups: Map<VariableCategory, VariableDefinition[]> = new Map();

    // Group by category
    for (const variable of variables) {
      const category = variable.category || 'custom';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(variable);
    }

    // Convert to array
    return Array.from(groups.entries()).map(([category, vars]) => ({
      category,
      label: getCategoryLabel(category),
      variables: vars,
    }));
  },

  // Initialize from workflow
  initializeFromWorkflow: (workflowData) => {
    const variables: VariableDefinition[] = [];

    // Add trigger variables
    if (workflowData.trigger) {
      variables.push({
        id: 'trigger',
        name: 'Trigger',
        path: 'trigger',
        type: 'object',
        scope: 'workflow',
        category: 'trigger',
        description: 'Trigger data',
        source: 'trigger',
      });
    }

    // Add form field variables
    if (workflowData.containers) {
      workflowData.containers.forEach((container: any) => {
        if (container.formElements) {
          container.formElements.forEach((field: any) => {
            variables.push({
              id: `form-${field.id}`,
              name: field.label || field.id,
              path: `form.${field.id}`,
              type: getFieldType(field.type),
              scope: 'workflow',
              category: 'form',
              description: field.description || `Form field: ${field.label}`,
              source: container.id,
            });
          });
        }
      });
    }

    set({ variables });
  },

  // Initialize from execution context
  initializeFromExecution: (executionContext) => {
    const context: VariableContext = {
      variables: executionContext.variables || {},
      stepOutputs: {},
      globalVariables: {},
    };

    // Extract step outputs
    if (executionContext.steps) {
      executionContext.steps.forEach((step: any) => {
        if (step.output) {
          context.stepOutputs[step.stepId] = step.output;
        }
      });
    }

    set({ context });

    // Generate variable definitions from context
    const variables = generateVariablesFromContext(context);
    set({ variables });
  },
}));

// Helper functions
function getCategoryLabel(category: VariableCategory): string {
  const labels: Record<VariableCategory, string> = {
    trigger: '⚡ Trigger',
    step: '📦 Steps',
    form: '📝 Form Data',
    user: '👤 User',
    system: '⚙️ System',
    custom: '🔧 Custom',
  };
  return labels[category] || category;
}

function getFieldType(fieldType: string): any {
  const typeMap: Record<string, any> = {
    text: 'string',
    textarea: 'string',
    email: 'string',
    url: 'string',
    number: 'number',
    toggle: 'boolean',
    date: 'date',
    time: 'date',
    file: 'string',
    image: 'string',
    radio: 'string',
    dropdown: 'string',
    checklist: 'array',
  };
  return typeMap[fieldType] || 'string';
}

function generateVariablesFromContext(
  context: VariableContext
): VariableDefinition[] {
  const variables: VariableDefinition[] = [];

  // Generate from stepOutputs
  Object.entries(context.stepOutputs).forEach(([stepId, output]) => {
    if (output && typeof output === 'object') {
      Object.keys(output).forEach(key => {
        variables.push({
          id: `${stepId}-${key}`,
          name: key,
          path: `${stepId}.${key}`,
          type: typeof output[key] as any,
          scope: 'workflow',
          category: 'step',
          source: stepId,
          value: output[key],
        });
      });
    }
  });

  return variables;
}

// Export hook
export function useVariables() {
  return useVariableStore();
}
