/**
 * Field Type Selector Modal Wrapper
 * Window-level modal for adding form fields
 */

import { useUIStore, useWorkflowStore } from '../../stores';
import { FieldTypeSelector } from './FieldTypeSelector';
import { FormFieldType } from '../../types';

export function FieldTypeSelectorModal() {
  const { isFieldTypeSelectorOpen, fieldTypeSelectorContext, closeFieldTypeSelector, openFieldProperties } = useUIStore();
  const { formFields, setFormFields } = useWorkflowStore();

  // Disable modal - now handled inline in FormFieldManager
  return null;
}