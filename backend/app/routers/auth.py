from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status

from ..schemas import ErrorResponse, LoginRequest, LoginResponse
from ..store import (
    AuthUnavailableError,
    DemoModeError,
    InvalidCredentialsError,
    Store,
    get_store,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

DEMO_MODE_DETAIL = "Демо-режим: подключение Supabase не настроено"

@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Вход в личный кабинет",
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            "model": ErrorResponse,
            "description": "Неверная почта или пароль",
        },
        status.HTTP_503_SERVICE_UNAVAILABLE: {
            "model": ErrorResponse,
            "description": "Supabase не настроен (демо-режим)",
        },
    },
)
def login(payload: LoginRequest, store: Store = Depends(get_store)) -> LoginResponse:
    try:
        session = store.login(payload.email, payload.password)
    except DemoModeError:
        logger.info("Попытка входа в демо-режиме: %s", payload.email)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=DEMO_MODE_DETAIL,
        ) from None
    except AuthUnavailableError:
        logger.error("Supabase Auth недоступен, вход невозможен: %s", payload.email)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Сервис аутентификации временно недоступен",
        ) from None
    except InvalidCredentialsError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверная почта или пароль",
        ) from None

    return LoginResponse(**session)
