import { useState, useEffect, useCallback } from 'react';
import { FormField } from '../../../types/form.types';
import { WorkflowNode } from '../../../types';
import {
  FormSetupState,
  InputOutputTab,
  ConfigTab,
  FieldTab
} from '../types/form-setup.types';

export function useFormSetup(node: WorkflowNode) {
  const [state, setState] = useState<FormSetupState>({
    formFields: node.config?.formFields || [],
    selectedFieldId: null,
    showFieldPicker: false,
    fieldTab: 'edit',
    hasUnsavedChanges: false,
    showCloseConfirm: false,
    inputTab: 'schema',
    outputTab: 'schema',
    configTab: 'parameters',
    executionData: null,
    newOption: '',
  });

  // Update form fields
  const updateFormFields = useCallback((fields: FormField[]) => {
    setState(prev => ({
      ...prev,
      formFields: fields,
      hasUnsavedChanges: true,
    }));
  }, []);

  // Add new field
  const addField = useCallback((field: FormField) => {
    const newField = {
      ...field,
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    setState(prev => ({
      ...prev,
      formFields: [...prev.formFields, newField],
      selectedFieldId: newField.id,
      hasUnsavedChanges: true,
    }));
  }, []);

  // Update existing field
  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setState(prev => ({
      ...prev,
      formFields: prev.formFields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
      hasUnsavedChanges: true,
    }));
  }, []);

  // Delete field
  const deleteField = useCallback((fieldId: string) => {
    setState(prev => ({
      ...prev,
      formFields: prev.formFields.filter(field => field.id !== fieldId),
      selectedFieldId: prev.selectedFieldId === fieldId ? null : prev.selectedFieldId,
      hasUnsavedChanges: true,
    }));
  }, []);

  // Reorder fields
  const reorderFields = useCallback((fields: FormField[]) => {
    setState(prev => ({
      ...prev,
      formFields: fields,
      hasUnsavedChanges: true,
    }));
  }, []);

  // Select field
  const selectField = useCallback((fieldId: string | null) => {
    setState(prev => ({
      ...prev,
      selectedFieldId: fieldId,
    }));
  }, []);

  // Update tabs
  const updateInputTab = useCallback((tab: InputOutputTab) => {
    setState(prev => ({ ...prev, inputTab: tab }));
  }, []);

  const updateOutputTab = useCallback((tab: InputOutputTab) => {
    setState(prev => ({ ...prev, outputTab: tab }));
  }, []);

  const updateConfigTab = useCallback((tab: ConfigTab) => {
    setState(prev => ({ ...prev, configTab: tab }));
  }, []);

  const updateFieldTab = useCallback((tab: FieldTab) => {
    setState(prev => ({ ...prev, fieldTab: tab }));
  }, []);

  // Execution data
  const setExecutionData = useCallback((data: any) => {
    setState(prev => ({ ...prev, executionData: data }));
  }, []);

  // New option for select fields
  const setNewOption = useCallback((option: string) => {
    setState(prev => ({ ...prev, newOption: option }));
  }, []);

  // Reset unsaved changes
  const resetUnsavedChanges = useCallback(() => {
    setState(prev => ({ ...prev, hasUnsavedChanges: false }));
  }, []);

  // Get selected field
  const selectedField = state.formFields.find(field => field.id === state.selectedFieldId) || null;

  return {
    // State
    ...state,
    selectedField,

    // Actions
    updateFormFields,
    addField,
    updateField,
    deleteField,
    reorderFields,
    selectField,
    updateInputTab,
    updateOutputTab,
    updateConfigTab,
    updateFieldTab,
    setExecutionData,
    setNewOption,
    resetUnsavedChanges,
  };
}
