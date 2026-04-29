from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import uuid4
from zoneinfo import ZoneInfo

from voice_assistant.db import get_section
from voice_assistant.db import save_sections


LOCAL_TIMEZONE = ZoneInfo("Asia/Kolkata")
JOURNAL_ENTRIES_SECTION = "journal_entries"
JOURNAL_TASKS_SECTION = "journal_tasks"
JOURNAL_CBT_NOTES_SECTION = "journal_cbt_notes"

TASK_STATUSES = {"todo", "in-progress", "completed"}
TASK_PRIORITIES = {"low", "medium", "high"}
JOURNAL_ITEM_TYPES = {"reflection", "cbt_note", "task"}


def load_journal() -> dict[str, Any]:
    return {
        "tasks": load_journal_tasks(),
        "entries": load_journal_entries(),
        "cbtNotes": load_cbt_notes(),
    }


def load_journal_entries() -> list[dict[str, Any]]:
    return [_normalize_entry(entry) for entry in _load_list_section(JOURNAL_ENTRIES_SECTION)]


def load_journal_tasks() -> list[dict[str, Any]]:
    return [_normalize_task(task) for task in _load_list_section(JOURNAL_TASKS_SECTION)]


def load_cbt_notes() -> list[dict[str, Any]]:
    return [_normalize_cbt_note(note) for note in _load_list_section(JOURNAL_CBT_NOTES_SECTION)]


def create_journal_entry(
    *,
    title: str,
    content: str,
    mood: str | None = None,
    tags: list[str] | None = None,
    source: str = "manual",
) -> dict[str, Any]:
    normalized_title = _required_text(title, "A journal title is required.")
    normalized_content = _required_text(content, "Journal content is required.")
    now = datetime.now(LOCAL_TIMEZONE)
    entry = {
        "id": _new_id("entry"),
        "createdAt": now.isoformat(),
        "date": _format_date(now),
        "time": _format_time(now),
        "title": normalized_title,
        "excerpt": _excerpt(normalized_content),
        "content": normalized_content,
        "mood": _clean_text(mood) or "Reflective",
        "tags": _normalize_tags(tags),
        "source": _normalize_source(source),
    }
    save_sections({JOURNAL_ENTRIES_SECTION: [entry, *load_journal_entries()]})
    return entry


def create_cbt_note(
    *,
    situation: str,
    thought: str,
    feeling: str,
    reframe: str,
    action: str,
    source: str = "manual",
    linked_entry_id: str | None = None,
) -> dict[str, Any]:
    now = datetime.now(LOCAL_TIMEZONE)
    note = {
        "id": _new_id("cbt"),
        "createdAt": now.isoformat(),
        "date": _format_date(now),
        "time": _format_time(now),
        "situation": _required_text(situation, "A CBT situation is required."),
        "thought": _required_text(thought, "A CBT thought is required."),
        "feeling": _required_text(feeling, "A CBT feeling is required."),
        "reframe": _required_text(reframe, "A CBT reframe is required."),
        "action": _required_text(action, "A CBT action is required."),
        "source": _normalize_source(source),
    }
    linked_id = _clean_text(linked_entry_id)
    if linked_id:
        note["linkedEntryId"] = linked_id
    save_sections({JOURNAL_CBT_NOTES_SECTION: [note, *load_cbt_notes()]})
    return note


def create_journal_task(
    *,
    title: str,
    priority: str | None = None,
    category: str | None = None,
    due_date: str | None = None,
    status: str | None = None,
    source: str = "manual",
) -> dict[str, Any]:
    now = datetime.now(LOCAL_TIMEZONE)
    task = {
        "id": _new_id("task"),
        "title": _required_text(title, "A task title is required."),
        "status": _normalize_task_status(status),
        "priority": _normalize_priority(priority),
        "category": _clean_text(category) or "Mind",
        "dueDate": _clean_text(due_date) or "Today",
        "createdAt": now.isoformat(),
        "updatedAt": now.isoformat(),
        "source": _normalize_source(source),
    }
    save_sections({JOURNAL_TASKS_SECTION: [task, *load_journal_tasks()]})
    return task


def update_journal_task(
    task_id: str,
    *,
    title: str | None = None,
    status: str | None = None,
    priority: str | None = None,
    category: str | None = None,
    due_date: str | None = None,
) -> dict[str, Any]:
    normalized_id = _required_text(task_id, "A task id is required.")
    tasks = load_journal_tasks()
    updated_task: dict[str, Any] | None = None
    updated_tasks = []
    for task in tasks:
        if str(task.get("id", "")).strip() != normalized_id:
            updated_tasks.append(task)
            continue

        updated_task = dict(task)
        if title is not None:
            updated_task["title"] = _required_text(title, "A task title cannot be empty.")
        if status is not None:
            updated_task["status"] = _normalize_task_status(status)
        if priority is not None:
            updated_task["priority"] = _normalize_priority(priority)
        if category is not None:
            updated_task["category"] = _clean_text(category) or "Mind"
        if due_date is not None:
            updated_task["dueDate"] = _clean_text(due_date) or "Today"
        updated_task["updatedAt"] = datetime.now(LOCAL_TIMEZONE).isoformat()
        updated_tasks.append(updated_task)

    if updated_task is None:
        raise ValueError(f"Unknown journal task: {task_id}")

    save_sections({JOURNAL_TASKS_SECTION: updated_tasks})
    return updated_task


def delete_journal_task(task_id: str) -> dict[str, Any]:
    normalized_id = _required_text(task_id, "A task id is required.")
    tasks = load_journal_tasks()
    remaining = [task for task in tasks if str(task.get("id", "")).strip() != normalized_id]
    if len(remaining) == len(tasks):
        raise ValueError(f"Unknown journal task: {task_id}")
    save_sections({JOURNAL_TASKS_SECTION: remaining})
    return {
        "id": normalized_id,
        "status": "deleted",
    }


def build_journal_tool_response(
    *,
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
) -> dict[str, Any]:
    normalized_action = str(action or "propose").strip().lower()
    try:
        normalized_item_type = _normalize_item_type(item_type)
    except ValueError as error:
        return _journal_error(str(error))

    if normalized_action == "list":
        return {
            "type": "journal_snapshot",
            "status": "success",
            "message": "Loaded journal items.",
            "journal": load_journal(),
        }

    if normalized_action == "propose" and confirmed:
        normalized_action = "create"

    if normalized_action == "propose":
        return _confirmation_required(
            normalized_item_type,
            _build_preview(
                normalized_item_type,
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
                status=status,
            ),
        )

    if normalized_action in {"create", "update_task", "delete_task"} and not confirmed:
        return _confirmation_required(
            normalized_item_type,
            _build_preview(
                normalized_item_type,
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
            ),
        )

    try:
        if normalized_action == "create":
            return _create_tool_item(
                normalized_item_type,
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
                status=status,
            )
        if normalized_action == "update_task":
            task = update_journal_task(
                task_id or "",
                title=task_title or title,
                status=status,
                priority=priority,
                category=category,
                due_date=due_date,
            )
            return {
                "type": "journal_task_updated",
                "status": "success",
                "message": f"Updated {task['title']}.",
                "task": task,
            }
        if normalized_action == "delete_task":
            deleted = delete_journal_task(task_id or "")
            return {
                "type": "journal_task_deleted",
                "status": "success",
                "message": "Deleted the journal task.",
                "task": deleted,
            }
    except ValueError as error:
        return _journal_error(str(error))

    return _journal_error(f"Unsupported journal action: {action}")


def _create_tool_item(item_type: str, **payload: Any) -> dict[str, Any]:
    if item_type == "reflection":
        if _looks_like_cbt_payload(payload):
            return _create_tool_item("cbt_note", **_coerce_reflection_to_cbt_payload(payload))
        entry = create_journal_entry(
            title=payload.get("title") or "Reflection",
            content=payload.get("content") or "",
            mood=payload.get("mood"),
            tags=payload.get("tags"),
            source="assistant",
        )
        return {
            "type": "journal_entry_created",
            "status": "success",
            "message": "Saved that reflection to your journal.",
            "entry": entry,
        }
    if item_type == "cbt_note":
        note = create_cbt_note(
            situation=payload.get("situation") or payload.get("title") or "",
            thought=payload.get("thought") or "",
            feeling=payload.get("feeling") or "",
            reframe=payload.get("reframe") or "",
            action=payload.get("action") or payload.get("content") or "",
            source="assistant",
        )
        return {
            "type": "journal_cbt_note_created",
            "status": "success",
            "message": "Saved that CBT note.",
            "cbtNote": note,
        }
    if item_type == "task":
        task = create_journal_task(
            title=payload.get("task_title") or payload.get("title") or "",
            priority=payload.get("priority"),
            category=payload.get("category"),
            due_date=payload.get("due_date"),
            status=payload.get("status"),
            source="assistant",
        )
        return {
            "type": "journal_task_created",
            "status": "success",
            "message": f"Added {task['title']} to your journal tasks.",
            "task": task,
        }
    return _journal_error(f"Unsupported journal item type: {item_type}")


def _looks_like_cbt_payload(payload: dict[str, Any]) -> bool:
    category = _clean_text(payload.get("category")).lower()
    title = _clean_text(payload.get("title")).lower()
    content = _clean_text(payload.get("content")).lower()
    return (
        category in {"thought_reframe", "thought-reframe", "cbt", "cbt_note"}
        or "reframe" in title
        or ("original thought:" in content and "reframe:" in content)
    )


def _coerce_reflection_to_cbt_payload(payload: dict[str, Any]) -> dict[str, Any]:
    content = _clean_text(payload.get("content"))
    thought = (
        _clean_text(payload.get("thought"))
        or _extract_labeled_value(content, "Original thought", ["Reframe", "Feeling", "Action"])
        or content
    )
    reframe = (
        _clean_text(payload.get("reframe"))
        or _extract_labeled_value(content, "Reframe", ["Action", "Feeling"])
        or content
    )
    return {
        **payload,
        "situation": _clean_text(payload.get("situation")) or _clean_text(payload.get("title")) or "Thought reframe",
        "thought": thought,
        "feeling": _clean_text(payload.get("feeling")) or "Worry",
        "reframe": reframe,
        "action": _clean_text(payload.get("action")) or "Return to this reframe when the worry comes up.",
    }


def _extract_labeled_value(
    content: str,
    label: str,
    stop_labels: list[str],
) -> str:
    normalized = str(content or "")
    lower_content = normalized.lower()
    label_marker = f"{label.lower()}:"
    start = lower_content.find(label_marker)
    if start < 0:
        return ""

    value_start = start + len(label_marker)
    value_end = len(normalized)
    for stop_label in stop_labels:
        stop_marker = f"{stop_label.lower()}:"
        stop_index = lower_content.find(stop_marker, value_start)
        if stop_index >= 0:
            value_end = min(value_end, stop_index)
    return normalized[value_start:value_end].strip()


def _confirmation_required(item_type: str, preview: dict[str, Any]) -> dict[str, Any]:
    return {
        "type": "journal_confirmation_required",
        "status": "confirmation_required",
        "itemType": item_type,
        "message": "Please confirm before I save this to your journal.",
        "preview": preview,
    }


def _journal_error(message: str) -> dict[str, Any]:
    return {
        "type": "journal_error",
        "status": "error",
        "message": message,
    }


def _build_preview(item_type: str, **payload: Any) -> dict[str, Any]:
    if item_type == "reflection":
        content = _clean_text(payload.get("content"))
        return {
            "title": _clean_text(payload.get("title")) or "Reflection",
            "content": content,
            "excerpt": _excerpt(content) if content else "",
            "mood": _clean_text(payload.get("mood")) or "Reflective",
            "tags": _normalize_tags(payload.get("tags")),
        }
    if item_type == "cbt_note":
        return {
            "situation": _clean_text(payload.get("situation")),
            "thought": _clean_text(payload.get("thought")),
            "feeling": _clean_text(payload.get("feeling")),
            "reframe": _clean_text(payload.get("reframe")),
            "action": _clean_text(payload.get("action")) or _clean_text(payload.get("content")),
        }
    return {
        "id": _clean_text(payload.get("task_id")),
        "title": _clean_text(payload.get("task_title")) or _clean_text(payload.get("title")),
        "status": _clean_text(payload.get("status")) or "todo",
        "priority": _clean_text(payload.get("priority")) or "medium",
        "category": _clean_text(payload.get("category")) or "Mind",
        "dueDate": _clean_text(payload.get("due_date")) or "Today",
    }


def _normalize_entry(entry: dict[str, Any]) -> dict[str, Any]:
    created_at = _clean_text(entry.get("createdAt"))
    date_label = _clean_text(entry.get("date"))
    time_label = _clean_text(entry.get("time"))
    content = _clean_text(entry.get("content")) or _clean_text(entry.get("excerpt"))
    return {
        "id": str(entry.get("id", "")),
        "createdAt": created_at,
        "date": date_label or _date_from_created_at(created_at),
        "time": time_label,
        "title": _clean_text(entry.get("title")) or "Untitled reflection",
        "excerpt": _clean_text(entry.get("excerpt")) or _excerpt(content),
        "content": content,
        "mood": _clean_text(entry.get("mood")) or "Reflective",
        "tags": _normalize_tags(entry.get("tags")),
        "source": _normalize_source(entry.get("source")),
    }


def _normalize_cbt_note(note: dict[str, Any]) -> dict[str, Any]:
    created_at = _clean_text(note.get("createdAt"))
    normalized = {
        "id": str(note.get("id", "")),
        "createdAt": created_at,
        "date": _clean_text(note.get("date")) or _date_from_created_at(created_at),
        "time": _clean_text(note.get("time")),
        "situation": _clean_text(note.get("situation")),
        "thought": _clean_text(note.get("thought")),
        "feeling": _clean_text(note.get("feeling")),
        "reframe": _clean_text(note.get("reframe")),
        "action": _clean_text(note.get("action")),
        "source": _normalize_source(note.get("source")),
    }
    linked_id = _clean_text(note.get("linkedEntryId"))
    if linked_id:
        normalized["linkedEntryId"] = linked_id
    return normalized


def _normalize_task(task: dict[str, Any]) -> dict[str, Any]:
    normalized = {
        "id": str(task.get("id", "")),
        "title": _clean_text(task.get("title")) or "Untitled task",
        "status": _normalize_task_status(task.get("status")),
        "priority": _normalize_priority(task.get("priority")),
        "category": _clean_text(task.get("category")) or "Mind",
        "dueDate": _clean_text(task.get("dueDate")) or "Today",
    }
    for key in ["createdAt", "updatedAt", "source"]:
        value = _clean_text(task.get(key))
        if value:
            normalized[key] = _normalize_source(value) if key == "source" else value
    return normalized


def _load_list_section(section: str) -> list[dict[str, Any]]:
    payload = get_section(section)
    if not isinstance(payload, list):
        return []
    return [item for item in payload if isinstance(item, dict)]


def _normalize_item_type(value: str | None) -> str:
    normalized = str(value or "").strip().lower().replace("-", "_")
    aliases = {
        "entry": "reflection",
        "journal_entry": "reflection",
        "journal": "reflection",
        "reflection": "reflection",
        "cbt": "cbt_note",
        "cbt_note": "cbt_note",
        "note": "cbt_note",
        "mental_load_task": "task",
        "task": "task",
    }
    normalized = aliases.get(normalized, normalized)
    if normalized not in JOURNAL_ITEM_TYPES:
        raise ValueError(f"Unsupported journal item type: {value}")
    return normalized


def _normalize_task_status(value: Any) -> str:
    normalized = str(value or "todo").strip().lower()
    if normalized in {"pending", "open"}:
        return "todo"
    if normalized not in TASK_STATUSES:
        raise ValueError(f"Unsupported task status: {value}")
    return normalized


def _normalize_priority(value: Any) -> str:
    normalized = str(value or "medium").strip().lower()
    if normalized not in TASK_PRIORITIES:
        raise ValueError(f"Unsupported task priority: {value}")
    return normalized


def _normalize_source(value: Any) -> str:
    normalized = str(value or "manual").strip().lower()
    if normalized == "assistant":
        return "assistant"
    return "manual"


def _normalize_tags(tags: Any) -> list[str]:
    if not isinstance(tags, list):
        return []
    return [_clean_text(tag) for tag in tags if _clean_text(tag)]


def _required_text(value: Any, message: str) -> str:
    normalized = _clean_text(value)
    if not normalized:
        raise ValueError(message)
    return normalized


def _clean_text(value: Any) -> str:
    return str(value or "").strip()


def _excerpt(content: str, limit: int = 140) -> str:
    normalized = " ".join(str(content or "").split())
    if len(normalized) <= limit:
        return normalized
    return f"{normalized[:limit].rstrip()}..."


def _format_date(value: datetime) -> str:
    return value.strftime("%d %B, %Y").lstrip("0")


def _format_time(value: datetime) -> str:
    return value.strftime("%I:%M %p").lstrip("0")


def _date_from_created_at(created_at: str) -> str:
    if not created_at:
        return ""
    try:
        return _format_date(datetime.fromisoformat(created_at))
    except ValueError:
        return ""


def _new_id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex[:12]}"
