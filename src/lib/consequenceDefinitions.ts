import type { Consequence } from './types';

const CONSEQUENCE_APPEARANCE = {
  background: 'linear-gradient(135deg,#dc2626,#fca5a5)',
  borderColor: '#991b1b',
  textColor: '#fff1f2',
  shadowColor: 'rgba(220,38,38,0.35)',
};

export const baselineConsequences: Consequence[] = [
  {
    id: 'consequence-fixed-object',
    label: 'Crash into a fixed object',
    description: 'Collision with guard rails, barriers, or poles.',
    level: 0,
    severity: 'high',
    appearance: CONSEQUENCE_APPEARANCE,
  },
  {
    id: 'consequence-driver-impact',
    label: 'Driver impacts internals of the vehicle',
    description: 'Occupants strike internal vehicle surfaces.',
    level: 0,
    severity: 'high',
    appearance: CONSEQUENCE_APPEARANCE,
  },
  {
    id: 'consequence-rollover',
    label: 'Vehicle roll-over',
    description: 'Vehicle overturns due to loss of stability.',
    level: 0,
    severity: 'critical',
    appearance: CONSEQUENCE_APPEARANCE,
  },
];
