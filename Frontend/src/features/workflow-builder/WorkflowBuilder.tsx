/**
 * Workflow Builder - New Modular Architecture
 * Phase 2 - Component Extraction
 * 
 * This is the new modular version using extracted components and Zustand stores.
 * It runs alongside WorkflowBuilderV2.tsx without replacing it yet.
 * 
 * Features:
 * - ✅ Modular component structure
 * - ✅ Zustand state management
 * - ✅ Registry-based triggers/nodes/tools
 * - ✅ Same visual design as V2
 * - ✅ Type-safe with TypeScript
 * - ✅ Unified Node Picker Modal (Version 284)
 * - ✅ No LHS/RHS panels - Full canvas width
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { CustomNotification } from '@/shared/components/ui/CustomNotification';
import { useUIStore, useWorkflowStore } from './stores';
import { TopBar } from './components/layout';
import { CloseWorkflowDialog } from './components/dialogs/CloseWorkflowDialog';
import { WorkflowPreviewModal } from './components/modals/WorkflowPreviewModal';
import { WorkflowCanvas } from './components/canvas';
import { FormSetupModalContainer } from './components/modals/FormSetupModalContainer';
import { NodeSetupModalContainer } from './components/modals/NodeSetupModalContainer';
import { TriggerSetupModalContainer } from './components/modals/TriggerSetupModalContainer';
import { DeleteNodeConfirmContainer } from './components/modals/DeleteNodeConfirmContainer';
import { DeleteTriggerConfirmContainer } from './components/modals/DeleteTriggerConfirmContainer';
import { EditWorkflowModal } from './components/modals/EditWorkflowModal';
import { ViewportProvider } from './contexts/ViewportContext';
import { TemplateLibrary } from '../templates';
import { ExpandableToolMenu } from './components/canvas/ExpandableToolMenu';
import { KeyboardShortcutsModal } from './components/modals/KeyboardShortcutsModal';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ValidationPanel } from './components/validation/ValidationPanel';
import { DebugPanel } from './components/debug/DebugPanel';
import { validateWorkflow } from './utils/validation';
import { loadWorkflowIntoStores } from './utils/workflowManager';
import React from 'react';

interface WorkflowBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  workflowData?: WorkflowData;
  onNavigate?: (page: string) => void;
  workflowId?: string; // Add workflowId prop
}

export function WorkflowBuilder({ isOpen, onClose, workflowData, onNavigate, workflowId }: WorkflowBuilderProps) {
  if (!isOpen) return null;

  // Wrap with ViewportProvider to ensure context is available for keyboard shortcuts
  return (
    <ViewportProvider>
      <WorkflowBuilderContent 
        isOpen={isOpen}
        onClose={onClose}
        workflowData={workflowData}
        onNavigate={onNavigate}
        workflowId={workflowId}
      />
    </ViewportProvider>
  );
}

function WorkflowBuilderContent({ isOpen, onClose, workflowData, onNavigate, workflowId }: WorkflowBuilderProps) {
  const { theme } = useTheme();
  const { 
    notification, 
    hideNotification, 
    showPreview, 
    openPreview, 
    closePreview, 
    showCloseConfirm, 
    openCloseConfirm,
    closeCloseConfirm,
    isKeyboardShortcutsOpen,
    openKeyboardShortcuts,
    closeKeyboardShortcuts,
  } = useUIStore();
  const { workflowName, setWorkflowName, reset, containers, triggers } = useWorkflowStore();
  
  // Track if we've loaded the initial workflowData to prevent double-loading
  const hasLoadedInitialData = React.useRef(false);
  const lastLoadedWorkflowKey = React.useRef<string | null>(null);

  // Theme colors
  const bgColor = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  
  // Define handlers before using them in keyboard shortcuts
  const handleDirectClose = () => {
    // Called when closing with no unsaved changes
    reset(); // Reset workflow state
    onClose();
    
    // Navigate back to home if onNavigate is provided
    if (onNavigate) {
      onNavigate('home');
    }
  };
  
  // Keyboard shortcuts
  useKeyboardShortcuts({
    onOpenHelp: openKeyboardShortcuts,
    onClose: () => {
      // Show close confirmation if there are unsaved changes
      if (containers.length > 1 || triggers.length > 0) {
        openCloseConfirm();
      } else {
        handleDirectClose();
      }
    }
  });

  // Initialize workflow from props (UNIFIED LOADER)
  // This is called when opening workflow builder from Dashboard/MyWorkflows with template data
  const workflowKey = React.useMemo(() => {
    if (!workflowData) return null;
    return JSON.stringify({
      id: (workflowData as any).id || null,
      name: (workflowData as any).name || null,
      version: (workflowData as any).version || null,
      updatedAt: (workflowData as any).updatedAt || null,
    });
  }, [workflowData]);

  React.useEffect(() => {
    if (!workflowData || !workflowKey) return;
    if (lastLoadedWorkflowKey.current === workflowKey) return;

    console.log('🔄 [WorkflowBuilder] Loading workflowData into stores...', workflowData);
    loadWorkflowIntoStores(workflowData);
    hasLoadedInitialData.current = true;
    lastLoadedWorkflowKey.current = workflowKey;
    console.log('✅ [WorkflowBuilder] Workflow data loaded successfully');
  }, [workflowData, workflowKey]);
  
  // Reset the loaded flag when workflow builder is closed
  React.useEffect(() => {
    if (!isOpen) {
      hasLoadedInitialData.current = false;
      lastLoadedWorkflowKey.current = null;
    }
  }, [isOpen]);

  const handlePreview = () => {
    openPreview();
    console.log('Preview workflow');
  };

  const handlePublish = () => {
    console.log('Publish workflow');
    // TODO: Implement publish logic
  };

  const handleSaveAndClose = () => {
    // TODO: Implement save logic here
    console.log('Saving workflow:', workflowName);
    // Save the workflow data
    // ... save implementation would go here
    
    // Close the dialog and workflow
    closeCloseConfirm();
    reset(); // Reset workflow state
    onClose();
    
    // Navigate back to home if onNavigate is provided
    if (onNavigate) {
      onNavigate('home');
    }
  };

  const handleCloseWithoutSaving = () => {
    closeCloseConfirm();
    reset(); // Reset workflow state without saving
    onClose();
    
    // Navigate back to home if onNavigate is provided
    if (onNavigate) {
      onNavigate('home');
    }
  };

  const handleCancelClose = () => {
    closeCloseConfirm();
  };
  
  // Compute workflow validation
  const workflowValidation = React.useMemo(() => {
    return validateWorkflow(containers, triggers);
  }, [containers, triggers]);

  return (
    <>
      {/* Notification */}
      <CustomNotification
        show={notification.show}
        onClose={hideNotification}
        message={notification.message}
        type={notification.type}
      />

      {/* Main Layout */}
      <div className={`fixed inset-0 z-[100] ${bgColor} flex flex-col`}>
        {/* Top Bar */}
        <TopBar 
          onClose={onClose}
          onPreview={handlePreview}
          onPublish={handlePublish}
          workflowId={workflowId}
        />

        {/* Main Content Area - FULL WIDTH (No LHS/RHS Panels) */}
        <div className="flex flex-1 overflow-hidden">
          {/* Center Canvas - Full Width */}
          <WorkflowCanvas />
        </div>
      </div>
      
      {/* Canvas Controls - Inside ViewportProvider */}
      <ExpandableToolMenu />
      
      {/* Close Confirm Dialog */}
      <CloseWorkflowDialog
        isOpen={showCloseConfirm}
        onClose={handleCancelClose}
        onSaveAndClose={handleSaveAndClose}
        onCloseWithoutSaving={handleCloseWithoutSaving}
        onCancel={handleCancelClose}
      />
      
      {/* Form Setup Modal - App Level */}
      <FormSetupModalContainer />
      
      {/* Node Setup Modal - App Level (for all nodes) */}
      <NodeSetupModalContainer />
      
      {/* Trigger Setup Modal - App Level (for all triggers) */}
      <TriggerSetupModalContainer />
      
      {/* Delete Node Confirm Modal - App Level */}
      <DeleteNodeConfirmContainer />
      
      {/* Delete Trigger Confirm Modal - App Level */}
      <DeleteTriggerConfirmContainer />
      
      {/* Preview Modal */}
      <WorkflowPreviewModal
        isOpen={showPreview}
        onClose={closePreview}
      />
      
      {/* Template Library */}
      <TemplateLibrary />
      
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isKeyboardShortcutsOpen}
        onClose={closeKeyboardShortcuts}
      />
      
      {/* Validation Panel */}
      <ValidationPanel validation={workflowValidation} />
      
      {/* Debug Panel */}
      <DebugPanel />
      
      {/* Edit Workflow Modal */}
      <EditWorkflowModal />
    </>
  );
}

export default WorkflowBuilder;