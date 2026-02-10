/**
 * Centralized Workflow Import/Export Utility
 * 
 * This is the SINGLE SOURCE OF TRUTH for all import/export operations.
 * Use this utility from ALL components that need to import or export workflows.
 * 
 * Features:
 * - ✅ Exports complete workflow data (containers, nodes, triggers, connections, formFields)
 * - ✅ Imports workflow data with validation
 * - ✅ Loads workflow into Zustand store
 * - ✅ Handles connections properly
 * - ✅ Restores icons from registries
 * - ✅ Comprehensive logging
 * - ✅ Error handling
 * - ✅ Future-proof (works with any new fields)
 */
import { useWorkflowStore } from '../stores/workflowStore';
import { useConnectionStore } from '@/core/stores/connectionStore';
import { useUIStore } from '../stores/uiStore';
import { NodeRegistry } from '../registries/nodeRegistry';
import { TriggerRegistry } from '../registries/triggerRegistry';
/**
 * Export workflow as JSON file
 * This function exports EVERYTHING including connections
 */
export const exportWorkflowAsJSON = (options?: { filename?: string }) => {
  try {
    // Get current workflow state
    const workflowState = useWorkflowStore.getState();
    const connectionState = useConnectionStore.getState();
    const { showNotification } = useUIStore.getState();
    // Build complete export data with ALL information
    const exportData = {
      // Version for future compatibility
      version: '1.0',
      // Workflow metadata
      name: workflowState.workflowName || 'Untitled Workflow',
      description: workflowState.workflowDescription || '',
      metadata: workflowState.workflowMetadata || {},
      // Core workflow components
      triggers: workflowState.triggers || [],
      triggerLogic: workflowState.triggerLogic || [],
      containers: workflowState.containers || [],
      formFields: workflowState.formFields || [],
      // CRITICAL: Include connections!
      connections: connectionState.connections || [],
      // Export timestamp
      exportedAt: new Date().toISOString(),
      // Optional: workflow ID if it exists
      workflowId: null, // Set this if you have a workflow ID
    };
    // Create blob and download
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const safeName = (exportData.name || 'workflow')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    const filename = options?.filename || `${safeName}_${timestamp}_${Date.now()}.json`;
    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification(`Workflow "${exportData.name}" exported successfully!`, 'success');
    return { success: true, data: exportData };
  } catch (error) {
    console.error('❌ Error exporting workflow:', error);
    const { showNotification } = useUIStore.getState();
    showNotification(`Error exporting workflow: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    return { success: false, error };
  }
};
/**
 * Import workflow from JSON file
 * This function reads a file and returns parsed workflow data
 */
export const importWorkflowFromFile = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const jsonData = JSON.parse(text);
        // Validate JSON structure
        if (!jsonData.containers && !jsonData.triggers && !jsonData.workflowData) {
          throw new Error('Invalid workflow file: No containers, triggers, or workflowData found');
        }
        // Handle different JSON formats
        let workflowData;
        if (jsonData.workflowData) {
          // Template format (has workflowData wrapper)
          workflowData = {
            name: jsonData.name || jsonData.workflowData.workflowName || 'Imported Workflow',
            description: jsonData.description || jsonData.workflowData.workflowDescription || '',
            metadata: jsonData.metadata || jsonData.workflowData.workflowMetadata || {},
            triggers: jsonData.workflowData.triggers || [],
            triggerLogic: jsonData.workflowData.triggerLogic || [],
            containers: jsonData.workflowData.containers || [],
            formFields: jsonData.workflowData.formFields || [],
            connections: jsonData.workflowData.connections || jsonData.connections || [],
          };
        } else {
          // Direct export format
          workflowData = {
            name: jsonData.name || jsonData.workflowName || 'Imported Workflow',
            description: jsonData.description || jsonData.workflowDescription || '',
            metadata: jsonData.metadata || jsonData.workflowMetadata || {},
            triggers: jsonData.triggers || [],
            triggerLogic: jsonData.triggerLogic || [],
            containers: jsonData.containers || [],
            formFields: jsonData.formFields || [],
            connections: jsonData.connections || [],
          };
        }
        resolve(workflowData);
      } catch (error) {
        console.error('❌ Error parsing workflow JSON:', error);
        reject(error);
      }
    };
    reader.onerror = () => {
      const error = new Error('Error reading file');
      console.error('❌', error);
      reject(error);
    };
    reader.readAsText(file);
  });
};
/**
 * Load workflow into the store
 * This function takes workflow data and loads it into Zustand stores
 * 
 * Use this after importWorkflowFromFile() to actually load the workflow
 */
export const loadWorkflowIntoStore = (workflowData: any) => {
  try {
    const workflowStore = useWorkflowStore.getState();
    const { showNotification } = useUIStore.getState();
    // Use the loadWorkflow function from the store
    // This handles all the icon restoration, connection loading, etc.
    workflowStore.loadWorkflow(workflowData);
    // Show success notification
    setTimeout(() => {
      const state = useWorkflowStore.getState();
      showNotification(
        `Workflow "${workflowData.name}" loaded successfully! ${state.containers.length} steps, ${state.triggers.length} triggers.`,
        'success'
      );
    }, 100);
    return { success: true };
  } catch (error) {
    console.error('❌ Error loading workflow into store:', error);
    const { showNotification } = useUIStore.getState();
    showNotification(
      `Error loading workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'error'
    );
    return { success: false, error };
  }
};
/**
 * Complete import workflow from file and load into store
 * This is a convenience function that does both steps
 */
export const importAndLoadWorkflow = async (file: File) => {
  try {
    // Step 1: Read and parse file
    const workflowData = await importWorkflowFromFile(file);
    // Step 2: Load into store
    const result = loadWorkflowIntoStore(workflowData);
    if (result.success) {
    }
    return result;
  } catch (error) {
    console.error('❌ Error in complete import process:', error);
    const { showNotification } = useUIStore.getState();
    showNotification(
      `Error importing workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'error'
    );
    return { success: false, error };
  }
};
/**
 * Validate workflow data structure
 * Returns true if the workflow data is valid
 */
export const validateWorkflowData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  // Check basic structure
  if (!data) {
    errors.push('Workflow data is null or undefined');
    return { valid: false, errors };
  }
  // Check for at least one of: containers or triggers
  if (!data.containers && !data.triggers && !data.workflowData) {
    errors.push('Workflow must have at least containers, triggers, or workflowData');
  }
  // Validate containers if present
  if (data.containers && !Array.isArray(data.containers)) {
    errors.push('Containers must be an array');
  }
  // Validate triggers if present
  if (data.triggers && !Array.isArray(data.triggers)) {
    errors.push('Triggers must be an array');
  }
  // Validate connections if present
  if (data.connections && !Array.isArray(data.connections)) {
    errors.push('Connections must be an array');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
};
