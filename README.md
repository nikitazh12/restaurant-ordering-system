# Restaurant Ordering System

Групповой проект веб-сервиса доставки еды. Backend на FastAPI, Frontend на React/Vite.

## Быстрый запуск через Docker Compose

Перед запуском нужен файл `.env` в корне проекта. Реальные секреты не хранятся в репозитории: `.env` создается локально или на сервере и не коммитится.

```bash
cp .env.example .env
# заполнить значения в .env
docker compose up -d --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Swagger docs: http://localhost:8000/api/docs
- Database: Docker volume `postgres_data`

Остановить: `docker compose down`. Данные БД сохраняются в Docker volume.

## Технологический стек

**Backend**: Python 3.11, FastAPI, SQLAlchemy, PostgreSQL 16, JWT, Alembic
**Frontend**: React 19, Vite, React Router
**DevOps**: Docker, Docker Compose, GitHub Actions, nginx reverse proxy
**Testing**: Pytest (backend), ESLint (frontend)

## Разработка без Docker

**Backend**:
```bash
cd backend
python -m uvicorn main:app --reload
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

## Тестирование и линтинг

```bash
ruff check backend
pytest backend/tests
npm run lint --prefix frontend
npm run build --prefix frontend
```

## Деплой на VPS

Текущий сценарий рассчитан на локальную пересборку образов на сервере:

```bash
cd /home/deploy/apps/restaurant-ordering-system
./scripts/deploy.sh
```

На сервере реальные значения секретов находятся только в `.env`. Backend и frontend опубликованы только на `127.0.0.1`; внешний доступ идет через nginx reverse proxy:

- `https://food-diploma.ru` -> `http://127.0.0.1:3000`
- `https://food-diploma.ru/api` -> `http://127.0.0.1:8000/api`
- `https://food-diploma.ru/api/docs` -> `http://127.0.0.1:8000/api/docs`

## Backup БД

```bash
./scripts/backup_db.sh
```

Скрипт читает `POSTGRES_USER` и `POSTGRES_DB` из `.env`, сохраняет gzip backup в `backups/` и удаляет старые `.sql.gz` файлы старше 7 дней.

## CI/CD

- `.github/workflows/test.yml`: тесты и lint на pull request.
- `.github/workflows/publish.yml`: сборка и публикация Docker images на push в `main`.

Для production frontend image в GitHub Actions нужно завести variable `VITE_API_URL=https://food-diploma.ru/api`.
