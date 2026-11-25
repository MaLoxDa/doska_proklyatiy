from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_CORS_ORIGINS: tuple[str, ...] = (
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://doska.localhost",
    "http://doska.localhost",
)

class Settings(BaseSettings):

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    supabase_url: str | None = None
    supabase_key: str | None = None
    supabase_timeout: float = 5.0

    cors_origins: str = ",".join(DEFAULT_CORS_ORIGINS)

    log_level: str = "INFO"

    @property
    def cors_origin_list(self) -> list[str]:
        origins = [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
        return origins or list(DEFAULT_CORS_ORIGINS)

    @property
    def supabase_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_url.strip()) and bool(
            self.supabase_key and self.supabase_key.strip()
        )

    @property
    def mode(self) -> str:
        return "supabase" if self.supabase_configured else "mock"

@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
