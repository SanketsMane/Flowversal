/**
 * Smart Connection Dot
 * Self-registering connection point that works with Flowversal's spine architecture
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { useConnectionRegistry } from '../../hooks/useConnectionRegistry';
import { ConnectionPointType, getCompatibleTargets } from '../../types/connections';
import { useTheme } from '@/components/ThemeContext';

interface ConnectionDotProps {
  // Identity
  id?: string;              // Optional manual ID, otherwise auto-generated
  ownerId: string;          // triggerId, stepId, nodeId, or branchId
  ownerType: 'trigger' | 'step' | 'node' | 'branch';
  type: ConnectionPointType;
  
  // Visual
  color?: 'purple' | 'blue' | 'red' | 'green';
  size?: 'small' | 'medium' | 'large';
  
  // Position (relative to parent)
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  offset?: { x: number; y: number };  // Additional offset if needed
  
  // Interaction
  onConnectionStart?: (dotId: string) => void;
  onConnectionEnd?: (dotId: string) => void;
  disabled?: boolean;
  
  // Style override
  className?: string;
  style?: React.CSSProperties;
}

export function ConnectionDot({
  id,
  ownerId,
  ownerType,
  type,
  color,
  size = 'medium',
  position = 'center',
  offset = { x: 0, y: 0 },
  onConnectionStart,
  onConnectionEnd,
  disabled = false,
  className = '',
  style = {},
}: ConnectionDotProps) {
  const dotRef = useRef<HTMLDivElement>(null);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const { registerPoint, unregisterPoint, updatePosition } = useConnectionRegistry();
  const { theme } = useTheme();
  
  // Generate unique ID
  const dotId = useMemo(() => {
    if (id) return id;
    return `${ownerId}:${type}`;
  }, [id, ownerId, type]);
  
  // Auto-detect color based on type if not provided
  const dotColor = useMemo(() => {
    if (color) return color;
    
    // Auto-assign colors based on type
    if (type.includes('trigger')) return 'purple';
    if (type.includes('step')) return 'blue';
    if (type.includes('branch')) return 'red';
    return 'green';
  }, [color, type]);
  
  // Size classes
  const sizeClasses = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4',
  };
  
  // Color classes with theme support
  const colorClasses = {
    purple: theme === 'dark' 
      ? 'bg-purple-500 ring-purple-400/30 hover:ring-purple-400/50' 
      : 'bg-purple-600 ring-purple-500/30 hover:ring-purple-500/50',
    blue: theme === 'dark'
      ? 'bg-blue-500 ring-blue-400/30 hover:ring-blue-400/50'
      : 'bg-blue-600 ring-blue-500/30 hover:ring-blue-500/50',
    red: theme === 'dark'
      ? 'bg-red-500 ring-red-400/30 hover:ring-red-400/50'
      : 'bg-red-600 ring-red-500/30 hover:ring-red-500/50',
    green: theme === 'dark'
      ? 'bg-green-500 ring-green-400/30 hover:ring-green-400/50'
      : 'bg-green-600 ring-green-500/30 hover:ring-green-500/50',
  };
  
  // Position classes
  const positionClasses = {
    top: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
    right: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2',
    bottom: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
    left: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };
  
  // Calculate absolute canvas position
  const calculatePosition = () => {
    if (!dotRef.current) return { x: 0, y: 0 };
    
    const dotRect = dotRef.current.getBoundingClientRect();
    const canvasElement = document.querySelector('.workflow-canvas');
    const canvasRect = canvasElement?.getBoundingClientRect() || { left: 0, top: 0 };
    
    return {
      x: Math.round(dotRect.left + dotRect.width / 2 - canvasRect.left + offset.x),
      y: Math.round(dotRect.top + dotRect.height / 2 - canvasRect.top + offset.y),
    };
  };
  
  // Register dot on mount ONLY
  useEffect(() => {
    if (!dotRef.current) return;
    
    const pos = calculatePosition();
    lastPositionRef.current = pos;
    
    registerPoint({
      id: dotId,
      type,
      ownerId,
      ownerType,
      position: pos,
      color: dotColor,
      size,
      canConnectTo: getCompatibleTargets(type),
      element: dotRef.current,
    });
    
    return () => {
      unregisterPoint(dotId);
      lastPositionRef.current = null;
    };
  }, []); // Run only once on mount
  
  // Update position only when needed - with proper checks to prevent infinite loops
  useEffect(() => {
    if (!dotRef.current) return;
    
    let rafId: number | null = null;
    
    const updatePos = () => {
      // Cancel any pending animation frame
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      
      // Use RAF to batch updates
      rafId = requestAnimationFrame(() => {
        const pos = calculatePosition();
        
        // Only update if position actually changed (prevent infinite loop)
        if (
          !lastPositionRef.current ||
          lastPositionRef.current.x !== pos.x ||
          lastPositionRef.current.y !== pos.y
        ) {
          lastPositionRef.current = pos;
          updatePosition(dotId, pos);
        }
        
        rafId = null;
      });
    };
    
    // Watch for scroll/zoom only (remove mutation/resize observers that cause loops)
    const canvas = document.querySelector('.workflow-canvas');
    const handleScroll = () => updatePos();
    const handleResize = () => updatePos();
    
    canvas?.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      canvas?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [dotId]); // Only depend on dotId (which is stable)
  
  // Interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    onConnectionStart?.(dotId);
  };
  
  const handleMouseUp = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    onConnectionEnd?.(dotId);
  };
  
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (disabled) return;
    e.currentTarget.classList.add('ring-4', 'scale-150');
  };
  
  const handleMouseLeave = (e: React.MouseEvent) => {
    if (disabled) return;
    e.currentTarget.classList.remove('ring-4', 'scale-150');
  };
  
  if (disabled) {
    return null;
  }
  
  return (
    <div
      ref={dotRef}
      data-connection-dot="true"
      data-connection-dot-id={dotId}
      data-dot-type={type}
      data-owner-id={ownerId}
      data-owner-type={ownerType}
      data-side={position}
      className={`
        absolute rounded-full cursor-pointer
        transition-all duration-200
        hover:scale-125
        ${sizeClasses[size]}
        ${colorClasses[dotColor]}
        ${positionClasses[position]}
        ${className}
      `}
      style={{
        ...style,
        zIndex: 20,
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={`${type} (${ownerId})`}
    />
  );
}