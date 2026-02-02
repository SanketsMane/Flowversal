/**
 * Live Execution Indicator
 * Shows currently running executions in real-time
 */

import React, { useEffect, useState } from 'react';
import { Activity, Clock } from 'lucide-react';
import { useExecutionStore } from '@/core/stores/core/executionStore';

export function ExecutionLiveIndicator() {
  const executionStore = useExecutionStore();
  const [runningExecutions, setRunningExecutions] = useState(
    executionStore.getRunningExecutions()
  );

  // Poll for running executions
  useEffect(() => {
    const interval = setInterval(() => {
      setRunningExecutions(executionStore.getRunningExecutions());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (runningExecutions.length === 0) return null;

  return (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Activity className="w-5 h-5 text-blue-400" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold">
            {runningExecutions.length} Workflow{runningExecutions.length > 1 ? 's' : ''} Running
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {runningExecutions.map((exec) => (
              <div
                key={exec.id}
                className="flex items-center gap-2 px-3 py-1 bg-[#1A1A2E] rounded-lg border border-blue-500/30"
              >
                <span className="text-sm text-[#CFCFE8]">{exec.workflowName}</span>
                <span className="text-xs text-blue-400">
                  {exec.stepsExecuted}/{exec.totalSteps} steps
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
