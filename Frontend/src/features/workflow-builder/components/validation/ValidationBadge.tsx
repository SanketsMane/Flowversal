/**
 * Validation Badge Component
 * Shows error/warning/info badges on workflow elements
 */

import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useTheme } from '../../../../components/ThemeContext';
import { ValidationSeverity } from '../../utils/validation';

interface ValidationBadgeProps {
  severity: ValidationSeverity;
  count?: number;
  tooltip?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ValidationBadge({ severity, count = 1, tooltip, size = 'md' }: ValidationBadgeProps) {
  const { theme } = useTheme();

  const colors = {
    error: {
      bg: theme === 'dark' ? '#991B1B' : '#FEE2E2',
      text: theme === 'dark' ? '#FCA5A5' : '#991B1B',
      icon: theme === 'dark' ? '#FCA5A5' : '#DC2626',
    },
    warning: {
      bg: theme === 'dark' ? '#854D0E' : '#FEF3C7',
      text: theme === 'dark' ? '#FCD34D' : '#92400E',
      icon: theme === 'dark' ? '#FCD34D' : '#D97706',
    },
    info: {
      bg: theme === 'dark' ? '#1E40AF' : '#DBEAFE',
      text: theme === 'dark' ? '#93C5FD' : '#1E40AF',
      icon: theme === 'dark' ? '#93C5FD' : '#3B82F6',
    },
  };

  const sizes = {
    sm: { icon: 12, badge: 16, text: '9px' },
    md: { icon: 14, badge: 20, text: '10px' },
    lg: { icon: 16, badge: 24, text: '11px' },
  };

  const Icon = severity === 'error' ? AlertCircle : severity === 'warning' ? AlertTriangle : Info;
  const color = colors[severity];
  const sizeConfig = sizes[size];

  return (
    <div
      style={{
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        width: `${sizeConfig.badge}px`,
        height: `${sizeConfig.badge}px`,
        borderRadius: '50%',
        background: color.bg,
        border: `2px solid ${theme === 'dark' ? '#1A1A2E' : '#FFFFFF'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'help',
        zIndex: 10,
      }}
      title={tooltip}
    >
      {count > 1 ? (
        <span
          style={{
            fontSize: sizeConfig.text,
            fontWeight: '700',
            color: color.text,
          }}
        >
          {count}
        </span>
      ) : (
        <Icon size={sizeConfig.icon} style={{ color: color.icon }} />
      )}
    </div>
  );
}
