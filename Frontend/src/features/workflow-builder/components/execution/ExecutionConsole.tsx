/**
 * Execution Console Component
 * Phase 4 Part 2 - Workflow Execution Engine
 * 
 * Console UI for viewing execution logs
 */

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../../../components/ThemeContext';
import { useExecution } from '../../stores/executionStore';
import { ExecutionLog, LogLevel } from '../../types/execution.types';
import { 
  Terminal, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Bug,
  Trash2,
  Download,
  Filter,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { ScrollArea } from '../../../../components/ui/scroll-area';

const LOG_ICONS: Record<LogLevel, React.ReactNode> = {
  info: <Info className="h-4 w-4" />,
  success: <CheckCircle2 className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  error: <XCircle className="h-4 w-4" />,
  debug: <Bug className="h-4 w-4" />,
};

const LOG_COLORS: Record<LogLevel, string> = {
  info: 'text-blue-400',
  success: 'text-green-400',
  warning: 'text-yellow-400',
  error: 'text-red-400',
  debug: 'text-purple-400',
};

export function ExecutionConsole() {
  const { theme } = useTheme();
  const { currentExecution, clearLogs } = useExecution();
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgHover = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  const logs = currentExecution?.logs || [];
  const filteredLogs = filterLevel === 'all'
    ? logs
    : logs.filter((log) => log.level === filterLevel);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs.length, autoScroll]);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  // Export logs
  const exportLogs = () => {
    const content = logs
      .map((log) => `[${formatTime(log.timestamp)}] [${log.level.toUpperCase()}] ${log.message}`)
      .join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`${bgCard} rounded-lg border ${borderColor} flex flex-col h-full`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${borderColor} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Terminal className={`h-5 w-5 ${textSecondary}`} />
          <h3 className={`${textPrimary} font-medium`}>Execution Console</h3>
          {logs.length > 0 && (
            <span className={`${textSecondary} text-sm`}>
              ({filteredLogs.length}/{logs.length} logs)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as LogLevel | 'all')}
            className={`px-2 py-1 rounded border ${borderColor} ${bgCard} ${textPrimary} text-sm`}
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>

          {/* Auto-scroll toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
            className={autoScroll ? 'text-[#00C6FF]' : ''}
          >
            Auto-scroll
          </Button>

          {/* Export */}
          <Button
            variant="ghost"
            size="sm"
            onClick={exportLogs}
            disabled={logs.length === 0}
          >
            <Download className="h-4 w-4" />
          </Button>

          {/* Clear */}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearLogs}
            disabled={logs.length === 0}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Logs */}
      <ScrollArea className="flex-1 p-4">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <Terminal className={`h-12 w-12 ${textSecondary} opacity-50 mb-3`} />
            <p className={`${textSecondary} text-sm`}>
              {logs.length === 0 ? 'No logs yet' : 'No logs match filter'}
            </p>
          </div>
        ) : (
          <div className="space-y-1 font-mono text-xs">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`${bgHover} rounded px-3 py-2 border ${borderColor} transition-colors`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`${LOG_COLORS[log.level]} mt-0.5`}>
                    {LOG_ICONS[log.level]}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Time and Level */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className={textSecondary}>
                        {formatTime(log.timestamp)}
                      </span>
                      <span className={`${LOG_COLORS[log.level]} font-semibold uppercase`}>
                        [{log.level}]
                      </span>
                      {log.stepName && (
                        <span className="text-[#00C6FF]">
                          {log.stepName}
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    <div className={textPrimary}>
                      {log.message}
                    </div>

                    {/* Data */}
                    {log.data && (
                      <details className="mt-1">
                        <summary className={`${textSecondary} cursor-pointer hover:text-[#00C6FF]`}>
                          View data
                        </summary>
                        <pre className={`${bgCard} border ${borderColor} rounded p-2 mt-1 overflow-x-auto`}>
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}

                    {/* Error */}
                    {log.error && (
                      <div className="mt-1 text-red-400">
                        Error: {log.error.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
