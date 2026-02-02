/**
 * Visual Execution Overlay
 * Shows animated play/check/error icons on nodes during execution
 * Enhanced with WebSocket integration and data flow visualization (n8n-style)
 */

import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { ConnectionDataPreview } from '../connections/ConnectionDataPreview';
import { DataFlowRenderer } from '../connections/DataFlowRenderer';

export interface NodeExecutionState {
  id: string; // Node or trigger ID
  status: 'pending' | 'running' | 'success' | 'error';
  position: { x: number; y: number }; // Screen position
  type: 'trigger' | 'node';
  inputData?: any;
  outputData?: any;
  duration?: number;
  error?: string;
}

export interface ConnectionDataFlow {
  connectionId: string;
  fromNodeId: string;
  toNodeId: string;
  data: any;
  timestamp: number;
  active: boolean;
}

interface VisualExecutionOverlayProps {
  nodeStates: NodeExecutionState[];
  isExecuting: boolean;
  connectionDataFlows?: ConnectionDataFlow[];
  onConnectionHover?: (connectionId: string | null) => void;
}

export function VisualExecutionOverlay({ 
  nodeStates, 
  isExecuting,
  connectionDataFlows = [],
  onConnectionHover,
}: VisualExecutionOverlayProps) {
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null);

  if (!isExecuting && nodeStates.length === 0 && connectionDataFlows.length === 0) {
    return null;
  }

  const handleConnectionHover = (connectionId: string | null) => {
    setHoveredConnection(connectionId);
    if (onConnectionHover) {
      onConnectionHover(connectionId);
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[60]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Data Flow Visualization */}
      {connectionDataFlows.length > 0 && (
        <DataFlowRenderer
          connections={connectionDataFlows}
          nodeStates={nodeStates}
          onConnectionHover={handleConnectionHover}
        />
      )}

      {/* Connection Data Preview */}
      {hoveredConnection && (
        <ConnectionDataPreview
          connectionId={hoveredConnection}
          data={connectionDataFlows.find(c => c.connectionId === hoveredConnection)?.data}
          position={{ x: 0, y: 0 }} // Will be calculated based on connection position
        />
      )}

      {/* Node Execution Indicators */}
      <AnimatePresence>
        {nodeStates.map((nodeState) => {
          console.log('[DEBUG] VisualExecutionOverlay: Rendering node indicator', { nodeId: nodeState.id, status: nodeState.status, position: nodeState.position });
          return <ExecutionIndicator key={nodeState.id} nodeState={nodeState} />;
        })}
      </AnimatePresence>
    </div>
  );
}

function ExecutionIndicator({ nodeState }: { nodeState: NodeExecutionState }) {
  const getIcon = () => {
    switch (nodeState.status) {
      case 'running':
        return <Loader2 className="w-8 h-8 animate-spin text-blue-400" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-red-400" />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (nodeState.status) {
      case 'running':
        return 'bg-blue-500/20 border-blue-500';
      case 'success':
        return 'bg-green-500/20 border-green-500';
      case 'error':
        return 'bg-red-500/20 border-red-500';
      default:
        return 'bg-gray-500/20 border-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'absolute',
        left: nodeState.position.x,
        top: nodeState.position.y,
        transform: 'translate(-50%, -50%)',
      }}
      className={`w-16 h-16 rounded-full border-2 ${getBgColor()} flex items-center justify-center backdrop-blur-sm`}
    >
      {getIcon()}
      
      {/* Ripple effect for running state */}
      {nodeState.status === 'running' && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-400"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-400"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}

      {/* Success pulse */}
      {nodeState.status === 'success' && (
        <motion.div
          className="absolute inset-0 rounded-full bg-green-400"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}

      {/* Error shake */}
      {nodeState.status === 'error' && (
        <motion.div
          className="absolute inset-0"
          initial={{ x: 0 }}
          animate={{ x: [-4, 4, -4, 4, 0] }}
          transition={{ duration: 0.4 }}
        />
      )}
    </motion.div>
  );
}