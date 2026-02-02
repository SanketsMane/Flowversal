/**
 * Agent State Inspector Component
 * Detailed inspection of agent internal state (Bhindi-style)
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { Brain, Clock, Copy, Download, GitBranch, History } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { useAgentStore } from '../../stores/agentStore';

interface AgentStateInspectorProps {
  agentId: string;
  executionId?: string;
}

export function AgentStateInspector({ agentId, executionId }: AgentStateInspectorProps) {
  const { theme } = useTheme();
  const agentStore = useAgentStore();
  const [selectedView, setSelectedView] = useState<'current' | 'history' | 'diff'>('current');
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const agent = agentStore.getAgent(agentId);

  if (!agent) {
    return (
      <div className={`p-8 text-center ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>
        Agent not found
      </div>
    );
  }

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const bgSection = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';

  const formatData = (data: any): string => {
    if (!data) return 'null';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportState = () => {
    const stateData = {
      agentId: agent.agentId,
      executionId: agent.executionId,
      nodeId: agent.nodeId,
      currentState: agent.currentState,
      thoughts: agent.thoughts,
      toolCalls: agent.toolCalls,
      decisions: agent.decisions,
      metadata: agent.metadata,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(stateData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-state-${agentId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`${bgCard} flex flex-col h-full`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${borderColor} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Brain className={`h-5 w-5 ${textSecondary}`} />
          <h3 className={`font-semibold ${textPrimary}`}>Agent State Inspector</h3>
          <span className={`text-sm ${textSecondary}`}>({agentId.substring(0, 8)}...)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={exportState}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <div className={`px-4 py-2 border-b ${borderColor} flex gap-2`}>
        <button
          onClick={() => setSelectedView('current')}
          className={`px-3 py-1.5 rounded text-sm transition-colors ${
            selectedView === 'current'
              ? `${bgSection} ${textPrimary} font-medium`
              : `${textSecondary} hover:${textPrimary}`
          }`}
        >
          Current State
        </button>
        <button
          onClick={() => setSelectedView('history')}
          className={`px-3 py-1.5 rounded text-sm transition-colors ${
            selectedView === 'history'
              ? `${bgSection} ${textPrimary} font-medium`
              : `${textSecondary} hover:${textPrimary}`
          }`}
        >
          <History className="h-4 w-4 inline mr-1" />
          History
        </button>
        <button
          onClick={() => setSelectedView('diff')}
          className={`px-3 py-1.5 rounded text-sm transition-colors ${
            selectedView === 'diff'
              ? `${bgSection} ${textPrimary} font-medium`
              : `${textSecondary} hover:${textPrimary}`
          }`}
        >
          <GitBranch className="h-4 w-4 inline mr-1" />
          Diff
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {selectedView === 'current' && (
            <div className="space-y-4">
              {/* Current State */}
              <div className={`rounded-lg border ${borderColor} p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`font-medium ${textPrimary}`}>Current State</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(formatData(agent.currentState))}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <pre className={`text-xs font-mono ${textSecondary} overflow-x-auto p-3 rounded ${bgSection}`}>
                  {formatData(agent.currentState)}
                </pre>
              </div>

              {/* Metadata */}
              {agent.metadata && Object.keys(agent.metadata).length > 0 && (
                <div className={`rounded-lg border ${borderColor} p-4`}>
                  <h4 className={`font-medium ${textPrimary} mb-3`}>Metadata</h4>
                  <pre className={`text-xs font-mono ${textSecondary} overflow-x-auto p-3 rounded ${bgSection}`}>
                    {formatData(agent.metadata)}
                  </pre>
                </div>
              )}

              {/* Statistics */}
              <div className={`rounded-lg border ${borderColor} p-4`}>
                <h4 className={`font-medium ${textPrimary} mb-3`}>Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className={`text-xs ${textSecondary} mb-1`}>Total Thoughts</div>
                    <div className={`text-lg font-semibold ${textPrimary}`}>{agent.thoughts.length}</div>
                  </div>
                  <div>
                    <div className={`text-xs ${textSecondary} mb-1`}>Total Tool Calls</div>
                    <div className={`text-lg font-semibold ${textPrimary}`}>{agent.toolCalls.length}</div>
                  </div>
                  <div>
                    <div className={`text-xs ${textSecondary} mb-1`}>Total Decisions</div>
                    <div className={`text-lg font-semibold ${textPrimary}`}>{agent.decisions.length}</div>
                  </div>
                  <div>
                    <div className={`text-xs ${textSecondary} mb-1`}>State Keys</div>
                    <div className={`text-lg font-semibold ${textPrimary}`}>
                      {Object.keys(agent.currentState).length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedView === 'history' && (
            <div className="space-y-4">
              <div className={`text-sm ${textSecondary} mb-4`}>
                State history timeline (future enhancement)
              </div>
              <div className={`rounded-lg border ${borderColor} p-4 text-center ${textSecondary}`}>
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>State history tracking coming soon</p>
              </div>
            </div>
          )}

          {selectedView === 'diff' && (
            <div className="space-y-4">
              <div className={`text-sm ${textSecondary} mb-4`}>
                State diff viewer (future enhancement)
              </div>
              <div className={`rounded-lg border ${borderColor} p-4 text-center ${textSecondary}`}>
                <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>State diff visualization coming soon</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
