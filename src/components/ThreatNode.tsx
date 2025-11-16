import { memo, type CSSProperties } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

const severityPalette: Record<string, { bg: string; border: string }> = {
  low: { bg: '#dbeafe', border: '#60a5fa' },
  medium: { bg: '#bfdbfe', border: '#3b82f6' },
  high: { bg: '#93c5fd', border: '#2563eb' },
  critical: { bg: '#818cf8', border: '#4338ca' },
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

export const ThreatNode = memo(({ data }: NodeProps) => {
  const severity = data.severity || 'medium';
  const basePalette = severityPalette[severity] ?? severityPalette.medium;
  const background = data.appearance?.background ?? `linear-gradient(135deg, ${basePalette.bg}, #e0f2fe)`;
  const borderColor = data.appearance?.borderColor ?? basePalette.border;
  const textColor = data.appearance?.textColor ?? '#0f172a';
  const restingShadow = data.appearance?.shadowColor ?? 'rgba(148, 163, 184, 0.35)';
  const highlightShadow = data.appearance?.shadowColor ?? 'rgba(37, 99, 235, 0.35)';
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
    color: '#0f172a',
  };
  const levelChipStyle: CSSProperties = {
    ...typeChipStyle,
    textTransform: 'none',
    letterSpacing: '0.02em',
    background: 'rgba(59, 130, 246, 0.15)',
    color: '#1e3a8a',
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
        boxShadow: highlighted
          ? `0 14px 32px ${highlightShadow}`
          : `0 8px 18px ${restingShadow}`,
        color: textColor,
        fontWeight: 600,
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
        <span style={typeChipStyle}>Threat</span>
        {data.level !== undefined ? (
          <span style={levelChipStyle}>Level {data.level}</span>
        ) : null}
        {data.hasChildren ? <span style={addChipStyle}>+</span> : null}
      </div>
      <div style={{ fontSize: '1.1rem', lineHeight: 1.4 }}>{data.label}</div>
    </div>
  );
});

ThreatNode.displayName = 'ThreatNode';
