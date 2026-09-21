# Diagrams in lessons

A lesson is Markdown. Three ways to put a figure in it, from most to least
preferred:

| Fence | For | Rendered by |
|---|---|---|
| ```` ```er ```` | anything in **Chen E-R notation**: entities, attributes, relationships, ISA, cardinalities, participation | `frontend/src/components/diagram/ErDiagram.tsx` |
| ```` ```flowchart ```` | a **flowchart** in the course's notation (terminal, I/O, process, decision with yes/no exits) | `frontend/src/components/diagram/FlowchartDiagram.tsx` |
| ```` ```diagram ```` | generic **boxes and arrows**: architecture layers, trees, tables side by side, set mappings, sequence-style exchanges | `frontend/src/components/diagram/BlockDiagram.tsx` |
| inline `<svg>` | anything else (hand-drawn) | `rehype-raw`, as before |

All three fences hold **JSON**. The seed validates every fence at boot
(`validateLessonDiagrams` in `backend/src/db/index.ts`): bad JSON, an unknown
kind/shape, an edge pointing at a missing node → the backend refuses to start,
with the category name and figure number in the error.

Lessons that carry fences are authored as files under `documentation/lessons/`
(one per category `key`) and copied into `seed.json` with
`python3 scripts/sync-lessons.py`. Editing JSON-in-Markdown-in-JSON directly in
`seed.json` is not a good time.

## The same figures on exercises

An exercise (in `questions[]` or `exercises[]`) may carry the same JSON in two
optional fields:

```json
{
  "type": "mcq",
  "prompt": "What is the mapping cardinality of this relationship?",
  "figure": { "kind": "er", "spec": { "nodes": [...], "edges": [...] } },
  "choices": ["One-to-many (1 : N)", "..."], "correct": 0,
  "explanation": "...",
  "feedback_figure": { "kind": "diagram", "spec": { "nodes": [...], "edges": [...] } }
}
```

- `figure` is drawn **with the prompt** (MCQ and typed-answer exercises): a
  "read the diagram" question.
- `feedback_figure` is drawn **in the feedback block**, next to the
  explanation, for every exercise type.
- `kind` is `er`, `diagram` or `flowchart`; `spec` is exactly what the fence
  would hold. Both are validated at seed time like lesson fences.

The `er_build` and `flowchart_build` exercises also draw their expected answer
with these renderers (automatic layout) once graded.

## Proofreading without the app

```sh
cd frontend
../backend/node_modules/.bin/tsx scripts/render-fences.tsx ../documentation/lessons/school-db-w3.md /tmp/w3
```

writes one PNG per fence (needs `rsvg-convert`). The font differs slightly from
the app's, so leave a little slack in explicit widths. Every figure of a lesson
with more than a handful of nodes was proofread this way.

## Coordinates

- Every `x` / `y` is the **centre** of the node, in SVG user units. The viewBox
  is computed from the nodes (plus route corners and labels), so start at
  whatever origin you like; ~0–660 wide fits the lesson column at 1:1.
- Lines are clipped to the shapes' outlines, so they never enter a box; just
  point them at the node ids.
- Sizes are derived from the label unless `w` / `h` are given. Multi-line
  labels use `\n`.

## ```er

Same model as the `er_build` exercise `target`, plus layout and two lesson-only
line decorations:

```json
{
  "title": "Caption shown under the figure (optional).",
  "nodes": [
    { "id": "l",  "kind": "entity",                   "label": "loan",       "x": 150, "y": 160 },
    { "id": "ln", "kind": "key_attribute",            "label": "loan-no",    "x": 70,  "y": 50 },
    { "id": "lp", "kind": "identifying_relationship", "label": "L_P",        "x": 350, "y": 160 },
    { "id": "p",  "kind": "weak_entity",              "label": "payment",    "x": 560, "y": 160 },
    { "id": "pn", "kind": "partial_key_attribute",    "label": "payment-no", "x": 450, "y": 50 }
  ],
  "edges": [
    { "from": "l",  "to": "ln" },
    { "from": "l",  "to": "lp", "card": "1" },
    { "from": "lp", "to": "p",  "card": "N", "total": true },
    { "from": "p",  "to": "pn" }
  ]
}
```

| `kind` | Drawn as |
|---|---|
| `entity` | rectangle |
| `weak_entity` | double rectangle |
| `associative_entity` | rectangle with a diamond inside |
| `relationship` | diamond |
| `identifying_relationship` | double diamond |
| `attribute` | oval |
| `key_attribute` | oval, label underlined |
| `partial_key_attribute` | oval, label dashed-underlined (discriminator) |
| `multi_attribute` | double oval |
| `derived_attribute` | dashed oval |
| `isa` | triangle, flat edge up |

Edge fields: `card` (`"1"`, `"N"`, `"M"` — drawn near the entity end of a
relationship line), `total: true` (double line), `role` (text along the line).
Two edges between the same pair are allowed and drawn side by side — that is
how a recursive relationship shows its two roles. Node `x`/`y` are optional:
when missing, the whole graph is auto-laid-out (this is what the exercise
feedback uses to draw the expected answer; lesson figures should always be
placed by hand).

## ```flowchart

Same model as the `flowchart_build` exercise `target`, plus optional `x`/`y`:

```json
{
  "title": "Division avoiding division by zero.",
  "nodes": [
    { "id": "s",   "kind": "start",    "label": "START" },
    { "id": "in",  "kind": "io",       "label": "INPUT A, B" },
    { "id": "d",   "kind": "decision", "label": "Is B != 0 ?" },
    { "id": "q",   "kind": "process",  "label": "Q = A / B" },
    { "id": "out", "kind": "io",       "label": "DISPLAY Q" },
    { "id": "e",   "kind": "end",      "label": "END" }
  ],
  "edges": [
    { "from": "s", "to": "in" }, { "from": "in", "to": "d" },
    { "from": "d", "to": "q", "branch": "yes" }, { "from": "d", "to": "e", "branch": "no" },
    { "from": "q", "to": "out" }, { "from": "out", "to": "e" }
  ]
}
```

Kinds: `start`, `end` (pills), `io` (parallelogram), `process` (rectangle),
`decision` (diamond; `yes` leaves at the bottom, `no` at the right). Without
`x`/`y` the chart is laid out automatically: rows by longest path from START,
a `no` branch opens a column to the right, merges come back to the main
column, a loop (edge going back up) is routed around on the left. In a lesson
a decision may be drawn without its two exits (a legend); in an exercise
target it must have exactly one `yes` and one `no`.

## ```diagram

```json
{
  "title": "Optional caption.",
  "groups": [
    { "x": 330, "y": 190, "w": 300, "h": 58, "label": "Conceptual level", "tone": "amber", "labelAlign": "right" }
  ],
  "nodes": [
    { "id": "c",  "x": 330, "y": 200, "w": 160, "label": "Conceptual level", "tone": "amber", "filled": true },
    { "id": "db", "x": 330, "y": 390, "shape": "cylinder", "label": "Database" },
    { "id": "t",  "x": 150, "y": 45,  "shape": "table", "label": "Faculty", "size": 12,
      "rows": [["Emp_Name","Address"],["Prof. Lee","Busan"]], "mark": [1], "cols": [80, 70] },
    { "id": "n",  "x": 500, "y": 200, "shape": "note", "label": "a callout", "tone": "rose" },
    { "id": "p",  "x": 172, "y": 82,  "shape": "text" }
  ],
  "edges": [
    { "from": "c", "to": "db", "arrow": "both", "label": "mapping" },
    { "from": "n", "to": "p", "dashed": true, "via": [[500, 82]] }
  ]
}
```

- `shape`: `box` (default), `ellipse`, `diamond`, `cylinder`, `note` (tinted
  box), `text` (bare label; with no label it is an invisible anchor, handy to
  aim a callout at a table cell), `table` (`rows[][]`, first row is the
  header unless `header: false`; `mark` highlights rows; `cols` fixes column
  widths).
- `tone`: `neutral` (default), `sky`, `amber`, `violet`, `emerald`, `rose`.
  `filled: true` tints the background. `dashed`, `bold`, `size` (font px).
- Edges: `arrow` = `end` (default) / `both` / `none`; `label`; `bold` (for a
  cardinality mark); `dashed`; `via: [[x, y], …]` corner points for an
  orthogonal route; `tone`.
- Groups are dashed tinted rectangles drawn behind everything (`dashed: false`
  for a solid border).

Nodes are drawn first and edges on top, so a `via` route through a box is
visible — route around.
