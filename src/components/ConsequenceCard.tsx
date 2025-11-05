import { Consequence } from '../lib/types';
import { AlertCircle } from 'lucide-react';

interface ConsequenceCardProps {
  consequence: Consequence;
  isSelected: boolean;
  onClick: () => void;
}

export function ConsequenceCard({
  consequence,
  isSelected,
  onClick,
}: ConsequenceCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
        isSelected
          ? 'border-red-600 bg-red-50 shadow-lg'
          : 'border-red-300 bg-white hover:border-red-500 hover:bg-red-50'
      }`}
    >
      <div className="flex gap-3">
        <AlertCircle className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-red-600' : 'text-red-500'}`} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight break-words">{consequence.name}</p>
          {consequence.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{consequence.description}</p>
          )}
        </div>
      </div>
    </button>
  );
}
