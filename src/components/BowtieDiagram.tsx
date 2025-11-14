import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Edge,
  type Node,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { BowtieDiagram, LayoutNode, Threat, Consequence } from '../lib/types';
import { layoutBowtieDiagram } from '../lib/elkLayout';
import { ThreatNode } from './ThreatNode';
import { ConsequenceNode } from './ConsequenceNode';
import { BarrierNode } from './BarrierNode';
import { TopEventNode } from './TopEventNode';

interface BowtieDiagramProps {
  diagram: BowtieDiagram;
  viewLevel: number;
  onViewLevelChange?: (level: number) => void;
}

type ThreatMap = Record<string, Threat>;
type ConsequenceMap = Record<string, Consequence>;

const nodeTypes: NodeTypes = {
  threat: ThreatNode,
  consequence: ConsequenceNode,
  barrier: BarrierNode,
  topEvent: TopEventNode,
};

export function BowtieDiagramComponent({
  diagram,
  viewLevel,
  onViewLevelChange,
}: BowtieDiagramProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const maxLevel = useMemo(() => {
    const threatLevels = collectLevels(diagram.threats);
    const consequenceLevels = collectLevels(diagram.consequences);
    return Math.max(threatLevels, consequenceLevels, 0);
  }, [diagram]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    layoutBowtieDiagram(diagram, { viewLevel })
      .then((layoutNodes) => {
        if (cancelled) {
          return;
        }
        const { nodes: rfNodes, edges: rfEdges } = createReactFlowGraph(layoutNodes, diagram);
        setNodes(rfNodes);
        setEdges(rfEdges);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to layout bowtie diagram', err);
        if (!cancelled) {
          setError('Unable to render bowtie diagram.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [diagram, viewLevel]);

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.message}>{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.message}>Loading bowtie diagram…</div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      {typeof onViewLevelChange === 'function' && (
        <div style={styles.toolbar}>
          <span>View Level</span>
          <button
            type="button"
            style={styles.button}
            onClick={() => onViewLevelChange(Math.max(0, viewLevel - 1))}
            disabled={viewLevel <= 0}
          >
            –
          </button>
          <span style={styles.levelValue}>{viewLevel}</span>
          <button
            type="button"
            style={styles.button}
            onClick={() => onViewLevelChange(Math.min(maxLevel, viewLevel + 1))}
            disabled={viewLevel >= maxLevel}
          >
            +
          </button>
        </div>
      )}
      <div style={styles.canvas}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={1.4}
          nodesDraggable={false}
          edgesFocusable={false}
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}

function createReactFlowGraph(layoutNodes: LayoutNode[], diagram: BowtieDiagram) {
  const threatMap = buildThreatMap(diagram.threats);
  const consequenceMap = buildConsequenceMap(diagram.consequences);
  const barrierMap = new Map(diagram.barriers.map((barrier) => [barrier.id, barrier]));

  const nodes = layoutNodes.map((layoutNode) => {
    const baseNode: Node = {
      id: layoutNode.id,
      type: layoutNode.type,
      position: {
        x: layoutNode.x ?? 0,
        y: layoutNode.y ?? 0,
      },
      data: { label: layoutNode.label, level: layoutNode.level },
      draggable: false,
    };

    if (layoutNode.type === 'threat') {
      const threatId = layoutNode.id.replace('threat-', '');
      const threat = threatMap[threatId];
      baseNode.data = {
        label: threat?.label ?? layoutNode.label,
        severity: threat?.severity,
        level: threat?.level ?? layoutNode.level,
      };
    }

    if (layoutNode.type === 'consequence') {
      const consequenceId = layoutNode.id.replace('consequence-', '');
      const consequence = consequenceMap[consequenceId];
      baseNode.data = {
        label: consequence?.label ?? layoutNode.label,
        severity: consequence?.severity,
        level: consequence?.level ?? layoutNode.level,
      };
    }

    if (layoutNode.type === 'barrier') {
      const barrierId = extractBarrierId(layoutNode.id);
      const barrier = barrierId ? barrierMap.get(barrierId) : undefined;
      baseNode.data = {
        label: barrier?.label ?? layoutNode.label,
        barrierType: barrier?.type ?? 'preventive',
      };
    }

    if (layoutNode.type === 'topEvent') {
      baseNode.data = {
        label: diagram.topEvent.label,
      };
    }

    return baseNode;
  });

  const edges = buildEdges(layoutNodes, diagram, barrierMap);

  return { nodes, edges };
}

function buildEdges(
  layoutNodes: LayoutNode[],
  diagram: BowtieDiagram,
  barrierMap: Map<string, BowtieDiagram['barriers'][number]>,
) {
  const nodeIds = new Set(layoutNodes.map((node) => node.id));
  const edges: Edge[] = [];
  const topEventNodeId = `topEvent-${diagram.topEvent.id}`;

  const addEdge = (edge: Edge) => {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      edges.push(edge);
    }
  };

  layoutNodes.forEach((layoutNode) => {
    if (layoutNode.type === 'threat') {
      addEdge({
        id: `edge-${layoutNode.id}-topEvent`,
        source: layoutNode.id,
        target: topEventNodeId,
        type: 'smoothstep',
      });
    }

    if (layoutNode.type === 'consequence') {
      addEdge({
        id: `edge-topEvent-${layoutNode.id}`,
        source: topEventNodeId,
        target: layoutNode.id,
        type: 'smoothstep',
      });
    }

    if (layoutNode.type === 'barrier') {
      const barrierId = extractBarrierId(layoutNode.id);
      if (!barrierId) {
        return;
      }
      const barrier = barrierMap.get(barrierId);
      if (!barrier) {
        return;
      }

      if (barrier.type === 'preventive' && barrier.threatId) {
        addEdge({
          id: `edge-threat-${barrier.threatId}-barrier-${barrier.id}`,
          source: `threat-${barrier.threatId}`,
          target: layoutNode.id,
          type: 'smoothstep',
        });
        addEdge({
          id: `edge-barrier-${barrier.id}-topEvent`,
          source: layoutNode.id,
          target: topEventNodeId,
          type: 'smoothstep',
        });
      }

      if (barrier.type === 'mitigative' && barrier.consequenceId) {
        addEdge({
          id: `edge-topEvent-barrier-${barrier.id}`,
          source: topEventNodeId,
          target: layoutNode.id,
          type: 'smoothstep',
        });
        addEdge({
          id: `edge-barrier-${barrier.id}-consequence-${barrier.consequenceId}`,
          source: layoutNode.id,
          target: `consequence-${barrier.consequenceId}`,
          type: 'smoothstep',
        });
      }
    }
  });

  return edges;
}

function createReactFlowNodeMap<T extends Threat | Consequence>(
  items: T[],
  childKey: 'subThreats' | 'subConsequences',
) {
  const map: Record<string, T> = {};

  const traverse = (list?: T[]) => {
    if (!list) {
      return;
    }
    list.forEach((item) => {
      map[item.id] = item;
      traverse(item[childKey] as T[] | undefined);
    });
  };

  traverse(items);
  return map;
}

function buildThreatMap(threats: Threat[]): ThreatMap {
  return createReactFlowNodeMap(threats, 'subThreats');
}

function buildConsequenceMap(consequences: Consequence[]): ConsequenceMap {
  return createReactFlowNodeMap(consequences, 'subConsequences');
}

function extractBarrierId(layoutNodeId: string) {
  const segments = layoutNodeId.split('-');
  return segments.length >= 3 ? segments.slice(2).join('-') : null;
}

function collectLevels(items: { level: number; subThreats?: any[]; subConsequences?: any[] }[]): number {
  let max = 0;

  const traverse = (list?: typeof items) => {
    if (!list) {
      return;
    }
    list.forEach((item) => {
      max = Math.max(max, item.level ?? 0);
      if ('subThreats' in item && item.subThreats) {
        traverse(item.subThreats as any);
      }
      if ('subConsequences' in item && item.subConsequences) {
        traverse(item.subConsequences as any);
      }
    });
  };

  traverse(items as any);
  return max;
}

const styles: Record<string, CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    background: '#f1f5f9',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '14px',
  },
  button: {
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    border: '1px solid #94a3b8',
    background: 'white',
    cursor: 'pointer',
  },
  levelValue: {
    minWidth: '1.5rem',
    textAlign: 'center',
    fontWeight: 600,
  },
  canvas: {
    flex: 1,
    width: '100%',
    background: '#f8fafc',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  message: {
    padding: '1rem 1.5rem',
    borderRadius: '0.75rem',
    background: '#e2e8f0',
    color: '#475569',
    fontWeight: 500,
  },
};
