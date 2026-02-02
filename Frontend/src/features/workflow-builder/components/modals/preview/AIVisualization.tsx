/**
 * AI Visualization Component
 * Animated visualization showing automation workflow execution
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { Zap, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { Trigger, WorkflowContainer } from '../../../types';

interface AIVisualizationProps {
  isExecuting: boolean;
  triggers: Trigger[];
  containers: WorkflowContainer[];
}

export function AIVisualization({ isExecuting, triggers, containers }: AIVisualizationProps) {
  const { theme } = useTheme();
  
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  // Get active trigger
  const activeTrigger = triggers.find(t => t.enabled !== false) || triggers[0];
  
  // Count total nodes
  const totalNodes = containers.reduce((acc, c) => acc + c.nodes.length, 0);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Animated Visualization */}
      <div className="w-full max-w-md space-y-6">
        {/* Trigger Step */}
        <div className={`${bgCard} border ${borderColor} rounded-xl p-6 transition-all ${
          isExecuting ? 'ring-2 ring-[#00C6FF] ring-opacity-50 animate-pulse' : ''
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center ${
              isExecuting ? 'animate-bounce' : ''
            }`}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className={`${textPrimary} font-medium`}>
                {isExecuting ? 'Trigger Executing...' : 'Trigger Ready'}
              </div>
              <div className={`${textSecondary} text-sm mt-0.5`}>
                {activeTrigger?.label || 'Manual Trigger'}
              </div>
            </div>
            {isExecuting && (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
          </div>
        </div>

        {/* Arrow */}
        {totalNodes > 0 && (
          <div className="flex justify-center">
            <ArrowRight className={`w-6 h-6 ${textSecondary} ${isExecuting ? 'animate-pulse' : ''}`} />
          </div>
        )}

        {/* Actions Step */}
        {totalNodes > 0 && (
          <div className={`${bgCard} border ${borderColor} rounded-xl p-6 transition-all ${
            isExecuting ? 'ring-2 ring-purple-500 ring-opacity-50 animate-pulse delay-300' : ''
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center ${
                isExecuting ? 'animate-spin-slow' : ''
              }`}>
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className={`${textPrimary} font-medium`}>
                  {isExecuting ? 'Processing Actions...' : 'Actions Ready'}
                </div>
                <div className={`${textSecondary} text-sm mt-0.5`}>
                  {totalNodes} workflow {totalNodes === 1 ? 'step' : 'steps'}
                </div>
              </div>
              {isExecuting && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping delay-75" />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping delay-150" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        <div className={`text-center ${textSecondary} text-sm mt-8`}>
          {isExecuting ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#00C6FF] animate-pulse" />
                <span>Automation in progress...</span>
              </div>
              <p>Your workflow is being executed. This may take a few moments.</p>
            </>
          ) : (
            <>
              <p className="mb-2">Click "Execute Workflow" to run your automation</p>
              <p className="text-xs opacity-70">
                The workflow will execute all triggers and actions sequentially
              </p>
            </>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .delay-75 {
          animation-delay: 75ms;
        }
        .delay-150 {
          animation-delay: 150ms;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
      `}} />
    </div>
  );
}