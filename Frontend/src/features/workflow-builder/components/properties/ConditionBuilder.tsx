/**
 * Condition Builder Component
 * Intuitive UI for building complex conditional logic
 */

import { Plus, Trash2, X } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { ConditionGroup, LogicalOperator } from '../../types';
import { ConditionRow } from './ConditionRow';
import { Switch } from '@/shared/components/ui/switch';
import { Button } from '@/shared/components/ui/button';

interface ConditionBuilderProps {
  conditionGroups: ConditionGroup[];
  onUpdate: (groups: ConditionGroup[]) => void;
  convertTypes?: boolean;
  onConvertTypesChange?: (value: boolean) => void;
  onClose?: () => void;
}

export function ConditionBuilder({ 
  conditionGroups, 
  onUpdate,
  convertTypes = false,
  onConvertTypesChange,
  onClose
}: ConditionBuilderProps) {
  const { theme } = useTheme();

  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';

  // Initialize with one group if empty
  if (conditionGroups.length === 0) {
    const newGroup: ConditionGroup = {
      id: `group-${Date.now()}`,
      conditions: [{
        id: `cond-${Date.now()}`,
        leftOperand: '',
        operator: 'equals',
        rightOperand: '',
        dataType: 'string'
      }],
      logicalOperator: 'AND',
      convertTypes: convertTypes
    };
    onUpdate([newGroup]);
    return null;
  }

  const handleAddCondition = (groupIndex: number) => {
    const newGroups = [...conditionGroups];
    newGroups[groupIndex].conditions.push({
      id: `cond-${Date.now()}-${Math.random()}`,
      leftOperand: '',
      operator: 'equals',
      rightOperand: '',
      dataType: 'string'
    });
    onUpdate(newGroups);
  };

  const handleUpdateCondition = (groupIndex: number, conditionIndex: number, updates: any) => {
    const newGroups = [...conditionGroups];
    newGroups[groupIndex].conditions[conditionIndex] = {
      ...newGroups[groupIndex].conditions[conditionIndex],
      ...updates
    };
    onUpdate(newGroups);
  };

  const handleRemoveCondition = (groupIndex: number, conditionIndex: number) => {
    const newGroups = [...conditionGroups];
    newGroups[groupIndex].conditions.splice(conditionIndex, 1);
    
    // Remove group if no conditions left
    if (newGroups[groupIndex].conditions.length === 0) {
      newGroups.splice(groupIndex, 1);
    }
    
    onUpdate(newGroups.length > 0 ? newGroups : [{
      id: `group-${Date.now()}`,
      conditions: [{
        id: `cond-${Date.now()}`,
        leftOperand: '',
        operator: 'equals',
        rightOperand: '',
        dataType: 'string'
      }],
      logicalOperator: 'AND',
      convertTypes: convertTypes
    }]);
  };

  const handleToggleLogicalOperator = (groupIndex: number) => {
    const newGroups = [...conditionGroups];
    newGroups[groupIndex].logicalOperator = 
      newGroups[groupIndex].logicalOperator === 'AND' ? 'OR' : 'AND';
    onUpdate(newGroups);
  };

  const handleAddGroup = () => {
    const newGroup: ConditionGroup = {
      id: `group-${Date.now()}`,
      conditions: [{
        id: `cond-${Date.now()}`,
        leftOperand: '',
        operator: 'equals',
        rightOperand: '',
        dataType: 'string'
      }],
      logicalOperator: 'AND',
      convertTypes: convertTypes
    };
    onUpdate([...conditionGroups, newGroup]);
  };

  const handleRemoveGroup = (groupIndex: number) => {
    const newGroups = conditionGroups.filter((_, i) => i !== groupIndex);
    onUpdate(newGroups.length > 0 ? newGroups : [{
      id: `group-${Date.now()}`,
      conditions: [{
        id: `cond-${Date.now()}`,
        leftOperand: '',
        operator: 'equals',
        rightOperand: '',
        dataType: 'string'
      }],
      logicalOperator: 'AND',
      convertTypes: convertTypes
    }]);
  };

  return (
    <div 
      className={`${bgCard} border ${borderColor} rounded-xl p-6 max-w-3xl w-full mx-4`}
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        maxHeight: '90vh',
        overflow: 'auto',
      }}
    >
      {/* Header */}
      {onClose && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`${textPrimary} text-xl font-semibold`}>Configure Conditions</h3>
            <p className={`${textSecondary} text-sm mt-1`}>Set up the conditions for your logic</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="hover:bg-[#00C6FF]/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      
      <div className="space-y-4">
        {/* Condition Groups */}
        {conditionGroups.map((group, groupIndex) => (
          <div key={group.id}>
            {/* Group Container */}
            <div className={`p-4 rounded-lg border ${borderColor} ${bgCard} space-y-4`}>
              {/* Group Header */}
              {conditionGroups.length > 1 && (
                <div className="flex items-center justify-between mb-2">
                  <span className={`${textSecondary} text-xs`}>
                    Condition Group {groupIndex + 1}
                  </span>
                  <button
                    onClick={() => handleRemoveGroup(groupIndex)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="Remove group"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Conditions */}
              {group.conditions.map((condition, condIndex) => (
                <div key={condition.id}>
                  {condIndex > 0 && (
                    <div className="flex items-center justify-center my-3">
                      <button
                        onClick={() => handleToggleLogicalOperator(groupIndex)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                          group.logicalOperator === 'AND'
                            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'
                            : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30'
                        }`}
                      >
                        {group.logicalOperator}
                      </button>
                    </div>
                  )}
                  
                  <ConditionRow
                    condition={condition}
                    onUpdate={(updates) => handleUpdateCondition(groupIndex, condIndex, updates)}
                    onRemove={() => handleRemoveCondition(groupIndex, condIndex)}
                    canRemove={group.conditions.length > 1 || conditionGroups.length > 1}
                  />
                </div>
              ))}

              {/* Add Condition Button */}
              <button
                onClick={() => handleAddCondition(groupIndex)}
                className={`w-full border-2 border-dashed ${borderColor} rounded-lg p-3 text-sm ${textSecondary} hover:border-[#00C6FF]/50 hover:text-[#00C6FF] transition-all flex items-center justify-center gap-2`}
              >
                <Plus className="w-4 h-4" />
                Add Condition
              </button>
            </div>

            {/* Group Separator */}
            {groupIndex < conditionGroups.length - 1 && (
              <div className="flex items-center justify-center my-4">
                <div className={`px-4 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30`}>
                  OR
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add Group Button */}
        <button
          onClick={handleAddGroup}
          className={`w-full border-2 border-dashed ${borderColor} rounded-lg p-3 text-sm ${textSecondary} hover:border-purple-500/50 hover:text-purple-400 transition-all flex items-center justify-center gap-2`}
        >
          <Plus className="w-4 h-4" />
          Add Condition Group (OR)
        </button>

        {/* Convert Types Toggle */}
        {onConvertTypesChange && (
          <div className={`p-4 rounded-lg border ${borderColor} ${bgCard}`}>
            <div className="flex items-center justify-between">
              <div>
                <label className={`${textPrimary} text-sm block`}>
                  Convert types where required
                </label>
                <p className={`${textSecondary} text-xs mt-0.5`}>
                  Automatically convert data types when comparing values
                </p>
              </div>
              <Switch
                checked={convertTypes}
                onCheckedChange={onConvertTypesChange}
              />
            </div>
          </div>
        )}

        {/* Condition Summary */}
        <div className={`p-3 rounded-lg ${bgInput} border ${borderColor}`}>
          <div className={`${textSecondary} text-xs mb-1`}>Condition Summary:</div>
          <div className={`${textPrimary} text-xs font-mono`}>
            {conditionGroups.map((group, gIdx) => (
              <div key={group.id}>
                {gIdx > 0 && <span className="text-purple-400"> OR </span>}
                <span className="text-gray-500">(</span>
                {group.conditions.map((cond, cIdx) => (
                  <span key={cond.id}>
                    {cIdx > 0 && (
                      <span className={group.logicalOperator === 'AND' ? 'text-blue-400' : 'text-purple-400'}>
                        {' '}{group.logicalOperator}{' '}
                      </span>
                    )}
                    <span className="text-[#00C6FF]">{cond.leftOperand || 'value1'}</span>
                    {' '}<span className="text-gray-400">{OPERATORS.find(op => op.value === cond.operator)?.label || 'equals'}</span>{' '}
                    {OPERATORS.find(op => op.value === cond.operator)?.requiresRightOperand && (
                      <span className="text-[#9D50BB]">{cond.rightOperand || 'value2'}</span>
                    )}
                  </span>
                ))}
                <span className="text-gray-500">)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Import OPERATORS for summary
import { OPERATORS } from '../../types';