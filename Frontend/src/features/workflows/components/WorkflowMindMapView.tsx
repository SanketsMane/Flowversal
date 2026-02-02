import { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Download, Zap, Database, Sparkles, Wrench } from 'lucide-react';

interface WorkflowMindMapViewProps {
  containers: any[];
  triggers: any[];
  theme: string;
  onNodeClick?: (type: string, id: string, containerIndex?: number, nodeIndex?: number) => void;
}

interface Node {
  id: string;
  type: 'trigger' | 'workflow-step' | 'field' | 'node' | 'tool' | 'trigger-box' | 'field-box' | 'tool-box';
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  icon?: string;
  parentId?: string;
  containerIndex?: number;
  nodeIndex?: number;
  toolIndex?: number;
  fieldIndex?: number;
  triggerIndex?: number;
  enabled?: boolean;
  customPosition?: boolean;
  isContainer?: boolean; // For boxes that contain other items
  children?: string[]; // IDs of child nodes
}

interface Connection {
  from: string;
  to: string;
  color: string;
  type: 'main' | 'sub' | 'tool';
}

export function WorkflowMindMapView({ 
  containers, 
  triggers, 
  theme,
  onNodeClick 
}: WorkflowMindMapViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [nodeOffsets, setNodeOffsets] = useState<Map<string, { x: number; y: number }>>(new Map());

  // Colors
  const colors = {
    trigger: '#00C6FF',
    field: '#9D50BB',
    node: '#10B981',
    tool: '#F59E0B',
    workflowStep: '#6366F1',
    connection: theme === 'dark' ? '#4B5563' : '#9CA3AF',
    background: theme === 'dark' ? '#0E0E1F' : '#F9FAFB',
    cardBg: theme === 'dark' ? '#1A1A2E' : '#FFFFFF',
    text: theme === 'dark' ? '#FFFFFF' : '#1F2937',
    textSecondary: theme === 'dark' ? '#CFCFE8' : '#6B7280',
    border: theme === 'dark' ? '#2A2A3E' : '#E5E7EB',
    grid: theme === 'dark' ? '#1A1A2E' : '#E5E7EB',
  };

  // Calculate layout and create nodes
  useEffect(() => {
    const newNodes: Node[] = [];
    const newConnections: Connection[] = [];
    
    let currentY = 100;
    const centerX = 600;
    const horizontalSpacing = 350;
    const verticalItemSpacing = 85; // Space between items in vertical boxes
    const levelSpacing = 200;
    const containerPadding = 15; // Padding inside container boxes

    // 1. Add Triggers in a single vertical combined box
    if (triggers.length > 0) {
      const triggerBoxHeight = triggers.length * verticalItemSpacing + containerPadding * 2;
      const triggerBoxId = 'trigger-box';
      
      // Add trigger container box
      newNodes.push({
        id: triggerBoxId,
        type: 'trigger-box',
        label: 'Triggers',
        x: centerX - 100,
        y: currentY,
        width: 200,
        height: triggerBoxHeight,
        color: colors.trigger,
        isContainer: true,
        children: triggers.map((_, idx) => `trigger-${idx}`),
      });

      // Add individual trigger cards inside the box
      triggers.forEach((trigger, idx) => {
        const nodeId = `trigger-${idx}`;
        newNodes.push({
          id: nodeId,
          type: 'trigger',
          label: trigger.label || 'Trigger',
          x: centerX - 90,
          y: currentY + containerPadding + (idx * verticalItemSpacing),
          width: 180,
          height: 70,
          color: colors.trigger,
          icon: 'zap',
          enabled: trigger.config?.enabled !== false,
          parentId: triggerBoxId,
          triggerIndex: idx,
        });
      });
      
      currentY += triggerBoxHeight + levelSpacing;
    }

    // 2. Add Workflow Steps horizontally and their contents
    let workflowStepX = centerX - (containers.length * horizontalSpacing) / 2;
    
    containers.forEach((container, containerIdx) => {
      const stepNodeId = `step-${container.id}`;
      
      // Add Workflow Step node
      newNodes.push({
        id: stepNodeId,
        type: 'workflow-step',
        label: container.title || `Step ${containerIdx + 1}`,
        x: workflowStepX,
        y: currentY,
        width: 300,
        height: 100,
        color: colors.workflowStep,
        icon: 'box',
        containerIndex: containerIdx,
      });

      // Connect triggers to all workflow steps
      if (triggers.length > 0) {
        // Only connect trigger box to the first workflow step
        if (containerIdx === 0) {
          newConnections.push({
            from: 'trigger-box',
            to: stepNodeId,
            color: colors.connection,
            type: 'main',
          });
        }
      }

      // Connect previous step to current step
      if (containerIdx > 0) {
        newConnections.push({
          from: `step-${containers[containerIdx - 1].id}`,
          to: stepNodeId,
          color: colors.connection,
          type: 'main',
        });
      }

      let stepCurrentY = currentY + 150;

      // 3. Add Fields in a single vertical combined box (below workflow step)
      if (container.elements && container.elements.length > 0) {
        const fieldBoxHeight = container.elements.length * verticalItemSpacing + containerPadding * 2;
        const fieldBoxId = `field-box-${container.id}`;
        
        // Add field container box
        newNodes.push({
          id: fieldBoxId,
          type: 'field-box',
          label: 'Form Fields',
          x: workflowStepX,
          y: stepCurrentY,
          width: 300,
          height: fieldBoxHeight,
          color: colors.field,
          isContainer: true,
          parentId: stepNodeId,
          containerIndex: containerIdx,
          children: container.elements.map((elem: any) => `field-${container.id}-${elem.id}`),
        });

        // Connect field box to workflow step
        newConnections.push({
          from: stepNodeId,
          to: fieldBoxId,
          color: colors.field,
          type: 'sub',
        });

        // Add individual field cards inside the box
        container.elements.forEach((element: any, elementIdx: number) => {
          const fieldNodeId = `field-${container.id}-${element.id}`;
          
          newNodes.push({
            id: fieldNodeId,
            type: 'field',
            label: element.label || 'Field',
            x: workflowStepX + 10,
            y: stepCurrentY + containerPadding + (elementIdx * verticalItemSpacing),
            width: 280,
            height: 70,
            color: colors.field,
            icon: 'database',
            parentId: fieldBoxId,
            containerIndex: containerIdx,
            fieldIndex: elementIdx,
            enabled: element.enabled !== false,
          });
        });
        
        stepCurrentY += fieldBoxHeight + 100;
      }

      // 4. Add Nodes horizontally (below field box or workflow step)
      if (container.nodes && container.nodes.length > 0) {
        const nodeStartX = workflowStepX - ((container.nodes.length - 1) * 180) / 2 + 150;
        
        container.nodes.forEach((node: any, nodeIdx: number) => {
          const nodeNodeId = `node-${container.id}-${node.id}`;
          
          newNodes.push({
            id: nodeNodeId,
            type: 'node',
            label: node.label || 'AI Node',
            x: nodeStartX + (nodeIdx * 180),
            y: stepCurrentY,
            width: 160,
            height: 80,
            color: colors.node,
            icon: 'sparkles',
            parentId: container.elements && container.elements.length > 0 
              ? `field-box-${container.id}` 
              : stepNodeId,
            containerIndex: containerIdx,
            nodeIndex: nodeIdx,
            enabled: node.enabled !== false,
          });

          // Connect node to field box or workflow step
          const connectFrom = container.elements && container.elements.length > 0 
            ? `field-box-${container.id}` 
            : stepNodeId;
          
          newConnections.push({
            from: connectFrom,
            to: nodeNodeId,
            color: colors.node,
            type: 'sub',
          });

          // 5. Add Tools in a single vertical combined box (below each node)
          if (node.config?.tools && node.config.tools.length > 0) {
            const toolBoxHeight = node.config.tools.length * verticalItemSpacing + containerPadding * 2;
            const toolBoxId = `tool-box-${container.id}-${node.id}`;
            const toolY = stepCurrentY + 120;
            
            // Add tool container box
            newNodes.push({
              id: toolBoxId,
              type: 'tool-box',
              label: 'Tools',
              x: nodeStartX + (nodeIdx * 180) - 10,
              y: toolY,
              width: 180,
              height: toolBoxHeight,
              color: colors.tool,
              isContainer: true,
              parentId: nodeNodeId,
              containerIndex: containerIdx,
              nodeIndex: nodeIdx,
              children: node.config.tools.map((_: any, toolIdx: number) => `tool-${container.id}-${node.id}-${toolIdx}`),
            });

            // Connect tool box to node
            newConnections.push({
              from: nodeNodeId,
              to: toolBoxId,
              color: colors.tool,
              type: 'tool',
            });

            // Add individual tool cards inside the box
            node.config.tools.forEach((tool: any, toolIdx: number) => {
              const toolNodeId = `tool-${container.id}-${node.id}-${toolIdx}`;
              
              newNodes.push({
                id: toolNodeId,
                type: 'tool',
                label: tool.label || 'Tool',
                x: nodeStartX + (nodeIdx * 180),
                y: toolY + containerPadding + (toolIdx * verticalItemSpacing),
                width: 160,
                height: 70,
                color: colors.tool,
                icon: 'wrench',
                parentId: toolBoxId,
                containerIndex: containerIdx,
                nodeIndex: nodeIdx,
                toolIndex: toolIdx,
                enabled: tool.enabled !== false,
              });
            });
          }
        });
      }

      workflowStepX += horizontalSpacing;
    });

    setNodes(newNodes);
    setConnections(newConnections);
  }, [containers, triggers, theme]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw grid
    drawGrid(ctx, canvas.offsetWidth, canvas.offsetHeight);

    // Draw connections
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      
      if (fromNode && toNode) {
        drawConnection(ctx, fromNode, toNode, conn.color, conn.type);
      }
    });

    // Draw container boxes first (behind individual items)
    nodes.filter(n => n.isContainer).forEach(node => {
      drawContainerBox(ctx, node, node.id === hoveredNode, node.id === selectedNode);
    });

    // Draw individual nodes on top
    nodes.filter(n => !n.isContainer).forEach(node => {
      drawNode(ctx, node, node.id === hoveredNode, node.id === selectedNode);
    });

    ctx.restore();
  }, [nodes, connections, zoom, pan, hoveredNode, selectedNode, theme]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = theme === 'dark' ? 0.1 : 0.2;

    const gridSize = 50;
    const startX = Math.floor((-pan.x / zoom) / gridSize) * gridSize;
    const startY = Math.floor((-pan.y / zoom) / gridSize) * gridSize;
    const endX = startX + (width / zoom) + gridSize;
    const endY = startY + (height / zoom) + gridSize;

    // Vertical lines
    for (let x = startX; x < endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = startY; y < endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  };

  const drawConnection = (
    ctx: CanvasRenderingContext2D,
    from: Node,
    to: Node,
    color: string,
    type: 'main' | 'sub' | 'tool'
  ) => {
    const fromX = from.x + from.width / 2;
    const fromY = from.y + from.height;
    const toX = to.x + to.width / 2;
    const toY = to.y;

    // Curved line
    ctx.strokeStyle = from.enabled === false || to.enabled === false 
      ? (theme === 'dark' ? '#4A4A5E' : '#D1D5DB')
      : color;
    ctx.lineWidth = type === 'main' ? 3 : type === 'sub' ? 2 : 1.5;
    ctx.globalAlpha = from.enabled === false || to.enabled === false ? 0.3 : 0.6;

    const controlPointOffset = Math.abs(toY - fromY) / 2;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.bezierCurveTo(
      fromX, fromY + controlPointOffset,
      toX, toY - controlPointOffset,
      toX, toY
    );
    ctx.stroke();

    // Arrow at the end
    if (to.enabled !== false) {
      drawArrow(ctx, toX, toY, color);
    }

    ctx.globalAlpha = 1;
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 6, y - 10);
    ctx.lineTo(x + 6, y - 10);
    ctx.closePath();
    ctx.fill();
  };

  const drawContainerBox = (
    ctx: CanvasRenderingContext2D,
    node: Node,
    isHovered: boolean,
    isSelected: boolean
  ) => {
    const { x, y, width, height, color, label } = node;

    // Shadow for hover/selection
    if (isHovered || isSelected) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // Container background with low opacity
    ctx.fillStyle = colors.cardBg;
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = isSelected ? color : isHovered ? color + 'AA' : color;
    ctx.lineWidth = isSelected ? 3 : 2;

    // Rounded rectangle
    const radius = 16;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Container label at the top
    ctx.fillStyle = color;
    ctx.font = '600 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label.toUpperCase(), x + width / 2, y + 10);
  };

  const drawNode = (
    ctx: CanvasRenderingContext2D,
    node: Node,
    isHovered: boolean,
    isSelected: boolean
  ) => {
    const { x, y, width, height, color, label, enabled } = node;

    // Shadow for hover/selection
    if (isHovered || isSelected) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // Node background
    ctx.fillStyle = enabled === false 
      ? (theme === 'dark' ? '#1A1A2E' : '#F3F4F6')
      : colors.cardBg;
    ctx.strokeStyle = enabled === false
      ? (theme === 'dark' ? '#4A4A5E' : '#D1D5DB')
      : isSelected 
      ? color 
      : isHovered 
      ? color + 'AA' 
      : colors.border;
    ctx.lineWidth = isSelected ? 3 : 2;

    // Rounded rectangle
    const radius = 12;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Color stripe at top
    ctx.fillStyle = enabled === false 
      ? (theme === 'dark' ? '#4A4A5E' : '#D1D5DB')
      : color;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + 8);
    ctx.lineTo(x, y + 8);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();

    // Node label
    ctx.fillStyle = enabled === false 
      ? (theme === 'dark' ? '#6B7280' : '#9CA3AF')
      : colors.text;
    ctx.font = `${node.type === 'workflow-step' ? '600' : '500'} ${node.type === 'tool' ? '11px' : '13px'} Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const maxWidth = width - 20;
    const truncatedLabel = truncateText(ctx, label, maxWidth);
    ctx.fillText(truncatedLabel, x + width / 2, y + height / 2 + 4);

    // Type badge
    ctx.fillStyle = enabled === false 
      ? (theme === 'dark' ? '#6B7280' : '#9CA3AF')
      : colors.textSecondary;
    ctx.font = '500 9px Inter, system-ui, sans-serif';
    ctx.fillText(node.type.toUpperCase().replace('-', ' '), x + width / 2, y + height - 12);

    // Disabled indicator
    if (enabled === false) {
      ctx.fillStyle = theme === 'dark' ? '#EF4444' : '#DC2626';
      ctx.font = '600 8px Inter, system-ui, sans-serif';
      ctx.fillText('DISABLED', x + width / 2, y + 18);
    }
  };

  const truncateText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string => {
    if (ctx.measureText(text).width <= maxWidth) {
      return text;
    }
    
    let truncated = text;
    while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + '...';
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    // Check if clicked on a node (check non-container nodes first, then container boxes)
    const clickedNode = [...nodes].reverse().find(node => 
      x >= node.x && x <= node.x + node.width &&
      y >= node.y && y <= node.y + node.height
    );

    if (clickedNode) {
      setSelectedNode(clickedNode.id);
      
      // Start dragging the node
      setIsDraggingNode(true);
      setDraggedNode(clickedNode.id);
      const offset = { x: x - clickedNode.x, y: y - clickedNode.y };
      setNodeOffsets(prev => {
        const newOffsets = new Map(prev);
        newOffsets.set(clickedNode.id, offset);
        return newOffsets;
      });

      if (onNodeClick) {
        // Handle click based on node type
        if (clickedNode.type === 'trigger' || clickedNode.type === 'trigger-box') {
          onNodeClick('trigger', clickedNode.id, clickedNode.containerIndex, clickedNode.triggerIndex);
        } else if (clickedNode.type === 'field' || clickedNode.type === 'field-box') {
          onNodeClick('field', clickedNode.id, clickedNode.containerIndex, clickedNode.fieldIndex);
        } else if (clickedNode.type === 'node') {
          onNodeClick('node', clickedNode.id, clickedNode.containerIndex, clickedNode.nodeIndex);
        } else if (clickedNode.type === 'tool' || clickedNode.type === 'tool-box') {
          onNodeClick('tool', clickedNode.id, clickedNode.containerIndex, clickedNode.nodeIndex);
        } else if (clickedNode.type === 'workflow-step') {
          onNodeClick('workflow-step', clickedNode.id, clickedNode.containerIndex);
        }
      }
    } else {
      setSelectedNode(null);
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isPanning) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    } else if (isDraggingNode && draggedNode) {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;

      setNodes(prev => prev.map(node => 
        node.id === draggedNode ? { ...node, x: x - nodeOffsets.get(draggedNode)!.x, y: y - nodeOffsets.get(draggedNode)!.y } : node
      ));
    } else {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;

      const hoveredNode = [...nodes].reverse().find(node => 
        x >= node.x && x <= node.x + node.width &&
        y >= node.y && y <= node.y + node.height
      );

      setHoveredNode(hoveredNode ? hoveredNode.id : null);
      canvas.style.cursor = hoveredNode ? 'pointer' : isPanning ? 'grabbing' : 'grab';
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingNode(false);
    setDraggedNode(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.3), 3));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev * 0.8, 0.3));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `workflow-mindmap-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      // Silently handle fullscreen errors (e.g., permissions policy, user cancellation)
      setIsFullscreen(false);
    }
  };

  const bgColor = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const panelBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  return (
    <div ref={containerRef} className={`relative w-full h-full ${bgColor}`}>
      {/* Controls */}
      <div className={`absolute top-4 right-4 z-10 flex flex-col gap-2`}>
        {/* Zoom Controls */}
        <div className={`${panelBg} rounded-lg border ${borderColor} shadow-lg p-2 flex flex-col gap-1`}>
          <button
            onClick={handleZoomIn}
            className={`p-2 rounded hover:bg-[#00C6FF]/10 transition-colors ${textPrimary}`}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className={`p-2 rounded hover:bg-[#00C6FF]/10 transition-colors ${textPrimary}`}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className={`border-t ${borderColor} my-1`} />
          <button
            onClick={handleResetView}
            className={`p-2 rounded hover:bg-[#00C6FF]/10 transition-colors ${textSecondary} text-xs`}
            title="Reset View"
          >
            {Math.round(zoom * 100)}%
          </button>
        </div>

        {/* Action Controls */}
        <div className={`${panelBg} rounded-lg border ${borderColor} shadow-lg p-2 flex flex-col gap-1`}>
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded hover:bg-[#00C6FF]/10 transition-colors ${textPrimary}`}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDownloadImage}
            className={`p-2 rounded hover:bg-[#00C6FF]/10 transition-colors ${textPrimary}`}
            title="Download as Image"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className={`absolute bottom-4 left-4 z-10 ${panelBg} rounded-lg border ${borderColor} shadow-lg p-4`}>
        <h4 className={`${textPrimary} text-sm font-semibold mb-3`}>Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.trigger }} />
            <span className={`${textSecondary} text-xs`}>Triggers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.workflowStep }} />
            <span className={`${textSecondary} text-xs`}>Workflow Steps</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.field }} />
            <span className={`${textSecondary} text-xs`}>Form Fields</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.node }} />
            <span className={`${textSecondary} text-xs`}>AI Nodes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.tool }} />
            <span className={`${textSecondary} text-xs`}>Tools</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={`absolute top-4 left-4 z-10 ${panelBg} rounded-lg border ${borderColor} shadow-lg p-3`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: colors.trigger }} />
            <span className={`${textSecondary} text-xs`}>{triggers.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" style={{ color: colors.field }} />
            <span className={`${textSecondary} text-xs`}>
              {containers.reduce((acc, c) => acc + (c.elements?.length || 0), 0)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: colors.node }} />
            <span className={`${textSecondary} text-xs`}>
              {containers.reduce((acc, c) => acc + (c.nodes?.length || 0), 0)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4" style={{ color: colors.tool }} />
            <span className={`${textSecondary} text-xs`}>
              {containers.reduce((acc, c) => 
                acc + (c.nodes?.reduce((a: number, n: any) => a + (n.config?.tools?.length || 0), 0) || 0), 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Instructions */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`${panelBg} rounded-lg border ${borderColor} p-8 text-center shadow-lg`}>
            <Sparkles className={`w-12 h-12 mx-auto mb-4 ${textSecondary}`} />
            <h3 className={`${textPrimary} text-lg mb-2`}>No workflow to visualize</h3>
            <p className={`${textSecondary} text-sm`}>
              Add triggers, fields, and nodes to see your workflow mind map
            </p>
          </div>
        </div>
      )}
    </div>
  );
}