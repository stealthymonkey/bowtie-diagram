import type { Barrier } from './types';

export const mitigativeBarriers: Barrier[] = [
  {
    id: 'barrier-crash-attenuator',
    label: 'Crash attenuator infrastructure',
    description: 'Impact attenuators and guard rails reduce severity when hitting fixed objects.',
    type: 'mitigative',
    effectiveness: 'medium',
    consequenceId: 'consequence-fixed-object',
    mechanism: 'passiveHardware',
    owner: 'Road Maintenance Lead',
  },
  {
    id: 'barrier-driver-restraints',
    label: 'Driver restraint program',
    description: 'Seatbelt interlocks and compliance audits keep occupants restrained.',
    type: 'mitigative',
    effectiveness: 'high',
    consequenceId: 'consequence-driver-impact',
    mechanism: 'activeHardware',
    owner: 'Fleet Safety Manager',
  },
  {
    id: 'barrier-airbag-system',
    label: 'Adaptive airbag systems',
    description: 'Multi-stage airbags deploy to cushion cockpit impacts.',
    type: 'mitigative',
    effectiveness: 'high',
    consequenceId: 'consequence-driver-impact',
    mechanism: 'activeHardware',
    owner: 'Vehicle Engineering',
  },
  {
    id: 'barrier-rollover-response',
    label: 'Rollover rapid response plan',
    description: 'Automatic incident alerting dispatches emergency services and hazmat teams.',
    type: 'mitigative',
    effectiveness: 'medium',
    consequenceId: 'consequence-rollover',
    mechanism: 'hybrid',
    owner: 'Emergency Coordinator',
  },
];

