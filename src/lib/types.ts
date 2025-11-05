export interface BarrierType {
  id: string;
  type_name: string;
  color_code: string;
  display_color: string;
  icon: string;
  description: string;
}

export interface Hazard {
  id: string;
  name: string;
  description: string | null;
  category: string;
  severity_level: string;
  icon: string | null;
  parent_hazard_id: string | null;
  drill_down_level: number;
}

export interface BowTieDiagram {
  id: string;
  hazard_id: string;
  name: string;
  description: string | null;
}

export interface TopEvent {
  id: string;
  bowtie_id: string;
  name: string;
  description: string | null;
  severity_level: string;
  speed_impact: number | null;
}

export interface Threat {
  id: string;
  bowtie_id: string;
  name: string;
  description: string | null;
  threat_type: string | null;
  threat_order: number;
}

export interface Consequence {
  id: string;
  bowtie_id: string;
  name: string;
  description: string | null;
  severity_level: string;
  consequence_order: number;
}

export interface PreventionBarrier {
  id: string;
  bowtie_id: string;
  name: string;
  description: string | null;
  barrier_type_id: string;
  barrier_type?: BarrierType;
  responsibility_role: string | null;
  effectiveness_level: string;
  barrier_order: number;
}

export interface BarrierConnection {
  id: string;
  bowtie_id: string;
  barrier_id: string;
  threat_id: string | null;
  consequence_id: string | null;
  chain_position: number;
  sequence_order: number;
}

export interface Connection {
  id: string;
  bowtie_id: string;
  threat_id: string | null;
  top_event_id: string;
  consequence_id: string | null;
  connection_type: string;
}

export interface HazardDetail {
  hazard: Hazard;
  bowtie: BowTieDiagram;
  top_event: TopEvent;
  threats: Threat[];
  consequences: Consequence[];
  barriers: PreventionBarrier[];
  barrier_connections: BarrierConnection[];
  connections: Connection[];
}

export interface ThreatBarrierChain {
  threat: Threat;
  barriers: (PreventionBarrier & { barrier_type: BarrierType })[];
}

export interface ConsequenceDetail {
  consequence: Consequence;
  description: string | null;
}
