"""Настройки приложения, читаемые из переменных окружения (и из .env локально).

Режим работы определяется наличием пары ``SUPABASE_URL`` + ``SUPABASE_KEY``:
если обе заданы — данные идут через Supabase, иначе приложение работает
на встроенном мок-хранилище (демо-режим).
"""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

# Origin'ы фронтенда, которым разрешены запросы к API.
DEFAULT_CORS_ORIGINS: tuple[str, ...] = (
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://doska.localhost",
    "http://doska.localhost",
)


class Settings(BaseSettings):
    """Конфигурация сервиса. Имена полей совпадают с env-переменными."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Supabase (если не заданы оба параметра — работает мок-хранилище) ---
    supabase_url: str | None = None
    supabase_key: str | None = None
    supabase_timeout: float = 5.0

    # --- HTTP / CORS ---
    cors_origins: str = ",".join(DEFAULT_CORS_ORIGINS)

    # --- Логирование ---
    log_level: str = "INFO"

    @property
    def cors_origin_list(self) -> list[str]:
        """CORS_ORIGINS как список (можно переопределить строкой через запятую)."""
        origins = [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
        return origins or list(DEFAULT_CORS_ORIGINS)

    @property
    def supabase_configured(self) -> bool:
        """True, если заданы и URL, и ключ Supabase."""
        return bool(self.supabase_url and self.supabase_url.strip()) and bool(
            self.supabase_key and self.supabase_key.strip()
        )

    @property
    def mode(self) -> str:
        """Текущий режим хранения данных: ``supabase`` или ``mock``."""
        return "supabase" if self.supabase_configured else "mock"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Настройки-синглтон (кешируются, чтобы окружение читалось один раз)."""
    return Settings()
