import { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
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
import type { FlowchartBuildExercise, FlowchartKind } from '../../types';
import type { Response } from '../../utils/grade';
import { flowchartMatches } from '../../utils/grade';
import { Feedback } from './Feedback';

interface Props {
  exercise: FlowchartBuildExercise;
  revealed: boolean;
  onCommit: (response: Response) => void;
}

type FcData = { kind: FlowchartKind; label: string };
type FcNode = Node<FcData>;

const KINDS: { kind: FlowchartKind; label: string; short: string }[] = [
  { kind: 'start', label: 'Départ', short: 'START' },
  { kind: 'io', label: 'Entrée / Sortie', short: 'INPUT x' },
  { kind: 'process', label: 'Traitement', short: 'x = ...' },
  { kind: 'decision', label: 'Décision', short: 'x > 0 ?' },
  { kind: 'end', label: 'Fin', short: 'END' },
];

const SHAPE: Record<FlowchartKind, string> = {
  start: 'rounded-full bg-emerald-50 border-emerald-400',
  end: 'rounded-full bg-rose-50 border-rose-400',
  io: 'bg-sky-50 border-sky-400 [clip-path:polygon(14%_0,100%_0,86%_100%,0_100%)] px-6',
  process: 'rounded bg-white border-neutral-400',
  decision: 'bg-amber-50 border-amber-400 [clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)] !w-40 !h-24',
};

function FcNodeView({ id, data }: NodeProps<FcNode>) {
  const { updateNodeData } = useReactFlow();
  const isDecision = data.kind === 'decision';
  return (
    <div
      className={`relative flex min-w-32 items-center justify-center border-2 px-3 py-2 text-center ${SHAPE[data.kind]}`}
    >
      {data.kind !== 'start' && <Handle type="target" position={Position.Top} />}
      <input
        className="nodrag w-full bg-transparent text-center font-mono text-xs text-neutral-800 outline-none"
        value={data.label}
        onChange={(e) => updateNodeData(id, { label: e.target.value })}
        placeholder="…"
      />
      {isDecision ? (
        <>
          <Handle id="yes" type="source" position={Position.Bottom}>
            <span className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 text-[9px] text-emerald-600">oui</span>
          </Handle>
          <Handle id="no" type="source" position={Position.Right}>
            <span className="pointer-events-none absolute right-1 top-1/2 text-[9px] text-rose-600">non</span>
          </Handle>
        </>
      ) : (
        data.kind !== 'end' && <Handle type="source" position={Position.Bottom} />
      )}
    </div>
  );
}

const nodeTypes = { fc: FcNodeView };

function Canvas({ exercise, revealed, onCommit }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<FcNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const counter = useRef(0);
  const [committed, setCommitted] = useState(false);

  const addNode = useCallback((kind: FlowchartKind, short: string) => {
    const id = `n${counter.current++}`;
    setNodes((ns) => [
      ...ns,
      {
        id,
        type: 'fc',
        position: { x: 120 + (ns.length % 3) * 40, y: 40 + ns.length * 90 },
        data: { kind, label: short },
      },
    ]);
  }, [setNodes]);

  const onConnect = useCallback((params: Connection) => {
    const branch = params.sourceHandle === 'yes' ? 'yes' : params.sourceHandle === 'no' ? 'no' : undefined;
    setEdges((es) =>
      addEdge(
        {
          ...params,
          label: branch === 'yes' ? 'oui' : branch === 'no' ? 'non' : undefined,
          data: { branch },
          markerEnd: { type: MarkerType.ArrowClosed },
        },
        es,
      ),
    );
  }, [setEdges]);

  const target = exercise.payload.target;
  const byId = new Map(target.nodes.map((n) => [n.id, n.label]));
  const allOk = nodes.every((n) => n.data.label.trim() !== '');

  const userGraph = {
    nodes: nodes.map((n) => ({ id: n.id, kind: n.data.kind, label: n.data.label })),
    edges: edges.map((e) => ({
      from: e.source,
      to: e.target,
      branch: (e.data as { branch?: 'yes' | 'no' } | undefined)?.branch,
    })),
  };
  const correct = revealed && flowchartMatches(userGraph, target);

  function validate() {
    setCommitted(true);
    onCommit(userGraph);
  }

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-neutral-900">{exercise.prompt}</h2>
      <p className="mb-3 text-sm text-neutral-400">
        {exercise.payload.hint ??
          'Ajoute des blocs, écris leur contenu, relie-les en tirant depuis le point bas. Une décision a une sortie « oui » (bas) et « non » (droite).'}
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
          Sélectionne un bloc ou une flèche puis <kbd className="rounded border px-1">Suppr</kbd> pour l'effacer.
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
          <p className="mb-1 text-sm font-medium text-neutral-700">Flowchart attendu :</p>
          <pre className="overflow-x-auto rounded bg-white p-3 font-mono text-xs text-neutral-800">
            {target.edges
              .map((e) => {
                const b = e.branch ? `  [${e.branch === 'yes' ? 'oui' : 'non'}]` : '';
                return `${byId.get(e.from)}  →  ${byId.get(e.to)}${b}`;
              })
              .join('\n')}
          </pre>
        </Feedback>
      )}
    </div>
  );
}

export default function FlowchartBuildInner(props: Props) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
}
