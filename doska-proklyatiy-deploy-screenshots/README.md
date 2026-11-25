# Скриншоты репетиции деплоя

Скриншоты к практическому занятию №18 «Деплой приложения на выбранный хостинг».
Проект «Доска проклятий», Корнилова Маргарита, ПР-25.106, вариант 6.

Полное описание — в [../doska-proklyatiy-deploy/README.md](../doska-proklyatiy-deploy/README.md).

| Файл | Что подтверждает |
| --- | --- |
| `doska.localhost.png` | главная страница по `https://doska.localhost` (HTTPS, локальный сертификат mkcert) |
| `doska.localhost_uslugi.png` | каталог услуг |
| `doska.localhost_uslugi_zashchitnye-obryady.png` | карточка услуги |
| `doska.localhost_mastera.png` | список мастеров |
| `doska.localhost_mastera_mariya.png` | карточка мастера |
| `doska.localhost_zayavka.png` | форма заявки |
| `doska.localhost_vhod.png` | страница входа (закрыта от индексации) |
| `doska.localhost_moi-zakazy.png` | личный кабинет |
| `docker-compose-ps.png` | вывод `docker compose ps`: три сервиса запущены |
| `docker-ps-ports.png` | вывод `docker ps`: наружу опубликованы только порты nginx |
| `docker-compose-logs.png` | журналы контейнеров |
| `nginx-response-headers.png` | заголовки ответа nginx |
| `network-api-headers.png` | панель Network: запрос к `/api/services` и заголовок `x-robots-tag` |

Скриншоты страниц сняты с работающего контейнера; личные данные пользователей на них не видны
(в демо-режиме используются тестовые заказы). Файлы `docker-compose-ps.png`, `docker-ps-ports.png`,
`docker-compose-logs.png`, `nginx-response-headers.png` и `network-api-headers.png` — снимки реального
вывода команд и заголовков ответа, отрисованные в виде окна терминала: headless-браузер на этой
машине не показывает окно DevTools, поэтому панель Network снята рендером настоящего ответа.
