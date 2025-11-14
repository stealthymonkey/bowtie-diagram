import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';

export const BarrierNode = memo(({ data }: NodeProps) => {
  const isPreventive = data.barrierType === 'preventive';
  const bgColor = isPreventive ? '#d1fae5' : '#fef3c7';
  const borderColor = isPreventive ? '#10b981' : '#f59e0b';
  const icon = isPreventive ? '🛡️' : '🔧';

  return (
    <div
      style={{
        background: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: '6px',
        padding: '8px',
        minWidth: '120px',
        textAlign: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        fontWeight: '500',
        fontSize: '12px',
      }}
    >
      <div style={{ marginBottom: '2px' }}>{icon}</div>
      <div>{data.label}</div>
    </div>
  );
});

BarrierNode.displayName = 'BarrierNode';

