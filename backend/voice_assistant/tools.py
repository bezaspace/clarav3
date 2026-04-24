from __future__ import annotations

from datetime import datetime
import logging
from typing import Any
from typing import TYPE_CHECKING
from zoneinfo import ZoneInfo

if TYPE_CHECKING:
    from google.adk.tools import ToolContext
else:
    ToolContext = Any

from voice_assistant.db import get_section


LOCAL_TIMEZONE = ZoneInfo("Asia/Kolkata")
TIME_FORMAT = "%I:%M %p"
SCHEDULE_TIMEZONE_STATE_KEY = "app:schedule_timezone"
SCHEDULE_SUMMARY_STATE_KEY = "app:schedule_summary"
logger = logging.getLogger("voice_assistant.tools")


def get_current_schedule_item(
    timezone: str | None = None,
    now_iso: str | None = None,
    tool_context: ToolContext | None = None,
) -> dict[str, Any]:
    """Returns the single most relevant schedule item to act on right now.

    You MUST use this tool before answering questions like:
    - what should I do now
    - what is my next activity
    - what is my next task
    - what is around the corner
    - what is scheduled next
    - what should I be doing right now

    Do not use this tool for full-day summaries or list-style pending-item
    requests. Use get_today_schedule for those.

    Args:
        timezone: Optional timezone override. Defaults to Asia/Kolkata.
        now_iso: Optional ISO timestamp override for determining the current item.
        tool_context: ADK tool context when available.
    """

    schedule, journal_tasks, now = _load_schedule_data(
        timezone=timezone,
        now_iso=now_iso,
        tool_context=tool_context,
    )

    pending_schedule = [
        item for item in schedule if _normalize_schedule_status(item.get("status")) != "completed"
    ]
    overdue_item = _find_latest_due_item(pending_schedule, now)
    upcoming_item = _find_next_upcoming_item(pending_schedule, now)
    pending_tasks = _pending_tasks(journal_tasks)

    selected_item = overdue_item or upcoming_item
    selected_card = _serialize_schedule_item(selected_item) if selected_item else None

    if selected_card is None and pending_tasks:
        selected_card = _serialize_task_item(pending_tasks[0])

    if overdue_item is not None:
        message = (
            f"Your next priority is {overdue_item.get('title', 'an activity')}."
            f" It was scheduled for {overdue_item.get('time', 'earlier today')}."
        )
    elif upcoming_item is not None:
        message = (
            f"Your next scheduled activity is {upcoming_item.get('title', 'an activity')}"
            f" at {upcoming_item.get('time', 'the next slot')}."
        )
    elif pending_tasks:
        message = (
            f"You have {pending_tasks[0].get('title', 'a pending task')} still open."
        )
    else:
        message = "You do not have any pending schedule items or tasks right now."

    result = {
        "type": "current_activity",
        "generatedAt": now.isoformat(),
        "timezone": str(now.tzinfo or LOCAL_TIMEZONE),
        "message": message,
        "activityCard": selected_card,
        "currentItem": _serialize_schedule_item(overdue_item),
        "upcomingItem": _serialize_schedule_item(upcoming_item),
        "pendingTasks": [_serialize_task_item(task) for task in pending_tasks],
    }
    logger.info(
        "tool.get_current_schedule_item overdue=%s upcoming=%s pending_tasks=%s selected_id=%s",
        bool(overdue_item),
        bool(upcoming_item),
        len(pending_tasks),
        (selected_card or {}).get("id"),
    )
    return result

def get_today_schedule(
    timezone: str | None = None,
    date: str | None = None,
    tool_context: ToolContext | None = None,
) -> dict[str, Any]:
    """Returns today's schedule plus outstanding journal tasks.

    You MUST use this tool before answering questions like:
    - what is my plan today
    - show my full schedule
    - what have I not completed yet
    - what is still pending
    - give me today's agenda
    - what does the rest of my day look like

    Do not use this tool when the user is only asking for the single next item.
    Use get_current_schedule_item for that.

    Args:
        timezone: Optional timezone override. Defaults to Asia/Kolkata.
        date: Optional YYYY-MM-DD date override. Defaults to today in the local timezone.
        tool_context: ADK tool context when available.
    """

    schedule, journal_tasks, now = _load_schedule_data(
        timezone=timezone,
        date=date,
        tool_context=tool_context,
    )

    schedule_cards = [_serialize_schedule_item(item) for item in schedule]
    pending_tasks = _pending_tasks(journal_tasks)
    pending_task_cards = [_serialize_task_item(task) for task in pending_tasks]

    completed_count = sum(
        1
        for item in schedule
        if _normalize_schedule_status(item.get("status")) == "completed"
    )

    result = {
        "type": "schedule_snapshot",
        "generatedAt": now.isoformat(),
        "timezone": str(now.tzinfo or LOCAL_TIMEZONE),
        "message": (
            f"You have {len(schedule)} scheduled activities today,"
            f" with {completed_count} completed and {len(pending_tasks)} open journal tasks."
        ),
        "items": schedule_cards + pending_task_cards,
        "todaysSchedule": schedule,
        "journalTasks": journal_tasks,
        "pendingTasks": pending_task_cards,
        "summary": {
            "scheduledCount": len(schedule),
            "completedCount": completed_count,
            "pendingTaskCount": len(pending_tasks),
        },
    }
    logger.info(
        "tool.get_today_schedule schedule_count=%s completed=%s pending_tasks=%s",
        len(schedule),
        completed_count,
        len(pending_tasks),
    )
    return result


def _load_schedule_data(
    timezone: str | None = None,
    date: str | None = None,
    now_iso: str | None = None,
    tool_context: ToolContext | None = None,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], datetime]:
    dashboard = get_section("dashboard") or {}
    journal_tasks = get_section("journal_tasks") or []
    schedule = dashboard.get("todaysSchedule", [])
    resolved_timezone = _resolve_timezone(
        timezone,
        tool_context=tool_context,
    )
    now = _resolve_now(resolved_timezone, date=date, now_iso=now_iso)
    return schedule, journal_tasks, now


def _resolve_timezone(
    value: str | None,
    *,
    tool_context: ToolContext | None = None,
) -> ZoneInfo:
    if value and value.strip():
        try:
            return ZoneInfo(value.strip())
        except Exception:
            logger.warning("tool.resolve_timezone.invalid timezone=%s", value)
    if tool_context is not None:
        state_value = str(tool_context.state.get(SCHEDULE_TIMEZONE_STATE_KEY, "")).strip()
        if state_value:
            try:
                return ZoneInfo(state_value)
            except Exception:
                logger.warning("tool.resolve_timezone.invalid_state timezone=%s", state_value)
    return LOCAL_TIMEZONE


def _resolve_now(
    timezone: ZoneInfo,
    *,
    date: str | None = None,
    now_iso: str | None = None,
) -> datetime:
    if now_iso and now_iso.strip():
        try:
            parsed = datetime.fromisoformat(now_iso.strip())
            if parsed.tzinfo is None:
                return parsed.replace(tzinfo=timezone)
            return parsed.astimezone(timezone)
        except ValueError:
            logger.warning("tool.resolve_now.invalid_now_iso value=%s", now_iso)

    base_now = datetime.now(timezone)
    if date and date.strip():
        try:
            parsed_date = datetime.fromisoformat(date.strip())
            return base_now.replace(
                year=parsed_date.year,
                month=parsed_date.month,
                day=parsed_date.day,
            )
        except ValueError:
            logger.warning("tool.resolve_now.invalid_date value=%s", date)
    return base_now


def _find_latest_due_item(
    schedule: list[dict[str, Any]],
    now: datetime,
) -> dict[str, Any] | None:
    due_items = []
    for item in schedule:
        scheduled_for = _parse_schedule_datetime(item.get("time"), now)
        if scheduled_for is None or scheduled_for > now:
            continue
        due_items.append((scheduled_for, item))

    if not due_items:
        return None
    return max(due_items, key=lambda pair: pair[0])[1]


def _find_next_upcoming_item(
    schedule: list[dict[str, Any]],
    now: datetime,
) -> dict[str, Any] | None:
    upcoming_items = []
    for item in schedule:
        scheduled_for = _parse_schedule_datetime(item.get("time"), now)
        if scheduled_for is None or scheduled_for <= now:
            continue
        upcoming_items.append((scheduled_for, item))

    if not upcoming_items:
        return None
    return min(upcoming_items, key=lambda pair: pair[0])[1]


def _parse_schedule_datetime(
    value: str | None,
    now: datetime,
) -> datetime | None:
    if not value or not isinstance(value, str):
        return None

    try:
        parsed_time = datetime.strptime(value.strip(), TIME_FORMAT)
    except ValueError:
        return None

    return now.replace(
        hour=parsed_time.hour,
        minute=parsed_time.minute,
        second=0,
        microsecond=0,
    )


def _pending_tasks(tasks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        task
        for task in tasks
        if _normalize_task_status(task.get("status")) != "completed"
    ]


def _serialize_schedule_item(item: dict[str, Any] | None) -> dict[str, Any] | None:
    if item is None:
        return None

    status = _normalize_schedule_status(item.get("status"))
    duration = str(item.get("duration", "")).strip()
    time_label = str(item.get("time", "")).strip()
    supporting_parts = [part for part in [duration, time_label] if part]
    return {
        "id": str(item.get("id", "")),
        "kind": "schedule",
        "title": str(item.get("title", "Untitled activity")),
        "category": str(item.get("type", "General")),
        "status": status,
        "timeLabel": time_label,
        "supportingText": " · ".join(supporting_parts) or "Scheduled activity",
        "scheduledFor": time_label or None,
    }


def _serialize_task_item(task: dict[str, Any]) -> dict[str, Any]:
    status = _normalize_task_status(task.get("status"))
    due_date = str(task.get("dueDate", "")).strip()
    priority = str(task.get("priority", "")).strip()
    supporting_parts = [
        f"{priority.title()} priority" if priority else "",
        f"Due {due_date}" if due_date else "",
    ]
    return {
        "id": str(task.get("id", "")),
        "kind": "task",
        "title": str(task.get("title", "Untitled task")),
        "category": str(task.get("category", "General")),
        "status": status,
        "timeLabel": due_date or "Any time",
        "supportingText": " · ".join(part for part in supporting_parts if part) or "Open task",
        "scheduledFor": due_date or None,
    }


def _normalize_schedule_status(value: Any) -> str:
    normalized = str(value or "").strip().lower()
    if normalized == "completed":
        return "completed"
    if normalized == "in-progress":
        return "in-progress"
    return "pending"


def _normalize_task_status(value: Any) -> str:
    normalized = str(value or "").strip().lower()
    if normalized == "completed":
        return "completed"
    if normalized == "in-progress":
        return "in-progress"
    return "pending"
