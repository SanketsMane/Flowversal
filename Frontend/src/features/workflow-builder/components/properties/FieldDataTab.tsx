/**
 * Field Data Tab Component
 * Phase 3 Part 2 - Enhanced Field Properties
 * 
 * Data mapping and persistence configuration
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { FormField } from '../../types';
import { Input } from '@/shared/components/ui/input';
import { Database, Server, HardDrive, Hash, Link2 } from 'lucide-react';

interface FieldDataTabProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
}

export function FieldDataTab({ field, onUpdate }: FieldDataTabProps) {
  const { theme } = useTheme();

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  const persistenceOptions = [
    { value: 'none', label: 'None', icon: <Hash className="h-4 w-4" />, description: 'Data is not stored' },
    { value: 'client', label: 'Client Storage', icon: <HardDrive className="h-4 w-4" />, description: 'Store in browser (localStorage)' },
    { value: 'server', label: 'Server Storage', icon: <Server className="h-4 w-4" />, description: 'Store on server (database)' },
  ];

  return (
    <div className="space-y-4">
      {/* Data Key / Variable Name */}
      <div className={`${bgCard} border ${borderColor} rounded-lg p-4 space-y-3`}>
        <div className="flex items-center gap-2 mb-3">
          <Database className={`${textSecondary} h-5 w-5`} />
          <h4 className={`${textPrimary} font-medium`}>Data Mapping</h4>
        </div>

        <div>
          <label className={`${textSecondary} text-sm mb-2 block`}>Data Key</label>
          <Input
            value={field.dataKey || ''}
            onChange={(e) => onUpdate({ dataKey: e.target.value })}
            placeholder="user_email"
            className={`${bgInput} border ${borderColor} ${textPrimary} font-mono`}
          />
          <p className={`${textSecondary} text-xs mt-1`}>
            Unique identifier for this field's data (use snake_case)
          </p>
        </div>

        <div>
          <label className={`${textSecondary} text-sm mb-2 block`}>Variable Name</label>
          <Input
            value={field.variable || ''}
            onChange={(e) => onUpdate({ variable: e.target.value })}
            placeholder="{{user_email}}"
            className={`${bgInput} border ${borderColor} ${textPrimary} font-mono`}
          />
          <p className={`${textSecondary} text-xs mt-1`}>
            Variable name to use in workflows (e.g., {`{{variable_name}}`})
          </p>
        </div>
      </div>

      {/* Persistence Strategy */}
      <div className={`${bgCard} border ${borderColor} rounded-lg p-4 space-y-3`}>
        <div className="flex items-center gap-2 mb-3">
          <HardDrive className={`${textSecondary} h-5 w-5`} />
          <h4 className={`${textPrimary} font-medium`}>Data Persistence</h4>
        </div>

        <div className="space-y-2">
          {persistenceOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onUpdate({ persistence: option.value as any })}
              className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                field.persistence === option.value
                  ? 'border-[#00C6FF] bg-[#00C6FF]/10'
                  : `border-${borderColor} hover:border-[#00C6FF]/50`
              }`}
            >
              <div className={`mt-0.5 ${
                field.persistence === option.value ? 'text-[#00C6FF]' : textSecondary
              }`}>
                {option.icon}
              </div>
              <div className="flex-1 text-left">
                <p className={`${textPrimary} font-medium`}>{option.label}</p>
                <p className={`${textSecondary} text-sm`}>{option.description}</p>
              </div>
            </button>
          ))}
        </div>

        {field.persistence === 'server' && (
          <div className="pt-2">
            <label className={`${textSecondary} text-sm mb-2 block`}>Database Table</label>
            <Input
              value={field.dbTable || ''}
              onChange={(e) => onUpdate({ dbTable: e.target.value })}
              placeholder="users"
              className={`${bgInput} border ${borderColor} ${textPrimary} font-mono`}
            />
            <p className={`${textSecondary} text-xs mt-1`}>
              Specify which database table to store this data in
            </p>
          </div>
        )}
      </div>

      {/* Data Transformation */}
      <div className={`${bgCard} border ${borderColor} rounded-lg p-4 space-y-3`}>
        <div className="flex items-center gap-2 mb-3">
          <Link2 className={`${textSecondary} h-5 w-5`} />
          <h4 className={`${textPrimary} font-medium`}>Data Transformation</h4>
        </div>

        <div>
          <label className={`${textSecondary} text-sm mb-2 block`}>Transform Function</label>
          <select
            value={field.transform || 'none'}
            onChange={(e) => onUpdate({ transform: e.target.value })}
            className={`w-full px-3 py-2 ${bgInput} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:border-[#00C6FF]`}
          >
            <option value="none">No transformation</option>
            <option value="uppercase">Convert to UPPERCASE</option>
            <option value="lowercase">Convert to lowercase</option>
            <option value="capitalize">Capitalize First Letter</option>
            <option value="trim">Trim whitespace</option>
            <option value="slugify">Convert to slug (url-friendly)</option>
            <option value="json">Parse as JSON</option>
            <option value="number">Convert to number</option>
            <option value="boolean">Convert to boolean</option>
          </select>
        </div>

        <div>
          <label className={`${textSecondary} text-sm mb-2 block`}>Custom Transform</label>
          <textarea
            value={field.customTransform || ''}
            onChange={(e) => onUpdate({ customTransform: e.target.value })}
            placeholder="// JavaScript function to transform data&#10;(value) => value.trim().toLowerCase()"
            rows={3}
            className={`w-full px-3 py-2 ${bgInput} border ${borderColor} rounded-lg ${textPrimary} font-mono text-sm focus:outline-none focus:border-[#00C6FF]`}
          />
          <p className={`${textSecondary} text-xs mt-1`}>
            Advanced: JavaScript function for custom transformation
          </p>
        </div>
      </div>

      {/* Computed Value */}
      <div className={`${bgCard} border ${borderColor} rounded-lg p-4 space-y-3`}>
        <h4 className={`${textPrimary} font-medium mb-3`}>Computed Value</h4>

        <div>
          <label className={`${textSecondary} text-sm mb-2 block`}>Formula</label>
          <Input
            value={field.computedFormula || ''}
            onChange={(e) => onUpdate({ computedFormula: e.target.value })}
            placeholder="{{field1}} + {{field2}}"
            className={`${bgInput} border ${borderColor} ${textPrimary} font-mono`}
          />
          <p className={`${textSecondary} text-xs mt-1`}>
            Compute value from other fields (e.g., {`{{price}} * {{quantity}}`})
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="isComputed"
            checked={field.isComputed || false}
            onChange={(e) => onUpdate({ isComputed: e.target.checked })}
            className="w-4 h-4 accent-[#00C6FF]"
          />
          <label htmlFor="isComputed" className={`${textPrimary} text-sm`}>
            This is a computed field (read-only, calculated from formula)
          </label>
        </div>
      </div>

      {/* Conditional Display */}
      <div className={`${bgCard} border ${borderColor} rounded-lg p-4 space-y-3`}>
        <h4 className={`${textPrimary} font-medium mb-3`}>Conditional Display</h4>

        <div>
          <label className={`${textSecondary} text-sm mb-2 block`}>Show When</label>
          <Input
            value={field.showWhen || ''}
            onChange={(e) => onUpdate({ showWhen: e.target.value })}
            placeholder="{{field_name}} === 'value'"
            className={`${bgInput} border ${borderColor} ${textPrimary} font-mono`}
          />
          <p className={`${textSecondary} text-xs mt-1`}>
            Condition to show this field (JavaScript expression)
          </p>
        </div>

        <div>
          <label className={`${textSecondary} text-sm mb-2 block`}>Hide When</label>
          <Input
            value={field.hideWhen || ''}
            onChange={(e) => onUpdate({ hideWhen: e.target.value })}
            placeholder="{{another_field}} !== ''"
            className={`${bgInput} border ${borderColor} ${textPrimary} font-mono`}
          />
          <p className={`${textSecondary} text-xs mt-1`}>
            Condition to hide this field (JavaScript expression)
          </p>
        </div>
      </div>

      {/* API Integration */}
      <div className={`${bgCard} border ${borderColor} rounded-lg p-4 space-y-3`}>
        <div className="flex items-center gap-2 mb-3">
          <Server className={`${textSecondary} h-5 w-5`} />
          <h4 className={`${textPrimary} font-medium`}>API Integration</h4>
        </div>

        <div>
          <label className={`${textSecondary} text-sm mb-2 block`}>API Endpoint</label>
          <Input
            value={field.apiEndpoint || ''}
            onChange={(e) => onUpdate({ apiEndpoint: e.target.value })}
            placeholder="/api/validate-email"
            className={`${bgInput} border ${borderColor} ${textPrimary} font-mono`}
          />
          <p className={`${textSecondary} text-xs mt-1`}>
            API endpoint to validate or transform this field
          </p>
        </div>

        <div>
          <label className={`${textSecondary} text-sm mb-2 block`}>API Method</label>
          <select
            value={field.apiMethod || 'GET'}
            onChange={(e) => onUpdate({ apiMethod: e.target.value })}
            className={`w-full px-3 py-2 ${bgInput} border ${borderColor} rounded-lg ${textPrimary} focus:outline-none focus:border-[#00C6FF]`}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
          </select>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="validateOnBlur"
            checked={field.validateOnBlur || false}
            onChange={(e) => onUpdate({ validateOnBlur: e.target.checked })}
            className="w-4 h-4 accent-[#00C6FF]"
          />
          <label htmlFor="validateOnBlur" className={`${textPrimary} text-sm`}>
            Validate with API when user leaves field
          </label>
        </div>
      </div>

      {/* Data Summary */}
      <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
        <h4 className={`${textPrimary} font-medium mb-3`}>Configuration Summary</h4>
        <div className="space-y-2 font-mono text-sm">
          <div className="flex justify-between">
            <span className={textSecondary}>Data Key:</span>
            <span className={textPrimary}>{field.dataKey || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className={textSecondary}>Variable:</span>
            <span className={textPrimary}>{field.variable || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className={textSecondary}>Persistence:</span>
            <span className={textPrimary}>{field.persistence || 'none'}</span>
          </div>
          <div className="flex justify-between">
            <span className={textSecondary}>Transform:</span>
            <span className={textPrimary}>{field.transform || 'none'}</span>
          </div>
          {field.computedFormula && (
            <div className="flex justify-between">
              <span className={textSecondary}>Computed:</span>
              <span className={textPrimary}>Yes</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
