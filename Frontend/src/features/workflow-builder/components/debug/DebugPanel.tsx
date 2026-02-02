/**
 * Debug Panel Component
 * Step-by-step workflow execution preview
 */

import { Play, Pause, Square, SkipForward, Bug, X } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useUIStore } from '../../stores';

export function DebugPanel() {
  const { theme } = useTheme();
  const {
    isDebugMode,
    debugExecutionState,
    debugExecutionStep,
    toggleDebugMode,
    startDebugExecution,
    pauseDebugExecution,
    resumeDebugExecution,
    stopDebugExecution,
    stepDebugExecution,
  } = useUIStore();

  if (!isDebugMode) return null;

  const bgColor = theme === 'dark' ? '#1A1A2E' : '#FFFFFF';
  const borderColor = theme === 'dark' ? '#2A2A3E' : '#E5E7EB';
  const textColor = theme === 'dark' ? '#CFCFE8' : '#374151';
  const mutedColor = theme === 'dark' ? '#888899' : '#6B7280';
  const accentColor = theme === 'dark' ? '#818CF8' : '#6366F1';

  const isRunning = debugExecutionState === 'running';
  const isPaused = debugExecutionState === 'paused';
  const isIdle = debugExecutionState === 'idle';

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '24px',
        width: '320px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '12px',
        boxShadow: theme === 'dark' 
          ? '0 10px 40px rgba(0, 0, 0, 0.5)'
          : '0 10px 40px rgba(0, 0, 0, 0.1)',
        zIndex: 10000,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, rgba(129, 140, 248, 0.1), rgba(167, 139, 250, 0.1))'
            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bug size={18} style={{ color: accentColor }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: textColor }}>
              Debug Mode
            </div>
            <div style={{ fontSize: '11px', color: mutedColor, marginTop: '2px' }}>
              Step {debugExecutionStep}
            </div>
          </div>
        </div>
        <button
          onClick={toggleDebugMode}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            border: 'none',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: mutedColor,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Controls */}
      <div style={{ padding: '16px' }}>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          {isIdle && (
            <button
              onClick={startDebugExecution}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: accentColor,
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <Play size={14} />
              Start Debug
            </button>
          )}

          {isRunning && (
            <>
              <button
                onClick={pauseDebugExecution}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: `1px solid ${borderColor}`,
                  background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  color: textColor,
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                <Pause size={14} />
                Pause
              </button>
              <button
                onClick={stopDebugExecution}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: `1px solid ${borderColor}`,
                  background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  color: textColor,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Square size={14} />
              </button>
            </>
          )}

          {isPaused && (
            <>
              <button
                onClick={resumeDebugExecution}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: accentColor,
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                <Play size={14} />
                Resume
              </button>
              <button
                onClick={stepDebugExecution}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: `1px solid ${borderColor}`,
                  background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  color: textColor,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Step Forward"
              >
                <SkipForward size={14} />
              </button>
              <button
                onClick={stopDebugExecution}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: `1px solid ${borderColor}`,
                  background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  color: textColor,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Square size={14} />
              </button>
            </>
          )}
        </div>

        {/* Status Info */}
        <div
          style={{
            padding: '12px',
            borderRadius: '8px',
            background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${borderColor}`,
          }}
        >
          <div style={{ fontSize: '11px', color: mutedColor, marginBottom: '8px' }}>
            EXECUTION STATUS
          </div>
          <div style={{ fontSize: '13px', color: textColor, marginBottom: '8px' }}>
            {isIdle && 'Ready to start debugging'}
            {isRunning && 'Executing workflow...'}
            {isPaused && 'Paused at step ' + debugExecutionStep}
          </div>
          {!isIdle && (
            <div
              style={{
                width: '100%',
                height: '4px',
                borderRadius: '2px',
                background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min((debugExecutionStep / 10) * 100, 100)}%`,
                  background: `linear-gradient(90deg, ${accentColor}, ${theme === 'dark' ? '#A78BFA' : '#8B5CF6'})`,
                  transition: 'width 0.3s',
                }}
              />
            </div>
          )}
        </div>

        {/* Instructions */}
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            borderRadius: '8px',
            background: theme === 'dark' 
              ? 'rgba(129, 140, 248, 0.05)'
              : 'rgba(99, 102, 241, 0.05)',
            border: `1px solid ${theme === 'dark' ? 'rgba(129, 140, 248, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
          }}
        >
          <div style={{ fontSize: '11px', color: mutedColor, lineHeight: '1.5' }}>
            💡 Debug mode lets you step through your workflow execution to see how data flows between nodes.
          </div>
        </div>
      </div>
    </div>
  );
}
