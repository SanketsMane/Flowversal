import { X } from 'lucide-react';
import { EnhancedDefaultValueInput } from './EnhancedDefaultValueInput';

interface FieldDefaultValueUIProps {
  element: any;
  updateElement: (updates: Record<string, any>) => void;
  syncToPromptBuilder?: (updates: Record<string, any>) => void;
  onOpenVariables?: () => void;
  activeTextbox?: boolean;
  theme: string;
  cursorPosition?: number;
  onCursorChange?: (position: number) => void;
  onDropdownToggle?: (isOpen: boolean, height?: number) => void;
}

export function FieldDefaultValueUI({
  element,
  updateElement,
  syncToPromptBuilder,
  onOpenVariables,
  activeTextbox = false,
  theme,
  cursorPosition,
  onCursorChange,
  onDropdownToggle
}: FieldDefaultValueUIProps) {
  const fieldType = element?.type;
  
  // Theme colors
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  
  // Handle URL field separately with both URL Name and Default Value
  if (fieldType === 'url') {
    return (
      <>
        <div className="mb-3">
          <label className={`block text-sm ${textSecondary} mb-1`}>URL Name</label>
          <EnhancedDefaultValueInput
            fieldType="text"
            value={element?.linkName || ''}
            onChange={(newValue) => {
              updateElement({ linkName: newValue });
              syncToPromptBuilder?.({ linkName: newValue });
            }}
            onOpenVariables={onOpenVariables}
            isActive={activeTextbox}
            theme={theme}
            placeholder="Enter URL name"
          />
        </div>
        <div>
          <label className={`block text-sm ${textSecondary} mb-1`}>Default Value (URL)</label>
          <EnhancedDefaultValueInput
            fieldType="url"
            value={element?.defaultValue || ''}
            onChange={(newValue) => {
              updateElement({ defaultValue: newValue });
              syncToPromptBuilder?.({ defaultValue: newValue });
            }}
            onOpenVariables={onOpenVariables}
            isActive={activeTextbox}
            theme={theme}
            placeholder="https://example.com"
          />
        </div>
      </>
    );
  }
  
  return (
    <>
      <label className={`block text-sm ${textSecondary} mb-1`}>Default Value</label>
      
      {/* Options Management for Radio/Dropdown/Checklist */}
      {(fieldType === 'radio' || fieldType === 'dropdown' || fieldType === 'checklist') && (
        <div className="space-y-3 mb-3">
          <div className="flex items-center justify-between">
            <label className={`text-xs ${textSecondary}`}>Options</label>
            <button
              onClick={() => {
                const currentOptions = element?.options || [];
                updateElement({ options: [...currentOptions, 'New Option'] });
              }}
              className={`text-xs px-2 py-1 rounded ${bgInput} border ${borderColor} ${textColor} hover:bg-[#00C6FF]/10 transition-colors`}
            >
              + Add Option
            </button>
          </div>
          {element?.options && element.options.length > 0 ? (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {element.options.map((option: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(element.options || [])];
                      newOptions[idx] = e.target.value;
                      updateElement({ options: newOptions });
                    }}
                    className={`flex-1 px-2 py-1 text-sm rounded ${bgInput} border ${borderColor} ${textColor}`}
                    placeholder="Option text"
                  />
                  <button
                    onClick={() => {
                      const newOptions = element.options!.filter((_: string, i: number) => i !== idx);
                      updateElement({ options: newOptions });
                    }}
                    className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-xs ${textSecondary} text-center py-2`}>No options added yet</p>
          )}
        </div>
      )}
      
      {/* Enhanced Default Value Input for all field types */}
      <EnhancedDefaultValueInput
        fieldType={fieldType || 'text'}
        value={element?.defaultValue || ''}
        onChange={(newValue) => {
          updateElement({ defaultValue: newValue });
          syncToPromptBuilder?.({ defaultValue: newValue });
        }}
        onOpenVariables={onOpenVariables}
        options={element?.options || []}
        onOptionsChange={(newOptions) => {
          updateElement({ options: newOptions });
        }}
        isActive={activeTextbox}
        theme={theme}
        placeholder={
          fieldType === 'toggle' ? 'Toggle default value' :
          fieldType === 'radio' || fieldType === 'dropdown' ? 'Select default option' :
          fieldType === 'checklist' ? 'Select default options (comma-separated)' :
          fieldType === 'date' ? 'Select default date' :
          fieldType === 'time' ? 'Select default time' :
          fieldType === 'file' ? 'Add default file URL' :
          fieldType === 'image' ? 'Add default image URL' :
          'Enter default value'
        }
        toggleState={element?.toggleDefault}
        onToggleChange={(newState) => {
          updateElement({ toggleDefault: newState, defaultValue: newState ? 'true' : 'false' });
          syncToPromptBuilder?.({ defaultValue: newState ? 'true' : 'false' });
        }}
        dateValue={element?.defaultDate}
        onDateChange={(newDate) => {
          updateElement({ defaultDate: newDate, defaultValue: newDate });
          syncToPromptBuilder?.({ defaultValue: newDate });
        }}
        timeValue={element?.defaultTime}
        onTimeChange={(newTime) => {
          updateElement({ defaultTime: newTime, defaultValue: newTime });
          syncToPromptBuilder?.({ defaultValue: newTime });
        }}
        onDropdownToggle={onDropdownToggle}
      />
    </>
  );
}