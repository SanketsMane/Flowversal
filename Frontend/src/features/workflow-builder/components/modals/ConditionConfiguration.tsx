/**
 * Condition Configuration Component
 * Used for IF and SWITCH nodes - cleaner design matching screenshot 2
 */

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { ConditionGroupModal } from './ConditionGroupModal';

interface Condition {
  id: string;
  value1: string;
  value1Type: string;
  operator: string;
  value2: string;
  value2Type: string;
  logic?: 'AND' | 'OR'; // Logic connector to next condition
}

interface ConditionConfigurationProps {
  conditions: Condition[];
  setConditions: (conditions: Condition[]) => void;
  convertTypes: boolean;
  setConvertTypes: (value: boolean) => void;
  theme: string;
}

export function ConditionConfiguration({
  conditions,
  setConditions,
  convertTypes,
  setConvertTypes,
  theme
}: ConditionConfigurationProps) {
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgSecondary = theme === 'dark' ? 'bg-[#13131F]' : 'bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';

  const handleDrop = (
    e: React.DragEvent,
    index: number,
    field: 'value1' | 'value2'
  ) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const variableRef = `{{${data.nodeName ? data.nodeName + '.' : ''}${data.fieldName}}}`;
      const newConditions = [...conditions];
      newConditions[index] = {
        ...newConditions[index],
        [field]: newConditions[index][field] + variableRef
      };
      setConditions(newConditions);
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }
  };

  const [showConditionGroupModal, setShowConditionGroupModal] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className={`${textPrimary} text-lg font-medium`}>Configure Conditions</h3>
        <p className={`${textSecondary} text-sm mt-1`}>Set up the conditions for your logic</p>
      </div>

      {/* Conditions List */}
      <div className="space-y-4">
        {conditions.map((condition, index) => (
          <React.Fragment key={condition.id}>
            <div className={`${bgSecondary} rounded-xl p-6 border ${borderColor} space-y-4`}>
              {/* Value1 with Type */}
              <div className="grid grid-cols-[1fr,auto] gap-3">
                <input
                  type="text"
                  value={condition.value1}
                  onChange={(e) => {
                    const newConditions = [...conditions];
                    newConditions[index] = { ...newConditions[index], value1: e.target.value };
                    setConditions(newConditions);
                  }}
                  onDrop={(e) => handleDrop(e, index, 'value1')}
                  onDragOver={(e) => e.preventDefault()}
                  placeholder="value1 or {{variable}}"
                  className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm placeholder:${textMuted} focus:outline-none focus:border-[#00C6FF] focus:ring-1 focus:ring-[#00C6FF]/30`}
                />
                <select
                  value={condition.value1Type}
                  onChange={(e) => {
                    const newConditions = [...conditions];
                    newConditions[index] = { ...newConditions[index], value1Type: e.target.value };
                    setConditions(newConditions);
                  }}
                  className={`px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#00C6FF] min-w-[140px]`}
                >
                  <option value="String">T String</option>
                  <option value="Number">№ Number</option>
                  <option value="Boolean">⊤ Boolean</option>
                  <option value="Date">📅 Date</option>
                  <option value="Array">[] Array</option>
                  <option value="Object">{'{}'} Object</option>
                </select>
              </div>

              {/* Operator */}
              <select
                value={condition.operator}
                onChange={(e) => {
                  const newConditions = [...conditions];
                  newConditions[index] = { ...newConditions[index], operator: e.target.value };
                  setConditions(newConditions);
                }}
                className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#00C6FF]`}
              >
                <option value="is_equal_to">is equal to</option>
                <option value="is_not_equal_to">is not equal to</option>
                <option value="contains">contains</option>
                <option value="does_not_contain">does not contain</option>
                <option value="starts_with">starts with</option>
                <option value="ends_with">ends with</option>
                <option value="is_greater_than">is greater than</option>
                <option value="is_less_than">is less than</option>
                <option value="is_empty">is empty</option>
                <option value="is_not_empty">is not empty</option>
              </select>

              {/* Value2 (only if operator requires it) */}
              {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
                <input
                  type="text"
                  value={condition.value2}
                  onChange={(e) => {
                    const newConditions = [...conditions];
                    newConditions[index] = { ...newConditions[index], value2: e.target.value };
                    setConditions(newConditions);
                  }}
                  onDrop={(e) => handleDrop(e, index, 'value2')}
                  onDragOver={(e) => e.preventDefault()}
                  placeholder="value2 or {{variable}}"
                  className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm placeholder:${textMuted} focus:outline-none focus:border-[#00C6FF] focus:ring-1 focus:ring-[#00C6FF]/30`}
                />
              )}

              {/* Delete condition button */}
              {conditions.length > 1 && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setConditions(conditions.filter(c => c.id !== condition.id));
                    }}
                    className={`px-3 py-1.5 rounded-lg ${textSecondary} hover:text-red-500 hover:bg-red-500/10 transition-colors text-sm flex items-center gap-1`}
                  >
                    <X className="w-4 h-4" />
                    Remove condition
                  </button>
                </div>
              )}
            </div>

            {/* AND/OR Toggle between conditions */}
            {index < conditions.length - 1 && (
              <div className="flex items-center justify-center gap-3 -my-2">
                <div className={`flex-1 h-px ${borderColor}`} />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const newConditions = [...conditions];
                      newConditions[index] = { ...newConditions[index], logic: 'AND' };
                      setConditions(newConditions);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      (condition.logic || 'AND') === 'AND'
                        ? 'bg-[#00C6FF] text-white shadow-lg shadow-[#00C6FF]/30'
                        : `${bgSecondary} ${textSecondary} hover:bg-[#00C6FF]/10 hover:text-[#00C6FF]`
                    }`}
                  >
                    AND
                  </button>
                  <button
                    onClick={() => {
                      const newConditions = [...conditions];
                      newConditions[index] = { ...newConditions[index], logic: 'OR' };
                      setConditions(newConditions);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      condition.logic === 'OR'
                        ? 'bg-[#9D50BB] text-white shadow-lg shadow-[#9D50BB]/30'
                        : `${bgSecondary} ${textSecondary} hover:bg-[#9D50BB]/10 hover:text-[#9D50BB]`
                    }`}
                  >
                    OR
                  </button>
                </div>
                <div className={`flex-1 h-px ${borderColor}`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Help text */}
      <div className="flex items-start gap-2">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${bgSecondary} flex-shrink-0`}>
          <X className={`w-3 h-3 ${textMuted}`} />
        </div>
        <p className={`${textSecondary} text-sm`}>
          Use <code className={`px-1.5 py-0.5 ${bgSecondary} rounded text-xs font-mono ${textPrimary}`}>{'{{'} variable {'}}'}</code> syntax to reference workflow variables
        </p>
      </div>

      {/* Add Condition Button */}
      <button
        onClick={() => {
          setConditions([
            ...conditions,
            {
              id: Date.now().toString(),
              value1: '',
              value1Type: 'String',
              operator: 'is_equal_to',
              value2: '',
              value2Type: 'String',
            }
          ]);
        }}
        className={`w-full px-4 py-3 rounded-xl border-2 border-dashed ${borderColor} ${textSecondary} hover:border-[#00C6FF]/50 hover:text-[#00C6FF] hover:bg-[#00C6FF]/5 transition-all flex items-center justify-center gap-2`}
      >
        <Plus className="w-5 h-5" />
        <span className="text-sm font-medium">Add Condition</span>
      </button>

      {/* Add Condition Group (OR) Button */}
      <button
        onClick={() => {
          setShowConditionGroupModal(true);
        }}
        className={`w-full px-4 py-3 rounded-xl border-2 border-dashed ${borderColor} ${textSecondary} hover:border-[#9D50BB]/50 hover:text-[#9D50BB] hover:bg-[#9D50BB]/5 transition-all flex items-center justify-center gap-2`}
      >
        <Plus className="w-5 h-5" />
        <span className="text-sm font-medium">Add Condition Group (OR)</span>
      </button>

      {/* Convert types toggle */}
      <div className={`${bgSecondary} rounded-xl p-4 border ${borderColor}`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className={`${textPrimary} text-sm font-medium`}>Convert types where required</h4>
            <p className={`${textSecondary} text-xs mt-1`}>Automatically convert data types when comparing values</p>
          </div>
          <button
            onClick={() => setConvertTypes(!convertTypes)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
              convertTypes ? 'bg-[#00C6FF]' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                convertTypes ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Condition Summary */}
      {conditions.length > 0 && conditions[0].value1 && (
        <div className={`${bgSecondary} rounded-xl p-4 border ${borderColor}`}>
          <div className={`text-sm ${textSecondary} mb-2`}>Condition Summary:</div>
          <div className={`${textPrimary} text-sm font-mono leading-relaxed`}>
            (
            {conditions.map((cond, idx) => (
              <span key={cond.id}>
                {idx > 0 && (
                  <span className={cond.logic === 'OR' ? 'text-[#9D50BB]' : 'text-[#00C6FF]'}>
                    {' '}{conditions[idx - 1].logic || 'AND'}{' '}
                  </span>
                )}
                <span className="text-[#00C6FF]">{cond.value1 || 'value1'}</span>
                {' '}
                <span className={textSecondary}>{cond.operator.replace(/_/g, ' ')}</span>
                {!['is_empty', 'is_not_empty'].includes(cond.operator) && (
                  <span> <span className="text-[#9D50BB]">{cond.value2 || 'value2'}</span></span>
                )}
              </span>
            ))}
            )
          </div>
        </div>
      )}

      {/* Condition Group Modal */}
      {showConditionGroupModal && (
        <ConditionGroupModal
          onClose={() => setShowConditionGroupModal(false)}
          onAddGroup={(newConditions) => {
            setConditions(newConditions);
            setShowConditionGroupModal(false);
          }}
        />
      )}
    </div>
  );
}