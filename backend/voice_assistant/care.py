from __future__ import annotations

from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

from voice_assistant.db import get_section
from voice_assistant.db import save_sections


LOCAL_TIMEZONE = ZoneInfo("Asia/Kolkata")
CARE_ACTIVITY_SECTION = "care_activity"
CARE_ACTIVITY_SOURCE_SECTIONS = {
    "product": "care_products",
    "food": "care_food",
    "doctor": "care_professionals",
    "lab": "care_professionals",
}
CARE_ACTIVITY_KINDS = {"product", "food", "doctor", "lab"}
ACTIVE_CARE_STATUSES = {"ordered", "confirmed", "scheduled", "preparing", "in-transit"}


def load_care_activity(active_only: bool = False) -> list[dict[str, Any]]:
    payload = get_section(CARE_ACTIVITY_SECTION)
    if not isinstance(payload, list):
        return []

    records = [record for record in payload if isinstance(record, dict)]
    if not active_only:
        return records
    return [
        record
        for record in records
        if str(record.get("status", "")).strip().lower() in ACTIVE_CARE_STATUSES
    ]


def recommend_care_options(
    kind: str | None = None,
    query: str | None = None,
    limit: int = 5,
) -> list[dict[str, Any]]:
    kinds = _normalize_kinds(kind)
    query_terms = _query_terms(query)
    scored: list[tuple[int, dict[str, Any]]] = []
    fallback: list[tuple[int, dict[str, Any]]] = []

    for item_kind in kinds:
        for item in _catalog_for_kind(item_kind):
            score = _score_catalog_item(item, query_terms)
            fallback.append((
                _score_catalog_item(item, []),
                _serialize_recommendation(item_kind, item),
            ))
            if query_terms and score <= 0:
                continue
            scored.append((score, _serialize_recommendation(item_kind, item)))

    candidates = scored or fallback
    candidates.sort(key=lambda pair: (-pair[0], pair[1]["title"]))
    return [item for _, item in candidates[: max(1, limit)]]


def create_care_activity(
    kind: str,
    source_item_id: str,
    note: str | None = None,
) -> dict[str, Any]:
    normalized_kind = _normalize_kind(kind)
    item = find_care_catalog_item(normalized_kind, source_item_id)
    if item is None:
        raise ValueError(f"Unknown {normalized_kind} item: {source_item_id}")

    created_at = datetime.now(LOCAL_TIMEZONE).isoformat()
    existing = load_care_activity()
    record = _build_activity_record(
        kind=normalized_kind,
        item=item,
        created_at=created_at,
        note=note,
        sequence=len(existing) + 1,
    )
    save_sections({CARE_ACTIVITY_SECTION: [record, *existing]})
    return record


def delete_care_activity(activity_id: str) -> dict[str, Any]:
    normalized_id = str(activity_id or "").strip()
    if not normalized_id:
        raise ValueError("A care activity id is required.")

    existing = load_care_activity()
    remaining = [
        activity
        for activity in existing
        if str(activity.get("id", "")).strip() != normalized_id
    ]
    if len(remaining) == len(existing):
        raise ValueError(f"Unknown care activity: {activity_id}")

    save_sections({CARE_ACTIVITY_SECTION: remaining})
    return {
        "id": normalized_id,
        "status": "deleted",
    }


def find_care_catalog_item(kind: str, source_item_id: str) -> dict[str, Any] | None:
    normalized_kind = _normalize_kind(kind)
    source_id = str(source_item_id).strip()
    if not source_id:
        return None
    for item in _catalog_for_kind(normalized_kind):
        if str(item.get("id", "")).strip() == source_id:
            return item
    return None


def build_care_tool_response(
    *,
    action: str,
    kind: str | None = None,
    query: str | None = None,
    source_item_id: str | None = None,
    confirmed: bool = False,
    note: str | None = None,
) -> dict[str, Any]:
    normalized_action = str(action or "recommend").strip().lower()
    normalized_kind = _normalize_kind(kind) if kind else None

    if normalized_action in {"create", "order", "book"}:
        if not confirmed:
            recommendations = recommend_care_options(normalized_kind, query or source_item_id)
            return {
                "type": "care_activity_confirmation_required",
                "status": "confirmation_required",
                "message": "Please confirm before I place this order or booking.",
                "kind": normalized_kind,
                "recommendations": recommendations,
            }
        if not normalized_kind or not source_item_id:
            return {
                "type": "care_activity_error",
                "status": "error",
                "message": "A care item type and item id are required to create an order or booking.",
            }
        try:
            activity = create_care_activity(normalized_kind, source_item_id, note=note)
        except ValueError as error:
            return {
                "type": "care_activity_error",
                "status": "error",
                "message": str(error),
            }
        return {
            "type": "care_activity_created",
            "status": "success",
            "message": _activity_message(activity),
            "activity": activity,
        }

    recommendations = recommend_care_options(normalized_kind, query)
    return {
        "type": "care_recommendations",
        "status": "success",
        "message": f"Found {len(recommendations)} care option{'s' if len(recommendations) != 1 else ''}.",
        "kind": normalized_kind,
        "query": query or "",
        "recommendations": recommendations,
    }


def _catalog_for_kind(kind: str) -> list[dict[str, Any]]:
    section = CARE_ACTIVITY_SOURCE_SECTIONS[kind]
    payload = get_section(section)
    if not isinstance(payload, list):
        return []

    items = [item for item in payload if isinstance(item, dict)]
    if kind in {"doctor", "lab"}:
        type_filter = "Doctor" if kind == "doctor" else "Lab"
        return [
            item
            for item in items
            if str(item.get("type", "")).strip().lower() == type_filter.lower()
        ]
    return items


def _normalize_kind(kind: str | None) -> str:
    normalized = str(kind or "").strip().lower()
    aliases = {
        "shop": "product",
        "shopping": "product",
        "grocery": "product",
        "groceries": "product",
        "product_order": "product",
        "food_delivery": "food",
        "meal": "food",
        "doctor_booking": "doctor",
        "appointment": "doctor",
        "lab_booking": "lab",
        "test": "lab",
        "lab_test": "lab",
    }
    normalized = aliases.get(normalized, normalized)
    if normalized not in CARE_ACTIVITY_KINDS:
        raise ValueError(f"Unsupported care kind: {kind}")
    return normalized


def _normalize_kinds(kind: str | None) -> list[str]:
    if kind:
        try:
            return [_normalize_kind(kind)]
        except ValueError:
            return ["product", "food", "doctor", "lab"]
    return ["product", "food", "doctor", "lab"]


def _query_terms(query: str | None) -> list[str]:
    return [
        term
        for term in str(query or "").lower().replace(",", " ").split()
        if len(term) >= 2
    ]


def _score_catalog_item(item: dict[str, Any], query_terms: list[str]) -> int:
    if not query_terms:
        rating = item.get("rating", 0)
        return int(float(rating or 0) * 10)

    searchable = " ".join(
        str(item.get(key, ""))
        for key in [
            "name",
            "category",
            "specialty",
            "restaurant",
            "location",
            "tag",
            "offer",
        ]
    ).lower()
    score = 0
    for term in query_terms:
        if term in searchable:
            score += 10
    if item.get("isOnline"):
        score += 2
    if item.get("veg"):
        score += 1
    return score


def _serialize_recommendation(kind: str, item: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(item.get("id", "")),
        "kind": kind,
        "title": str(item.get("name", "Care option")),
        "provider": str(item.get("restaurant") or item.get("specialty") or item.get("category") or ""),
        "detail": str(item.get("unit") or item.get("time") or item.get("availability") or ""),
        "price": _number_value(item.get("price")),
        "rating": _number_value(item.get("rating")),
        "image": str(item.get("image", "")),
        "category": str(item.get("category") or item.get("specialty") or ""),
        "offer": str(item.get("offer") or item.get("tag") or ""),
        "eta": str(item.get("time", "")) if kind == "food" else "",
        "isOnline": bool(item.get("isOnline")),
        "reviews": _number_value(item.get("reviews")),
        "location": str(item.get("location", "")),
        "availability": str(item.get("availability", "")),
    }


def _build_activity_record(
    *,
    kind: str,
    item: dict[str, Any],
    created_at: str,
    note: str | None,
    sequence: int,
) -> dict[str, Any]:
    activity_id = f"care-{int(datetime.now(LOCAL_TIMEZONE).timestamp())}-{sequence}"
    title = str(item.get("name", "Care activity"))
    provider = str(item.get("restaurant") or item.get("specialty") or item.get("category") or "")
    status = "ordered" if kind in {"product", "food"} else "confirmed"
    eta = str(item.get("time", "")) if kind == "food" else ""
    scheduled_for = str(item.get("availability", "")) if kind in {"doctor", "lab"} else ""
    return {
        "id": activity_id,
        "kind": kind,
        "status": status,
        "title": title,
        "provider": provider,
        "scheduledFor": scheduled_for,
        "eta": eta,
        "price": _number_value(item.get("price")),
        "sourceItemId": str(item.get("id", "")),
        "createdAt": created_at,
        "note": str(note or "").strip(),
    }


def _activity_message(activity: dict[str, Any]) -> str:
    kind = activity.get("kind")
    title = activity.get("title", "your care option")
    if kind == "product":
        return f"Ordered {title} from the shop."
    if kind == "food":
        eta = activity.get("eta") or "soon"
        return f"Ordered {title}; estimated delivery is {eta}."
    if kind == "doctor":
        scheduled_for = activity.get("scheduledFor") or "the next available slot"
        return f"Booked {title} for {scheduled_for}."
    if kind == "lab":
        scheduled_for = activity.get("scheduledFor") or "the next available slot"
        return f"Booked {title} lab service for {scheduled_for}."
    return f"Created care activity for {title}."


def _number_value(value: Any) -> int | float:
    if isinstance(value, (int, float)):
        return value
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return 0
    if parsed.is_integer():
        return int(parsed)
    return parsed
