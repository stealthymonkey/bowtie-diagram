# Testing Guide for Bowtie Diagram

## Quick Test Methods

### 1. Manual Component Testing

You can test the components by importing them into any React application:

```tsx
import { BowtieDiagramComponent } from './src/components/BowtieDiagram';
import { carAccidentBowtie } from './src/lib/carAccidentData';
import { useState } from 'react';

function TestApp() {
  const [viewLevel, setViewLevel] = useState(0);
  
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <BowtieDiagramComponent
        diagram={carAccidentBowtie}
        viewLevel={viewLevel}
        onViewLevelChange={setViewLevel}
      />
    </div>
  );
}
```

### 2. Test Layout Calculation

Test the ELK.js layout engine independently:

```tsx
import { layoutBowtieDiagram } from './src/lib/elkLayout';
import { carAccidentBowtie } from './src/lib/carAccidentData';

async function testLayout() {
  const nodes = await layoutBowtieDiagram(carAccidentBowtie, {
    viewLevel: 0,
    spacing: { horizontal: 250, vertical: 120 }
  });
  
  console.log('Layout nodes:', nodes);
  console.log('Node count:', nodes.length);
}
```

### 3. Test Data Structure

Verify the data model:

```tsx
import { carAccidentBowtie } from './src/lib/carAccidentData';

function testData() {
  const diagram = carAccidentBowtie;
  
  // Check top event
  console.log('Top Event:', diagram.topEvent);
  
  // Check threats
  console.log('Threats:', diagram.threats.length);
  diagram.threats.forEach(threat => {
    console.log(`- ${threat.label} (Level ${threat.level})`);
    if (threat.subThreats) {
      console.log(`  Sub-threats: ${threat.subThreats.length}`);
    }
  });
  
  // Check consequences
  console.log('Consequences:', diagram.consequences.length);
  
  // Check barriers
  const preventive = diagram.barriers.filter(b => b.type === 'preventive');
  const mitigative = diagram.barriers.filter(b => b.type === 'mitigative');
  console.log(`Preventive barriers: ${preventive.length}`);
  console.log(`Mitigative barriers: ${mitigative.length}`);
}
```

### 4. Test View Level Filtering

Test the hierarchical filtering:

```tsx
import { carAccidentBowtie } from './src/lib/carAccidentData';

function testViewLevels() {
  const diagram = carAccidentBowtie;
  
  // Level 0: Only top-level items
  const level0Threats = diagram.threats.filter(t => t.level === 0);
  console.log('Level 0 threats:', level0Threats.map(t => t.label));
  
  // Level 1: Include sub-threats
  const level1Threats = diagram.threats.flatMap(t => 
    t.subThreats?.filter(st => st.level === 1) || []
  );
  console.log('Level 1 threats:', level1Threats.map(t => t.label));
  
  // Level 2: Include deeper sub-threats
  const level2Threats = diagram.threats.flatMap(t => 
    t.subThreats?.flatMap(st => st.subThreats?.filter(sst => sst.level === 2) || []) || []
  );
  console.log('Level 2 threats:', level2Threats.map(t => t.label));
}
```

## Setting Up a Test Framework

### Option 1: Jest + React Testing Library

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @types/jest
```

Create `jest.config.js`:
```js
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
};
```

### Option 2: Vitest

```bash
npm install --save-dev vitest @vitest/ui
```

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
```

## Example Test Cases

### Test Component Rendering

```tsx
import { render, screen } from '@testing-library/react';
import { BowtieDiagramComponent } from './components/BowtieDiagram';
import { carAccidentBowtie } from './lib/carAccidentData';

test('renders bowtie diagram', () => {
  render(<BowtieDiagramComponent diagram={carAccidentBowtie} />);
  // Add assertions based on what you expect to see
});
```

### Test Layout Function

```tsx
import { layoutBowtieDiagram } from './lib/elkLayout';
import { carAccidentBowtie } from './lib/carAccidentData';

test('calculates layout for level 0', async () => {
  const nodes = await layoutBowtieDiagram(carAccidentBowtie, {
    viewLevel: 0,
    spacing: { horizontal: 250, vertical: 120 }
  });
  
  expect(nodes.length).toBeGreaterThan(0);
  expect(nodes.every(n => n.x !== undefined && n.y !== undefined)).toBe(true);
});
```

### Test Data Integrity

```tsx
import { carAccidentBowtie } from './lib/carAccidentData';

test('diagram has valid structure', () => {
  expect(carAccidentBowtie.topEvent).toBeDefined();
  expect(carAccidentBowtie.topEvent.id).toBeTruthy();
  expect(carAccidentBowtie.threats.length).toBeGreaterThan(0);
  expect(carAccidentBowtie.consequences.length).toBeGreaterThan(0);
});
```

## Running Tests

Once you have a test framework set up:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Testing Checklist

- [ ] Component renders without errors
- [ ] Layout calculation completes successfully
- [ ] View level filtering works correctly
- [ ] Zoom controls function properly
- [ ] Data structure is valid
- [ ] All node types render correctly
- [ ] Edges connect properly
- [ ] Hierarchical data is displayed at correct levels

