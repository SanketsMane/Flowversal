/**
 * Execution History Component
 * Phase 4 Part 2 - Workflow Execution Engine
 * 
 * View past executions
 */

import { useState } from 'react';
import { useTheme } from '../../../../components/ThemeContext';
import { useExecution } from '../../stores/executionStore';
import { ExecutionContext, ExecutionStatus } from '../../types/execution.types';
import { Button } from '../../../../components/ui/button';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';

const STATUS_CONFIG: Record<ExecutionStatus, { color: string; icon: React.ReactNode }> = {
  idle: { color: 'text-gray-400', icon: <Clock className="h-4 w-4" /> },
  running: { color: 'text-blue-400', icon: <Clock className="h-4 w-4" /> },
  paused: { color: 'text-yellow-400', icon: <Clock className="h-4 w-4" /> },
  completed: { color: 'text-green-400', icon: <CheckCircle2 className="h-4 w-4" /> },
  failed: { color: 'text-red-400', icon: <XCircle className="h-4 w-4" /> },
  stopped: { color: 'text-orange-400', icon: <XCircle className="h-4 w-4" /> },
};

export function ExecutionHistory() {
  const { theme } = useTheme();
  const { executionHistory, clearHistory } = useExecution();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgHover = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className={`${bgCard} rounded-lg border ${borderColor} flex flex-col h-full`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${borderColor} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <History className={`h-5 w-5 ${textSecondary}`} />
          <h3 className={`${textPrimary} font-medium`}>Execution History</h3>
          {executionHistory.length > 0 && (
            <span className={`${textSecondary} text-sm`}>
              ({executionHistory.length})
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          disabled={executionHistory.length === 0}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* History List */}
      <ScrollArea className="flex-1">
        {executionHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <History className={`h-12 w-12 ${textSecondary} opacity-50 mb-3`} />
            <p className={`${textSecondary} text-sm`}>No execution history</p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {executionHistory.slice().reverse().map((execution) => {
              const isExpanded = expandedId === execution.executionId;
              const config = STATUS_CONFIG[execution.status];

              return (
                <div
                  key={execution.executionId}
                  className={`${bgHover} rounded-lg border ${borderColor} transition-colors`}
                >
                  {/* Summary */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : execution.executionId)}
                    className="w-full px-4 py-3 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={config.color}>
                          {config.icon}
                        </div>
                        <div>
                          <div className={`${textPrimary} font-medium`}>
                            {execution.workflowId}
                          </div>
                          <div className={`${textSecondary} text-xs`}>
                            {formatDate(execution.startTime)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-sm ${config.color} font-medium`}>
                            {execution.status}
                          </div>
                          {execution.duration && (
                            <div className={`text-xs ${textSecondary}`}>
                              {formatDuration(execution.duration)}
                            </div>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className={`h-4 w-4 ${textSecondary}`} />
                        ) : (
                          <ChevronDown className={`h-4 w-4 ${textSecondary}`} />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Details */}
                  {isExpanded && (
                    <div className={`px-4 pb-4 border-t ${borderColor} mt-2 pt-3`}>
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <div className={`${textSecondary} text-xs`}>Steps</div>
                          <div className={`${textPrimary} font-medium`}>
                            {execution.steps.length}
                          </div>
                        </div>
                        <div>
                          <div className={`${textSecondary} text-xs`}>Logs</div>
                          <div className={`${textPrimary} font-medium`}>
                            {execution.logs.length}
                          </div>
                        </div>
                        <div>
                          <div className={`${textSecondary} text-xs`}>Errors</div>
                          <div className={`${textPrimary} font-medium`}>
                            {execution.errors.length}
                          </div>
                        </div>
                      </div>

                      {/* Steps Summary */}
                      <div className="space-y-1">
                        <div className={`${textSecondary} text-xs mb-2`}>Steps:</div>
                        {execution.steps.map((step) => (
                          <div
                            key={step.stepId}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${
                                step.status === 'completed' ? 'bg-green-400' :
                                step.status === 'failed' ? 'bg-red-400' :
                                step.status === 'skipped' ? 'bg-yellow-400' :
                                'bg-gray-400'
                              }`} />
                              <span className={textPrimary}>{step.stepName}</span>
                            </div>
                            {step.duration && (
                              <span className={textSecondary}>
                                {step.duration}ms
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Errors */}
                      {execution.errors.length > 0 && (
                        <div className="mt-3">
                          <div className={`${textSecondary} text-xs mb-2`}>Errors:</div>
                          {execution.errors.map((error, i) => (
                            <div key={i} className="text-sm text-red-400">
                              {error.message}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
