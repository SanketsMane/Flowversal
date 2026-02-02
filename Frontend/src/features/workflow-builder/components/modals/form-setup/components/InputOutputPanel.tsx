import React from 'react';
import { FileText, Table, Braces } from 'lucide-react';
import { FormField } from '../../../types/form.types';
import { InputOutputPanelProps, InputOutputTab } from '../types/form-setup.types';

export function InputOutputPanel({
  title,
  tab,
  onTabChange,
  data,
  formFields,
  theme,
}: InputOutputPanelProps) {
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgSecondary = theme === 'dark' ? 'bg-[#16213E]' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  const tabs: { key: InputOutputTab; label: string; icon: React.ComponentType<any> }[] = [
    { key: 'schema', label: 'Schema', icon: FileText },
    { key: 'table', label: 'Table', icon: Table },
    { key: 'json', label: 'JSON', icon: Braces },
  ];

  const renderContent = () => {
    switch (tab) {
      case 'schema':
        return (
          <div className="space-y-4">
            {formFields.map(field => (
              <div key={field.id} className={`${bgSecondary} rounded p-3`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`${textPrimary} font-medium text-sm`}>{field.label}</span>
                  <span className={`${textSecondary} text-xs`}>{field.type}</span>
                </div>
                {field.description && (
                  <p className={`${textSecondary} text-xs mb-2`}>{field.description}</p>
                )}
                {field.required && (
                  <span className="text-red-400 text-xs">Required</span>
                )}
              </div>
            ))}
          </div>
        );

      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={`${bgSecondary}`}>
                  <th className={`p-2 text-left ${textSecondary}`}>Field</th>
                  <th className={`p-2 text-left ${textSecondary}`}>Type</th>
                  <th className={`p-2 text-left ${textSecondary}`}>Required</th>
                  <th className={`p-2 text-left ${textSecondary}`}>Description</th>
                </tr>
              </thead>
              <tbody>
                {formFields.map(field => (
                  <tr key={field.id} className={`border-b ${borderColor}`}>
                    <td className={`p-2 ${textPrimary}`}>{field.label}</td>
                    <td className={`p-2 ${textSecondary}`}>{field.type}</td>
                    <td className={`p-2 ${textSecondary}`}>{field.required ? 'Yes' : 'No'}</td>
                    <td className={`p-2 ${textSecondary}`}>{field.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'json':
        return (
          <pre className={`${bgSecondary} p-4 rounded text-xs overflow-x-auto ${textPrimary}`}>
            {JSON.stringify(data || formFields, null, 2)}
          </pre>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col h-full ${bgCard}`}>
      {/* Header */}
      <div className={`${bgSecondary} px-4 py-3 border-b ${borderColor}`}>
        <h3 className={`${textPrimary} font-medium`}>{title}</h3>
      </div>

      {/* Tabs */}
      <div className={`${bgCard} px-3 py-2 border-b ${borderColor}`}>
        <div className="flex items-center gap-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs transition-colors ${
                tab === key
                  ? `${bgSecondary} ${textPrimary}`
                  : `${textSecondary} hover:${bgSecondary}`
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {formFields.length === 0 ? (
          <div className={`text-center py-8 ${textSecondary}`}>
            <p className="text-sm">No form fields configured</p>
            <p className="text-xs mt-1">Add fields to see the {title.toLowerCase()} view</p>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
}
