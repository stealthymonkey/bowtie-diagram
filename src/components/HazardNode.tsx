import { memo, type CSSProperties } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

const invisibleHandleStyle: CSSProperties = {
  width: 16,
  height: 16,
  borderRadius: '50%',
  opacity: 0,
  border: 'none',
  background: 'transparent',
  pointerEvents: 'none',
};

export const HazardNode = memo(({ data }: NodeProps) => {
  const dimmed = data.dimmed;
  const selected = data.selected;
  const highlighted = data.highlighted;

  return (
    <div
      style={{
        width: '240px',
        borderRadius: '20px',
        background: '#fff7ed',
        border: selected || highlighted ? '4px solid #f97316' : '3px solid #fdba74',
        boxShadow: highlighted
          ? '0 18px 40px rgba(249, 115, 22, 0.35)'
          : '0 12px 26px rgba(251, 191, 36, 0.35)',
        opacity: dimmed ? 0.45 : 1,
        overflow: 'hidden',
        color: '#9a3412',
        fontWeight: 700,
      }}
    >
      <Handle id="top" type="target" position={Position.Top} style={invisibleHandleStyle} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={invisibleHandleStyle} />
      <div
        style={{
          background:
            'repeating-linear-gradient(-45deg,#f97316,#f97316 12px,#fde68a 12px,#fde68a 24px)',
          padding: '0.25rem 0',
          color: '#fff',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontSize: '0.75rem',
          textAlign: 'center',
        }}
      >
        Hazard
      </div>
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1rem', lineHeight: 1.3 }}>{data.label}</div>
        {data.description && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 500, color: '#7c2d12' }}>
            {data.description}
          </div>
        )}
      </div>
    </div>
  );
});

HazardNode.displayName = 'HazardNode';
