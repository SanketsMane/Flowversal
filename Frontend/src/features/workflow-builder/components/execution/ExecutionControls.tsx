/**
 * Execution Controls Component
 * Phase 4 Part 2 - Workflow Execution Engine
 * 
 * Play, Pause, Stop, Step controls
 */

import { useTheme } from '@/core/theme/ThemeContext';
import {
    Gauge,
    Pause,
    Play,
    RotateCcw,
    Settings,
    Square,
    StepForward
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Switch } from '../../../../components/ui/switch';
import { useExecution } from '../../stores/executionStore';

interface ExecutionControlsProps {
  onStart?: () => void;
  onConfigChange?: () => void;
  onStepMode?: (enabled: boolean) => void;
  onStepForward?: () => void;
  onSpeedChange?: (speed: number) => void;
}

export type ExecutionMode = 'normal' | 'step-by-step';
export type ExecutionSpeed = 0.25 | 0.5 | 1 | 2 | 4;

export function ExecutionControls({ 
  onStart,
  onConfigChange,
  onStepMode,
  onStepForward,
  onSpeedChange,
}: ExecutionControlsProps) {
  const { theme } = useTheme();
  const { 
    currentExecution, 
    isExecuting, 
    isPaused,
    pauseExecution,
    resumeExecution,
    stopExecution,
  } = useExecution();

  const [executionMode, setExecutionMode] = useState<ExecutionMode>('normal');
  const [executionSpeed, setExecutionSpeed] = useState<ExecutionSpeed>(1);
  const [showSpeedControl, setShowSpeedControl] = useState(false);

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  const canStart = !isExecuting;
  const canPause = isExecuting && !isPaused && executionMode !== 'step-by-step';
  const canResume = isExecuting && isPaused;
  const canStop = isExecuting;
  const canStep = isExecuting && (isPaused || executionMode === 'step-by-step');

  const handleStepModeToggle = (enabled: boolean) => {
    const newMode = enabled ? 'step-by-step' : 'normal';
    setExecutionMode(newMode);
    if (onStepMode) {
      onStepMode(enabled);
    }
    if (enabled && isExecuting && !isPaused) {
      pauseExecution();
    }
  };

  const handleSpeedChange = (speed: number) => {
    const speeds: ExecutionSpeed[] = [0.25, 0.5, 1, 2, 4];
    const closestSpeed = speeds.reduce((prev, curr) => 
      Math.abs(curr - speed) < Math.abs(prev - speed) ? curr : prev
    );
    setExecutionSpeed(closestSpeed);
    if (onSpeedChange) {
      onSpeedChange(closestSpeed);
    }
  };

  return (
    <div className={`${bgCard} rounded-lg border ${borderColor} p-4`}>
      <div className="flex items-center justify-between">
        {/* Main Controls */}
        <div className="flex items-center gap-2">
          {/* Start/Resume */}
          {canStart ? (
            <Button
              onClick={onStart}
              className="bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white hover:opacity-90"
              size="default"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Execution
            </Button>
          ) : canResume ? (
            <Button
              onClick={resumeExecution}
              className="bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white hover:opacity-90"
              size="default"
            >
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          ) : null}

          {/* Pause */}
          {canPause && (
            <Button
              onClick={pauseExecution}
              variant="outline"
              size="default"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}

          {/* Stop */}
          {canStop && (
            <Button
              onClick={stopExecution}
              variant="outline"
              size="default"
              className="text-red-500 hover:text-red-600 border-red-500/30 hover:border-red-500/50"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          )}

          {/* Step Forward (Step-by-step mode) */}
          {canStep && (
            <Button
              onClick={() => {
                if (onStepForward) {
                  onStepForward();
                } else {
                  resumeExecution();
                  setTimeout(() => pauseExecution(), 100);
                }
              }}
              variant="outline"
              size="default"
              className="border-blue-500/30 hover:border-blue-500/50"
            >
              <StepForward className="h-4 w-4 mr-2" />
              Step
            </Button>
          )}

          {/* Restart */}
          {!isExecuting && currentExecution && (
            <Button
              onClick={onStart}
              variant="outline"
              size="default"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart
            </Button>
          )}

          {/* Speed Control */}
          {isExecuting && (
            <div className="relative">
              <Button
                onClick={() => setShowSpeedControl(!showSpeedControl)}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <Gauge className="h-4 w-4" />
                <span className="text-xs">{executionSpeed}x</span>
              </Button>
              {showSpeedControl && (
                <div className={`absolute top-full mt-2 right-0 ${bgCard} rounded-lg border ${borderColor} p-3 shadow-xl z-10 min-w-[180px]`}>
                  <div className={`text-xs font-medium ${textPrimary} mb-3`}>Execution Speed</div>
                  <div className="flex flex-wrap gap-1">
                    {([0.25, 0.5, 1, 2, 4] as ExecutionSpeed[]).map((speed) => (
                      <Button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        variant={executionSpeed === speed ? 'default' : 'outline'}
                        size="sm"
                        className={`text-xs ${executionSpeed === speed ? 'bg-blue-500 text-white' : ''}`}
                      >
                        {speed}x
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Settings & Mode Toggle */}
        <div className="flex items-center gap-2">
          {/* Step-by-step Mode Toggle */}
          {isExecuting && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-blue-500/30">
              <StepForward className="h-3 w-3 text-blue-400" />
              <span className={`text-xs ${textSecondary}`}>Step Mode</span>
              <Switch
                checked={executionMode === 'step-by-step'}
                onCheckedChange={handleStepModeToggle}
                className="scale-75"
              />
            </div>
          )}
          <Button
            onClick={onConfigChange}
            variant="ghost"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Execution Info */}
      {currentExecution && (
        <div className={`mt-4 pt-4 border-t ${borderColor} flex items-center justify-between text-sm`}>
          <div className="flex items-center gap-6">
            {/* Status */}
            <div>
              <span className={textSecondary}>Status:</span>
              <span className={`ml-2 font-medium ${
                currentExecution.status === 'completed' ? 'text-green-400' :
                currentExecution.status === 'failed' ? 'text-red-400' :
                currentExecution.status === 'running' ? 'text-blue-400' :
                currentExecution.status === 'paused' ? 'text-yellow-400' :
                textPrimary
              }`}>
                {currentExecution.status.charAt(0).toUpperCase() + currentExecution.status.slice(1)}
              </span>
            </div>

            {/* Progress */}
            <div>
              <span className={textSecondary}>Progress:</span>
              <span className={`ml-2 ${textPrimary}`}>
                {currentExecution.currentStepIndex + 1} / {currentExecution.steps.length + 1}
              </span>
            </div>

            {/* Duration */}
            {currentExecution.duration && (
              <div>
                <span className={textSecondary}>Duration:</span>
                <span className={`ml-2 ${textPrimary}`}>
                  {(currentExecution.duration / 1000).toFixed(2)}s
                </span>
              </div>
            )}

            {/* Logs */}
            <div>
              <span className={textSecondary}>Logs:</span>
              <span className={`ml-2 ${textPrimary}`}>
                {currentExecution.logs.length}
              </span>
            </div>
          </div>

          {/* Execution ID */}
          <div className={`${textSecondary} text-xs font-mono`}>
            {currentExecution.executionId}
          </div>
        </div>
      )}
    </div>
  );
}
