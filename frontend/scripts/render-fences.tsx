// Dev helper: renders every ```er / ```diagram fence of a lesson file to PNG so
// figures can be proofread without the app. Not part of the build.
//
//   ../backend/node_modules/.bin/tsx scripts/render-fences.tsx <lesson.md> <outdir>
//
// Needs rsvg-convert (librsvg) on the PATH. Tailwind colour classes used by
// the renderers are inlined here since rsvg knows nothing about them.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ErDiagram } from '../src/components/diagram/ErDiagram';
import { BlockDiagram } from '../src/components/diagram/BlockDiagram';

const CLASS_COLORS: Record<string, string> = {
  'text-sky-600': '#0284c7',
  'text-amber-600': '#d97706',
  'text-violet-600': '#7c3aed',
  'text-emerald-600': '#059669',
  'text-neutral-500': '#737373',
};
const FILL_CLASSES: Record<string, string> = {
  'fill-neutral-800': '#262626',
  'fill-neutral-900': '#171717',
  'fill-neutral-600': '#525252',
};
const STROKE_CLASSES: Record<string, string> = { 'stroke-neutral-800': '#262626' };

function inlineClasses(svg: string): string {
  return svg.replace(/class="([^"]*)"/g, (_, cls: string) => {
    const attrs: string[] = [];
    for (const c of cls.split(/\s+/)) {
      if (CLASS_COLORS[c]) attrs.push(`color="${CLASS_COLORS[c]}"`);
      if (FILL_CLASSES[c]) attrs.push(`fill="${FILL_CLASSES[c]}"`);
      if (STROKE_CLASSES[c]) attrs.push(`stroke="${STROKE_CLASSES[c]}"`);
    }
    return attrs.join(' ');
  });
}

const [, , file, outDir] = process.argv;
const md = fs.readFileSync(file, 'utf8');
fs.mkdirSync(outDir, { recursive: true });
const fence = /```(er|diagram)[ \t]*\n([\s\S]*?)```/g;
let m: RegExpExecArray | null;
let n = 0;
while ((m = fence.exec(md)) !== null) {
  n++;
  const [, lang, body] = m;
  const spec = JSON.parse(body);
  const el = lang === 'er' ? createElement(ErDiagram, { spec }) : createElement(BlockDiagram, { spec });
  const html = renderToStaticMarkup(el);
  const svgMatch = /<svg[\s\S]*<\/svg>/.exec(html);
  if (!svgMatch) throw new Error(`figure ${n}: no svg`);
  let svg = inlineClasses(svgMatch[0]);
  const vb = /viewBox="([^"]+)"/.exec(svg)![1].split(' ').map(Number);
  svg = svg
    .replace('<svg', `<svg xmlns="http://www.w3.org/2000/svg" width="${vb[2] * 2}" height="${vb[3] * 2}" `).replace(/ style="max-width:[^"]*"/, "")
    .replace(/font-family="inherit"/, 'font-family="DejaVu Sans, Arial, sans-serif"');
  const base = path.join(outDir, `${String(n).padStart(2, '0')}-${lang}`);
  fs.writeFileSync(`${base}.svg`, svg);
  execFileSync('rsvg-convert', ['-b', 'white', '-o', `${base}.png`, `${base}.svg`]);
  console.log(`${base}.png  (${spec.title ?? ''})`);
}
console.log(`${n} figures`);
