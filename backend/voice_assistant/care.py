from __future__ import annotations

from datetime import datetime
from datetime import timedelta
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
    limit: int = 4,
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
    scheduled_for: str | None = None,
    slot_id: str | None = None,
    fulfillment: str | None = None,
    quantity: int | None = None,
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
        scheduled_for=scheduled_for,
        slot_id=slot_id,
        fulfillment=fulfillment,
        quantity=quantity,
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
    slot_id: str | None = None,
    scheduled_for: str | None = None,
    fulfillment: str | None = None,
    quantity: int | None = None,
) -> dict[str, Any]:
    normalized_action = str(action or "recommend").strip().lower()
    normalized_kind = _normalize_kind(kind) if kind else None

    if normalized_action in {"select", "slots", "slot"}:
        if not normalized_kind or not source_item_id:
            return {
                "type": "care_activity_error",
                "status": "error",
                "message": "Please choose a care option first.",
            }
        if normalized_kind in {"doctor", "lab"}:
            return build_booking_slots_response(
                kind=normalized_kind,
                source_item_id=source_item_id,
            )
        return build_order_review_response(
            kind=normalized_kind,
            source_item_id=source_item_id,
            fulfillment=fulfillment,
            quantity=quantity,
        )

    if normalized_action in {"create", "order", "book"}:
        if not confirmed:
            if normalized_kind and source_item_id:
                if normalized_kind in {"doctor", "lab"}:
                    return build_booking_slots_response(
                        kind=normalized_kind,
                        source_item_id=source_item_id,
                    )
                return build_order_review_response(
                    kind=normalized_kind,
                    source_item_id=source_item_id,
                    fulfillment=fulfillment,
                    quantity=quantity,
                )
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
            resolved_scheduled_for = scheduled_for or _scheduled_for_slot(
                normalized_kind,
                source_item_id,
                slot_id,
            )
            activity = create_care_activity(
                normalized_kind,
                source_item_id,
                note=note,
                scheduled_for=resolved_scheduled_for,
                slot_id=slot_id,
                fulfillment=fulfillment,
                quantity=quantity,
            )
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


def build_booking_slots_response(
    *,
    kind: str,
    source_item_id: str,
) -> dict[str, Any]:
    normalized_kind = _normalize_kind(kind)
    if normalized_kind not in {"doctor", "lab"}:
        return {
            "type": "care_activity_error",
            "status": "error",
            "message": "Slots are only available for doctors and labs.",
        }
    item = find_care_catalog_item(normalized_kind, source_item_id)
    if item is None:
        return {
            "type": "care_activity_error",
            "status": "error",
            "message": f"Unknown {normalized_kind} item: {source_item_id}",
        }
    slots = _build_slot_options(normalized_kind, item)
    return {
        "type": "care_booking_slots",
        "status": "confirmation_required",
        "message": f"Choose a slot for {item.get('name', 'this care option')}.",
        "kind": normalized_kind,
        "selected": _serialize_recommendation(normalized_kind, item),
        "slots": slots,
    }


def build_order_review_response(
    *,
    kind: str,
    source_item_id: str,
    fulfillment: str | None = None,
    quantity: int | None = None,
) -> dict[str, Any]:
    normalized_kind = _normalize_kind(kind)
    if normalized_kind not in {"product", "food"}:
        return {
            "type": "care_activity_error",
            "status": "error",
            "message": "Order review is only available for products and food.",
        }
    item = find_care_catalog_item(normalized_kind, source_item_id)
    if item is None:
        return {
            "type": "care_activity_error",
            "status": "error",
            "message": f"Unknown {normalized_kind} item: {source_item_id}",
        }
    selected = _serialize_recommendation(normalized_kind, item)
    resolved_quantity = _quantity_value(quantity)
    resolved_fulfillment = _clean_text(fulfillment) or (
        "Deliver now" if normalized_kind == "food" else "Home delivery"
    )
    eta = selected.get("eta") or selected.get("detail") or "Today"
    price = _number_value(item.get("price"))
    total_price = price * resolved_quantity
    return {
        "type": "care_order_review",
        "status": "confirmation_required",
        "message": f"Confirm {selected['title']} before I place the order.",
        "kind": normalized_kind,
        "selected": selected,
        "fulfillment": resolved_fulfillment,
        "quantity": resolved_quantity,
        "eta": eta,
        "totalPrice": total_price,
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
        "medicine": "product",
        "medication": "product",
        "pharmacy": "product",
        "supplement": "product",
        "supplements": "product",
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
    query_text = " ".join(query_terms)
    score = 0
    for term in query_terms:
        if term in searchable:
            score += 10
    score += _specialty_query_score(searchable, query_text)
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
    scheduled_for: str | None,
    slot_id: str | None,
    fulfillment: str | None,
    quantity: int | None,
) -> dict[str, Any]:
    activity_id = f"care-{int(datetime.now(LOCAL_TIMEZONE).timestamp())}-{sequence}"
    title = str(item.get("name", "Care activity"))
    provider = str(item.get("restaurant") or item.get("specialty") or item.get("category") or "")
    status = "ordered" if kind in {"product", "food"} else "scheduled"
    eta = str(item.get("time", "")) if kind == "food" else ""
    resolved_scheduled_for = (
        _clean_text(scheduled_for)
        or (str(item.get("availability", "")) if kind in {"doctor", "lab"} else "")
    )
    resolved_quantity = _quantity_value(quantity) if kind in {"product", "food"} else 1
    record = {
        "id": activity_id,
        "kind": kind,
        "status": status,
        "title": title,
        "provider": provider,
        "scheduledFor": resolved_scheduled_for,
        "eta": eta,
        "price": _number_value(item.get("price")),
        "sourceItemId": str(item.get("id", "")),
        "createdAt": created_at,
        "note": str(note or "").strip(),
        "slotId": _clean_text(slot_id),
        "fulfillment": _clean_text(fulfillment),
        "quantity": resolved_quantity,
    }
    return record


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


def _quantity_value(value: Any) -> int:
    try:
        parsed = int(value or 1)
    except (TypeError, ValueError):
        return 1
    return max(1, parsed)


def _clean_text(value: Any) -> str:
    return str(value or "").strip()


def _specialty_query_score(searchable: str, query_text: str) -> int:
    boosts = {
        ("bloat", "bloating", "stomach", "gut", "gas", "acid", "digestion", "digestive"): [
            "gastro",
            "general physician",
            "ayur",
        ],
        ("stress", "anxiety", "panic", "sleep", "mood", "depress", "therapy"): [
            "psychi",
            "psycholog",
            "mind",
        ],
        ("heart", "chest", "bp", "blood pressure", "cardio"): [
            "cardio",
            "general physician",
        ],
        ("sugar", "diabetes", "thyroid", "hormone", "metabolic"): [
            "endocr",
            "thyroid",
            "hormone",
            "full body",
            "biomarker",
        ],
        ("skin", "rash", "acne", "hair"): ["dermat"],
        ("knee", "joint", "back", "sprain", "bone"): ["ortho"],
        ("vitamin", "deficiency", "blood test", "lab", "checkup"): [
            "vitamin",
            "full body",
            "pathology",
            "diagnostic",
        ],
    }
    score = 0
    for triggers, needles in boosts.items():
        if any(trigger in query_text for trigger in triggers):
            if any(needle in searchable for needle in needles):
                score += 12
    return score


def _build_slot_options(kind: str, item: dict[str, Any]) -> list[dict[str, Any]]:
    now = datetime.now(LOCAL_TIMEZONE)
    start_date = _availability_start_date(str(item.get("availability", "")), now)
    times = (
        ["09:00 AM", "10:30 AM", "02:00 PM", "04:30 PM", "06:00 PM"]
        if kind == "doctor"
        else ["07:00 AM", "08:30 AM", "10:00 AM", "05:00 PM"]
    )
    mode = _slot_mode(kind, item)
    slots = []
    for day_offset in range(3):
        slot_date = start_date + timedelta(days=day_offset)
        for time_index, time_label in enumerate(times[:2] if day_offset else times[:3]):
            slot_id = f"{kind}-{item.get('id', 'item')}-{slot_date:%Y%m%d}-{time_index}"
            scheduled_for = f"{slot_date:%a, %d %b} at {time_label}"
            slots.append(
                {
                    "id": slot_id,
                    "date": slot_date.isoformat(),
                    "dayLabel": slot_date.strftime("%a, %d %b"),
                    "time": time_label,
                    "mode": mode,
                    "scheduledFor": scheduled_for,
                }
            )
            if len(slots) >= 5:
                return slots
    return slots


def _availability_start_date(value: str, now: datetime) -> datetime.date:
    normalized = value.strip().lower()
    if "tomorrow" in normalized:
        return (now + timedelta(days=1)).date()
    if any(token in normalized for token in ["home", "today", "walk", "appointment", "advanced"]):
        return now.date()
    try:
        parsed = datetime.strptime(value.strip(), "%d %b")
        return now.replace(month=parsed.month, day=parsed.day).date()
    except ValueError:
        return now.date()


def _slot_mode(kind: str, item: dict[str, Any]) -> str:
    if kind == "lab":
        availability = str(item.get("availability", "")).lower()
        return "Home collection" if "home" in availability else "Walk in"
    return "Video call" if item.get("isOnline") else "Clinic visit"


def _scheduled_for_slot(
    kind: str,
    source_item_id: str,
    slot_id: str | None,
) -> str:
    if not slot_id or kind not in {"doctor", "lab"}:
        return ""
    item = find_care_catalog_item(kind, source_item_id)
    if item is None:
        return ""
    for slot in _build_slot_options(kind, item):
        if slot.get("id") == slot_id:
            return str(slot.get("scheduledFor", ""))
    return ""
