/**
 * Node Item Component
 * Simple node renderer for branch nodes
 */

import { useTheme } from '../../../../components/ThemeContext';
import { WorkflowNode } from '../../types/node.types';
import { Settings } from 'lucide-react';

interface NodeItemProps {
  node: WorkflowNode;
  containerId: string;
  index: number;
}

export function NodeItem({ node, containerId, index }: NodeItemProps) {
  const { theme } = useTheme();

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  const Icon = node.icon;

  return (
    <div className={`${bgCard} border ${borderColor} rounded-lg p-3 min-w-[180px]`}>
      <div className="flex items-center gap-2">
        {Icon && (
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-white" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className={`${textPrimary} text-sm font-medium truncate`}>{node.label}</h4>
          <p className={`${textSecondary} text-xs truncate`}>{node.category}</p>
        </div>
      </div>
    </div>
  );
}
