/**
 * UI Store - UI State Management
 * Phase 1 Refactor
 * 
 * Manages UI-specific state like panel visibility, modals, etc.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { LeftPanelView, NotificationState } from '../types';

interface UIState {
  // Panel States
  isLeftPanelMinimized: boolean;
  isRightPanelMinimized: boolean;
  leftPanelView: LeftPanelView;
  
  // Modal States
  showPreview: boolean;
  showCloseConfirm: boolean;
  
  // Unified Node Picker Modal
  isNodePickerOpen: boolean;
  nodePickerContext: {
    source: 'floating' | 'trigger' | 'step' | 'container' | 'branch' | 'tool' | 'substep' | 'branch-substep';
    containerId?: string;
    nodeId?: string; // For branch nodes
    branchId?: string; // For adding nodes to specific branch
    insertIndex?: number; // For inserting containers at specific index
    subStepId?: string; // For adding to existing substep
    connectionContext?: { // For inserting substep between connected nodes
      connectionId: string;
      sourceId: string;
      targetId: string;
    };
  } | null;
  
  // Field Type Selector Modal
  isFieldTypeSelectorOpen: boolean;
  fieldTypeSelectorContext: {
    insertPosition: number;
  } | null;
  
  // Field Properties Modal
  isFieldPropertiesOpen: boolean;
  fieldPropertiesContext: {
    fieldId: string;
  } | null;
  
  // Form Setup Modal
  isFormSetupOpen: boolean;
  formSetupContext: {
    containerId: string;
    nodeId: string;
  } | null;
  
  // Node Setup Modal (Generic for all nodes)
  isNodeSetupOpen: boolean;
  nodeSetupContext: {
    containerId: string;
    nodeId: string;
  } | null;
  
  // Trigger Setup Modal (Generic for all triggers)
  isTriggerSetupOpen: boolean;
  triggerSetupContext: {
    triggerId: string;
  } | null;
  
  // Delete Node Confirmation
  isDeleteNodeConfirmOpen: boolean;
  deleteNodeContext: {
    containerId: string;
    nodeId: string;
    nodeName: string;
    isSubStep?: boolean; // Add flag for substep context
    subStepId?: string;  // Add substep ID for substep deletions
  } | null;
  
  // Delete Trigger Confirmation
  isDeleteTriggerConfirmOpen: boolean;
  deleteTriggerContext: {
    triggerId: string;
    triggerName: string;
  } | null;
  
  // Delete Container Confirmation
  isDeleteContainerConfirmOpen: boolean;
  deleteContainerContext: {
    containerId: string;
    containerName: string;
  } | null;
  
  // Condition Builder Modal
  isConditionBuilderOpen: boolean;
  conditionBuilderContext: {
    containerId: string;
    nodeId: string;
  } | null;
  
  // Keyboard Shortcuts Help Modal
  isKeyboardShortcutsOpen: boolean;
  
  // Edit Workflow Modal
  isEditWorkflowOpen: boolean;
  
  // Publish Dropdown State
  isPublishDropdownOpen: boolean;
  
  // Debug Mode
  isDebugMode: boolean;
  debugExecutionStep: number;
  debugExecutionState: 'idle' | 'running' | 'paused' | 'completed';
  
  // Validation Panel
  showValidationPanel: boolean;
  
  // Visual Effects Demo
  showVisualEffectsDemo: boolean;
  
  // Execution Simulation
  isSimulatingExecution: boolean;
  simulationNodeStates: Map<string, 'idle' | 'pending' | 'running' | 'success' | 'error'>;
  
  // Node Selection
  selectedNodes: Array<{ containerId: string; nodeId: string }>;
  
  // Search
  searchQuery: string;
  
  // Notification
  notification: NotificationState;
  
  // Current Step (for multi-step workflows)
  currentStep: number;
  
  // Actions - Panels
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setLeftPanelView: (view: LeftPanelView) => void;
  minimizeLeftPanel: () => void;
  expandLeftPanel: () => void;
  minimizeRightPanel: () => void;
  expandRightPanel: () => void;
  
  // Actions - Modals
  openPreview: () => void;
  closePreview: () => void;
  openCloseConfirm: () => void;
  closeCloseConfirm: () => void;
  
  // Actions - Node Picker
  openNodePicker: (
    source: 'floating' | 'trigger' | 'step' | 'container' | 'branch' | 'tool' | 'substep' | 'branch-substep', 
    containerId?: string, 
    nodeId?: string, 
    branchId?: string,
    insertIndex?: number,
    subStepId?: string,
    connectionContext?: { // For inserting substep between connected nodes
      connectionId: string;
      sourceId: string;
      targetId: string;
    }
  ) => void;
  closeNodePicker: () => void;
  
  // Actions - Field Type Selector
  openFieldTypeSelector: (insertPosition: number) => void;
  closeFieldTypeSelector: () => void;
  
  // Actions - Field Properties
  openFieldProperties: (fieldId: string) => void;
  closeFieldProperties: () => void;
  
  // Actions - Form Setup
  openFormSetup: (containerId: string, nodeId: string) => void;
  closeFormSetup: () => void;
  
  // Actions - Node Setup
  openNodeSetup: (containerId: string, nodeId: string) => void;
  closeNodeSetup: () => void;
  
  // Actions - Trigger Setup
  openTriggerSetup: (triggerId: string) => void;
  closeTriggerSetup: () => void;
  
  // Actions - Delete Node Confirmation
  openDeleteNodeConfirm: (containerId: string, nodeId: string, nodeName: string, isSubStep?: boolean, subStepId?: string) => void;
  closeDeleteNodeConfirm: () => void;
  
  // Actions - Delete Trigger Confirmation
  openDeleteTriggerConfirm: (triggerId: string, triggerName: string) => void;
  closeDeleteTriggerConfirm: () => void;
  
  // Actions - Delete Container Confirmation
  openDeleteContainerConfirm: (containerId: string, containerName: string) => void;
  closeDeleteContainerConfirm: () => void;
  
  // Actions - Condition Builder
  openConditionBuilder: (containerId: string, nodeId: string) => void;
  closeConditionBuilder: () => void;
  
  // Actions - Keyboard Shortcuts
  openKeyboardShortcuts: () => void;
  closeKeyboardShortcuts: () => void;
  
  // Actions - Edit Workflow
  openEditWorkflow: () => void;
  closeEditWorkflow: () => void;
  
  // Actions - Publish Dropdown
  setIsPublishDropdownOpen: (isOpen: boolean) => void;
  
  // Actions - Node Selection
  selectNode: (containerId: string, nodeId: string) => void;
  addNodeToSelection: (containerId: string, nodeId: string) => void;
  deselectNode: (containerId: string, nodeId: string) => void;
  clearSelection: () => void;
  selectAllNodes: () => void;
  isNodeSelected: (containerId: string, nodeId: string) => boolean;
  
  // Actions - Search
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  
  // Actions - Notification
  showNotification: (message: string, type: 'error' | 'success' | 'info') => void;
  hideNotification: () => void;
  
  // Actions - Steps
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // Actions - Debug Mode
  toggleDebugMode: () => void;
  startDebugExecution: () => void;
  pauseDebugExecution: () => void;
  resumeDebugExecution: () => void;
  stopDebugExecution: () => void;
  stepDebugExecution: () => void;
  setDebugExecutionStep: (step: number) => void;
  
  // Actions - Validation
  toggleValidationPanel: () => void;
  showValidation: () => void;
  hideValidation: () => void;
  
  // Actions - Visual Effects Demo
  toggleVisualEffectsDemo: () => void;
  openVisualEffectsDemo: () => void;
  closeVisualEffectsDemo: () => void;
  
  // Actions - Execution Simulation
  startExecutionSimulation: () => void;
  stopExecutionSimulation: () => void;
  setNodeExecutionState: (nodeId: string, executionState: 'idle' | 'pending' | 'running' | 'success' | 'error') => void;
  getNodeExecutionState: (nodeId: string) => 'idle' | 'pending' | 'running' | 'success' | 'error';
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Initial State
      isLeftPanelMinimized: false,
      isRightPanelMinimized: true, // Minimized by default
      leftPanelView: 'triggers',
      showPreview: false,
      showCloseConfirm: false,
      searchQuery: '',
      notification: { show: false, message: '', type: 'info' },
      currentStep: 0,
      isNodePickerOpen: false,
      nodePickerContext: null,
      isFieldTypeSelectorOpen: false,
      fieldTypeSelectorContext: null,
      isFieldPropertiesOpen: false,
      fieldPropertiesContext: null,
      isFormSetupOpen: false,
      formSetupContext: null,
      isNodeSetupOpen: false,
      nodeSetupContext: null,
      isTriggerSetupOpen: false,
      triggerSetupContext: null,
      isDeleteNodeConfirmOpen: false,
      deleteNodeContext: null,
      isDeleteTriggerConfirmOpen: false,
      deleteTriggerContext: null,
      isDeleteContainerConfirmOpen: false,
      deleteContainerContext: null,
      isConditionBuilderOpen: false,
      conditionBuilderContext: null,
      isKeyboardShortcutsOpen: false,
      isEditWorkflowOpen: false,
      isPublishDropdownOpen: false,
      isDebugMode: false,
      debugExecutionStep: 0,
      debugExecutionState: 'idle',
      showValidationPanel: false,
      showVisualEffectsDemo: false,
      isSimulatingExecution: false,
      simulationNodeStates: new Map(),
      selectedNodes: [],

      // Panel Actions
      toggleLeftPanel: () => set((state) => ({ 
        isLeftPanelMinimized: !state.isLeftPanelMinimized 
      })),

      toggleRightPanel: () => set((state) => ({ 
        isRightPanelMinimized: !state.isRightPanelMinimized 
      })),

      setLeftPanelView: (view) => set({ leftPanelView: view }),

      minimizeLeftPanel: () => set({ isLeftPanelMinimized: true }),

      expandLeftPanel: () => set({ isLeftPanelMinimized: false }),

      minimizeRightPanel: () => set({ isRightPanelMinimized: true }),

      expandRightPanel: () => set({ isRightPanelMinimized: false }),

      // Modal Actions
      openPreview: () => set({ showPreview: true }),

      closePreview: () => set({ showPreview: false }),

      openCloseConfirm: () => set({ showCloseConfirm: true }),

      closeCloseConfirm: () => set({ showCloseConfirm: false }),

      // Node Picker Actions
      openNodePicker: (source, containerId, nodeId, branchId, insertIndex, subStepId, connectionContext) => set({ 
        isNodePickerOpen: true,
        nodePickerContext: { source, containerId, nodeId, branchId, insertIndex, subStepId, connectionContext }
      }),

      closeNodePicker: () => set({ 
        isNodePickerOpen: false,
        nodePickerContext: null
      }),

      // Field Type Selector Actions
      openFieldTypeSelector: (insertPosition) => set({ 
        isFieldTypeSelectorOpen: true,
        fieldTypeSelectorContext: { insertPosition }
      }),

      closeFieldTypeSelector: () => set({ 
        isFieldTypeSelectorOpen: false,
        fieldTypeSelectorContext: null
      }),

      // Field Properties Actions
      openFieldProperties: (fieldId) => set({ 
        isFieldPropertiesOpen: true,
        fieldPropertiesContext: { fieldId }
      }),

      closeFieldProperties: () => set({ 
        isFieldPropertiesOpen: false,
        fieldPropertiesContext: null
      }),

      // Form Setup Actions
      openFormSetup: (containerId, nodeId) => set({ 
        isFormSetupOpen: true,
        formSetupContext: { containerId, nodeId }
      }),

      closeFormSetup: () => set({ 
        isFormSetupOpen: false,
        formSetupContext: null
      }),

      // Node Setup Actions
      openNodeSetup: (containerId, nodeId) => set({ 
        isNodeSetupOpen: true,
        nodeSetupContext: { containerId, nodeId }
      }),

      closeNodeSetup: () => set({ 
        isNodeSetupOpen: false,
        nodeSetupContext: null
      }),

      // Trigger Setup Actions
      openTriggerSetup: (triggerId) => set({ 
        isTriggerSetupOpen: true,
        triggerSetupContext: { triggerId }
      }),

      closeTriggerSetup: () => set({ 
        isTriggerSetupOpen: false,
        triggerSetupContext: null
      }),

      // Delete Node Confirmation Actions
      openDeleteNodeConfirm: (containerId, nodeId, nodeName, isSubStep, subStepId) => set({ 
        isDeleteNodeConfirmOpen: true,
        deleteNodeContext: { containerId, nodeId, nodeName, isSubStep, subStepId }
      }),

      closeDeleteNodeConfirm: () => set({ 
        isDeleteNodeConfirmOpen: false,
        deleteNodeContext: null
      }),

      // Delete Trigger Confirmation Actions
      openDeleteTriggerConfirm: (triggerId, triggerName) => set({ 
        isDeleteTriggerConfirmOpen: true,
        deleteTriggerContext: { triggerId, triggerName }
      }),

      closeDeleteTriggerConfirm: () => set({ 
        isDeleteTriggerConfirmOpen: false,
        deleteTriggerContext: null
      }),

      // Delete Container Confirmation Actions
      openDeleteContainerConfirm: (containerId, containerName) => set({ 
        isDeleteContainerConfirmOpen: true,
        deleteContainerContext: { containerId, containerName }
      }),

      closeDeleteContainerConfirm: () => set({ 
        isDeleteContainerConfirmOpen: false,
        deleteContainerContext: null
      }),

      // Condition Builder Actions
      openConditionBuilder: (containerId, nodeId) => set({ 
        isConditionBuilderOpen: true,
        conditionBuilderContext: { containerId, nodeId }
      }),

      closeConditionBuilder: () => set({ 
        isConditionBuilderOpen: false,
        conditionBuilderContext: null
      }),

      // Keyboard Shortcuts Actions
      openKeyboardShortcuts: () => set({ isKeyboardShortcutsOpen: true }),

      closeKeyboardShortcuts: () => set({ isKeyboardShortcutsOpen: false }),
      
      // Edit Workflow Actions
      openEditWorkflow: () => set({ isEditWorkflowOpen: true }),

      closeEditWorkflow: () => set({ isEditWorkflowOpen: false }),
      
      // Publish Dropdown Actions
      setIsPublishDropdownOpen: (isOpen) => set({ isPublishDropdownOpen: isOpen }),
      
      // Node Selection Actions
      selectNode: (containerId, nodeId) => set({ 
        selectedNodes: [{ containerId, nodeId }] 
      }),
      
      addNodeToSelection: (containerId, nodeId) => set((state) => ({
        selectedNodes: [...state.selectedNodes, { containerId, nodeId }]
      })),
      
      deselectNode: (containerId, nodeId) => set((state) => ({
        selectedNodes: state.selectedNodes.filter(
          node => !(node.containerId === containerId && node.nodeId === nodeId)
        )
      })),
      
      clearSelection: () => set({ selectedNodes: [] }),
      
      selectAllNodes: () => {
        // This will be called from keyboard shortcuts with all nodes
        // For now just return empty implementation
      },
      
      isNodeSelected: (containerId, nodeId) => {
        const state = get();
        return state.selectedNodes.some(
          node => node.containerId === containerId && node.nodeId === nodeId
        );
      },

      // Search Actions
      setSearchQuery: (query) => set({ searchQuery: query }),

      clearSearch: () => set({ searchQuery: '' }),

      // Notification Actions
      showNotification: (message, type) => set({ 
        notification: { show: true, message, type } 
      }),

      hideNotification: () => set((state) => ({ 
        notification: { ...state.notification, show: false } 
      })),

      // Step Actions
      setCurrentStep: (step) => set({ currentStep: step }),

      nextStep: () => set((state) => ({ 
        currentStep: state.currentStep + 1 
      })),

      previousStep: () => set((state) => ({ 
        currentStep: Math.max(0, state.currentStep - 1) 
      })),
      
      // Debug Mode Actions
      toggleDebugMode: () => set((state) => ({ 
        isDebugMode: !state.isDebugMode 
      })),
      
      startDebugExecution: () => set({ 
        debugExecutionState: 'running' 
      }),
      
      pauseDebugExecution: () => set({ 
        debugExecutionState: 'paused' 
      }),
      
      resumeDebugExecution: () => set({ 
        debugExecutionState: 'running' 
      }),
      
      stopDebugExecution: () => set({ 
        debugExecutionState: 'idle' 
      }),
      
      stepDebugExecution: () => set((state) => ({ 
        debugExecutionStep: state.debugExecutionStep + 1 
      })),
      
      setDebugExecutionStep: (step) => set({ 
        debugExecutionStep: step 
      }),
      
      // Validation Actions
      toggleValidationPanel: () => set((state) => ({ 
        showValidationPanel: !state.showValidationPanel 
      })),
      
      showValidation: () => set({ 
        showValidationPanel: true 
      }),
      
      hideValidation: () => set({ 
        showValidationPanel: false 
      }),
      
      // Visual Effects Demo Actions
      toggleVisualEffectsDemo: () => set((state) => ({ 
        showVisualEffectsDemo: !state.showVisualEffectsDemo 
      })),
      
      openVisualEffectsDemo: () => set({ 
        showVisualEffectsDemo: true 
      }),
      
      closeVisualEffectsDemo: () => set({ 
        showVisualEffectsDemo: false 
      }),
      
      // Execution Simulation Actions
      startExecutionSimulation: () => set({ 
        isSimulatingExecution: true 
      }),
      
      stopExecutionSimulation: () => set({ 
        isSimulatingExecution: false,
        simulationNodeStates: new Map(),
      }),
      
      setNodeExecutionState: (nodeId, executionState) => set((state) => {
        const newStates = new Map(state.simulationNodeStates);
        newStates.set(nodeId, executionState);
        return { simulationNodeStates: newStates };
      }),
      
      getNodeExecutionState: (nodeId) => {
        const state = get();
        return state.simulationNodeStates.get(nodeId) || 'idle';
      },
    }),
    { name: 'UIStore' }
  )
);