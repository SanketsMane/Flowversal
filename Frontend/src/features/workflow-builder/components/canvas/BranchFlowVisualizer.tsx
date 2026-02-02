/**
 * Branch Flow Visualizer Component
 * Shows the workflow structure with branching logic
 */

import { GitBranch, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { WorkflowNode } from '../../types';

interface BranchFlowVisualizerProps {
  node: WorkflowNode;
  expanded?: boolean;
}

export function BranchFlowVisualizer({ node, expanded = true }: BranchFlowVisualizerProps) {
  const { theme } = useTheme();

  const bgColor = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  const trueNodes = node.config.trueNodes || [];
  const falseNodes = node.config.falseNodes || [];
  const hasConditions = node.config.conditionGroups && node.config.conditionGroups.length > 0;

  if (!expanded) {
    return null;
  }

  return (
    <div className={`mt-4 p-4 ${bgColor} border ${borderColor} rounded-lg`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-4 h-4 text-[#FFB75E]" />
        <span className={`${textPrimary} text-sm font-medium`}>Flow Structure</span>
      </div>

      {/* Condition Status */}
      {!hasConditions && (
        <div className={`${textSecondary} text-xs p-3 rounded-lg border ${borderColor} mb-4 text-center`}>
          ⚠️ No conditions configured. Configure in properties panel →
        </div>
      )}

      {/* Branch Visualization */}
      <div className="relative">
        {/* Main flow line */}
        <div className="flex items-start gap-4">
          {/* True Branch */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-xs font-medium text-green-400">TRUE PATH</span>
              <span className={`${textSecondary} text-xs`}>({trueNodes.length})</span>
            </div>
            
            <div className="space-y-2 pl-6 border-l-2 border-green-500/30">
              {trueNodes.length === 0 ? (
                <div className={`${textSecondary} text-xs py-2 italic`}>
                  No nodes added
                </div>
              ) : (
                trueNodes.map((branchNode: any, idx: number) => (
                  <div 
                    key={idx}
                    className={`text-xs p-2 rounded ${bgColor} border ${borderColor}`}
                  >
                    <div className={`${textPrimary} font-medium`}>{branchNode.label}</div>
                    <div className={`${textSecondary} text-[10px] mt-0.5`}>
                      {branchNode.category} • {branchNode.type}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* False Branch */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs font-medium text-red-400">FALSE PATH</span>
              <span className={`${textSecondary} text-xs`}>({falseNodes.length})</span>
            </div>
            
            <div className="space-y-2 pl-6 border-l-2 border-red-500/30">
              {falseNodes.length === 0 ? (
                <div className={`${textSecondary} text-xs py-2 italic`}>
                  No nodes added
                </div>
              ) : (
                falseNodes.map((branchNode: any, idx: number) => (
                  <div 
                    key={idx}
                    className={`text-xs p-2 rounded ${bgColor} border ${borderColor}`}
                  >
                    <div className={`${textPrimary} font-medium`}>{branchNode.label}</div>
                    <div className={`${textSecondary} text-[10px] mt-0.5`}>
                      {branchNode.category} • {branchNode.type}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Merge indicator (if both branches exist) */}
        {trueNodes.length > 0 && falseNodes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-dashed border-[#2A2A3E] flex items-center justify-center gap-2">
            <ArrowRight className={`w-3 h-3 ${textSecondary}`} />
            <span className={`${textSecondary} text-xs`}>Paths merge and continue</span>
          </div>
        )}
      </div>
    </div>
  );
}
