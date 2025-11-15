import { useEffect, useMemo, useState } from 'react';
import { BowtieDiagramComponent } from './components/BowtieDiagram';
import { hazardTopEventDiagram } from './lib/hazardTopEvent';
import { lossOfControlScenario } from './lib/lossOfControlScenario';
import type { BowtieDiagram } from './lib/types';
import './index.css';

type DiagramPreset = 'hazardOnly' | 'scenario';

const PRESET_MAP: Record<DiagramPreset, { label: string; diagram: BowtieDiagram }> = {
  hazardOnly: {
    label: 'Hazard & Top Event',
    diagram: hazardTopEventDiagram,
  },
  scenario: {
    label: 'Full scenario: Loss of Control',
    diagram: lossOfControlScenario,
  },
};

function App() {
  const [viewLevel, setViewLevel] = useState(0);
  const [preset, setPreset] = useState<DiagramPreset>('hazardOnly');

  useEffect(() => {
    setViewLevel(0);
  }, [preset]);

  const activeDiagram = useMemo(() => PRESET_MAP[preset].diagram, [preset]);

  if (!BowtieDiagramComponent) {
    console.error('BowtieDiagramComponent is undefined!');
    return <div>Error: Component not loaded</div>;
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__picker">
          <label htmlFor="diagram-preset">Diagram preset</label>
          <select
            id="diagram-preset"
            value={preset}
            onChange={(event) => setPreset(event.target.value as DiagramPreset)}
          >
            {Object.entries(PRESET_MAP).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </div>
      </header>
      <div className="app__content">
        <BowtieDiagramComponent diagram={activeDiagram} viewLevel={viewLevel} onViewLevelChange={setViewLevel} />
      </div>
    </div>
  );
}

export default App;
