import type { Consequence } from './types';

export const baselineConsequences: Consequence[] = [
  {
    id: 'consequence-fixed-object',
    label: 'Crash into a fixed object',
    description: 'Collision with guard rails, barriers, or poles.',
    level: 0,
    severity: 'high',
    appearance: {
      background: 'linear-gradient(135deg,#f87171,#fecaca)',
      borderColor: '#b91c1c',
      textColor: '#7f1d1d',
      shadowColor: 'rgba(185,28,28,0.35)',
    },
  },
  {
    id: 'consequence-driver-impact',
    label: 'Driver impacts internals of the vehicle',
    description: 'Occupants strike internal vehicle surfaces.',
    level: 0,
    severity: 'high',
    appearance: {
      background: 'linear-gradient(135deg,#f97316,#fed7aa)',
      borderColor: '#c2410c',
      textColor: '#7c2d12',
    },
  },
  {
    id: 'consequence-rollover',
    label: 'Vehicle roll-over',
    description: 'Vehicle overturns due to loss of stability.',
    level: 0,
    severity: 'critical',
    appearance: {
      background: 'linear-gradient(135deg,#b91c1c,#fca5a5)',
      borderColor: '#7f1d1d',
      textColor: '#fff5f5',
    },
  },
];

