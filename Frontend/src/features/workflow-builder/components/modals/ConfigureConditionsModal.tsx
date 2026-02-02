import { useState } from 'react';
import { X, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logic?: 'AND' | 'OR';
}

interface ConfigureConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConditions?: Condition[];
  onSave: (conditions: Condition[]) => void;
  theme?: string;
}

export function ConfigureConditionsModal({
  isOpen,
  onClose,
  currentConditions = [],
  onSave,
  theme = 'dark'
}: ConfigureConditionsModalProps) {
  const [conditions, setConditions] = useState<Condition[]>(
    currentConditions.length > 0 
      ? currentConditions 
      : [{
          id: Date.now().toString(),
          field: '',
          operator: 'equals',
          value: '',
          logic: 'AND'
        }]
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const operators = [
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'does not equal' },
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'starts_with', label: 'starts with' },
    { value: 'ends_with', label: 'ends with' },
    { value: 'greater_than', label: 'greater than' },
    { value: 'less_than', label: 'less than' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' },
    { value: 'is_true', label: 'is true' },
    { value: 'is_false', label: 'is false' },
  ];

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        id: Date.now().toString(),
        field: '',
        operator: 'equals',
        value: '',
        logic: 'AND'
      }
    ]);
  };

  const removeCondition = (id: string) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter(c => c.id !== id));
    }
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    setConditions(conditions.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const handleSave = () => {
    onSave(conditions);
    onClose();
  };

  const bgColor = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const inputBg = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-300';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#9CA3AF]' : 'text-gray-500';

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-3xl max-h-[90vh] overflow-hidden ${bgColor} rounded-2xl border-2 border-[#00C6FF]/30 shadow-2xl shadow-[#00C6FF]/20 animate-in zoom-in-95 duration-200`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className={`text-2xl font-bold ${textPrimary} bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] bg-clip-text text-transparent`}>
              Configure Conditions
            </h2>
            <p className={`text-sm ${textSecondary} mt-1`}>
              Define multiple conditions to control your workflow logic
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${textSecondary} hover:text-red-500 hover:bg-red-500/10 transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Conditions List */}
          <div className="space-y-4">
            {conditions.map((condition, index) => (
              <div key={condition.id} className="space-y-3">
                {/* Logic Selector (for conditions after the first) */}
                {index > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-white/10" />
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateCondition(condition.id, { logic: 'AND' })}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          condition.logic === 'AND'
                            ? 'bg-[#00C6FF] text-white'
                            : `${textSecondary} hover:bg-white/5`
                        }`}
                      >
                        AND
                      </button>
                      <button
                        onClick={() => updateCondition(condition.id, { logic: 'OR' })}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          condition.logic === 'OR'
                            ? 'bg-[#9D50BB] text-white'
                            : `${textSecondary} hover:bg-white/5`
                        }`}
                      >
                        OR
                      </button>
                    </div>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                )}

                {/* Condition Row */}
                <div className={`${inputBg} rounded-xl p-4 border ${borderColor}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      {/* Field Input */}
                      <div className="space-y-1.5">
                        <label className={`text-xs ${textSecondary}`}>Field</label>
                        <input
                          type="text"
                          value={condition.field}
                          onChange={(e) => updateCondition(condition.id, { field: e.target.value })}
                          placeholder="e.g., user.email"
                          className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF] focus:ring-1 focus:ring-[#00C6FF]/30`}
                        />
                      </div>

                      {/* Operator Select */}
                      <div className="space-y-1.5">
                        <label className={`text-xs ${textSecondary}`}>Operator</label>
                        <select
                          value={condition.operator}
                          onChange={(e) => updateCondition(condition.id, { operator: e.target.value })}
                          className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]`}
                        >
                          {operators.map(op => (
                            <option key={op.value} value={op.value}>
                              {op.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Value Input */}
                      <div className="space-y-1.5">
                        <label className={`text-xs ${textSecondary}`}>Value</label>
                        <input
                          type="text"
                          value={condition.value}
                          onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                          placeholder="Enter value"
                          disabled={['is_empty', 'is_not_empty', 'is_true', 'is_false'].includes(condition.operator)}
                          className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF] focus:ring-1 focus:ring-[#00C6FF]/30 disabled:opacity-50 disabled:cursor-not-allowed`}
                        />
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => removeCondition(condition.id)}
                      disabled={conditions.length === 1}
                      className={`mt-7 p-2 rounded-lg ${textSecondary} hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Condition Button */}
          <button
            onClick={addCondition}
            className="w-full mt-4 px-4 py-3 rounded-xl border-2 border-dashed border-[#00C6FF]/30 text-[#00C6FF] hover:border-[#00C6FF]/50 hover:bg-[#00C6FF]/5 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Condition</span>
          </button>

          {/* Advanced Options */}
          <div className="mt-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-2 ${textSecondary} hover:text-[#00C6FF] transition-colors text-sm`}
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Advanced Options
            </button>
            
            {showAdvanced && (
              <div className={`mt-3 ${inputBg} rounded-xl p-4 border ${borderColor} space-y-3`}>
                <div className="space-y-2">
                  <label className={`text-xs ${textSecondary}`}>Evaluation Mode</label>
                  <select
                    className={`w-full px-3 py-2 rounded-lg border ${borderColor} ${inputBg} ${textPrimary} text-sm focus:outline-none focus:border-[#00C6FF]`}
                  >
                    <option value="all">All conditions must be true</option>
                    <option value="any">Any condition can be true</option>
                    <option value="custom">Custom logic (AND/OR)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className={`text-xs ${textSecondary}`}>Case Sensitive</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-white/10"
                    />
                    <span className={`text-sm ${textPrimary}`}>
                      Make text comparisons case-sensitive
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className={`mt-6 ${inputBg} rounded-xl p-4 border ${borderColor}`}>
            <div className={`text-xs ${textSecondary} mb-2`}>Condition Preview:</div>
            <div className={`${textPrimary} text-sm font-mono`}>
              {conditions.map((cond, idx) => (
                <span key={cond.id}>
                  {idx > 0 && <span className="text-[#9D50BB]"> {cond.logic} </span>}
                  <span className="text-[#00C6FF]">{cond.field || 'field'}</span>
                  {' '}
                  <span className={textSecondary}>{cond.operator.replace(/_/g, ' ')}</span>
                  {!['is_empty', 'is_not_empty', 'is_true', 'is_false'].includes(cond.operator) && (
                    <span> <span className="text-green-400">"{cond.value || 'value'}"</span></span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/10 hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] hover:from-[#00B8E6] hover:to-[#8D40AB] text-white border-0"
          >
            Save Conditions
          </Button>
        </div>
      </div>
    </div>
  );
}