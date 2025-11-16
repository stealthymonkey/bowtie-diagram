import { memo, type CSSProperties } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { describeBarrierMechanism, describeBarrierType } from '../lib/barrierMeta';

const severityPalette: Record<string, { bg: string; border: string }> = {
  low: { bg: '#fee2e2', border: '#f87171' },
  medium: { bg: '#fecaca', border: '#ef4444' },
  high: { bg: '#fca5a5', border: '#dc2626' },
  critical: { bg: '#f87171', border: '#b91c1c' },
};

const levelBadgePalette: Record<number, { background: string; color: string; border: string; shadow: string }> = {
  1: {
    background: 'linear-gradient(135deg, rgba(67, 20, 7, 0.9), rgba(67, 20, 7, 0.7))',
    color: '#ffffff',
    border: '1.5px solid rgba(255, 255, 255, 0.85)',
    shadow: '0 4px 10px rgba(67, 20, 7, 0.5)',
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

const barrierSectionStyle: CSSProperties = {
  marginTop: '0.85rem',
  paddingTop: '0.7rem',
  borderTop: '1px solid rgba(248, 113, 113, 0.35)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.45rem',
};

const barrierSectionTitleStyle: CSSProperties = {
  fontSize: '0.75rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#fee2e2',
  fontWeight: 700,
};

const barrierListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.45rem',
};

const barrierCardStyle: CSSProperties = {
  background: 'rgba(255, 255, 255, 0.94)',
  borderRadius: '10px',
  padding: '0.45rem 0.6rem',
  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
};

const barrierMetaRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.35rem',
  marginTop: '0.35rem',
};

const barrierChipBaseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: '999px',
  padding: '0.12rem 0.45rem',
  fontSize: '0.68rem',
  fontWeight: 700,
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
};

const barrierOwnerStyle: CSSProperties = {
  marginTop: '0.3rem',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#0f172a',
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
  const barriers = Array.isArray(data.barriers) ? data.barriers : [];
  const hasBarriers = barriers.length > 0;
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
    color: '#7f1d1d',
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
        {badgeStyle ? <span style={badgeStyle}>Level {data.level}</span> : null}
        {data.hasChildren ? <span style={addChipStyle}>+</span> : null}
      </div>
      <div style={{ fontSize: '1.1rem', lineHeight: 1.4 }}>{data.label}</div>
      {hasBarriers ? (
        <div style={barrierSectionStyle}>
          <span style={barrierSectionTitleStyle}>Mitigative barriers</span>
          <div style={barrierListStyle}>
            {barriers.map((barrier) => {
              const mechanism = describeBarrierMechanism(barrier.mechanism);
              const typeLabel = describeBarrierType(barrier.type);
              return (
                <div key={barrier.id} style={barrierCardStyle}>
                  <div style={{ fontWeight: 600, color: '#0f172a', lineHeight: 1.35 }}>
                    {barrier.label}
                  </div>
                  <div style={barrierMetaRowStyle}>
                    <span
                      style={{
                        ...barrierChipBaseStyle,
                        background: 'rgba(248, 113, 113, 0.15)',
                        color: '#991b1b',
                      }}
                    >
                      {typeLabel}
                    </span>
                    {mechanism ? (
                      <span
                        style={{
                          ...barrierChipBaseStyle,
                          border: `1px solid ${mechanism.color}`,
                          color: mechanism.color,
                          background: 'rgba(255, 255, 255, 0.85)',
                          textTransform: 'none',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {mechanism.label}
                      </span>
                    ) : null}
                    {barrier.effectiveness ? (
                      <span
                        style={{
                          ...barrierChipBaseStyle,
                          background: '#fef3c7',
                          color: '#92400e',
                        }}
                      >
                        Eff: {barrier.effectiveness}
                      </span>
                    ) : null}
                  </div>
                  {barrier.owner ? (
                    <div style={barrierOwnerStyle}>Owner: {barrier.owner}</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
});

ConsequenceNode.displayName = 'ConsequenceNode';
