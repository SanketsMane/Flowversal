/**
 * Execution Debug Component
 * Debug tab with breakpoint management and variable inspector (n8n-style)
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { Bug, Code, Eye, Play, Plus, StepForward, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { useExecution } from '../../stores/executionStore';
import { useWorkflowStore } from '../../stores/workflowStore';

interface Breakpoint {
  nodeId: string;
  nodeName: string;
  enabled: boolean;
}

export function ExecutionDebug() {
  const { theme } = useTheme();
  const { currentExecution } = useExecution();
  const { containers } = useWorkflowStore();
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [variableFilter, setVariableFilter] = useState('');

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgHover = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const inputBg = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';

  // Get all nodes for breakpoint selection
  const allNodes = containers.flatMap((container) =>
    container.nodes.map((node) => ({
      id: node.id,
      name: node.name || node.type,
      containerId: container.id,
    }))
  );

  // Get execution variables
  const executionVariables = currentExecution?.variables || {};
  const filteredVariables = Object.entries(executionVariables).filter(([key]) =>
    key.toLowerCase().includes(variableFilter.toLowerCase())
  );

  // Toggle breakpoint
  const toggleBreakpoint = (nodeId: string) => {
    setBreakpoints((prev) => {
      const existing = prev.find((bp) => bp.nodeId === nodeId);
      if (existing) {
        return prev.filter((bp) => bp.nodeId !== nodeId);
      } else {
        const node = allNodes.find((n) => n.id === nodeId);
        if (node) {
          return [...prev, { nodeId, nodeName: node.name, enabled: true }];
        }
      }
      return prev;
    });
  };

  // Format variable value for display
  const formatVariableValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  // Get variable type
  const getVariableType = (value: any): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };

  return (
    <div className={`${bgCard} flex flex-col h-full`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${borderColor} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Bug className={`h-5 w-5 ${textSecondary}`} />
          <h3 className={`font-semibold ${textPrimary}`}>Debug</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" title="Step Over">
            <StepForward className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Continue">
            <Play className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left Panel - Breakpoints */}
        <div className={`w-64 border-r ${borderColor} flex flex-col`}>
          <div className={`px-3 py-2 border-b ${borderColor} flex items-center justify-between`}>
            <span className={`text-sm font-medium ${textPrimary}`}>Breakpoints</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Add breakpoint dialog would go here
                const nodeId = prompt('Enter node ID to add breakpoint:');
                if (nodeId) {
                  toggleBreakpoint(nodeId);
                }
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {breakpoints.length === 0 ? (
                <div className={`text-sm ${textSecondary} p-4 text-center`}>
                  No breakpoints set
                </div>
              ) : (
                breakpoints.map((bp) => (
                  <div
                    key={bp.nodeId}
                    className={`p-2 rounded ${bgHover} flex items-center justify-between cursor-pointer ${
                      selectedNodeId === bp.nodeId ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedNodeId(bp.nodeId)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${textPrimary} truncate`}>{bp.nodeName}</div>
                      <div className={`text-xs ${textSecondary} truncate`}>{bp.nodeId}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBreakpoint(bp.nodeId);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Variables */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className={`px-4 py-2 border-b ${borderColor}`}>
            <Input
              placeholder="Filter variables..."
              value={variableFilter}
              onChange={(e) => setVariableFilter(e.target.value)}
              className={`${inputBg} ${textPrimary}`}
            />
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {filteredVariables.length === 0 ? (
                <div className={`text-sm ${textSecondary} text-center py-8`}>
                  {variableFilter ? 'No variables match filter' : 'No variables available'}
                </div>
              ) : (
                filteredVariables.map(([key, value]) => (
                  <div
                    key={key}
                    className={`p-3 rounded border ${borderColor} ${bgCard}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Code className={`h-4 w-4 ${textSecondary}`} />
                        <span className={`font-mono font-semibold ${textPrimary}`}>{key}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${textSecondary} bg-opacity-20`}>
                          {getVariableType(value)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(formatVariableValue(value));
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className={`text-sm font-mono ${textSecondary} break-all whitespace-pre-wrap`}>
                      {formatVariableValue(value)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
