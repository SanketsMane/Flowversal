/**
 * Connection Data Preview Component
 * Shows data preview when hovering over connections (n8n-style)
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface ConnectionDataPreviewProps {
  connectionId: string;
  data?: any;
  position: { x: number; y: number };
  onClose?: () => void;
}

export function ConnectionDataPreview({
  connectionId,
  data,
  position,
  onClose,
}: ConnectionDataPreviewProps) {
  const { theme } = useTheme();

  if (!data) return null;

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const bgCode = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';

  const formatData = (data: any): string => {
    if (!data) return 'null';
    try {
      if (typeof data === 'string') return data;
      const json = JSON.stringify(data, null, 2);
      return json.length > 500 ? json.substring(0, 500) + '...' : json;
    } catch {
      return String(data);
    }
  };

  const getDataSize = (data: any): string => {
    try {
      const json = JSON.stringify(data);
      const bytes = new Blob([json]).size;
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } catch {
      return 'Unknown';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`${bgCard} rounded-lg border ${borderColor} shadow-xl pointer-events-auto`}
        style={{
          position: 'absolute',
          left: position.x + 20,
          top: position.y - 20,
          minWidth: '300px',
          maxWidth: '500px',
          maxHeight: '400px',
          zIndex: 1000,
        }}
        onMouseLeave={onClose}
      >
        {/* Header */}
        <div className={`px-4 py-2 border-b ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${textPrimary}`}>Data Preview</span>
            <span className={`text-xs px-2 py-0.5 rounded ${textSecondary} bg-opacity-20`}>
              {getDataSize(data)}
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className={`p-1 rounded hover:bg-opacity-20 ${textSecondary} hover:text-primary transition-colors`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Data Content */}
        <div className="p-4 overflow-auto max-h-[300px]">
          <pre className={`text-xs font-mono ${textSecondary} whitespace-pre-wrap break-words ${bgCode} p-3 rounded`}>
            {formatData(data)}
          </pre>
        </div>

        {/* Footer */}
        <div className={`px-4 py-2 border-t ${borderColor} text-xs ${textSecondary}`}>
          Connection: {connectionId.substring(0, 8)}...
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
