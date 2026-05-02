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
from voice_assistant.activity_completion import complete_activity
from voice_assistant.care import build_care_tool_response
from voice_assistant.journal import build_journal_tool_response


LOCAL_TIMEZONE = ZoneInfo("Asia/Kolkata")
TIME_FORMAT = "%I:%M %p"
SCHEDULE_TIMEZONE_STATE_KEY = "app:schedule_timezone"
SCHEDULE_SUMMARY_STATE_KEY = "app:schedule_summary"
LAST_ACTIVITY_CARD_STATE_KEY = "app:last_activity_card"
LAST_CARE_RECOMMENDATIONS_STATE_KEY = "app:last_care_recommendations"
LAST_CARE_SELECTION_STATE_KEY = "app:last_care_selection"
logger = logging.getLogger("voice_assistant.tools")


def manage_care_services(
    action: str = "recommend",
    kind: str | None = None,
    query: str | None = None,
    source_item_id: str | None = None,
    confirmed: bool = False,
    note: str | None = None,
    slot_id: str | None = None,
    scheduled_for: str | None = None,
    fulfillment: str | None = None,
    quantity: int | None = None,
    tool_context: ToolContext | None = None,
) -> dict[str, Any]:
    """Recommends or creates Care shop orders, food orders, doctor bookings, and lab bookings.

    Use this tool when the user needs help buying groceries or health products,
    ordering food, finding a doctor, booking a doctor appointment, finding a lab,
    or booking a lab test from the Care page.

    For recommendations, use action="recommend" and include kind and query when
    known. Use action="select" or action="slots" after the user chooses an
    option by name, id, or ordinal phrase like "the second one". For creating an
    order or booking, use action="create", the item kind, the source item id
    from recommendations or catalog data, and confirmed=true. Never create an
    order or booking unless the user has clearly confirmed it.
    """

    normalized_action = str(action or "recommend").strip().lower()
    resolved_kind = kind
    resolved_source_item_id = _clean_string(source_item_id)

    if normalized_action in {"select", "slots", "slot", "create", "order", "book"}:
        selected = _resolve_care_selection(
            tool_context=tool_context,
            kind=resolved_kind,
            query=query,
            source_item_id=resolved_source_item_id,
        )
        if selected:
            resolved_kind = str(selected.get("kind") or resolved_kind or "")
            resolved_source_item_id = str(selected.get("id") or resolved_source_item_id)

    response = build_care_tool_response(
        action=normalized_action,
        kind=resolved_kind,
        query=query,
        source_item_id=resolved_source_item_id or None,
        confirmed=confirmed,
        note=note,
        slot_id=slot_id,
        scheduled_for=scheduled_for,
        fulfillment=fulfillment,
        quantity=quantity,
    )
    _remember_care_response(tool_context, response)
    return response


def manage_journal(
    action: str = "propose",
    item_type: str | None = None,
    confirmed: bool = False,
    title: str | None = None,
    content: str | None = None,
    mood: str | None = None,
    tags: list[str] | None = None,
    situation: str | None = None,
    thought: str | None = None,
    feeling: str | None = None,
    reframe: str | None = None,
    task_title: str | None = None,
    priority: str | None = None,
    category: str | None = None,
    due_date: str | None = None,
    task_id: str | None = None,
    status: str | None = None,
    tool_context: ToolContext | None = None,
) -> dict[str, Any]:
    """Proposes, creates, updates, deletes, or lists Journal workspace items.

    Use this tool when the user asks to save a reflection, create a journal
    entry, capture a thought, save a CBT note, reframe a thought, or manage a
    mental-load task. Always call with confirmed=false first unless the user has
    already explicitly confirmed the specific write. Only writes are performed
    when confirmed=true.
    """

    del tool_context
    return build_journal_tool_response(
        action=action,
        item_type=item_type,
        confirmed=confirmed,
        title=title,
        content=content,
        mood=mood,
        tags=tags,
        situation=situation,
        thought=thought,
        feeling=feeling,
        reframe=reframe,
        task_title=task_title,
        priority=priority,
        category=category,
        due_date=due_date,
        task_id=task_id,
        status=status,
    )


def get_health_snapshot(
    tool_context: ToolContext | None = None,
) -> dict[str, Any]:
    """Returns the user's full health snapshot from Home and Progress data.

    You MUST use this tool before answering questions about:
    - allergies, sensitivities, clinical history, or active monitoring
    - biomarker status, optimization targets, or biological progress
    - diet, medication, mental health, workout, or adherence metrics
    - the user's overall health picture or health context

    Do not use this tool for schedule-only questions. Use the schedule tools
    for next activity, today's plan, pending schedule, or agenda questions.
    """

    del tool_context

    dashboard = _load_mapping_section("dashboard")
    profile = dashboard.get("profile")
    if not isinstance(profile, dict):
        dashboard["profile"] = {}
    todays_schedule = dashboard.get("todaysSchedule")
    if not isinstance(todays_schedule, list):
        dashboard["todaysSchedule"] = []

    biomarkers = _load_list_section("biomarkers")
    biomarkers_summary = _load_mapping_section("biomarkers_summary")
    diet = _load_mapping_section(
        "diet",
        fallback={"historyData": [], "sattvicGoal": 0},
    )
    mental_health = _load_mapping_section(
        "mental_health",
        fallback={"historyData": [], "adherenceData": [], "quickStats": {}},
    )
    workouts = _load_mapping_section(
        "workouts",
        fallback={"workoutData": [], "sessions": [], "milestone": {}},
    )
    medication = _load_mapping_section(
        "medication",
        fallback={"overview": {}, "adherenceRows": []},
    )

    result = {
        "type": "health_snapshot",
        "generatedAt": datetime.now(LOCAL_TIMEZONE).isoformat(),
        "dashboard": dashboard,
        "progress": {
            "biomarkers": biomarkers,
            "biomarkersSummary": biomarkers_summary,
            "diet": diet,
            "mentalHealth": mental_health,
            "workouts": workouts,
            "medication": medication,
        },
        "sourceSections": [
            "dashboard",
            "biomarkers",
            "biomarkers_summary",
            "diet",
            "mental_health",
            "workouts",
            "medication",
        ],
    }
    logger.info(
        "tool.get_health_snapshot biomarkers=%s diet_points=%s mental_points=%s workout_sessions=%s",
        len(biomarkers),
        len(diet.get("historyData", [])) if isinstance(diet.get("historyData"), list) else 0,
        len(mental_health.get("historyData", []))
        if isinstance(mental_health.get("historyData"), list)
        else 0,
        len(workouts.get("sessions", [])) if isinstance(workouts.get("sessions"), list) else 0,
    )
    return result


def log_activity_completion(
    item_kind: str | None = None,
    item_id: str | None = None,
    completion_note: str | None = None,
    tool_context: ToolContext | None = None,
) -> dict[str, Any]:
    """Marks a surfaced schedule activity or journal task complete with a clinical note.

    Use this tool only after the user says the activity/task is done and you have
    asked up to three activity-specific follow-up questions. The completion_note
    should be a concise freeform note, like a nurse or doctor would write, based
    on the user's answers. If item_kind or item_id is missing, use the most
    recently surfaced activity card from session state when available.
    """

    state_card = _get_last_activity_card(tool_context)
    resolved_kind = _clean_string(item_kind) or str(state_card.get("kind", "")).strip()
    resolved_id = _clean_string(item_id) or str(state_card.get("id", "")).strip()
    resolved_note = _clean_string(completion_note)

    try:
        result = complete_activity(
            item_kind=resolved_kind,
            item_id=resolved_id,
            completion_note=resolved_note,
        )
    except ValueError as error:
        return {
            "type": "activity_completion_error",
            "status": "error",
            "message": str(error),
        }

    if result["kind"] == "schedule":
        activity_card = _serialize_schedule_item(result["item"])
    else:
        activity_card = _serialize_task_item(result["item"])
    _remember_activity_card(tool_context, activity_card)

    return {
        "type": "activity_completion_logged",
        "status": "success",
        "message": f"Logged {activity_card['title']} as completed.",
        "activityCard": activity_card,
    }


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

    _remember_activity_card(tool_context, selected_card)

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
    _remember_activity_card(
        tool_context,
        next(
            (
                item
                for item in schedule_cards + pending_task_cards
                if item and item.get("status") != "completed"
            ),
            None,
        ),
    )

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


def _remember_activity_card(
    tool_context: ToolContext | None,
    activity_card: dict[str, Any] | None,
) -> None:
    if tool_context is None or not activity_card:
        return
    tool_context.state[LAST_ACTIVITY_CARD_STATE_KEY] = activity_card


def _get_last_activity_card(tool_context: ToolContext | None) -> dict[str, Any]:
    if tool_context is None:
        return {}
    value = tool_context.state.get(LAST_ACTIVITY_CARD_STATE_KEY)
    return value if isinstance(value, dict) else {}


def _remember_care_response(
    tool_context: ToolContext | None,
    response: dict[str, Any],
) -> None:
    if tool_context is None:
        return
    recommendations = response.get("recommendations")
    if isinstance(recommendations, list):
        tool_context.state[LAST_CARE_RECOMMENDATIONS_STATE_KEY] = recommendations
    selected = response.get("selected")
    if isinstance(selected, dict):
        tool_context.state[LAST_CARE_SELECTION_STATE_KEY] = selected
    activity = response.get("activity")
    if isinstance(activity, dict):
        tool_context.state[LAST_CARE_SELECTION_STATE_KEY] = {
            "id": activity.get("sourceItemId", ""),
            "kind": activity.get("kind", ""),
            "title": activity.get("title", ""),
        }


def _resolve_care_selection(
    *,
    tool_context: ToolContext | None,
    kind: str | None,
    query: str | None,
    source_item_id: str | None,
) -> dict[str, Any]:
    state_selection = _get_last_care_selection(tool_context)
    if source_item_id:
        remembered = _find_remembered_care_option(
            tool_context=tool_context,
            kind=kind,
            predicate=lambda item: str(item.get("id", "")).strip() == source_item_id,
        )
        return remembered or {"id": source_item_id, "kind": kind or state_selection.get("kind", "")}

    query_text = _clean_string(query).lower()
    if not query_text:
        return state_selection

    ordinal_index = _selection_ordinal_index(query_text)
    if ordinal_index is not None:
        remembered = _remembered_care_options(tool_context, kind=kind)
        if 0 <= ordinal_index < len(remembered):
            return remembered[ordinal_index]

    query_terms = [term for term in query_text.replace(",", " ").split() if len(term) >= 2]
    if not query_terms:
        return state_selection

    remembered = _find_remembered_care_option(
        tool_context=tool_context,
        kind=kind,
        predicate=lambda item: all(
            term in " ".join(
                str(item.get(key, ""))
                for key in ["id", "title", "provider", "category", "detail", "location"]
            ).lower()
            for term in query_terms
        ),
    )
    return remembered or state_selection


def _get_last_care_selection(tool_context: ToolContext | None) -> dict[str, Any]:
    if tool_context is None:
        return {}
    value = tool_context.state.get(LAST_CARE_SELECTION_STATE_KEY)
    return value if isinstance(value, dict) else {}


def _remembered_care_options(
    tool_context: ToolContext | None,
    *,
    kind: str | None,
) -> list[dict[str, Any]]:
    if tool_context is None:
        return []
    value = tool_context.state.get(LAST_CARE_RECOMMENDATIONS_STATE_KEY)
    if not isinstance(value, list):
        return []
    options = [item for item in value if isinstance(item, dict)]
    if not kind:
        return options
    normalized_kind = _normalize_care_kind_hint(kind)
    return [
        item
        for item in options
        if str(item.get("kind", "")).strip().lower() in {normalized_kind, ""}
    ]


def _find_remembered_care_option(
    *,
    tool_context: ToolContext | None,
    kind: str | None,
    predicate: Any,
) -> dict[str, Any]:
    for item in _remembered_care_options(tool_context, kind=kind):
        if predicate(item):
            return item
    return {}


def _selection_ordinal_index(query_text: str) -> int | None:
    ordinal_words = {
        "first": 0,
        "1st": 0,
        "second": 1,
        "2nd": 1,
        "third": 2,
        "3rd": 2,
        "fourth": 3,
        "4th": 3,
    }
    for word, index in ordinal_words.items():
        if word in query_text.split():
            return index
    for token in query_text.replace("#", " ").split():
        if token.isdigit():
            value = int(token)
            if value > 0:
                return value - 1
    return None


def _normalize_care_kind_hint(kind: str | None) -> str:
    normalized = _clean_string(kind).lower()
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
        "meal": "food",
        "food_delivery": "food",
        "appointment": "doctor",
        "doctor_booking": "doctor",
        "test": "lab",
        "lab_test": "lab",
        "lab_booking": "lab",
    }
    return aliases.get(normalized, normalized)


def _load_mapping_section(
    section: str,
    fallback: dict[str, Any] | None = None,
) -> dict[str, Any]:
    payload = get_section(section)
    if isinstance(payload, dict):
        return payload
    return dict(fallback or {})


def _load_list_section(section: str) -> list[dict[str, Any]]:
    payload = get_section(section)
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    return []


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
    card = {
        "id": str(item.get("id", "")),
        "kind": "schedule",
        "title": str(item.get("title", "Untitled activity")),
        "category": str(item.get("type", "General")),
        "status": status,
        "timeLabel": time_label,
        "supportingText": " · ".join(supporting_parts) or "Scheduled activity",
        "scheduledFor": time_label or None,
    }
    _copy_optional_text_fields(item, card, ["completionNote", "completedAt"])
    return card


def _serialize_task_item(task: dict[str, Any]) -> dict[str, Any]:
    status = _normalize_task_status(task.get("status"))
    due_date = str(task.get("dueDate", "")).strip()
    priority = str(task.get("priority", "")).strip()
    supporting_parts = [
        f"{priority.title()} priority" if priority else "",
        f"Due {due_date}" if due_date else "",
    ]
    card = {
        "id": str(task.get("id", "")),
        "kind": "task",
        "title": str(task.get("title", "Untitled task")),
        "category": str(task.get("category", "General")),
        "status": status,
        "timeLabel": due_date or "Any time",
        "supportingText": " · ".join(part for part in supporting_parts if part) or "Open task",
        "scheduledFor": due_date or None,
    }
    _copy_optional_text_fields(task, card, ["completionNote", "completedAt"])
    return card


def _copy_optional_text_fields(
    source: dict[str, Any],
    target: dict[str, Any],
    fields: list[str],
) -> None:
    for field in fields:
        value = _clean_string(source.get(field))
        if value:
            target[field] = value


def _clean_string(value: Any) -> str:
    return str(value or "").strip()


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
