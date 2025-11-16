import type { Barrier } from './types';

type BarrierMechanism = Barrier['mechanism'];

export const barrierMechanismMeta: Record<
  BarrierMechanism,
  { label: string; color: string }
> = {
  activeHuman: { label: 'Active human', color: '#dc2626' },
  activeHardware: { label: 'Active hardware', color: '#0ea5e9' },
  passiveHardware: { label: 'Passive hardware', color: '#10b981' },
  hybrid: { label: 'Active human + hardware', color: '#a16207' },
};

export function describeBarrierMechanism(mechanism?: BarrierMechanism) {
  if (!mechanism) return null;
  return barrierMechanismMeta[mechanism] ?? null;
}

export function describeBarrierType(type: Barrier['type']) {
  return type === 'mitigative' ? 'Mitigative barrier' : 'Preventive barrier';
}
