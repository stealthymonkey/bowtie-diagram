// Bowtie Diagram Types

export interface Threat {
  id: string;
  label: string;
  description?: string;
  level: number; // Hierarchy level (0 = top level, higher = more detailed)
  parentId?: string; // For hierarchical relationships
  severity?: 'low' | 'medium' | 'high' | 'critical';
  barriers?: Barrier[];
  subThreats?: Threat[]; // Nested threats for detailed views
}

export interface Barrier {
  id: string;
  label: string;
  description?: string;
  type: 'preventive' | 'mitigative';
  effectiveness?: 'low' | 'medium' | 'high';
  threatId?: string; // Links to threat (preventive)
  consequenceId?: string; // Links to consequence (mitigative)
}

export interface TopEvent {
  id: string;
  label: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface Consequence {
  id: string;
  label: string;
  description?: string;
  level: number; // Hierarchy level
  parentId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  barriers?: Barrier[];
  subConsequences?: Consequence[]; // Nested consequences
}

export interface BowtieDiagram {
  id: string;
  name: string;
  topEvent: TopEvent;
  threats: Threat[];
  consequences: Consequence[];
  barriers: Barrier[];
}

// View and Layout Types
export interface ViewLevel {
  level: number;
  name: string;
  description: string;
  showSubElements: boolean;
}

export interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutNode {
  id: string;
  type: 'threat' | 'barrier' | 'topEvent' | 'consequence';
  label: string;
  level: number;
  parentId?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  children?: LayoutNode[];
}

