import { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Handle,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { ErBuildExercise, ErKind } from '../../types';
import type { Response } from '../../utils/grade';
import { erMatches } from '../../utils/grade';
import { Feedback } from './Feedback';

interface Props {
  exercise: ErBuildExercise;
  revealed: boolean;
  onCommit: (response: Response) => void;
}

type ErData = { kind: ErKind; label: string };
type ErNodeT = Node<ErData>;

const KINDS: { kind: ErKind; label: string; short: string }[] = [
  { kind: 'entity', label: 'Entité', short: 'Student' },
  { kind: 'weak_entity', label: 'Entité faible', short: 'Dependent' },
  { kind: 'associative_entity', label: 'Entité associative', short: 'Enrolment' },
  { kind: 'relationship', label: 'Relation', short: 'Issue' },
  { kind: 'identifying_relationship', label: 'Relation identifiante', short: 'Has' },
  { kind: 'attribute', label: 'Attribut', short: 'Name' },
  { kind: 'key_attribute', label: 'Clé primaire', short: 'RollNo' },
  { kind: 'multi_attribute', label: 'Attribut multivalué', short: 'Phone No' },
  { kind: 'derived_attribute', label: 'Attribut dérivé', short: 'Age' },
];

// Rectangles for entities, diamonds for relationships, ovals for attributes;
// doubled for the weak / identifying / multi-valued variants and dashed for a
// derived one. Drawn as a stretched SVG rather than with clip-paths so a double
// or dashed outline actually renders.
const OUTLINE: Record<ErKind, { hue: string; shape: React.ReactNode }> = {
  entity: {
    hue: 'text-sky-600',
    shape: <rect x="1" y="1" width="198" height="78" />,
  },
  weak_entity: {
    hue: 'text-sky-600',
    shape: (
      <>
        <rect x="1" y="1" width="198" height="78" />
        <rect x="7" y="7" width="186" height="66" />
      </>
    ),
  },
  associative_entity: {
    hue: 'text-sky-600',
    shape: (
      <>
        <rect x="1" y="1" width="198" height="78" />
        <polygon points="100,7 193,40 100,73 7,40" />
      </>
    ),
  },
  relationship: {
    hue: 'text-amber-600',
    shape: <polygon points="100,2 198,40 100,78 2,40" />,
  },
  identifying_relationship: {
    hue: 'text-amber-600',
    shape: (
      <>
        <polygon points="100,2 198,40 100,78 2,40" />
        <polygon points="100,10 184,40 100,70 16,40" />
      </>
    ),
  },
  attribute: {
    hue: 'text-violet-600',
    shape: <ellipse cx="100" cy="40" rx="98" ry="38" />,
  },
  key_attribute: {
    hue: 'text-violet-600',
    shape: <ellipse cx="100" cy="40" rx="98" ry="38" />,
  },
  multi_attribute: {
    hue: 'text-violet-600',
    shape: (
      <>
        <ellipse cx="100" cy="40" rx="98" ry="38" />
        <ellipse cx="100" cy="40" rx="91" ry="31" />
      </>
    ),
  },
  derived_attribute: {
    hue: 'text-violet-600',
    shape: <ellipse cx="100" cy="40" rx="98" ry="38" strokeDasharray="7 5" />,
  },
};

const BOX: Partial<Record<ErKind, string>> = {
  relationship: 'w-48 h-24',
  identifying_relationship: 'w-48 h-24',
};

function ErNodeView({ id, data }: NodeProps<ErNodeT>) {
  const { updateNodeData } = useReactFlow();
  const { hue, shape } = OUTLINE[data.kind];
  return (
    <div className={`relative flex items-center justify-center ${BOX[data.kind] ?? 'w-40 h-16'}`}>
      <svg
        viewBox="0 0 200 80"
        preserveAspectRatio="none"
        className={`absolute inset-0 h-full w-full ${hue}`}
        fill="white"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        aria-hidden="true"
      >
        {shape}
      </svg>

      <Handle id="t" type="target" position={Position.Top} />
      <Handle id="l" type="target" position={Position.Left} />

      <input
        className={`nodrag relative z-10 w-[78%] bg-transparent text-center text-xs text-neutral-800 outline-none ${
          data.kind === 'key_attribute' ? 'underline underline-offset-2' : ''
        }`}
        value={data.label}
        onChange={(e) => updateNodeData(id, { label: e.target.value })}
        placeholder="…"
      />

      <Handle id="b" type="source" position={Position.Bottom} />
      <Handle id="r" type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = { er: ErNodeView };

// Clicking a line cycles the cardinality mark written on it.
const CARDS = ['', '1', 'N', 'M'];

function Canvas({ exercise, revealed, onCommit }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<ErNodeT>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const counter = useRef(0);
  const [committed, setCommitted] = useState(false);

  const addNode = useCallback((kind: ErKind, short: string) => {
    const id = `n${counter.current++}`;
    setNodes((ns) => [
      ...ns,
      {
        id,
        type: 'er',
        position: { x: 60 + (ns.length % 4) * 190, y: 40 + Math.floor(ns.length / 4) * 130 },
        data: { kind, label: short },
      },
    ]);
  }, [setNodes]);

  // No arrowhead: an E-R line is undirected.
  const onConnect = useCallback((params: Connection) => {
    setEdges((es) => addEdge({ ...params, data: { card: '' } }, es));
  }, [setEdges]);

  const cycleCard = useCallback((_: React.MouseEvent, edge: Edge) => {
    if (revealed) return;
    setEdges((es) =>
      es.map((e) => {
        if (e.id !== edge.id) return e;
        const current = (e.data as { card?: string } | undefined)?.card ?? '';
        const next = CARDS[(CARDS.indexOf(current) + 1) % CARDS.length];
        return { ...e, label: next || undefined, data: { card: next } };
      }),
    );
  }, [revealed, setEdges]);

  const target = exercise.payload.target;
  const byId = new Map(target.nodes.map((n) => [n.id, n.label]));
  const allOk = nodes.every((n) => n.data.label.trim() !== '');

  const userGraph = {
    nodes: nodes.map((n) => ({ id: n.id, kind: n.data.kind, label: n.data.label })),
    edges: edges.map((e) => ({
      from: e.source,
      to: e.target,
      card: (e.data as { card?: string } | undefined)?.card || undefined,
    })),
  };
  const correct = revealed && erMatches(userGraph, target);

  function validate() {
    setCommitted(true);
    onCommit(userGraph);
  }

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-neutral-900">{exercise.prompt}</h2>
      <p className="mb-3 text-sm text-neutral-400">
        {exercise.payload.hint ??
          'Ajoute les formes, écris leur nom, relie-les en tirant depuis un bord. Clique une ligne pour poser sa cardinalité (1 / N / M).'}
      </p>

      {!revealed && (
        <div className="mb-2 flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k.kind}
              type="button"
              onClick={() => addNode(k.kind, k.short)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:border-neutral-400"
            >
              + {k.label}
            </button>
          ))}
        </div>
      )}

      <div className="h-[440px] w-full overflow-hidden rounded-lg border border-neutral-200">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={cycleCard}
          nodeTypes={nodeTypes}
          deleteKeyCode={revealed ? null : ['Delete']}
          nodesDraggable={!revealed}
          nodesConnectable={!revealed}
          elementsSelectable={!revealed}
          fitView
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      {!revealed && (
        <p className="mt-1 text-xs text-neutral-400">
          Clique une ligne pour changer sa cardinalité. Sélectionne une forme ou une
          ligne puis <kbd className="rounded border px-1">Suppr</kbd> pour l'effacer.
        </p>
      )}

      {!revealed && (
        <button
          type="button"
          onClick={validate}
          disabled={committed || nodes.length < 2 || !allOk}
          className="mt-3 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Valider
        </button>
      )}

      {revealed && (
        <Feedback
          correct={correct}
          diagramSvg={exercise.diagram_svg}
          explanation={exercise.explanation}
        >
          <p className="mb-1 text-sm font-medium text-neutral-700">Diagramme E-R attendu :</p>
          <pre className="overflow-x-auto rounded bg-white p-3 font-mono text-xs text-neutral-800">
            {target.edges
              .map((e) => `${byId.get(e.from)}  —  ${byId.get(e.to)}${e.card ? `  [${e.card}]` : ''}`)
              .join('\n')}
          </pre>
        </Feedback>
      )}
    </div>
  );
}

export default function ErBuildInner(props: Props) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
}
