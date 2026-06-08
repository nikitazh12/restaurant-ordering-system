#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="/home/deploy/apps/restaurant-ordering-system"
cd "$PROJECT_DIR"

if [[ ! -f ".env" ]]; then
  echo "ERROR: .env file not found in $PROJECT_DIR" >&2
  echo "Create it with the variables listed in docs/SERVER_DEPLOY_CHANGES.md." >&2
  exit 1
fi

echo "Pulling latest code..."
git pull --ff-only

echo "Validating Docker Compose configuration..."
docker compose config >/dev/null

echo "Pulling latest images from registry..."
docker compose pull

echo "Recreating services..."
if ! docker compose up -d; then
  echo "ERROR: docker compose up failed. Last backend logs:" >&2
  docker compose logs -n 100 backend >&2 || true
  exit 1
fi

echo "Removing dangling images..."
docker image prune -f >/dev/null || true

echo "Current service status:"
docker compose ps
