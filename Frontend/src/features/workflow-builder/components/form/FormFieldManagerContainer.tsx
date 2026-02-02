/**
 * Form Field Manager Container
 * Connects FormFieldManager to the workflow store
 */

import { FormFieldManager } from './FormFieldManager';
import { useWorkflowStore } from '../../stores';
import { FormField } from '../../types';

export function FormFieldManagerContainer() {
  const { formFields, setFormFields } = useWorkflowStore();

  const handleFieldsChange = (fields: FormField[]) => {
    // Update the entire fields array in the store
    setFormFields(fields);
  };

  return (
    <FormFieldManager
      fields={formFields}
      onFieldsChange={handleFieldsChange}
      formTitle="AI Form"
      formDescription="Configure your form fields below"
    />
  );
}