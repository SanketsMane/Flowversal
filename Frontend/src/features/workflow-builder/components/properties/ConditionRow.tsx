/**
 * Condition Row Component
 * Individual condition row with operands, operator, and type selection
 */

import { X, ChevronDown, Variable } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { Condition, ConditionDataType, ConditionOperator, OPERATORS, DATA_TYPES } from '../../types';
import { useState, useRef, useEffect } from 'react';

interface ConditionRowProps {
  condition: Condition;
  onUpdate: (updates: Partial<Condition>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function ConditionRow({ condition, onUpdate, onRemove, canRemove }: ConditionRowProps) {
  const { theme } = useTheme();
  const [showOperatorDropdown, setShowOperatorDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const operatorDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgDropdown = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const hoverBg = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-100';

  // Get available operators based on data type
  const availableOperators = OPERATORS.filter(op => 
    op.supportedTypes.includes(condition.dataType)
  );

  // Check if selected operator requires right operand
  const selectedOperatorDef = OPERATORS.find(op => op.value === condition.operator);
  const requiresRightOperand = selectedOperatorDef?.requiresRightOperand ?? true;

  // Get current type definition
  const currentType = DATA_TYPES.find(t => t.value === condition.dataType);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (operatorDropdownRef.current && !operatorDropdownRef.current.contains(event.target as Node)) {
        setShowOperatorDropdown(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2">
      {/* Left Operand & Type Selector */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={condition.leftOperand}
            onChange={(e) => onUpdate({ leftOperand: e.target.value })}
            placeholder="value1 or {{variable}}"
            className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
          />
        </div>

        {/* Type Selector */}
        <div className="relative" ref={typeDropdownRef}>
          <button
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            className={`px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm flex items-center gap-2 hover:border-[#00C6FF]/50 transition-colors min-w-[100px]`}
          >
            <span className="text-xs">{currentType?.icon}</span>
            <span className="flex-1 text-left truncate">{currentType?.label}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {showTypeDropdown && (
            <div 
              className={`absolute top-full mt-1 left-0 min-w-[180px] ${bgDropdown} border ${borderColor} rounded-lg shadow-xl z-50 py-1 max-h-[300px] overflow-y-auto`}
              style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
            >
              {DATA_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    onUpdate({ dataType: type.value });
                    setShowTypeDropdown(false);
                    // Reset operator if not supported
                    if (!OPERATORS.find(op => op.value === condition.operator)?.supportedTypes.includes(type.value)) {
                      const firstAvailable = OPERATORS.find(op => op.supportedTypes.includes(type.value));
                      if (firstAvailable) {
                        onUpdate({ dataType: type.value, operator: firstAvailable.value });
                      }
                    }
                  }}
                  className={`w-full px-3 py-2 text-left ${hoverBg} ${textPrimary} text-sm flex items-center gap-2 transition-colors`}
                >
                  <span className="text-xs">{type.icon}</span>
                  <span>{type.label}</span>
                  {type.value === condition.dataType && (
                    <span className="ml-auto text-[#00C6FF]">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Remove Button */}
        {canRemove && (
          <button
            onClick={onRemove}
            className={`p-2 rounded-lg border ${borderColor} ${hoverBg} transition-colors`}
            title="Remove condition"
          >
            <X className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>

      {/* Operator Selector */}
      <div className="relative" ref={operatorDropdownRef}>
        <button
          onClick={() => setShowOperatorDropdown(!showOperatorDropdown)}
          className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm flex items-center justify-between hover:border-[#00C6FF]/50 transition-colors`}
        >
          <span className={condition.operator ? textPrimary : textSecondary}>
            {selectedOperatorDef?.label || 'Select operator...'}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {showOperatorDropdown && (
          <div 
            className={`absolute top-full mt-1 left-0 right-0 ${bgDropdown} border ${borderColor} rounded-lg shadow-xl z-50 py-1 max-h-[300px] overflow-y-auto`}
            style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
          >
            {availableOperators.map((op) => (
              <button
                key={op.value}
                onClick={() => {
                  onUpdate({ operator: op.value });
                  setShowOperatorDropdown(false);
                }}
                className={`w-full px-3 py-2 text-left ${hoverBg} ${textPrimary} text-sm transition-colors flex items-center justify-between`}
              >
                <span>{op.label}</span>
                {op.value === condition.operator && (
                  <span className="text-[#00C6FF]">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Operand (if required) */}
      {requiresRightOperand && (
        <div>
          <input
            type="text"
            value={condition.rightOperand}
            onChange={(e) => onUpdate({ rightOperand: e.target.value })}
            placeholder="value2 or {{variable}}"
            className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
          />
        </div>
      )}

      {/* Variable Hint */}
      <div className={`flex items-center gap-2 ${textSecondary} text-xs`}>
        <Variable className="w-3 h-3" />
        <span>Use {'{{'} variable {'}}'} syntax to reference workflow variables</span>
      </div>
    </div>
  );
}
