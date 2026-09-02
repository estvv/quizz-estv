# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                            │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   React Frontend (static)                │   │
│  │  landing (categories) → category → lesson / flashcards   │   │
│  │  / quiz. No accounts, no login, nothing written back.     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                       HTTP GET requests only                       │
│                              ▼                                    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Nginx (Port 80)                            │
│  - Serves static React files (long-cache /assets, CSP + headers) │
│  - Proxies /api/* to backend                                     │
│  - limit_req 60/min per client, limit_conn 20, body cap 8k       │
│  - HTTPS termination + first rate-limit layer via Caddy (separate)│
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                Node/Express Backend (Port 8080)                    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Middleware Stack                             │   │
│  │  1. helmet (locked-down CSP, no x-powered-by)            │   │
│  │  2. compression                                          │   │
│  │  3. Rate limiting (120 req/min per client IP)            │   │
│  │  4. 15s request / 10s headers / 5s keep-alive timeouts   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            Route Handlers  ALL read-only (GET)            │   │
│  │  - GET /api/categories            (list + one)            │   │
│  │  - GET /api/categories/:id/lesson (Markdown body)         │   │
│  │  - GET /api/questions             (brief browse list)     │   │
│  │  - GET /api/questions/quiz        (full data, ids cap 300)│   │
│  │  - GET /api/flashcards            (deck for a category)   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 SQLite Database (better-sqlite3)          │   │
│  │  - categories (tree), questions, flashcards tables        │   │
│  │  - seed.json bulk-imported on first boot if empty          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Model

```
              ┌─ parent_id (FK → categories.id), self-referencing
              │
        ┌─────┴────────────┐
        │    categories     │
        ├──────────────────┤
        │ id               │
        │ name             │
        │ slug             │
        │ color (token)    │
        │ parent_id (NULL = root)  │
        │ lesson (Markdown, nullable) │
        │ created_at       │
        │ updated_at       │
        └──────────────────┘
                │
                ├──────────────── ON DELETE CASCADE ────────────┐
                │                                               ▼
                │                            ┌──────────────────────────┐
                │                            │        flashcards         │
                │                            ├──────────────────────────┤
                │                            │ id                        │
                │                            │ category_id (FK)          │
                │                            │ front / back              │
                │                            │ position                  │
                │                            │ created_at / updated_at   │
                │                            └──────────────────────────┘
                │
                │ ON DELETE CASCADE
                ▼
┌──────────────────────────────────┐
│             questions             │
├──────────────────────────────────┤
│ id                                │
│ category_id (FK → categories.id)  │
│ question_text                     │
│ choice_a / choice_b / choice_c / choice_d │
│ correct_choice (A|B|C|D)          │
│ explanation (nullable)            │
│ diagram_svg (nullable)            │
│ created_at                        │
│ updated_at                        │
└──────────────────────────────────┘
```

### The category tree

Categories form a self-referencing tree of **unbounded depth**, rooted at two
top-level categories: **School** (coursework) and **Others** (everything else).

```
School                          Others
 └─ Mathématiques                └─ Rust
     └─ Algèbre linéaire         └─ IA
         └─ questions                └─ Deep Learning
                                         └─ questions
```

Two rules hold the shape together:

- **A category is either a container or a leaf, never both.** Study material 
  lesson, flashcards and questions alike  lives only on leaves. The public
  category page shows a container's sub-categories *instead of* its content, so
  anything attached directly to a container would be unreachable. This is enforced
  on both sides: the content routes reject a write to a category that has children
  (`categoryHasChildren`), and `validateParentId` refuses to give children to a
  category that already holds content (`categoryHasContent`). Clearing a lesson
  stays allowed either way, so a category can always be emptied and then nested.
  Question counts shown on a container are the recursive sum over its subtree.
- **The tree stays a tree.** `validateParentId` (`routes/categories.ts`) walks
  the `parent_id` chain upward via `getAncestorIds` and rejects any move that
  would put a category under itself or under one of its own descendants.

Deleting a category deletes its **entire subtree**. The `parent_id` foreign key
is `ON DELETE SET NULL`, which would otherwise strand children at the top level,
so the cascade is done in application code (`deleteSubtree` in `db/index.ts`),
inside a transaction. Each category's questions still cascade off its own row.

The tree is served as one flat, name-sorted list from `GET /api/categories`; the
frontend assembles it via `frontend/src/utils/categoryTree.ts` (`buildCategoryTree`,
`getAncestors` for the breadcrumb).

## Study material: lesson, flashcards, quiz

A leaf category offers up to three modes, and the category page shows only the
ones that have content  a category holding just a quiz looks exactly as it did
before lessons and flashcards existed.

| Mode | Storage | Route |
|---|---|---|
| Lesson | `categories.lesson` (Markdown) | `/category/:id/lesson` |
| Flashcards | `flashcards` table | `/category/:id/flashcards?source=` |
| Quiz | `questions` table | `/quiz` (existing) |

### Why the lesson is a column but never in the list

A lesson is one body per category, so it is a column rather than a table. But
`GET /api/categories` returns *every* category and is fetched on every page, so
the category queries select an explicit column list that **excludes `lesson`** and
expose only a `has_lesson` flag (plus `question_count` and `flashcard_count`, as
correlated subqueries  two LEFT JOINs would multiply each other's rows and
inflate both counts). The body is fetched on its own from
`GET /api/categories/:id/lesson`.

Markdown is rendered by `components/lesson/Markdown.tsx`, which lazy-loads the
react-markdown stack: those plugins are ~326 kB, larger than the rest of the app,
and only the lesson page ever needs them. `rehype-raw` keeps inline HTML so a
lesson can embed `<svg>`. This is safe here because lesson content is not
user-supplied  it ships in `seed.json`, baked into the image.

### Flashcard sources

A session draws cards from either of two sources, chosen with `?source=`:

- `cards`  the category's own `flashcards` rows, authored in `seed.json`.
- `quiz`  each question read as a card: the prompt on the front, the correct
  choice spelled out (plus the explanation) on the back. Costs no authoring, so
  the existing question bank is reviewable as cards straight away.
- `all`  both decks concatenated.

Verdicts ("su" / "pas su") live in component state and are never sent anywhere,
matching the stateless design decision below: the recap and the "rejouer les
ratées" pile exist only for the duration of the session.

## Security posture

The app is a **public, read-only site**. There is no admin panel, no accounts, no
login, and no write endpoint of any kind  every route is a `GET`. All content is
authored in `backend/src/db/seed.json` and loaded once at first boot; changing it
means editing the file and redeploying.

That removes almost the entire attack surface (no auth to break, no injection
sink, no secrets to leak). What is left is resource exhaustion, handled in layers:

| Layer | Control |
|---|---|
| Caddy (separate project) | TLS, and ideally a first coarse rate limit / bot filter |
| nginx | `limit_req` 60/min per client, `limit_conn` 20, `client_max_body_size 8k`, short client timeouts, static-asset caching so repeat hits never reach Node |
| Express | `helmet` headers, `express-rate-limit` 120/min per client IP, 15s/10s/5s socket timeouts (slowloris), `ids` list capped at 300, all ids validated as positive ints |
| Container | `read_only` rootfs + `tmpfs`, `cap_drop: ALL`, `no-new-privileges`, non-root `node` user, 256 MB / 0.75 CPU cap, restart-on-crash |

Client IP for rate limiting comes from `X-Forwarded-For`: Caddy sets it, nginx
appends with `$proxy_add_x_forwarded_for`, and Express is configured with
`trust proxy = 2` to read the client end of that two-hop chain. **If the proxy
chain in front changes, update `trust proxy` in `backend/src/index.ts` and the
`X-Forwarded-For` handling in `nginx.conf` together**, or every visitor collapses
into one rate-limit bucket.

SQLite is opened once at boot and only ever read afterwards. `better-sqlite3` uses
parameterised statements everywhere; the one dynamic fragment is an `IN (?, ?, )`
placeholder list whose values are still bound, not interpolated.

## Design decision: quiz answers are not a secured secret

The `/api/questions/quiz` endpoint returns full question data, including `correct_choice`, to anyone. There is no anti-cheat requirement here  the app is explicitly "anyone can access all this"  and quiz sessions are entirely stateless (no server-side attempt tracking), so there is nothing for a "check answer" endpoint to protect against. The frontend simply doesn't render `correct_choice` until after the user picks an answer. The separate brief endpoint (`GET /api/questions?category_id=`) exists purely for the browse view on the category page, so scrolling the question list before starting a quiz doesn't spoil answers you haven't reached yet.

## Content seeding

`backend/src/db/seed.json` is bulk-imported into SQLite on first boot only if the `categories` table is empty (`seedIfEmpty()` in `db/index.ts`). This lets a large batch of categories/questions be hand-authored in JSON up front. Once seeded, the database is only ever read. To change content, edit `seed.json`, wipe `data/quizz.db`, and redeploy  the seed runs again on the now-empty database.

A seed entry names its parent by `name`, not by id, so the file stays hand-editable. `seedIfEmpty()` resolves those in repeated passes  each pass inserts every category whose parent is already in  which handles any depth and any declaration order, and throws on an unknown or cyclic parent rather than silently filing the category at the root.

### One-shot restructure of an existing database

Seeding only ever runs on an empty database, so an already-deployed instance
needs a migration to reach the rooted tree. `migrateToRootedTree()` creates the
**School** and **Others** roots and files every existing top-level category under
**Others** (leaving deeper nesting, such as `IA → Deep Learning`, untouched  it
simply becomes one level deeper).

This is gated on `PRAGMA user_version` rather than on "does a category named
Others exist", which makes it strictly one-shot: renaming or deleting either root
afterwards must not resurrect it  and must not re-parent `School` under `Others`
 on the next boot.

## Technology Stack

### Backend
- Node 20 + TypeScript (ESM), Express 4
- better-sqlite3 (synchronous, no ORM, raw SQL)
- helmet, compression, express-rate-limit, dotenv

### Frontend
- React 19 + TypeScript, Vite, react-router-dom v6
- Tailwind CSS v4, Plus Jakarta Sans font
- No global state library  local component state + fetch wrappers

### Infrastructure
- Docker + Docker Compose, Nginx (frontend container), Caddy (shared reverse proxy, separate project)
- SQLite file on a bind-mounted volume (`./data:/app/data`)

## Failure Modes

- **Backend crash** → `restart: unless-stopped` restarts the container; SQLite file persists on the mounted volume, no data loss.
- **Frontend crash** → container restart; static files have no state to lose.
- **Rate limit exceeded** → HTTP 429 (or 503 from nginx `limit_req`), client retries.
- **Slow/stalled connection** → dropped after the socket timeout, no worker held.

## Logs

```bash
docker logs quizz-backend-estv
docker logs quizz-frontend-estv
docker logs -f quizz-backend-estv   # follow in real time
```
