/**
 * Debug Overlay - Shows all registered connection points
 * Toggle with keyboard shortcut: Ctrl+Shift+D
 */

import { useConnectionRegistry } from '../../hooks/useConnectionRegistry';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeContext';

export function ConnectionDebugOverlay() {
  const { points, lines, debugInfo } = useConnectionRegistry();
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();
  
  // Toggle with Ctrl+Shift+D
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsVisible(prev => !prev);
        if (!isVisible) {
          debugInfo(); // Log to console when showing
        }
      }
    };
    
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isVisible, debugInfo]);
  
  if (!isVisible) return null;
  
  const pointsArray = Array.from(points.values());
  const linesArray = Array.from(lines.values());
  
  // Color mapping for debug circles
  const colorMap = {
    purple: '#A855F7',
    blue: '#3B82F6',
    red: '#EF4444',
    green: '#10B981',
  };
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {/* Show all connection points with colored circles */}
      {pointsArray.map(point => (
        <div
          key={point.id}
          className="absolute border-2 rounded-full flex items-center justify-center"
          style={{
            left: point.position.x - 12,
            top: point.position.y - 12,
            width: '24px',
            height: '24px',
            borderColor: colorMap[point.color],
            backgroundColor: `${colorMap[point.color]}20`,
          }}
        >
          <div 
            className="font-mono font-bold"
            style={{
              fontSize: '8px',
              color: colorMap[point.color],
            }}
          >
            {point.type.split('-')[0][0].toUpperCase()}
          </div>
        </div>
      ))}
      
      {/* Info panel */}
      <div 
        className={`
          fixed top-4 right-4 rounded-lg shadow-2xl
          pointer-events-auto max-w-md max-h-[80vh]
          overflow-hidden flex flex-col
          ${theme === 'dark' ? 'bg-gray-900/95 text-white' : 'bg-white/95 text-gray-900'}
        `}
      >
        {/* Header */}
        <div className={`
          p-4 border-b
          ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
        `}>
          <div className="flex items-center justify-between">
            <div className="font-bold">Connection Points Debug</div>
            <button
              onClick={() => setIsVisible(false)}
              className={`
                p-1 rounded hover:bg-opacity-10 transition-colors
                ${theme === 'dark' ? 'hover:bg-white' : 'hover:bg-black'}
              `}
            >
              ✕
            </button>
          </div>
          <div className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Press Ctrl+Shift+D to toggle
          </div>
        </div>
        
        {/* Stats */}
        <div className={`
          p-4 border-b space-y-2
          ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}
        `}>
          <div className="flex justify-between text-sm">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Total Points:</span>
            <span className="font-semibold">{pointsArray.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Total Lines:</span>
            <span className="font-semibold">{linesArray.length}</span>
          </div>
          
          {/* Type breakdown */}
          <div className="mt-3 pt-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}">
            <div className="text-xs font-semibold mb-2">Point Types:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span>Triggers: {pointsArray.filter(p => p.type.includes('trigger')).length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Steps: {pointsArray.filter(p => p.type.includes('step')).length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Nodes: {pointsArray.filter(p => p.type.includes('node')).length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Branches: {pointsArray.filter(p => p.type.includes('branch')).length}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Point list */}
        <div className="flex-1 overflow-auto p-4">
          <div className="text-xs font-semibold mb-2">Connection Points:</div>
          <div className="space-y-1 text-[10px] font-mono">
            {pointsArray.length === 0 ? (
              <div className={`text-center py-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                No connection points registered yet
              </div>
            ) : (
              pointsArray.map(point => (
                <div 
                  key={point.id} 
                  className={`
                    p-2 rounded
                    ${theme === 'dark' ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-gray-50 hover:bg-gray-100'}
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colorMap[point.color] }}
                    ></div>
                    <span className="font-semibold">{point.type}</span>
                  </div>
                  <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    ID: {point.id}
                  </div>
                  <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
                    Pos: ({point.position.x.toFixed(0)}, {point.position.y.toFixed(0)})
                  </div>
                  <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
                    Owner: {point.ownerType} - {point.ownerId}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Lines list */}
          {linesArray.length > 0 && (
            <>
              <div className="text-xs font-semibold mt-4 mb-2">Connection Lines:</div>
              <div className="space-y-1 text-[10px] font-mono">
                {linesArray.map(line => (
                  <div 
                    key={line.id}
                    className={`
                      p-2 rounded
                      ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}
                    `}
                  >
                    <div className="font-semibold">{line.type}</div>
                    <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      {line.sourceId} → {line.targetId}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Footer with legend */}
        <div className={`
          p-3 border-t text-[10px]
          ${theme === 'dark' ? 'border-gray-700 bg-gray-800/50 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-600'}
        `}>
          <div className="font-semibold mb-1">Legend:</div>
          <div className="space-y-0.5">
            <div>T = Trigger point</div>
            <div>S = Step point</div>
            <div>N = Node point</div>
            <div>B = Branch point</div>
          </div>
        </div>
      </div>
    </div>
  );
}
