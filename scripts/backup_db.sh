#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="/home/deploy/apps/restaurant-ordering-system"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_DIR/backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

cd "$PROJECT_DIR"

if [[ ! -f ".env" ]]; then
  echo "ERROR: .env file not found in $PROJECT_DIR" >&2
  exit 1
fi

set -a
source ".env"
set +a

required_vars=(POSTGRES_USER POSTGRES_DB)
for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    echo "ERROR: $var_name is not set in .env" >&2
    exit 1
  fi
done

mkdir -p "$BACKUP_DIR"
timestamp="$(date +%Y%m%d_%H%M%S)"
backup_file="$BACKUP_DIR/${POSTGRES_DB}_${timestamp}.sql.gz"

echo "Creating database backup: $backup_file"
docker compose exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$backup_file"

echo "Removing backups older than $RETENTION_DAYS days from $BACKUP_DIR"
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +"$RETENTION_DAYS" -delete

echo "Backup completed."
