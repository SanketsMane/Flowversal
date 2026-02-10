/**
 * MANUAL CONNECTION RENDERER - Screen Space Approach
 * Uses screen coordinates and recalculates constantly for perfect alignment
 * Displays connection lines with hover effects, delete bin icon, and insert substep plus icon
 */
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useConnectionStore, Connection } from '@/features/workflow-builder/stores/connectionStore';
import { useViewport } from '../../contexts/ViewportContext';
import { useWorkflowStore, useUIStore } from '../../stores';
export function ManualConnectionRenderer() {
  const { theme } = useTheme();
  const { connections, dragConnection, removeConnection } = useConnectionStore();
  const { viewport, connectionUpdateCounter, containerRef } = useViewport();
  const { containers, insertContainerAt } = useWorkflowStore();
  const { openNodePicker } = useUIStore();
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; connectionId: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [, forceUpdate] = useState({});
  // Get screen position of a connection point relative to the SVG
  const getRelativePosition = (id: string, side: 'left' | 'right', branchOutput?: string): { x: number; y: number } | null => {
    let selector: string;
    if (branchOutput) {
      selector = `[data-connection-point][data-owner-id=\"${id}\"][data-branch-output=\"${branchOutput}\"]`;
    } else {
      selector = `[data-connection-point][data-owner-id=\"${id}\"][data-side=\"${side}\"]`;
    }
    const element = document.querySelector(selector) as HTMLElement;
    if (!element || !svgRef.current) return null;
    // Get bounding boxes
    const elementRect = element.getBoundingClientRect();
    const svgRect = svgRef.current.getBoundingClientRect();
    // Calculate center of element
    const elementCenterX = elementRect.left + elementRect.width / 2;
    const elementCenterY = elementRect.top + elementRect.height / 2;
    // Position relative to SVG
    return {
      x: elementCenterX - svgRect.left,
      y: elementCenterY - svgRect.top,
      side: side, // Include side info for edge calculation
      width: elementRect.width
    };
  };
  // Calculate edge position for arrow endpoint (instead of center)
  const getEdgePosition = (pos: any, side: 'left' | 'right') => {
    if (!pos) return pos;
    // Offset to the edge of the connection dot (not center)
    // Connection dots are typically 8-12px, so offset by ~6px
    const offset = 8;
    if (side === 'left') {
      return { x: pos.x - offset, y: pos.y };
    } else {
      return { x: pos.x + offset, y: pos.y };
    }
  };
  // Render a single connection
  const renderConnection = (connection: Connection) => {
    const sourcePos = getRelativePosition(connection.sourceId, 'right', connection.branchOutput);
    const targetPos = getRelativePosition(connection.targetId, 'left');
    if (!sourcePos || !targetPos) {
      return null;
    }
    // Calculate edge positions for smoother connection
    const sourceEdge = getEdgePosition(sourcePos, 'right');
    const targetEdge = getEdgePosition(targetPos, 'left');
    const distance = Math.abs(targetEdge.x - sourceEdge.x);
    const controlPointOffset = Math.min(distance * 0.5, 100);
    const path = `M ${sourceEdge.x} ${sourceEdge.y} C ${sourceEdge.x + controlPointOffset} ${sourceEdge.y}, ${targetEdge.x - controlPointOffset} ${targetEdge.y}, ${targetEdge.x} ${targetEdge.y}`;
    const strokeColor = theme === 'dark' ? '#9D50BB' : '#8B3AA8';
    const buttonBg = theme === 'dark' ? 'rgba(26, 26, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    const plusIconColor = theme === 'dark' ? '#00C6FF' : '#0ea5e9'; // Cyan/blue for plus icon
    const isHovered = hoveredConnection === connection.id;
    // Calculate midpoint for button placement
    const midX = (sourceEdge.x + targetEdge.x) / 2;
    const midY = (sourceEdge.y + targetEdge.y) / 2;
    const handleDelete = (e: any) => {
      e.stopPropagation();
      removeConnection(connection.id);
      setHoveredConnection(null);
    };
    const handleInsertSubstep = (e: any) => {
      e.stopPropagation();
      // Open node picker with connection context
      // This tells the node picker to create a new substep between source and target
      openNodePicker(
        'substep', 
        undefined,  // containerId
        undefined,  // nodeId
        undefined,  // branchId
        undefined,  // insertIndex
        undefined,  // subStepId
        {           // connectionContext (7th parameter)
          connectionId: connection.id,
          sourceId: connection.sourceId,
          targetId: connection.targetId,
        }
      );
      setHoveredConnection(null);
    };
    return (
      <g key={connection.id}>
        {/* Invisible wider path for easier hover */}
        <path
          d={path}
          fill="none"
          stroke="transparent"
          strokeWidth="24"
          onMouseEnter={() => setHoveredConnection(connection.id)}
          onMouseLeave={() => setHoveredConnection(null)}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setContextMenu({ 
              x: e.clientX, 
              y: e.clientY, 
              connectionId: connection.id 
            });
          }}
          style={{ 
            cursor: 'pointer',
            pointerEvents: 'stroke'
          }}
        />
        {/* Visible connection line */}
        <path
          d={path}
          fill="none"
          stroke={strokeColor}
          strokeWidth={isHovered ? '3' : '2'}
          strokeLinecap="round"
          markerEnd="url(#arrow-purple)"
          style={{
            opacity: isHovered ? 1 : 0.8,
            filter: isHovered ? `drop-shadow(0 0 8px ${strokeColor})` : 'none',
            transition: 'all 0.2s',
            pointerEvents: 'none',
          }}
        />
        {/* Hover buttons - Delete (left) and Insert (right) */}
        {isHovered && (
          <>
            {/* Delete Button (Bin Icon) - positioned to the left */}
            <g
              onClick={handleDelete}
              onMouseEnter={() => setHoveredConnection(connection.id)}
              style={{ cursor: 'pointer', pointerEvents: 'all' }}
            >
              {/* Button background circle */}
              <circle
                cx={midX - 30}
                cy={midY}
                r="16"
                fill="rgba(239, 68, 68, 0.95)"
                stroke="#fff"
                strokeWidth="2"
                style={{
                  filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))'
                }}
              />
              {/* Trash icon */}
              <g transform={`translate(${midX - 30 - 7}, ${midY - 7})`}>
                {/* Bin body */}
                <rect x="3" y="5" width="8" height="7" rx="1" stroke="white" strokeWidth="1.5" fill="none" />
                {/* Bin lid */}
                <line x1="2" y1="5" x2="12" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                {/* Bin handle */}
                <path d="M5 5 V3 C5 2.5 5.5 2 6 2 H8 C8.5 2 9 2.5 9 3 V5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </g>
            </g>
            {/* Insert Substep Button (Plus Icon) - positioned to the right */}
            <g
              onClick={handleInsertSubstep}
              onMouseEnter={() => setHoveredConnection(connection.id)}
              style={{ cursor: 'pointer', pointerEvents: 'all' }}
            >
              {/* Button background circle */}
              <circle
                cx={midX + 30}
                cy={midY}
                r="16"
                fill={buttonBg}
                stroke={strokeColor}
                strokeWidth="2"
                style={{
                  filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))'
                }}
              />
              {/* Plus icon */}
              <g transform={`translate(${midX + 30 - 7}, ${midY - 7})`}>
                <line x1="7" y1="2" x2="7" y2="12" stroke={plusIconColor} strokeWidth="2.5" strokeLinecap="round" />
                <line x1="2" y1="7" x2="12" y2="7" stroke={plusIconColor} strokeWidth="2.5" strokeLinecap="round" />
              </g>
            </g>
          </>
        )}
      </g>
    );
  };
  // Render drag preview
  const renderDragPreview = () => {
    if (!dragConnection.isActive || !dragConnection.sourceId || !dragConnection.mousePosition || !svgRef.current) {
      return null;
    }
    const sourcePos = getRelativePosition(
      dragConnection.sourceId,
      'right',
      dragConnection.branchOutput
    );
    if (!sourcePos) return null;
    // Mouse position relative to SVG
    const svgRect = svgRef.current.getBoundingClientRect();
    const targetPos = {
      x: dragConnection.mousePosition.x - svgRect.left,
      y: dragConnection.mousePosition.y - svgRect.top
    };
    const distance = Math.abs(targetPos.x - sourcePos.x);
    const controlPointOffset = Math.min(distance * 0.5, 100);
    const path = `M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x + controlPointOffset} ${sourcePos.y}, ${targetPos.x - controlPointOffset} ${targetPos.y}, ${targetPos.x} ${targetPos.y}`;
    const strokeColor = theme === 'dark' ? '#9D50BB' : '#8B3AA8';
    return (
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeDasharray="5,5"
        strokeLinecap="round"
        style={{ opacity: 0.6, pointerEvents: 'none' }}
      />
    );
  };
  // Constantly re-render to keep lines in sync
  useEffect(() => {
    let animationFrameId: number;
    const updatePositions = () => {
      forceUpdate({});
      animationFrameId = requestAnimationFrame(updatePositions);
    };
    animationFrameId = requestAnimationFrame(updatePositions);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [connections, dragConnection]);
  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);
  const handleDeleteConnection = () => {
    if (contextMenu) {
      removeConnection(contextMenu.connectionId);
      setContextMenu(null);
    }
  };
  const handleInsertSubstep = () => {
    if (contextMenu) {
      const connection = connections.find(c => c.id === contextMenu.connectionId);
      if (connection) {
        const sourceContainer = containers.find(c => c.id === connection.sourceId);
        const targetContainer = containers.find(c => c.id === connection.targetId);
        if (sourceContainer && targetContainer) {
          const newContainerId = insertContainerAt(sourceContainer.id, targetContainer.id);
          openNodePicker(newContainerId);
        }
      }
      setContextMenu(null);
    }
  };
  return (
    <>
      <svg
        ref={svgRef}
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          width: '100%',
          height: '100%',
          zIndex: 100,
          overflow: 'visible',
        }}
      >
        <defs>
          <marker
            id="arrow-purple"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path
              d="M 0 0 L 10 5 L 0 10 z"
              fill={theme === 'dark' ? '#9D50BB' : '#8B3AA8'}
            />
          </marker>
        </defs>
        {/* Enable pointer events on interactive elements */}
        <g style={{ pointerEvents: 'auto' }}>
          {connections
            .filter(c => c.connectionType === 'manual')
            .map(renderConnection)}
        </g>
        {renderDragPreview()}
      </svg>
      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[10001]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className={`
              rounded-lg shadow-2xl border overflow-hidden min-w-[180px]
              ${theme === 'dark' 
                ? 'bg-[#1A1A2E] border-[#2A2A3E]' 
                : 'bg-white border-gray-200'
              }
            `}
            style={{
              boxShadow: theme === 'dark'
                ? '0 10px 40px rgba(0, 0, 0, 0.5)'
                : '0 10px 40px rgba(0, 0, 0, 0.15)',
            }}
          >
            <button
              onClick={handleDeleteConnection}
              className={`
                w-full px-4 py-2.5 text-left text-sm
                flex items-center gap-3
                transition-colors
                ${theme === 'dark'
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-red-600 hover:bg-red-50'
                }
              `}
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                />
              </svg>
              Delete Connection
            </button>
            <button
              onClick={handleInsertSubstep}
              className={`
                w-full px-4 py-2.5 text-left text-sm
                flex items-center gap-3
                transition-colors
                ${theme === 'dark'
                  ? 'text-green-400 hover:bg-green-500/10'
                  : 'text-green-600 hover:bg-green-50'
                }
              `}
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 4v16m8-8H4" 
                />
              </svg>
              Insert Substep
            </button>
          </div>
        </div>
      )}
    </>
  );
}