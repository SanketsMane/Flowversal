/**
 * Expandable Tool Menu Component
 * Consolidates all rarely used tools into a single expandable vertical menu
 * Includes: Undo, Redo, Zoom, Debug, Validation, Shortcuts, Edit Workflow
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Settings2, 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Bug,
  AlertCircle,
  HelpCircle,
  X,
  Edit3
} from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useViewport } from '../../contexts/ViewportContext';
import { useWorkflowStore, useUIStore } from '../../stores';

export function ExpandableToolMenu() {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded showing all buttons
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { viewport, updateViewport, setViewport } = useViewport();
  const { undo, redo, canUndo, canRedo } = useWorkflowStore();
  const {
    toggleDebugMode,
    toggleValidationPanel,
    isDebugMode,
    showValidationPanel,
    openKeyboardShortcuts,
    openEditWorkflow,
    isPublishDropdownOpen,
  } = useUIStore();

  // Collapse menu when publish dropdown opens
  useEffect(() => {
    if (isPublishDropdownOpen && isExpanded) {
      setIsExpanded(false);
    }
  }, [isPublishDropdownOpen]);

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-[#E0E0FF]' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const hoverBg = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-100';

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

  // Button data
  const tools = [
    {
      id: 'undo',
      icon: Undo2,
      label: 'Undo',
      shortcut: 'Ctrl+Z',
      onClick: undo,
      disabled: !canUndo(),
      active: false,
      showSeparatorAfter: false,
    },
    {
      id: 'redo',
      icon: Redo2,
      label: 'Redo',
      shortcut: 'Ctrl+Y',
      onClick: redo,
      disabled: !canRedo(),
      active: false,
      showSeparatorAfter: false,
    },
    {
      id: 'zoom-in',
      icon: ZoomIn,
      label: 'Zoom In',
      shortcut: 'Ctrl++',
      onClick: handleZoomIn,
      disabled: viewport.zoom >= 2,
      active: false,
      showSeparatorAfter: false,
    },
    {
      id: 'zoom-out',
      icon: ZoomOut,
      label: 'Zoom Out',
      shortcut: 'Ctrl+-',
      onClick: handleZoomOut,
      disabled: viewport.zoom <= 0.25,
      active: false,
      showSeparatorAfter: false,
    },
    {
      id: 'reset-view',
      icon: Maximize2,
      label: 'Reset View',
      shortcut: 'Ctrl+0',
      onClick: handleResetView,
      disabled: false,
      active: false,
      showSeparatorAfter: false,
    },
    {
      id: 'debug',
      icon: Bug,
      label: 'Debug Mode',
      shortcut: '',
      onClick: toggleDebugMode,
      disabled: false,
      active: isDebugMode,
      showSeparatorAfter: false,
    },
    {
      id: 'validation',
      icon: AlertCircle,
      label: 'Show Validation',
      shortcut: '',
      onClick: toggleValidationPanel,
      disabled: false,
      active: showValidationPanel,
      showSeparatorAfter: false,
    },
    {
      id: 'shortcuts',
      icon: HelpCircle,
      label: 'Shortcuts',
      shortcut: '?',
      onClick: openKeyboardShortcuts,
      disabled: false,
      active: false,
      showSeparatorAfter: false,
    },
    {
      id: 'edit-workflow',
      icon: Edit3,
      label: 'Edit Workflow',
      shortcut: '',
      onClick: openEditWorkflow,
      disabled: false,
      active: false,
      showSeparatorAfter: false,
    },
  ];

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999]"
      style={{ backdropFilter: 'blur(10px)' }}
      ref={menuRef}
    >
      {isExpanded ? (
        /* Fully Expanded Panel - All Buttons Visible */
        <div className={`${bgCard} border ${borderColor} rounded-lg shadow-xl overflow-visible`}>
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            const isHovered = hoveredTool === tool.id;
            
            return (
              <div key={tool.id} className="relative">
                {/* Special rendering for zoom percentage */}
                {tool.id === 'zoom-out' && (
                  <div
                    className={`px-4 py-2 text-center ${textSecondary} text-sm font-medium border-b ${borderColor}`}
                  >
                    {zoomPercentage}%
                  </div>
                )}
                
                <button
                  onClick={tool.onClick}
                  disabled={tool.disabled}
                  onMouseEnter={() => setHoveredTool(tool.id)}
                  onMouseLeave={() => setHoveredTool(null)}
                  className={`
                    relative w-14 py-3 flex items-center justify-center
                    ${textColor} ${hoverBg} transition-colors
                    border-b ${borderColor}
                    disabled:opacity-30 disabled:cursor-not-allowed
                    ${tool.active ? 'bg-indigo-500/20' : ''}
                  `}
                  title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
                >
                  {/* Icon - Always visible */}
                  <Icon className="w-5 h-5" />
                  
                  {/* Tooltip - Show on hover */}
                  {isHovered && (
                    <div className={`absolute right-full mr-3 px-3 py-2 ${bgCard} border ${borderColor} rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-50`}>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{tool.label}</span>
                        {tool.shortcut && (
                          <span className={`text-xs ${textSecondary}`}>
                            {tool.shortcut}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
          
          {/* Collapse Button at Bottom */}
          <button
            onClick={() => setIsExpanded(false)}
            className={`
              relative w-14 h-14 flex items-center justify-center
              ${hoverBg} transition-all
            `}
            title="Collapse Menu"
          >
            <X className="w-6 h-6 text-red-400" />
          </button>
        </div>
      ) : (
        /* Collapsed State - Single Button */
        <button
          onClick={() => setIsExpanded(true)}
          className={`
            ${bgCard} border ${borderColor} rounded-lg shadow-xl
            w-14 h-14 flex items-center justify-center
            ${hoverBg} transition-all
          `}
          title="Open Tools Menu"
        >
          <Settings2 className={`w-6 h-6 ${textColor}`} />
        </button>
      )}
    </div>
  );
}