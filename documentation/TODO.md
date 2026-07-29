# Status & Roadmap

## Completed Features

### Core
- [x] Categories with a name + accent color (12-token preset palette)
- [x] Questions: 4 fixed choices (A/B/C/D), one correct answer
- [x] Seed script (`backend/src/db/seed.json`) bulk-imports content on first boot if the DB is empty

### Public
- [x] Landing page: 3-column responsive grid of category cards
- [x] Category page: browse question list (text only, no answers revealed)
- [x] "Aléatoire" mode: shuffled quiz from a category, with 5/10/all count selector
- [x] "Par choix" mode: manually pick specific questions via checkboxes
- [x] Quiz session: one question at a time, immediate color feedback (green/red), progress bar
- [x] Results screen: score + per-question review, restart or return home

### Admin
- [x] Single shared-password + JWT login (`/login`)
- [x] Admin dashboard: category CRUD (name + color swatches)
- [x] Admin dashboard: question CRUD (text, 4 choices, correct-answer picker) per category

### Backend
- [x] Public GET / admin-gated POST-PUT-DELETE split (bookmarks-estv pattern)
- [x] Rate limiting (general + stricter login limiter)
- [x] Fail-fast at boot if `AUTH_PASSWORD`/`JWT_SECRET` are missing (no silent insecure fallback)

### Deployment
- [x] Docker Compose (`quizz-backend-estv` / `quizz-frontend-estv`, external `caddy_net`)
- [x] GitHub Actions deploy workflow (SSH + `make quizz-estv-update`)

## Not Yet Done / Possible Later

- [ ] Register `quizz-estv` under `vps-manager-estv/projects/` on the VPS (required once, outside this repo, before the deploy workflow can succeed)
- [ ] Category reordering / question reordering within a category
- [ ] Bulk question import via the admin UI (currently only via `seed.json` at first boot)
- [ ] Optional per-question difficulty tag
- [ ] Optional anonymous aggregate stats (% correct per question) — explicitly deferred, app is stateless by design for now
- [ ] Dark mode
