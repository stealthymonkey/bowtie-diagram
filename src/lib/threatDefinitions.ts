import type { Threat } from './types';

export const baselineThreats: Threat[] = [
  {
    id: 'threat-intoxicated-driving',
    label: 'Intoxicated driving',
    description: 'Driver operates while impaired by alcohol or drugs.',
    level: 0,
    severity: 'critical',
    appearance: {
      background: 'linear-gradient(135deg,#4c1d95,#3b82f6)',
      borderColor: '#c026d3',
      textColor: '#f5f3ff',
      shadowColor: 'rgba(76,29,149,0.35)',
    },
  },
  {
    id: 'threat-distracted-driving',
    label: 'Distracted driving',
    description: 'Loss of focus due to phones, food, or other activities.',
    level: 0,
    severity: 'high',
    appearance: {
      background: 'linear-gradient(135deg,#1d4ed8,#60a5fa)',
      borderColor: '#2563eb',
      textColor: '#e0f2fe',
    },
  },
  {
    id: 'threat-slippery-road',
    label: 'Driving on slippery road',
    description: 'Reduced tire traction from rain, snow, or spilled fluids.',
    level: 0,
    severity: 'medium',
    appearance: {
      background: 'linear-gradient(135deg,#0f766e,#5eead4)',
      borderColor: '#14b8a6',
      textColor: '#ecfeff',
    },
  },
  {
    id: 'threat-poor-visibility',
    label: 'Driving with poor visibility',
    description: "Fog, heavy rain, or darkness limits the driver's view.",
    level: 0,
    severity: 'medium',
    appearance: {
      background: 'linear-gradient(135deg,#475569,#cbd5f5)',
      borderColor: '#1e293b',
      textColor: '#f8fafc',
    },
  },
];

