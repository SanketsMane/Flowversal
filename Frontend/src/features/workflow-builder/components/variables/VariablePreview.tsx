/**
 * Variable Preview Component
 * Phase 4 Part 3 - Variable System
 * 
 * Preview and debug variable values
 */

import { useState } from 'react';
import { useTheme } from '../../../../components/ThemeContext';
import { useVariables } from '../../stores/variableStore';
import { 
  resolveVariablesInString,
  previewVariableResolution,
} from '../../utils/variable.resolver';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { 
  Eye, 
  Code2,
  CheckCircle2,
  XCircle,
  Copy,
  RefreshCw,
} from 'lucide-react';

export function VariablePreview() {
  const { theme } = useTheme();
  const { context } = useVariables();
  const [testInput, setTestInput] = useState('');
  const [showRawJson, setShowRawJson] = useState(false);

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgCode = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  // Preview test input
  const preview = testInput
    ? previewVariableResolution(testInput, context)
    : null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`${bgCard} rounded-lg border ${borderColor} flex flex-col h-full`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className={`h-5 w-5 ${textSecondary}`} />
            <h3 className={`${textPrimary} font-medium`}>Variable Preview</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRawJson(!showRawJson)}
          >
            <Code2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Test Input */}
      <div className={`px-4 py-3 border-b ${borderColor}`}>
        <label className={`${textSecondary} text-sm mb-2 block`}>
          Test Variable Resolution
        </label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter text with {{variables}}"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTestInput('')}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Preview Result */}
        {preview && (
          <div className="mt-3 space-y-2">
            {/* Original */}
            <div>
              <div className={`${textSecondary} text-xs mb-1`}>Original:</div>
              <div className={`${bgCode} rounded p-2 ${textPrimary} text-sm font-mono`}>
                {preview.original}
              </div>
            </div>

            {/* Resolved */}
            <div>
              <div className={`${textSecondary} text-xs mb-1 flex items-center justify-between`}>
                <span>Resolved:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(preview.resolved)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className={`${bgCode} rounded p-2 text-[#00C6FF] text-sm font-mono`}>
                {preview.resolved}
              </div>
            </div>

            {/* Variables Used */}
            {preview.variables.length > 0 && (
              <div>
                <div className={`${textSecondary} text-xs mb-1`}>
                  Variables ({preview.variables.length}):
                </div>
                <div className="space-y-1">
                  {preview.variables.map((v, i) => (
                    <div
                      key={i}
                      className={`${bgCode} rounded p-2 text-sm flex items-start justify-between gap-2`}
                    >
                      <div className="flex-1">
                        <div className={`${textPrimary} font-mono`}>
                          {v.path}
                        </div>
                        {v.resolved ? (
                          <div className={`${textSecondary} text-xs font-mono mt-1`}>
                            = {JSON.stringify(v.value)}
                          </div>
                        ) : (
                          <div className="text-red-400 text-xs mt-1">
                            Unresolved
                          </div>
                        )}
                      </div>
                      {v.resolved ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Context Preview */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <h4 className={`${textPrimary} font-medium mb-3`}>
            Current Context
          </h4>

          {showRawJson ? (
            // Raw JSON View
            <pre className={`${bgCode} rounded p-4 text-xs overflow-x-auto ${textPrimary}`}>
              {JSON.stringify(context, null, 2)}
            </pre>
          ) : (
            // Structured View
            <div className="space-y-4">
              {/* Variables */}
              {Object.keys(context.variables).length > 0 && (
                <div>
                  <div className={`${textSecondary} text-sm mb-2`}>
                    Variables ({Object.keys(context.variables).length})
                  </div>
                  <div className="space-y-1">
                    {Object.entries(context.variables).map(([key, value]) => (
                      <div
                        key={key}
                        className={`${bgCode} rounded p-2`}
                      >
                        <div className={`${textPrimary} font-mono text-sm`}>
                          {key}
                        </div>
                        <div className={`${textSecondary} text-xs font-mono mt-1`}>
                          {JSON.stringify(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step Outputs */}
              {Object.keys(context.stepOutputs).length > 0 && (
                <div>
                  <div className={`${textSecondary} text-sm mb-2`}>
                    Step Outputs ({Object.keys(context.stepOutputs).length})
                  </div>
                  <div className="space-y-1">
                    {Object.entries(context.stepOutputs).map(([stepId, output]) => (
                      <div
                        key={stepId}
                        className={`${bgCode} rounded p-2`}
                      >
                        <div className={`${textPrimary} font-mono text-sm`}>
                          {stepId}
                        </div>
                        <div className={`${textSecondary} text-xs font-mono mt-1`}>
                          {JSON.stringify(output)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Global Variables */}
              {Object.keys(context.globalVariables).length > 0 && (
                <div>
                  <div className={`${textSecondary} text-sm mb-2`}>
                    Global Variables ({Object.keys(context.globalVariables).length})
                  </div>
                  <div className="space-y-1">
                    {Object.entries(context.globalVariables).map(([key, value]) => (
                      <div
                        key={key}
                        className={`${bgCode} rounded p-2`}
                      >
                        <div className={`${textPrimary} font-mono text-sm`}>
                          {key}
                        </div>
                        <div className={`${textSecondary} text-xs font-mono mt-1`}>
                          {JSON.stringify(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {Object.keys(context.variables).length === 0 &&
                Object.keys(context.stepOutputs).length === 0 &&
                Object.keys(context.globalVariables).length === 0 && (
                <div className={`${textSecondary} text-center py-8`}>
                  <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No variables in context yet</p>
                  <p className="text-xs mt-1">Execute a workflow to see variables</p>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className={`px-4 py-3 border-t ${borderColor} ${textSecondary} text-xs`}>
        💡 Use <code className="px-1 py-0.5 bg-[#2A2A3E] rounded">{'{{path}}'}</code> to reference variables
      </div>
    </div>
  );
}
