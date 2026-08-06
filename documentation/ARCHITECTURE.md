# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                            │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   React Frontend                         │   │
│  │  - Public: landing (categories) → category → quiz        │   │
│  │  - Admin: Login Page (Password → JWT Token) → Dashboard  │   │
│  │  - Token stored in localStorage (admin only)              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                    HTTP Requests (+ JWT for admin writes)          │
│                              ▼                                    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Nginx (Port 80)                            │
│  - Serves static React files                                     │
│  - Proxies /api/* to backend                                     │
│  - HTTPS termination (via Caddy, separate project)                │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                Node/Express Backend (Port 8080)                    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Middleware Stack                             │   │
│  │  1. CORS                                                  │   │
│  │  2. Rate Limiting (5 login/min, 10000 general req/min)   │   │
│  │  3. JWT Auth (mutating routes only  GET is public)      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Route Handlers                            │   │
│  │  - /api/auth/login (public, rate limited)                │   │
│  │  - /api/categories (GET public, mutations JWT)            │   │
│  │  - /api/questions (GET public, mutations JWT)             │   │
│  │  - /api/questions/quiz (GET public, full answer data)     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 SQLite Database (better-sqlite3)          │   │
│  │  - categories, questions tables                            │   │
│  │  - seed.json bulk-imported on first boot if empty          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Model

```
┌──────────────────┐
│    categories     │
├──────────────────┤
│ id               │
│ name             │
│ slug             │
│ color (token)    │
│ created_at       │
│ updated_at       │
└──────────────────┘
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
│ created_at                        │
│ updated_at                        │
└──────────────────────────────────┘
```

## Authentication Flow

Single shared "admin" password, no user accounts  identical pattern across the whole `*-estv` app suite.

```
1. Admin enters password on /login
   │
   ▼
2. POST /api/auth/login { password }
   │
   ├── Invalid → 401
   │
   └── Valid → JWT (7-day expiry) signed with JWT_SECRET
        │
        ▼
3. Frontend stores token in localStorage
   │
   ▼
4. Admin mutations (POST/PUT/DELETE) send Authorization: Bearer <token>
   │
   ▼
5. authMiddleware validates the token
   │
   ├── Invalid/expired → 401 → frontend clears token, redirects to /login
   │
   └── Valid → request proceeds
```

Public GET routes (categories, questions, quiz) never require a token  anyone can browse and take quizzes without logging in. Only the site owner needs to authenticate, and only to manage content.

## Design decision: quiz answers are not a secured secret

The `/api/questions/quiz` endpoint returns full question data, including `correct_choice`, to anyone. There is no anti-cheat requirement here  the app is explicitly "anyone can access all this"  and quiz sessions are entirely stateless (no server-side attempt tracking), so there is nothing for a "check answer" endpoint to protect against. The frontend simply doesn't render `correct_choice` until after the user picks an answer. The separate brief endpoint (`GET /api/questions?category_id=`) exists purely for the browse view on the category page, so scrolling the question list before starting a quiz doesn't spoil answers you haven't reached yet.

## Content seeding

`backend/src/db/seed.json` is bulk-imported into SQLite on first boot only if the `categories` table is empty (`seedIfEmpty()` in `db/index.ts`). This lets a large batch of categories/questions be hand-authored in JSON up front. Once seeded (or once the admin creates anything), the database is the live, admin-editable source of truth  the seed file is never re-applied.

## Technology Stack

### Backend
- Node 20 + TypeScript (ESM), Express 4
- better-sqlite3 (synchronous, no ORM, raw SQL)
- jsonwebtoken (JWT), express-rate-limit, cors, dotenv

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
- **Rate limit exceeded** → HTTP 429, client retries.
- **JWT invalid/expired** → 401 on the next admin mutation; frontend clears the token and redirects to `/login`. Public browsing is unaffected either way.

## Logs

```bash
docker logs quizz-backend-estv
docker logs quizz-frontend-estv
docker logs -f quizz-backend-estv   # follow in real time
```
