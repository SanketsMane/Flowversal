/**
 * Field Properties Component
 * Phase 3 Part 2 - Enhanced Field Properties
 * 
 * Card component for field property editing with 3 tabs (Edit, Validations, Data)
 * Meant to be used inside FieldPropertiesModal
 */

import { useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { FormField } from '../../types';
import { FieldEditTab } from './FieldEditTab';
import { FieldValidationsTab } from './FieldValidationsTab';
import { FieldDataTab } from './FieldDataTab';
import { Edit, Shield, Database, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface FieldPropertiesProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  onClose: () => void;
}

type TabType = 'edit' | 'validations' | 'data';

export function FieldProperties({ field, onUpdate, onClose }: FieldPropertiesProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('edit');

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  const tabs = [
    {
      id: 'edit' as TabType,
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      description: 'Basic settings',
    },
    {
      id: 'validations' as TabType,
      label: 'Validations',
      icon: <Shield className="h-4 w-4" />,
      description: 'Validation rules',
    },
    {
      id: 'data' as TabType,
      label: 'Data',
      icon: <Database className="h-4 w-4" />,
      description: 'Data mapping',
    },
  ];

  return (
    <div 
      className={`w-full max-w-2xl max-h-[90vh] flex flex-col ${bgCard} rounded-xl border ${borderColor} shadow-2xl`}
    >
      {/* Header */}
      <div className={`p-4 border-b ${borderColor} flex items-center justify-between shrink-0`}>
        <div>
          <h3 className={`${textPrimary} font-medium`}>Field Properties</h3>
          <p className={`${textSecondary} text-sm`}>{field.label || 'Untitled Field'}</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="hover:bg-[#00C6FF]/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${borderColor} px-4`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-[#00C6FF] text-[#00C6FF]'
                : `border-transparent ${textSecondary} hover:text-[#00C6FF]`
            }`}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'edit' && (
          <FieldEditTab field={field} onUpdate={onUpdate} />
        )}
        {activeTab === 'validations' && (
          <FieldValidationsTab field={field} onUpdate={onUpdate} />
        )}
        {activeTab === 'data' && (
          <FieldDataTab field={field} onUpdate={onUpdate} />
        )}
      </div>

      {/* Footer */}
      <div className={`p-4 border-t ${borderColor} flex justify-between items-center`}>
        <div className={`${textSecondary} text-sm`}>
          Field Type: <span className={`${textPrimary} font-medium`}>{field.type}</span>
        </div>
        <Button
          onClick={onClose}
          className="bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] hover:opacity-90"
        >
          Done
        </Button>
      </div>
    </div>
  );
}
