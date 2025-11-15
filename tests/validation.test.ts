import assert from 'node:assert/strict';
import { validateBowtieDiagram } from '../src/lib/validation';
import type { BowtieDiagram } from '../src/lib/types';

function createBaseDiagram(): BowtieDiagram {
  return {
    id: 'diagram-1',
    name: 'Test Diagram',
    hazard: {
      id: 'hazard-1',
      label: 'Driving a commercial vehicle on a highway',
    },
    topEvent: {
      id: 'top-event-1',
      label: 'Loss of control over the vehicle at 70 mph',
      severity: 'high',
    },
    threats: [
      {
        id: 'threat-1',
        label: 'Distractive driving',
        level: 0,
      },
    ],
    consequences: [
      {
        id: 'consequence-1',
        label: 'Crash into a fixed object',
        level: 0,
      },
    ],
    barriers: [
      {
        id: 'barrier-1',
        label: 'Driver self-reporting',
        type: 'preventive',
        threatId: 'threat-1',
      },
      {
        id: 'barrier-2',
        label: 'Seatbelts',
        type: 'mitigative',
        consequenceId: 'consequence-1',
      },
    ],
  };
}

(() => {
  const diagram = createBaseDiagram();
  const issues = validateBowtieDiagram(diagram);
  assert.equal(issues.length, 0, `Expected no issues, got ${JSON.stringify(issues, null, 2)}`);
})();

(() => {
  const diagram = createBaseDiagram();
  diagram.barriers[0] = {
    ...diagram.barriers[0],
    type: 'preventive',
    threatId: '',
  };
  const issues = validateBowtieDiagram(diagram);
  assert.ok(
    issues.some((issue) => issue.id.includes('barrier') && issue.message.includes('threatId')),
    'Expected preventive barrier to require threatId',
  );
})();

(() => {
  const diagram = createBaseDiagram();
  diagram.threats[0] = {
    ...diagram.threats[0],
    parentId: 'missing',
  };
  const issues = validateBowtieDiagram(diagram);
  assert.ok(
    issues.some((issue) => issue.id.includes('parent')),
    'Expected child threat to complain about missing parent',
  );
})();

(() => {
  const diagram = createBaseDiagram();
  diagram.barriers[1] = {
    ...diagram.barriers[1],
    type: 'mitigative',
    consequenceId: undefined,
    threatId: 'threat-1',
  };
  const issues = validateBowtieDiagram(diagram);
  assert.ok(
    issues.some((issue) => issue.message.includes('consequenceId')),
    'Expected mitigative barrier to require a consequenceId',
  );
})();

console.log('Validation tests passed');

