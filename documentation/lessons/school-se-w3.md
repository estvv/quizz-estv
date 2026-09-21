# Software Engineering — Week 3

*Agile Software Engineering — Incremental development and Scrum.*

---

## 1. Product development and uncertainty

A **product vision** identifies the proposed product, its users, and the
value it should provide. Detailed features develop as the team learns more
about users, technology, and the product's environment.

Flow: `Product vision (What/Who/Why)` → `Candidate product features` → `A
small, tested product increment` → `Evaluation and new information`, which
feeds back into refining the features.

Incremental development gives users an early opportunity to evaluate working
software; their feedback can expose missing requirements and change the
order of future work.

## 2. Plan-driven vs agile development

| | Plan-driven development | Agile development |
|---|---|---|
| **Planning** | define substantial requirements and design detail before implementation | develop near-term detail and revise later work as knowledge grows |
| **Coordination** | documents support large teams, handovers, and long system lifetimes | frequent interaction supports rapid decisions and shared understanding |
| **Change** | revise affected plans and completed development work | use frequent increments to evaluate results and redirect work |

Detailed documentation can justify its cost in critical, long-lived systems.
Agile approaches reduce overhead in rapidly evolving products.

## 3. Incremental vs iterative development

- **Incremental development**: extend the product with additional usable
  functionality. Each new addition works with what the product already
  provides (`Feature A` → `A+B` → `A+B+C`).
- **Iterative development**: revisit and improve an existing result. A later
  cycle can refine requirements, change a design, or improve behaviour after
  evaluation (`Initial version` → `Evaluate` → `Revised version`).
- The two ideas can operate together: a cycle can add a feature while
  revising earlier work.

An increment adds a small amount of functionality: **select features → refine
descriptions → implement and test → integrate and test the system → deliver
and evaluate**, with feedback informing the next selection.

```diagram
{
  "title": "Incremental development adds usable functionality (A → A+B → A+B+C); iterative development revisits and improves an existing result.",
  "nodes": [
    { "id": "h1", "x": 170, "y": 10, "shape": "text", "label": "incremental", "bold": true },
    { "id": "h2", "x": 520, "y": 10, "shape": "text", "label": "iterative", "bold": true },
    { "id": "a", "x": 60, "y": 60, "w": 80, "h": 36, "label": "A", "tone": "emerald", "filled": true },
    { "id": "ab", "x": 190, "y": 60, "w": 90, "h": 36, "label": "A + B", "tone": "emerald", "filled": true },
    { "id": "abc", "x": 330, "y": 60, "w": 110, "h": 36, "label": "A + B + C", "tone": "emerald", "filled": true },
    { "id": "v1", "x": 480, "y": 60, "w": 110, "h": 40, "label": "initial\nversion", "tone": "sky", "filled": true, "size": 12 },
    { "id": "ev", "x": 640, "y": 60, "w": 90, "h": 36, "label": "evaluate", "tone": "amber", "filled": true, "size": 12 },
    { "id": "v2", "x": 640, "y": 140, "w": 110, "h": 40, "label": "revised\nversion", "tone": "sky", "filled": true, "size": 12 }
  ],
  "edges": [
    { "from": "a", "to": "ab", "label": "+ B" }, { "from": "ab", "to": "abc", "label": "+ C" },
    { "from": "v1", "to": "ev" }, { "from": "ev", "to": "v2" }, { "from": "v2", "to": "v1", "dashed": true, "label": "next cycle", "via": [[480, 140]] }
  ]
}
```

```diagram
{
  "title": "One increment: select features, refine, implement and test, integrate, deliver and evaluate — feedback drives the next selection.",
  "nodes": [
    { "id": "s1", "x": 70, "y": 60, "w": 100, "h": 44, "label": "select\nfeatures", "tone": "sky", "filled": true, "size": 12 },
    { "id": "s2", "x": 200, "y": 60, "w": 100, "h": 44, "label": "refine\ndescriptions", "tone": "sky", "filled": true, "size": 12 },
    { "id": "s3", "x": 330, "y": 60, "w": 100, "h": 44, "label": "implement\nand test", "tone": "amber", "filled": true, "size": 12 },
    { "id": "s4", "x": 460, "y": 60, "w": 100, "h": 44, "label": "integrate and\ntest the system", "tone": "amber", "filled": true, "size": 11 },
    { "id": "s5", "x": 590, "y": 60, "w": 100, "h": 44, "label": "deliver and\nevaluate", "tone": "emerald", "filled": true, "size": 12 }
  ],
  "edges": [
    { "from": "s1", "to": "s2" }, { "from": "s2", "to": "s3" }, { "from": "s3", "to": "s4" }, { "from": "s4", "to": "s5" },
    { "from": "s5", "to": "s1", "label": "feedback", "dashed": true, "via": [[590, 120], [70, 120]] }
  ]
}
```

## 4. Agile values and principles

The Agile Manifesto expresses **relative priorities** — each comparison
values both sides, with greater weight on the left:

| Greater emphasis | over | Also valuable |
|---|---|---|
| Individuals and interactions | over | Processes and tools |
| Working software | over | Comprehensive documentation |
| Customer collaboration | over | Contract negotiation |
| Responding to change | over | Following a plan |

Five agile principles:

| Principle | Meaning |
|---|---|
| Involve the customer | customers/representatives help prioritize requirements and evaluate increments |
| Embrace change | adapt features as users and developers learn more |
| Develop incrementally | develop, test, evaluate small additions; use feedback in later work |
| Maintain simplicity | reduce unnecessary complexity in software and process |
| Focus on people | trust capable team members to organize their own way of working |

## 5. Extreme Programming (XP) practices

| Practice | Mechanism |
|---|---|
| Incremental planning | select work for the next increment through discussion and relative priority |
| Small releases | deliver a useful subset of functionality, add capability over time |
| Test-driven development | write a test for required behaviour before coding; rerun tests after changes |
| Continuous integration | integrate completed changes frequently, check the combined system automatically |
| Refactoring | improve code structure while preserving its externally observable behaviour |

## 6. The Scrum framework

Scrum organizes complex product development around short **Sprints** and
regular inspection: `Ordered product work` → `Sprint planning and work` →
`Usable Increment` → `Inspection and adaptation`, which updates future work.

**Empiricism and the three pillars** (each supports the next):

`Transparency` (make work, results, quality visible) → `Inspection` (examine
artifacts and progress toward agreed goals) → `Adaptation` (adjust work or
process when inspection reveals a problem) → feeds back into transparency.

```diagram
{
  "title": "Empiricism: the three pillars of Scrum feed one another in a loop.",
  "nodes": [
    { "id": "t", "x": 110, "y": 60, "w": 150, "h": 50, "label": "Transparency\nwork and results visible", "tone": "sky", "filled": true, "size": 11 },
    { "id": "i", "x": 340, "y": 60, "w": 150, "h": 50, "label": "Inspection\nexamine artifacts, progress", "tone": "amber", "filled": true, "size": 11 },
    { "id": "a", "x": 570, "y": 60, "w": 150, "h": 50, "label": "Adaptation\nadjust work or process", "tone": "emerald", "filled": true, "size": 11 }
  ],
  "edges": [
    { "from": "t", "to": "i" }, { "from": "i", "to": "a" },
    { "from": "a", "to": "t", "dashed": true, "via": [[570, 125], [110, 125]] }
  ]
}
```

**Scrum values**: Commitment, Focus, Openness, Respect, Courage.

## 7. Scrum Team accountabilities

A self-managing Scrum Team combines complementary skills and three
accountabilities:

| Accountability | Primary responsibilities |
|---|---|
| Product Owner | maximize product value; communicate direction; keep the Product Backlog ordered and understandable |
| Developers | create a usable Increment; plan the Sprint's work; uphold quality; adapt the plan as development progresses |
| Scrum Master | help establish Scrum and improve team effectiveness; coach the team; help remove impediments |

**Self-managing** means the team decides who does what, when, and how — the
accountabilities do not create a command hierarchy.

## 8. Artifacts and commitments

| Artifact | Content | Commitment |
|---|---|---|
| Product Backlog | ordered, evolving list of improvements | Product Goal (longer-term direction) |
| Sprint Backlog | work and delivery plan for one Sprint | Sprint Goal (one Sprint's objective) |
| Increment | integrated, usable work | Definition of Done (required product quality) |

- The **Product Backlog** can contain new features, defect corrections,
  technical improvements, and investigation of uncertain work.
- The **Product Goal** describes a future product state; near-term items are
  detailed, further ones stay broad.
- **Backlog refinement**: a broad item is discussed, clarified, and divided
  until it is detailed enough to be selected for a Sprint.
- An **Increment** adds verified, usable work; a Sprint can produce several
  Increments.
- The **Definition of Done** states the quality conditions completed work
  must satisfy; work not meeting it stays visible as unfinished.

## 9. The Sprint and its events

A **Sprint** is a fixed period of one month or less, containing planning,
development, inspection, and improvement.

| Event | Purpose |
|---|---|
| **Sprint Planning** | the team defines Why (Sprint Goal), What (selected Product Backlog items), and How (the Developers' actionable plan); max 8 hours for a one-month Sprint |
| **Daily Scrum** | 15-minute daily event: inspect progress toward the Sprint Goal, adapt the plan for the day |
| **Sprint Review** | Scrum Team and stakeholders inspect the outcome and discuss what to do next |
| **Sprint Retrospective** | the team examines its own process — collaboration, tools, quality — and chooses useful changes to how it works |

**Sprint Review vs Sprint Retrospective**:

| | Sprint Review | Sprint Retrospective |
|---|---|---|
| Main focus | product outcome and progress toward the Product Goal | development process, collaboration, quality |
| Participants | Scrum Team and relevant stakeholders | Scrum Team only |
| Adaptation | revises the direction and order of future product work | improves the team's way of working |

## 10. The integrated Scrum cycle

`Product Backlog / Product Goal` → `Sprint Planning` → `Sprint Backlog /
Sprint Goal` → `Development and Daily Scrum` → `Increment meets DoD` →
`Sprint Review (product and future work)` → `Sprint Retrospective
(development process)` → process improvements feed the next Sprint's
Planning, while the Review's findings feed the Product Backlog.

```diagram
{
  "title": "The integrated Scrum cycle: the Review feeds the Product Backlog, the Retrospective feeds the next Planning.",
  "groups": [
    { "x": 440, "y": 185, "w": 530, "h": 250, "label": "Sprint (≤ 1 month)", "tone": "amber" }
  ],
  "nodes": [
    { "id": "pb", "x": 90, "y": 60, "w": 140, "h": 50, "label": "Product Backlog\nProduct Goal", "tone": "violet", "filled": true, "size": 11 },
    { "id": "pl", "x": 330, "y": 100, "w": 130, "h": 40, "label": "Sprint Planning", "tone": "amber", "filled": true, "size": 11 },
    { "id": "sb", "x": 520, "y": 100, "w": 130, "h": 50, "label": "Sprint Backlog\nSprint Goal", "tone": "sky", "filled": true, "size": 11 },
    { "id": "dev", "x": 520, "y": 190, "w": 150, "h": 50, "label": "Development\n+ Daily Scrum (15 min)", "tone": "sky", "filled": true, "size": 11 },
    { "id": "inc", "x": 520, "y": 270, "w": 150, "h": 44, "label": "Increment\nmeets the DoD", "tone": "emerald", "filled": true, "size": 11 },
    { "id": "rev", "x": 330, "y": 270, "w": 130, "h": 44, "label": "Sprint Review\n(product)", "tone": "amber", "filled": true, "size": 11 },
    { "id": "ret", "x": 190, "y": 270, "w": 110, "h": 44, "label": "Retrospective\n(process)", "tone": "amber", "filled": true, "size": 11 }
  ],
  "edges": [
    { "from": "pb", "to": "pl" }, { "from": "pl", "to": "sb" }, { "from": "sb", "to": "dev" }, { "from": "dev", "to": "inc" }, { "from": "inc", "to": "rev" }, { "from": "rev", "to": "ret" },
    { "from": "rev", "to": "pb", "dashed": true, "label": "future work", "tone": "violet", "via": [[330, 200], [90, 200]] },
    { "from": "ret", "to": "pl", "dashed": true, "label": "process improvements", "tone": "amber", "via": [[190, 340], [720, 340], [720, 40], [330, 40]] }
  ]
}
```

---

## To remember

- Plan-driven plans everything up front; agile plans near-term detail and
  revises as it learns, through frequent increments.
- Agile Manifesto: individuals/interactions, working software, customer
  collaboration, responding to change are valued *more* — not *instead of*
  their counterparts.
- Scrum's three accountabilities: **Product Owner** (value, backlog order),
  **Developers** (build the Increment), **Scrum Master** (coach, remove
  impediments) — self-managing, no hierarchy.
- Three artifacts, each with a commitment: Product Backlog ↔ Product Goal,
  Sprint Backlog ↔ Sprint Goal, Increment ↔ Definition of Done.
- Four Sprint events in order: **Planning → Daily Scrum (repeated) → Review →
  Retrospective**. Review looks at the *product*; Retrospective looks at the
  *process*.
