import { TopEvent } from '../lib/types';
import { Zap } from 'lucide-react';

interface TopEventNodeProps {
  event: TopEvent;
}

export function TopEventNode({ event }: TopEventNodeProps) {
  return (
    <div className="w-full max-w-xs">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500 to-red-600 rounded-full blur-lg opacity-20"></div>
        <div className="relative bg-gradient-to-b from-orange-500 to-red-600 rounded-full p-8 shadow-lg">
          <Zap className="w-8 h-8 text-white mx-auto mb-3" />
          <div className="text-center">
            <p className="text-white font-bold text-sm leading-tight">{event.name}</p>
            {event.speed_impact && (
              <p className="text-orange-100 text-xs mt-2">@ {event.speed_impact} mph</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
