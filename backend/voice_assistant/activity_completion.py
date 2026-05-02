from __future__ import annotations

from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

from voice_assistant.db import get_section
from voice_assistant.db import save_sections
from voice_assistant.journal import update_journal_task


LOCAL_TIMEZONE = ZoneInfo("Asia/Kolkata")
SUPPORTED_ACTIVITY_KINDS = {"schedule", "task"}


def complete_activity(
    *,
    item_kind: str,
    item_id: str,
    completion_note: str,
) -> dict[str, Any]:
    normalized_kind = _required_text(item_kind, "An activity kind is required.").lower()
    if normalized_kind not in SUPPORTED_ACTIVITY_KINDS:
        raise ValueError(f"Unsupported activity kind: {item_kind}")

    normalized_id = _required_text(item_id, "An activity id is required.")
    normalized_note = _required_text(completion_note, "A completion note is required.")
    completed_at = datetime.now(LOCAL_TIMEZONE).isoformat()

    if normalized_kind == "schedule":
        item = _complete_schedule_item(
            item_id=normalized_id,
            completion_note=normalized_note,
            completed_at=completed_at,
        )
    else:
        item = update_journal_task(
            normalized_id,
            status="completed",
            completion_note=normalized_note,
            completed_at=completed_at,
        )

    return {
        "kind": normalized_kind,
        "item": item,
        "completedAt": completed_at,
    }


def _complete_schedule_item(
    *,
    item_id: str,
    completion_note: str,
    completed_at: str,
) -> dict[str, Any]:
    dashboard = get_section("dashboard") or {}
    if not isinstance(dashboard, dict):
        raise ValueError("Dashboard data is unavailable.")

    schedule = dashboard.get("todaysSchedule")
    if not isinstance(schedule, list):
        raise ValueError("Today's schedule is unavailable.")

    updated_item: dict[str, Any] | None = None
    updated_schedule = []
    for item in schedule:
        if not isinstance(item, dict):
            updated_schedule.append(item)
            continue

        if str(item.get("id", "")).strip() != item_id:
            updated_schedule.append(item)
            continue

        updated_item = {
            **item,
            "status": "completed",
            "completionNote": completion_note,
            "completedAt": completed_at,
        }
        updated_schedule.append(updated_item)

    if updated_item is None:
        raise ValueError(f"Unknown schedule activity: {item_id}")

    save_sections({"dashboard": {**dashboard, "todaysSchedule": updated_schedule}})
    return updated_item


def _required_text(value: Any, message: str) -> str:
    normalized = str(value or "").strip()
    if not normalized:
        raise ValueError(message)
    return normalized
