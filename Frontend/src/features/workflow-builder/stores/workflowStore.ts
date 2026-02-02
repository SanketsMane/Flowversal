/**
 * Workflow Store - Main State Management
 * Phase 1 Refactor
 * 
 * Zustand store for managing workflow state
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  Trigger, 
  Container, 
  WorkflowNode, 
  AddedTool, 
  ConditionalNode,
  TriggerLogic,
  FormField 
} from '../types';
import { NodeRegistry } from '../registries/nodeRegistry';
import { TriggerRegistry } from '../registries/triggerRegistry';
import { useUIStore } from './uiStore';

interface WorkflowMetadata {
  icon?: string;
  coverImage?: string;
  categoryIds?: string[]; // Changed from categories to categoryIds
  difficulty?: 'all' | 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  useCases?: string[];
}

interface WorkflowState {
  // Workflow Meta
  workflowName: string;
  workflowDescription: string;
  workflowMetadata?: WorkflowMetadata;
  
  // Core Data
  triggers: Trigger[];
  triggerLogic: TriggerLogic[];
  containers: Container[];
  formFields: FormField[];
  
  // Clipboard
  clipboard: WorkflowNode | null;
  
  // History for undo/redo
  history: Array<{
    triggers: Trigger[];
    triggerLogic: TriggerLogic[];
    containers: Container[];
    formFields: FormField[];
    workflowName: string;
  }>;
  historyIndex: number;
  
  // Actions - Triggers
  setWorkflowName: (name: string) => void;
  setWorkflowDescription: (description: string) => void;
  updateWorkflowMetadata: (metadata: Partial<WorkflowMetadata>) => void;
  addTrigger: (trigger: Trigger) => void;
  updateTrigger: (id: string, updates: Partial<Trigger>) => void;
  deleteTrigger: (id: string) => void;
  toggleTrigger: (id: string) => void;
  moveTrigger: (fromIndex: number, toIndex: number) => void;
  setTriggerLogic: (logic: TriggerLogic[]) => void;
  
  // Actions - Trigger Nodes (adding nodes to triggers)
  addNodeToTrigger: (triggerId: string, node: WorkflowNode, index?: number) => void;
  updateTriggerNode: (triggerId: string, nodeId: string, updates: Partial<WorkflowNode>) => void;
  deleteTriggerNode: (triggerId: string, nodeId: string) => void;
  toggleTriggerNode: (triggerId: string, nodeId: string) => void;
  moveTriggerNode: (triggerId: string, fromIndex: number, toIndex: number) => void;
  
  // Actions - Containers
  addContainer: (container: Container) => void;
  insertContainerAt: (container: Container, index: number) => void;
  updateContainer: (id: string, updates: Partial<Container>) => void;
  deleteContainer: (id: string) => void;
  
  // Actions - Nodes
  addNode: (containerId: string, node: WorkflowNode, index?: number) => void;
  updateNode: (containerId: string, nodeId: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (containerId: string, nodeId: string) => void;
  toggleNode: (containerId: string, nodeId: string) => void;
  moveNode: (containerId: string, fromIndex: number, toIndex: number) => void;
  
  // Actions - Branch Nodes (for If/Switch nodes)
  addNodeToBranch: (containerId: string, nodeId: string, branchId: string, node: WorkflowNode) => void;
  deleteNodeFromBranch: (containerId: string, nodeId: string, branchId: string, branchNodeId: string) => void;
  
  // Actions - Tools (for Prompt Builder nodes)
  addTool: (containerId: string, nodeId: string, tool: AddedTool) => void;
  updateTool: (containerId: string, nodeId: string, toolIndex: number, updates: Partial<AddedTool>) => void;
  deleteTool: (containerId: string, nodeId: string, toolIndex: number) => void;
  toggleTool: (containerId: string, nodeId: string, toolIndex: number) => void;
  moveTool: (containerId: string, nodeId: string, fromIndex: number, toIndex: number) => void;
  
  // Actions - Conditional Nodes
  addConditionalNode: (containerId: string, nodeId: string, branch: 'true' | 'false', conditionalNode: ConditionalNode) => void;
  updateConditionalNode: (containerId: string, nodeId: string, branch: 'true' | 'false', conditionalNodeIndex: number, updates: Partial<ConditionalNode>) => void;
  deleteConditionalNode: (containerId: string, nodeId: string, branch: 'true' | 'false', conditionalNodeIndex: number) => void;
  toggleConditionalNode: (containerId: string, nodeId: string, branch: 'true' | 'false', conditionalNodeIndex: number) => void;
  
  // Actions - Form Fields
  addFormField: (field: FormField) => void;
  updateFormField: (id: string, updates: Partial<FormField>) => void;
  deleteFormField: (id: string) => void;
  setFormFields: (fields: FormField[]) => void;
  
  // Clipboard Actions
  setClipboard: (node: WorkflowNode | null) => void;
  
  // History Actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Utility Actions
  reset: () => void;
  loadWorkflow: (data: Partial<WorkflowState>) => void;
}

const initialState = {
  workflowName: 'New Workflow',
  workflowDescription: '',
  workflowMetadata: undefined,
  triggers: [],
  triggerLogic: [],
  containers: [
    {
      id: `container-${Date.now()}`,
      type: 'container' as const,
      title: 'Step 1',
      subtitle: 'Add nodes to this step',
      elements: [],
      nodes: [],
    }
  ],
  formFields: [],
  clipboard: null,
  history: [],
  historyIndex: -1,
};

// Storage version for migrations
const STORAGE_VERSION = 2;

// TEMPORARY: Disable localStorage persistence to prevent freezing with large templates
// We'll use memory-only storage for now
export const useWorkflowStore = create<WorkflowState>()(
  devtools(
    (set, get) => {
      // Helper function to save current state to history before making changes
      const saveToHistory = () => {
        const state = get();
        const snapshot = {
          triggers: JSON.parse(JSON.stringify(state.triggers)),
          triggerLogic: JSON.parse(JSON.stringify(state.triggerLogic)),
          containers: JSON.parse(JSON.stringify(state.containers)),
          formFields: JSON.parse(JSON.stringify(state.formFields)),
          workflowName: state.workflowName,
        };
        
        // If we're not at the end of history, truncate future history
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(snapshot);
        
        // Limit history to 50 entries to prevent memory issues
        if (newHistory.length > 50) {
          newHistory.shift();
        }
        
        return {
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      };
      
      return {
      ...initialState,

      // Workflow Meta
      setWorkflowName: (name) => {
        set({ ...saveToHistory(), workflowName: name });
      },

      setWorkflowDescription: (description) => {
        set({ ...saveToHistory(), workflowDescription: description });
      },

      updateWorkflowMetadata: (metadata) => {
        set({ ...saveToHistory(), workflowMetadata: { ...get().workflowMetadata, ...metadata } });
      },

      // Trigger Actions
      addTrigger: (trigger) => set((state) => ({
        ...saveToHistory(),
        triggers: [...state.triggers, trigger]
      })),

      updateTrigger: (id, updates) => set((state) => ({
        ...saveToHistory(),
        triggers: state.triggers.map(t => 
          t.id === id ? { ...t, ...updates } : t
        )
      })),

      deleteTrigger: (id) => set((state) => ({
        ...saveToHistory(),
        triggers: state.triggers.filter(t => t.id !== id)
      })),

      toggleTrigger: (id) => set((state) => ({
        ...saveToHistory(),
        triggers: state.triggers.map(t =>
          t.id === id ? { ...t, enabled: !t.enabled } : t
        )
      })),

      moveTrigger: (fromIndex, toIndex) => set((state) => {
        const newTriggers = [...state.triggers];
        const [removed] = newTriggers.splice(fromIndex, 1);
        newTriggers.splice(toIndex, 0, removed);
        return { ...saveToHistory(), triggers: newTriggers };
      }),

      setTriggerLogic: (logic) => set({ ...saveToHistory(), triggerLogic: logic }),

      // Trigger Node Actions
      addNodeToTrigger: (triggerId, node, index) => set((state) => {
        return {
          ...saveToHistory(),
          triggers: state.triggers.map(t =>
            t.id === triggerId
              ? { 
                  ...t, 
                  nodes: index !== undefined 
                    ? [...(t.nodes || []).slice(0, index), node, ...(t.nodes || []).slice(index)] 
                    : [...(t.nodes || []), node] 
                }
              : t
          )
        };
      }),

      updateTriggerNode: (triggerId, nodeId, updates) => set((state) => (({
        ...saveToHistory(),
        triggers: state.triggers.map(t =>
          t.id === triggerId
            ? {
                ...t,
                nodes: (t.nodes || []).map(n =>
                  n.id === nodeId ? { ...n, ...updates } : n
                )
              }
            : t
        )
      }))),

      deleteTriggerNode: (triggerId, nodeId) => set((state) => (({
        ...saveToHistory(),
        triggers: state.triggers.map(t =>
          t.id === triggerId
            ? { ...t, nodes: (t.nodes || []).filter(n => n.id !== nodeId) }
            : t
        )
      }))),

      toggleTriggerNode: (triggerId, nodeId) => set((state) => (({
        ...saveToHistory(),
        triggers: state.triggers.map(t =>
          t.id === triggerId
            ? {
                ...t,
                nodes: (t.nodes || []).map(n =>
                  n.id === nodeId ? { ...n, enabled: !(n.enabled !== false) } : n
                )
              }
            : t
        )
      }))),

      moveTriggerNode: (triggerId, fromIndex, toIndex) => set((state) => (({
        ...saveToHistory(),
        triggers: state.triggers.map(t => {
          if (t.id === triggerId) {
            const newNodes = [...(t.nodes || [])];
            const [removed] = newNodes.splice(fromIndex, 1);
            newNodes.splice(toIndex, 0, removed);
            return { ...t, nodes: newNodes };
          }
          return t;
        })
      }))),

      // Container Actions
      addContainer: (container) => set((state) => ({
        ...saveToHistory(),
        containers: [...state.containers, container]
      })),

      insertContainerAt: (container, index) => set((state) => {
        const newContainers = [...state.containers];
        newContainers.splice(index, 0, container);
        return { ...saveToHistory(), containers: newContainers };
      }),

      updateContainer: (id, updates) => set((state) => ({
        ...saveToHistory(),
        containers: state.containers.map(c =>
          c.id === id ? { ...c, ...updates } : c
        )
      })),

      deleteContainer: (id) => set((state) => ({
        ...saveToHistory(),
        containers: state.containers.filter(c => c.id !== id)
      })),

      // Node Actions
      addNode: (containerId, node, index) => set((state) => {
        // Check if trying to add a form node
        if (node.type === 'form') {
          const container = state.containers.find(c => c.id === containerId);
          const hasFormNode = container?.nodes.some(n => n.type === 'form');
          
          if (hasFormNode) {
            // Show error - cannot add multiple form nodes
            // We'll trigger this through the UI store notification
            const uiStore = useUIStore.getState();
            uiStore.showNotification(
              'Two forms cannot be added into a single workflow step. Add new step to add the form.',
              'error'
            );
            return state; // Don't add the node
          }
        }

        return {
          ...saveToHistory(),
          containers: state.containers.map(c =>
            c.id === containerId
              ? { ...c, nodes: index !== undefined ? [...c.nodes.slice(0, index), node, ...c.nodes.slice(index)] : [...c.nodes, node] }
              : c
          )
        };
      }),

      updateNode: (containerId, nodeId, updates) => set((state) => ({
        ...saveToHistory(),
        containers: state.containers.map(c =>
          c.id === containerId
            ? {
                ...c,
                nodes: c.nodes.map(n =>
                  n.id === nodeId ? { ...n, ...updates } : n
                )
              }
            : c
        )
      })),

      deleteNode: (containerId, nodeId) => set((state) => ({
        ...saveToHistory(),
        containers: state.containers.map(c =>
          c.id === containerId
            ? { ...c, nodes: c.nodes.filter(n => n.id !== nodeId) }
            : c
        )
      })),

      toggleNode: (containerId, nodeId) => set((state) => ({
        ...saveToHistory(),
        containers: state.containers.map(c =>
          c.id === containerId
            ? {
                ...c,
                nodes: c.nodes.map(n =>
                  n.id === nodeId ? { ...n, enabled: !(n.enabled !== false) } : n
                )
              }
            : c
        )
      })),

      moveNode: (containerId, fromIndex, toIndex) => set((state) => ({
        ...saveToHistory(),
        containers: state.containers.map(c => {
          if (c.id === containerId) {
            const newNodes = [...c.nodes];
            const [removed] = newNodes.splice(fromIndex, 1);
            newNodes.splice(toIndex, 0, removed);
            return { ...c, nodes: newNodes };
          }
          return c;
        })
      })),

      // Branch Node Actions
      addNodeToBranch: (containerId, nodeId, branchId, node) => set((state) => ({
        ...saveToHistory(),
        containers: state.containers.map(c =>
          c.id === containerId
            ? {
                ...c,
                nodes: c.nodes.map(n =>
                  n.id === nodeId && n.branches
                    ? {
                        ...n,
                        branches: n.branches.map(branch =>
                          branch.id === branchId
                            ? { ...branch, nodes: [...branch.nodes, node] }
                            : branch
                        )
                      }
                    : n
                )
              }
            : c
        )
      })),

      deleteNodeFromBranch: (containerId, nodeId, branchId, branchNodeId) => set((state) => ({
        ...saveToHistory(),
        containers: state.containers.map(c =>
          c.id === containerId
            ? {
                ...c,
                nodes: c.nodes.map(n =>
                  n.id === nodeId && n.branches
                    ? {
                        ...n,
                        branches: n.branches.map(branch =>
                          branch.id === branchId
                            ? { ...branch, nodes: branch.nodes.filter(bn => bn.id !== branchNodeId) }
                            : branch
                        )
                      }
                    : n
                )
              }
            : c
        )
      })),


      // Tool Actions
      addTool: (containerId, nodeId, tool) => set((state) => ({
        ...saveToHistory(),
        containers: state.containers.map(c =>
          c.id === containerId
            ? {
                ...c,
                nodes: c.nodes.map(n =>
                  n.id === nodeId
                    ? {
                        ...n,
                        config: {
                          ...n.config,
                          tools: [...(n.config.tools || []), tool]
                        }
                      }
                    : n
                )
              }
            : c
        )
      })),

      updateTool: (containerId, nodeId, toolIndex, updates) => set((state) => ({
        ...saveToHistory(),
        containers: state.containers.map(c =>
          c.id === containerId
            ? {
                ...c,
                nodes: c.nodes.map(n =>
                  n.id === nodeId
                    ? {
                        ...n,
                        config: {
                          ...n.config,
                          tools: (n.config.tools || []).map((t: AddedTool, idx: number) =>
                            idx === toolIndex ? { ...t, ...updates } : t
                          )
                        }
                      }
                    : n
                )
              }
            : c
        )
      })),

      deleteTool: (containerId, nodeId, toolIndex) => set((state) => ({
        ...saveToHistory(),
        containers: state.containers.map(c =>
          c.id === containerId
            ? {
                ...c,
                nodes: c.nodes.map(n =>
                  n.id === nodeId
                    ? {
                        ...n,
                        config: {
                          ...n.config,
                          tools: (n.config.tools || []).filter((_: any, idx: number) => idx !== toolIndex)
                        }
                      }
                    : n
                )
              }
            : c
        )
      })),

      toggleTool: (containerId, nodeId, toolIndex) => set((state) => ({
        ...saveToHistory(),
        containers: state.containers.map(c =>
          c.id === containerId
            ? {
                ...c,
                nodes: c.nodes.map(n =>
                  n.id === nodeId
                    ? {
                        ...n,
                        config: {
                          ...n.config,
                          tools: (n.config.tools || []).map((t: AddedTool, idx: number) =>
                            idx === toolIndex ? { ...t, enabled: !t.enabled } : t
                          )
                        }
                      }
                    : n
                )
              }
            : c
        )
      })),

      moveTool: (containerId, nodeId, fromIndex, toIndex) => set((state) => ({
        ...saveToHistory(),
        containers: state.containers.map(c =>
          c.id === containerId
            ? {
                ...c,
                nodes: c.nodes.map(n => {
                  if (n.id === nodeId) {
                    const newTools = [...(n.config.tools || [])];
                    const [removed] = newTools.splice(fromIndex, 1);
                    newTools.splice(toIndex, 0, removed);
                    return {
                      ...n,
                      config: { ...n.config, tools: newTools }
                    };
                  }
                  return n;
                })
              }
            : c
        )
      })),

      // Conditional Node Actions
      addConditionalNode: (containerId, nodeId, branch, conditionalNode) => set((state) => ({
        ...saveToHistory(),
        containers: state.containers.map(c =>
          c.id === containerId
            ? {
                ...c,
                nodes: c.nodes.map(n =>
                  n.id === nodeId
                    ? {
                        ...n,
                        config: {
                          ...n.config,
                          [`${branch}Nodes`]: [...(n.config[`${branch}Nodes`] || []), conditionalNode]
                        }
                      }
                    : n
                )
              }
            : c
        )
      })),

      updateConditionalNode: (containerId, nodeId, branch, conditionalNodeIndex, updates) => set((state) => ({
        ...saveToHistory(),
        containers: state.containers.map(c =>
          c.id === containerId
            ? {
                ...c,
                nodes: c.nodes.map(n =>
                  n.id === nodeId
                    ? {
                        ...n,
                        config: {
                          ...n.config,
                          [`${branch}Nodes`]: (n.config[`${branch}Nodes`] || []).map((cn: ConditionalNode, idx: number) =>
                            idx === conditionalNodeIndex ? { ...cn, ...updates } : cn
                          )
                        }
                      }
                    : n
                )
              }
            : c
        )
      })),

      deleteConditionalNode: (containerId, nodeId, branch, conditionalNodeIndex) => set((state) => ({
        ...saveToHistory(),
        containers: state.containers.map(c =>
          c.id === containerId
            ? {
                ...c,
                nodes: c.nodes.map(n =>
                  n.id === nodeId
                    ? {
                        ...n,
                        config: {
                          ...n.config,
                          [`${branch}Nodes`]: (n.config[`${branch}Nodes`] || []).filter((_: any, idx: number) => idx !== conditionalNodeIndex)
                        }
                      }
                    : n
                )
              }
            : c
        )
      })),

      toggleConditionalNode: (containerId, nodeId, branch, conditionalNodeIndex) => set((state) => ({
        ...saveToHistory(),
        containers: state.containers.map(c =>
          c.id === containerId
            ? {
                ...c,
                nodes: c.nodes.map(n =>
                  n.id === nodeId
                    ? {
                        ...n,
                        config: {
                          ...n.config,
                          [`${branch}Nodes`]: (n.config[`${branch}Nodes`] || []).map((cn: ConditionalNode, idx: number) =>
                            idx === conditionalNodeIndex ? { ...cn, enabled: !(cn.enabled !== false) } : cn
                          )
                        }
                      }
                    : n
                )
              }
            : c
        )
      })),

      // Form Field Actions
      addFormField: (field) => set((state) => ({
        ...saveToHistory(),
        formFields: [...state.formFields, field]
      })),

      updateFormField: (id, updates) => set((state) => ({
        ...saveToHistory(),
        formFields: state.formFields.map(f =>
          f.id === id ? { ...f, ...updates } : f
        )
      })),

      deleteFormField: (id) => set((state) => ({
        ...saveToHistory(),
        formFields: state.formFields.filter(f => f.id !== id)
      })),

      setFormFields: (fields) => set({ ...saveToHistory(), formFields: fields }),

      // Clipboard Actions
      setClipboard: (node) => set({ clipboard: node }),

      // History Actions
      undo: () => set((state) => {
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1;
          const historyItem = state.history[newIndex];
          return {
            ...historyItem,
            historyIndex: newIndex,
          };
        }
        return state;
      }),

      redo: () => set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          const newIndex = state.historyIndex + 1;
          const historyItem = state.history[newIndex];
          return {
            ...historyItem,
            historyIndex: newIndex,
          };
        }
        return state;
      }),

      canUndo: () => get().historyIndex > 0,

      canRedo: () => get().historyIndex < get().history.length - 1,

      // Utility Actions
      reset: () => set(initialState),

      loadWorkflow: (data) => {
        console.log('🔄 Loading workflow template...', data);
        console.log('📊 Current state before load:', {
          containers: get().containers.length,
          triggers: get().triggers.length,
        });
        
        // Process the imported data FIRST
        const processedData = { ...data };
        
        // Restore icons for containers and nodes
        if (processedData.containers && Array.isArray(processedData.containers)) {
          console.log('📦 Processing', processedData.containers.length, 'containers...');
          processedData.containers = processedData.containers.map((container: any, idx: number) => {
            console.log(`  Container ${idx + 1}:`, container.title, '- Nodes:', container.nodes?.length || 0);
            return {
              ...container,
              nodes: (container.nodes || []).map((node: any) => {
                const definition = NodeRegistry.get(node.type);
                if (!definition) {
                  console.warn(`⚠️ Node type "${node.type}" not found in registry`);
                } else {
                  console.log(`    ✓ Node: ${node.label} (${node.type})`);
                }
                return {
                  ...node,
                  icon: definition?.icon,
                };
              }),
            };
          });
        } else {
          // Ensure containers array exists
          processedData.containers = [];
        }
        
        // Restore icons for triggers
        if (processedData.triggers && Array.isArray(processedData.triggers)) {
          console.log('🎯 Processing', processedData.triggers.length, 'triggers...');
          processedData.triggers = processedData.triggers.map((trigger: any) => {
            const definition = TriggerRegistry.get(trigger.type);
            if (!definition) {
              console.warn(`⚠️ Trigger type "${trigger.type}" not found in registry`);
            }
            
            // Process nodes inside triggers
            if (trigger.nodes && Array.isArray(trigger.nodes)) {
              trigger.nodes = trigger.nodes.map((node: any) => {
                const nodeDefinition = NodeRegistry.get(node.type);
                if (!nodeDefinition) {
                  console.warn(`⚠️ Node type "${node.type}" not found in registry (inside trigger)`);
                }
                return {
                  ...node,
                  icon: nodeDefinition?.icon,
                };
              });
            }
            
            return {
              ...trigger,
              icon: definition?.icon,
            } as Trigger;
          });
        } else {
          processedData.triggers = [];
        }
        
        // Ensure triggerLogic exists
        if (!processedData.triggerLogic) {
          processedData.triggerLogic = [];
        }
        
        // Ensure formFields exists
        if (!processedData.formFields) {
          processedData.formFields = [];
        }
        
        // Load connections into connectionStore if present
        if (processedData.connections && Array.isArray(processedData.connections)) {
          console.log('📌 Loading', processedData.connections.length, 'connections...');
          
          // Use dynamic import to avoid circular dependency
          const { useConnectionStore } = require('../stores/connectionStore');
          const connectionStore = useConnectionStore.getState();
          
          // Clear existing connections first
          connectionStore.clearConnections();
          
          // Add each connection
          processedData.connections.forEach((conn: any) => {
            console.log(`  Connection: ${conn.sourceType}(${conn.sourceId}) → ${conn.targetType}(${conn.targetId})`);
            connectionStore.addConnection({
              sourceId: conn.sourceId,
              sourceType: conn.sourceType,
              targetId: conn.targetId,
              targetType: conn.targetType,
              connectionType: conn.connectionType || 'manual',
              side: conn.side || 'right',
              branchOutput: conn.branchOutput
            });
          });
          
          console.log('✅ Connections loaded successfully');
          
          // Remove connections from processedData since they're in a separate store
          delete processedData.connections;
        }
        
        // Build complete new state - MUST BE A NEW OBJECT FOR REACT TO DETECT CHANGE
        const newState = {
          // Core workflow data
          workflowName: processedData.name || processedData.workflowName || 'Imported Workflow',
          workflowDescription: processedData.description || processedData.workflowDescription || '',
          workflowMetadata: processedData.metadata || processedData.workflowMetadata || {},
          
          // Data arrays - MUST BE NEW ARRAYS
          triggers: [...(processedData.triggers || [])],
          triggerLogic: [...(processedData.triggerLogic || [])],
          containers: [...(processedData.containers || [])],
          formFields: [...(processedData.formFields || [])],
          
          // Reset history and clipboard
          clipboard: null,
          history: [],
          historyIndex: -1,
        };
        
        console.log('✅ Workflow loaded successfully:', {
          name: newState.workflowName,
          containers: newState.containers.length,
          triggers: newState.triggers.length,
          formFields: newState.formFields.length,
        });
        
        console.log('📋 Final containers to set:', newState.containers);
        
        // CRITICAL: Use a function to ensure complete state replacement
        set(() => newState);
        
        // Force a second update to ensure React detects the change
        setTimeout(() => {
          console.log('🔄 Verifying state after load...');
          const currentState = get();
          console.log('📊 Current containers:', currentState.containers.length);
          console.log('📊 Current triggers:', currentState.triggers.length);
          
          if (currentState.containers.length !== newState.containers.length) {
            console.error('❌ STATE MISMATCH! Forcing update...');
            set({ containers: [...newState.containers] });
          }
        }, 50);
      },
    }
    },
    { name: 'WorkflowStore' }
  )
);