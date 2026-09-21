// Geometry shared by the lesson diagram renderers (E-R and block diagrams).
// Everything is plain numbers in SVG user units; the renderers turn the result
// into <path>/<text> elements.

export interface Pt {
  x: number;
  y: number;
}

/** A node's outline, in absolute coordinates, for line clipping. */
export type Outline =
  | { type: 'polygon'; points: Pt[] }
  | { type: 'ellipse'; cx: number; cy: number; rx: number; ry: number };

export function rectOutline(cx: number, cy: number, w: number, h: number): Outline {
  const hw = w / 2;
  const hh = h / 2;
  return {
    type: 'polygon',
    points: [
      { x: cx - hw, y: cy - hh },
      { x: cx + hw, y: cy - hh },
      { x: cx + hw, y: cy + hh },
      { x: cx - hw, y: cy + hh },
    ],
  };
}

export function diamondOutline(cx: number, cy: number, w: number, h: number): Outline {
  const hw = w / 2;
  const hh = h / 2;
  return {
    type: 'polygon',
    points: [
      { x: cx, y: cy - hh },
      { x: cx + hw, y: cy },
      { x: cx, y: cy + hh },
      { x: cx - hw, y: cy },
    ],
  };
}

/** Flat edge up, apex down — the ISA triangle. */
export function triangleOutline(cx: number, cy: number, w: number, h: number): Outline {
  const hw = w / 2;
  const hh = h / 2;
  return {
    type: 'polygon',
    points: [
      { x: cx - hw, y: cy - hh },
      { x: cx + hw, y: cy - hh },
      { x: cx, y: cy + hh },
    ],
  };
}

export function ellipseOutline(cx: number, cy: number, w: number, h: number): Outline {
  return { type: 'ellipse', cx, cy, rx: w / 2, ry: h / 2 };
}

function segmentIntersection(a: Pt, b: Pt, c: Pt, d: Pt): Pt | null {
  const r = { x: b.x - a.x, y: b.y - a.y };
  const s = { x: d.x - c.x, y: d.y - c.y };
  const denom = r.x * s.y - r.y * s.x;
  if (Math.abs(denom) < 1e-9) return null;
  const t = ((c.x - a.x) * s.y - (c.y - a.y) * s.x) / denom;
  const u = ((c.x - a.x) * r.y - (c.y - a.y) * r.x) / denom;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return { x: a.x + t * r.x, y: a.y + t * r.y };
}

/**
 * Where a line from the node's centre towards `target` leaves the outline.
 * Falls back to the centre when the target sits inside the shape.
 */
export function anchor(outline: Outline, center: Pt, target: Pt): Pt {
  if (outline.type === 'ellipse') {
    const dx = target.x - outline.cx;
    const dy = target.y - outline.cy;
    if (dx === 0 && dy === 0) return center;
    // Parametric: scale the direction until it lands on the ellipse.
    const k = 1 / Math.sqrt((dx * dx) / (outline.rx * outline.rx) + (dy * dy) / (outline.ry * outline.ry));
    return { x: outline.cx + dx * k, y: outline.cy + dy * k };
  }
  const pts = outline.points;
  let best: Pt | null = null;
  let bestDist = -1;
  for (let i = 0; i < pts.length; i++) {
    const hit = segmentIntersection(center, target, pts[i], pts[(i + 1) % pts.length]);
    if (!hit) continue;
    const dist = Math.hypot(hit.x - center.x, hit.y - center.y);
    if (dist > bestDist) {
      bestDist = dist;
      best = hit;
    }
  }
  return best ?? center;
}

/** Unit vector perpendicular (rotated +90°) to a→b. */
export function normal(a: Pt, b: Pt): Pt {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: -dy / len, y: dx / len };
}

export function lerp(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

export function shift(p: Pt, n: Pt, d: number): Pt {
  return { x: p.x + n.x * d, y: p.y + n.y * d };
}

/** Rough text width for auto-sizing boxes: the app font is ~0.6em per glyph. */
export function textWidth(text: string, fontSize = 13): number {
  const longest = text.split('\n').reduce((m, l) => Math.max(m, l.length), 0);
  return longest * fontSize * 0.62;
}

/**
 * Where to put a label next to the segment a→b: pushed off the line, above it
 * for a mostly horizontal line and to its right for a mostly vertical one, so
 * the choice does not flip with the drawing direction.
 */
export function labelOffset(a: Pt, b: Pt, d = 12): Pt {
  const n = normal(a, b);
  const vertical = Math.abs(n.y) < 0.3;
  const sign = vertical ? (n.x > 0 ? 1 : -1) : (n.y < 0 ? 1 : -1);
  return { x: n.x * sign * d, y: n.y * sign * d };
}

export function polygonPath(points: Pt[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';
}

export interface Box {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function emptyBox(): Box {
  return { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
}

export function growBox(b: Box, x: number, y: number, w: number, h: number): void {
  b.minX = Math.min(b.minX, x - w / 2);
  b.minY = Math.min(b.minY, y - h / 2);
  b.maxX = Math.max(b.maxX, x + w / 2);
  b.maxY = Math.max(b.maxY, y + h / 2);
}
