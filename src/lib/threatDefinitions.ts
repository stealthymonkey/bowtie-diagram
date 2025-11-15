import type { Threat } from './types';

const THREAT_APPEARANCE = {
  background: 'linear-gradient(135deg,#1d4ed8,#60a5fa)',
  borderColor: '#1e40af',
  textColor: '#eff6ff',
  shadowColor: 'rgba(30,64,175,0.35)',
};

export const baselineThreats: Threat[] = [
  {
    id: 'threat-intoxicated-driving',
    label: 'Intoxicated driving',
    description: 'Driver operates while impaired by alcohol or drugs.',
    level: 0,
    severity: 'critical',
    appearance: THREAT_APPEARANCE,
  },
  {
    id: 'threat-distracted-driving',
    label: 'Distracted driving',
    description: 'Loss of focus due to phones, food, or other activities.',
    level: 0,
    severity: 'high',
    appearance: THREAT_APPEARANCE,
  },
  {
    id: 'threat-slippery-road',
    label: 'Driving on slippery road',
    description: 'Reduced tire traction from rain, snow, or spilled fluids.',
    level: 0,
    severity: 'medium',
    appearance: THREAT_APPEARANCE,
  },
  {
    id: 'threat-poor-visibility',
    label: 'Driving with poor visibility',
    description: "Fog, heavy rain, or darkness limits the driver's view.",
    level: 0,
    severity: 'medium',
    appearance: THREAT_APPEARANCE,
  },
];
