/**
 * Sequential Connection Layer
 * 
 * TWO TYPES OF SEQUENTIAL CONNECTIONS:
 * 1. EXTERNAL (Blue): Vertical spine with curved elbowed branches to triggers/containers
 * 2. INTERNAL (Purple): Vertical spine with curved elbowed branches to nodes (inside container)
 * 
 * Design: Both use clear elbowed lines with smooth curves at connection points
 */

import { useEffect, useRef } from 'react';
import { useWorkflowStore } from '../../stores';
import { useTheme } from '../../../../components/ThemeContext';
import { useViewport } from '../../contexts/ViewportContext';

export function SequentialConnectionLayer() {
  const { theme } = useTheme();
  const { triggers, containers } = useWorkflowStore();
  const { connectionUpdateCounter } = useViewport();
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    
    // Clear existing lines
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Add a small delay to ensure DOM is ready
    requestAnimationFrame(() => {
      // REMOVED: External blue connections - not needed, only manual connections from dots are used
      // drawExternalConnections(svg, triggers, containers, theme);
      drawInternalConnections(svg, containers, theme);
    });
  }, [triggers, containers, theme, connectionUpdateCounter]);

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        overflow: 'visible',
      }}
    />
  );
}

/**
 * Draw EXTERNAL blue connections (Triggers → Step Containers)
 * Style: Vertical spine with curved elbowed branches
 */
function drawExternalConnections(
  svg: SVGSVGElement,
  triggers: any[],
  containers: any[],
  theme: string
) {
  const lineColor = theme === 'dark' ? '#00C6FF' : '#0099CC';
  const svgRect = svg.getBoundingClientRect();
  
  const elements: Array<{ id: string; y: number; x: number }> = [];

  // Collect trigger dots
  triggers.forEach((trigger) => {
    const dot = document.querySelector(
      `[data-connection-dot][data-owner-id="${trigger.id}"][data-owner-type="trigger"][data-side="left"]`
    );
    if (dot) {
      const rect = dot.getBoundingClientRect();
      elements.push({
        id: trigger.id,
        y: rect.top + rect.height / 2 - svgRect.top,
        x: rect.left + rect.width / 2 - svgRect.left,
      });
    }
  });

  // Collect container dots (step containers)
  containers.forEach((container) => {
    const dot = document.querySelector(
      `[data-connection-dot][data-owner-id="${container.id}"][data-owner-type="step"][data-side="left"]`
    );
    if (dot) {
      const rect = dot.getBoundingClientRect();
      elements.push({
        id: container.id,
        y: rect.top + rect.height / 2 - svgRect.top,
        x: rect.left + rect.width / 2 - svgRect.left,
      });
    }
  });

  if (elements.length === 0) return;

  // Sort by Y position
  elements.sort((a, b) => a.y - b.y);

  // Calculate spine X position (40px to the left of the leftmost dot)
  const spineX = Math.min(...elements.map(e => e.x)) - 40;

  // Draw continuous path with smooth curves
  const pathParts: string[] = [];
  const radius = 12; // Curve radius

  elements.forEach(({ x, y }, index) => {
    if (index === 0) {
      // Start at first element
      pathParts.push(`M ${spineX} ${y}`);
    } else {
      // Draw vertical line to current Y minus radius
      pathParts.push(`L ${spineX} ${y - radius}`);
    }
    
    // Draw curved corner to horizontal branch
    pathParts.push(`Q ${spineX} ${y}, ${spineX + radius} ${y}`);
    
    // Draw horizontal line to element
    pathParts.push(`L ${x} ${y}`);
    
    // If not the last element, draw back and prepare for next
    if (index < elements.length - 1) {
      // Draw back from element to spine
      pathParts.push(`M ${spineX + radius} ${y}`);
      
      // Draw curved corner back to spine
      pathParts.push(`Q ${spineX} ${y}, ${spineX} ${y + radius}`);
    }
  });

  // Draw the complete path
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathParts.join(' '));
  path.setAttribute('stroke', lineColor);
  path.setAttribute('stroke-width', '3');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('fill', 'none');
  path.setAttribute('opacity', '0.9');
  svg.appendChild(path);
}

/**
 * Draw INTERNAL purple connections (Nodes within each container)
 * Style: Clear elbowed lines with curves - vertical spine with horizontal branches to each dot
 */
function drawInternalConnections(
  svg: SVGSVGElement,
  containers: any[],
  theme: string
) {
  const lineColor = theme === 'dark' ? '#9D50BB' : '#8B3AA8';
  const svgRect = svg.getBoundingClientRect();

  containers.forEach((container) => {
    const nodes = container.nodes || [];
    if (nodes.length === 0) return;

    const nodeElements: Array<{ id: string; y: number; x: number }> = [];

    // Collect all node dots within this container
    nodes.forEach((node: any) => {
      const dot = document.querySelector(
        `[data-connection-dot][data-owner-id="${node.id}"][data-owner-type="node"][data-side="left"]`
      );
      if (dot) {
        const rect = dot.getBoundingClientRect();
        nodeElements.push({
          id: node.id,
          y: rect.top + rect.height / 2 - svgRect.top,
          x: rect.left + rect.width / 2 - svgRect.left,
        });
      }
    });

    if (nodeElements.length === 0) return;

    // Sort by Y position
    nodeElements.sort((a, b) => a.y - b.y);

    // Get container boundaries to keep spine inside
    const containerElement = document.querySelector(`[data-container-id="${container.id}"]`);
    if (!containerElement) return;
    
    const containerRect = containerElement.getBoundingClientRect();
    const containerLeft = containerRect.left - svgRect.left;
    
    // Calculate spine X position - centered in the middle of left margin space
    const leftmostDotX = Math.min(...nodeElements.map(e => e.x));
    // Position spine in the middle between container left edge and the dots
    const marginSpace = leftmostDotX - containerLeft;
    const spineX = containerLeft + (marginSpace / 2);
    const radius = 10; // Curve radius for internal connections

    // Draw clear elbowed path with smooth curves
    const pathParts: string[] = [];

    nodeElements.forEach(({ x, y }, index) => {
      if (index === 0) {
        // Start at spine level with first node
        pathParts.push(`M ${spineX} ${y}`);
      } else {
        // Draw vertical line down the spine to current node level minus curve radius
        pathParts.push(`L ${spineX} ${y - radius}`);
      }
      
      // Draw smooth curved elbow from spine to horizontal branch
      pathParts.push(`Q ${spineX} ${y}, ${spineX + radius} ${y}`);
      
      // Draw horizontal branch to node dot
      pathParts.push(`L ${x} ${y}`);
      
      // If not the last node, draw back to spine with curve
      if (index < nodeElements.length - 1) {
        // Move back to where horizontal branch meets curve
        pathParts.push(`M ${spineX + radius} ${y}`);
        
        // Draw curved elbow back to spine
        pathParts.push(`Q ${spineX} ${y}, ${spineX} ${y + radius}`);
      }
    });

    // Draw the complete elbowed path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathParts.join(' '));
    path.setAttribute('stroke', lineColor);
    path.setAttribute('stroke-width', '3');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('fill', 'none');
    path.setAttribute('opacity', '0.9');
    svg.appendChild(path);
  });
}