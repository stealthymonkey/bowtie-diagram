import type { CSSProperties } from 'react';
import { MarkerType } from '@xyflow/react';

export interface ConnectionTheme {
  style: CSSProperties;
  markerEnd?: {
    type: MarkerType;
    color: string;
    width: number;
    height: number;
  };
}

export const DEFAULT_CONNECTION: ConnectionTheme = {
  style: {
    stroke: '#0ea5e9',
    strokeWidth: 4,
    strokeLinecap: 'round',
    filter: 'drop-shadow(0 3px 6px rgba(14,165,233,0.35))',
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#0ea5e9',
    width: 18,
    height: 18,
  },
};

export const HAZARD_CONNECTION: ConnectionTheme = {
  style: {
    stroke: '#0ea5e9',
    strokeWidth: 4,
    strokeLinecap: 'round',
    filter: 'none',
  },
};
