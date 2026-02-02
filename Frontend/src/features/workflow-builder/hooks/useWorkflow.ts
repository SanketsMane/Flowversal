/**
 * useWorkflow Hook - Main Workflow Operations
 * Phase 1 Refactor
 * 
 * High-level hook that provides workflow operations
 */

import { useWorkflowStore } from '../stores/workflowStore';
import { useUIStore } from '../stores/uiStore';
import { TriggerRegistry, NodeRegistry, ToolRegistry } from '../registries';
import { Trigger, WorkflowNode, AddedTool } from '../types';

export function useWorkflow() {
  const workflowStore = useWorkflowStore();
  const { showNotification } = useUIStore();

  /**
   * Add a trigger from template
   */
  const addTriggerFromTemplate = (triggerType: string) => {
    const trigger = TriggerRegistry.createInstance(triggerType);
    
    if (!trigger) {
      showNotification(`Unknown trigger type: ${triggerType}`, 'error');
      return null;
    }

    workflowStore.addTrigger(trigger);
    showNotification(`Added ${trigger.label}`, 'success');
    
    console.log('🔍 Trigger added:', { triggerType, trigger });
    
    // Auto-create Form node when Form Submit trigger is added
    if (triggerType === 'form_submit') {
      console.log('🎯 Form Submit trigger detected! Creating Form node...');
      
      // Check if there's already a Form node in the first container
      const firstContainer = workflowStore.containers[0];
      const hasFormNode = firstContainer?.nodes.some(node => node.type === 'form');
      
      console.log('📦 First container check:', { 
        firstContainer: firstContainer?.id, 
        hasFormNode,
        nodesCount: firstContainer?.nodes.length 
      });
      
      if (!hasFormNode) {
        // Create Form node
        const formNode = NodeRegistry.createInstance('form');
        console.log('✨ Created Form node:', formNode);
        
        if (formNode) {
          // If there's no first container, create one
          if (!firstContainer) {
            console.log('🆕 Creating new Step 1 container with Form node');
            const containerId = `container-${Date.now()}`;
            workflowStore.addContainer({
              id: containerId,
              type: 'container',
              title: 'Step 1',
              subtitle: 'Add nodes to this step',
              elements: [],
              nodes: [formNode],
              isFormContainer: true,
            });
            showNotification('Form node added to new Step 1', 'success');
          } else {
            // Add Form node at the beginning of the first container
            console.log('➕ Adding Form node to existing Step 1 at index 0');
            workflowStore.addNode(firstContainer.id, formNode, 0); // Add at index 0 (top)
            showNotification('Form node added to Step 1', 'success');
          }
        } else {
          console.error('❌ Failed to create Form node');
        }
      } else {
        console.log('ℹ️ Form node already exists in Step 1');
      }
    }
    
    return trigger;
  };

  /**
   * Add a node from template
   */
  const addNodeFromTemplate = (containerId: string, nodeType: string) => {
    const node = NodeRegistry.createInstance(nodeType);
    
    if (!node) {
      showNotification(`Unknown node type: ${nodeType}`, 'error');
      return null;
    }

    workflowStore.addNode(containerId, node);
    showNotification(`Added ${node.label}`, 'success');
    return node;
  };

  /**
   * Add a tool from template
   */
  const addToolFromTemplate = (containerId: string, nodeId: string, toolType: string) => {
    const tool = ToolRegistry.createInstance(toolType);
    
    if (!tool) {
      showNotification(`Unknown tool type: ${toolType}`, 'error');
      return null;
    }

    workflowStore.addTool(containerId, nodeId, tool);
    showNotification(`Added ${tool.label}`, 'success');
    return tool;
  };

  /**
   * Validate workflow
   */
  const validateWorkflow = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check if workflow has at least one trigger
    if (workflowStore.triggers.length === 0) {
      errors.push('Workflow must have at least one trigger');
    }

    // Check if workflow has at least one container with nodes
    const hasNodes = workflowStore.containers.some(c => c.nodes.length > 0);
    if (!hasNodes) {
      errors.push('Workflow must have at least one node');
    }

    // Validate each trigger
    workflowStore.triggers.forEach((trigger, index) => {
      const definition = TriggerRegistry.get(trigger.type);
      if (definition?.validate) {
        const result = definition.validate(trigger.config);
        if (result !== true) {
          errors.push(`Trigger ${index + 1}: ${result}`);
        }
      }
    });

    // Validate each node
    workflowStore.containers.forEach((container, containerIndex) => {
      container.nodes.forEach((node, nodeIndex) => {
        const definition = NodeRegistry.get(node.type);
        if (definition?.validate) {
          const result = definition.validate(node.config);
          if (result !== true) {
            errors.push(`Container ${containerIndex + 1}, Node ${nodeIndex + 1}: ${result}`);
          }
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors
    };
  };

  /**
   * Export workflow as JSON
   */
  const exportWorkflow = () => {
    return {
      name: workflowStore.workflowName,
      description: workflowStore.workflowDescription,
      triggers: workflowStore.triggers,
      triggerLogic: workflowStore.triggerLogic,
      containers: workflowStore.containers,
      formFields: workflowStore.formFields,
      exportedAt: new Date().toISOString(),
    };
  };

  /**
   * Import workflow from JSON
   */
  const importWorkflow = (data: any) => {
    try {
      workflowStore.loadWorkflow({
        workflowName: data.name || 'Imported Workflow',
        workflowDescription: data.description || '',
        triggers: data.triggers || [],
        triggerLogic: data.triggerLogic || [],
        containers: data.containers || [],
        formFields: data.formFields || [],
      });
      showNotification('Workflow imported successfully', 'success');
      return true;
    } catch (error) {
      showNotification('Failed to import workflow', 'error');
      return false;
    }
  };

  return {
    // Store state
    ...workflowStore,
    
    // Custom operations
    addTriggerFromTemplate,
    addNodeFromTemplate,
    addToolFromTemplate,
    validateWorkflow,
    exportWorkflow,
    importWorkflow,
  };
}