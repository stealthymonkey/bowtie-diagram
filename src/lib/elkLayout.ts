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
    vertical: 100,
  },
};

const DEFAULT_PARENT_NODE_WIDTH = 180;
const DEFAULT_PARENT_NODE_HEIGHT = 80;
const DEFAULT_BARRIER_NODE_WIDTH = 240;
const DEFAULT_BARRIER_NODE_HEIGHT = 120;
const BARRIER_HORIZONTAL_GAP = 80;
const BARRIER_VERTICAL_GAP = 32;
const PRIMARY_NODE_VERTICAL_GAP = 48;

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
      'elk.spacing.nodeNode': String(opts.spacing.vertical),
      'elk.spacing.edgeNode': String(opts.spacing.horizontal * 0.5),
      'elk.layered.spacing.nodeNodeBetweenLayers': String(opts.spacing.horizontal),
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
    const nodes = convertElkToLayoutNodes(layoutedGraph);
    const compacted = compactPrimaryNodes(nodes);
    return distributeBarriers(compacted);
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
    children: preventiveBarriers.map((barrier, index) => ({
      id: `barrier-preventive-${barrier.id}`,
      labels: [{ text: barrier.label }],
      width: 160,
      height: 60,
      properties: {
        type: 'barrier',
        barrierType: 'preventive',
        parentId: threat.id,
        sequenceIndex: index,
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
    children: mitigativeBarriers.map((barrier, index) => ({
      id: `barrier-mitigative-${barrier.id}`,
      labels: [{ text: barrier.label }],
      width: 160,
      height: 60,
      properties: {
        type: 'barrier',
        barrierType: 'mitigative',
        parentId: consequence.id,
        sequenceIndex: index,
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

  function traverse(node: any, offsetX = 0, offsetY = 0) {
    const absoluteX = (node.x ?? 0) + offsetX;
    const absoluteY = (node.y ?? 0) + offsetY;

    if (node.properties?.type) {
      nodes.push({
        id: node.id,
        type: node.properties.type as any,
        label: node.labels?.[0]?.text || '',
        level: node.properties.level || 0,
        parentId: node.properties.parentId,
        sequenceIndex: node.properties.sequenceIndex,
        x: absoluteX,
        y: absoluteY,
        width: node.width || 100,
        height: node.height || 50,
      });
    }

    if (node.children) {
      node.children.forEach((child: any) => traverse(child, absoluteX, absoluteY));
    }
  }

  if (elkGraph.children) {
    elkGraph.children.forEach((child: any) => traverse(child, 0, 0));
  }

  return nodes;
}

function compactPrimaryNodes(nodes: LayoutNode[]): LayoutNode[] {
  const topEvent = nodes.find((node) => node.type === 'topEvent');
  const topEventHeight = topEvent?.height ?? DEFAULT_PARENT_NODE_HEIGHT;
  const topEventCenterY = topEvent ? (topEvent.y ?? 0) + topEventHeight / 2 : null;

  const alignColumn = (type: LayoutNode['type']) => {
    const column = nodes.filter(
      (node) => node.type === type && !node.parentId,
    );
    if (column.length <= 1) {
      return;
    }

    const gap = PRIMARY_NODE_VERTICAL_GAP;
    const totalHeight =
      column.reduce(
        (sum, node) => sum + (node.height ?? DEFAULT_PARENT_NODE_HEIGHT),
        0,
      ) +
      gap * (column.length - 1);
    const anchor =
      topEventCenterY ??
      column.reduce((sum, node) => sum + (node.y ?? 0), 0) / column.length;
    let currentY = anchor - totalHeight / 2;

    column
      .sort((a, b) => (a.y ?? 0) - (b.y ?? 0))
      .forEach((node) => {
        node.y = currentY;
        currentY += (node.height ?? DEFAULT_PARENT_NODE_HEIGHT) + gap;
      });
  };

  alignColumn('threat');
  alignColumn('consequence');
  return nodes;
}

function distributeBarriers(nodes: LayoutNode[]): LayoutNode[] {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  interface BarrierGroup {
    parentId: string;
    side: 'left' | 'right';
    nodes: LayoutNode[];
  }

  const groups = new Map<string, BarrierGroup>();

  nodes.forEach((node) => {
    if (node.type !== 'barrier' || !node.parentId) return;
    const isPreventive = node.id.startsWith('barrier-preventive');
    const parentKey = `${isPreventive ? 'threat' : 'consequence'}-${node.parentId}`;
    if (!nodeMap.has(parentKey)) return;
    const side = isPreventive ? 'left' : 'right';
    const groupKey = `${parentKey}|${side}`;
    if (!groups.has(groupKey)) {
      groups.set(groupKey, { parentId: parentKey, side, nodes: [] });
    }
    groups.get(groupKey)!.nodes.push(node);
  });

  groups.forEach((group) => {
    const parent = nodeMap.get(group.parentId);
    if (!parent) return;
    const parentHeight = parent.height ?? DEFAULT_PARENT_NODE_HEIGHT;
    const parentWidth = parent.width ?? DEFAULT_PARENT_NODE_WIDTH;
    const parentCenterY = (parent.y ?? 0) + parentHeight / 2;

    const sorted = group.nodes.sort((a, b) => {
      const seqA = a.sequenceIndex;
      const seqB = b.sequenceIndex;
      if (seqA != null && seqB != null) {
        return seqA - seqB;
      }
      if (seqA != null) return -1;
      if (seqB != null) return 1;
      return (a.y ?? 0) - (b.y ?? 0);
    });
    const totalHeight = sorted.reduce((acc, barrier, index) => {
      const height = barrier.height ?? DEFAULT_BARRIER_NODE_HEIGHT;
      return acc + height + (index > 0 ? BARRIER_VERTICAL_GAP : 0);
    }, 0);

    let currentY = parentCenterY - totalHeight / 2;
    sorted.forEach((barrier) => {
      const barrierHeight = barrier.height ?? DEFAULT_BARRIER_NODE_HEIGHT;
      const barrierWidth = barrier.width ?? DEFAULT_BARRIER_NODE_WIDTH;
      barrier.y = currentY;
      currentY += barrierHeight + BARRIER_VERTICAL_GAP;

      if (group.side === 'left') {
        barrier.x = (parent.x ?? 0) - BARRIER_HORIZONTAL_GAP - barrierWidth;
      } else {
        barrier.x = (parent.x ?? 0) + parentWidth + BARRIER_HORIZONTAL_GAP;
      }
    });
  });

  return nodes;
}

