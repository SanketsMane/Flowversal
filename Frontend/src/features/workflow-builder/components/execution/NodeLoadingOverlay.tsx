/**
 * Node Loading Overlay Component
 * Shows loading state overlay on executing nodes
 */

import { useTheme } from '../../../../components/ThemeContext';
import { Loader } from 'lucide-react';

interface NodeLoadingOverlayProps {
  isLoading: boolean;
  progress?: number; // 0-100
  message?: string;
}

export function NodeLoadingOverlay({ isLoading, progress, message }: NodeLoadingOverlayProps) {
  const { theme } = useTheme();

  if (!isLoading) return null;

  const overlayBg = theme === 'dark' 
    ? 'rgba(14, 14, 31, 0.8)' 
    : 'rgba(255, 255, 255, 0.8)';
  const accentColor = theme === 'dark' ? '#818CF8' : '#6366F1';
  const textColor = theme === 'dark' ? '#CFCFE8' : '#374151';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: overlayBg,
        backdropFilter: 'blur(4px)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        zIndex: 10,
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: '32px',
          height: '32px',
          border: `3px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          borderTop: `3px solid ${accentColor}`,
          borderRadius: '50%',
          animation: 'execution-spin 0.8s linear infinite',
        }}
      />

      {/* Message */}
      {message && (
        <div
          style={{
            fontSize: '12px',
            color: textColor,
            fontWeight: '500',
          }}
        >
          {message}
        </div>
      )}

      {/* Progress Bar */}
      {progress !== undefined && (
        <div
          style={{
            width: '80%',
            height: '4px',
            background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${accentColor}, ${theme === 'dark' ? '#A78BFA' : '#8B5CF6'})`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}

      {/* Loading Dots */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <div
          className="loading-dot"
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: accentColor,
          }}
        />
        <div
          className="loading-dot"
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: accentColor,
          }}
        />
        <div
          className="loading-dot"
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: accentColor,
          }}
        />
      </div>
    </div>
  );
}
