/**
 * Manual Connection Layer
 * Phase 3 - New Connection System
 * 
 * Simple click-and-drag connection system:
 * 1. Click on a connection dot to start
 * 2. Drag to another dot
 * 3. Release to create connection
 * 4. Renders SVG lines between connected dots
 */
import { useEffect, useRef } from 'react';
import { useConnectionStore } from '@/core/stores/connectionStore';
import { useTheme } from '../../../../components/ThemeContext';
import { useViewport } from '../../contexts/ViewportContext';
export function ManualConnectionLayer() {
  const { theme } = useTheme();
  const { connections, dragConnection } = useConnectionStore();
  const { connectionUpdateCounter } = useViewport();
  const svgRef = useRef<SVGSVGElement>(null);
  // Colors based on theme
  const lineColor = theme === 'dark' ? '#00C6FF' : '#0099CC';
  const glowColor = theme === 'dark' ? 'rgba(0, 198, 255, 0.3)' : 'rgba(0, 153, 204, 0.3)';
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    // Clear existing lines
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    // Draw existing connections
    connections.forEach((connection) => {
      const sourceDot = document.querySelector(
        `[data-connection-dot][data-owner-id="${connection.sourceId}"][data-side="right"]`
      );
      const targetDot = document.querySelector(
        `[data-connection-dot][data-owner-id="${connection.targetId}"][data-side="left"]`
      );
      if (sourceDot && targetDot) {
        const sourceRect = sourceDot.getBoundingClientRect();
        const targetRect = targetDot.getBoundingClientRect();
        const x1 = sourceRect.left + sourceRect.width / 2 - rect.left;
        const y1 = sourceRect.top + sourceRect.height / 2 - rect.top;
        const x2 = targetRect.left + targetRect.width / 2 - rect.left;
        const y2 = targetRect.top + targetRect.height / 2 - rect.top;
        // 🐛 DEBUG: Dot positions for connection
        drawConnection(svg, x1, y1, x2, y2, lineColor, glowColor);
      }
    });
    // Draw drag preview line
    if (dragConnection.isActive && dragConnection.sourceId && dragConnection.mousePosition) {
      const sourceDot = document.querySelector(
        `[data-connection-dot][data-owner-id="${dragConnection.sourceId}"][data-side="right"]`
      );
      if (sourceDot) {
        const sourceRect = sourceDot.getBoundingClientRect();
        const x1 = sourceRect.left + sourceRect.width / 2 - rect.left;
        const y1 = sourceRect.top + sourceRect.height / 2 - rect.top;
        const x2 = dragConnection.mousePosition.x - rect.left;
        const y2 = dragConnection.mousePosition.y - rect.top;
        drawConnection(svg, x1, y1, x2, y2, lineColor, glowColor, true);
      }
    }
  }, [connections, dragConnection, lineColor, glowColor, connectionUpdateCounter]);
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
// Helper function to draw a connection line
function drawConnection(
  svg: SVGSVGElement,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  glowColor: string,
  isDragging = false
) {
  // Calculate control points for smooth curve
  const dx = Math.abs(x2 - x1);
  const offsetX = Math.min(dx * 0.5, 100);
  const cx1 = x1 + offsetX;
  const cy1 = y1;
  const cx2 = x2 - offsetX;
  const cy2 = y2;
  // Create path
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const d = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  path.setAttribute('d', d);
  path.setAttribute('stroke', color);
  path.setAttribute('stroke-width', isDragging ? '3' : '2');
  path.setAttribute('fill', 'none');
  path.setAttribute('opacity', isDragging ? '0.6' : '1');
  if (!isDragging) {
    path.setAttribute('filter', 'url(#connection-glow)');
  } else {
    path.setAttribute('stroke-dasharray', '5,5');
  }
  // Add glow filter (only once)
  if (!svg.querySelector('#connection-glow')) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'connection-glow');
    const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    feGaussianBlur.setAttribute('stdDeviation', '2');
    feGaussianBlur.setAttribute('result', 'coloredBlur');
    const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    feMergeNode1.setAttribute('in', 'coloredBlur');
    const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    feMergeNode2.setAttribute('in', 'SourceGraphic');
    feMerge.appendChild(feMergeNode1);
    feMerge.appendChild(feMergeNode2);
    filter.appendChild(feGaussianBlur);
    filter.appendChild(feMerge);
    defs.appendChild(filter);
    svg.appendChild(defs);
  }
  svg.appendChild(path);
}