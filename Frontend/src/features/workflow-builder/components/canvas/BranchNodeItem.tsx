/**
 * Branch Node Item Component
 * Displays nodes/tools/triggers within conditional node branches
 */

import { Box, Wrench, Play, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useState } from 'react';

type ExecutionState = 'idle' | 'running' | 'success' | 'error';

interface BranchNodeItemProps {
  branchNode: any;
  branchColor: 'green' | 'red';
  onClick: (e: React.MouseEvent) => void;
}

export function BranchNodeItem({ branchNode, branchColor, onClick }: BranchNodeItemProps) {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [executionState, setExecutionState] = useState<ExecutionState>('idle');

  // Theme colors
  const bgColor = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const hoverBg = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-100';

  const isToolNode = branchNode.category === 'tool';
  const BranchIcon = isToolNode ? Wrench : Box;
  const isDisabled = branchNode.enabled === false;

  // Handle play button click
  const handlePlayClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isDisabled) return;
    
    setExecutionState('running');
    
    // Simulate execution (replace with actual execution logic)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Randomly succeed or fail for demo
    const success = Math.random() > 0.3;
    setExecutionState(success ? 'success' : 'error');
    
    // Reset to idle after showing result
    setTimeout(() => {
      setExecutionState('idle');
    }, 1500);
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex items-center gap-3 p-3 rounded-lg border ${borderColor} ${bgColor} ${hoverBg} transition-all cursor-pointer`}
    >
      {/* Icon - grayed out when disabled */}
      <div 
        className={`w-8 h-8 rounded-lg bg-${branchColor}-500/20 flex items-center justify-center ${
          isDisabled ? 'opacity-30 grayscale' : ''
        }`}
      >
        <BranchIcon className={`w-4 h-4 text-${branchColor}-400`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className={`${isDisabled ? 'text-gray-500' : textPrimary} text-sm truncate`}>
            {branchNode.label}
          </div>
          {isDisabled && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-medium">
              Deactivated
            </span>
          )}
        </div>
        <div className={`${isDisabled ? 'text-gray-600' : textSecondary} text-xs`}>
          {isToolNode ? 'Tool' : 'Node'} • {branchNode.type}
        </div>
      </div>

      {/* Play Button - only show on hover */}
      {isHovered && (
        <button
          onClick={handlePlayClick}
          disabled={executionState === 'running' || isDisabled}
          className={`p-1.5 rounded-lg transition-all ${
            executionState === 'idle' 
              ? 'bg-[#00C6FF]/10 hover:bg-[#00C6FF]/20 text-[#00C6FF]' 
              : executionState === 'running'
              ? 'bg-yellow-500/10 text-yellow-400'
              : executionState === 'success'
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          } ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
          title={executionState === 'idle' ? 'Test execution' : executionState}
        >
          {executionState === 'idle' && <Play className="w-3.5 h-3.5" />}
          {executionState === 'running' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {executionState === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
          {executionState === 'error' && <XCircle className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
}
