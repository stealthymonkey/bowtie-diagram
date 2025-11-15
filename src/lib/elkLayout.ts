import ELK from 'elkjs';
import type { BowtieDiagram, Threat, Consequence, Barrier, TopEvent, LayoutNode } from './types';

const elk = new ELK();

export interface LayoutOptions {
  viewLevel: number; // Controls which hierarchy level to show
  spacing: {
    horizontal: number;
    vertical: number;
  };
}

const defaultOptions: LayoutOptions = {
  viewLevel: 0,
  spacing: {
    horizontal: 200,
    vertical: 150,
  },
};

/**
 * Converts bowtie diagram to ELK graph structure
 */
export async function layoutBowtieDiagram(
  diagram: BowtieDiagram,
  options: Partial<LayoutOptions> = {}
): Promise<LayoutNode[]> {
  const opts = { ...defaultOptions, ...options };
  
  // Filter elements based on view level
  const visibleThreats = filterByLevel(diagram.threats, opts.viewLevel);
  const visibleConsequences = filterByLevel(diagram.consequences, opts.viewLevel);
  
  // Build ELK graph structure
  const elkGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.spacing.nodeNode': String(opts.spacing.horizontal),
      'elk.spacing.edgeNode': String(opts.spacing.horizontal * 0.5),
      'elk.layered.spacing.nodeNodeBetweenLayers': String(opts.spacing.vertical),
      'elk.layered.nodePlacement.strategy': 'SIMPLE',
      'elk.spacing.edgeEdge': '20',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
    },
    children: [
      // Left side: Threats
      ...visibleThreats.map(threat => createThreatNode(threat, diagram.barriers)),
      // Center: Top Event
      createTopEventNode(diagram.topEvent),
      // Right side: Consequences
      ...visibleConsequences.map(consequence => createConsequenceNode(consequence, diagram.barriers)),
    ],
    edges: createEdges(diagram, visibleThreats, visibleConsequences),
  };

  try {
    const layoutedGraph = await elk.layout(elkGraph);
    return convertElkToLayoutNodes(layoutedGraph);
  } catch (error) {
    console.error('ELK layout error:', error);
    throw error;
  }
}

function filterByLevel<T extends { level: number; id: string; subThreats?: T[]; subConsequences?: T[] }>(
  items: T[],
  viewLevel: number
): T[] {
  const result: T[] = [];
  
  function collectItems(itemList: T[], currentLevel: number = 0) {
    for (const item of itemList) {
      if (item.level <= viewLevel) {
        result.push(item);
        // Recursively collect sub-items if they're within the view level
        if (item.subThreats && item.level < viewLevel) {
          collectItems(item.subThreats as T[], item.level + 1);
        }
        if (item.subConsequences && item.level < viewLevel) {
          collectItems(item.subConsequences as T[], item.level + 1);
        }
      }
    }
  }
  
  collectItems(items);
  return result;
}

function createThreatNode(threat: Threat, allBarriers: Barrier[]): any {
  const preventiveBarriers = allBarriers.filter(
    b => b.type === 'preventive' && b.threatId === threat.id
  );

  return {
    id: `threat-${threat.id}`,
    labels: [{ text: threat.label }],
    width: 180,
    height: 80,
    properties: {
      type: 'threat',
      level: threat.level,
      severity: threat.severity,
      parentId: threat.parentId,
    },
    children: preventiveBarriers.map(barrier => ({
      id: `barrier-preventive-${barrier.id}`,
      labels: [{ text: barrier.label }],
      width: 160,
      height: 60,
      properties: {
        type: 'barrier',
        barrierType: 'preventive',
      },
    })),
  };
}

function createTopEventNode(topEvent: TopEvent): any {
  return {
    id: `topEvent-${topEvent.id}`,
    labels: [{ text: topEvent.label }],
    width: 200,
    height: 100,
    properties: {
      type: 'topEvent',
    },
  };
}

function createConsequenceNode(consequence: Consequence, allBarriers: Barrier[]): any {
  const mitigativeBarriers = allBarriers.filter(
    b => b.type === 'mitigative' && b.consequenceId === consequence.id
  );

  return {
    id: `consequence-${consequence.id}`,
    labels: [{ text: consequence.label }],
    width: 180,
    height: 80,
    properties: {
      type: 'consequence',
      level: consequence.level,
      severity: consequence.severity,
      parentId: consequence.parentId,
    },
    children: mitigativeBarriers.map(barrier => ({
      id: `barrier-mitigative-${barrier.id}`,
      labels: [{ text: barrier.label }],
      width: 160,
      height: 60,
      properties: {
        type: 'barrier',
        barrierType: 'mitigative',
      },
    })),
  };
}

function createEdges(
  diagram: BowtieDiagram,
  visibleThreats: Threat[],
  visibleConsequences: Consequence[]
): any[] {
  const edges: any[] = [];

  // Edges from threats to top event
  visibleThreats.forEach(threat => {
    edges.push({
      id: `edge-threat-${threat.id}-topEvent`,
      sources: [`threat-${threat.id}`],
      targets: [`topEvent-${diagram.topEvent.id}`],
    });

    // Edges from preventive barriers to top event
    const preventiveBarriers = diagram.barriers.filter(
      b => b.type === 'preventive' && b.threatId === threat.id
    );
    preventiveBarriers.forEach(barrier => {
      edges.push({
        id: `edge-barrier-${barrier.id}-topEvent`,
        sources: [`barrier-preventive-${barrier.id}`],
        targets: [`topEvent-${diagram.topEvent.id}`],
      });
    });
  });

  // Edges from top event to consequences
  visibleConsequences.forEach(consequence => {
    edges.push({
      id: `edge-topEvent-consequence-${consequence.id}`,
      sources: [`topEvent-${diagram.topEvent.id}`],
      targets: [`consequence-${consequence.id}`],
    });

    // Edges from top event to mitigative barriers
    const mitigativeBarriers = diagram.barriers.filter(
      b => b.type === 'mitigative' && b.consequenceId === consequence.id
    );
    mitigativeBarriers.forEach(barrier => {
      edges.push({
        id: `edge-topEvent-barrier-${barrier.id}`,
        sources: [`topEvent-${diagram.topEvent.id}`],
        targets: [`barrier-mitigative-${barrier.id}`],
      });
      edges.push({
        id: `edge-barrier-${barrier.id}-consequence-${consequence.id}`,
        sources: [`barrier-mitigative-${barrier.id}`],
        targets: [`consequence-${consequence.id}`],
      });
    });
  });

  return edges;
}

function convertElkToLayoutNodes(elkGraph: any): LayoutNode[] {
  const nodes: LayoutNode[] = [];

  function traverse(node: any) {
    if (node.properties?.type) {
      nodes.push({
        id: node.id,
        type: node.properties.type as any,
        label: node.labels?.[0]?.text || '',
        level: node.properties.level || 0,
        parentId: node.properties.parentId,
        x: node.x || 0,
        y: node.y || 0,
        width: node.width || 100,
        height: node.height || 50,
      });
    }

    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  if (elkGraph.children) {
    elkGraph.children.forEach(traverse);
  }

  return nodes;
}

