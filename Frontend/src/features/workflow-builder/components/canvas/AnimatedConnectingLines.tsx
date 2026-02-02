/**
 * Animated Connecting Lines Component
 * Renders SVG lines with marching ants animation, [+] buttons, and [bin] buttons
 */

import { Plus, X, Trash2 } from 'lucide-react';
import { useTheme } from '../../../../components/ThemeContext';
import { useUIStore, useWorkflowStore } from '../../stores';
import { useState } from 'react';

interface LineSegment {
  id: string;
  from: { x: number; y: number; type: 'trigger' | 'step' | 'node' | 'field' | 'branch' };
  to: { x: number; y: number; type: 'trigger' | 'step' | 'node' | 'field' | 'branch' };
  label?: string; // For "True"/"False" labels on If/Switch branches
  containerId?: string; // For adding nodes to specific container
  branchType?: 'true' | 'false' | string; // For branch identification
  triggerId?: string; // For trigger-to-step connections
}

export function AnimatedConnectingLines() {
  const { theme } = useTheme();
  const { containers, triggers, deleteContainer, deleteTrigger } = useWorkflowStore();
  const { openNodePicker } = useUIStore();
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);

  // Calculate line segments
  const lineSegments: LineSegment[] = [];

  // Account for SVG starting at top: 80px
  const svgOffsetY = -80;

  // 1. Connect triggers to first step
  if (triggers.length > 0 && containers.length > 0) {
    triggers.forEach((trigger, idx) => {
      lineSegments.push({
        id: `trigger-${trigger.id}-to-container-0`,
        from: { x: 600, y: 100 + idx * 120 + svgOffsetY, type: 'trigger' },
        to: { x: 600, y: 300 + svgOffsetY, type: 'step' },
        containerId: containers[0].id,
        triggerId: trigger.id,
      });
    });
  }

  // 2. Connect steps to each other
  containers.forEach((container, idx) => {
    if (idx < containers.length - 1) {
      lineSegments.push({
        id: `container-${container.id}-to-${containers[idx + 1].id}`,
        from: { x: 600, y: 300 + idx * 400 + svgOffsetY, type: 'step' },
        to: { x: 600, y: 300 + (idx + 1) * 400 + svgOffsetY, type: 'step' },
        containerId: containers[idx + 1].id,
      });
    }
  });

  const strokeColor = theme === 'dark' ? '#00C6FF' : '#0EA5E9';
  const buttonBg = theme === 'dark' ? 'rgba(26, 26, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)';

  const handleDeleteConnection = (segment: LineSegment) => {
    // If it's a trigger connection, delete the trigger
    if (segment.triggerId) {
      const confirmed = window.confirm('Delete this trigger connection?');
      if (confirmed) {
        deleteTrigger(segment.triggerId);
      }
    }
    // If it's a step connection, delete the target container
    else if (segment.containerId) {
      const container = containers.find(c => c.id === segment.containerId);
      if (container && container.nodes.length > 0) {
        const confirmed = window.confirm('This step contains nodes. Are you sure you want to delete it?');
        if (!confirmed) return;
      }
      if (segment.containerId) {
        deleteContainer(segment.containerId);
      }
    }
  };

  const handleAddSubstepBetween = (segment: LineSegment) => {
    // Find the index where we should insert the new container
    const fromContainerIndex = containers.findIndex(c => 
      segment.id.includes(`container-${c.id}`)
    );
    
    if (fromContainerIndex !== -1 && fromContainerIndex < containers.length - 1) {
      // We're inserting between two steps
      // The new container should be inserted at position fromContainerIndex + 1
      openNodePicker('container', undefined, undefined, undefined, fromContainerIndex + 1);
    } else if (segment.triggerId) {
      // It's a trigger-to-first-step connection
      // Insert at the beginning (index 0)
      openNodePicker('container', undefined, undefined, undefined, 0);
    }
  };

  return (
    <svg
      className="absolute"
      style={{
        top: '80px', // Start below header
        left: 0,
        width: '100%',
        height: 'calc(100% - 80px)', // Exclude header
        pointerEvents: 'none',
        zIndex: 0, // Behind containers - changed from 2 to 0
      }}
    >
      {/* Define marching ants animation */}
      <defs>
        <style>
          {`
            @keyframes marching-ants {
              0% {
                stroke-dashoffset: 0;
              }
              100% {
                stroke-dashoffset: 20;
              }
            }
            .animated-line {
              stroke-dasharray: 8 4;
              animation: marching-ants 0.5s linear infinite;
            }
            .add-button-group {
              pointer-events: all;
              cursor: pointer;
              transition: all 0.2s;
            }
            .add-button-group:hover .add-button-circle {
              fill: ${strokeColor};
            }
            .add-button-group:hover .add-button-icon {
              stroke: white;
            }
          `}
        </style>

        {/* Arrow marker */}
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill={strokeColor} />
        </marker>
      </defs>

      {/* Render line segments */}
      {lineSegments.map((segment) => {
        const midX = (segment.from.x + segment.to.x) / 2;
        const midY = (segment.from.y + segment.to.y) / 2;
        const isHovered = hoveredLine === segment.id;

        return (
          <g 
            key={segment.id}
            onMouseEnter={() => setHoveredLine(segment.id)}
            onMouseLeave={() => setHoveredLine(null)}
            style={{ pointerEvents: 'all' }}
          >
            {/* Invisible wide line for easier hover detection */}
            <line
              x1={segment.from.x}
              y1={segment.from.y}
              x2={segment.to.x}
              y2={segment.to.y}
              stroke="transparent"
              strokeWidth="20"
              style={{ pointerEvents: 'all', cursor: 'pointer' }}
            />

            {/* Animated line */}
            <line
              x1={segment.from.x}
              y1={segment.from.y}
              x2={segment.to.x}
              y2={segment.to.y}
              className="animated-line"
              stroke={isHovered ? '#FF6B6B' : strokeColor}
              strokeWidth={isHovered ? '3' : '2'}
              markerEnd="url(#arrowhead)"
              style={{ pointerEvents: 'none' }}
            />

            {/* Label (for branches) */}
            {segment.label && (
              <text
                x={segment.from.x + 20}
                y={midY - 10}
                fill={strokeColor}
                fontSize="12"
                fontWeight="600"
                style={{ pointerEvents: 'none' }}
              >
                {segment.label}
              </text>
            )}

            {/* Buttons - Show both [+] and [bin] when hovered */}
            {isHovered ? (
              <>
                {/* Delete Button (Bin Icon) - positioned to the left */}
                <g
                  className="add-button-group"
                  onClick={() => handleDeleteConnection(segment)}
                  onMouseEnter={() => setHoveredLine(segment.id)}
                >
                  {/* Button background circle */}
                  <circle
                    cx={midX - 25}
                    cy={midY}
                    r="14"
                    fill="rgba(239, 68, 68, 0.9)"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  
                  {/* Trash icon */}
                  <g transform={`translate(${midX - 25 - 6}, ${midY - 6})`}>
                    {/* Bin body */}
                    <rect x="2" y="4" width="8" height="7" rx="1" stroke="white" strokeWidth="1.5" fill="none" />
                    {/* Bin lid */}
                    <line x1="1" y1="4" x2="11" y2="4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    {/* Bin handle */}
                    <path d="M4 4 V2.5 C4 2 4.5 1.5 5 1.5 H7 C7.5 1.5 8 2 8 2.5 V4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </g>
                </g>

                {/* Add Substep Button (Plus Icon) - positioned to the right */}
                <g
                  className="add-button-group"
                  onClick={() => handleAddSubstepBetween(segment)}
                  onMouseEnter={() => setHoveredLine(segment.id)}
                >
                  {/* Button background circle */}
                  <circle
                    cx={midX + 25}
                    cy={midY}
                    r="14"
                    fill={buttonBg}
                    stroke={strokeColor}
                    strokeWidth="2"
                  />
                  
                  {/* Plus icon */}
                  <g transform={`translate(${midX + 25 - 6}, ${midY - 6})`}>
                    <line x1="6" y1="2" x2="6" y2="10" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
                    <line x1="2" y1="6" x2="10" y2="6" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
                  </g>
                </g>
              </>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}