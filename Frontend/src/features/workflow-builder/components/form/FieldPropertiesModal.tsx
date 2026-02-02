/**
 * Field Properties Modal Wrapper
 * Window-level modal for editing form field properties
 */

import { useUIStore, useWorkflowStore } from '../../stores';
import { FieldProperties } from '../properties/FieldProperties';

export function FieldPropertiesModal() {
  const { isFieldPropertiesOpen, fieldPropertiesContext, closeFieldProperties } = useUIStore();
  const { formFields, setFormFields } = useWorkflowStore();

  if (!isFieldPropertiesOpen || !fieldPropertiesContext) return null;

  const field = formFields.find(f => f.id === fieldPropertiesContext.fieldId);
  
  if (!field) {
    closeFieldProperties();
    return null;
  }

  const handleUpdate = (updates: Partial<typeof field>) => {
    const newFields = formFields.map(f =>
      f.id === field.id ? { ...f, ...updates } : f
    );
    setFormFields(newFields);
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
      }}
      onClick={closeFieldProperties}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <FieldProperties
          field={field}
          onUpdate={handleUpdate}
          onClose={closeFieldProperties}
        />
      </div>
    </div>
  );
}
