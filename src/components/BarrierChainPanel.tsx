import { ThreatBarrierChain } from '../lib/types';
import { Shield } from 'lucide-react';

interface BarrierChainPanelProps {
  threatBarrierChain: ThreatBarrierChain;
}

export function BarrierChainPanel({ threatBarrierChain }: BarrierChainPanelProps) {
  const { threat, barriers } = threatBarrierChain;

  if (!barriers || barriers.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">
          No prevention barriers defined for this threat yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-cyan-50 border border-blue-300 rounded-xl p-6 shadow-sm">
      <div className="space-y-6">
        <div className="pb-4 border-b border-blue-200">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
            <Shield className="w-6 h-6 text-blue-600" />
            Prevention Barriers
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            For threat: <span className="font-semibold text-blue-900">{threat.name}</span>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Protection measures to prevent this threat from reaching the central event
          </p>
        </div>

        <div className="space-y-4">
          {barriers.map((barrier, index) => (
            <div key={barrier.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md text-sm flex-shrink-0 border-2 border-white"
                  style={{
                    backgroundColor: barrier.barrier_type?.display_color || '#6B7280',
                  }}
                >
                  {index + 1}
                </div>
                {index < barriers.length - 1 && (
                  <div
                    className="w-0.5 h-12 my-2"
                    style={{
                      backgroundColor: barrier.barrier_type?.display_color || '#6B7280',
                      opacity: 0.3,
                    }}
                  ></div>
                )}
              </div>
              <div className="flex-1 pt-1">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-semibold text-gray-900">{barrier.name}</p>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {barrier.description || 'No description available'}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
                      style={{
                        backgroundColor: barrier.barrier_type?.display_color || '#6B7280',
                      }}
                    >
                      {barrier.barrier_type?.type_name || 'Unknown'}
                    </span>

                    {barrier.responsibility_role && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 shadow-sm">
                        {barrier.responsibility_role}
                      </span>
                    )}

                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow-sm capitalize">
                      {barrier.effectiveness_level}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {barriers.length > 1 && (
          <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-blue-900">Multiple Layers:</span> This threat has <span className="font-semibold">{barriers.length}</span> layers of protection working in sequence. Multiple barriers significantly strengthen the defense against this threat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
