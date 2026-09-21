import type { ReactNode } from 'react';
import type { ErEdge, ErGraph, ErKind, ErNode } from '../../types';
import {
  anchor,
  diamondOutline,
  ellipseOutline,
  emptyBox,
  growBox,
  lerp,
  normal,
  polygonPath,
  rectOutline,
  shift,
  textWidth,
  triangleOutline,
  type Outline,
  type Pt,
} from './geometry';

/**
 * Static E-R diagram, Chen notation, the same legend as the `er_build`
 * exercise canvas: rectangles for entities, diamonds for relationships, ovals
 * for attributes, doubled / dashed for the weak, multi-valued and derived
 * variants, a triangle for ISA.
 *
 * A lesson embeds one as a ```er fenced block holding this JSON. Positions are
 * authored (`x`, `y`) so a figure reads like the slide it comes from; when a
 * node has none the graph is laid out automatically, which is what the
 * exercise feedback relies on.
 */
export interface ErDiagramNode extends ErNode {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

export interface ErDiagramEdge extends ErEdge {
  /** Total participation: drawn as a double line. */
  total?: boolean;
  /** Role name written along the line (Coordinator, Head…). */
  role?: string;
}

export interface ErDiagramSpec {
  title?: string;
  nodes: ErDiagramNode[];
  edges: ErDiagramEdge[];
}

const FONT = 13;

const HUE: Record<ErKind, string> = {
  entity: 'text-sky-600',
  weak_entity: 'text-sky-600',
  associative_entity: 'text-sky-600',
  relationship: 'text-amber-600',
  identifying_relationship: 'text-amber-600',
  attribute: 'text-violet-600',
  key_attribute: 'text-violet-600',
  partial_key_attribute: 'text-violet-600',
  multi_attribute: 'text-violet-600',
  derived_attribute: 'text-violet-600',
  isa: 'text-emerald-600',
};

const ATTRIBUTE_KINDS = new Set<ErKind>([
  'attribute', 'key_attribute', 'partial_key_attribute', 'multi_attribute', 'derived_attribute',
]);
const RELATIONSHIP_KINDS = new Set<ErKind>(['relationship', 'identifying_relationship']);

function isAttribute(kind: ErKind): boolean {
  return ATTRIBUTE_KINDS.has(kind);
}

interface Placed {
  node: ErDiagramNode;
  x: number;
  y: number;
  w: number;
  h: number;
  outline: Outline;
}

function defaultSize(node: ErDiagramNode): { w: number; h: number } {
  const tw = textWidth(node.label, FONT);
  switch (node.kind) {
    case 'relationship':
    case 'identifying_relationship':
      return { w: Math.max(120, tw * 1.7 + 24), h: 60 };
    case 'isa':
      return { w: 72, h: 46 };
    case 'entity':
    case 'weak_entity':
    case 'associative_entity':
      return { w: Math.max(110, tw + 30), h: 46 };
    case 'multi_attribute':
      return { w: Math.max(100, tw + 44), h: 44 };
    default:
      return { w: Math.max(88, tw + 28), h: 38 };
  }
}

function outlineFor(kind: ErKind, x: number, y: number, w: number, h: number): Outline {
  if (RELATIONSHIP_KINDS.has(kind)) return diamondOutline(x, y, w, h);
  if (kind === 'isa') return triangleOutline(x, y, w, h);
  if (isAttribute(kind)) return ellipseOutline(x, y, w, h);
  return rectOutline(x, y, w, h);
}

// --- automatic layout --------------------------------------------------------

/**
 * Backbone (entities, relationships, ISA) is layered by breadth-first distance
 * from the first entity; attributes fan out around their owner in the
 * directions no backbone line already takes. Good enough for a feedback
 * panel, not for a lesson figure — those carry hand-placed coordinates.
 */
function autoLayout(spec: ErDiagramSpec): Map<string, Pt> {
  const pos = new Map<string, Pt>();
  const byId = new Map(spec.nodes.map((n) => [n.id, n]));
  const adj = new Map<string, string[]>();
  for (const n of spec.nodes) adj.set(n.id, []);
  for (const e of spec.edges) {
    adj.get(e.from)?.push(e.to);
    adj.get(e.to)?.push(e.from);
  }

  const backbone = spec.nodes.filter((n) => !isAttribute(n.kind));
  const vertical = backbone.some((n) => n.kind === 'isa');
  const layers: string[][] = [];
  const seen = new Set<string>();

  // One BFS per connected component so a disconnected graph still lays out.
  for (const root of backbone) {
    if (seen.has(root.id)) continue;
    let frontier = [root.id];
    seen.add(root.id);
    let depth = 0;
    while (frontier.length > 0) {
      layers[depth] = [...(layers[depth] ?? []), ...frontier];
      const next: string[] = [];
      for (const id of frontier) {
        for (const nb of adj.get(id) ?? []) {
          const node = byId.get(nb);
          if (!node || isAttribute(node.kind) || seen.has(nb)) continue;
          seen.add(nb);
          next.push(nb);
        }
      }
      frontier = next;
      depth++;
    }
  }

  const MAIN = vertical ? 150 : 210;
  const CROSS = 190;
  layers.forEach((ids, depth) => {
    ids.forEach((id, i) => {
      const cross = (i - (ids.length - 1) / 2) * CROSS;
      pos.set(id, vertical ? { x: cross, y: depth * MAIN } : { x: depth * MAIN, y: cross });
    });
  });

  // Attributes: owner = the first placed neighbour. Composite sub-attributes
  // wait for their parent attribute to be placed, hence the repeated passes.
  const CANDIDATES = [-90, -50, -130, 90, 50, 130, -20, -160, 20, 160, 0, 180];
  const taken = new Map<string, number[]>();
  let pending = spec.nodes.filter((n) => isAttribute(n.kind));
  let guard = 0;
  while (pending.length > 0 && guard++ < 10) {
    const rest: ErDiagramNode[] = [];
    for (const attr of pending) {
      const owner = (adj.get(attr.id) ?? []).find((id) => pos.has(id));
      if (!owner) {
        rest.push(attr);
        continue;
      }
      const o = pos.get(owner)!;
      if (!taken.has(owner)) {
        // Directions already used by lines to other placed nodes.
        const used = (adj.get(owner) ?? [])
          .filter((id) => pos.has(id))
          .map((id) => {
            const p = pos.get(id)!;
            return (Math.atan2(p.y - o.y, p.x - o.x) * 180) / Math.PI;
          });
        taken.set(owner, used);
      }
      const used = taken.get(owner)!;
      const free = CANDIDATES.find((a) => used.every((u) => Math.abs(((a - u + 540) % 360) - 180) > 32));
      const angle = free ?? CANDIDATES[used.length % CANDIDATES.length];
      used.push(angle);
      const ring = 1 + Math.floor((used.length - 1) / CANDIDATES.length);
      const r = (isAttribute(byId.get(owner)!.kind) ? 80 : 105) * ring;
      const rad = (angle * Math.PI) / 180;
      pos.set(attr.id, { x: o.x + Math.cos(rad) * r * 1.25, y: o.y + Math.sin(rad) * r });
    }
    pending = rest;
  }
  // Anything still unplaced (isolated attribute) goes in a row at the bottom.
  let stray = 0;
  for (const n of spec.nodes) {
    if (!pos.has(n.id)) pos.set(n.id, { x: stray++ * 130, y: (layers.length + 1) * MAIN });
  }
  return pos;
}

// --- rendering ---------------------------------------------------------------

function Label({ x, y, text, underline }: { x: number; y: number; text: string; underline?: 'solid' | 'dashed' }) {
  const lines = text.split('\n');
  const lh = FONT + 3;
  const top = y - ((lines.length - 1) * lh) / 2;
  const tw = textWidth(text, FONT);
  return (
    <>
      <text
        x={x}
        y={top}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={FONT}
        className="fill-neutral-800"
      >
        {lines.map((line, i) => (
          <tspan key={i} x={x} dy={i === 0 ? 0 : lh}>
            {line}
          </tspan>
        ))}
      </text>
      {underline && (
        <line
          x1={x - tw / 2}
          x2={x + tw / 2}
          y1={top + ((lines.length - 1) * lh) + FONT * 0.62}
          y2={top + ((lines.length - 1) * lh) + FONT * 0.62}
          className="stroke-neutral-800"
          strokeWidth={1.2}
          strokeDasharray={underline === 'dashed' ? '4 3' : undefined}
        />
      )}
    </>
  );
}

function Shape({ p }: { p: Placed }) {
  const { x, y, w, h, node } = p;
  const common = { fill: '#fff', stroke: 'currentColor', strokeWidth: 1.6 } as const;
  const inner = (dw: number) => outlineFor(node.kind, x, y, w - dw, h - dw);
  const path = (o: Outline) => (o.type === 'polygon' ? <path d={polygonPath(o.points)} {...common} /> : null);

  let underline: 'solid' | 'dashed' | undefined;
  if (node.kind === 'key_attribute') underline = 'solid';
  if (node.kind === 'partial_key_attribute') underline = 'dashed';

  let body: ReactNode;
  switch (node.kind) {
    case 'entity':
      body = <rect x={x - w / 2} y={y - h / 2} width={w} height={h} {...common} />;
      break;
    case 'weak_entity':
      body = (
        <>
          <rect x={x - w / 2} y={y - h / 2} width={w} height={h} {...common} />
          <rect x={x - w / 2 + 5} y={y - h / 2 + 5} width={w - 10} height={h - 10} {...common} />
        </>
      );
      break;
    case 'associative_entity':
      body = (
        <>
          <rect x={x - w / 2} y={y - h / 2} width={w} height={h} {...common} />
          {path(diamondOutline(x, y, w - 8, h - 8))}
        </>
      );
      break;
    case 'relationship':
      body = path(p.outline);
      break;
    case 'identifying_relationship':
      body = (
        <>
          {path(p.outline)}
          {path(inner(14))}
        </>
      );
      break;
    case 'isa':
      body = path(p.outline);
      break;
    case 'multi_attribute':
      body = (
        <>
          <ellipse cx={x} cy={y} rx={w / 2} ry={h / 2} {...common} />
          <ellipse cx={x} cy={y} rx={w / 2 - 5} ry={h / 2 - 5} {...common} />
        </>
      );
      break;
    case 'derived_attribute':
      body = <ellipse cx={x} cy={y} rx={w / 2} ry={h / 2} {...common} strokeDasharray="6 4" />;
      break;
    default:
      body = <ellipse cx={x} cy={y} rx={w / 2} ry={h / 2} {...common} />;
  }

  return (
    <g className={HUE[node.kind]}>
      {body}
      <Label x={x} y={node.kind === 'isa' ? y - h * 0.16 : y} text={node.label} underline={underline} />
    </g>
  );
}

function EdgeLabel({ at, text, strong }: { at: Pt; text: string; strong?: boolean }) {
  return (
    <text
      x={at.x}
      y={at.y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={strong ? FONT : FONT - 1}
      fontWeight={strong ? 600 : 400}
      paintOrder="stroke"
      stroke="#fff"
      strokeWidth={4}
      className={strong ? 'fill-neutral-900' : 'fill-neutral-600'}
    >
      {text}
    </text>
  );
}

function Line({ edge, from, to, offset }: { edge: ErDiagramEdge; from: Placed; to: Placed; offset: number }) {
  // Parallel lines between the same pair (a recursive relationship) are
  // shifted sideways before clipping so they leave the shapes at different
  // points instead of overlapping.
  const cFrom = { x: from.x, y: from.y };
  const cTo = { x: to.x, y: to.y };
  const n = normal(cFrom, cTo);
  const sFrom = shift(cFrom, n, offset);
  const sTo = shift(cTo, n, offset);
  const a = anchor(from.outline, cFrom, sTo);
  const b = anchor(to.outline, cTo, sFrom);
  const a2 = offset ? shift(a, n, offset) : a;
  const b2 = offset ? shift(b, n, offset) : b;

  const stroke = { stroke: 'currentColor', strokeWidth: 1.6 } as const;
  const lines = edge.total
    ? [
        <line key="1" x1={shift(a2, n, 2.5).x} y1={shift(a2, n, 2.5).y} x2={shift(b2, n, 2.5).x} y2={shift(b2, n, 2.5).y} {...stroke} />,
        <line key="2" x1={shift(a2, n, -2.5).x} y1={shift(a2, n, -2.5).y} x2={shift(b2, n, -2.5).x} y2={shift(b2, n, -2.5).y} {...stroke} />,
      ]
    : [<line key="1" x1={a2.x} y1={a2.y} x2={b2.x} y2={b2.y} {...stroke} />];

  // A cardinality sits near the entity end of a relationship line, a role
  // name near the middle; both are pushed off the line so they stay legible.
  const fromIsRel = RELATIONSHIP_KINDS.has(from.node.kind);
  const toIsRel = RELATIONSHIP_KINDS.has(to.node.kind);
  let cardT = 0.5;
  if (fromIsRel && !toIsRel) cardT = 0.7;
  if (toIsRel && !fromIsRel) cardT = 0.3;
  const roleT = edge.card && cardT === 0.5 ? 0.72 : 0.5;
  // Labels go on the outer side of a parallel pair, otherwise above the line.
  const side = offset !== 0 ? Math.sign(offset) : (n.y < 0 ? 1 : -1);
  const off = 12 * side;

  return (
    <g className="text-neutral-500">
      {lines}
      {edge.card && <EdgeLabel at={shift(lerp(a2, b2, cardT), n, off)} text={edge.card} strong />}
      {edge.role && <EdgeLabel at={shift(lerp(a2, b2, roleT), n, off)} text={edge.role} />}
    </g>
  );
}

export function ErDiagram({ spec, compact }: { spec: ErDiagramSpec; compact?: boolean }) {
  const needsLayout = spec.nodes.some((n) => n.x === undefined || n.y === undefined);
  const auto = needsLayout ? autoLayout(spec) : null;

  const placed = new Map<string, Placed>();
  const box = emptyBox();
  for (const node of spec.nodes) {
    const p = auto?.get(node.id);
    const x = node.x ?? p?.x ?? 0;
    const y = node.y ?? p?.y ?? 0;
    const size = defaultSize(node);
    const w = node.w ?? size.w;
    const h = node.h ?? size.h;
    placed.set(node.id, { node, x, y, w, h, outline: outlineFor(node.kind, x, y, w, h) });
    growBox(box, x, y, w + 8, h + 8);
  }

  // Parallel-edge bookkeeping.
  const pairCount = new Map<string, number>();
  const pairIndex = new Map<string, number>();
  const keyOf = (e: ErEdge) => [e.from, e.to].sort().join('|');
  for (const e of spec.edges) pairCount.set(keyOf(e), (pairCount.get(keyOf(e)) ?? 0) + 1);

  const PAD = 18;
  const minX = box.minX - PAD;
  const minY = box.minY - PAD;
  const width = box.maxX - box.minX + PAD * 2;
  const height = box.maxY - box.minY + PAD * 2;

  return (
    <figure className={compact ? 'my-2' : 'my-5'}>
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white p-3">
        <svg
          viewBox={`${minX} ${minY} ${width} ${height}`}
          className="mx-auto h-auto w-full"
          style={{ maxWidth: width }}
          role="img"
          aria-label={spec.title ?? 'Diagramme E-R'}
          fontFamily="inherit"
        >
          {spec.edges.map((e, i) => {
            const from = placed.get(e.from);
            const to = placed.get(e.to);
            if (!from || !to) return null;
            const k = keyOf(e);
            const idx = pairIndex.get(k) ?? 0;
            pairIndex.set(k, idx + 1);
            const count = pairCount.get(k) ?? 1;
            const offset = count > 1 ? (idx - (count - 1) / 2) * 22 : 0;
            return <Line key={i} edge={e} from={from} to={to} offset={offset} />;
          })}
          {[...placed.values()].map((p) => (
            <Shape key={p.node.id} p={p} />
          ))}
        </svg>
      </div>
      {spec.title && (
        <figcaption className="mt-2 text-center text-sm text-neutral-500">{spec.title}</figcaption>
      )}
    </figure>
  );
}

/** The exercise feedback draws the graded target with the automatic layout. */
export function ErGraphView({ graph }: { graph: ErGraph }) {
  return <ErDiagram spec={{ nodes: graph.nodes, edges: graph.edges }} compact />;
}
