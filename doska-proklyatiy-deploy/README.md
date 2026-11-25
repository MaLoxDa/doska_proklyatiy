# Репетиция деплоя: «Доска проклятий»

Практическое занятие №18 «Деплой приложения на выбранный хостинг: настройка серверов, SSL, домен, интеграция с CI и CD».
Проект развёрнут **только на локальном компьютере**: приложение доступно по адресу
`https://doska.localhost` и не публикуется в интернет (152-ФЗ: в проекте есть данные пользователей).

ФИО: Корнилова Маргарита · Группа: ПР-25.106 · Вариант: 6

---

## 1. Архитектура

Проект — вариант «фронтенд и бэкенд отдельно» (таблица 2.1 методички): Next.js отдаёт готовые страницы,
FastAPI работает с данными, nginx — единая точка входа. База — Supabase (облачная), поэтому отдельного
сервиса `db` в compose нет: бэкенд подключается к ней по ключу из переменных окружения.

```
                 ┌──────────────────────────────────────────┐
   браузер ──────▶│ nginx :80/:443 (doska.localhost)        │
   только 127.0.0.1│  /      → frontend:8080                 │
                 │  /api/  → backend:8000                   │
                 └───────┬───────────────────────┬──────────┘
                         │                       │
                 ┌───────▼────────┐      ┌───────▼─────────┐
                 │ frontend       │      │ backend         │
                 │ nginx + Next.js│      │ FastAPI         │
                 │ (static export)│      │ uvicorn         │
                 └────────────────┘      └───────┬─────────┘
                                                 │ HTTPS + ключ
                                         ┌───────▼─────────┐
                                         │ Supabase        │
                                         │ (PostgreSQL)    │
                                         └─────────────────┘
```

## 2. Сервисы

| Сервис | Технология | Внутренний порт | Продакшен-сервер |
| --- | --- | --- | --- |
| nginx | nginx 1.27-alpine | 80, 443 | — (сам веб-сервер) |
| frontend | Next.js 15 + React 19 + TypeScript + Tailwind, статический экспорт | 8080 | `nginx` раздаёт файлы из `out/` |
| backend | Python 3.12 + FastAPI | 8000 | `uvicorn` без `--reload`, 2 воркера |
| База данных | Supabase (PostgreSQL, облако) | — | отдельного сервиса нет |

Замена серверов разработки на продакшен-серверы выполнена по таблице 3.1 методички:
`npm run dev` → `npm run build` (файлы отдаёт nginx), `uvicorn --reload` → `uvicorn` без `--reload`.

Наружу опубликован только nginx и только на loopback: `127.0.0.1:80` и `127.0.0.1:443`.
У сервисов `frontend` и `backend` порты не публикуются — они доступны только внутри сети compose.

## 3. Переменные окружения

Реальные значения — в `.env` в корне репозитория (файл в `.gitignore`, в репозиторий не попадает).
Рядом лежит `.env.example` с теми же именами без значений.

| Переменная | Этап | Назначение |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | сборка | адрес сайта для canonical, Open Graph и sitemap.xml |
| `NEXT_PUBLIC_API_URL` | сборка | базовый адрес API (`/api`, запросы идут через nginx) |
| `APP_ENV` | запуск | режим работы бэкенда (`production`) |
| `APP_PORT` | запуск | порт uvicorn |
| `SUPABASE_URL` | запуск | адрес проекта Supabase |
| `SUPABASE_KEY` | запуск | публикуемый ключ Supabase (не секрет, но в код не подставляется) |
| `TAG` | запуск | тег образов в GHCR |

Секретов в переменных этапа сборки нет: всё, что начинается с `NEXT_PUBLIC_`, попадает в JS и видно в браузере.

## 4. Запуск и остановка

```bash
cd doska-proklyatiy-deploy

# собрать образы и поднять стек
docker compose up --build -d

# проверить, что все сервисы работают
docker compose ps

# журналы конкретного сервиса
docker compose logs nginx
docker compose logs backend

# остановить и удалить контейнеры и сеть
docker compose down
```

Сайт: `https://doska.localhost` (или `https://127.0.0.1`). Проверено: `HTTP → HTTPS` отвечает `301`,
`/api/health` возвращает `{"status":"ok","mode":"mock"}`.

## 5. Сертификат

Локальный сертификат выпущен через `mkcert`:

```bash
mkcert -install
cd certs
mkcert -cert-file doska.localhost.pem -key-file doska.localhost-key.pem \
       doska.localhost "*.doska.localhost" localhost 127.0.0.1
```

Файлы `certs/*.pem` в репозиторий не попадают (`.gitignore`), корневой ключ `rootCA-key.pem`
лежит вне проекта. В Firefox сертификат mkcert не подхватывается на Windows — проверять в Chrome или Edge.

## 6. CI/CD

`.github/workflows/ci.yml`:

- **CI** — при каждом `push`/`pull_request` собираются два образа (frontend и backend) с кешем GitHub Actions;
  запуск вручную — кнопка *Run workflow* (`workflow_dispatch`).
- **CD** — при `push` в `main` образы публикуются в GitHub Container Registry:
  `ghcr.io/maloxda/doska-proklyatiy-frontend` и `...-backend` с тегами `latest` и `<sha коммита>`.

Разница понятий: CI — автоматическая сборка и проверка; Continuous Delivery — всегда готовый к выкладке
артефакт, но выкладка подтверждается вручную; Continuous Deployment — выкладка автоматически после каждого
успешного прохождения конвейера.

Результат последнего запуска на коммите `b9809fd`: оба задания — «Собрать образ backend» и
«Собрать образ frontend» — завершились успешно, образы доступны в GHCR
(`docker pull ghcr.io/maloxda/doska-proklyatiy-frontend:latest` и `...-backend:latest`
загружаются без авторизации, значит пакеты публичные).

## 7. Скриншоты

Папка `doska-proklyatiy-deploy-screenshots/` (в корне репозитория, рядом с этой папкой):

| Файл | Что подтверждает |
| --- | --- |
| `docker-compose-ps.png` | вывод `docker compose ps`: три сервиса запущены, у nginx порты 80/443 |
| `docker-ps-ports.png` | вывод `docker ps`: опубликованы только порты nginx (127.0.0.1:80 и 127.0.0.1:443) |
| `docker-compose-logs.png` | журналы контейнеров: запросы проксируются, ответы 200 |
| `nginx-response-headers.png` | заголовки ответа nginx на запрос страницы |
| `doska.localhost.png` | главная страница по `https://doska.localhost` |
| `doska.localhost_uslugi.png`, `..._uslugi_zashchitnye-obryady.png`, `..._mastera.png`, `..._mastera_mariya.png`, `..._zayavka.png`, `..._vhod.png`, `..._moi-zakazy.png` | все страницы сайта из контейнера |
| `network-api-headers.png` | панель Network: запрос к `/api/services`, заголовок ответа `x-robots-tag: noindex, nofollow` |

Скриншоты получены со страниц, открытых после входа или без него; личные данные пользователей
на них не видны (в демо-режиме используются тестовые заказы).

Три файла — `docker-compose-ps.png`, `docker-ps-ports.png`, `docker-compose-logs.png` и
`nginx-response-headers.png` — это снимки реального вывода команд и заголовков ответа, отрисованные
в виде окна терминала (headless-браузер на этой машине не показывает окно DevTools, поэтому панель
Network снята рендером настоящего ответа, а не фотографией экрана).

## 8. Ошибки, которые возникли при развёртывании, и как устранены

| Ошибка | Причина | Решение |
| --- | --- | --- |
| `open() "/run/nginx.pid" failed (13: Permission denied)` | образ `nginx:alpine` по умолчанию пишет pid в `/run`, а процесс запущен от `USER nginx` | свой `nginx.conf`: `pid /tmp/nginx.pid;` и временные файлы в `/tmp` |
| `unknown directive "worker_processes"` | конфиг сохранён в UTF-8 с BOM (PowerShell) | файлы сохранены как UTF-8 без BOM |
| `host not found in upstream "frontend"` | `nginx -t` на этапе сборки не видит сеть compose | проверка конфигурации перенесена на запуск контейнера |
| `cannot load certificate ... doska.localhost.pem` | `certs/*.pem` исключены `.dockerignore`, а тома на этой машине не монтируются | сертификаты копируются в образ nginx на этапе сборки (см. раздел 9) |
| `docker create` зависает при `-v <папка Windows>` | bind-mount папок Windows в Docker Desktop на этой установке не работает (зависает демон) | конфиг nginx и `certs` копируются в образ; томов в compose нет |
| `X-Robots-Tag` дублировался (`noindex, nofollow, noindex, nofollow`) | заголовок ставили и nginx, и FastAPI | в nginx добавлен `proxy_hide_header X-Robots-Tag;` перед `add_header` |
| контейнер frontend перезапускался с кодом 1 | nginx слушал порт 80 от непривилегированного пользователя | frontend слушает 8080, nginx проксирует на `frontend:8080` |

## 9. Отличия от настоящего деплоя (таблица 1.1 методички)

| Параметр | Здесь (репетиция) | Настоящий деплой |
| --- | --- | --- |
| Сервер | свой компьютер, `127.0.0.1` | продакшн-сервер или кластер |
| Домен | `*.localhost` | реальный домен |
| Сертификат | локальный mkcert | Let's Encrypt и автопродление |
| Данные | тестовые (в демо-режиме — мок-данные) | настоящие данные пользователей |
| DNS/сеть | локальный ресолвинг | публичный DNS, CDN, балансировщик |
| Секреты | `.env` на машине | vault / секреты CI |
| Мониторинг | журналы контейнеров | мониторинг, алерты, сбор логов |

Два технических отличия этой машины, которые нужно вернуть при настоящем деплое:

1. **Тома.** В `docker-compose.yml` конфиг nginx и сертификаты сейчас копируются в образ, потому что
   bind-mount папок Windows в Docker Desktop здесь зависает. На сервере нужно вернуть тома:

   ```yaml
   volumes:
     - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
     - ./certs:/etc/nginx/certs:ro
   ```

2. **Сертификат.** На сервере вместо mkcert — Let's Encrypt (`certbot`), файлы обновляются автоматически,
   в образ ничего не запекается.

Кроме того, для публикации потребуется: DNS-запись на реальный домен, открытые порты 80/443,
`SUPABASE_URL` и ключ из панели Supabase, HTTPS-редирект с `www`, резервное копирование и мониторинг.

## 10. Проверка перед сдачей

- [x] архитектура определена по таблице 2.1 (frontend + backend + nginx, БД — облачная Supabase)
- [x] продакшен-серверы настроены по таблице 3.1 (`next build` + nginx, `uvicorn` без `--reload`)
- [x] переменные окружения вынесены, есть `.env.example`, секретов в репозитории нет
- [x] `.gitignore` и `.dockerignore` в порядке (`.env`, ключи, сертификаты, `node_modules`, `out`, `.venv`)
- [x] Dockerfile многоэтапные, процессы запущены от непривилегированного пользователя (`USER nginx`, `USER appuser`)
- [x] `docker compose up --build -d` поднимает все сервисы одной командой, `docker compose ps` — три сервиса Up
- [x] nginx проксирует `/` на frontend и `/api/` на backend, отдаёт `X-Forwarded-*`, редиректит на HTTPS (301)
- [x] сертификат mkcert выпущен, сайт открывается по `https://doska.localhost`
- [x] журналы контейнеров и вкладка Network проверены
- [x] CI собирает образы, CD настроен через GHCR
