/**
 * Output Display Component
 * Shows execution results in various formats
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react';

interface OutputDisplayProps {
  outputData: any;
  executionState: 'idle' | 'running' | 'success' | 'error';
}

export function OutputDisplay({ outputData, executionState }: OutputDisplayProps) {
  const { theme } = useTheme();
  
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';

  // Idle state
  if (executionState === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 rounded-full bg-[#1A1A2E] flex items-center justify-center mb-4">
          <Sparkles className={`w-8 h-8 ${textMuted}`} />
        </div>
        <p className={`${textMuted} text-center`}>
          Output will appear here after execution
        </p>
      </div>
    );
  }

  // Running state
  if (executionState === 'running') {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-[#00C6FF] animate-spin mb-4" />
        <p className={`${textSecondary} text-center font-medium mb-2`}>
          Processing workflow...
        </p>
        <p className={`${textMuted} text-sm text-center`}>
          Executing triggers and actions
        </p>
      </div>
    );
  }

  // Error state
  if (executionState === 'error') {
    return (
      <div className="h-full">
        <div className={`${bgCard} border-2 border-red-500/30 rounded-xl p-6 bg-red-500/5`}>
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-400 font-medium">Execution Failed</span>
              </div>
              <p className={`${textSecondary} text-sm`}>
                {outputData?.error || 'An error occurred during workflow execution'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state with output
  if (executionState === 'success' && outputData) {
    return (
      <div className="h-full space-y-4">
        {/* Success Banner */}
        <div className={`${bgCard} border-2 border-green-500/30 rounded-xl p-4 bg-green-500/5`}>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">Execution Successful</span>
          </div>
        </div>

        {/* Output Content */}
        <div className={`${bgCard} border ${borderColor} rounded-xl p-6`}>
          {outputData.type === 'ai_response' ? (
            <div className="space-y-4">
              {/* AI Response with typewriter effect styling */}
              <div className={`${textPrimary} leading-relaxed whitespace-pre-wrap font-mono text-sm`}>
                {outputData.content}
              </div>

              {/* Metadata */}
              {outputData.metadata && (
                <div className={`pt-4 border-t ${borderColor} space-y-2`}>
                  <div className={`${textSecondary} text-xs uppercase tracking-wide font-medium`}>
                    Metadata
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(outputData.metadata).map(([key, value]) => (
                      <div key={key} className={`${bgCard} border ${borderColor} rounded-lg p-3`}>
                        <div className={`${textMuted} text-xs mb-1 capitalize`}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className={`${textPrimary} text-sm font-medium`}>
                          {String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : outputData.type === 'text' ? (
            <div className={`${textPrimary} leading-relaxed`}>
              {outputData.content}
            </div>
          ) : outputData.type === 'image' ? (
            <div>
              <img 
                src={outputData.url} 
                alt="Output" 
                className="w-full rounded-lg border ${borderColor}"
              />
              {outputData.caption && (
                <p className={`${textSecondary} text-sm mt-2`}>
                  {outputData.caption}
                </p>
              )}
            </div>
          ) : outputData.type === 'json' ? (
            <pre className={`${textPrimary} text-sm overflow-x-auto p-4 bg-black/20 rounded-lg font-mono`}>
              {JSON.stringify(outputData.data, null, 2)}
            </pre>
          ) : (
            <div className={`${textPrimary}`}>
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {JSON.stringify(outputData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
