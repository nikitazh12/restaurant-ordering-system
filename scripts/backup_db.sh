#!/bin/bash

set -e

BACKUP_DIR="$HOME/backups"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/restaurant_db_$DATE.sql"

mkdir -p "$BACKUP_DIR"

docker exec restaurant_db pg_dump -U postgres restaurant_db > "$BACKUP_FILE"

find "$BACKUP_DIR" -type f -name "restaurant_db_*.sql" -mtime +7 -delete

echo "Backup created: $BACKUP_FILE"
