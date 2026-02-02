/**
 * Execution Progress Component
 * Shows overall workflow execution progress
 */

import { useTheme } from '../../../../components/ThemeContext';
import { Play, CheckCircle2, XCircle, Loader } from 'lucide-react';
import { formatDuration } from '../../utils/executionState';

interface ExecutionProgressProps {
  isExecuting: boolean;
  currentStep: number;
  totalSteps: number;
  successCount: number;
  errorCount: number;
  duration?: number;
  onStop?: () => void;
}

export function ExecutionProgress({
  isExecuting,
  currentStep,
  totalSteps,
  successCount,
  errorCount,
  duration,
  onStop,
}: ExecutionProgressProps) {
  const { theme } = useTheme();

  if (!isExecuting && currentStep === 0) return null;

  const bgColor = theme === 'dark' ? '#1A1A2E' : '#FFFFFF';
  const borderColor = theme === 'dark' ? '#2A2A3E' : '#E5E7EB';
  const textColor = theme === 'dark' ? '#CFCFE8' : '#374151';
  const mutedColor = theme === 'dark' ? '#888899' : '#6B7280';
  const accentColor = theme === 'dark' ? '#818CF8' : '#6366F1';
  const successColor = theme === 'dark' ? '#34D399' : '#10B981';
  const errorColor = theme === 'dark' ? '#FCA5A5' : '#EF4444';

  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '320px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '12px',
        boxShadow: theme === 'dark' 
          ? '0 10px 40px rgba(0, 0, 0, 0.5)'
          : '0 10px 40px rgba(0, 0, 0, 0.1)',
        padding: '16px',
        zIndex: 10000,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isExecuting ? (
            <Loader size={20} style={{ color: accentColor, animation: 'execution-spin 1s linear infinite' }} />
          ) : errorCount > 0 ? (
            <XCircle size={20} style={{ color: errorColor }} />
          ) : (
            <CheckCircle2 size={20} style={{ color: successColor }} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: textColor }}>
            {isExecuting ? 'Executing Workflow' : errorCount > 0 ? 'Execution Failed' : 'Execution Complete'}
          </div>
          <div style={{ fontSize: '12px', color: mutedColor, marginTop: '2px' }}>
            Step {currentStep} of {totalSteps}
            {duration && ` • ${formatDuration(duration)}`}
          </div>
        </div>
        {onStop && isExecuting && (
          <button
            onClick={onStop}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: `1px solid ${borderColor}`,
              background: 'transparent',
              color: errorColor,
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Stop
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '8px',
          background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: errorCount > 0 
              ? `linear-gradient(90deg, ${errorColor}, ${errorColor}DD)`
              : `linear-gradient(90deg, ${accentColor}, ${theme === 'dark' ? '#A78BFA' : '#8B5CF6'})`,
            transition: 'width 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Animated shine effect */}
          {isExecuting && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={14} style={{ color: successColor }} />
          <span style={{ fontSize: '12px', color: textColor, fontWeight: '600' }}>
            {successCount}
          </span>
          <span style={{ fontSize: '11px', color: mutedColor }}>Success</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <XCircle size={14} style={{ color: errorColor }} />
          <span style={{ fontSize: '12px', color: textColor, fontWeight: '600' }}>
            {errorCount}
          </span>
          <span style={{ fontSize: '11px', color: mutedColor }}>Error</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Play size={14} style={{ color: mutedColor }} />
          <span style={{ fontSize: '12px', color: textColor, fontWeight: '600' }}>
            {totalSteps - currentStep}
          </span>
          <span style={{ fontSize: '11px', color: mutedColor }}>Remaining</span>
        </div>
      </div>
    </div>
  );
}

/* Add shimmer animation to global styles if not already present */
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;
if (!document.querySelector('style[data-shimmer]')) {
  style.setAttribute('data-shimmer', 'true');
  document.head.appendChild(style);
}
