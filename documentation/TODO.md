# Status & Roadmap

## Completed Features

### Core
- [x] Categories with a name + accent color (12-token preset palette)
- [x] Category tree of unbounded depth, rooted at **School** and **Others**; a category
      holding children is a container (sub-category grid), a leaf holds the questions
- [x] One-shot `PRAGMA user_version` migration files an existing database's top-level
      categories under **Others**
- [x] Questions: 4 fixed choices (A/B/C/D), one correct answer
- [x] Optional Markdown lesson per leaf category (lazy-loaded renderer, inline SVG allowed)
- [x] Optional flashcard deck per leaf category
- [x] Seed script (`backend/src/db/seed.json`) bulk-imports content on first boot if the DB is empty

### Public
- [x] Landing page: 3-column responsive grid of category cards
- [x] Category page: sub-category grid for a container, breadcrumb to walk back up the tree
- [x] Category page: study-mode tiles (leçon / flashcards / quiz), each shown only if it has content
- [x] Flashcard session: flip, shuffle, su / pas su verdict, recap with a "rejouer les ratées" pile
- [x] Flashcard sources: own cards, quiz questions read as cards, or both
- [x] Category page: browse question list (text only, no answers revealed)
- [x] "Aléatoire" mode: shuffled quiz from a category, with 5/10/all count selector
- [x] "Par choix" mode: manually pick specific questions via checkboxes
- [x] Quiz session: one question at a time, immediate color feedback (green/red), progress bar
- [x] Results screen: score + per-question review, restart or return home

### Content management
- [x] All content authored in `backend/src/db/seed.json`, loaded once at first boot
- [x] No admin panel, no accounts, no login  the app is public and read-only
      (removed: it was a single shared-password + JWT dashboard)

### Backend  read-only + hardened for public traffic
- [x] Every route is a `GET`; no POST/PUT/DELETE anywhere
- [x] `helmet` (locked CSP, no `x-powered-by`)
- [x] `express-rate-limit` 120 req/min per client IP, `compression`
- [x] Socket timeouts: 15s request / 10s headers / 5s keep-alive (slowloris)
- [x] `ids` query param capped at 300, all ids validated as positive integers
- [x] Container: `read_only` rootfs + `tmpfs`, `cap_drop: ALL`, `no-new-privileges`,
      non-root `node` user, 256 MB / 0.75 CPU cap, healthcheck

### nginx
- [x] `limit_req` 60/min + `limit_conn` 20 per client, `client_max_body_size 8k`
- [x] Security headers (CSP, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`)
- [x] `/assets` served `immutable` with a 1-year cache so repeat hits skip Node

### Deployment
- [x] Docker Compose (`quizz-backend-estv` / `quizz-frontend-estv`, external `caddy_net`)
- [x] GitHub Actions deploy workflow (SSH + `make quizz-estv-update`)

## Not Yet Done / Possible Later

- [ ] Register `quizz-estv` under `vps-manager-estv/projects/` on the VPS (required once, outside this repo, before the deploy workflow can succeed)
- [ ] Fill in the **School** branch (subjects → courses → chapters)
- [ ] Quiz spanning a whole subtree (e.g. all of `IA` at once), not just one leaf
- [ ] Optional per-question difficulty tag (would need a seed.json field + a build step)
- [ ] Optional anonymous aggregate stats (% correct per question)  explicitly deferred, app is stateless by design for now
- [ ] Dark mode
