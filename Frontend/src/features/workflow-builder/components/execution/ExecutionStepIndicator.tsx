/**
 * Execution Step Indicator Component
 * Phase 4 Part 2 - Workflow Execution Engine
 * 
 * Visual indicator overlay for executing steps
 */

import { useTheme } from '../../../../components/ThemeContext';
import { ExecutionStepStatus } from '../../types/execution.types';
import { CheckCircle2, XCircle, Loader2, Circle, SkipForward } from 'lucide-react';

interface ExecutionStepIndicatorProps {
  status: ExecutionStepStatus;
  duration?: number;
  error?: Error;
  compact?: boolean;
}

const STATUS_CONFIG = {
  pending: {
    icon: Circle,
    color: 'text-gray-400',
    bg: 'bg-gray-400/10',
    border: 'border-gray-400/30',
    label: 'Pending',
  },
  running: {
    icon: Loader2,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/50',
    label: 'Running',
    animate: 'animate-spin',
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/50',
    label: 'Completed',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/50',
    label: 'Failed',
  },
  skipped: {
    icon: SkipForward,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/50',
    label: 'Skipped',
  },
};

export function ExecutionStepIndicator({ 
  status, 
  duration,
  error,
  compact = false,
}: ExecutionStepIndicatorProps) {
  const { theme } = useTheme();
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';

  if (compact) {
    return (
      <div className={`absolute top-2 right-2 ${config.bg} ${config.border} border rounded-full p-1.5`}>
        <Icon className={`h-3 w-3 ${config.color} ${config.animate || ''}`} />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className={`${bgCard} ${config.border} border-2 rounded-lg p-4 shadow-2xl pointer-events-auto max-w-xs`}>
        <div className="flex items-center gap-3">
          <div className={`${config.bg} ${config.border} border rounded-full p-2`}>
            <Icon className={`h-6 w-6 ${config.color} ${config.animate || ''}`} />
          </div>
          
          <div className="flex-1">
            <div className={`${textPrimary} font-medium`}>
              {config.label}
            </div>
            {duration && status === 'completed' && (
              <div className="text-sm text-gray-400">
                {duration}ms
              </div>
            )}
            {error && status === 'failed' && (
              <div className="text-sm text-red-400 mt-1">
                {error.message}
              </div>
            )}
          </div>
        </div>

        {/* Progress bar for running */}
        {status === 'running' && (
          <div className="mt-3">
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#00C6FF] to-[#0072FF] animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
