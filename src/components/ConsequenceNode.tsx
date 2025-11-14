import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';

export const ConsequenceNode = memo(({ data }: NodeProps) => {
  const severityColors: Record<string, string> = {
    low: '#dbeafe',
    medium: '#93c5fd',
    high: '#60a5fa',
    critical: '#3b82f6',
  };

  const severityBorderColors: Record<string, string> = {
    low: '#93c5fd',
    medium: '#60a5fa',
    high: '#3b82f6',
    critical: '#1d4ed8',
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
      <div style={{ marginBottom: '4px' }}>💥</div>
      <div>{data.label}</div>
      {data.level !== undefined && data.level > 0 && (
        <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
          Level {data.level}
        </div>
      )}
    </div>
  );
});

ConsequenceNode.displayName = 'ConsequenceNode';

