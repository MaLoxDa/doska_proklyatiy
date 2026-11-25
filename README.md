# Доска проклятий

Учебный индивидуальный проект по дисциплине **ОПВ.15 «Проектирование, разработка и оптимизация
веб-приложений»** (специальность 09.02.07, ГБПОУ НСО «Новосибирский авиационный технический колледж
им. Б.С. Галущака»).

Автор: **Корнилова Маргарита**, группа ПР-25.106, вариант 6.

«Доска проклятий» — площадка, где клиент выбирает ритуал, консультацию или амулет, оставляет заявку
и обсуждает запрос с мастером. В проекте есть каталог услуг, карточки мастеров, форма заявки,
личный кабинет и API.

## Стек

| Слой | Технологии |
| --- | --- |
| Фронтенд | Next.js 15 (App Router, статический экспорт), React 19, TypeScript, Tailwind CSS |
| Бэкенд | Python 3.12, FastAPI, uvicorn, pydantic |
| База данных | Supabase (PostgreSQL) через HTTP API, без SQL в коде |
| Веб-сервер | nginx: раздаёт статику и проксирует `/api/` |
| Инфраструктура | Docker, Docker Compose, GitHub Actions, GHCR |
| Дизайн | Figma-макет (тёмная тема, шрифты Alegreya SC / Alegreya Sans SC) |

## Структура репозитория

```
frontend/                        Next.js: страницы, компоненты, данные, Dockerfile
backend/                         FastAPI: роутеры, схемы, Supabase + демо-данные
doska-proklyatiy-deploy/         репетиция деплоя: compose, nginx, сертификаты, README
doska-proklyatiy-deploy-screenshots/  скриншоты работающего сайта и контейнеров
docs/seo/                        отчёт по SEO (занятие 70–71): before/after, robots, sitemap
docs/audit/                      отчёт по аудиту (занятие 79–80): Lighthouse, CWV, приоритеты
docs/reports/                    отчёты по практическим занятиям (Word)
.github/workflows/ci.yml         CI: сборка образов; CD: публикация в GHCR
```

## Страницы

| URL | Назначение | Индексация |
| --- | --- | --- |
| `/` | главная: hero, услуги, как заказать | публичная |
| `/uslugi` | каталог услуг | публичная |
| `/uslugi/[slug]` | карточка услуги (6 услуг) | публичная |
| `/mastera` | список мастеров | публичная |
| `/mastera/[slug]` | карточка мастера (3 мастера) | публичная |
| `/zayavka` | форма заявки | публичная |
| `/zayavka/otpravleno` | подтверждение отправки | `noindex` |
| `/vhod` | вход в личный кабинет | `noindex` |
| `/moi-zakazy` | личный кабинет | `noindex` + `Disallow` |

## Запуск локально (без Docker)

```bash
# фронтенд
cd frontend
npm ci
npm run dev            # http://localhost:3000

# бэкенд
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\python -m uvicorn app.main:app --port 8000
```

Без переменных `SUPABASE_URL` и `SUPABASE_KEY` бэкенд работает в демо-режиме и отдаёт те же данные
из встроенного хранилища — для проверки интерфейса этого достаточно.

Проект Supabase уже подключён (адрес и ключ — в `.env`, режим бэкенда `supabase`). Таблицы `services`
и `masters` пока пусты, а в `orders` нет колонок для имени, почты и текста запроса, поэтому API отдаёт
демо-данные; как включить хранение в облаке — в
[doska-proklyatiy-deploy/README.md](doska-proklyatiy-deploy/README.md), раздел «Подключение Supabase».

## Запуск в Docker (репетиция деплоя)

```bash
cd doska-proklyatiy-deploy
docker compose up --build -d
docker compose ps
```

Сайт: `https://doska.localhost` (локальный сертификат mkcert, только с этого компьютера).
Подробности — в [doska-proklyatiy-deploy/README.md](doska-proklyatiy-deploy/README.md).

## API

| Метод | Адрес | Что делает |
| --- | --- | --- |
| GET | `/api/health` | состояние и режим работы (`supabase` или `mock`) |
| GET | `/api/services` | список услуг |
| GET | `/api/services/{slug}` | одна услуга |
| GET | `/api/masters` | список мастеров |
| GET | `/api/masters/{slug}` | один мастер |
| POST | `/api/orders` | заявка: имя, почта, запрос, услуга, согласие на обработку данных |
| POST | `/api/auth/login` | вход (в демо-режиме отвечает 503) |

Все ответы `/api/*` отдаются с заголовком `X-Robots-Tag: noindex, nofollow`.

## Отчёты по занятиям

| Занятие | Отчёт |
| --- | --- |
| 70–71. SEO: метатеги, заголовки, robots.txt, sitemap.xml | [docs/seo/README.md](docs/seo/README.md) |
| 18. Деплой: серверы, SSL, домен, CI/CD | [doska-proklyatiy-deploy/README.md](doska-proklyatiy-deploy/README.md) |
| 79–80. SEO и аналитика: Lighthouse, Core Web Vitals | [docs/audit/README.md](docs/audit/README.md) |

Версии отчётов в Word — в папке `docs/reports/`.

## Ограничения

- Проект **не публикуется в интернет**: в нём есть персональные данные (152-ФЗ), поэтому деплой
  выполнен как репетиция на локальном компьютере.
- Аналитика (Яндекс Метрика, Google Analytics) не подключалась по той же причине.
- Supabase используется через API; SQL-запросы в коде отсутствуют — доступ к данным только через
  клиентскую библиотеку.
