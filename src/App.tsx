import { useState } from 'react';
import { BowtieDiagramComponent } from './components/BowtieDiagram';
import { carAccidentBowtie } from './lib/carAccidentData';
import './index.css';

function App() {
  const [viewLevel, setViewLevel] = useState(0);

  return (
    <div className="app">
      <BowtieDiagramComponent
        diagram={carAccidentBowtie}
        viewLevel={viewLevel}
        onViewLevelChange={setViewLevel}
      />
    </div>
  );
}

export default App;
