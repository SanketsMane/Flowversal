/**
 * WebSocket Hook for Real-time Execution Updates
 * Connects to backend WebSocket server for n8n-style execution visualization
 */
import { useAuth } from '@/core/auth/AuthContext';
import { useCallback, useEffect, useRef, useState } from 'react';
// Simple logger utility for frontend
const logger = {
  debug: (...args: any[]) => console.debug('[WebSocket]', ...args),
  info: (...args: any[]) => console.info('[WebSocket]', ...args),
  warn: (...args: any[]) => console.warn('[WebSocket]', ...args),
  error: (...args: any[]) => console.error('[WebSocket]', ...args),
};
export type ExecutionEventType = 
  | 'connected'
  | 'execution-update'
  | 'node_start'
  | 'node_complete'
  | 'node_error'
  | 'connection_data'
  | 'agent_reasoning_step'
  | 'agent_tool_call'
  | 'agent_decision';
export interface ExecutionEvent {
  type: ExecutionEventType;
  executionId: string;
  nodeId?: string;
  connectionId?: string;
  agentId?: string;
  data?: any;
  timestamp: string;
  [key: string]: any;
}
export interface NodeExecutionState {
  nodeId: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  startedAt?: number;
  completedAt?: number;
  duration?: number;
  inputData?: any;
  outputData?: any;
  error?: string;
}
export interface ConnectionData {
  connectionId: string;
  fromNodeId: string;
  toNodeId: string;
  data: any;
  timestamp: number;
}
export interface AgentReasoningEvent {
  agentId: string;
  thought?: any;
  toolCall?: any;
  decision?: any;
  totalThoughts?: number;
  totalToolCalls?: number;
  totalDecisions?: number;
}
interface UseExecutionWebSocketOptions {
  executionId: string | null;
  onNodeUpdate?: (nodeState: NodeExecutionState) => void;
  onConnectionData?: (data: ConnectionData) => void;
  onAgentReasoning?: (event: AgentReasoningEvent) => void;
  onExecutionUpdate?: (update: any) => void;
  enabled?: boolean;
}
export function useExecutionWebSocket({
  executionId,
  onNodeUpdate,
  onConnectionData,
  onAgentReasoning,
  onExecutionUpdate,
  enabled = true,
}: UseExecutionWebSocketOptions) {
  const { isAuthenticated, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const baseReconnectDelay = 1000; // Start with 1 second
  // Event handlers refs to avoid stale closures
  const handlersRef = useRef({
    onNodeUpdate,
    onConnectionData,
    onAgentReasoning,
    onExecutionUpdate,
  });
  // Update handlers ref when callbacks change
  useEffect(() => {
    handlersRef.current = {
      onNodeUpdate,
      onConnectionData,
      onAgentReasoning,
      onExecutionUpdate,
    };
  }, [onNodeUpdate, onConnectionData, onAgentReasoning, onExecutionUpdate]);
  // Calculate exponential backoff delay
  const getReconnectDelay = useCallback(() => {
    return Math.min(baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current), 30000); // Max 30 seconds
  }, []);
  // Handle WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data: ExecutionEvent = JSON.parse(event.data);
      switch (data.type) {
        case 'connected':
          setIsConnected(true);
          setConnectionError(null);
          reconnectAttemptsRef.current = 0;
          logger.debug('WebSocket connected', { executionId: data.executionId });
          break;
        case 'node_start':
          if (data.nodeId && handlersRef.current.onNodeUpdate) {
            handlersRef.current.onNodeUpdate({
              nodeId: data.nodeId,
              status: 'running',
              startedAt: Date.now(),
              inputData: data.data?.input || data.data?.inputData,
            });
          }
          break;
        case 'node_complete':
          if (data.nodeId && handlersRef.current.onNodeUpdate) {
            handlersRef.current.onNodeUpdate({
              nodeId: data.nodeId,
              status: 'success',
              completedAt: Date.now(),
              outputData: data.data?.output || data.data?.outputData,
              duration: data.data?.duration,
            });
          }
          break;
        case 'node_error':
          if (data.nodeId && handlersRef.current.onNodeUpdate) {
            handlersRef.current.onNodeUpdate({
              nodeId: data.nodeId,
              status: 'error',
              completedAt: Date.now(),
              error: data.data?.error || data.data?.errorMessage,
              duration: data.data?.duration,
            });
          }
          break;
        case 'connection_data':
          if (handlersRef.current.onConnectionData) {
            handlersRef.current.onConnectionData({
              connectionId: data.connectionId || '',
              fromNodeId: data.data?.fromNodeId || '',
              toNodeId: data.data?.toNodeId || '',
              data: data.data?.data,
              timestamp: Date.now(),
            });
          }
          break;
        case 'agent_reasoning_step':
        case 'agent_tool_call':
        case 'agent_decision':
          if (data.agentId && handlersRef.current.onAgentReasoning) {
            handlersRef.current.onAgentReasoning({
              agentId: data.agentId,
              thought: data.type === 'agent_reasoning_step' ? data.data?.thought : undefined,
              toolCall: data.type === 'agent_tool_call' ? data.data?.toolCall : undefined,
              decision: data.type === 'agent_decision' ? data.data?.decision : undefined,
              totalThoughts: data.data?.totalThoughts,
              totalToolCalls: data.data?.totalToolCalls,
              totalDecisions: data.data?.totalDecisions,
            });
          }
          break;
        case 'execution-update':
          if (handlersRef.current.onExecutionUpdate) {
            handlersRef.current.onExecutionUpdate(data);
          }
          break;
        default:
          logger.warn('Unknown WebSocket event type', { type: data.type });
      }
    } catch (error: any) {
      logger.error('Failed to parse WebSocket message', { error: error.message, data: event.data });
    }
  }, []);
  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (!executionId || !enabled || !isAuthenticated) {
      return;
    }
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    try {
      // Get WebSocket URL - construct full backend URL for WebSocket
      // Backend route is registered at /api/v1/workflows/:executionId/stream
      // WebSocket connections can't send headers, so we need to get auth token for query param or cookie
      // For development, connect directly to backend to bypass Vite proxy limitations
      const backendUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:8001'
        : window.location.origin;
      const apiUrl = `${backendUrl}/api/v1/workflows/${executionId}/stream`;
      let wsUrl = apiUrl.replace(/^http/, 'ws');
      // Try to get auth token for WebSocket connection (if needed)
      // Note: WebSocket auth typically uses cookies set by regular HTTP requests
      // If cookies don't work, we might need to pass token as query param
      try {
        const { getAuthHeaders } = await import('../../../core/api/api.config');
        const headers = await getAuthHeaders();
        const token = headers['Authorization']?.replace('Bearer ', '');
        if (token) {
          // Add token as query parameter if cookies aren't working
          wsUrl += `?token=${encodeURIComponent(token)}`;
        }
      } catch (err) {
        console.warn('[DEBUG] Could not get auth token for WebSocket', err);
      }
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4eca190d-c843-4d4a-a868-56d71e69b49f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useExecutionWebSocket.ts:249',message:'WebSocket opened',data:{executionId,wsUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        logger.info('WebSocket connection opened', { executionId });
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
      };
      ws.onmessage = handleMessage;
      ws.onerror = (error) => {
        console.error('[DEBUG] WebSocket error', { executionId, error });
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4eca190d-c843-4d4a-a868-56d71e69b49f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useExecutionWebSocket.ts:259',message:'WebSocket error',data:{executionId,error:error?.toString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        logger.error('WebSocket error', { executionId, error });
        setConnectionError('WebSocket connection error');
        setIsConnected(false);
      };
      ws.onclose = (event) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/4eca190d-c843-4d4a-a868-56d71e69b49f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useExecutionWebSocket.ts:265',message:'WebSocket closed',data:{executionId,code:event.code,reason:event.reason},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        logger.info('WebSocket connection closed', { executionId, code: event.code, reason: event.reason });
        setIsConnected(false);
        // Attempt to reconnect if not a normal closure and we haven't exceeded max attempts
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts && enabled) {
          const delay = getReconnectDelay();
          reconnectAttemptsRef.current += 1;
          logger.info('Attempting to reconnect WebSocket', {
            executionId,
            attempt: reconnectAttemptsRef.current,
            delay,
          });
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionError('Failed to reconnect after maximum attempts');
          logger.error('WebSocket reconnection failed', { executionId, attempts: reconnectAttemptsRef.current });
        }
      };
      wsRef.current = ws;
    } catch (error: any) {
      logger.error('Failed to create WebSocket connection', { executionId, error: error.message });
      setConnectionError(error.message);
      setIsConnected(false);
    }
  }, [executionId, enabled, isAuthenticated, handleMessage, getReconnectDelay]);
  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);
  // Connect when executionId changes
  useEffect(() => {
    if (executionId && enabled && isAuthenticated) {
      connect().catch((error) => {
        console.error('[DEBUG] WebSocket connect error', error);
        logger.error('Failed to connect WebSocket', { executionId, error });
      });
    } else {
      disconnect();
    }
    return () => {
      disconnect();
    };
  }, [executionId, enabled, isAuthenticated, connect, disconnect]);
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);
  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
  };
}
