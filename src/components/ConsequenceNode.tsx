import { memo, type CSSProperties } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

const severityPalette: Record<string, { bg: string; border: string }> = {
  low: { bg: '#fee2e2', border: '#f87171' },
  medium: { bg: '#fecaca', border: '#ef4444' },
  high: { bg: '#fca5a5', border: '#dc2626' },
  critical: { bg: '#f87171', border: '#b91c1c' },
};

const invisibleHandleStyle: CSSProperties = {
  width: 14,
  height: 14,
  borderRadius: '50%',
  opacity: 0,
  border: 'none',
  background: 'transparent',
  pointerEvents: 'none',
};

export const ConsequenceNode = memo(({ data }: NodeProps) => {
  const severity = data.severity || 'medium';
  const basePalette = severityPalette[severity] ?? severityPalette.medium;
  const background = data.appearance?.background ?? `linear-gradient(135deg, ${basePalette.bg}, #fee2e2)`;
  const borderColor = data.appearance?.borderColor ?? basePalette.border;
  const textColor = data.appearance?.textColor ?? '#7f1d1d';
  const restingShadow = data.appearance?.shadowColor ?? 'rgba(248, 113, 113, 0.3)';
  const highlightShadow = data.appearance?.shadowColor ?? 'rgba(220, 38, 38, 0.35)';
  const dimmed = data.dimmed;
  const selected = data.selected;
  const highlighted = data.highlighted;
  const typeChipStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '999px',
    border: `1.5px solid ${borderColor}`,
    padding: '0.2rem 0.7rem',
    fontSize: '0.78rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontWeight: 700,
    background: 'rgba(255, 255, 255, 0.85)',
    color: '#7f1d1d',
  };
  const levelChipStyle: CSSProperties = {
    ...typeChipStyle,
    textTransform: 'none',
    letterSpacing: '0.02em',
    background: 'rgba(248, 113, 113, 0.12)',
    color: '#7f1d1d',
  };
  const addChipStyle: CSSProperties = {
    ...typeChipStyle,
    borderStyle: 'dashed',
    background: 'transparent',
    color: borderColor,
    letterSpacing: 0,
    textTransform: 'none',
    paddingInline: '0.55rem',
  };

  return (
    <div
      style={{
        background,
        border: selected || highlighted ? `3px solid ${borderColor}` : `2px solid ${borderColor}`,
        opacity: dimmed ? 0.3 : 1,
        borderRadius: '16px',
        padding: '14px 18px',
        minWidth: '180px',
        maxWidth: '220px',
        color: textColor,
        boxShadow: highlighted
          ? `0 14px 32px ${highlightShadow}`
          : `0 8px 18px ${restingShadow}`,
      }}
    >
      <Handle type="target" position={Position.Left} style={invisibleHandleStyle} />
      <Handle type="source" position={Position.Right} style={invisibleHandleStyle} />
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          marginBottom: '0.65rem',
        }}
      >
        <span style={typeChipStyle}>Consequence</span>
        {data.level !== undefined ? (
          <span style={levelChipStyle}>Level {data.level}</span>
        ) : null}
        {data.hasChildren ? <span style={addChipStyle}>+</span> : null}
      </div>
      <div style={{ fontSize: '1.1rem', lineHeight: 1.4 }}>{data.label}</div>
    </div>
  );
});

ConsequenceNode.displayName = 'ConsequenceNode';
