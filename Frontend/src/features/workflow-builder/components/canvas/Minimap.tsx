/**
 * Minimap Component
 * Provides a small overview of the entire workflow canvas
 */

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useWorkflowStore } from '../../stores';
import { useViewport } from '../../contexts/ViewportContext';

export function Minimap() {
  const { theme } = useTheme();
  const { containers, triggers } = useWorkflowStore();
  const { viewport, setViewport, containerRef } = useViewport();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  const MINIMAP_WIDTH = 200;
  const MINIMAP_HEIGHT = 150;
  const SCALE_FACTOR = 0.1; // How much to scale down the canvas

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);

    // Draw background
    ctx.fillStyle = theme === 'dark' ? '#0E0E1F' : '#F9FAFB';
    ctx.fillRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);

    // Calculate approximate positions of elements
    let yOffset = 20;
    
    // Draw triggers
    triggers.forEach((trigger, index) => {
      ctx.fillStyle = theme === 'dark' ? '#9D50BB' : '#A855F7';
      ctx.fillRect(10, yOffset, 180, 8);
      yOffset += 12;
    });

    // Draw containers/steps
    containers.forEach((container, index) => {
      yOffset += 5;
      ctx.fillStyle = theme === 'dark' ? '#00C6FF' : '#3B82F6';
      ctx.fillRect(10, yOffset, 180, 10);
      
      // Draw nodes inside containers
      container.nodes.forEach((node, nodeIndex) => {
        yOffset += 12;
        ctx.fillStyle = theme === 'dark' ? '#2A2A3E' : '#E5E7EB';
        ctx.fillRect(20, yOffset, 160, 6);
      });
      
      yOffset += 15;
    });

    // Draw viewport rectangle
    if (containerRef.current) {
      const viewportWidth = containerRef.current.clientWidth;
      const viewportHeight = containerRef.current.clientHeight;
      
      const viewX = (-viewport.offsetX / viewport.zoom) * SCALE_FACTOR;
      const viewY = (-viewport.offsetY / viewport.zoom) * SCALE_FACTOR;
      const viewW = (viewportWidth / viewport.zoom) * SCALE_FACTOR;
      const viewH = (viewportHeight / viewport.zoom) * SCALE_FACTOR;

      ctx.strokeStyle = theme === 'dark' ? '#00C6FF' : '#3B82F6';
      ctx.lineWidth = 2;
      ctx.strokeRect(viewX, viewY, viewW, viewH);
      
      // Fill with semi-transparent color
      ctx.fillStyle = theme === 'dark' ? 'rgba(0, 198, 255, 0.1)' : 'rgba(59, 130, 246, 0.1)';
      ctx.fillRect(viewX, viewY, viewW, viewH);
    }
  }, [containers, triggers, viewport, theme, containerRef]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    handleMinimapClick(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    handleMinimapClick(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMinimapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert minimap coordinates to canvas coordinates
    const canvasX = (x / SCALE_FACTOR) * viewport.zoom;
    const canvasY = (y / SCALE_FACTOR) * viewport.zoom;

    // Center the viewport on the clicked position
    const viewportWidth = container.clientWidth;
    const viewportHeight = container.clientHeight;

    setViewport({
      ...viewport,
      offsetX: -canvasX + viewportWidth / 2,
      offsetY: -canvasY + viewportHeight / 2,
    });
  };

  return (
    <div
      className={`fixed bottom-6 left-6 ${bgCard} border ${borderColor} rounded-lg shadow-xl overflow-hidden z-[9999] p-2`}
      style={{ backdropFilter: 'blur(10px)' }}
    >
      <div className="text-xs font-medium mb-2 text-gray-500">Minimap</div>
      <canvas
        ref={canvasRef}
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        className="cursor-pointer rounded"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
