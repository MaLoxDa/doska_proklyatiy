# «Доска проклятий» - backend

FastAPI-приложение для сайта эзотерических услуг. Отдаёт каталог услуг и мастеров,
принимает заявки и выполняет вход через Supabase Auth.

Работает в двух режимах:

| Режим | Когда включается | Откуда данные |
| --- | --- | --- |
| `supabase` | заданы `SUPABASE_URL` **и** `SUPABASE_KEY` | таблицы `services`, `masters`, `orders`, вход через Supabase Auth |
| `mock` | переменные не заданы (или Supabase недоступен) | встроенные данные в памяти, идентичные `frontend/lib/data.ts` |

Переключение автоматическое, перезапуск с другими переменными не нужен.
Если таблица или сеть недоступны, ошибка пишется в лог и запрос обслуживается
мок-данными — сервис не падает.

## Локальный запуск

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install --disable-pip-version-check -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Проверка: <http://127.0.0.1:8000/api/health> → `{"status":"ok","mode":"mock"}`,
документация - <http://127.0.0.1:8000/docs>.

## Запуск в Docker

```bash
cd backend
docker build -t doska-backend .
docker run --rm -p 8000:8000 doska-backend
```

Образ собирается в два этапа (`builder` → `runtime`), зависимости живут в `/opt/venv`,
приложение работает от непривилегированного пользователя `appuser`.
`HEALTHCHECK` обращается к `/api/health` через `python -c "import urllib.request..."`,
поэтому в образе не нужен `curl`.

С Supabase:

```bash
docker run --rm -p 8000:8000 \
  -e SUPABASE_URL=https://<project>.supabase.co \
  -e SUPABASE_KEY=sb_publishable_... \
  doska-backend
```

## Переменные окружения

| Переменная | По умолчанию | Назначение |
| --- | --- | --- |
| `SUPABASE_URL` | — | URL проекта Supabase. Вместе с ключом включает режим `supabase` |
| `SUPABASE_KEY` | — | Публичный ключ (`sb_publishable_...`) |
| `SUPABASE_TIMEOUT` | `5.0` | Таймаут запросов к Supabase, секунды |
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000,https://doska.localhost,http://doska.localhost` | Разрешённые origin'ы через запятую |
| `LOG_LEVEL` | `INFO` | Уровень логирования |

Локально переменные можно положить в `backend/.env` (файл исключён из git и Docker).

## Эндпоинты

Все прикладные маршруты — под префиксом `/api`; на каждый ответ `/api/*`
добавляется заголовок `X-Robots-Tag: noindex, nofollow` (требование по SEO).

| Метод | Путь | Ответ |
| --- | --- | --- |
| GET | `/api/health` | `200 {"status":"ok","mode":"supabase"\|"mock"}` |
| GET | `/api/services` | `200` — список услуг |
| GET | `/api/services/{slug}` | `200` или `404 {"detail": "..."}` |
| GET | `/api/masters` | `200` — список мастеров |
| GET | `/api/masters/{slug}` | `200` или `404 {"detail": "..."}` |
| POST | `/api/orders` | `201 {"id": <int>, "status": "accepted"}`, `422` при ошибке валидации |
| POST | `/api/auth/login` | `200` с токенами, `401` при неверной паре, `503` в демо-режиме |

`POST /api/orders` принимает `{name, email, message, service, consent}`:
`name` 2–80 символов, `email` — валидный адрес, `message` 10–2000 символов,
`service` — существующий slug, `consent` обязательно `true`.

Стандартная документация: `/docs` (Swagger UI), `/redoc`, схема — `/openapi.json`.
Собственного `/api/docs` нет.

## Структура

```
backend/
  app/
    __init__.py
    main.py            # FastAPI(), CORS, middleware X-Robots-Tag, роутеры
    config.py          # настройки из переменных окружения
    schemas.py         # pydantic-модели
    store.py           # Supabase-клиент, мок-данные, доступ к данным
    routers/
      __init__.py
      health.py
      services.py
      masters.py
      orders.py
      auth.py
  requirements.txt
  Dockerfile
  .dockerignore
  README.md
```
