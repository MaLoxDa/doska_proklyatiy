"""Слой доступа к данным.

Данные берутся либо из Supabase (через официальный клиент supabase-py,
только методы клиента — никакого SQL), либо из встроенного мок-хранилища
в памяти. Мок используется, когда Supabase не настроен, а также как
graceful fallback, если таблица или сеть недоступны: ошибка логируется,
запрос не падает.
"""

from __future__ import annotations

import logging
import threading
from typing import Any

from .config import Settings, get_settings

logger = logging.getLogger(__name__)

# Мок-данные повторяют frontend/lib/data.ts один в один, чтобы API и статический
# экспорт фронтенда отдавали одинаковый контент.
MOCK_SERVICES: list[dict[str, Any]] = [
    {
        "slug": "lyubovnaya-magiya",
        "title": "Любовная магия",
        "short": "Отношения и примирение",
        "category": "Ритуалы",
        "format": "Онлайн, в переписке",
        "term": "После обсуждения запроса",
        "price": "от 3 000 ₽",
        "about": (
            "Работа с отношениями: примирение после ссоры, возврат интереса, разбор "
            "повторяющихся сценариев. Мастер сначала уточняет ситуацию и говорит, какой "
            "обряд подходит, а от какого лучше отказаться."
        ),
        "needs": (
            "Кратко опишите ситуацию и укажите, как с вами связаться. Фотографии и другие "
            "материалы можно отправить мастеру позже."
        ),
        "masterSlug": "elena",
    },
    {
        "slug": "denezhnye-ritualy",
        "title": "Денежные ритуалы",
        "short": "Денежные вопросы и благополучие",
        "category": "Ритуалы",
        "format": "Онлайн, в переписке",
        "term": "После обсуждения запроса",
        "price": "от 2 500 ₽",
        "about": (
            "Ритуалы на деньги и работу: долги, поиск источника дохода, страх потерять "
            "стабильность. Мастер объясняет, что входит в обряд, сколько он длится и что "
            "нужно делать самостоятельно."
        ),
        "needs": (
            "Опишите, что происходит с деньгами и работой сейчас, и какой результат вы "
            "считаете реалистичным. Мастер предложит формат и сроки."
        ),
        "masterSlug": "elena",
    },
    {
        "slug": "zashchitnye-obryady",
        "title": "Защитные обряды",
        "short": "Защитные практики и обереги",
        "category": "Ритуалы",
        "format": "Онлайн, в переписке",
        "term": "После обсуждения запроса",
        "price": "от 2 000 ₽",
        "about": (
            "Личная консультация по защитным практикам и оберегам. Мастер уточнит ситуацию "
            "и расскажет, как проходит работа, какие материалы понадобятся и как понять, "
            "что защита действует."
        ),
        "needs": (
            "Кратко опишите ситуацию и укажите, как с вами связаться. Фотографии и другие "
            "материалы можно отправить мастеру позже."
        ),
        "masterSlug": "aleksey",
    },
    {
        "slug": "snyatie-proklyatiy",
        "title": "Снятие проклятий",
        "short": "Диагностика и очищение",
        "category": "Ритуалы",
        "format": "Онлайн, в переписке и по видеосвязи",
        "term": "От трёх дней",
        "price": "от 5 000 ₽",
        "about": (
            "Диагностика состояния и очищение. Работа начинается с разбора: мастер "
            "проверяет запрос, объясняет, нужна ли чистка вообще, и только потом "
            "предлагает обряд."
        ),
        "needs": (
            "Расскажите, что изменилось в жизни и когда вы это заметили. Если уже "
            "обращались к другим мастерам, укажите, чем закончилась работа."
        ),
        "masterSlug": "aleksey",
    },
    {
        "slug": "konsultaciya-po-taro",
        "title": "Консультация по Таро",
        "short": "Личный разбор и прогноз",
        "category": "Консультации",
        "format": "Онлайн, в переписке",
        "term": "В течение двух дней",
        "price": "от 1 500 ₽",
        "about": (
            "Разбор одной темы: отношения, работа, выбор. Мастер раскладывает карты, "
            "объясняет значения и отвечает на вопросы по раскладу. Это консультация, а не "
            "предсказание судьбы."
        ),
        "needs": (
            "Сформулируйте один конкретный вопрос и укажите, какие решения вы уже "
            "рассматривали. Так разбор будет точнее."
        ),
        "masterSlug": "mariya",
    },
    {
        "slug": "amulet-obereg",
        "title": "Амулет-оберег",
        "short": "Индивидуальный оберег",
        "category": "Амулеты",
        "format": "Изготовление и доставка",
        "term": "От пяти дней",
        "price": "от 2 500 ₽",
        "about": (
            "Индивидуальный амулет под ваш запрос: материал, символ и способ ношения "
            "обсуждаются заранее. Мастер присылает фото готовой работы и рекомендации по "
            "обращению с оберегом."
        ),
        "needs": (
            "Опишите, от чего должен защищать амулет, и есть ли аллергия на материалы. "
            "Доставку обсуждает мастер."
        ),
        "masterSlug": "aleksey",
    },
]

MOCK_MASTERS: list[dict[str, Any]] = [
    {
        "slug": "mariya",
        "name": "Мария",
        "specialization": "Таро и личные консультации",
        "description": "Помогает разобраться в отношениях и личных вопросах",
        "quote": (
            "«Помогаю разобраться в отношениях, личных вопросах и жизненных ситуациях. "
            "Работаю с картами Таро и нумерологией.»"
        ),
        "rating": 4.9,
        "experience": 8,
        "price": "от 2 500 ₽",
        "category": "Консультации",
    },
    {
        "slug": "aleksey",
        "name": "Алексей",
        "specialization": "Защитные практики",
        "description": "Работает с оберегами и защитными обрядами",
        "quote": (
            "«Собираю защиту под конкретную ситуацию: оберег, обряд или работа с домом. "
            "Сначала диагностика, потом действия.»"
        ),
        "rating": 4.8,
        "experience": 12,
        "price": "от 2 000 ₽",
        "category": "Ритуалы",
    },
    {
        "slug": "elena",
        "name": "Елена",
        "specialization": "Ритуалы и консультации",
        "description": "Принимает запросы о работе, деньгах и отношениях",
        "quote": (
            "«Работаю с денежными и любовными запросами. Не обещаю чудес: объясняю, что "
            "реально сделать в вашей ситуации.»"
        ),
        "rating": 4.7,
        "experience": 6,
        "price": "от 2 500 ₽",
        "category": "Ритуалы",
    },
]

# Slug'и, которые принимает POST /api/orders (совпадают с фронтендом).
KNOWN_SERVICE_SLUGS: frozenset[str] = frozenset(service["slug"] for service in MOCK_SERVICES)

SERVICES_TABLE = "services"
MASTERS_TABLE = "masters"
ORDERS_TABLE = "orders"

_FIRST_MOCK_ORDER_ID = 101


class DemoModeError(RuntimeError):
    """Supabase не настроен — операция доступна только в облачном режиме."""


class AuthUnavailableError(RuntimeError):
    """Supabase настроен, но клиент недоступен (ошибка конфигурации/сети)."""


class InvalidCredentialsError(RuntimeError):
    """Supabase отклонил логин или пароль."""


def _slugify(value: str) -> str:
    """Простой транслит в slug: «Защитные обряды» → «zashchitnye-obryady»."""
    table = str.maketrans(
        "абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
        "abvgdeejziyklmnoprstufhccss_y_eua",
    )
    text = value.lower().translate(table)
    cleaned = [char if char.isalnum() else "-" for char in text]
    slug = "".join(cleaned)
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug.strip("-")


def _money(value: Any) -> str:
    """1500 → «1 500»; используется для цены из колонки price_from."""
    try:
        number = int(float(value))
    except (TypeError, ValueError):
        return ""
    return f"{number:,}".replace(",", " ")


def _short_text(text: str, limit: int = 70) -> str:
    """Первое предложение описания — для краткой подписи в каталоге."""
    sentence = text.split(".")[0].strip()
    if len(sentence) > limit:
        sentence = sentence[: limit - 1].rstrip() + "…"
    return sentence


def _service_payload(row: dict[str, Any], master_slugs: dict[Any, str] | None = None) -> dict[str, Any] | None:
    """Приводим строку таблицы services к полям фронтенда.

    Поддерживаются обе схемы: «плоская» (slug, short, price, …) и схема из
    ER-диаграммы проекта (title, description, price_from, category, master_id).
    """
    title = str(row.get("title") or "").strip()
    slug = row.get("slug") or (_slugify(title) if title else "") or (
        f"service-{row['id']}" if row.get("id") is not None else ""
    )
    if not slug:
        return None

    description = str(row.get("description") or row.get("about") or "")
    price = row.get("price") or (f"от {_money(row['price_from'])} ₽" if row.get("price_from") is not None else "")
    master_id = row.get("master_id")
    master_slug = row.get("masterSlug") or row.get("master_slug") or ""
    if not master_slug and master_id is not None and master_slugs:
        master_slug = master_slugs.get(master_id, "")

    return {
        "slug": slug,
        "title": title,
        "short": row.get("short") or _short_text(description),
        "category": row.get("category", ""),
        "format": row.get("format") or "Онлайн, в переписке",
        "term": row.get("term") or "После обсуждения запроса",
        "price": price,
        "about": description,
        "needs": row.get("needs") or "Кратко опишите ситуацию и укажите, как с вами связаться.",
        "masterSlug": master_slug,
    }


def _master_payload(row: dict[str, Any]) -> dict[str, Any] | None:
    """Приводим строку таблицы masters к полям фронтенда (обе схемы)."""
    name = str(row.get("name") or row.get("full_name") or "").strip()
    slug = row.get("slug") or (_slugify(name) if name else "") or (
        f"master-{row['id']}" if row.get("id") is not None else ""
    )
    if not slug:
        return None

    rating = row.get("rating", 0)
    experience = row.get("experience", row.get("experience_years", 0))
    try:
        rating_value = float(rating)
    except (TypeError, ValueError):
        rating_value = 0.0
    try:
        experience_value = int(experience)
    except (TypeError, ValueError):
        experience_value = 0

    description = str(row.get("description") or "")
    return {
        "slug": slug,
        "name": name or "Мастер",
        "specialization": row.get("specialization", ""),
        "description": description,
        "quote": row.get("quote") or (f"«{description}»" if description else ""),
        "rating": rating_value,
        "experience": experience_value,
        "price": row.get("price", ""),
        "category": row.get("category", ""),
    }


class Store:
    """Единая точка доступа к данным: Supabase с откатом на мок."""

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._client: Any = None
        self._client_ready = False
        self._client_lock = threading.Lock()
        self._mock_orders: list[dict[str, Any]] = []
        self._next_order_id = _FIRST_MOCK_ORDER_ID
        self._orders_lock = threading.Lock()

    # ------------------------------------------------------------------ режим

    @property
    def mode(self) -> str:
        return self._settings.mode

    @property
    def supabase_configured(self) -> bool:
        return self._settings.supabase_configured

    # --------------------------------------------------------------- Supabase

    @property
    def client(self) -> Any | None:
        """Лениво созданный клиент Supabase. ``None`` — работаем на мок-данных."""
        if not self._settings.supabase_configured:
            return None
        with self._client_lock:
            if not self._client_ready:
                self._client_ready = True
                try:
                    from supabase import ClientOptions, create_client

                    options = ClientOptions(
                        postgrest_client_timeout=self._settings.supabase_timeout,
                    )
                    self._client = create_client(
                        str(self._settings.supabase_url),
                        str(self._settings.supabase_key),
                        options,
                    )
                    logger.info(
                        "Клиент Supabase создан (таймаут %s c), запись и чтение идут в облако",
                        self._settings.supabase_timeout,
                    )
                except Exception:
                    logger.exception(
                        "Не удалось создать клиент Supabase — переходим на мок-данные"
                    )
                    self._client = None
            return self._client

    def _select(self, table: str) -> list[dict[str, Any]] | None:
        """SELECT через клиент Supabase. ``None`` означает «данных нет, нужен мок»."""
        client = self.client
        if client is None:
            return None
        try:
            response = client.table(table).select("*").execute()
            rows = response.data or []
            logger.debug("Таблица %s: получено строк %s", table, len(rows))
            return list(rows)
        except Exception:
            logger.exception(
                "Не удалось прочитать таблицу %s из Supabase — отдаём мок-данные", table
            )
            return None

    # ------------------------------------------------------------------ услуги

    def list_services(self) -> list[dict[str, Any]]:
        rows = self._select(SERVICES_TABLE)
        if rows is None:
            return [dict(service) for service in MOCK_SERVICES]
        # Карта «id мастера → slug»: в схеме из ER-диаграммы услуга ссылается на master_id.
        master_slugs: dict[Any, str] = {}
        master_rows = self._select(MASTERS_TABLE) or []
        for master_row in master_rows:
            payload = _master_payload(master_row)
            if payload and master_row.get("id") is not None:
                master_slugs[master_row["id"]] = payload["slug"]
        services = [payload for row in rows if (payload := _service_payload(row, master_slugs))]
        if not services:
            logger.warning("Таблица services пуста — отдаём встроенные мок-услуги")
            return [dict(service) for service in MOCK_SERVICES]
        return services

    def get_service(self, slug: str) -> dict[str, Any] | None:
        return next((service for service in self.list_services() if service["slug"] == slug), None)

    # ----------------------------------------------------------------- мастера

    def list_masters(self) -> list[dict[str, Any]]:
        rows = self._select(MASTERS_TABLE)
        if rows is None:
            return [dict(master) for master in MOCK_MASTERS]
        masters = [payload for row in rows if (payload := _master_payload(row))]
        if not masters:
            logger.warning("Таблица masters пуста — отдаём встроенных мок-мастеров")
            return [dict(master) for master in MOCK_MASTERS]
        return masters

    def get_master(self, slug: str) -> dict[str, Any] | None:
        return next((master for master in self.list_masters() if master["slug"] == slug), None)

    # ---------------------------------------------------------------- заявки

    def create_order(self, payload: dict[str, Any]) -> int:
        """Сохранить заявку и вернуть её идентификатор (int)."""
        row = {
            "name": payload["name"],
            "email": str(payload["email"]),
            "message": payload["message"],
            "service": payload["service"],
            "consent": bool(payload["consent"]),
        }

        client = self.client
        if client is not None:
            try:
                response = client.table(ORDERS_TABLE).insert(row).execute()
                created = (response.data or [{}])[0]
                order_id = created.get("id")
                if order_id is None:
                    raise ValueError("Supabase не вернул id созданной заявки")
                logger.info("Заявка #%s сохранена в Supabase (услуга %s)", order_id, row["service"])
                return int(order_id)
            except Exception:
                logger.exception(
                    "Не удалось сохранить заявку в Supabase — пишем во встроенное хранилище"
                )

        order_id = self._create_mock_order(row)
        logger.info("Заявка #%s сохранена в мок-хранилище (услуга %s)", order_id, row["service"])
        return order_id

    def _create_mock_order(self, row: dict[str, Any]) -> int:
        with self._orders_lock:
            order_id = self._next_order_id
            self._next_order_id += 1
            self._mock_orders.append({"id": order_id, **row})
            return order_id

    @property
    def mock_orders(self) -> list[dict[str, Any]]:
        """Заявки, накопленные в мок-хранилище (для отладки/тестов)."""
        with self._orders_lock:
            return [dict(order) for order in self._mock_orders]

    # ---------------------------------------------------------- аутентификация

    def login(self, email: str, password: str) -> dict[str, Any]:
        """Вход через supabase.auth.sign_in_with_password.

        :raises DemoModeError: если Supabase не настроен.
        :raises AuthUnavailableError: если клиент Supabase недоступен.
        :raises InvalidCredentialsError: если Supabase отклонил пару логин/пароль.
        """
        if not self._settings.supabase_configured:
            raise DemoModeError("Supabase не настроен")

        client = self.client
        if client is None:
            raise AuthUnavailableError("Клиент Supabase недоступен")

        try:
            response = client.auth.sign_in_with_password({"email": email, "password": password})
        except Exception:
            # Детали ошибки Supabase наружу не отдаём, пароль в лог не пишем.
            logger.warning("Supabase отклонил вход для %s", email)
            raise InvalidCredentialsError("Неверная пара логин/пароль") from None

        user = getattr(response, "user", None)
        session = getattr(response, "session", None)
        logger.info("Успешный вход через Supabase: %s", email)
        return {
            "email": getattr(user, "email", None) or email,
            "access_token": getattr(session, "access_token", None),
            "refresh_token": getattr(session, "refresh_token", None),
            "expires_in": getattr(session, "expires_in", None),
        }


def get_store() -> Store:
    """FastAPI-зависимость: один Store на процесс."""
    return _store


_store = Store()
