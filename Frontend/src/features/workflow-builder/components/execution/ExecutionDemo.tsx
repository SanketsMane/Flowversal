/**
 * Execution Demo Component
 * Demonstrates execution state transitions for testing
 */

import React from 'react';
import { useTheme } from '../../../../components/ThemeContext';
import { NodeExecutionState } from '../../utils/executionState';
import { ExecutionStateBadge } from './ExecutionStateBadge';
import { NodeLoadingOverlay } from './NodeLoadingOverlay';
import { ParticleEffect } from './ParticleEffect';
import { Play, Square, X } from 'lucide-react';

interface ExecutionDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExecutionDemo({ isOpen, onClose }: ExecutionDemoProps) {
  const { theme } = useTheme();
  const [executionState, setExecutionState] = React.useState<NodeExecutionState>('idle');
  const [progress, setProgress] = React.useState(0);
  const [showParticles, setShowParticles] = React.useState(false);

  const bgColor = theme === 'dark' ? '#1A1A2E' : '#FFFFFF';
  const borderColor = theme === 'dark' ? '#2A2A3E' : '#E5E7EB';
  const textColor = theme === 'dark' ? '#CFCFE8' : '#374151';
  const cardBg = theme === 'dark' ? '#1A1A2E' : '#FFFFFF';

  const simulateExecution = () => {
    // Pending
    setExecutionState('pending');
    setTimeout(() => {
      // Running
      setExecutionState('running');
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 10;
        setProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(interval);
          // Success
          setExecutionState('success');
          setShowParticles(true);
          setTimeout(() => {
            setExecutionState('idle');
            setProgress(0);
          }, 3000);
        }
      }, 200);
    }, 1000);
  };

  const simulateError = () => {
    setExecutionState('pending');
    setTimeout(() => {
      setExecutionState('running');
      setProgress(50);
      setTimeout(() => {
        setExecutionState('error');
        setShowParticles(true);
        setTimeout(() => {
          setExecutionState('idle');
          setProgress(0);
        }, 3000);
      }, 1500);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '12px',
        padding: '24px',
        zIndex: 10001,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          border: `1px solid ${borderColor}`,
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: textColor,
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

      <div style={{ fontSize: '18px', fontWeight: '600', color: textColor, marginBottom: '24px' }}>
        Execution Visual Feedback Demo
      </div>

      {/* Demo Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {(['pending', 'running', 'success', 'error', 'skipped'] as NodeExecutionState[]).map((state) => (
          <div
            key={state}
            style={{
              position: 'relative',
              padding: '20px',
              background: cardBg,
              border: `2px solid ${borderColor}`,
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <ExecutionStateBadge state={state} />
            <div style={{ fontSize: '12px', color: textColor, textTransform: 'capitalize', marginTop: '8px' }}>
              {state}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Demo */}
      <div
        style={{
          position: 'relative',
          padding: '40px',
          background: cardBg,
          border: `2px solid ${borderColor}`,
          borderRadius: '12px',
          marginBottom: '24px',
        }}
      >
        <ExecutionStateBadge 
          state={executionState} 
          duration={executionState === 'success' ? 2340 : undefined}
        />
        <NodeLoadingOverlay 
          isLoading={executionState === 'running'} 
          progress={progress}
          message="Processing..."
        />
        <ParticleEffect 
          type={executionState === 'success' ? 'success' : 'error'}
          trigger={showParticles}
          onComplete={() => setShowParticles(false)}
        />
        
        <div style={{ textAlign: 'center', color: textColor }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
            Interactive Demo Node
          </div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>
            Click buttons below to see execution states
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={simulateExecution}
          disabled={executionState !== 'idle'}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background: executionState === 'idle' 
              ? 'linear-gradient(135deg, #818CF8, #A78BFA)'
              : (theme === 'dark' ? '#2A2A3E' : '#E5E7EB'),
            color: executionState === 'idle' ? '#FFFFFF' : (theme === 'dark' ? '#666' : '#999'),
            fontSize: '14px',
            fontWeight: '600',
            cursor: executionState === 'idle' ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Play size={16} />
          Simulate Success
        </button>
        <button
          onClick={simulateError}
          disabled={executionState !== 'idle'}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            background: executionState === 'idle' 
              ? 'linear-gradient(135deg, #EF4444, #DC2626)'
              : (theme === 'dark' ? '#2A2A3E' : '#E5E7EB'),
            color: executionState === 'idle' ? '#FFFFFF' : (theme === 'dark' ? '#666' : '#999'),
            fontSize: '14px',
            fontWeight: '600',
            cursor: executionState === 'idle' ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Square size={16} />
          Simulate Error
        </button>
      </div>

      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          background: theme === 'dark' ? 'rgba(129, 140, 248, 0.1)' : 'rgba(99, 102, 241, 0.1)',
          border: `1px solid ${theme === 'dark' ? 'rgba(129, 140, 248, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
          borderRadius: '8px',
          fontSize: '11px',
          color: textColor,
          lineHeight: '1.6',
        }}
      >
        <strong>Features:</strong>
        <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
          <li>✨ Animated execution badges with state-specific icons</li>
          <li>🎯 Loading overlay with progress bar</li>
          <li>🎉 Success/error particle effects</li>
          <li>💫 Smooth transitions and glow effects</li>
        </ul>
      </div>
    </div>
  );
}