import { useState } from 'react';
import { BowtieDiagramComponent } from './components/BowtieDiagram';
import { hazardTopEventDiagram } from './lib/hazardTopEvent';
import './index.css';

function App() {
  const [viewLevel, setViewLevel] = useState(0);

  // Verify component is defined
  if (!BowtieDiagramComponent) {
    console.error('BowtieDiagramComponent is undefined!');
    return <div>Error: Component not loaded</div>;
  }

  return (
    <div className="app">
      <BowtieDiagramComponent
        diagram={hazardTopEventDiagram}
        viewLevel={viewLevel}
        onViewLevelChange={setViewLevel}
      />
    </div>
  );
}

export default App;
