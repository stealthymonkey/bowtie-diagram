import { useEffect, useState } from 'react';
import { HazardDetail, Threat, Consequence } from '../lib/types';
import { getHazardDetail, getThreatBarriers } from '../lib/hazardService';
import { ThreatCard } from './ThreatCard';
import { TopEventNode } from './TopEventNode';
import { ConsequenceCard } from './ConsequenceCard';
import { BarrierChainPanel } from './BarrierChainPanel';
import { AlertCircle } from 'lucide-react';

interface BowTieDiagramProps {
  hazardId: string;
}

export function BowTieDiagram({ hazardId }: BowTieDiagramProps) {
  const [hazardDetail, setHazardDetail] = useState<HazardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [selectedConsequence, setSelectedConsequence] = useState<Consequence | null>(null);
  const [threatBarriers, setThreatBarriers] = useState<any>(null);

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true);
        const detail = await getHazardDetail(hazardId);
        if (detail) {
          setHazardDetail(detail);
          setSelectedThreat(null);
          setSelectedConsequence(null);
        } else {
          setError('Hazard not found');
        }
      } catch (err) {
        setError('Failed to load hazard details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
  }, [hazardId]);

  useEffect(() => {
    async function loadThreatBarriers() {
      if (!selectedThreat || !hazardDetail) return;

      try {
        const barriers = await getThreatBarriers(hazardDetail.bowtie.id, selectedThreat.id);
        setThreatBarriers(barriers);
      } catch (err) {
        console.error('Failed to load threat barriers:', err);
      }
    }

    loadThreatBarriers();
  }, [selectedThreat, hazardDetail]);

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Loading diagram...</p>
      </div>
    );
  }

  if (error || !hazardDetail) {
    return (
      <div className="w-full bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-900">{error || 'Error loading diagram'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-8">
      <div className="space-y-2 pb-4 border-b border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900">{hazardDetail.bowtie.name}</h2>
        {hazardDetail.bowtie.description && (
          <p className="text-gray-600 text-base">{hazardDetail.bowtie.description}</p>
        )}
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-3 gap-6 p-10 min-h-96">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                Threats
              </h3>
            </div>
            <div className="space-y-3">
              {hazardDetail.threats.map((threat) => (
                <ThreatCard
                  key={threat.id}
                  threat={threat}
                  isSelected={selectedThreat?.id === threat.id}
                  onClick={() => {
                    setSelectedThreat(
                      selectedThreat?.id === threat.id ? null : threat
                    );
                    setSelectedConsequence(null);
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="w-full flex flex-col items-center gap-4">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-gray-300"></div>
              <TopEventNode event={hazardDetail.top_event} />
              <div className="w-full h-px bg-gradient-to-l from-transparent via-gray-300 to-gray-300"></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6 justify-end">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                Consequences
              </h3>
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
            </div>
            <div className="space-y-3">
              {hazardDetail.consequences.map((consequence) => (
                <ConsequenceCard
                  key={consequence.id}
                  consequence={consequence}
                  isSelected={selectedConsequence?.id === consequence.id}
                  onClick={() => {
                    setSelectedConsequence(
                      selectedConsequence?.id === consequence.id ? null : consequence
                    );
                    setSelectedThreat(null);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">Interactive Diagram:</span> Click on any threat or consequence to explore prevention barriers and mitigation strategies.
        </p>
      </div>

      {selectedThreat && threatBarriers && (
        <BarrierChainPanel threatBarrierChain={threatBarriers} />
      )}

      {selectedConsequence && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Consequence: {selectedConsequence.name}</h3>
          <p className="text-gray-700 leading-relaxed">{selectedConsequence.description || 'No additional details available'}</p>
        </div>
      )}
    </div>
  );
}
