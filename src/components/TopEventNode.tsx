import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';

export const TopEventNode = memo(({ data }: NodeProps) => {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: '4px solid #4c1d95',
        borderRadius: '12px',
        padding: '20px',
        minWidth: '180px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '16px',
      }}
    >
      <div style={{ marginBottom: '8px', fontSize: '24px' }}>⚡</div>
      <div>{data.label}</div>
    </div>
  );
});

TopEventNode.displayName = 'TopEventNode';

