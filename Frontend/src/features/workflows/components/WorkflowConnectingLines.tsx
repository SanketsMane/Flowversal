import { useEffect, useRef, useState } from 'react';

interface WorkflowConnectingLinesProps {
  containers: any[];
  triggers: any[];
  theme: string;
  selectedItem: any;
  onDotClick: (type: 'trigger' | 'field' | 'node' | 'tool', id: string, containerIndex?: number, nodeIndex?: number) => void;
  enabledStates: {
    triggers: Record<string, boolean>;
    fields: Record<string, boolean>;
    nodes: Record<string, boolean>;
    tools: Record<string, boolean>;
  };
}

export function WorkflowConnectingLines({
  containers,
  triggers,
  theme,
  selectedItem,
  onDotClick,
  enabledStates
}: WorkflowConnectingLinesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Colors
  const colors = {
    mainBranch: theme === 'dark' ? '#E0E0E0' : '#9CA3AF',
    triggers: '#00C6FF',
    fields: '#9D50BB',
    nodes: '#10B981',
    tools: '#F59E0B'
  };

  // Update canvas size
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        const parent = canvasRef.current.parentElement;
        if (parent) {
          setDimensions({
            width: parent.offsetWidth,
            height: parent.offsetHeight
          });
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Draw lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get canvas transform (zoom and pan)
    const canvasContainer = document.querySelector('.infinite-canvas-content') as HTMLElement;
    if (!canvasContainer) return;

    const transform = window.getComputedStyle(canvasContainer).transform;
    let scale = 1;
    let translateX = 0;
    let translateY = 0;

    if (transform && transform !== 'none') {
      const matrix = transform.match(/matrix\(([^)]+)\)/);
      if (matrix) {
        const values = matrix[1].split(',').map(parseFloat);
        scale = values[0];
        translateX = values[4];
        translateY = values[5];
      }
    }

    // Set line style
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Helper function to convert canvas coordinates to screen coordinates
    const toScreenCoords = (x: number, y: number) => {
      return {
        x: x * scale + translateX,
        y: y * scale + translateY
      };
    };

    // Helper function to get element position in canvas space
    const getCanvasPosition = (element: Element) => {
      const rect = element.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      
      // Convert screen coordinates back to canvas space
      return {
        x: (rect.left - canvasRect.left - translateX) / scale,
        y: (rect.top - canvasRect.top - translateY) / scale,
        width: rect.width / scale,
        height: rect.height / scale
      };
    };

    // Helper function to draw line (in screen space)
    const drawLine = (x1: number, y1: number, x2: number, y2: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    // Helper function to draw dot with glow (in screen space)
    const drawDot = (x: number, y: number, color: string, isEnabled: boolean = true) => {
      // Glow effect
      ctx.shadowBlur = isEnabled ? 10 : 0;
      ctx.shadowColor = color;
      
      // Outer circle (border)
      ctx.fillStyle = theme === 'dark' ? '#1A1A2E' : '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner circle (colored dot)
      ctx.fillStyle = isEnabled ? color : (theme === 'dark' ? '#4A4A5E' : '#D1D5DB');
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Reset shadow
      ctx.shadowBlur = 0;
    };

    // Starting positions
    const leftMargin = 40;
    const startY = 100;
    
    // Main Branch Line (vertical on left)
    const mainLineX = leftMargin;
    let currentY = startY;

    // TRIGGERS SECTION
    if (triggers.length > 0) {
      // Get trigger box positions
      const triggerElements = document.querySelectorAll('[data-trigger-id]');
      if (triggerElements.length > 0) {
        const firstTrigger = triggerElements[0];
        const triggerRect = firstTrigger.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        
        const triggerY = triggerRect.top - canvasRect.top + triggerRect.height / 2;
        
        // Main branch dot (A)
        drawDot(mainLineX, triggerY, colors.mainBranch);
        
        // Horizontal line to first trigger
        const firstTriggerLeftX = triggerRect.left - canvasRect.left - 10;
        drawLine(mainLineX, triggerY, firstTriggerLeftX, triggerY, colors.mainBranch);
        
        // Sub-branch: Connect all triggers
        if (triggers.length > 1) {
          const triggerLineX = firstTriggerLeftX - 30;
          
          // Vertical connecting line for all triggers
          let minY = Infinity;
          let maxY = -Infinity;
          
          triggerElements.forEach((el, idx) => {
            const rect = el.getBoundingClientRect();
            const y = rect.top - canvasRect.top + rect.height / 2;
            const enabled = enabledStates.triggers[triggers[idx].id] !== false;
            
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
            
            // Dot for each trigger
            drawDot(triggerLineX, y, colors.triggers, enabled);
            
            // Horizontal line from sub-branch to trigger
            const leftX = rect.left - canvasRect.left - 10;
            if (enabled) {
              drawLine(triggerLineX, y, leftX, y, colors.triggers);
            }
          });
          
          // Vertical line connecting all trigger dots
          drawLine(triggerLineX, minY, triggerLineX, maxY, colors.triggers);
          
          // Connect sub-branch to main branch
          drawLine(triggerLineX, triggerY, firstTriggerLeftX, triggerY, colors.triggers);
        }
        
        currentY = triggerY + 100;
      }
    }

    // WORKFLOW STEPS
    containers.forEach((container, containerIdx) => {
      const containerEl = document.querySelector(`[data-container-id="${container.id}"]`);
      if (!containerEl) return;
      
      const containerRect = containerEl.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      
      // FIELDS SECTION
      if (container.elements && container.elements.length > 0) {
        const fieldElements = document.querySelectorAll(`[data-container-index="${containerIdx}"][data-element-index]`);
        
        if (fieldElements.length > 0) {
          const firstField = fieldElements[0];
          const fieldRect = firstField.getBoundingClientRect();
          
          const fieldY = fieldRect.top - canvasRect.top + fieldRect.height / 2;
          
          // Main branch dot (B)
          drawDot(mainLineX, fieldY, colors.mainBranch);
          
          // Horizontal line to first field
          const firstFieldLeftX = fieldRect.left - canvasRect.left - 10;
          drawLine(mainLineX, fieldY, firstFieldLeftX, fieldY, colors.mainBranch);
          
          // Sub-branch: Connect all fields
          if (container.elements.length > 1) {
            const fieldLineX = firstFieldLeftX - 30;
            
            // Vertical connecting line for all fields
            let minY = Infinity;
            let maxY = -Infinity;
            
            fieldElements.forEach((el, idx) => {
              const rect = el.getBoundingClientRect();
              const y = rect.top - canvasRect.top + rect.height / 2;
              const fieldId = container.elements[idx].id;
              const enabled = enabledStates.fields[fieldId] !== false;
              
              minY = Math.min(minY, y);
              maxY = Math.max(maxY, y);
              
              // Dot for each field
              drawDot(fieldLineX, y, colors.fields, enabled);
              
              // Horizontal line from sub-branch to field
              const leftX = rect.left - canvasRect.left - 10;
              if (enabled) {
                drawLine(fieldLineX, y, leftX, y, colors.fields);
              }
            });
            
            // Vertical line connecting all field dots
            drawLine(fieldLineX, minY, fieldLineX, maxY, colors.fields);
            
            // Connect sub-branch to main branch
            drawLine(fieldLineX, fieldY, firstFieldLeftX, fieldY, colors.fields);
          }
          
          currentY = fieldY + 100;
        }
      }

      // NODES SECTION
      if (container.nodes && container.nodes.length > 0) {
        const nodeElements = document.querySelectorAll(`[data-node-container="${containerIdx}"][data-node-index]`);
        
        if (nodeElements.length > 0) {
          const firstNode = nodeElements[0];
          const nodeRect = firstNode.getBoundingClientRect();
          
          const nodeY = nodeRect.top - canvasRect.top + nodeRect.height / 2;
          
          // Main branch dot (C)
          drawDot(mainLineX, nodeY, colors.mainBranch);
          
          // Horizontal line to first node
          const firstNodeLeftX = nodeRect.left - canvasRect.left - 10;
          drawLine(mainLineX, nodeY, firstNodeLeftX, nodeY, colors.mainBranch);
          
          // Sub-branch: Connect all nodes
          if (container.nodes.length > 1) {
            const nodeLineX = firstNodeLeftX - 30;
            
            // Vertical connecting line for all nodes
            let minY = Infinity;
            let maxY = -Infinity;
            
            nodeElements.forEach((el, idx) => {
              const rect = el.getBoundingClientRect();
              const y = rect.top - canvasRect.top + rect.height / 2;
              const nodeId = container.nodes[idx].id;
              const enabled = enabledStates.nodes[nodeId] !== false;
              
              minY = Math.min(minY, y);
              maxY = Math.max(maxY, y);
              
              // Dot for each node (D)
              drawDot(nodeLineX, y, colors.nodes, enabled);
              
              // Horizontal line from sub-branch to node
              const leftX = rect.left - canvasRect.left - 10;
              if (enabled) {
                drawLine(nodeLineX, y, leftX, y, colors.nodes);
              }
            });
            
            // Vertical line connecting all node dots
            drawLine(nodeLineX, minY, nodeLineX, maxY, colors.nodes);
            
            // Connect sub-branch to main branch
            drawLine(nodeLineX, nodeY, firstNodeLeftX, nodeY, colors.nodes);
          }
          
          currentY = nodeY + 100;
        }
      }
    });

    // Draw main branch vertical line
    if (currentY > startY) {
      drawLine(mainLineX, startY, mainLineX, currentY, colors.mainBranch);
    }

  }, [containers, triggers, theme, enabledStates, dimensions]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="absolute inset-0 pointer-events-none z-[5]"
      style={{ width: '100%', height: '100%' }}
    />
  );
}