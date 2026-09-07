import type { Exercise, TypeAnswerPayload, FlowchartGraph } from '../types';

// Fold Latin diacritics only  never touch Hangul.
function foldLatin(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

type NormalizeMode = 'loose' | 'romaja';

export function normalizeAnswer(raw: string, mode: NormalizeMode = 'loose'): string {
  let s = foldLatin(raw.normalize('NFC').trim().toLowerCase());
  s = s.replace(/\s+/g, ' ');
  if (mode === 'romaja') {
    s = s.replace(/[\s-]+/g, '');
  }
  return s;
}

export function matchesAccept(accept: string[], input: string, mode: NormalizeMode = 'loose'): boolean {
  const got = normalizeAnswer(input, mode);
  if (got === '') return false;
  return accept.some((a) => normalizeAnswer(a, mode) === got);
}

export function isTypeAnswerCorrect(payload: TypeAnswerPayload, input: string): boolean {
  return matchesAccept(payload.accept, input, payload.normalize ?? 'loose');
}

/**
 * Normalisation for pseudo-code lines and flowchart labels: case-insensitive,
 * whitespace-insensitive, and operator synonyms folded so `IF A ≠ 0`, `if a!=0`
 * and `IF A <> 0` all compare equal. Strict on everything else.
 */
export function normalizeCode(raw: string): string {
  let s = foldLatin(raw.normalize('NFC').trim().toLowerCase());
  s = s
    .replace(/≠|<>/g, '!=')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/←|:=|==/g, '=')
    .replace(/\bmod\b/g, '%')
    .replace(/\band\b/g, '&&')
    .replace(/\bor\b/g, '||')
    .replace(/[?.]+$/g, '');
  return s.replace(/\s+/g, '');
}

function normalizeLines(text: string): string[] {
  return text.split('\n').map((l) => l.trim()).filter((l) => l !== '');
}

// --- flowchart graph comparison (topology only) ---

interface UserGraph {
  nodes: { id: string; kind: string; label: string }[];
  edges: { from: string; to: string; branch?: 'yes' | 'no' }[];
}

function nodeKey(n: { kind: string; label: string }): string {
  return `${n.kind}::${normalizeCode(n.label)}`;
}

function edgeKey(from: string, to: string, branch?: string): string {
  return `${from}→${to}:${branch ?? ''}`;
}

export function flowchartMatches(user: UserGraph, target: FlowchartGraph): boolean {
  if (user.nodes.length !== target.nodes.length || user.edges.length !== target.edges.length) {
    return false;
  }
  const userEdgeSet = new Set(user.edges.map((e) => edgeKey(e.from, e.to, e.branch)));

  // Backtracking bijection target node -> user node, constrained by node key.
  const map: Record<string, string> = {};
  const used = new Set<string>();

  function edgesOk(): boolean {
    const translated = target.edges.map((e) => edgeKey(map[e.from], map[e.to], e.branch));
    return translated.length === userEdgeSet.size && translated.every((k) => userEdgeSet.has(k));
  }

  function bt(i: number): boolean {
    if (i === target.nodes.length) return edgesOk();
    const t = target.nodes[i];
    for (const u of user.nodes) {
      if (used.has(u.id) || nodeKey(u) !== nodeKey(t)) continue;
      map[t.id] = u.id;
      used.add(u.id);
      if (bt(i + 1)) return true;
      used.delete(u.id);
    }
    return false;
  }
  return bt(0);
}

// --- grading ---

export interface Grade {
  correct: boolean;
  /** The correct answer spelled out, for the review list. */
  answer: string;
}

export type Response =
  | number
  | number[]
  | string
  | { sens: string; prononciation: string }
  | UserGraph
  | null;

function describeFlowchart(g: FlowchartGraph): string {
  const byId = new Map(g.nodes.map((n) => [n.id, n.label]));
  const lines = g.edges.map((e) => {
    const b = e.branch ? ` [${e.branch === 'yes' ? 'oui' : 'non'}]` : '';
    return `${byId.get(e.from)} → ${byId.get(e.to)}${b}`;
  });
  return lines.join('\n');
}

export function gradeExercise(exercise: Exercise, response: Response): Grade {
  switch (exercise.type) {
    case 'mcq': {
      const { choices, correct } = exercise.payload;
      return { correct: response === correct, answer: choices[correct] };
    }
    case 'type_answer': {
      const input = typeof response === 'string' ? response : '';
      return { correct: isTypeAnswerCorrect(exercise.payload, input), answer: exercise.payload.accept[0] };
    }
    case 'vocab': {
      const { fr, ko, rr } = exercise.payload;
      const sens = response && typeof response === 'object' && 'sens' in response ? response.sens : '';
      return { correct: matchesAccept(fr, sens, 'loose'), answer: `${ko} = ${rr} = ${fr[0]}` };
    }
    case 'order_steps': {
      const { items, solution } = exercise.payload;
      const arrangement = Array.isArray(response) ? (response as number[]) : [];
      const correct =
        arrangement.length === solution.length &&
        arrangement.every((v, i) => v === solution[i]);
      return { correct, answer: solution.map((idx) => items[idx]).join('\n') };
    }
    case 'write_algorithm': {
      const { steps } = exercise.payload;
      const model = steps.map((forms) => forms[0]).join('\n');
      const lines = typeof response === 'string' ? normalizeLines(response) : [];
      if (lines.length !== steps.length) return { correct: false, answer: model };
      const correct = lines.every((line, i) =>
        steps[i].some((form) => normalizeCode(form) === normalizeCode(line))
      );
      return { correct, answer: model };
    }
    case 'flowchart_build': {
      const { target } = exercise.payload;
      const user = response && typeof response === 'object' && 'nodes' in response
        ? (response as UserGraph)
        : { nodes: [], edges: [] };
      return { correct: flowchartMatches(user, target), answer: describeFlowchart(target) };
    }
  }
}
