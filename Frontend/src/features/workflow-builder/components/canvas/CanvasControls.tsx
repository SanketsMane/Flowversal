/**
 * Canvas Controls Component
 * Provides zoom, pan, viewport controls, and undo/redo for the workflow canvas
 */

import { ZoomIn, ZoomOut, Maximize2, Move, Undo2, Redo2 } from 'lucide-react';
import { useEffect } from 'react';
import { useViewport } from '../../contexts/ViewportContext';
import { useTheme } from '@/core/theme/ThemeContext';
import { useWorkflowStore } from '../../stores/workflowStore';

export function CanvasControls() {
  const { theme } = useTheme();
  const { viewport, updateViewport, setViewport } = useViewport();
  const { undo, redo, canUndo, canRedo } = useWorkflowStore();

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-[#E0E0FF]' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const hoverBg = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-100';

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl/Cmd key
      const isModifier = e.ctrlKey || e.metaKey;

      if (isModifier && e.key === 'z' && !e.shiftKey) {
        // Undo: Ctrl+Z / Cmd+Z
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
      } else if (isModifier && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        // Redo: Ctrl+Y / Cmd+Y / Ctrl+Shift+Z / Cmd+Shift+Z
        e.preventDefault();
        if (canRedo()) {
          redo();
        }
      } else if (isModifier && e.key === '=' || e.key === '+') {
        // Zoom In: Ctrl/Cmd + +
        e.preventDefault();
        updateViewport({ zoom: Math.min(viewport.zoom * 1.2, 2) });
      } else if (isModifier && (e.key === '-' || e.key === '_')) {
        // Zoom Out: Ctrl/Cmd + -
        e.preventDefault();
        updateViewport({ zoom: Math.max(viewport.zoom / 1.2, 0.25) });
      } else if (isModifier && e.key === '0') {
        // Reset View: Ctrl/Cmd + 0
        e.preventDefault();
        setViewport({ zoom: 1, offsetX: 0, offsetY: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo, viewport.zoom, updateViewport, setViewport]);

  const handleZoomIn = () => {
    updateViewport({ zoom: Math.min(viewport.zoom * 1.2, 2) });
  };

  const handleZoomOut = () => {
    updateViewport({ zoom: Math.max(viewport.zoom / 1.2, 0.25) });
  };

  const handleResetView = () => {
    setViewport({ zoom: 1, offsetX: 0, offsetY: 0 });
  };

  const zoomPercentage = Math.round(viewport.zoom * 100);

  return (
    <div
      className={`fixed bottom-6 right-6 ${bgCard} border ${borderColor} rounded-lg shadow-xl overflow-hidden z-[9999] flex gap-2`}
      style={{ backdropFilter: 'blur(10px)' }}
    >
      {/* Undo/Redo Controls */}
      <div className="flex flex-col border-r border-[#2A2A3E]">
        {/* Undo */}
        <button
          onClick={undo}
          disabled={!canUndo()}
          className={`px-4 py-3 ${textColor} ${hoverBg} transition-colors border-b ${borderColor} disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center relative group`}
          title="Undo"
        >
          <Undo2 className="w-5 h-5" />
          <span className={`absolute left-1/2 -translate-x-1/2 -top-10 px-2 py-1 ${bgCard} border ${borderColor} rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg`}>
            Undo
          </span>
        </button>

        {/* Redo */}
        <button
          onClick={redo}
          disabled={!canRedo()}
          className={`px-4 py-3 ${textColor} ${hoverBg} transition-colors flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed relative group`}
          title="Redo"
        >
          <Redo2 className="w-5 h-5" />
          <span className={`absolute left-1/2 -translate-x-1/2 -top-10 px-2 py-1 ${bgCard} border ${borderColor} rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg`}>
            Redo
          </span>
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="flex flex-col">
        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          disabled={viewport.zoom >= 2}
          className={`px-4 py-3 ${textColor} ${hoverBg} transition-colors border-b ${borderColor} disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center relative group`}
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
          <span className={`absolute left-1/2 -translate-x-1/2 -top-10 px-2 py-1 ${bgCard} border ${borderColor} rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg`}>
            Zoom In
          </span>
        </button>

        {/* Zoom Percentage */}
        <div className={`px-4 py-2 text-center ${textSecondary} text-sm border-b ${borderColor} min-w-[80px] font-medium`}>
          {zoomPercentage}%
        </div>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          disabled={viewport.zoom <= 0.25}
          className={`px-4 py-3 ${textColor} ${hoverBg} transition-colors border-b ${borderColor} disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center relative group`}
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
          <span className={`absolute left-1/2 -translate-x-1/2 -top-10 px-2 py-1 ${bgCard} border ${borderColor} rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg`}>
            Zoom Out
          </span>
        </button>

        {/* Reset View */}
        <button
          onClick={handleResetView}
          className={`px-4 py-3 ${textColor} ${hoverBg} transition-colors flex items-center justify-center relative group`}
          title="Reset View"
        >
          <Maximize2 className="w-5 h-5" />
          <span className={`absolute left-1/2 -translate-x-1/2 -top-10 px-2 py-1 ${bgCard} border ${borderColor} rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg`}>
            Reset View
          </span>
        </button>
      </div>
    </div>
  );
}