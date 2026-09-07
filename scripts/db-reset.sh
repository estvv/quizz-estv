#!/usr/bin/env bash
#
# Recreate the SQLite database from backend/src/db/seed.json and restart the
# backend so the new content is live immediately.
#
#   ./scripts/db-reset.sh              # wipe + restart backend + follow logs
#   ./scripts/db-reset.sh --no-restart # just wipe the files
#   ./scripts/db-reset.sh --no-logs    # wipe + restart, don't tail logs
#
# `docker compose down -v` does NOT clear the DB: ./data is a bind mount, not a
# named volume, so quizz.db survives and seedIfEmpty() then sees a non-empty
# database and skips. This script removes the file for real, then bounces the
# backend  the connection is opened once at boot, so a restart is what makes
# the re-seed take effect.

set -euo pipefail
cd "$(dirname "$0")/.."

RESTART=1
LOGS=1
for arg in "$@"; do
  case "$arg" in
    --no-restart) RESTART=0 ;;
    --no-logs)    LOGS=0 ;;
    *) echo "unknown flag: $arg" >&2; exit 2 ;;
  esac
done

DB_DIR="./data"
FILES=(quizz.db quizz.db-wal quizz.db-shm)

echo "==> Removing $DB_DIR/quizz.db*"
mkdir -p "$DB_DIR"

need_container_rm=0
for f in "${FILES[@]}"; do
  [ -e "$DB_DIR/$f" ] || continue
  rm -f "$DB_DIR/$f" 2>/dev/null || need_container_rm=1
done

if [ "$need_container_rm" -eq 1 ]; then
  # The container runs as root, so quizz.db is root-owned on the host. Delete it
  # from inside a throwaway container instead of asking for sudo.
  echo "    (root-owned  removing via a container)"
  docker run --rm -v "$PWD/data:/data" alpine:3 \
    sh -c 'rm -f /data/quizz.db /data/quizz.db-wal /data/quizz.db-shm'
fi

if [ "$RESTART" -eq 0 ]; then
  echo "==> Database cleared. It re-seeds the next time the backend starts."
  exit 0
fi

if docker compose ps --status running backend 2>/dev/null | grep -q .; then
  echo "==> Restarting backend (re-seeds on boot)"
  docker compose restart backend
else
  echo "==> Starting backend (re-seeds on boot)"
  docker compose up -d backend
fi

# Wait for the seed line, so the script only returns once the DB is actually ready.
echo "==> Waiting for re-seed"
for _ in $(seq 1 30); do
  if docker compose logs --since 30s backend 2>&1 | grep -qE "Seeded .* exercises|FATAL"; then
    break
  fi
  sleep 1
done
docker compose logs --since 30s backend 2>&1 | grep -E "Seeded .* exercises|Database initialized|FATAL" || true

if [ "$LOGS" -eq 1 ]; then
  echo "==> Following backend logs (Ctrl-C to stop)"
  docker compose logs -f --tail=5 backend
fi
