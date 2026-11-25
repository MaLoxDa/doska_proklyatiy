"""GET /api/health — проверка доступности сервиса."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from ..schemas import HealthResponse
from ..store import Store, get_store

router = APIRouter(tags=["health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Состояние сервиса",
    description="Возвращает статус и текущий режим хранения данных.",
)
def health(store: Store = Depends(get_store)) -> HealthResponse:
    return HealthResponse(status="ok", mode=store.mode)  # type: ignore[arg-type]
