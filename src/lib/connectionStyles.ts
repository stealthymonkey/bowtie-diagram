import type { CSSProperties } from 'react';

export interface ConnectionTheme {
  style: CSSProperties;
}

export const DEFAULT_CONNECTION: ConnectionTheme = {
  style: {
    stroke: '#0ea5e9',
    strokeWidth: 4,
    strokeLinecap: 'round',
  },
};
