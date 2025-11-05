import { useState } from 'react';
import { HazardSelector } from './components/HazardSelector';
import { BowTieDiagram } from './components/BowTieDiagram';
import { Shield } from 'lucide-react';

function App() {
  const [selectedHazardId, setSelectedHazardId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bow-Tie Hazard Analysis</h1>
            <p className="text-sm text-gray-600">Interactive risk assessment and prevention planning</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Hazard Scenarios</h2>
                <HazardSelector
                  selectedHazardId={selectedHazardId}
                  onSelectHazard={setSelectedHazardId}
                />
              </div>
            </div>
          </aside>

          <section className="lg:col-span-3">
            {selectedHazardId ? (
              <BowTieDiagram hazardId={selectedHazardId} />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a hazard scenario to view the analysis</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
