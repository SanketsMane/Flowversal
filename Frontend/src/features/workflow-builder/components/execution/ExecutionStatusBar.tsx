/**
 * Execution Status Bar Component
 * Phase 4 Part 2 - Workflow Execution Engine
 * 
 * Visual status bar showing execution progress
 */

import { useTheme } from '../../../../components/ThemeContext';
import { useExecution } from '../../stores/executionStore';
import { ExecutionStepStatus } from '../../types/execution.types';
import { CheckCircle2, XCircle, Clock, Loader2, PlayCircle, Circle } from 'lucide-react';

const STATUS_ICONS = {
  pending: <Circle className="h-4 w-4" />,
  running: <Loader2 className="h-4 w-4 animate-spin" />,
  completed: <CheckCircle2 className="h-4 w-4" />,
  failed: <XCircle className="h-4 w-4" />,
  skipped: <Circle className="h-4 w-4" />,
};

const STATUS_COLORS = {
  pending: 'text-gray-400',
  running: 'text-blue-400',
  completed: 'text-green-400',
  failed: 'text-red-400',
  skipped: 'text-yellow-400',
};

export function ExecutionStatusBar() {
  const { theme } = useTheme();
  const { currentExecution, isExecuting } = useExecution();

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  if (!currentExecution) {
    return (
      <div className={`${bgCard} rounded-lg border ${borderColor} p-4`}>
        <div className={`${textSecondary} text-center text-sm`}>
          No execution in progress
        </div>
      </div>
    );
  }

  const steps = currentExecution.steps;
  const totalSteps = steps.length;
  const completedSteps = steps.filter((s) => s.status === 'completed').length;
  const failedSteps = steps.filter((s) => s.status === 'failed').length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className={`${bgCard} rounded-lg border ${borderColor} p-4`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PlayCircle className={`h-5 w-5 ${
            isExecuting ? 'text-blue-400 animate-pulse' : textSecondary
          }`} />
          <h3 className={`${textPrimary} font-medium`}>
            Execution Progress
          </h3>
        </div>
        <div className={`${textSecondary} text-sm`}>
          {completedSteps} / {totalSteps} steps
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className={`h-2 rounded-full ${borderColor} border overflow-hidden bg-gray-800`}>
          <div
            className="h-full bg-gradient-to-r from-[#00C6FF] to-[#0072FF] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className={textSecondary}>
            {progress.toFixed(0)}% complete
          </span>
          {currentExecution.duration && (
            <span className={textSecondary}>
              {(currentExecution.duration / 1000).toFixed(2)}s
            </span>
          )}
        </div>
      </div>

      {/* Step Summary */}
      {steps.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Completed */}
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <div>
              <div className={`text-xs ${textSecondary}`}>Completed</div>
              <div className={`text-lg font-semibold ${textPrimary}`}>
                {completedSteps}
              </div>
            </div>
          </div>

          {/* Failed */}
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-400" />
            <div>
              <div className={`text-xs ${textSecondary}`}>Failed</div>
              <div className={`text-lg font-semibold ${textPrimary}`}>
                {failedSteps}
              </div>
            </div>
          </div>

          {/* Running */}
          <div className="flex items-center gap-2">
            <Loader2 className={`h-4 w-4 text-blue-400 ${
              isExecuting ? 'animate-spin' : ''
            }`} />
            <div>
              <div className={`text-xs ${textSecondary}`}>Running</div>
              <div className={`text-lg font-semibold ${textPrimary}`}>
                {steps.filter((s) => s.status === 'running').length}
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <div>
              <div className={`text-xs ${textSecondary}`}>Pending</div>
              <div className={`text-lg font-semibold ${textPrimary}`}>
                {steps.filter((s) => s.status === 'pending').length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Steps */}
      {steps.length > 0 && (
        <div className={`mt-4 pt-4 border-t ${borderColor}`}>
          <div className={`${textSecondary} text-xs mb-2`}>Recent Steps:</div>
          <div className="space-y-1">
            {steps.slice(-3).map((step) => (
              <div 
                key={step.stepId}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className={STATUS_COLORS[step.status]}>
                    {STATUS_ICONS[step.status]}
                  </div>
                  <span className={textPrimary}>
                    {step.stepName}
                  </span>
                </div>
                {step.duration && (
                  <span className={textSecondary}>
                    {step.duration}ms
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
