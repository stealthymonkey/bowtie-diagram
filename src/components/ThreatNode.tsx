import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';

export const ThreatNode = memo(({ data }: NodeProps) => {
  const severityColors: Record<string, string> = {
    low: '#fef3c7',
    medium: '#fde68a',
    high: '#fbbf24',
    critical: '#f59e0b',
  };

  const severityBorderColors: Record<string, string> = {
    low: '#fcd34d',
    medium: '#fbbf24',
    high: '#f59e0b',
    critical: '#d97706',
  };

  const severity = data.severity || 'medium';
  const bgColor = severityColors[severity] || severityColors.medium;
  const borderColor = severityBorderColors[severity] || severityBorderColors.medium;

  return (
    <div
      style={{
        background: bgColor,
        border: `3px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '12px',
        minWidth: '150px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontWeight: '600',
        fontSize: '14px',
      }}
    >
      <div style={{ marginBottom: '4px' }}>⚠️</div>
      <div>{data.label}</div>
      {data.level !== undefined && data.level > 0 && (
        <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
          Level {data.level}
        </div>
      )}
    </div>
  );
});

ThreatNode.displayName = 'ThreatNode';

