"""Точка входа FastAPI-приложения «Доска проклятий».

Запуск: ``uvicorn app.main:app --host 0.0.0.0 --port 8000``.
Все прикладные эндпоинты живут под префиксом ``/api``; стандартная
документация доступна по ``/docs`` и ``/redoc``.
"""

from __future__ import annotations

import logging
import sys
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import __version__
from .config import get_settings
from .routers import auth, health, masters, orders, services

API_PREFIX = "/api"
ROBOTS_HEADER = "X-Robots-Tag"
ROBOTS_VALUE = "noindex, nofollow"

logger = logging.getLogger("app")


def configure_logging(level: str = "INFO") -> None:
    """Логирование в stdout с уровнем INFO и форматом со временем."""
    handler = logging.StreamHandler(stream=sys.stdout)
    handler.setFormatter(
        logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
    )

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level.upper())

    # Клиент Supabase (httpx) на INFO пишет каждый запрос — оставляем только предупреждения.
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    logger.info(
        "Запуск «Доска проклятий» API v%s, режим=%s, cors=%s",
        __version__,
        settings.mode,
        ", ".join(settings.cors_origin_list),
    )
    if not settings.supabase_configured:
        logger.warning(
            "SUPABASE_URL / SUPABASE_KEY не заданы — работаем на встроенном мок-хранилище"
        )
    else:
        logger.info("Supabase настроен: %s", settings.supabase_url)
    yield
    logger.info("Остановка API")


def _validation_detail(exc: RequestValidationError) -> tuple[str, list[dict]]:
    """Человекочитаемое сообщение и машинные детали для 422."""
    errors: list[dict] = []
    for error in exc.errors():
        location = [str(part) for part in error.get("loc", ()) if part not in ("body", "query")]
        errors.append(
            {
                "field": ".".join(location) or "body",
                "message": error.get("msg", "Некорректное значение"),
                "type": error.get("type", "value_error"),
            }
        )
    detail = "; ".join(f"{item['field']}: {item['message']}" for item in errors)
    return detail or "Некорректные данные запроса", errors


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.log_level)

    app = FastAPI(
        title="Доска проклятий — API",
        description=(
            "API сайта эзотерических услуг «Доска проклятий». "
            "Работает в двух режимах: Supabase (если заданы SUPABASE_URL и SUPABASE_KEY) "
            "и mock (встроенные данные, когда облако не настроено)."
        ),
        version=__version__,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        # .localhost — служебный домен, поэтому EmailStr в contact.email его не примет.
        contact={"name": "Доска проклятий", "url": "https://doska.localhost"},
        license_info={"name": "Учебный проект"},
        openapi_tags=[
            {"name": "health", "description": "Проверка доступности"},
            {"name": "services", "description": "Каталог услуг"},
            {"name": "masters", "description": "Каталог мастеров"},
            {"name": "orders", "description": "Заявки"},
            {"name": "auth", "description": "Аутентификация через Supabase"},
        ],
    )

    # CORS: только origin'ы фронтенда, только нужные методы.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Accept", "Authorization", "Content-Type"],
        expose_headers=[ROBOTS_HEADER],
        max_age=600,
    )

    @app.middleware("http")
    async def add_robots_header(request: Request, call_next):
        """SEO-требование методички: API не индексируется поисковиками."""
        response = await call_next(request)
        if request.url.path.startswith(API_PREFIX):
            response.headers[ROBOTS_HEADER] = ROBOTS_VALUE
        return response

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        detail, errors = _validation_detail(exc)
        logger.info("422 %s %s — %s", request.method, request.url.path, detail)
        return JSONResponse(
            status_code=422,
            content={"detail": detail, "errors": errors},
        )

    app.include_router(health.router, prefix=API_PREFIX)
    app.include_router(services.router, prefix=API_PREFIX)
    app.include_router(masters.router, prefix=API_PREFIX)
    app.include_router(orders.router, prefix=API_PREFIX)
    app.include_router(auth.router, prefix=API_PREFIX)

    return app


app = create_app()
