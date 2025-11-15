import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  applyNodeChanges,
  type Edge,
  type Node,
  type NodeTypes,
  type ReactFlowInstance,
  type NodeChange,
} from '@xyflow/react';
import reactFlowStyles from '@xyflow/react/dist/style.css';
import bowtieStyles from './BowtieDiagram.css';
import type {
  BowtieDiagram,
  LayoutNode,
  Threat,
  Consequence,
  Barrier,
  Hazard,
} from '../lib/types';
import { layoutBowtieDiagram } from '../lib/elkLayout';
import { ThreatNode } from './ThreatNode';
import { ConsequenceNode } from './ConsequenceNode';
import { BarrierNode } from './BarrierNode';
import { TopEventNode } from './TopEventNode';
import { HazardNode } from './HazardNode';
import { BowtieEdge } from './BowtieEdge';

type Severity = 'low' | 'medium' | 'high' | 'critical';
type SeverityFilter = 'all' | Severity;

interface BowtieDiagramProps {
  diagram: BowtieDiagram;
  viewLevel: number;
  onViewLevelChange?: (level: number) => void;
}

interface FilterState {
  text: string;
  severity: SeverityFilter;
  selectedNodeId: string | null;
}

interface RolePreset {
  id: string;
  label: string;
  description: string;
  viewLevel?: number;
  severity?: SeverityFilter;
  search?: string;
}

const ROLE_PRESETS: RolePreset[] = [
  {
    id: 'overview',
    label: 'Executive Overview',
    description: 'High-level threats, consequences, and critical severity.',
    viewLevel: 0,
    severity: 'high',
  },
  {
    id: 'safety',
    label: 'Safety Officer',
    description: 'Full detail for proactive hazard management.',
    viewLevel: 2,
    severity: 'all',
  },
  {
    id: 'operations',
    label: 'Operations',
    description: 'Focus on barriers and mitigations in play.',
    viewLevel: 1,
    severity: 'medium',
    search: 'barrier',
  },
  {
    id: 'compliance',
    label: 'Compliance / Audit',
    description: 'Highlight controls tied to inspections and procedures.',
    viewLevel: 2,
    severity: 'medium',
    search: 'inspection',
  },
];

const CUSTOM_PRESET: RolePreset = {
  id: 'custom',
  label: 'Custom view',
  description: 'Use the controls to tailor the diagram to your role.',
};

type ThreatMap = Record<string, Threat>;
type ConsequenceMap = Record<string, Consequence>;

const severityScale: Record<Severity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

const nodeTypes: NodeTypes = {
  threat: ThreatNode,
  consequence: ConsequenceNode,
  barrier: BarrierNode,
  topEvent: TopEventNode,
  hazard: HazardNode,
};

const edgeTypes = {
  bowtie: BowtieEdge,
};

const EDGE_STYLE: CSSProperties = {
  stroke: '#0f172a',
  strokeWidth: 2,
};

const EDGE_MARKER = {
  type: MarkerType.ArrowClosed,
  color: '#0f172a',
  width: 18,
  height: 18,
};

const DEFAULT_EDGE_OPTIONS = {
  type: 'bowtie' as const,
  style: EDGE_STYLE,
  markerEnd: EDGE_MARKER,
};

export function BowtieDiagramComponent({
  diagram,
  viewLevel,
  onViewLevelChange,
}: BowtieDiagramProps) {
  const [rawNodes, setRawNodes] = useState<Node[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [activePreset, setActivePreset] = useState<string>('overview');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const threatMap = useMemo(() => buildThreatMap(diagram.threats), [diagram]);
  const consequenceMap = useMemo(
    () => buildConsequenceMap(diagram.consequences),
    [diagram],
  );
  const barrierMap = useMemo(
    () => new Map(diagram.barriers.map((barrier) => [barrier.id, barrier])),
    [diagram],
  );

  const maxLevel = useMemo(() => {
    const threatLevels = collectLevels(diagram.threats);
    const consequenceLevels = collectLevels(diagram.consequences);
    return Math.max(threatLevels, consequenceLevels, 0);
  }, [diagram]);

  const filters = useMemo<FilterState>(
    () => ({
      text: filterText,
      severity: severityFilter,
      selectedNodeId,
    }),
    [filterText, severityFilter, selectedNodeId],
  );

  useEffect(() => {
    ensureStyleSheet('reactflow-core', reactFlowStyles);
    ensureStyleSheet('bowtie-shell', bowtieStyles);
  }, []);

  useEffect(() => {
    if (!selectedNodeId) return;
    const exists = rawNodes.some((node) => node.id === selectedNodeId);
    if (!exists) {
      setSelectedNodeId(null);
    }
  }, [rawNodes, selectedNodeId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    layoutBowtieDiagram(diagram, { viewLevel })
      .then((layoutedNodes) => {
        if (cancelled) return;
        const { nodes: rfNodes, edges: rfEdges } = createReactFlowGraph(
          layoutedNodes,
          diagram,
          threatMap,
          consequenceMap,
          barrierMap,
        );
        setRawNodes(rfNodes);
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
  }, [diagram, viewLevel, threatMap, consequenceMap, barrierMap]);

  useEffect(() => {
    if (!rawNodes.length) return;
    setNodes(applyPresentation(rawNodes, filters));
  }, [rawNodes, filters]);

  const handlePresetChange = (presetId: string) => {
    setActivePreset(presetId);
    const preset = ROLE_PRESETS.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }

    if (typeof preset.viewLevel === 'number') {
      onViewLevelChange?.(Math.min(maxLevel, preset.viewLevel));
    }
    setSeverityFilter(preset.severity ?? 'all');
    setFilterText(preset.search ?? '');
    setSelectedNodeId(null);
  };

  const handleViewLevelChange = (level: number) => {
    setActivePreset('custom');
    onViewLevelChange?.(level);
  };

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (!reactFlowInstance) return;
    if (direction === 'reset') {
      reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
      return;
    }
    const delta = direction === 'in' ? 0.2 : -0.2;
    reactFlowInstance.zoomTo(reactFlowInstance.getZoom() + delta, { duration: 200 });
  };

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setRawNodes((nds) => applyNodeChanges(changes, nds));
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [],
  );

  if (error) {
    return (
      <div style={fallbackStyles.container}>
        <div style={fallbackStyles.message}>{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={fallbackStyles.container}>
        <div style={fallbackStyles.message}>Loading bowtie diagram…</div>
      </div>
    );
  }

  const preset =
    ROLE_PRESETS.find((item) => item.id === activePreset) ?? CUSTOM_PRESET;
  const selectedDetails = getNodeDetails(
    selectedNodeId,
    diagram,
    threatMap,
    consequenceMap,
    barrierMap,
  );
  const hazardLabel = diagram.hazard?.label ?? diagram.name;
  const hazardDescription = diagram.hazard?.description;

  return (
    <div className="bowtie-shell">
      <header className="bowtie-toolbar">
        <div className="bowtie-toolbar__group">
          <label htmlFor="role-preset">Role preset</label>
          <select
            id="role-preset"
            className="bowtie-select"
            value={activePreset}
            onChange={(event) => handlePresetChange(event.target.value)}
          >
            {ROLE_PRESETS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
            <option value="custom">Custom view</option>
          </select>
          <span className="bowtie-toolbar__hint">{preset.description}</span>
        </div>

        <div className="bowtie-toolbar__group">
          <label htmlFor="view-level">Detail level (0 - {maxLevel})</label>
          <input
            id="view-level"
            className="bowtie-range"
            type="range"
            min={0}
            max={maxLevel}
            step={1}
            value={viewLevel}
            onChange={(event) => handleViewLevelChange(Number(event.target.value))}
          />
          <span className="bowtie-toolbar__hint">Current level: {viewLevel}</span>
        </div>

        <div className="bowtie-toolbar__group bowtie-search-group">
          <label htmlFor="search-bowtie">Search</label>
          <input
            id="search-bowtie"
            className="bowtie-input"
            type="text"
            placeholder="Threats, barriers, owners…"
            value={filterText}
            onChange={(event) => {
              setFilterText(event.target.value);
              setActivePreset('custom');
            }}
          />
        </div>

        <div className="bowtie-toolbar__group">
          <label htmlFor="severity-filter">Severity focus</label>
          <select
            id="severity-filter"
            className="bowtie-select"
            value={severityFilter}
            onChange={(event) => {
              setSeverityFilter(event.target.value as SeverityFilter);
              setActivePreset('custom');
            }}
          >
            <option value="all">All severities</option>
            <option value="medium">Medium +</option>
            <option value="high">High +</option>
            <option value="critical">Critical only</option>
            <option value="low">Low only</option>
          </select>
        </div>

        <div className="bowtie-toolbar__group bowtie-toolbar__group--row">
          <label>Zoom</label>
          <div className="bowtie-toolbar__controls">
            <button
              type="button"
              className="bowtie-button"
              onClick={() => handleZoom('out')}
            >
              –
            </button>
            <button
              type="button"
              className="bowtie-button"
              onClick={() => handleZoom('in')}
            >
              +
            </button>
            <button
              type="button"
              className="bowtie-button"
              onClick={() => handleZoom('reset')}
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <section className="bowtie-body">
        <div className="bowtie-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
          fitView
          minZoom={0.25}
          maxZoom={1.5}
          edgesFocusable={false}
          panOnDrag
          zoomOnScroll
          nodesDraggable
          onNodesChange={handleNodesChange}
          onInit={(instance) => setReactFlowInstance(instance)}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onPaneClick={() => setSelectedNodeId(null)}
        >
            <Background />
            <Controls showInteractive={false} position="bottom-right" />
          </ReactFlow>

          <div className="bowtie-legend">
            <div className="bowtie-legend__item">
              <span
                className="bowtie-legend__swatch"
                style={{ background: '#1d4ed8' }}
              />
              Threats (left)
            </div>
            <div className="bowtie-legend__item">
              <span
                className="bowtie-legend__swatch"
                style={{ background: '#f97316' }}
              />
              Top event
            </div>
            <div className="bowtie-legend__item">
              <span
                className="bowtie-legend__swatch"
                style={{ background: '#0f766e' }}
              />
              Preventive barriers
            </div>
            <div className="bowtie-legend__item">
              <span
                className="bowtie-legend__swatch"
                style={{ background: '#1d4ed8', opacity: 0.6 }}
              />
              Mitigative barriers
            </div>
            <div className="bowtie-legend__item">
              <span
                className="bowtie-legend__swatch"
                style={{ background: '#be123c' }}
              />
              Consequences (right)
            </div>
          </div>
        </div>

        <aside className="bowtie-inspector">
          {selectedDetails ? (
            <>
              <div className="bowtie-inspector__header">
                <div>
                  <p className="bowtie-inspector__title">{selectedDetails.label}</p>
                  <div>
                    <span className={`bowtie-pill bowtie-pill--${selectedDetails.kind}`}>
                      {selectedDetails.kind}
                    </span>
                    {selectedDetails.severity && (
                      <span className="bowtie-pill" style={severityPillStyle(selectedDetails.severity)}>
                        {selectedDetails.severity}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="bowtie-button"
                  onClick={() => setSelectedNodeId(null)}
                >
                  Clear
                </button>
              </div>

              <div className="bowtie-inspector__meta">
                {selectedDetails.description && <p>{selectedDetails.description}</p>}
                {typeof selectedDetails.level === 'number' && (
                  <p>Hierarchy level: {selectedDetails.level}</p>
                )}
                {selectedDetails.barrierType && (
                  <p>Barrier type: {selectedDetails.barrierType}</p>
                )}
                {selectedDetails.effectiveness && (
                  <p>Effectiveness: {selectedDetails.effectiveness}</p>
                )}
                {selectedDetails.related && (
                  <p>Linked to: {selectedDetails.related}</p>
                )}
              </div>

              {selectedDetails.tags?.length ? (
                <div className="bowtie-inspector__section">
                  <h4>Context</h4>
                  <div className="bowtie-tag-cloud">
                    {selectedDetails.tags.map((tag) => (
                      <span key={tag} className="bowtie-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="bowtie-empty">
              <p>
                Select any threat, consequence, or barrier to learn about ownership,
                severity, and supporting context.
              </p>
              <div className="bowtie-panel-divider" />
              <p>
                Hazard in focus: <strong>{hazardLabel}</strong>
              </p>
              {hazardDescription && <p>{hazardDescription}</p>}
              <p>
                Top event: <strong>{diagram.topEvent.label}</strong>
              </p>
              {diagram.topEvent.description && <p>{diagram.topEvent.description}</p>}
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

function createReactFlowGraph(
  layoutNodes: LayoutNode[],
  diagram: BowtieDiagram,
  threatMap: ThreatMap,
  consequenceMap: ConsequenceMap,
  barrierMap: Map<string, Barrier>,
) {
  const nodes = layoutNodes.map((layoutNode) => {
    const base: Node = {
      id: layoutNode.id,
      type: layoutNode.type,
      position: {
        x: layoutNode.x ?? 0,
        y: layoutNode.y ?? 0,
      },
      sourcePosition: getSourcePosition(layoutNode.type),
      targetPosition: getTargetPosition(layoutNode.type),
      data: {
        label: layoutNode.label,
        level: layoutNode.level,
        description: '',
      },
      draggable: false,
    };

    if (layoutNode.type === 'threat') {
      const threatId = layoutNode.id.replace('threat-', '');
      const threat = threatMap[threatId];
      base.data = {
        ...base.data,
        label: threat?.label ?? layoutNode.label,
        severity: threat?.severity,
        level: threat?.level ?? layoutNode.level,
        description: threat?.description,
        hasChildren: Boolean(threat?.subThreats?.length),
      };
    }

    if (layoutNode.type === 'consequence') {
      const consequenceId = layoutNode.id.replace('consequence-', '');
      const consequence = consequenceMap[consequenceId];
      base.data = {
        ...base.data,
        label: consequence?.label ?? layoutNode.label,
        severity: consequence?.severity,
        level: consequence?.level ?? layoutNode.level,
        description: consequence?.description,
        hasChildren: Boolean(consequence?.subConsequences?.length),
      };
    }

    if (layoutNode.type === 'barrier') {
      const barrierId = extractBarrierId(layoutNode.id);
      const barrier = barrierId ? barrierMap.get(barrierId) : undefined;
      base.sourcePosition = 'right';
      base.targetPosition = 'left';
      base.data = {
        ...base.data,
        label: barrier?.label ?? layoutNode.label,
        barrierType: barrier?.type ?? 'preventive',
        effectiveness: barrier?.effectiveness,
        description: barrier?.description,
        relatedThreatId: barrier?.threatId,
        relatedConsequenceId: barrier?.consequenceId,
      };
    }

    if (layoutNode.type === 'topEvent') {
      base.data = {
        ...base.data,
        label: diagram.topEvent.label,
        description: diagram.topEvent.description,
        severity: diagram.topEvent.severity,
      };
    }

    return base;
  });

  const edges = buildEdges(layoutNodes, diagram, barrierMap);

  if (diagram.hazard) {
    const hazard = createHazardReactFlowNode(
      diagram.hazard,
      diagram.topEvent.id,
      nodes,
    );
    if (hazard) {
      nodes.push(hazard.node);
      edges.push(hazard.edge);
    }
  }

  return { nodes, edges };
}

function applyPresentation(nodes: Node[], filters: FilterState): Node[] {
  const normalizedText = filters.text.trim().toLowerCase();
  const severityActive = filters.severity !== 'all';
  const filterActive = Boolean(normalizedText) || severityActive;

  return nodes.map((node) => {
    const labelContent = `${node.data?.label ?? ''} ${node.data?.description ?? ''}`.toLowerCase();
    const matchesText = normalizedText ? labelContent.includes(normalizedText) : false;
    const severityValue =
      node.data && node.data.severity
        ? severityScale[node.data.severity as Severity]
        : null;

    let matchesSeverity = false;
    if (severityActive && severityValue !== null) {
      if (filters.severity === 'low') {
        matchesSeverity = severityValue === severityScale.low;
      } else {
        matchesSeverity = severityValue >= severityScale[filters.severity as Severity];
      }
    }

    const selected = filters.selectedNodeId === node.id;
    const highlight = selected || (filterActive && (matchesText || matchesSeverity));
    const dimmed = filterActive && !highlight;

    return {
      ...node,
      data: {
        ...node.data,
        highlighted: highlight,
        dimmed,
        selected,
      },
    };
  });
}

function buildEdges(
  layoutNodes: LayoutNode[],
  diagram: BowtieDiagram,
  barrierMap: Map<string, Barrier>,
) {
  const nodeIds = new Set(layoutNodes.map((node) => node.id));
  const edges: Edge[] = [];
  const topEventNodeId = `topEvent-${diagram.topEvent.id}`;

  const addEdge = (edge: Edge) => {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      edges.push({
        ...edge,
        style: { ...(edge.style ?? {}), ...EDGE_STYLE },
        markerEnd: EDGE_MARKER,
      });
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
      if (!barrierId) return;
      const barrier = barrierMap.get(barrierId);
      if (!barrier) return;

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

    if (layoutNode.type === 'threat' && layoutNode.parentId) {
      addEdge({
        id: `edge-threat-parent-${layoutNode.id}`,
        source: `threat-${layoutNode.parentId}`,
        target: layoutNode.id,
        type: 'smoothstep',
      });
    }

    if (layoutNode.type === 'consequence' && layoutNode.parentId) {
      addEdge({
        id: `edge-consequence-parent-${layoutNode.id}`,
        source: `consequence-${layoutNode.parentId}`,
        target: layoutNode.id,
        type: 'smoothstep',
      });
    }
  });

  return edges;
}

function createHazardReactFlowNode(
  hazard: Hazard,
  topEventId: string,
  nodes: Node[],
) {
  const topEventNode = nodes.find((node) => node.id === `topEvent-${topEventId}`);
  if (!topEventNode) {
    return null;
  }

  const hazardNodeId = `hazard-${hazard.id}`;
  const hazardNode: Node = {
    id: hazardNodeId,
    type: 'hazard',
    position: {
      x: topEventNode.position.x,
      y: topEventNode.position.y - 260,
    },
    sourcePosition: 'bottom',
    targetPosition: 'top',
    data: {
      label: hazard.label,
      description: hazard.description,
    },
    draggable: false,
  };

  const hazardEdge: Edge = {
    id: `edge-${hazardNodeId}-topEvent`,
    source: hazardNodeId,
    target: topEventNode.id,
    type: 'smoothstep',
    style: EDGE_STYLE,
    markerEnd: EDGE_MARKER,
  };

  return { node: hazardNode, edge: hazardEdge };
}

function getNodeDetails(
  nodeId: string | null,
  diagram: BowtieDiagram,
  threatMap: ThreatMap,
  consequenceMap: ConsequenceMap,
  barrierMap: Map<string, Barrier>,
) {
  if (!nodeId) return null;

  if (nodeId.startsWith('threat-')) {
    const threatId = nodeId.replace('threat-', '');
    const threat = threatMap[threatId];
    if (!threat) return null;
    return {
      id: nodeId,
      kind: 'threat',
      label: threat.label,
      description: threat.description,
      severity: threat.severity,
      level: threat.level,
      tags: threat.subThreats?.map((sub) => sub.label) ?? [],
    };
  }

  if (nodeId.startsWith('hazard-')) {
    const hazard = diagram.hazard;
    if (!hazard || nodeId !== `hazard-${hazard.id}`) {
      return null;
    }
    return {
      id: nodeId,
      kind: 'hazard',
      label: hazard.label,
      description: hazard.description,
    };
  }

  if (nodeId.startsWith('consequence-')) {
    const consequenceId = nodeId.replace('consequence-', '');
    const consequence = consequenceMap[consequenceId];
    if (!consequence) return null;
    return {
      id: nodeId,
      kind: 'consequence',
      label: consequence.label,
      description: consequence.description,
      severity: consequence.severity,
      level: consequence.level,
      tags: consequence.subConsequences?.map((sub) => sub.label) ?? [],
    };
  }

  if (nodeId.startsWith('barrier-')) {
    const barrierId = extractBarrierId(nodeId);
    if (!barrierId) return null;
    const barrier = barrierMap.get(barrierId);
    if (!barrier) return null;
    const related =
      barrier.type === 'preventive'
        ? threatMap[barrier.threatId ?? '']?.label
        : consequenceMap[barrier.consequenceId ?? '']?.label;
    return {
      id: nodeId,
      kind: 'barrier',
      label: barrier.label,
      description: barrier.description,
      barrierType: barrier.type,
      effectiveness: barrier.effectiveness,
      related,
    };
  }

  if (nodeId.startsWith('topEvent-')) {
    return {
      id: nodeId,
      kind: 'topEvent',
      label: diagram.topEvent.label,
      description: diagram.topEvent.description,
      severity: diagram.topEvent.severity,
    };
  }

  return null;
}

function extractBarrierId(layoutNodeId: string) {
  const segments = layoutNodeId.split('-');
  return segments.length >= 3 ? segments.slice(2).join('-') : null;
}

function collectLevels(items: { level: number; subThreats?: any[]; subConsequences?: any[] }[]): number {
  let max = 0;

  const traverse = (list?: typeof items) => {
    if (!list) return;
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

function buildThreatMap(threats: Threat[]): ThreatMap {
  const map: ThreatMap = {};
  const traverse = (list?: Threat[]) => {
    if (!list) return;
    list.forEach((threat) => {
      map[threat.id] = threat;
      traverse(threat.subThreats);
    });
  };
  traverse(threats);
  return map;
}

function buildConsequenceMap(consequences: Consequence[]): ConsequenceMap {
  const map: ConsequenceMap = {};
  const traverse = (list?: Consequence[]) => {
    if (!list) return;
    list.forEach((consequence) => {
      map[consequence.id] = consequence;
      traverse(consequence.subConsequences);
    });
  };
  traverse(consequences);
  return map;
}

function getSourcePosition(type: LayoutNode['type']) {
  switch (type) {
    case 'hazard':
      return 'bottom';
    case 'topEvent':
    case 'threat':
    case 'consequence':
    case 'barrier':
    default:
      return 'right';
  }
}

function getTargetPosition(type: LayoutNode['type']) {
  switch (type) {
    case 'hazard':
      return 'top';
    case 'threat':
    case 'consequence':
    case 'barrier':
    case 'topEvent':
    default:
      return 'left';
  }
}

function severityPillStyle(severity: Severity): CSSProperties {
  const colors: Record<Severity, { bg: string; color: string }> = {
    low: { bg: '#ecfccb', color: '#3f6212' },
    medium: { bg: '#fef08a', color: '#92400e' },
    high: { bg: '#fed7aa', color: '#9a3412' },
    critical: { bg: '#fee2e2', color: '#b91c1c' },
  };

  return {
    background: colors[severity].bg,
    color: colors[severity].color,
    marginLeft: '0.35rem',
  };
}

const fallbackStyles: Record<string, CSSProperties> = {
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

function ensureStyleSheet(id: string, styles: string) {
  if (typeof document === 'undefined') return;
  if (document.head.querySelector(`style[data-bowtie-style="${id}"]`)) return;
  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-bowtie-style', id);
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}
