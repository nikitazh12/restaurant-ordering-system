## Production deployment

Проект развернут на VPS-сервере под управлением Ubuntu 22.04 LTS.

Для публикации приложения использованы:

* Docker и Docker Compose для контейнеризации backend, frontend и PostgreSQL;
* nginx в роли reverse proxy;
* домен `food-diploma.ru`;
* HTTPS-сертификат Let's Encrypt;
* UFW для ограничения входящих подключений;
* GitHub Actions для автоматической проверки проекта и публикации Docker-образов;
* Docker Hub для хранения собранных образов backend и frontend;
* cron и `pg_dump` для резервного копирования базы данных.

Production-схема развертывания:

* frontend доступен через `https://food-diploma.ru`;
* backend API проксируется через `https://food-diploma.ru/api`;
* Swagger/OpenAPI документация доступна через `https://food-diploma.ru/docs`;
* PostgreSQL работает внутри Docker-сети и не опубликован наружу;
* наружу открыты только порты `22`, `80`, `443`.

### Environment variables

Для запуска проекта используется файл `.env`. Реальный `.env` не хранится в репозитории, так как содержит секретные значения. Пример переменных находится в `.env.example`.

### CI/CD

В репозитории настроен workflow GitHub Actions. При изменениях в ветке `main` выполняются:

* проверка backend;
* проверка frontend;
* сборка и публикация Docker-образов в Docker Hub.

Docker-образы публикуются только после успешного прохождения проверок backend и frontend.

### Deploy

Для обновления приложения на сервере используется скрипт:

```bash
./scripts/deploy.sh
```

Скрипт получает актуальную версию проекта из GitHub, пересобирает Docker-контейнеры и запускает сервисы через Docker Compose.

### Database backup

Для резервного копирования базы данных используется скрипт:

```bash
./scripts/backup_db.sh
```

Скрипт создает SQL-дамп PostgreSQL через `pg_dump` и сохраняет его в директорию `~/backups`. Для автоматического выполнения резервного копирования используется cron.
