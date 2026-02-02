import { getAuthHeaders } from '@/core/api/api.config';
import { runWorkflow } from '@/core/api/services/workflow.service';
import { useWorkflowExecutionStore } from '@/core/stores/workflowExecutionStore';
import { useUIStore } from '@/features/workflow-builder/stores/uiStore';
import { Play, X } from 'lucide-react';
import React from 'react';
import { useFormSetup } from '../hooks/useFormSetup';
import { FormSetupModalProps } from '../types/form-setup.types';
import { FieldPropertiesPanel } from './FieldPropertiesPanel';
import { FormFieldPanel } from './FormFieldPanel';
import { InputOutputPanel } from './InputOutputPanel';

export function FormSetupModal({ node, onClose, onSave, theme = 'dark' }: FormSetupModalProps) {
  const {
    formFields,
    selectedFieldId,
    inputTab,
    outputTab,
    fieldTab,
    executionData,
    hasUnsavedChanges,
    selectedField,
    addField,
    updateField,
    deleteField,
    selectField,
    reorderFields,
    updateInputTab,
    updateOutputTab,
    updateFieldTab,
    setExecutionData,
    resetUnsavedChanges,
  } = useFormSetup(node);
  const executionStore = useWorkflowExecutionStore();
  const uiStore = useUIStore();

  const bgModal = theme === 'dark' ? 'bg-black/70' : 'bg-black/50';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  const [showExitDialog, setShowExitDialog] = React.useState(false);

  const handleCloseAttempt = () => {
    if (hasUnsavedChanges) {
      setShowExitDialog(true);
    } else {
      onClose();
      uiStore.openUnifiedNodePicker(null);
    }
  };

  const handleConfirmExit = (shouldSave: boolean) => {
    if (shouldSave) {
      onSave(formFields);
      resetUnsavedChanges();
    }
    setShowExitDialog(false);
    onClose();
    uiStore.openUnifiedNodePicker(null);
  };

  const handleExecute = async () => {
    const workflowId =
      (node as any)?.workflowId ||
      (node as any)?.config?.workflowId ||
      window.localStorage.getItem('currentWorkflowId') ||
      null;

    if (!workflowId) {
      uiStore.showNotification('Please save the workflow before executing.', 'error');
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const accessToken = headers['Authorization']?.replace('Bearer ', '') || '';

      const exec = await runWorkflow({
        workflowId,
        input: formFields.reduce((acc, field) => {
          acc[field.id] = field.config?.defaultValue || '';
          return acc;
        }, {} as Record<string, any>),
        triggeredBy: 'manual',
        accessToken,
      });

      if (!exec.success || !exec.data?.id) {
        uiStore.showNotification(exec.error || 'Failed to start execution', 'error');
        return;
      }

      const executionId = exec.data.id;
      executionStore.upsertExecution({
        id: executionId,
        workflowId,
        status: 'running',
        startedAt: Date.now(),
      });

      // Show immediate output placeholder; actual updates come via polling/WS handled elsewhere
      setExecutionData(exec.data);
      updateOutputTab('json');
      uiStore.showNotification('Execution started', 'success');
    } catch (error) {
      console.error('Execution failed:', error);
      uiStore.showNotification('Execution failed', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`${bgModal} absolute inset-0 backdrop-blur-sm`}
        onClick={handleCloseAttempt}
      />

      {/* Exit Confirmation Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowExitDialog(false)} />
          <div className={`${bgCard} border ${borderColor} rounded-xl shadow-2xl p-6 max-w-sm w-full relative z-10 animate-in fade-in zoom-in-95 duration-200`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <span className="text-xl">⚠️</span>
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${textPrimary}`}>Unsaved Changes</h3>
              </div>
            </div>
            
            <p className={`${textSecondary} text-sm mb-6 leading-relaxed`}>
              You have unsaved changes in your form configuration. Would you like to save them before leaving?
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => handleConfirmExit(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} transition-colors`}
              >
                Discard
              </button>
              <button
                onClick={() => handleConfirmExit(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-[#00C6FF] to-[#0072FF] hover:opacity-90 text-white transition-opacity shadow-lg shadow-blue-500/20"
              >
                Save & Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <div
        className={`${bgCard} rounded-2xl border ${borderColor} shadow-2xl w-full max-w-[1600px] h-[90vh]
                    flex flex-col relative z-10 overflow-hidden`}
      >
        {/* Header */}
        <div className={`${bgCard} border-b ${borderColor} px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCloseAttempt}
              className={`flex items-center gap-2 px-3 py-1.5 ${textSecondary} hover:${textPrimary} transition-colors`}
            >
              <span className="text-lg">←</span>
              <span>Back to canvas</span>
            </button>
            <div className={`h-6 w-px bg-gray-300`} />
            <div>
              <h2 className={`${textPrimary} font-medium`}>Form Setup - Configure</h2>
              <p className={`text-xs ${textSecondary} mt-1`}>
                {formFields.length} field{formFields.length !== 1 ? 's' : ''} configured
                {hasUnsavedChanges && ' • Unsaved changes'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Execute Button */}
            <button
              onClick={handleExecute}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Play className="w-4 h-4" />
              <span>Execute step</span>
            </button>

            {/* Save Button */}
            <button
              onClick={() => {
                onSave(formFields);
                resetUnsavedChanges();
                onClose();
                uiStore.openUnifiedNodePicker(null);
              }}
              disabled={!hasUnsavedChanges}
              className={`px-4 py-2 rounded-lg transition-colors ${
                hasUnsavedChanges
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Save Changes
            </button>

            <button
              onClick={handleCloseAttempt}
              className={`${textSecondary} hover:text-white transition-colors p-2`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* PANEL 1 - Input */}
          <div className={`w-[320px] border-r ${borderColor}`}>
            <InputOutputPanel
              title="INPUT"
              tab={inputTab}
              onTabChange={updateInputTab}
              data={null}
              formFields={formFields}
              theme={theme}
            />
          </div>

          {/* PANEL 2 - Form Fields */}
          <div className={`flex-1 border-r ${borderColor} min-w-[400px]`}>
            <FormFieldPanel
              formFields={formFields}
              selectedFieldId={selectedFieldId}
              onFieldSelect={selectField}
              onFieldDelete={deleteField}
              onFieldAdd={addField}
              onFieldsReorder={reorderFields}
              theme={theme}
            />
          </div>

          {/* PANEL 3 - Properties */}
          <div className="flex-1 min-w-[400px]">
            <FieldPropertiesPanel
              selectedField={selectedField}
              fieldTab={fieldTab}
              onFieldTabChange={updateFieldTab}
              onFieldUpdate={(updates) => {
                if (selectedFieldId) {
                  updateField(selectedFieldId, updates);
                }
              }}
              onSave={() => {
                onSave(formFields);
                resetUnsavedChanges();
              }}
              hasUnsavedChanges={hasUnsavedChanges}
              theme={theme}
            />
          </div>

          {/* PANEL 4 - Output */}
          <div className={`w-[320px] border-l ${borderColor}`}>
            <InputOutputPanel
              title="OUTPUT"
              tab={outputTab}
              onTabChange={updateOutputTab}
              data={executionData}
              formFields={formFields}
              theme={theme}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
