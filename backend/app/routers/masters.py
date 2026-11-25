from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from ..schemas import MasterOut
from ..store import Store, get_store

router = APIRouter(prefix="/masters", tags=["masters"])

@router.get(
    "",
    response_model=list[MasterOut],
    summary="Список мастеров",
)
def list_masters(store: Store = Depends(get_store)) -> list[dict]:
    return store.list_masters()

@router.get(
    "/{slug}",
    response_model=MasterOut,
    summary="Один мастер по slug",
    responses={status.HTTP_404_NOT_FOUND: {"description": "Мастер не найден"}},
)
def get_master(slug: str, store: Store = Depends(get_store)) -> dict:
    master = store.get_master(slug)
    if master is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Мастер «{slug}» не найден",
        )
    return master
