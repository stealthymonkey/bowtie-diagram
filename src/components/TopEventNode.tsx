import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';

export const TopEventNode = memo(({ data }: NodeProps) => {
  const dimmed = data.dimmed;
  const selected = data.selected;
  const highlighted = data.highlighted;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #fde68a, #f97316)',
        border: selected || highlighted ? '4px solid #c2410c' : '3px solid #ea580c',
        opacity: dimmed ? 0.4 : 1,
        borderRadius: '50%',
        width: '200px',
        height: '200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#7c2d12',
        textAlign: 'center',
        fontWeight: 700,
        boxShadow: highlighted
          ? '0 18px 36px rgba(234, 88, 12, 0.45)'
          : '0 12px 28px rgba(234, 88, 12, 0.35)',
        padding: '1rem',
      }}
    >
      <div style={{ fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Top Event
      </div>
      <div style={{ fontSize: '1.1rem', lineHeight: 1.35 }}>{data.label}</div>
    </div>
  );
});

TopEventNode.displayName = 'TopEventNode';
