import type { BowtieDiagram } from './types';
import { baselineThreats } from './threatDefinitions';
import { baselineConsequences } from './consequenceDefinitions';

export const hazardTopEventDiagram: BowtieDiagram = {
  id: 'hazard-top-event',
  name: 'Hazard & Top Event',
  hazard: {
    id: 'hazard-vehicle-highway',
    label: 'Driving a commercial vehicle on a highway',
    description: 'Operating a loaded commercial vehicle on a public highway.',
  },
  topEvent: {
    id: 'top-event-loss-of-control',
    label: 'Loss of control over the vehicle at 70 mph',
    description: 'Unintended vehicle movement that can escalate to severe incidents.',
    severity: 'high',
  },
  threats: baselineThreats,
  consequences: baselineConsequences,
  barriers: [],
};
