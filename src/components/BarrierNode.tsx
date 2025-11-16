import { memo, type CSSProperties } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

const palette = {
  preventive: {
    bg: '#ecfdf5',
    border: '#059669',
    label: 'Preventive barrier',
  },
  mitigative: {
    bg: '#eef2ff',
    border: '#6366f1',
    label: 'Mitigative barrier',
  },
};

const mechanismStyles: Record<string, { label: string; color: string }> = {
  activeHuman: { label: 'Active human', color: '#dc2626' },
  activeHardware: { label: 'Active hardware', color: '#0ea5e9' },
  passiveHardware: { label: 'Passive hardware', color: '#10b981' },
  hybrid: { label: 'Active human + hardware', color: '#a16207' },
};

const invisibleHandleStyle: CSSProperties = {
  width: 12,
  height: 12,
  borderRadius: '50%',
  opacity: 0,
  border: 'none',
  background: 'transparent',
  pointerEvents: 'none',
};

export const BarrierNode = memo(({ data }: NodeProps) => {
  const type = data.barrierType === 'mitigative' ? 'mitigative' : 'preventive';
  const colors = palette[type];
  const dimmed = data.dimmed;
  const selected = data.selected;
  const highlighted = data.highlighted;
  const mechanism = data.mechanism ? mechanismStyles[data.mechanism] : null;

  return (
    <div
      style={{
        background: `linear-gradient(180deg, ${colors.bg}, #ffffff)`,
        border: selected || highlighted ? `3px solid ${colors.border}` : `2px solid ${colors.border}`,
        opacity: dimmed ? 0.35 : 1,
        borderRadius: '12px',
        padding: '10px 14px',
        minWidth: '160px',
        maxWidth: '260px',
        width: 'fit-content',
        boxShadow: highlighted
          ? '0 12px 24px rgba(15, 118, 110, 0.25)'
          : '0 6px 14px rgba(148, 163, 184, 0.3)',
        wordBreak: 'break-word',
        whiteSpace: 'normal',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Handle type="target" position={Position.Left} style={invisibleHandleStyle} />
      <Handle type="source" position={Position.Right} style={invisibleHandleStyle} />
      <div
        style={{
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: colors.border,
          marginBottom: '0.35rem',
        }}
      >
        {colors.label}
      </div>
      <div
        style={{
          fontWeight: 600,
          color: '#0f172a',
          lineHeight: 1.3,
          wordBreak: 'break-word',
        }}
      >
        {data.label}
      </div>
      {data.effectiveness && (
        <div
          style={{
            marginTop: '0.4rem',
            fontSize: '0.75rem',
            color: '#475569',
          }}
        >
          Effectiveness: {data.effectiveness}
        </div>
      )}
      {mechanism && (
        <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: mechanism.color }}>
          {mechanism.label}
        </div>
      )}
      {data.owner && (
        <div style={{ marginTop: '0.25rem', fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>
          Owner: {data.owner}
        </div>
      )}
    </div>
  );
});

BarrierNode.displayName = 'BarrierNode';
