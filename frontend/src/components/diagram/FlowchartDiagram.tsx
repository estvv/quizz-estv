import type { FlowchartGraph, FlowchartKind, FlowchartNode } from '../../types';
import {
  anchor,
  diamondOutline,
  emptyBox,
  growBox,
  polygonPath,
  rectOutline,
  textWidth,
  type Outline,
  type Pt,
} from './geometry';

/**
 * Static flowchart, same legend as the `flowchart_build` canvas: pill for
 * start/end, parallelogram for input/output, rectangle for a process, diamond
 * for a decision whose `yes` exit leaves at the bottom and `no` exit at the
 * right. Lesson figures come from a ```flowchart fence; the exercise feedback
 * draws the graded target through the automatic layout.
 */
export interface FlowchartDiagramNode extends FlowchartNode {
  x?: number;
  y?: number;
}

export interface FlowchartSpec {
  title?: string;
  nodes: FlowchartDiagramNode[];
  edges: FlowchartGraph['edges'];
}

const FONT = 12;
const ROW = 92;

const STYLE: Record<FlowchartKind, { stroke: string; fill: string }> = {
  start: { stroke: '#059669', fill: '#d1fae5' },
  end: { stroke: '#e11d48', fill: '#ffe4e6' },
  io: { stroke: '#0284c7', fill: '#e0f2fe' },
  process: { stroke: '#737373', fill: '#fff' },
  decision: { stroke: '#d97706', fill: '#fef3c7' },
};

interface Placed {
  node: FlowchartDiagramNode;
  x: number;
  y: number;
  w: number;
  h: number;
  outline: Outline;
}

function size(node: FlowchartNode): { w: number; h: number } {
  const lines = node.label.split('\n').length;
  const tw = textWidth(node.label, FONT);
  const th = lines * (FONT + 4);
  switch (node.kind) {
    case 'decision':
      return { w: Math.max(150, tw * 1.6 + 30), h: Math.max(64, th + 40) };
    case 'io':
      return { w: Math.max(130, tw + 50), h: Math.max(40, th + 16) };
    case 'start':
    case 'end':
      return { w: Math.max(100, tw + 40), h: 36 };
    default:
      return { w: Math.max(120, tw + 30), h: Math.max(40, th + 16) };
  }
}

/** Parallelogram, slanted like the exercise canvas (14 % lean). */
function ioOutline(x: number, y: number, w: number, h: number): Outline {
  const lean = w * 0.12;
  return {
    type: 'polygon',
    points: [
      { x: x - w / 2 + lean, y: y - h / 2 },
      { x: x + w / 2, y: y - h / 2 },
      { x: x + w / 2 - lean, y: y + h / 2 },
      { x: x - w / 2, y: y + h / 2 },
    ],
  };
}

function outlineFor(kind: FlowchartKind, x: number, y: number, w: number, h: number): Outline {
  if (kind === 'decision') return diamondOutline(x, y, w, h);
  if (kind === 'io') return ioOutline(x, y, w, h);
  return rectOutline(x, y, w, h);
}

// --- automatic layout --------------------------------------------------------

/**
 * Rows come from the longest path from the start node (so a merge point sits
 * below every branch that reaches it), columns open to the right for a
 * decision's `no` branch and close again at the merge. Back edges (loops) are
 * left out of the layering and routed around on the left when drawn. Column
 * spacing follows the widest box in each column.
 */
function autoLayout(spec: FlowchartSpec, widths: Map<string, number>): Map<string, Pt> {
  const pos = new Map<string, Pt>();
  const out = new Map<string, FlowchartGraph['edges']>();
  for (const n of spec.nodes) out.set(n.id, []);
  for (const e of spec.edges) out.get(e.from)?.push(e);

  const start = spec.nodes.find((n) => n.kind === 'start') ?? spec.nodes[0];
  if (!start) return pos;

  // DFS: topological order of the forward edges, back edges identified by the
  // recursion stack.
  const back = new Set<FlowchartGraph['edges'][number]>();
  const state = new Map<string, 'open' | 'done'>();
  const topo: string[] = [];
  const visit = (id: string) => {
    state.set(id, 'open');
    for (const e of out.get(id) ?? []) {
      const st = state.get(e.to);
      if (st === 'open') back.add(e);
      else if (st === undefined) visit(e.to);
    }
    state.set(id, 'done');
    topo.push(id);
  };
  visit(start.id);
  for (const n of spec.nodes) if (!state.has(n.id)) visit(n.id);
  topo.reverse();

  const row = new Map<string, number>();
  const col = new Map<string, number>();
  row.set(start.id, 0);
  col.set(start.id, 0);
  for (const id of topo) {
    if (!row.has(id)) {
      row.set(id, 0);
      col.set(id, 0);
    }
    for (const e of out.get(id) ?? []) {
      if (back.has(e)) continue;
      const r = row.get(id)! + 1;
      const c = col.get(id)! + (e.branch === 'no' ? 1 : 0);
      row.set(e.to, Math.max(row.get(e.to) ?? 0, r));
      // A merge point goes back to the leftmost column that reaches it.
      col.set(e.to, Math.min(col.get(e.to) ?? Infinity, c));
    }
  }
  // Resolve two nodes landing on the same cell by sliding the later one right.
  const taken = new Set<string>();
  for (const id of topo) {
    let c = col.get(id) ?? 0;
    const r = row.get(id) ?? 0;
    while (taken.has(`${r}|${c}`)) c++;
    col.set(id, c);
    taken.add(`${r}|${c}`);
  }
  const colWidth: number[] = [];
  for (const n of spec.nodes) {
    const c = col.get(n.id) ?? 0;
    colWidth[c] = Math.max(colWidth[c] ?? 0, widths.get(n.id) ?? 120);
  }
  const colX: number[] = [];
  let x = 0;
  colWidth.forEach((w, c) => {
    colX[c] = x + w / 2;
    x += w + 70;
  });
  for (const n of spec.nodes) {
    pos.set(n.id, { x: colX[col.get(n.id) ?? 0] ?? 0, y: 40 + (row.get(n.id) ?? 0) * ROW });
  }
  return pos;
}

// --- rendering ---------------------------------------------------------------

function arrowhead(tip: Pt, from: Pt): string {
  const dx = tip.x - from.x;
  const dy = tip.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const s = 9;
  const bx = tip.x - ux * s;
  const by = tip.y - uy * s;
  return `M${tip.x} ${tip.y} L${bx - uy * s * 0.45} ${by + ux * s * 0.45} L${bx + uy * s * 0.45} ${by - ux * s * 0.45} Z`;
}

function Shape({ p }: { p: Placed }) {
  const { node, x, y, w, h } = p;
  const st = STYLE[node.kind];
  const common = { fill: st.fill, stroke: st.stroke, strokeWidth: 1.6 } as const;
  let body;
  if (node.kind === 'start' || node.kind === 'end') {
    body = <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} {...common} />;
  } else if (node.kind === 'process') {
    body = <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={3} {...common} />;
  } else if (p.outline.type === 'polygon') {
    body = <path d={polygonPath(p.outline.points)} {...common} />;
  }
  const lines = node.label.split('\n');
  const lh = FONT + 4;
  const top = y - ((lines.length - 1) * lh) / 2;
  return (
    <g>
      {body}
      <text x={x} y={top} textAnchor="middle" dominantBaseline="central" fontSize={FONT} fill="#262626" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
        {lines.map((l, i) => (
          <tspan key={i} x={x} dy={i === 0 ? 0 : lh}>
            {l}
          </tspan>
        ))}
      </text>
    </g>
  );
}

export function FlowchartDiagram({ spec, compact }: { spec: FlowchartSpec; compact?: boolean }) {
  const needsLayout = spec.nodes.some((n) => n.x === undefined || n.y === undefined);
  const sizes = new Map(spec.nodes.map((n) => [n.id, size(n)]));
  const auto = needsLayout ? autoLayout(spec, new Map([...sizes].map(([id, s]) => [id, s.w]))) : null;

  const placed = new Map<string, Placed>();
  const box = emptyBox();
  for (const node of spec.nodes) {
    const p = auto?.get(node.id);
    const x = node.x ?? p?.x ?? 0;
    const y = node.y ?? p?.y ?? 0;
    const { w, h } = sizes.get(node.id)!;
    placed.set(node.id, { node, x, y, w, h, outline: outlineFor(node.kind, x, y, w, h) });
    growBox(box, x, y, w + 8, h + 8);
  }
  const leftEdge = box.minX;

  const edges = spec.edges.map((e, i) => {
    const from = placed.get(e.from);
    const to = placed.get(e.to);
    if (!from || !to) return null;
    const c1 = { x: from.x, y: from.y };
    const c2 = { x: to.x, y: to.y };
    const pts: Pt[] = [];
    let a: Pt;
    let b: Pt;
    const isNo = e.branch === 'no';
    if (to.y <= from.y) {
      // Back edge (a loop): leave from the side, go around on the left, come
      // back in from the top.
      const side = isNo ? { x: from.x + from.w / 2, y: from.y } : { x: from.x, y: from.y + from.h / 2 };
      const railX = leftEdge - 40;
      const railY = from.y + from.h / 2 + 24;
      a = side;
      b = { x: to.x, y: to.y - to.h / 2 };
      if (isNo) {
        pts.push({ x: side.x + 24, y: side.y }, { x: side.x + 24, y: railY });
      } else {
        pts.push({ x: side.x, y: railY });
      }
      pts.push({ x: railX, y: railY }, { x: railX, y: to.y - to.h / 2 - 20 }, { x: to.x, y: to.y - to.h / 2 - 20 });
      growBox(box, railX, railY, 20, 20);
    } else if (isNo && to.x !== from.x && to.x - from.x < from.w / 2 + 200) {
      // `no` leaves the diamond on the right, then turns down onto the target.
      a = { x: from.x + from.w / 2, y: from.y };
      pts.push({ x: to.x, y: from.y });
      b = { x: to.x, y: to.y - to.h / 2 };
    } else if (isNo) {
      // `no` towards a node further down the same column, or several columns
      // away: detour just right of the diamond so the line cuts through
      // neither the `yes` branch nor the boxes in between.
      a = { x: from.x + from.w / 2, y: from.y };
      const railX = from.x + from.w / 2 + 50;
      const midY = to.y - to.h / 2 - 22;
      pts.push({ x: railX, y: from.y }, { x: railX, y: midY }, { x: to.x, y: midY });
      b = { x: to.x, y: to.y - to.h / 2 };
      growBox(box, railX, from.y, 20, 20);
    } else if (to.x !== from.x) {
      // Coming back to the main column: down, then across, then down.
      a = { x: from.x, y: from.y + from.h / 2 };
      const midY = to.y - to.h / 2 - 22;
      pts.push({ x: from.x, y: midY }, { x: to.x, y: midY });
      b = { x: to.x, y: to.y - to.h / 2 };
    } else {
      a = anchor(from.outline, c1, c2);
      b = anchor(to.outline, c2, c1);
    }
    const all = [a, ...pts, b];
    const d = all.map((p, k) => `${k === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const labelAt = e.branch
      ? isNo
        ? { x: a.x + 16, y: a.y - 9 }
        : { x: a.x + 14, y: a.y + 12 }
      : null;
    if (labelAt) growBox(box, labelAt.x, labelAt.y, 30, 16);
    return (
      <g key={i}>
        <path d={d} fill="none" stroke="#737373" strokeWidth={1.5} />
        <path d={arrowhead(b, all[all.length - 2])} fill="#737373" />
        {labelAt && (
          <text x={labelAt.x} y={labelAt.y} fontSize={10} fontWeight={600} fill={isNo ? '#e11d48' : '#059669'} dominantBaseline="central">
            {e.branch}
          </text>
        )}
      </g>
    );
  });

  const PAD = 16;
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
          aria-label={spec.title ?? 'Flowchart'}
          fontFamily="inherit"
        >
          {[...placed.values()].map((p) => (
            <Shape key={p.node.id} p={p} />
          ))}
          {edges}
        </svg>
      </div>
      {spec.title && (
        <figcaption className="mt-2 text-center text-sm text-neutral-500">{spec.title}</figcaption>
      )}
    </figure>
  );
}

/** The exercise feedback draws the graded target with the automatic layout. */
export function FlowchartGraphView({ graph }: { graph: FlowchartGraph }) {
  return <FlowchartDiagram spec={{ nodes: graph.nodes, edges: graph.edges }} compact />;
}
