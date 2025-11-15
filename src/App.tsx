import { BowtieDiagramComponent } from './components/BowtieDiagram';
import { hazardTopEventDiagram } from './lib/hazardTopEvent';
import './index.css';

function App() {
  if (!BowtieDiagramComponent) {
    console.error('BowtieDiagramComponent is undefined!');
    return <div>Error: Component not loaded</div>;
  }

  return (
    <div className="app">
      <BowtieDiagramComponent diagram={hazardTopEventDiagram} />
    </div>
  );
}

export default App;
