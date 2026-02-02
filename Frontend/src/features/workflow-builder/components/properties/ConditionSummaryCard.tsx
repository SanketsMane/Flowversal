/**
 * Condition Summary Card Component
 * Visual summary of conditional logic at a glance
 */

import { AlertCircle, CheckCircle2, GitBranch, XCircle, Zap } from 'lucide-react';
import { useTheme } from '../../../../components/ThemeContext';
import { ConditionGroup, OPERATORS } from '../../types';

interface ConditionSummaryCardProps {
  conditionGroups: ConditionGroup[];
  trueNodeCount: number;
  falseNodeCount: number;
}

export function ConditionSummaryCard({ 
  conditionGroups, 
  trueNodeCount, 
  falseNodeCount 
}: ConditionSummaryCardProps) {
  const { theme } = useTheme();

  const bgColor = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  // Check if conditions are configured
  const hasConditions = conditionGroups.length > 0 && 
    conditionGroups.some(g => g.conditions.length > 0 && g.conditions[0].leftOperand);

  // Count total conditions
  const totalConditions = conditionGroups.reduce((sum, group) => sum + group.conditions.length, 0);

  // Generate readable summary
  const getSummary = () => {
    if (!hasConditions) {
      return 'No conditions configured';
    }

    const firstGroup = conditionGroups[0];
    const firstCondition = firstGroup.conditions[0];
    const operator = OPERATORS.find(op => op.value === firstCondition.operator);

    let summary = `${firstCondition.leftOperand || 'value'}`;
    if (operator) {
      summary += ` ${operator.label}`;
      if (operator.requiresRightOperand) {
        summary += ` ${firstCondition.rightOperand || 'value'}`;
      }
    }

    if (totalConditions > 1) {
      summary += ` (+${totalConditions - 1} more)`;
    }

    return summary;
  };

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4 space-y-4`}>
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${hasConditions ? 'text-[#FFB75E]' : 'text-gray-500'}`} />
          <span className={`${textPrimary} text-sm font-medium`}>
            Condition Status
          </span>
        </div>
        {hasConditions ? (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
            <CheckCircle2 className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400 font-medium">Active</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
            <AlertCircle className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium">Not Set</span>
          </div>
        )}
      </div>

      {/* Condition Summary */}
      <div className={`p-3 rounded-lg border ${borderColor} bg-[#0E0E1F]/50`}>
        <p className={`${textSecondary} text-xs mb-1`}>Condition:</p>
        <p className={`${textPrimary} text-sm font-mono`}>
          {getSummary()}
        </p>
      </div>

      {/* Branch Statistics */}
      <div className="grid grid-cols-2 gap-3">
        {/* True Branch */}
        <div className={`p-3 rounded-lg border border-green-500/30 bg-green-500/10`}>
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400 font-medium">TRUE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-400">{trueNodeCount}</span>
            <span className={`${textSecondary} text-xs`}>
              node{trueNodeCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* False Branch */}
        <div className={`p-3 rounded-lg border border-red-500/30 bg-red-500/10`}>
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="w-3 h-3 text-red-400" />
            <span className="text-xs text-red-400 font-medium">FALSE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-red-400">{falseNodeCount}</span>
            <span className={`${textSecondary} text-xs`}>
              node{falseNodeCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {hasConditions && (
        <div className="flex items-center justify-between pt-3 border-t border-[#2A2A3E]">
          <div className="flex items-center gap-4">
            <div>
              <p className={`${textSecondary} text-xs`}>Groups</p>
              <p className={`${textPrimary} text-sm font-medium`}>{conditionGroups.length}</p>
            </div>
            <div>
              <p className={`${textSecondary} text-xs`}>Conditions</p>
              <p className={`${textPrimary} text-sm font-medium`}>{totalConditions}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`${textSecondary} text-xs`}>Total Nodes</p>
            <p className={`${textPrimary} text-sm font-medium`}>
              {trueNodeCount + falseNodeCount}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
