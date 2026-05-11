#!/bin/bash

# Move to the backend directory where alembic.ini is
cd /app/backend

# Wait for database
echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 0.5
done
echo "Database is up!"

echo "Running migrations..."
alembic upgrade head

echo "Starting server..."
# Run from /app so that 'backend.main' works
cd /app
uvicorn backend.main:app --host 0.0.0.0 --port 8000
