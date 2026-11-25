from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from ..schemas import ServiceOut
from ..store import Store, get_store

router = APIRouter(prefix="/services", tags=["services"])

@router.get(
    "",
    response_model=list[ServiceOut],
    summary="Список услуг",
)
def list_services(store: Store = Depends(get_store)) -> list[dict]:
    return store.list_services()

@router.get(
    "/{slug}",
    response_model=ServiceOut,
    summary="Одна услуга по slug",
    responses={status.HTTP_404_NOT_FOUND: {"description": "Услуга не найдена"}},
)
def get_service(slug: str, store: Store = Depends(get_store)) -> dict:
    service = store.get_service(slug)
    if service is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Услуга «{slug}» не найдена",
        )
    return service
