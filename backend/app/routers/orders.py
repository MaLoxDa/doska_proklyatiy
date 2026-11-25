from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, status

from ..schemas import ErrorResponse, OrderCreate, OrderCreated
from ..store import Store, get_store

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post(
    "",
    response_model=OrderCreated,
    status_code=status.HTTP_201_CREATED,
    summary="Отправить заявку",
    responses={
        422: {
            "model": ErrorResponse,
            "description": "Ошибка валидации (в том числе consent=false)",
        }
    },
)
def create_order(payload: OrderCreate, store: Store = Depends(get_store)) -> OrderCreated:
    order_id = store.create_order(payload.model_dump(mode="json"))
    logger.info(
        "Новая заявка #%s: услуга=%s, режим=%s", order_id, payload.service, store.mode
    )
    return OrderCreated(id=order_id, status="accepted")
