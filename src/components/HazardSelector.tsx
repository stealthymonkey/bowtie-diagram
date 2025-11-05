import { useEffect, useState } from 'react';
import { Hazard } from '../lib/types';
import { getTopLevelHazards, getChildHazards } from '../lib/hazardService';
import { ChevronRight } from 'lucide-react';

interface HazardSelectorProps {
  onSelectHazard: (hazardId: string) => void;
  selectedHazardId: string | null;
}

export function HazardSelector({ onSelectHazard, selectedHazardId }: HazardSelectorProps) {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHazards() {
      try {
        setLoading(true);
        const data = await getTopLevelHazards();
        setHazards(data);
        if (data.length > 0 && !selectedHazardId) {
          onSelectHazard(data[0].id);
        }
      } catch (err) {
        setError('Failed to load hazards');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadHazards();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-32 bg-gray-50 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading hazards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-32 bg-red-50 rounded-lg flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid gap-3">
        {hazards.map((hazard) => (
          <button
            key={hazard.id}
            onClick={() => onSelectHazard(hazard.id)}
            className={`text-left p-4 rounded-lg border-2 transition-all shadow-sm hover:shadow-md ${
              selectedHazardId === hazard.id
                ? 'border-blue-600 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm leading-snug">{hazard.name}</h3>
                {hazard.description && (
                  <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{hazard.description}</p>
                )}
              </div>
              <ChevronRight className={`w-5 h-5 flex-shrink-0 ml-2 transition-colors ${selectedHazardId === hazard.id ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
