import { Threat } from '../lib/types';
import { AlertTriangle } from 'lucide-react';

interface ThreatCardProps {
  threat: Threat;
  isSelected: boolean;
  onClick: () => void;
}

export function ThreatCard({ threat, isSelected, onClick }: ThreatCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
        isSelected
          ? 'border-blue-600 bg-blue-50 shadow-lg'
          : 'border-blue-300 bg-white hover:border-blue-500 hover:bg-blue-50'
      }`}
    >
      <div className="flex gap-3">
        <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-blue-500'}`} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight break-words">{threat.name}</p>
          {threat.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{threat.description}</p>
          )}
        </div>
      </div>
    </button>
  );
}
