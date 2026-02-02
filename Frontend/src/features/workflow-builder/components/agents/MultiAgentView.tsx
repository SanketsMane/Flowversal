/**
 * Multi-Agent View Component
 * Visualizes multiple agents working together (Bhindi-style orchestration)
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { ArrowRight, Brain, MessageSquare, Users } from 'lucide-react';
import { useState } from 'react';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { useAgentStore } from '../../stores/agentStore';
import { AgentReasoningViewer } from './AgentReasoningViewer';

interface MultiAgentViewProps {
  executionId: string;
}

export function MultiAgentView({ executionId }: MultiAgentViewProps) {
  const { theme } = useTheme();
  const agentStore = useAgentStore();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const agents = agentStore.getExecutionAgents(executionId);

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const bgHover = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-50';
  const bgSection = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';

  if (agents.length === 0) {
    return (
      <div className={`${bgCard} flex flex-col h-full items-center justify-center p-8`}>
        <Users className={`h-12 w-12 ${textSecondary} mb-4`} />
        <div className={`text-lg font-medium ${textPrimary} mb-2`}>No Agents Active</div>
        <div className={`text-sm ${textSecondary} text-center`}>
          Agents will appear here when they start working together
        </div>
      </div>
    );
  }

  // Build agent interaction graph
  const buildInteractionGraph = () => {
    const interactions: Array<{ from: string; to: string; type: string }> = [];
    
    // Analyze agent states to find interactions
    agents.forEach((agent) => {
      // Check if agent references other agents in their state or decisions
      const stateStr = JSON.stringify(agent.currentState);
      agents.forEach((otherAgent) => {
        if (agent.agentId !== otherAgent.agentId && stateStr.includes(otherAgent.agentId)) {
          interactions.push({
            from: agent.agentId,
            to: otherAgent.agentId,
            type: 'state-reference',
          });
        }
      });
    });

    return interactions;
  };

  const interactions = buildInteractionGraph();

  return (
    <div className={`${bgCard} flex flex-col h-full`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${borderColor}`}>
        <div className="flex items-center gap-2">
          <Users className={`h-5 w-5 ${textSecondary}`} />
          <h3 className={`font-semibold ${textPrimary}`}>Multi-Agent Orchestration</h3>
          <span className={`text-sm ${textSecondary}`}>({agents.length} agents)</span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left Panel - Agent List */}
        <div className={`w-64 border-r ${borderColor} flex flex-col`}>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {agents.map((agent) => (
                <div
                  key={agent.agentId}
                  className={`p-3 rounded border ${borderColor} ${bgSection} cursor-pointer transition-colors ${
                    selectedAgentId === agent.agentId ? 'ring-2 ring-blue-500' : bgHover
                  }`}
                  onClick={() => setSelectedAgentId(selectedAgentId === agent.agentId ? null : agent.agentId)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className={`h-4 w-4 ${textSecondary}`} />
                    <span className={`font-medium text-sm ${textPrimary} truncate`}>
                      {agent.nodeId || agent.agentId.substring(0, 8)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className={`${textSecondary}`}>
                      <span className="font-medium">{agent.thoughts.length}</span> thoughts
                    </div>
                    <div className={`${textSecondary}`}>
                      <span className="font-medium">{agent.toolCalls.length}</span> tools
                    </div>
                    <div className={`${textSecondary}`}>
                      <span className="font-medium">{agent.decisions.length}</span> decisions
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Agent Details or Interaction Graph */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedAgentId ? (
            <AgentReasoningViewer agentId={selectedAgentId} executionId={executionId} />
          ) : (
            <div className="flex-1 p-6">
              {/* Interaction Graph */}
              <div className={`rounded-lg border ${borderColor} p-4 mb-4`}>
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className={`h-4 w-4 ${textSecondary}`} />
                  <h4 className={`font-medium ${textPrimary}`}>Agent Interactions</h4>
                </div>
                {interactions.length === 0 ? (
                  <div className={`text-sm ${textSecondary} text-center py-8`}>
                    No interactions detected between agents
                  </div>
                ) : (
                  <div className="space-y-2">
                    {interactions.map((interaction, idx) => {
                      const fromAgent = agents.find((a) => a.agentId === interaction.from);
                      const toAgent = agents.find((a) => a.agentId === interaction.to);
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded border ${borderColor} ${bgSection} flex items-center gap-3`}
                        >
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${textPrimary}`}>
                              {fromAgent?.nodeId || interaction.from.substring(0, 8)}
                            </div>
                            <div className={`text-xs ${textSecondary}`}>Agent {interaction.from.substring(0, 8)}</div>
                          </div>
                          <ArrowRight className={`h-4 w-4 ${textSecondary}`} />
                          <div className="flex-1 text-right">
                            <div className={`text-sm font-medium ${textPrimary}`}>
                              {toAgent?.nodeId || interaction.to.substring(0, 8)}
                            </div>
                            <div className={`text-xs ${textSecondary}`}>Agent {interaction.to.substring(0, 8)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Shared State Visualization */}
              <div className={`rounded-lg border ${borderColor} p-4`}>
                <div className="flex items-center gap-2 mb-4">
                  <Brain className={`h-4 w-4 ${textSecondary}`} />
                  <h4 className={`font-medium ${textPrimary}`}>Shared Context</h4>
                </div>
                <div className={`text-sm ${textSecondary}`}>
                  {agents.length} agents sharing execution context
                </div>
                <div className="mt-4 space-y-2">
                  {agents.map((agent) => (
                    <div
                      key={agent.agentId}
                      className={`p-2 rounded border ${borderColor} ${bgSection} text-xs`}
                    >
                      <div className={`font-medium ${textPrimary} mb-1`}>
                        {agent.nodeId || agent.agentId.substring(0, 8)}
                      </div>
                      <div className={`${textSecondary} truncate`}>
                        State keys: {Object.keys(agent.currentState).length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
