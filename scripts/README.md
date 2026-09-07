# scripts/

`backend/src/db/seed.json` is the single source of truth for all content and is
**edited by hand**. These are the only helpers that remain:

| script | purpose |
|---|---|
| `build-korean-seed.py` | The one sanctioned seed generator. Regenerates the Korean branch (`kr` / `kr-*`) of `seed.json` from `documentation/coreen-vocab.md`, `documentation/coreen-hangeul-lesson.md` and `documentation/coreen-hangeul-letters.json`. Deterministic and idempotent. |
| `db-reset.sh` | Dev: wipe `data/quizz.db` and restart the backend so the seed re-runs. |
| `docker-up.sh` | Dev: rebuild the stack with a freshly seeded database. |

Every subject other than Korean is authored directly in `seed.json`. There is no
per-subject build script.
