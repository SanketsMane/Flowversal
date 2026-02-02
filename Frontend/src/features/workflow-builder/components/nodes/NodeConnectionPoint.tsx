/**
 * Node Connection Point Component
 * Shows output connection point on the right side of regular workflow nodes
 * Enables connecting nodes in sequence
 */

import { useTheme } from '../../../../components/ThemeContext';

interface NodeConnectionPointProps {
  nodeId: string;
}

export function NodeConnectionPoint({ nodeId }: NodeConnectionPointProps) {
  const { theme } = useTheme();
  
  return (
    <div
      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full border-2 pointer-events-none z-20"
      style={{
        backgroundColor: '#00C6FF',
        borderColor: theme === 'dark' ? '#1A1A2E' : '#fff',
        boxShadow: '0 0 8px #00C6FF, 0 0 12px #00C6FF80',
      }}
      data-connection-point="node-output"
      data-node-output-id={nodeId}
    />
  );
}
