# Bowtie Diagram Visualization
#By: Siddhant Agarwal, Madelen Atanassov, Christian Busk, Tarik Liassou, Tyler Fearne

A React-based bowtie diagram visualization system for modeling cause and effect relationships in car accidents and hazards.

## Features

- **Interactive Bowtie Diagrams** - Visualize threats, barriers, top events, and consequences
- **Hierarchical Views** - Navigate through different levels of hazard detail
- **ELK.js Layout** - Automatic graph layout using ELK.js
- **Zoom & Pan** - Interactive navigation controls
- **React Flow Integration** - Built on @xyflow/react for smooth interactions

## Components

### Core Components
- `BowtieDiagram` - Main diagram component with zoom/pan controls
- `ThreatNode` - Visual representation of threats
- `ConsequenceNode` - Visual representation of consequences
- `BarrierNode` - Visual representation of preventive and mitigative barriers
- `TopEventNode` - Visual representation of the top event

### Data Structure
- `carAccidentData.ts` - Sample car accident hazard data with hierarchical structure
- `types.ts` - TypeScript type definitions
- `elkLayout.ts` - ELK.js layout engine integration

## Usage

The bowtie diagram component can be imported and used in any React application:

```tsx
import { BowtieDiagramComponent } from './components/BowtieDiagram';
import { carAccidentBowtie } from './lib/carAccidentData';

function App() {
  return <BowtieDiagramComponent diagram={carAccidentBowtie} />;
}
```

## View Levels

- **Level 0**: Top-level threats and consequences (main hazards)
- **Level 1**: Primary causes and effects
- **Level 2+**: Detailed breakdown of sub-threats and sub-consequences

## Dependencies

- `react` & `react-dom` - React framework
- `@xyflow/react` - Interactive diagram rendering
- `elkjs` - Graph layout engine
- `typescript` - Type safety

## Project Structure

```
src/
├── components/          # React components
│   ├── BowtieDiagram.tsx
│   ├── ThreatNode.tsx
│   ├── ConsequenceNode.tsx
│   ├── BarrierNode.tsx
│   └── TopEventNode.tsx
├── lib/                 # Core logic
│   ├── types.ts         # Type definitions
│   ├── elkLayout.ts     # ELK.js integration
│   └── carAccidentData.ts  # Sample data
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

## Testing

To test the components, you can:

1. Import them into your React application
2. Use a test framework like Jest + React Testing Library
3. Test the layout calculations independently
4. Test the data filtering logic

Example test structure:

```tsx
import { render } from '@testing-library/react';
import { BowtieDiagramComponent } from './components/BowtieDiagram';
import { carAccidentBowtie } from './lib/carAccidentData';

test('renders bowtie diagram', () => {
  const { container } = render(
    <BowtieDiagramComponent diagram={carAccidentBowtie} />
  );
  // Add your assertions
});
```
