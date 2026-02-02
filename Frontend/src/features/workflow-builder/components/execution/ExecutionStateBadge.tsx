/**
 * Execution State Badge Component
 * Shows execution status on workflow nodes with data preview (n8n-style)
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { CheckCircle2, Circle, Clock, Loader, MinusCircle, X, XCircle } from 'lucide-react';
import { useState } from 'react';
import { NodeExecutionState, formatDuration, getExecutionStateColor } from '../../utils/executionState';
import './ExecutionStateBadge.css';

interface ExecutionStateBadgeProps {
  state: NodeExecutionState;
  duration?: number;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  showDuration?: boolean;
  inputData?: any;
  outputData?: any;
  nodeId?: string;
  nodeName?: string;
}

export function ExecutionStateBadge({ 
  state, 
  duration, 
  error, 
  size = 'md',
  showDuration = false,
  inputData,
  outputData,
  nodeId,
  nodeName,
}: ExecutionStateBadgeProps) {
  const { theme } = useTheme();
  const [showPreview, setShowPreview] = useState(false);
  const [previewType, setPreviewType] = useState<'input' | 'output' | null>(null);

  // Don't show badge for idle state
  if (state === 'idle') return null;

  const color = getExecutionStateColor(state, theme);
  
  const sizes = {
    sm: { icon: 14, badge: 20 },
    md: { icon: 16, badge: 24 },
    lg: { icon: 18, badge: 28 },
  };

  const sizeConfig = sizes[size];

  const getIcon = () => {
    switch (state) {
      case 'pending':
        return <Clock size={sizeConfig.icon} className="execution-pulse" />;
      case 'running':
        return <Loader size={sizeConfig.icon} className="execution-spin" />;
      case 'success':
        return <CheckCircle2 size={sizeConfig.icon} className="execution-success-pop" />;
      case 'error':
        return <XCircle size={sizeConfig.icon} className="execution-error-shake" />;
      case 'skipped':
        return <MinusCircle size={sizeConfig.icon} />;
      default:
        return <Circle size={sizeConfig.icon} />;
    }
  };

  const getTooltip = () => {
    let tooltip = state.charAt(0).toUpperCase() + state.slice(1);
    if (duration) tooltip += ` (${formatDuration(duration)})`;
    if (error) tooltip += `\nError: ${error}`;
    if (inputData || outputData) tooltip += `\n\nClick to view data`;
    return tooltip;
  };

  const formatDataPreview = (data: any): string => {
    if (!data) return 'No data';
    try {
      if (typeof data === 'string') {
        return data.length > 100 ? data.substring(0, 100) + '...' : data;
      }
      const json = JSON.stringify(data, null, 2);
      return json.length > 200 ? json.substring(0, 200) + '...' : json;
    } catch {
      return String(data);
    }
  };

  const hasData = inputData || outputData;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          width: `${sizeConfig.badge}px`,
          height: `${sizeConfig.badge}px`,
          borderRadius: '50%',
          background: theme === 'dark' ? 'rgba(26, 26, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          border: `2px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: hasData ? 'pointer' : 'help',
          zIndex: 20,
          boxShadow: state === 'running' || state === 'success' || state === 'error'
            ? `0 0 12px ${color}40`
            : 'none',
          transition: 'all 0.3s ease',
        }}
        title={getTooltip()}
        className={state === 'running' ? 'execution-glow' : ''}
        onClick={(e) => {
          if (hasData) {
            e.stopPropagation();
            setShowPreview(true);
            setPreviewType(outputData ? 'output' : 'input');
          }
        }}
        onMouseEnter={() => {
          if (hasData && !showPreview) {
            // Show preview on hover after a short delay
            setTimeout(() => {
              if (outputData) setPreviewType('output');
              else if (inputData) setPreviewType('input');
            }, 500);
          }
        }}
      >
        <div style={{ color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {getIcon()}
        </div>
      </div>

      {/* Data Preview Modal */}
      {showPreview && (inputData || outputData) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => {
            setShowPreview(false);
            setPreviewType(null);
          }}
        >
          <div
            style={{
              backgroundColor: theme === 'dark' ? '#1A1A2E' : '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '80vw',
              maxHeight: '80vh',
              overflow: 'auto',
              border: `1px solid ${theme === 'dark' ? '#2A2A3E' : '#E5E7EB'}`,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ 
                color: theme === 'dark' ? '#FFFFFF' : '#111827',
                fontSize: '18px',
                fontWeight: 600,
                margin: 0,
              }}>
                {nodeName || nodeId || 'Node'} - {previewType === 'input' ? 'Input Data' : 'Output Data'}
              </h3>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setPreviewType(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme === 'dark' ? '#CFCFE8' : '#6B7280',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{
              backgroundColor: theme === 'dark' ? '#0E0E1F' : '#F9FAFB',
              borderRadius: '8px',
              padding: '16px',
              fontFamily: 'monospace',
              fontSize: '14px',
              color: theme === 'dark' ? '#CFCFE8' : '#374151',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '60vh',
              overflow: 'auto',
            }}>
              {formatDataPreview(previewType === 'input' ? inputData : outputData)}
            </div>

            {duration && (
              <div style={{
                marginTop: '12px',
                fontSize: '12px',
                color: theme === 'dark' ? '#CFCFE8' : '#6B7280',
              }}>
                Duration: {formatDuration(duration)}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
