import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';

const severityPalette: Record<string, { bg: string; border: string }> = {
  low: { bg: '#dbeafe', border: '#60a5fa' },
  medium: { bg: '#bfdbfe', border: '#3b82f6' },
  high: { bg: '#93c5fd', border: '#2563eb' },
  critical: { bg: '#818cf8', border: '#4338ca' },
};

export const ThreatNode = memo(({ data }: NodeProps) => {
  const severity = data.severity || 'medium';
  const palette = severityPalette[severity] ?? severityPalette.medium;
  const dimmed = data.dimmed;
  const selected = data.selected;
  const highlighted = data.highlighted;

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${palette.bg}, #e0f2fe)`,
        border: selected || highlighted ? `3px solid ${palette.border}` : `2px solid ${palette.border}`,
        opacity: dimmed ? 0.3 : 1,
        borderRadius: '16px',
        padding: '14px 18px',
        minWidth: '180px',
        maxWidth: '220px',
        boxShadow: highlighted
          ? '0 14px 32px rgba(37, 99, 235, 0.35)'
          : '0 8px 18px rgba(148, 163, 184, 0.35)',
        color: '#0f172a',
        fontWeight: 600,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.35rem',
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: '#475569',
        }}
      >
        <span>Threat</span>
        {data.hasChildren ? (
          <span
            style={{
              borderRadius: '999px',
              border: `1px solid ${palette.border}`,
              padding: '0 6px',
              fontWeight: 700,
            }}
          >
            +
          </span>
        ) : null}
      </div>
      <div style={{ fontSize: '1rem', lineHeight: 1.3 }}>{data.label}</div>
      {data.level !== undefined && (
        <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#334155' }}>
          Level {data.level}
        </div>
      )}
    </div>
  );
});

ThreatNode.displayName = 'ThreatNode';
