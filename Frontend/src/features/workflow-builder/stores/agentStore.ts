/**
 * Agent Store - Zustand store for managing agent reasoning state
 * Tracks agent thoughts, tool calls, and decisions for bhindi-style visualization
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Thought {
  id: string;
  content: string;
  timestamp: Date;
  confidence?: number;
  reasoning?: string;
}

export interface ToolCall {
  id: string;
  toolName: string;
  arguments: Record<string, any>;
  result?: any;
  timestamp: Date;
  duration?: number;
  success: boolean;
  error?: string;
}

export interface Decision {
  id: string;
  decisionPoint: string;
  options: Array<{ label: string; value: any; score?: number }>;
  selectedOption: any;
  reasoning: string;
  timestamp: Date;
  confidence?: number;
}

export interface AgentState {
  agentId: string;
  executionId: string;
  nodeId?: string;
  thoughts: Thought[];
  toolCalls: ToolCall[];
  decisions: Decision[];
  currentState: Record<string, any>;
  metadata?: Record<string, any>;
}

interface AgentStoreState {
  // Map of agentId -> AgentState
  agents: Map<string, AgentState>;
  
  // Map of executionId -> agentIds[]
  executionAgents: Map<string, string[]>;

  // Actions
  addAgent: (agent: AgentState) => void;
  updateAgent: (agentId: string, updates: Partial<AgentState>) => void;
  addThought: (agentId: string, thought: Thought) => void;
  addToolCall: (agentId: string, toolCall: ToolCall) => void;
  addDecision: (agentId: string, decision: Decision) => void;
  updateAgentState: (agentId: string, stateUpdate: Record<string, any>) => void;
  getAgent: (agentId: string) => AgentState | undefined;
  getExecutionAgents: (executionId: string) => AgentState[];
  clearExecution: (executionId: string) => void;
  clearAll: () => void;
}

export const useAgentStore = create<AgentStoreState>()(
  devtools(
    (set, get) => ({
      agents: new Map(),
      executionAgents: new Map(),

      addAgent: (agent) => {
        set((state) => {
          const newAgents = new Map(state.agents);
          newAgents.set(agent.agentId, agent);

          const newExecutionAgents = new Map(state.executionAgents);
          const agentIds = newExecutionAgents.get(agent.executionId) || [];
          if (!agentIds.includes(agent.agentId)) {
            newExecutionAgents.set(agent.executionId, [...agentIds, agent.agentId]);
          }

          return {
            agents: newAgents,
            executionAgents: newExecutionAgents,
          };
        });
      },

      updateAgent: (agentId, updates) => {
        set((state) => {
          const agent = state.agents.get(agentId);
          if (!agent) return state;

          const updatedAgent = { ...agent, ...updates };
          const newAgents = new Map(state.agents);
          newAgents.set(agentId, updatedAgent);

          return { agents: newAgents };
        });
      },

      addThought: (agentId, thought) => {
        set((state) => {
          const agent = state.agents.get(agentId);
          if (!agent) return state;

          const updatedAgent = {
            ...agent,
            thoughts: [...agent.thoughts, thought],
          };
          const newAgents = new Map(state.agents);
          newAgents.set(agentId, updatedAgent);

          return { agents: newAgents };
        });
      },

      addToolCall: (agentId, toolCall) => {
        set((state) => {
          const agent = state.agents.get(agentId);
          if (!agent) return state;

          const updatedAgent = {
            ...agent,
            toolCalls: [...agent.toolCalls, toolCall],
          };
          const newAgents = new Map(state.agents);
          newAgents.set(agentId, updatedAgent);

          return { agents: newAgents };
        });
      },

      addDecision: (agentId, decision) => {
        set((state) => {
          const agent = state.agents.get(agentId);
          if (!agent) return state;

          const updatedAgent = {
            ...agent,
            decisions: [...agent.decisions, decision],
          };
          const newAgents = new Map(state.agents);
          newAgents.set(agentId, updatedAgent);

          return { agents: newAgents };
        });
      },

      updateAgentState: (agentId, stateUpdate) => {
        set((state) => {
          const agent = state.agents.get(agentId);
          if (!agent) return state;

          const updatedAgent = {
            ...agent,
            currentState: {
              ...agent.currentState,
              ...stateUpdate,
            },
          };
          const newAgents = new Map(state.agents);
          newAgents.set(agentId, updatedAgent);

          return { agents: newAgents };
        });
      },

      getAgent: (agentId) => {
        return get().agents.get(agentId);
      },

      getExecutionAgents: (executionId) => {
        const state = get();
        const agentIds = state.executionAgents.get(executionId) || [];
        return agentIds
          .map((id) => state.agents.get(id))
          .filter((agent): agent is AgentState => agent !== undefined);
      },

      clearExecution: (executionId) => {
        set((state) => {
          const agentIds = state.executionAgents.get(executionId) || [];
          const newAgents = new Map(state.agents);
          const newExecutionAgents = new Map(state.executionAgents);

          // Remove agents for this execution
          agentIds.forEach((id) => {
            newAgents.delete(id);
          });
          newExecutionAgents.delete(executionId);

          return {
            agents: newAgents,
            executionAgents: newExecutionAgents,
          };
        });
      },

      clearAll: () => {
        set({
          agents: new Map(),
          executionAgents: new Map(),
        });
      },
    }),
    { name: 'AgentStore' }
  )
);
