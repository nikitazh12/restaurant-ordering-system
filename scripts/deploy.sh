#!/bin/bash

set -e

PROJECT_DIR="/home/deploy/apps/restaurant-ordering-system"

cd "$PROJECT_DIR"

git pull origin main
docker compose up -d --build
docker compose ps
