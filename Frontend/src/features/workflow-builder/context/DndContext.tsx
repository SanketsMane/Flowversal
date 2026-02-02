/**
 * Drag & Drop Context Provider
 * Phase 4 Part 1 - Drag & Drop System
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { DragItem, DragItemType } from '../types/dnd.types';

interface DndContextState {
  isDragging: boolean;
  dragItem: DragItem | null;
  dragType: DragItemType | null;
  setDragging: (isDragging: boolean, item?: DragItem | null) => void;
  showDropZones: boolean;
  setShowDropZones: (show: boolean) => void;
}

const DndContext = createContext<DndContextState | undefined>(undefined);

interface DndContextProviderProps {
  children: ReactNode;
  backend?: 'html5' | 'touch' | 'auto';
}

// Detect touch device
const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export function DndContextProvider({ 
  children, 
  backend = 'auto' 
}: DndContextProviderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [showDropZones, setShowDropZones] = useState(false);

  const setDragging = useCallback((dragging: boolean, item?: DragItem | null) => {
    setIsDragging(dragging);
    setDragItem(item || null);
    setShowDropZones(dragging);
  }, []);

  // Choose backend based on device
  const getBackend = () => {
    if (backend === 'auto') {
      return isTouchDevice() ? TouchBackend : HTML5Backend;
    }
    return backend === 'touch' ? TouchBackend : HTML5Backend;
  };

  const contextValue: DndContextState = {
    isDragging,
    dragItem,
    dragType: dragItem?.type || null,
    setDragging,
    showDropZones,
    setShowDropZones,
  };

  return (
    <DndProvider backend={getBackend()}>
      <DndContext.Provider value={contextValue}>
        {children}
      </DndContext.Provider>
    </DndProvider>
  );
}

export function useDndContext() {
  const context = useContext(DndContext);
  if (!context) {
    throw new Error('useDndContext must be used within DndContextProvider');
  }
  return context;
}
