# scripts/

`backend/src/db/seed.json` is the single source of truth for all content and is
**edited by hand**. These are the only helpers that remain:

| script | purpose |
|---|---|
| `build-korean-seed.py` | The one sanctioned seed generator. Regenerates the Korean branch (`kr` / `kr-*`) of `seed.json` from `documentation/coreen-vocab.md`, `documentation/coreen-hangeul-lesson.md` and `documentation/coreen-hangeul-letters.json`. Deterministic and idempotent. |
| `sync-lessons.py` | Copies `documentation/lessons/<key>.md` into the `lesson` field of the category with that `key`. Lessons that carry ```er / ```diagram / ```flowchart figures (see `documentation/DIAGRAMS.md`) are authored there, not in `seed.json`, because JSON inside Markdown inside JSON is unreadable. Touches nothing else; `--check` exits 1 when `seed.json` is stale. |
| `db-reset.sh` | Dev: wipe `data/quizz.db` and restart the backend so the seed re-runs. |
| `docker-up.sh` | Dev: rebuild the stack with a freshly seeded database. |

Every subject other than Korean is authored directly in `seed.json`, except the
lesson text of the categories that have a file under `documentation/lessons/`
(edit the file, run `sync-lessons.py`). There is no per-subject build script.
`frontend/scripts/render-fences.tsx` renders a lesson's figures to PNG for
proofreading (dev only, needs `rsvg-convert`).
