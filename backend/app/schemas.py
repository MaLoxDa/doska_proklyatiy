"""Pydantic-модели запросов и ответов API."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from .store import KNOWN_SERVICE_SLUGS


class HealthResponse(BaseModel):
    """Ответ /api/health."""

    status: Literal["ok"] = "ok"
    mode: Literal["supabase", "mock"]


class ServiceOut(BaseModel):
    """Услуга (поля совпадают с frontend/lib/data.ts)."""

    model_config = ConfigDict(extra="ignore")

    slug: str
    title: str
    short: str
    category: str
    format: str
    term: str
    price: str
    about: str
    needs: str
    masterSlug: str


class MasterOut(BaseModel):
    """Мастер (поля совпадают с frontend/lib/data.ts)."""

    model_config = ConfigDict(extra="ignore")

    slug: str
    name: str
    specialization: str
    description: str
    quote: str
    rating: float
    experience: int
    price: str
    category: str


class OrderCreate(BaseModel):
    """Тело POST /api/orders."""

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    name: str = Field(min_length=2, max_length=80, description="Как обращаться к клиенту")
    email: EmailStr = Field(description="Почта для ответа мастера")
    message: str = Field(min_length=10, max_length=2000, description="Текст запроса")
    service: str = Field(min_length=1, max_length=120, description="Slug услуги")
    consent: bool = Field(description="Согласие на обработку персональных данных")

    @field_validator("consent")
    @classmethod
    def _require_consent(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("Согласие на обработку персональных данных обязательно")
        return value

    @field_validator("service")
    @classmethod
    def _check_service_exists(cls, value: str) -> str:
        if value not in KNOWN_SERVICE_SLUGS:
            raise ValueError(
                "Услуга не найдена, выберите одну из: "
                + ", ".join(sorted(KNOWN_SERVICE_SLUGS))
            )
        return value


class OrderCreated(BaseModel):
    """Ответ POST /api/orders (201)."""

    id: int
    status: Literal["accepted"] = "accepted"


class LoginRequest(BaseModel):
    """Тело POST /api/auth/login."""

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    email: EmailStr
    password: str = Field(min_length=1, max_length=256)


class LoginResponse(BaseModel):
    """Ответ POST /api/auth/login (200)."""

    status: Literal["ok"] = "ok"
    email: EmailStr
    access_token: str | None = None
    refresh_token: str | None = None
    expires_in: int | None = None


class ErrorResponse(BaseModel):
    """Единый формат ошибки (для документации)."""

    detail: str
