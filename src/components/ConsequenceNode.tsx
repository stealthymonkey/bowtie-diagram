import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';

const severityPalette: Record<string, { bg: string; border: string }> = {
  low: { bg: '#fee2e2', border: '#f87171' },
  medium: { bg: '#fecaca', border: '#ef4444' },
  high: { bg: '#fca5a5', border: '#dc2626' },
  critical: { bg: '#f87171', border: '#b91c1c' },
};

export const ConsequenceNode = memo(({ data }: NodeProps) => {
  const severity = data.severity || 'medium';
  const palette = severityPalette[severity] ?? severityPalette.medium;
  const dimmed = data.dimmed;
  const selected = data.selected;
  const highlighted = data.highlighted;

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${palette.bg}, #fee2e2)`,
        border: selected || highlighted ? `3px solid ${palette.border}` : `2px solid ${palette.border}`,
        opacity: dimmed ? 0.3 : 1,
        borderRadius: '16px',
        padding: '14px 18px',
        minWidth: '180px',
        maxWidth: '220px',
        color: '#7f1d1d',
        boxShadow: highlighted
          ? '0 14px 32px rgba(220, 38, 38, 0.35)'
          : '0 8px 18px rgba(248, 113, 113, 0.3)',
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
          color: '#7f1d1d',
        }}
      >
        <span>Consequence</span>
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
        <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#7f1d1d' }}>
          Level {data.level}
        </div>
      )}
    </div>
  );
});

ConsequenceNode.displayName = 'ConsequenceNode';
