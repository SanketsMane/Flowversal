import websocket from '@fastify/websocket';
import { FastifyPluginAsync } from 'fastify';
import { env } from '../../../core/config/env';
import jwt from 'jsonwebtoken';
import { logger } from '../../../shared/utils/logger.util';
import { WorkflowExecutionModel } from '../models/WorkflowExecution.model';

interface WebSocketConnection {
  userId: string;
  executionId?: string;
  workflowId?: string;
  socket: any;
}

// Store active WebSocket connections
const activeConnections = new Map<string, WebSocketConnection[]>();

const workflowWebSocketRoutes: FastifyPluginAsync = async (fastify) => {
  // Register WebSocket support
  await fastify.register(websocket);

  // WebSocket endpoint for real-time workflow execution updates
  fastify.get('/:executionId/stream', { websocket: true }, async (connection, req) => {
    const executionId = (req.params as any).executionId as string;
    let userId = (req as any).user?.id;

    // If no user from auth plugin, try to authenticate via token query parameter
    // Now using unified local JWT verification - Author: Sanket
    if (!userId) {
      const token = (req.query as any)?.token;
      if (token) {
        try {
          const decoded: any = jwt.verify(token, env.JWT_SECRET);
          userId = decoded.sub || decoded.user_id || decoded.userId || decoded.id;
          if (userId) {
            logger.debug('WebSocket authenticated via token query param', { executionId, userId });
          }
        } catch (err) {
          logger.warn('WebSocket token verification failed', { executionId, error: err });
        }
      }
    }

    if (!userId) {
      logger.warn('WebSocket connection rejected: no valid authentication', { executionId });
      connection.socket.close(1008, 'Unauthorized');
      return;
    }

    logger.info('WebSocket connection established', { executionId, userId });

    // Store connection
    if (!activeConnections.has(executionId)) {
      activeConnections.set(executionId, []);
    }
    const connections = activeConnections.get(executionId)!;
    connections.push({
      userId,
      executionId,
      socket: connection.socket,
    });

    // Send initial connection confirmation
    connection.socket.send(
      JSON.stringify({
        type: 'connected',
        executionId,
        timestamp: new Date().toISOString(),
      })
    );

    // Set up polling to check for execution updates
    const pollInterval = setInterval(async () => {
      try {
        const execution = await WorkflowExecutionModel.findById(executionId).lean();
        if (execution) {
          // Send update to all connections for this execution
          const exec = execution as any;
          const update = {
            type: 'execution-update',
            executionId,
            status: exec.status,
            progress: exec.progress || 0,
            currentStep: exec.currentStep || null,
            stepsExecuted: exec.stepsExecuted || 0,
            totalSteps: exec.totalSteps || 0,
            result: exec.result || null,
            error: exec.error || null,
            timestamp: new Date().toISOString(),
          };

          connections.forEach((conn) => {
            if (conn.socket && conn.socket.readyState === 1) {
              try {
                conn.socket.send(JSON.stringify(update));
              } catch (error) {
                logger.error('Error sending WebSocket message', { error });
              }
            }
          });

          // If execution is complete, close connections after a delay
          if (exec.status === 'completed' || exec.status === 'failed') {
            setTimeout(() => {
              connections.forEach((conn) => {
                if (conn.socket && conn.socket.readyState === 1) {
                  conn.socket.close(1000, 'Execution completed');
                }
              });
              activeConnections.delete(executionId);
            }, 5000); // Close after 5 seconds
          }
        }
      } catch (error) {
        logger.error('Error polling execution updates', { executionId, error });
      }
    }, 1000); // Poll every second

    // Handle connection close
    connection.socket.on('close', () => {
      logger.info('WebSocket connection closed', { executionId, userId });
      clearInterval(pollInterval);

      // Remove connection from active connections
      const conns = activeConnections.get(executionId);
      if (conns) {
        const index = conns.findIndex((c) => c.userId === userId);
        if (index !== -1) {
          conns.splice(index, 1);
        }
        if (conns.length === 0) {
          activeConnections.delete(executionId);
        }
      }
    });

    // Handle errors
    connection.socket.on('error', (error: Error) => {
      logger.error('WebSocket error', { executionId, userId, error });
      clearInterval(pollInterval);
    });
  });

  // WebSocket endpoint for workflow-level updates (all executions for a workflow)
  fastify.get('/workflow/:workflowId/stream', { websocket: true }, (connection, req) => {
    const workflowId = (req.params as any).workflowId as string;
    const userId = (req as any).user?.id;

    if (!userId) {
      connection.socket.close(1008, 'Unauthorized');
      return;
    }

    logger.info('WebSocket workflow connection established', { workflowId, userId });

    // Store connection
    const connectionKey = `workflow-${workflowId}`;
    if (!activeConnections.has(connectionKey)) {
      activeConnections.set(connectionKey, []);
    }
    const connections = activeConnections.get(connectionKey)!;
    connections.push({
      userId,
      workflowId,
      socket: connection.socket,
    });

    // Send initial connection confirmation
    connection.socket.send(
      JSON.stringify({
        type: 'connected',
        workflowId,
        timestamp: new Date().toISOString(),
      })
    );

    // Set up polling to check for workflow execution updates
    const pollInterval = setInterval(async () => {
      try {
        const executions = await WorkflowExecutionModel.find({
          workflowId,
          userId,
          status: { $in: ['running', 'pending'] },
        })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();

        if (executions.length > 0) {
          const update = {
            type: 'workflow-updates',
            workflowId,
            executions: executions.map((exec: any) => ({
              id: exec._id.toString(),
              status: exec.status,
              progress: exec.progress || 0,
              currentStep: exec.currentStep || null,
              stepsExecuted: exec.stepsExecuted || 0,
              totalSteps: exec.totalSteps || 0,
            })),
            timestamp: new Date().toISOString(),
          };

          connections.forEach((conn) => {
            if (conn.socket && conn.socket.readyState === 1) {
              try {
                conn.socket.send(JSON.stringify(update));
              } catch (error) {
                logger.error('Error sending WebSocket message', { error });
              }
            }
          });
        }
      } catch (error) {
        logger.error('Error polling workflow updates', { workflowId, error });
      }
    }, 2000); // Poll every 2 seconds for workflow-level updates

    // Handle connection close
    connection.socket.on('close', () => {
      logger.info('WebSocket workflow connection closed', { workflowId, userId });
      clearInterval(pollInterval);

      // Remove connection
      const conns = activeConnections.get(connectionKey);
      if (conns) {
        const index = conns.findIndex((c) => c.userId === userId);
        if (index !== -1) {
          conns.splice(index, 1);
        }
        if (conns.length === 0) {
          activeConnections.delete(connectionKey);
        }
      }
    });

    // Handle errors
    connection.socket.on('error', (error: Error) => {
      logger.error('WebSocket workflow error', { workflowId, userId, error });
      clearInterval(pollInterval);
    });
  });
};

// Execution event types for n8n-style visualization
export type ExecutionEventType = 
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
  timestamp: number;
}

// Helper function to broadcast execution updates (can be called from workflow execution service)
export function broadcastExecutionUpdate(executionId: string, update: any) {
  const connections = activeConnections.get(executionId);
  if (connections) {
    const message = JSON.stringify({
      type: 'execution-update',
      executionId,
      ...update,
      timestamp: new Date().toISOString(),
    });

    connections.forEach((conn) => {
      if (conn.socket && conn.socket.readyState === 1) {
        try {
          conn.socket.send(message);
        } catch (error) {
          logger.error('Error broadcasting execution update', { error });
        }
      }
    });
  }
}

// Enhanced broadcast function for node-level events
export function broadcastNodeEvent(executionId: string, event: ExecutionEvent) {
  // #region agent log
  // BUG-FIX: Removed hardcoded filesystem logging - Sanket
  // #endregion
  const connections = activeConnections.get(executionId);
  if (connections) {
    const message = JSON.stringify({
      ...event,
      timestamp: new Date().toISOString(),
    });
    // #region agent log
    // BUG-FIX: Removed hardcoded filesystem logging - Sanket
    // #endregion

    connections.forEach((conn) => {
      if (conn.socket && conn.socket.readyState === 1) {
        try {
          conn.socket.send(message);
          // #region agent log
          // BUG-FIX: Removed hardcoded filesystem logging - Sanket
          // #endregion
        } catch (error: any) {
          // #region agent log
          // BUG-FIX: Removed hardcoded filesystem logging - Sanket
          // #endregion
          logger.error('Error broadcasting node event', { error, eventType: event.type });
        }
      } else {
        // #region agent log
        // BUG-FIX: Removed hardcoded filesystem logging - Sanket
        // #endregion
      }
    });
  } else {
    // #region agent log
    // BUG-FIX: Removed hardcoded filesystem logging - Sanket
    // #endregion
  }
}

// Broadcast agent reasoning events
export function broadcastAgentEvent(executionId: string, agentId: string, eventType: 'agent_reasoning_step' | 'agent_tool_call' | 'agent_decision', data: any) {
  broadcastNodeEvent(executionId, {
    type: eventType,
    executionId,
    agentId,
    data,
    timestamp: Date.now(),
  });
}

export default workflowWebSocketRoutes;
