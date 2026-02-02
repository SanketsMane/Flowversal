/**
 * Branch Flow Card Component
 * Visual representation of branch nodes within conditional logic
 */

import { Box, Wrench, ChevronRight, CircleDot } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { ConditionalNode } from '../../types';

interface BranchFlowCardProps {
  node: ConditionalNode;
  branchType: 'true' | 'false';
  index: number;
}

export function BranchFlowCard({ node, branchType, index }: BranchFlowCardProps) {
  const { theme } = useTheme();

  const bgColor = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  
  const isToolNode = node.category === 'tool';
  const Icon = isToolNode ? Wrench : Box;
  
  // Branch-specific colors
  const branchColor = branchType === 'true' ? {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    icon: 'text-green-400',
    dot: 'bg-green-400'
  } : {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: 'text-red-400',
    dot: 'bg-red-400'
  };

  return (
    <div className="relative pl-8">
      {/* Vertical line connector */}
      <div 
        className={`absolute left-3 top-0 bottom-0 w-0.5 ${
          branchType === 'true' ? 'bg-green-500/30' : 'bg-red-500/30'
        }`}
      />
      
      {/* Connection dot */}
      <div 
        className={`absolute left-[8px] top-4 w-2 h-2 rounded-full ${branchColor.dot}`}
      />

      {/* Card */}
      <div
        className={`${bgColor} border ${branchColor.border} rounded-lg p-3 transition-all hover:${branchColor.bg} group cursor-pointer`}
        data-connection-id={`branch-node-${branchType}-${index}`}
        data-connection-type="branch-node"
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className={`w-8 h-8 rounded-lg ${branchColor.bg} flex items-center justify-center flex-shrink-0 border ${branchColor.border}`}>
            <Icon className={`w-4 h-4 ${branchColor.icon}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`${textPrimary} text-sm font-medium truncate`}>
              {node.label}
            </p>
            <p className={`${textSecondary} text-xs truncate`}>
              {isToolNode ? 'Tool' : 'Node'} • {node.type || 'Action'}
            </p>
          </div>

          {/* Status indicator */}
          {node.enabled === false && (
            <div className={`${textSecondary} text-xs px-2 py-0.5 rounded-full ${bgColor} border ${borderColor}`}>
              Disabled
            </div>
          )}

          {/* Arrow indicator */}
          <ChevronRight className={`w-4 h-4 ${textSecondary} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </div>
      </div>
    </div>
  );
}
