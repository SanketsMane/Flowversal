/**
 * UNIFIED WORKFLOW MANAGER
 * 
 * This is the SINGLE SOURCE OF TRUTH for ALL workflow operations:
 * - Export workflows (with ALL data: steps, substeps, connections, triggers, etc.)
 * - Import workflows (parse JSON)
 * - Load workflows into stores (workflowStore, connectionStore, subStepStore)
 * 
 * USE THIS FROM ALL COMPONENTS THAT NEED IMPORT/EXPORT!
 * 
 * Entry Points:
 * 1. Templates Dropdown → Import JSON → Uses this
 * 2. Templates Dropdown → Browse Templates → Import → Uses this
 * 3. Dashboard → Workflow Templates → Import → Uses this
 * 4. My Workflow → Start from Templates → Import → Uses this
 * 
 * IMPORTANT: This ensures ALL import paths work identically!
 */

import { useWorkflowStore } from '../stores/workflowStore';
import { useConnectionStore } from '@/features/workflow-builder/stores/connectionStore';
import { useSubStepStore, SubStepContainer } from '@/features/workflow-builder/stores/subStepStore';
import { useUIStore } from '../stores/uiStore';
import { NodeRegistry } from '../registries/nodeRegistry';
import { TriggerRegistry } from '../registries/triggerRegistry';

/**
 * EXPORT: Complete workflow data including everything
 * Returns JSON-serializable object
 */
export const exportWorkflowData = () => {
  try {
    console.log('📤 [UNIFIED EXPORT] Starting complete workflow export...');
    
    // Get state from all stores
    const workflowState = useWorkflowStore.getState();
    const connectionState = useConnectionStore.getState();
    const subStepState = useSubStepStore.getState();
    
    // Serialize nodes (remove icon functions, keep all data)
    const serializeNodes = (nodes: any[]) => {
      return nodes.map(node => {
        const { icon, ...nodeData } = node; // Remove icon function
        return {
          ...nodeData,
          config: node.config || {},
          branches: node.branches || undefined,
          routes: node.routes || undefined,
          enabled: node.enabled !== undefined ? node.enabled : true,
        };
      });
    };
    
    // Serialize triggers (remove icons, keep nodes inside)
    const serializeTriggers = (triggers: any[]) => {
      return triggers.map(trigger => {
        const { icon, ...triggerData } = trigger;
        return {
          ...triggerData,
          config: trigger.config || {},
          enabled: trigger.enabled !== undefined ? trigger.enabled : true,
          nodes: trigger.nodes ? serializeNodes(trigger.nodes) : undefined,
        };
      });
    };
    
    // Serialize containers (main workflow steps)
    const serializeContainers = (containers: any[]) => {
      return containers.map(container => ({
        ...container,
        nodes: serializeNodes(container.nodes || []),
      }));
    };
    
    // Serialize substeps
    const serializeSubSteps = (subSteps: SubStepContainer[]) => {
      return subSteps.map(subStep => ({
        ...subStep,
        nodes: serializeNodes(subStep.nodes || []),
      }));
    };
    
    // Build complete export data
    const exportData = {
      // Version for future compatibility
      version: '1.0',
      
      // Workflow metadata
      name: workflowState.workflowName || 'Untitled Workflow',
      description: workflowState.workflowDescription || '',
      metadata: workflowState.workflowMetadata || {},
      
      // Core workflow components
      triggers: serializeTriggers(workflowState.triggers || []),
      triggerLogic: workflowState.triggerLogic || [],
      containers: serializeContainers(workflowState.containers || []),
      formFields: workflowState.formFields || [],
      
      // CRITICAL: SubSteps (side containers attached to nodes)
      subSteps: serializeSubSteps(subStepState.subStepContainers || []),
      
      // CRITICAL: Connections between all elements
      connections: connectionState.connections || [],
      
      // Export timestamp
      exportedAt: new Date().toISOString(),
    };
    
    console.log('✅ [UNIFIED EXPORT] Export data prepared:', {
      name: exportData.name,
      triggers: exportData.triggers.length,
      containers: exportData.containers.length,
      subSteps: exportData.subSteps.length,
      connections: exportData.connections.length,
      formFields: exportData.formFields.length,
    });
    
    return exportData;
  } catch (error) {
    console.error('❌ [UNIFIED EXPORT] Error exporting workflow:', error);
    throw error;
  }
};

/**
 * EXPORT: Download workflow as JSON file
 */
export const exportWorkflowAsJSON = (options?: { filename?: string }) => {
  try {
    console.log('📥 [UNIFIED EXPORT] Starting JSON file download...');
    
    const exportData = exportWorkflowData();
    
    // Create blob and download
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
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
    
    const { showNotification } = useUIStore.getState();
    showNotification(`Workflow "${exportData.name}" exported successfully!`, 'success');
    
    console.log('✅ [UNIFIED EXPORT] File downloaded:', filename);
    
    return { success: true, data: exportData };
  } catch (error) {
    console.error('❌ [UNIFIED EXPORT] Error downloading file:', error);
    const { showNotification } = useUIStore.getState();
    showNotification(`Error exporting workflow: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    return { success: false, error };
  }
};

/**
 * IMPORT: Parse workflow JSON from file
 * Returns parsed workflow data (does not load into stores yet)
 */
export const parseWorkflowFile = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    console.log('📁 [UNIFIED IMPORT] Reading file:', file.name);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const jsonData = JSON.parse(text);
        
        console.log('📋 [UNIFIED IMPORT] JSON parsed successfully');
        console.log('📊 [UNIFIED IMPORT] Data structure:', {
          hasContainers: !!jsonData.containers,
          containerCount: jsonData.containers?.length || 0,
          hasTriggers: !!jsonData.triggers,
          triggerCount: jsonData.triggers?.length || 0,
          hasSubSteps: !!jsonData.subSteps,
          subStepCount: jsonData.subSteps?.length || 0,
          hasConnections: !!jsonData.connections,
          connectionCount: jsonData.connections?.length || 0,
          hasWorkflowData: !!jsonData.workflowData,
        });
        
        // Normalize the data structure
        let workflowData;
        
        if (jsonData.workflowData) {
          // Template format (has workflowData wrapper)
          console.log('📦 [UNIFIED IMPORT] Detected template format');
          workflowData = {
            name: jsonData.name || jsonData.workflowData.workflowName || 'Imported Workflow',
            description: jsonData.description || jsonData.workflowData.workflowDescription || '',
            metadata: jsonData.metadata || jsonData.workflowData.workflowMetadata || {},
            triggers: jsonData.workflowData.triggers || [],
            triggerLogic: jsonData.workflowData.triggerLogic || [],
            containers: jsonData.workflowData.containers || [],
            formFields: jsonData.workflowData.formFields || [],
            subSteps: jsonData.workflowData.subSteps || jsonData.subSteps || [],
            connections: jsonData.workflowData.connections || jsonData.connections || [],
          };
        } else {
          // Direct export format
          console.log('📦 [UNIFIED IMPORT] Detected direct export format');
          workflowData = {
            name: jsonData.name || jsonData.workflowName || 'Imported Workflow',
            description: jsonData.description || jsonData.workflowDescription || '',
            metadata: jsonData.metadata || jsonData.workflowMetadata || {},
            triggers: jsonData.triggers || [],
            triggerLogic: jsonData.triggerLogic || [],
            containers: jsonData.containers || [],
            formFields: jsonData.formFields || [],
            subSteps: jsonData.subSteps || [],
            connections: jsonData.connections || [],
          };
        }
        
        console.log('✅ [UNIFIED IMPORT] Workflow data normalized:', {
          name: workflowData.name,
          containers: workflowData.containers.length,
          triggers: workflowData.triggers.length,
          subSteps: workflowData.subSteps.length,
          connections: workflowData.connections.length,
          formFields: workflowData.formFields.length,
        });
        
        resolve(workflowData);
      } catch (error) {
        console.error('❌ [UNIFIED IMPORT] Error parsing JSON:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      const error = new Error('Error reading file');
      console.error('❌ [UNIFIED IMPORT]', error);
      reject(error);
    };
    
    reader.readAsText(file);
  });
};

/**
 * LOAD: Load workflow data into all stores
 * This is the CRITICAL function that updates all stores
 */
export const loadWorkflowIntoStores = (workflowData: any) => {
  try {
    console.log('🔄 [UNIFIED LOAD] Loading workflow into ALL stores...');
    console.log('📊 [UNIFIED LOAD] Data to load:', {
      name: workflowData.name,
      containers: workflowData.containers?.length || 0,
      triggers: workflowData.triggers?.length || 0,
      subSteps: workflowData.subSteps?.length || 0,
      connections: workflowData.connections?.length || 0,
    });
    
    // Step 1: Restore icons from registries
    console.log('🎨 [UNIFIED LOAD] Step 1: Restoring icons...');
    
    // Restore icons for containers and nodes
    if (workflowData.containers && Array.isArray(workflowData.containers)) {
      workflowData.containers = workflowData.containers.map((container: any) => ({
        ...container,
        nodes: (container.nodes || []).map((node: any) => {
          const definition = NodeRegistry.get(node.type);
          if (!definition) {
            console.warn(`⚠️ Node type "${node.type}" not found in registry`);
          }
          return {
            ...node,
            icon: definition?.icon,
          };
        }),
      }));
    }
    
    // Restore icons for triggers
    if (workflowData.triggers && Array.isArray(workflowData.triggers)) {
      workflowData.triggers = workflowData.triggers.map((trigger: any) => {
        const definition = TriggerRegistry.get(trigger.type);
        if (!definition) {
          console.warn(`⚠️ Trigger type "${trigger.type}" not found in registry`);
        }
        
        // Also restore icons for nodes inside triggers
        if (trigger.nodes && Array.isArray(trigger.nodes)) {
          trigger.nodes = trigger.nodes.map((node: any) => {
            const nodeDefinition = NodeRegistry.get(node.type);
            return {
              ...node,
              icon: nodeDefinition?.icon,
            };
          });
        }
        
        return {
          ...trigger,
          icon: definition?.icon,
        };
      });
    }
    
    // Restore icons for substeps
    if (workflowData.subSteps && Array.isArray(workflowData.subSteps)) {
      workflowData.subSteps = workflowData.subSteps.map((subStep: any) => ({
        ...subStep,
        nodes: (subStep.nodes || []).map((node: any) => {
          const definition = NodeRegistry.get(node.type);
          if (!definition) {
            console.warn(`⚠️ Node type "${node.type}" not found in registry (substep)`);
          }
          return {
            ...node,
            icon: definition?.icon,
          };
        }),
      }));
    }
    
    console.log('✅ [UNIFIED LOAD] Icons restored');
    
    // Step 2: Load into workflowStore
    console.log('📦 [UNIFIED LOAD] Step 2: Loading into workflowStore...');
    const workflowStore = useWorkflowStore.getState();
    workflowStore.loadWorkflow(workflowData);
    console.log('✅ [UNIFIED LOAD] workflowStore updated');
    
    // Step 3: Load connections into connectionStore
    console.log('📌 [UNIFIED LOAD] Step 3: Loading connections...');
    if (workflowData.connections && Array.isArray(workflowData.connections)) {
      const connectionStore = useConnectionStore.getState();
      
      // Clear existing connections
      connectionStore.clearConnections();
      
      // Add each connection
      workflowData.connections.forEach((conn: any) => {
        console.log(`  → Connection: ${conn.sourceType}(${conn.sourceId}) → ${conn.targetType}(${conn.targetId})`);
        connectionStore.addConnection({
          sourceId: conn.sourceId,
          sourceType: conn.sourceType,
          targetId: conn.targetId,
          targetType: conn.targetType,
          connectionType: conn.connectionType || 'manual',
          side: conn.side || 'right',
          branchOutput: conn.branchOutput,
        });
      });
      
      console.log(`✅ [UNIFIED LOAD] ${workflowData.connections.length} connections loaded`);
    } else {
      console.log('ℹ️ [UNIFIED LOAD] No connections to load');
    }
    
    // Step 4: Load substeps into subStepStore
    console.log('🔀 [UNIFIED LOAD] Step 4: Loading substeps...');
    const subStepStore = useSubStepStore.getState();
    
    // ALWAYS clear existing substeps first (even if new data has none)
    subStepStore.subStepContainers = [];
    
    if (workflowData.subSteps && Array.isArray(workflowData.subSteps) && workflowData.subSteps.length > 0) {
      // Add each substep
      workflowData.subSteps.forEach((subStep: SubStepContainer) => {
        console.log(`  → SubStep: ${subStep.name} (parent: ${subStep.parentNodeId}, ${subStep.nodes?.length || 0} nodes)`);
        subStepStore.subStepContainers.push(subStep);
      });
      
      console.log(`✅ [UNIFIED LOAD] ${workflowData.subSteps.length} substeps loaded`);
    } else {
      console.log('ℹ️ [UNIFIED LOAD] No substeps to load - cleared existing substeps');
    }
    
    // ALWAYS trigger state update (even if clearing to empty array)
    useSubStepStore.setState({ 
      subStepContainers: [...subStepStore.subStepContainers] 
    });
    
    // Step 5: Verify the load
    console.log('🔍 [UNIFIED LOAD] Step 5: Verifying...');
    setTimeout(() => {
      const currentWorkflow = useWorkflowStore.getState();
      const currentConnections = useConnectionStore.getState();
      const currentSubSteps = useSubStepStore.getState();
      
      console.log('📊 [UNIFIED LOAD] Final state:', {
        containers: currentWorkflow.containers.length,
        triggers: currentWorkflow.triggers.length,
        connections: currentConnections.connections.length,
        subSteps: currentSubSteps.subStepContainers.length,
      });
      
      // Show success notification
      const { showNotification } = useUIStore.getState();
      showNotification(
        `Workflow "${workflowData.name}" loaded successfully! ` +
        `${currentWorkflow.containers.length} steps, ` +
        `${currentSubSteps.subStepContainers.length} substeps, ` +
        `${currentConnections.connections.length} connections.`,
        'success'
      );
    }, 100);
    
    console.log('✅ [UNIFIED LOAD] Load complete!');
    
    return { success: true };
  } catch (error) {
    console.error('❌ [UNIFIED LOAD] Error loading workflow:', error);
    const { showNotification } = useUIStore.getState();
    showNotification(
      `Error loading workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'error'
    );
    return { success: false, error };
  }
};

/**
 * COMPLETE IMPORT: Parse file AND load into stores
 * This is the ONE-STOP function for importing workflows
 */
export const importAndLoadWorkflow = async (file: File) => {
  try {
    console.log('🚀 [UNIFIED IMPORT] Starting complete import process...');
    
    // Step 1: Parse the file
    const workflowData = await parseWorkflowFile(file);
    
    // Step 2: Load into stores
    const result = loadWorkflowIntoStores(workflowData);
    
    if (result.success) {
      console.log('✅ [UNIFIED IMPORT] Complete import successful!');
    }
    
    return result;
  } catch (error) {
    console.error('❌ [UNIFIED IMPORT] Error in complete import:', error);
    const { showNotification } = useUIStore.getState();
    showNotification(
      `Error importing workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'error'
    );
    return { success: false, error };
  }
};

/**
 * VALIDATION: Validate workflow data structure
 */
export const validateWorkflowData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data) {
    errors.push('Workflow data is null or undefined');
    return { valid: false, errors };
  }
  
  // Check for at least one of: containers, triggers, or workflowData
  if (!data.containers && !data.triggers && !data.workflowData) {
    errors.push('Workflow must have at least containers, triggers, or workflowData');
  }
  
  // Validate arrays if present
  if (data.containers && !Array.isArray(data.containers)) {
    errors.push('Containers must be an array');
  }
  
  if (data.triggers && !Array.isArray(data.triggers)) {
    errors.push('Triggers must be an array');
  }
  
  if (data.connections && !Array.isArray(data.connections)) {
    errors.push('Connections must be an array');
  }
  
  if (data.subSteps && !Array.isArray(data.subSteps)) {
    errors.push('SubSteps must be an array');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};
