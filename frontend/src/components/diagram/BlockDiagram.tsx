import type { ReactNode } from 'react';
import {
  anchor,
  diamondOutline,
  ellipseOutline,
  emptyBox,
  growBox,
  labelOffset,
  lerp,
  polygonPath,
  rectOutline,
  shift,
  textWidth,
  type Outline,
  type Pt,
} from './geometry';

/**
 * Generic boxes-and-arrows figure for lessons: architecture layers, trees,
 * tables side by side, mappings between sets. Authored as JSON in a
 * ```diagram fenced block; every node carries its own `x`/`y` (centre).
 * Anything with E-R semantics belongs in an ```er block instead.
 */
export type BlockShape = 'box' | 'ellipse' | 'diamond' | 'cylinder' | 'text' | 'table' | 'note';
export type Tone = 'neutral' | 'sky' | 'amber' | 'violet' | 'emerald' | 'rose';

export interface BlockNode {
  id: string;
  label?: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  shape?: BlockShape;
  tone?: Tone;
  /** Tinted background (tone-50) instead of white. */
  filled?: boolean;
  dashed?: boolean;
  bold?: boolean;
  /** Font size override, e.g. 11 for dense figures. */
  size?: number;
  /** `table` shape only: first row is the header. */
  rows?: string[][];
  /** `table` shape only: 0-based row indexes to highlight. */
  mark?: number[];
  /** `table` shape only: fixed column widths, so callouts can be aimed at cells. */
  cols?: number[];
  /** `table` shape only: false when the first row is data, not a header. */
  header?: boolean;
}

export interface BlockEdge {
  from: string;
  to: string;
  /** Arrowhead placement; default `end`. */
  arrow?: 'end' | 'both' | 'none';
  label?: string;
  dashed?: boolean;
  /** Intermediate corner points for an orthogonal route. */
  via?: [number, number][];
  tone?: Tone;
  /** Bold label, e.g. a cardinality mark. */
  bold?: boolean;
}

export interface BlockGroup {
  label?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tone?: Tone;
  dashed?: boolean;
  /** Put the label in the top-right corner instead of the top-left. */
  labelAlign?: 'left' | 'right';
}

export interface BlockSpec {
  title?: string;
  nodes: BlockNode[];
  edges?: BlockEdge[];
  groups?: BlockGroup[];
}

const TONES: Record<Tone, { stroke: string; fill: string; text: string }> = {
  neutral: { stroke: '#737373', fill: '#f5f5f5', text: '#262626' },
  sky: { stroke: '#0284c7', fill: '#e0f2fe', text: '#0c4a6e' },
  amber: { stroke: '#d97706', fill: '#fef3c7', text: '#78350f' },
  violet: { stroke: '#7c3aed', fill: '#ede9fe', text: '#4c1d95' },
  emerald: { stroke: '#059669', fill: '#d1fae5', text: '#064e3b' },
  rose: { stroke: '#e11d48', fill: '#ffe4e6', text: '#881337' },
};

const FONT = 13;
const CELL_H = 22;
const CELL_PAD = 10;

interface Placed {
  node: BlockNode;
  x: number;
  y: number;
  w: number;
  h: number;
  outline: Outline;
  colWidths?: number[];
}

function measure(node: BlockNode): { w: number; h: number; colWidths?: number[] } {
  const font = node.size ?? FONT;
  if (node.shape === 'table' && node.rows) {
    const cols = Math.max(...node.rows.map((r) => r.length));
    const colWidths = Array.from({ length: cols }, (_, c) =>
      node.cols?.[c] ?? Math.max(...node.rows!.map((r) => textWidth(r[c] ?? '', font - 1))) + CELL_PAD * 2,
    );
    const w = colWidths.reduce((a, b) => a + b, 0);
    const h = node.rows.length * CELL_H + (node.label ? CELL_H : 0);
    return { w: node.w ?? w, h: node.h ?? h, colWidths };
  }
  const label = node.label ?? '';
  const lines = label.split('\n').length;
  const tw = textWidth(label, font);
  const th = lines * (font + 4);
  switch (node.shape) {
    case 'ellipse':
      return { w: node.w ?? Math.max(90, tw + 36), h: node.h ?? Math.max(40, th + 18) };
    case 'diamond':
      return { w: node.w ?? Math.max(110, tw * 1.7 + 24), h: node.h ?? Math.max(56, th + 30) };
    case 'cylinder':
      return { w: node.w ?? Math.max(90, tw + 30), h: node.h ?? Math.max(56, th + 30) };
    case 'text':
      return { w: node.w ?? tw + 8, h: node.h ?? th + 4 };
    default:
      return { w: node.w ?? Math.max(90, tw + 28), h: node.h ?? Math.max(38, th + 16) };
  }
}

function Text({ x, y, text, font, bold, color }: { x: number; y: number; text: string; font: number; bold?: boolean; color: string }) {
  const lines = text.split('\n');
  const lh = font + 4;
  const top = y - ((lines.length - 1) * lh) / 2;
  return (
    <text
      x={x}
      y={top}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={font}
      fontWeight={bold ? 600 : 400}
      fill={color}
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : lh}>
          {line === '' ? '\u00a0' : line}
        </tspan>
      ))}
    </text>
  );
}

function Shape({ p }: { p: Placed }) {
  const { node, x, y, w, h } = p;
  const tone = TONES[node.tone ?? 'neutral'];
  const font = node.size ?? FONT;
  const fill = node.filled || node.shape === 'note' ? tone.fill : '#fff';
  const stroke = { stroke: tone.stroke, strokeWidth: 1.5, strokeDasharray: node.dashed ? '6 4' : undefined } as const;
  const textColor = node.filled || node.shape === 'note' ? tone.text : '#262626';

  if (node.shape === 'table' && node.rows && p.colWidths) {
    const left = x - w / 2;
    let top = y - h / 2;
    const cells: ReactNode[] = [];
    if (node.label) {
      cells.push(
        <text key="title" x={left} y={top + CELL_H / 2} dominantBaseline="central" fontSize={font} fontWeight={600} fill={tone.text}>
          {node.label}
        </text>,
      );
      top += CELL_H;
    }
    node.rows.forEach((row, r) => {
      let cx = left;
      const header = r === 0 && node.header !== false;
      const marked = node.mark?.includes(r);
      p.colWidths!.forEach((cw, c) => {
        cells.push(
          <rect
            key={`${r}-${c}`}
            x={cx}
            y={top + r * CELL_H}
            width={cw}
            height={CELL_H}
            fill={header ? tone.fill : marked ? '#fef3c7' : '#fff'}
            stroke={tone.stroke}
            strokeWidth={1}
          />,
          <text
            key={`${r}-${c}-t`}
            x={cx + cw / 2}
            y={top + r * CELL_H + CELL_H / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={font - 1}
            fontWeight={header ? 600 : 400}
            fill={header ? tone.text : '#262626'}
          >
            {row[c] ?? ''}
          </text>,
        );
        cx += cw;
      });
    });
    return <g>{cells}</g>;
  }

  let body: ReactNode = null;
  switch (node.shape) {
    case 'ellipse':
      body = <ellipse cx={x} cy={y} rx={w / 2} ry={h / 2} fill={fill} {...stroke} />;
      break;
    case 'diamond': {
      const o = diamondOutline(x, y, w, h);
      body = o.type === 'polygon' ? <path d={polygonPath(o.points)} fill={fill} {...stroke} /> : null;
      break;
    }
    case 'cylinder': {
      const ry = Math.min(10, h / 6);
      const l = x - w / 2;
      const r = x + w / 2;
      const t = y - h / 2 + ry;
      const b = y + h / 2 - ry;
      body = (
        <>
          <path
            d={`M${l} ${t} A${w / 2} ${ry} 0 0 0 ${r} ${t} L${r} ${b} A${w / 2} ${ry} 0 0 1 ${l} ${b} Z`}
            fill={fill}
            {...stroke}
          />
          <ellipse cx={x} cy={t} rx={w / 2} ry={ry} fill={fill} {...stroke} />
        </>
      );
      break;
    }
    case 'text':
      body = null;
      break;
    default:
      body = <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={4} fill={fill} {...stroke} />;
  }
  return (
    <g>
      {body}
      {node.label && (
        <Text
          x={x}
          y={node.shape === 'cylinder' ? y + Math.min(10, h / 6) * 0.8 : y}
          text={node.label}
          font={font}
          bold={node.bold}
          color={node.shape === 'text' ? tone.stroke === TONES.neutral.stroke ? '#525252' : tone.text : textColor}
        />
      )}
    </g>
  );
}

function Arrowhead({ tip, from, color }: { tip: Pt; from: Pt; color: string }) {
  const dx = tip.x - from.x;
  const dy = tip.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const size = 9;
  const base = { x: tip.x - ux * size, y: tip.y - uy * size };
  const n = { x: -uy, y: ux };
  const p1 = shift(base, n, size * 0.45);
  const p2 = shift(base, n, -size * 0.45);
  return <path d={`M${tip.x} ${tip.y} L${p1.x} ${p1.y} L${p2.x} ${p2.y} Z`} fill={color} stroke="none" />;
}

function Edge({ edge, from, to }: { edge: BlockEdge; from: Placed; to: Placed }) {
  const tone = TONES[edge.tone ?? 'neutral'];
  const color = tone.stroke;
  const via: Pt[] = (edge.via ?? []).map(([x, y]) => ({ x, y }));
  const cFrom = { x: from.x, y: from.y };
  const cTo = { x: to.x, y: to.y };
  const firstTarget = via[0] ?? cTo;
  const lastSource = via[via.length - 1] ?? cFrom;
  const a = anchor(from.outline, cFrom, firstTarget);
  const b = anchor(to.outline, cTo, lastSource);
  const pts = [a, ...via, b];
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const arrow = edge.arrow ?? 'end';

  // Label on the longest segment, nudged off the line.
  let best = 0;
  let bestLen = -1;
  for (let i = 0; i < pts.length - 1; i++) {
    const l = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
    if (l > bestLen) {
      bestLen = l;
      best = i;
    }
  }
  const mid = lerp(pts[best], pts[best + 1], 0.5);
  const off = labelOffset(pts[best], pts[best + 1]);
  const labelAt = { x: mid.x + off.x, y: mid.y + off.y };

  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray={edge.dashed ? '6 4' : undefined} />
      {(arrow === 'end' || arrow === 'both') && <Arrowhead tip={b} from={pts[pts.length - 2]} color={color} />}
      {arrow === 'both' && <Arrowhead tip={a} from={pts[1]} color={color} />}
      {edge.label && (
        <text
          x={labelAt.x}
          y={labelAt.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={edge.bold ? FONT : FONT - 1}
          fontWeight={edge.bold ? 700 : 400}
          paintOrder="stroke"
          stroke="#fff"
          strokeWidth={4}
          fill={edge.bold ? '#171717' : '#525252'}
        >
          {edge.label}
        </text>
      )}
    </g>
  );
}

export function BlockDiagram({ spec, compact }: { spec: BlockSpec; compact?: boolean }) {
  const placed = new Map<string, Placed>();
  const box = emptyBox();

  for (const g of spec.groups ?? []) {
    growBox(box, g.x, g.y, g.w + 4, g.h + 4);
  }
  for (const node of spec.nodes) {
    const m = measure(node);
    const outline =
      node.shape === 'ellipse' ? ellipseOutline(node.x, node.y, m.w, m.h)
      : node.shape === 'diamond' ? diamondOutline(node.x, node.y, m.w, m.h)
      : rectOutline(node.x, node.y, m.w, m.h);
    placed.set(node.id, { node, x: node.x, y: node.y, w: m.w, h: m.h, outline, colWidths: m.colWidths });
    growBox(box, node.x, node.y, m.w + 6, m.h + 6);
  }
  // Routed lines and their labels can stick out past every node.
  for (const e of spec.edges ?? []) {
    for (const [x, y] of e.via ?? []) growBox(box, x, y, 30, 30);
    if (e.label) {
      const from = placed.get(e.from);
      const to = placed.get(e.to);
      if (from && to) {
        const mid = lerp({ x: from.x, y: from.y }, { x: to.x, y: to.y }, 0.5);
        growBox(box, mid.x, mid.y, textWidth(e.label, FONT - 1) + 20, 40);
      }
    }
  }

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
          aria-label={spec.title ?? 'Schéma'}
          fontFamily="inherit"
        >
          {(spec.groups ?? []).map((g, i) => {
            const tone = TONES[g.tone ?? 'neutral'];
            return (
              <g key={i}>
                <rect
                  x={g.x - g.w / 2}
                  y={g.y - g.h / 2}
                  width={g.w}
                  height={g.h}
                  rx={6}
                  fill={tone.fill}
                  fillOpacity={0.45}
                  stroke={tone.stroke}
                  strokeWidth={1}
                  strokeDasharray={g.dashed === false ? undefined : '5 4'}
                />
                {g.label && (
                  <text
                    x={g.labelAlign === 'right' ? g.x + g.w / 2 - 8 : g.x - g.w / 2 + 8}
                    y={g.y - g.h / 2 + 12}
                    fontSize={FONT - 2}
                    fontWeight={600}
                    fill={tone.text}
                    dominantBaseline="central"
                    textAnchor={g.labelAlign === 'right' ? 'end' : 'start'}
                  >
                    {g.label}
                  </text>
                )}
              </g>
            );
          })}
          {[...placed.values()].map((p) => (
            <Shape key={p.node.id} p={p} />
          ))}
          {(spec.edges ?? []).map((e, i) => {
            const from = placed.get(e.from);
            const to = placed.get(e.to);
            if (!from || !to) return null;
            return <Edge key={i} edge={e} from={from} to={to} />;
          })}
        </svg>
      </div>
      {spec.title && (
        <figcaption className="mt-2 text-center text-sm text-neutral-500">{spec.title}</figcaption>
      )}
    </figure>
  );
}
