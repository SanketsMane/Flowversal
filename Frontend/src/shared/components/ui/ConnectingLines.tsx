import { useEffect, useState } from 'react';

interface ConnectionPoint {
  x: number;
  y: number;
}

interface Connection {
  id: string;
  from: ConnectionPoint;
  to: ConnectionPoint;
  type: 'main' | 'sub';
  color: string;
}

interface ConnectingLinesProps {
  containerRef: React.RefObject<HTMLDivElement>;
  connections: {
    // Main branch: Triggers → Workflow Steps
    triggerToSteps?: boolean;
    // Sub-branches
    triggerChildren?: number; // number of added triggers
    stepFormFields?: { stepIndex: number; fieldCount: number }[];
    stepNodes?: { stepIndex: number; nodeCount: number }[];
    nodeTools?: { stepIndex: number; nodeIndex: number; toolCount: number }[];
  };
}

export function ConnectingLines({ containerRef, connections }: ConnectingLinesProps) {
  const [lines, setLines] = useState<Connection[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const calculateLines = () => {
      const newLines: Connection[] = [];
      const container = containerRef.current;
      if (!container) return;

      // Main branch: Trigger Box → Workflow Steps
      if (connections.triggerToSteps) {
        const triggerBox = container.querySelector('[data-connection-id="trigger-box"]');
        const workflowSteps = container.querySelectorAll('[data-connection-type="workflow-step"]');
        
        if (triggerBox && workflowSteps.length > 0) {
          const triggerRect = triggerBox.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          workflowSteps.forEach((step, index) => {
            const stepRect = step.getBoundingClientRect();
            
            newLines.push({
              id: `trigger-to-step-${index}`,
              from: {
                x: triggerRect.right - containerRect.left,
                y: triggerRect.top + triggerRect.height / 2 - containerRect.top
              },
              to: {
                x: stepRect.left - containerRect.left,
                y: stepRect.top + stepRect.height / 2 - containerRect.top
              },
              type: 'main',
              color: 'url(#gradient-main)'
            });
          });
        }
      }

      // Sub-branch: Trigger Box → Added Triggers
      if (connections.triggerChildren && connections.triggerChildren > 0) {
        const triggerBox = container.querySelector('[data-connection-id="trigger-box"]');
        const addedTriggers = container.querySelectorAll('[data-connection-type="added-trigger"]');
        
        if (triggerBox && addedTriggers.length > 0) {
          const triggerRect = triggerBox.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          addedTriggers.forEach((trigger, index) => {
            const triggerElemRect = trigger.getBoundingClientRect();
            
            newLines.push({
              id: `trigger-to-added-${index}`,
              from: {
                x: triggerRect.right - containerRect.left,
                y: triggerRect.bottom - containerRect.top
              },
              to: {
                x: triggerElemRect.left - containerRect.left,
                y: triggerElemRect.top + triggerElemRect.height / 2 - containerRect.top
              },
              type: 'sub',
              color: 'url(#gradient-sub)'
            });
          });
        }
      }

      // Sub-branch: Workflow Step → Form Fields
      if (connections.stepFormFields) {
        connections.stepFormFields.forEach(({ stepIndex, fieldCount }) => {
          const step = container.querySelector(`[data-connection-id="step-${stepIndex}"]`);
          const fields = container.querySelectorAll(`[data-connection-id="step-${stepIndex}-field"]`);
          
          if (step && fields.length > 0) {
            const stepRect = step.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            fields.forEach((field, index) => {
              const fieldRect = field.getBoundingClientRect();
              
              newLines.push({
                id: `step-${stepIndex}-to-field-${index}`,
                from: {
                  x: stepRect.right - containerRect.left,
                  y: stepRect.bottom - containerRect.top
                },
                to: {
                  x: fieldRect.left - containerRect.left,
                  y: fieldRect.top + fieldRect.height / 2 - containerRect.top
                },
                type: 'sub',
                color: 'url(#gradient-sub)'
              });
            });
          }
        });
      }

      // Sub-branch: Workflow Step → Nodes
      if (connections.stepNodes) {
        connections.stepNodes.forEach(({ stepIndex, nodeCount }) => {
          const step = container.querySelector(`[data-connection-id="step-${stepIndex}"]`);
          const nodes = container.querySelectorAll(`[data-connection-id="step-${stepIndex}-node"]`);
          
          if (step && nodes.length > 0) {
            const stepRect = step.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            nodes.forEach((node, index) => {
              const nodeRect = node.getBoundingClientRect();
              
              newLines.push({
                id: `step-${stepIndex}-to-node-${index}`,
                from: {
                  x: stepRect.right - containerRect.left,
                  y: stepRect.bottom - containerRect.top
                },
                to: {
                  x: nodeRect.left - containerRect.left,
                  y: nodeRect.top + nodeRect.height / 2 - containerRect.top
                },
                type: 'sub',
                color: 'url(#gradient-sub)'
              });
            });
          }
        });
      }

      // Sub-branch: Node → Tools
      if (connections.nodeTools) {
        connections.nodeTools.forEach(({ stepIndex, nodeIndex, toolCount }) => {
          const node = container.querySelector(`[data-connection-id="node-${stepIndex}-${nodeIndex}"]`);
          const tools = container.querySelectorAll(`[data-connection-id="node-${stepIndex}-${nodeIndex}-tool"]`);
          
          if (node && tools.length > 0) {
            const nodeRect = node.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            tools.forEach((tool, index) => {
              const toolRect = tool.getBoundingClientRect();
              
              newLines.push({
                id: `node-${stepIndex}-${nodeIndex}-to-tool-${index}`,
                from: {
                  x: nodeRect.right - containerRect.left,
                  y: nodeRect.top + nodeRect.height / 2 - containerRect.top
                },
                to: {
                  x: toolRect.left - containerRect.left,
                  y: toolRect.top + toolRect.height / 2 - containerRect.top
                },
                type: 'sub',
                color: 'url(#gradient-sub)'
              });
            });
          }
        });
      }

      setLines(newLines);
    };

    calculateLines();
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateLines);
    
    // Use MutationObserver to recalculate when DOM changes
    const observer = new MutationObserver(calculateLines);
    observer.observe(container, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('resize', calculateLines);
      observer.disconnect();
    };
  }, [containerRef, connections]);

  if (lines.length === 0) return null;

  // Calculate SVG viewBox to fit all lines
  const maxX = Math.max(...lines.flatMap(l => [l.from.x, l.to.x]), 0);
  const maxY = Math.max(...lines.flatMap(l => [l.from.y, l.to.y]), 0);

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none z-0"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
      viewBox={`0 0 ${maxX + 100} ${maxY + 100}`}
    >
      <defs>
        {/* Main branch gradient */}
        <linearGradient id="gradient-main" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00C6FF" />
          <stop offset="50%" stopColor="#9D50BB" />
          <stop offset="100%" stopColor="#00C6FF" />
        </linearGradient>
        
        {/* Sub-branch gradient */}
        <linearGradient id="gradient-sub" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00C6FF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#9D50BB" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {lines.map((line) => {
        // Create a smooth bezier curve
        const midX = (line.from.x + line.to.x) / 2;
        const path = `M ${line.from.x} ${line.from.y} C ${midX} ${line.from.y}, ${midX} ${line.to.y}, ${line.to.x} ${line.to.y}`;

        return (
          <g key={line.id}>
            {/* The line */}
            <path
              d={path}
              stroke={line.color}
              strokeWidth={line.type === 'main' ? 3 : 2}
              fill="none"
              opacity={line.type === 'main' ? 0.8 : 0.5}
              strokeLinecap="round"
            />
            
            {/* Connection dots */}
            <circle
              cx={line.from.x}
              cy={line.from.y}
              r={line.type === 'main' ? 5 : 4}
              fill={line.color}
              opacity="0.9"
            />
            <circle
              cx={line.to.x}
              cy={line.to.y}
              r={line.type === 'main' ? 5 : 4}
              fill={line.color}
              opacity="0.9"
            />
          </g>
        );
      })}
    </svg>
  );
}
