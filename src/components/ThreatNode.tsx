import { memo, type CSSProperties } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

const severityPalette: Record<string, { bg: string; border: string }> = {
  low: { bg: '#dbeafe', border: '#60a5fa' },
  medium: { bg: '#bfdbfe', border: '#3b82f6' },
  high: { bg: '#93c5fd', border: '#2563eb' },
  critical: { bg: '#818cf8', border: '#4338ca' },
};

const levelBadgePalette: Record<number, { background: string; color: string; border: string; shadow: string }> = {
  1: {
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.7))',
    color: '#ffffff',
    border: '1.5px solid rgba(248, 250, 252, 0.85)',
    shadow: '0 4px 10px rgba(15, 23, 42, 0.45)',
  },
  2: {
    background: '#475569',
    color: '#ffffff',
    border: '1.5px solid #475569',
    shadow: '0 4px 12px rgba(71, 85, 105, 0.55)',
  },
  3: {
    background: '#facc15',
    color: '#ffffff',
    border: '1.5px solid #facc15',
    shadow: '0 4px 12px rgba(250, 204, 21, 0.55)',
  },
  4: {
    background: '#dc2626',
    color: '#ffffff',
    border: '1.5px solid #dc2626',
    shadow: '0 4px 12px rgba(220, 38, 38, 0.55)',
  },
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
  const chipBaseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '999px',
    padding: '0.2rem 0.7rem',
    fontSize: '0.82rem',
    fontWeight: 700,
  };
  const typeChipStyle: CSSProperties = {
    ...chipBaseStyle,
    border: `1.5px solid ${borderColor}`,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    background: 'rgba(255, 255, 255, 0.9)',
    color: '#0f172a',
  };
  const levelChipStyle: CSSProperties = {
    ...chipBaseStyle,
    letterSpacing: '0.02em',
    textTransform: 'none',
  };
  const addChipStyle: CSSProperties = {
    ...chipBaseStyle,
    border: `1.5px dashed ${borderColor}`,
    background: 'transparent',
    color: borderColor,
    letterSpacing: 0,
    textTransform: 'none',
    paddingInline: '0.55rem',
  };
  const computeLevelChipStyle = (level?: number): CSSProperties | null => {
    if (typeof level !== 'number') return null;
    const boundedLevel = Math.min(4, Math.max(1, Math.round(level)));
    const palette = levelBadgePalette[boundedLevel] ?? levelBadgePalette[1];
    return {
      ...levelChipStyle,
      background: palette.background,
      color: palette.color,
      border: palette.border,
      boxShadow: palette.shadow,
      letterSpacing: '0.05em',
    };
  };
  const badgeStyle = computeLevelChipStyle(data.level);

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
        {badgeStyle ? <span style={badgeStyle}>Level {data.level}</span> : null}
        {data.hasChildren ? <span style={addChipStyle}>+</span> : null}
      </div>
      <div style={{ fontSize: '1.1rem', lineHeight: 1.4 }}>{data.label}</div>
    </div>
  );
});

ThreatNode.displayName = 'ThreatNode';
