import { X } from 'lucide-react';

interface NestedFieldsManagerProps {
  nestedFields: any[];
  onRemoveNestedField: (index: number) => void;
  theme: string;
}

export function NestedFieldsManager({
  nestedFields,
  onRemoveNestedField,
  theme
}: NestedFieldsManagerProps) {
  if (!nestedFields || nestedFields.length === 0) {
    return null;
  }

  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  return (
    <div className="space-y-2">
      <label className={`block text-sm ${textSecondary}`}>Nested Fields</label>
      <div className="space-y-2">
        {nestedFields.map((field, index) => (
          <div
            key={field.id}
            className={`flex items-center justify-between p-2 rounded-lg ${bgInput} border ${borderColor}`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full bg-[#00C6FF]`} />
              <span className={`text-sm ${textColor}`}>{field.label}</span>
              <span className={`text-xs ${textSecondary}`}>({field.type})</span>
            </div>
            <button
              onClick={() => onRemoveNestedField(index)}
              className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
              title="Remove nested field"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <p className={`text-xs ${textSecondary} italic`}>
        These fields are referenced in the default value with {`{{Field Name}}`}
      </p>
    </div>
  );
}
