/**
 * Agent Reasoning Viewer Component
 * Displays agent thought process, tool calls, and decisions (Bhindi-style)
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { Brain, CheckCircle2, ChevronDown, ChevronRight, Clock, GitBranch, Wrench, XCircle } from 'lucide-react';
import { useState } from 'react';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { useAgentStore } from '../../stores/agentStore';

interface AgentReasoningViewerProps {
  agentId: string;
  executionId?: string;
}

export function AgentReasoningViewer({ agentId, executionId }: AgentReasoningViewerProps) {
  const { theme } = useTheme();
  const agentStore = useAgentStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['thoughts', 'tools', 'decisions']));
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const agent = agentStore.getAgent(agentId);
  
  if (!agent) {
    return (
      <div className={`p-8 text-center ${theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'}`}>
        No agent data available
      </div>
    );
  }

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgHover = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const bgSection = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  const formatData = (data: any): string => {
    if (!data) return 'null';
    try {
      if (typeof data === 'string') return data;
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div className={`${bgCard} flex flex-col h-full`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${borderColor}`}>
        <div className="flex items-center gap-2">
          <Brain className={`h-5 w-5 ${textSecondary}`} />
          <h3 className={`font-semibold ${textPrimary}`}>Agent Reasoning</h3>
          <span className={`text-sm ${textSecondary}`}>({agentId})</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Thoughts Section */}
          <div className={`rounded-lg border ${borderColor} overflow-hidden`}>
            <button
              onClick={() => toggleSection('thoughts')}
              className={`w-full px-4 py-3 flex items-center justify-between ${bgSection} ${bgHover} transition-colors`}
            >
              <div className="flex items-center gap-2">
                {expandedSections.has('thoughts') ? (
                  <ChevronDown className={`h-4 w-4 ${textSecondary}`} />
                ) : (
                  <ChevronRight className={`h-4 w-4 ${textSecondary}`} />
                )}
                <Brain className={`h-4 w-4 ${textSecondary}`} />
                <span className={`font-medium ${textPrimary}`}>Thoughts</span>
                <span className={`text-xs px-2 py-0.5 rounded ${textSecondary} bg-opacity-20`}>
                  {agent.thoughts.length}
                </span>
              </div>
            </button>
            {expandedSections.has('thoughts') && (
              <div className="p-4 space-y-3">
                {agent.thoughts.length === 0 ? (
                  <div className={`text-sm ${textSecondary} text-center py-4`}>No thoughts recorded</div>
                ) : (
                  agent.thoughts.map((thought, index) => (
                    <div
                      key={thought.id}
                      className={`p-3 rounded border ${borderColor} ${bgCard} cursor-pointer transition-colors ${
                        selectedItem === thought.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedItem(selectedItem === thought.id ? null : thought.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className={`h-3 w-3 ${textSecondary}`} />
                          <span className={`text-xs ${textSecondary}`}>
                            {formatTimestamp(thought.timestamp)}
                          </span>
                          {thought.confidence !== undefined && (
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              thought.confidence > 0.8 ? 'bg-green-500/20 text-green-400' :
                              thought.confidence > 0.5 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {Math.round(thought.confidence * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`text-sm ${textPrimary} mb-1`}>{thought.content}</div>
                      {thought.reasoning && (
                        <div className={`text-xs ${textSecondary} mt-2 pt-2 border-t ${borderColor}`}>
                          <strong>Reasoning:</strong> {thought.reasoning}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Tool Calls Section */}
          <div className={`rounded-lg border ${borderColor} overflow-hidden`}>
            <button
              onClick={() => toggleSection('tools')}
              className={`w-full px-4 py-3 flex items-center justify-between ${bgSection} ${bgHover} transition-colors`}
            >
              <div className="flex items-center gap-2">
                {expandedSections.has('tools') ? (
                  <ChevronDown className={`h-4 w-4 ${textSecondary}`} />
                ) : (
                  <ChevronRight className={`h-4 w-4 ${textSecondary}`} />
                )}
                <Wrench className={`h-4 w-4 ${textSecondary}`} />
                <span className={`font-medium ${textPrimary}`}>Tool Calls</span>
                <span className={`text-xs px-2 py-0.5 rounded ${textSecondary} bg-opacity-20`}>
                  {agent.toolCalls.length}
                </span>
              </div>
            </button>
            {expandedSections.has('tools') && (
              <div className="p-4 space-y-3">
                {agent.toolCalls.length === 0 ? (
                  <div className={`text-sm ${textSecondary} text-center py-4`}>No tool calls recorded</div>
                ) : (
                  agent.toolCalls.map((toolCall) => (
                    <div
                      key={toolCall.id}
                      className={`p-3 rounded border ${borderColor} ${bgCard} ${
                        toolCall.success ? 'border-green-500/30' : 'border-red-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {toolCall.success ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                          <span className={`font-medium ${textPrimary}`}>{toolCall.toolName}</span>
                          {toolCall.duration && (
                            <span className={`text-xs ${textSecondary}`}>
                              ({toolCall.duration}ms)
                            </span>
                          )}
                        </div>
                        <span className={`text-xs ${textSecondary}`}>
                          {formatTimestamp(toolCall.timestamp)}
                        </span>
                      </div>
                      <div className={`text-xs ${textSecondary} mb-2`}>
                        <strong>Arguments:</strong>
                        <pre className={`mt-1 p-2 rounded ${bgSection} overflow-x-auto`}>
                          {formatData(toolCall.arguments)}
                        </pre>
                      </div>
                      {toolCall.result && (
                        <div className={`text-xs ${textSecondary} mb-2`}>
                          <strong>Result:</strong>
                          <pre className={`mt-1 p-2 rounded ${bgSection} overflow-x-auto`}>
                            {formatData(toolCall.result)}
                          </pre>
                        </div>
                      )}
                      {toolCall.error && (
                        <div className={`text-xs text-red-400 mt-2`}>
                          <strong>Error:</strong> {toolCall.error}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Decisions Section */}
          <div className={`rounded-lg border ${borderColor} overflow-hidden`}>
            <button
              onClick={() => toggleSection('decisions')}
              className={`w-full px-4 py-3 flex items-center justify-between ${bgSection} ${bgHover} transition-colors`}
            >
              <div className="flex items-center gap-2">
                {expandedSections.has('decisions') ? (
                  <ChevronDown className={`h-4 w-4 ${textSecondary}`} />
                ) : (
                  <ChevronRight className={`h-4 w-4 ${textSecondary}`} />
                )}
                <GitBranch className={`h-4 w-4 ${textSecondary}`} />
                <span className={`font-medium ${textPrimary}`}>Decisions</span>
                <span className={`text-xs px-2 py-0.5 rounded ${textSecondary} bg-opacity-20`}>
                  {agent.decisions.length}
                </span>
              </div>
            </button>
            {expandedSections.has('decisions') && (
              <div className="p-4 space-y-3">
                {agent.decisions.length === 0 ? (
                  <div className={`text-sm ${textSecondary} text-center py-4`}>No decisions recorded</div>
                ) : (
                  agent.decisions.map((decision) => (
                    <div
                      key={decision.id}
                      className={`p-3 rounded border ${borderColor} ${bgCard}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className={`font-medium ${textPrimary} mb-1`}>{decision.decisionPoint}</div>
                          <span className={`text-xs ${textSecondary}`}>
                            {formatTimestamp(decision.timestamp)}
                          </span>
                          {decision.confidence !== undefined && (
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                              decision.confidence > 0.8 ? 'bg-green-500/20 text-green-400' :
                              decision.confidence > 0.5 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {Math.round(decision.confidence * 100)}% confidence
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`text-sm ${textSecondary} mb-2`}>
                        <strong>Reasoning:</strong> {decision.reasoning}
                      </div>
                      <div className={`text-xs ${textSecondary} mb-2`}>
                        <strong>Options:</strong>
                        <div className="mt-1 space-y-1">
                          {decision.options.map((option, idx) => (
                            <div
                              key={idx}
                              className={`p-2 rounded ${bgSection} ${
                                JSON.stringify(option.value) === JSON.stringify(decision.selectedOption)
                                  ? 'ring-2 ring-blue-500'
                                  : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{option.label}</span>
                                {option.score !== undefined && (
                                  <span className={`text-xs ${textSecondary}`}>
                                    Score: {option.score.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className={`text-xs ${textPrimary} mt-2 pt-2 border-t ${borderColor}`}>
                        <strong>Selected:</strong>{' '}
                        <span className="font-mono">
                          {formatData(decision.selectedOption)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Current State Section */}
          {Object.keys(agent.currentState).length > 0 && (
            <div className={`rounded-lg border ${borderColor} overflow-hidden`}>
              <button
                onClick={() => toggleSection('state')}
                className={`w-full px-4 py-3 flex items-center justify-between ${bgSection} ${bgHover} transition-colors`}
              >
                <div className="flex items-center gap-2">
                  {expandedSections.has('state') ? (
                    <ChevronDown className={`h-4 w-4 ${textSecondary}`} />
                  ) : (
                    <ChevronRight className={`h-4 w-4 ${textSecondary}`} />
                  )}
                  <span className={`font-medium ${textPrimary}`}>Current State</span>
                </div>
              </button>
              {expandedSections.has('state') && (
                <div className="p-4">
                  <pre className={`text-xs font-mono ${textSecondary} overflow-x-auto`}>
                    {formatData(agent.currentState)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
