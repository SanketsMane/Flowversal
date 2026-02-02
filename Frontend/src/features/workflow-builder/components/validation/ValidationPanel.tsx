/**
 * Validation Panel Component
 * Displays all validation issues for the workflow
 */

import { AlertCircle, AlertTriangle, Info, X, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useUIStore } from '../../stores';
import { WorkflowValidation, ValidationSeverity } from '../../utils/validation';

interface ValidationPanelProps {
  validation: WorkflowValidation;
}

export function ValidationPanel({ validation }: ValidationPanelProps) {
  const { theme } = useTheme();
  const { showValidationPanel, hideValidation } = useUIStore();

  if (!showValidationPanel) return null;

  const bgColor = theme === 'dark' ? '#1A1A2E' : '#FFFFFF';
  const borderColor = theme === 'dark' ? '#2A2A3E' : '#E5E7EB';
  const textColor = theme === 'dark' ? '#CFCFE8' : '#374151';
  const mutedColor = theme === 'dark' ? '#888899' : '#6B7280';

  const allIssues = [
    ...validation.globalIssues,
    ...Array.from(validation.triggers.values()).flatMap(t => 
      t.issues.map(issue => ({ ...issue, source: `Trigger ${t.triggerId}` }))
    ),
    ...Array.from(validation.nodes.values()).flatMap(n => 
      n.issues.map(issue => ({ ...issue, source: `Node ${n.nodeId}` }))
    ),
  ];

  const errorCount = allIssues.filter(i => i.severity === 'error').length;
  const warningCount = allIssues.filter(i => i.severity === 'warning').length;
  const infoCount = allIssues.filter(i => i.severity === 'info').length;

  const getIcon = (severity: ValidationSeverity) => {
    switch (severity) {
      case 'error':
        return <AlertCircle size={16} />;
      case 'warning':
        return <AlertTriangle size={16} />;
      case 'info':
        return <Info size={16} />;
    }
  };

  const getColor = (severity: ValidationSeverity) => {
    switch (severity) {
      case 'error':
        return theme === 'dark' ? '#FCA5A5' : '#DC2626';
      case 'warning':
        return theme === 'dark' ? '#FCD34D' : '#D97706';
      case 'info':
        return theme === 'dark' ? '#93C5FD' : '#3B82F6';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        width: '400px',
        maxHeight: '500px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '12px',
        boxShadow: theme === 'dark' 
          ? '0 10px 40px rgba(0, 0, 0, 0.5)'
          : '0 10px 40px rgba(0, 0, 0, 0.1)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
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
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {validation.isValid ? (
            <CheckCircle2 size={20} style={{ color: theme === 'dark' ? '#34D399' : '#10B981' }} />
          ) : (
            <AlertCircle size={20} style={{ color: theme === 'dark' ? '#FCA5A5' : '#DC2626' }} />
          )}
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: textColor }}>
              {validation.isValid ? 'Workflow Valid' : 'Validation Issues'}
            </div>
            <div style={{ fontSize: '12px', color: mutedColor, marginTop: '2px' }}>
              {errorCount > 0 && `${errorCount} error${errorCount > 1 ? 's' : ''}`}
              {warningCount > 0 && `${errorCount > 0 ? ', ' : ''}${warningCount} warning${warningCount > 1 ? 's' : ''}`}
              {infoCount > 0 && `${errorCount > 0 || warningCount > 0 ? ', ' : ''}${infoCount} info`}
              {allIssues.length === 0 && 'No issues found'}
            </div>
          </div>
        </div>
        <button
          onClick={hideValidation}
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

      {/* Issues List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px',
        }}
      >
        {allIssues.length === 0 ? (
          <div
            style={{
              padding: '32px',
              textAlign: 'center',
              color: mutedColor,
              fontSize: '13px',
            }}
          >
            <CheckCircle2 size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            All checks passed! Your workflow is ready to publish.
          </div>
        ) : (
          allIssues.map((issue, index) => (
            <div
              key={issue.id || index}
              style={{
                padding: '12px',
                marginBottom: '4px',
                borderRadius: '8px',
                background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${borderColor}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ color: getColor(issue.severity), flexShrink: 0, marginTop: '2px' }}>
                  {getIcon(issue.severity)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: textColor, marginBottom: '4px' }}>
                    {issue.message}
                  </div>
                  {('source' in issue) && (
                    <div style={{ fontSize: '11px', color: mutedColor }}>
                      {(issue as any).source}
                      {issue.field && ` • Field: ${issue.field}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
