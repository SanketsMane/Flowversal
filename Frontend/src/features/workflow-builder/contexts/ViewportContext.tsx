/**
 * Viewport Context - Centralized Transform State Management
 * Provides zoom and offset state to all components that need coordinate transformations
 */

import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

interface ViewportState {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

interface ViewportContextValue {
  viewport: ViewportState;
  setViewport: (viewport: ViewportState) => void;
  updateViewport: (updates: Partial<ViewportState>) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  
  // Helper to convert screen coordinates to canvas coordinates
  screenToCanvas: (screenX: number, screenY: number) => { x: number; y: number };
  
  // Helper to convert canvas coordinates to screen coordinates
  canvasToScreen: (canvasX: number, canvasY: number) => { x: number; y: number };
  
  // Trigger recalculation of connections
  triggerConnectionUpdate: () => void;
  connectionUpdateCounter: number;
}

const ViewportContext = createContext<ViewportContextValue | null>(null);

export function ViewportProvider({ children }: { children: ReactNode }) {
  const [viewport, setViewport] = useState<ViewportState>({
    zoom: 1,
    offsetX: 120,  // Add left padding so content is visible
    offsetY: 80,   // Add top padding so content is visible
  });
  
  const [connectionUpdateCounter, setConnectionUpdateCounter] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateViewport = useCallback((updates: Partial<ViewportState>) => {
    setViewport((prev) => ({ ...prev, ...updates }));
  }, []);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    const { zoom, offsetX, offsetY } = viewport;
    return {
      x: (screenX - offsetX) / zoom,
      y: (screenY - offsetY) / zoom,
    };
  }, [viewport]);

  // Convert canvas coordinates to screen coordinates
  const canvasToScreen = useCallback((canvasX: number, canvasY: number) => {
    const { zoom, offsetX, offsetY } = viewport;
    return {
      x: canvasX * zoom + offsetX,
      y: canvasY * zoom + offsetY,
    };
  }, [viewport]);

  const triggerConnectionUpdate = useCallback(() => {
    setConnectionUpdateCounter((c) => c + 1);
  }, []);

  const value: ViewportContextValue = {
    viewport,
    setViewport,
    updateViewport,
    containerRef,
    screenToCanvas,
    canvasToScreen,
    triggerConnectionUpdate,
    connectionUpdateCounter,
  };

  return <ViewportContext.Provider value={value}>{children}</ViewportContext.Provider>;
}

export function useViewport() {
  const context = useContext(ViewportContext);
  if (!context) {
    throw new Error('useViewport must be used within ViewportProvider');
  }
  return context;
}