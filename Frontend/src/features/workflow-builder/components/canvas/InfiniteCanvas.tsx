/**
 * Infinite Canvas Component - SIMPLIFIED & FIXED
 * Provides pan/zoom with proper coordinate tracking
 */

import { useEffect, useState, ReactNode, useRef } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useViewport } from '../../contexts/ViewportContext';

interface InfiniteCanvasProps {
  children: ReactNode;
}

export function InfiniteCanvas({ children }: InfiniteCanvasProps) {
  const { theme } = useTheme();
  const { viewport, setViewport, containerRef, triggerConnectionUpdate } = useViewport();
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const bgColor = theme === 'dark' ? '#0E0E1F' : '#F3F4F6';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  // Trigger connection updates when viewport changes
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerConnectionUpdate();
    }, 50);
    return () => clearTimeout(timer);
  }, [viewport.zoom, viewport.offsetX, viewport.offsetY, triggerConnectionUpdate]);

  // Handle panning
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Don't pan on interactive elements
    if (
      target.closest('button:not([data-allow-pan])') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select') ||
      target.closest('a') ||
      target.closest('[data-no-pan]')
    ) {
      return;
    }

    setIsPanning(true);
    setPanStart({
      x: e.clientX - viewport.offsetX,
      y: e.clientY - viewport.offsetY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    
    setViewport({
      ...viewport,
      offsetX: e.clientX - panStart.x,
      offsetY: e.clientY - panStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Handle zooming with wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      
      const delta = -e.deltaY * 0.002;
      const newZoom = Math.min(Math.max(0.1, viewport.zoom + delta), 2);
      
      // Zoom toward mouse position
      if (canvasWrapperRef.current) {
        const rect = canvasWrapperRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Point in canvas space before zoom
        const canvasX = (mouseX - viewport.offsetX) / viewport.zoom;
        const canvasY = (mouseY - viewport.offsetY) / viewport.zoom;
        
        // Calculate new offset to keep canvas point under mouse
        const newOffsetX = mouseX - canvasX * newZoom;
        const newOffsetY = mouseY - canvasY * newZoom;
        
        setViewport({
          zoom: newZoom,
          offsetX: newOffsetX,
          offsetY: newOffsetY,
        });
      }
    } else {
      // Pan with wheel
      setViewport({
        ...viewport,
        offsetX: viewport.offsetX - e.deltaX,
        offsetY: viewport.offsetY - e.deltaY,
      });
    }
  };

  // Grid pattern
  const gridSize = 20;

  return (
    <div
      ref={canvasWrapperRef}
      className="flex-1 relative overflow-hidden"
      style={{
        background: bgColor,
        cursor: isPanning ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Grid Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: `${gridSize * viewport.zoom}px ${gridSize * viewport.zoom}px`,
          backgroundPosition: `${viewport.offsetX}px ${viewport.offsetY}px`,
          pointerEvents: 'none',
        }}
      />

      {/* Transformed Content Container - THIS IS THE KEY REF */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: `translate(${viewport.offsetX}px, ${viewport.offsetY}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
          transition: isPanning ? 'none' : 'transform 0.05s ease-out',
          willChange: 'transform',
          width: '5000px',
          height: '5000px',
        }}
      >
        {children}
      </div>
    </div>
  );
}