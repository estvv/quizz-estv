#!/usr/bin/env bash
#
# Rebuild and start the stack with a database freshly seeded from
# backend/src/db/seed.json.
#
#   ./scripts/docker-up.sh
#
# Use this instead of `docker compose down -v && docker compose up --build`,
# which leaves the old ./data/quizz.db in place so the seed never re-runs.

set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> docker compose down"
docker compose down --remove-orphans

# Wipe the DB (handles the root-owned file case).
./scripts/db-reset.sh --no-restart

echo "==> docker compose up --build -d"
docker compose up --build -d

echo "==> Waiting for the backend to become healthy"
for i in $(seq 1 30); do
  status=$(docker inspect -f '{{.State.Health.Status}}' quizz-backend-estv 2>/dev/null || echo "starting")
  [ "$status" = "healthy" ] && break
  sleep 2
done

echo "==> Seed result:"
docker compose logs backend 2>&1 | grep -E "Seeded|Database initialized|FATAL" || true

echo
docker compose ps
echo
echo "Frontend: http://localhost:8091   (see docker-compose.override.yml)"
echo "Logs:     docker compose logs -f backend"
