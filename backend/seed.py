from __future__ import annotations

try:
    from voice_assistant.db import get_section
    from voice_assistant.db import save_sections
except ModuleNotFoundError:
    from db import get_section
    from db import save_sections

try:
    from seed_data import get_seed_payload
except ModuleNotFoundError:
    from backend.seed_data import get_seed_payload


SEED_SECTION_KEYS = [
    "dashboard",
    "care_products",
    "care_professionals",
    "care_food",
    "care_activity",
    "journal_tasks",
    "journal_entries",
    "journal_cbt_notes",
    "biomarkers",
    "biomarkers_summary",
    "diet",
    "mental_health",
    "workouts",
    "medication",
]

REQUIRED_NON_EMPTY_SECTIONS = [
    "dashboard",
    "care_products",
    "care_professionals",
    "care_food",
    "journal_tasks",
    "journal_entries",
    "journal_cbt_notes",
    "biomarkers",
    "biomarkers_summary",
    "diet",
    "mental_health",
    "workouts",
    "medication",
]


def build_seed_sections() -> dict[str, object]:
    payload = get_seed_payload()

    return {
        "dashboard": payload["dashboard"],
        "care_products": payload["care_products"],
        "care_professionals": payload["care_professionals"],
        "care_food": payload["care_food"],
        "care_activity": [],
        "journal_tasks": payload["journal_tasks"],
        "journal_entries": payload["journal_entries"],
        "journal_cbt_notes": payload["journal_cbt_notes"],
        "biomarkers": payload["biomarkers"],
        "biomarkers_summary": payload["biomarkers_summary"],
        "diet": payload["diet"],
        "mental_health": payload["mental_health"],
        "workouts": payload["workouts"],
        "medication": payload["medication"],
    }


def seed_database() -> None:
    save_sections(build_seed_sections())


def seed_database_if_empty() -> list[str]:
    sections = build_seed_sections()
    missing_or_empty = [
        section
        for section in REQUIRED_NON_EMPTY_SECTIONS
        if _is_empty_payload(get_section(section))
    ]
    if not missing_or_empty:
        return []

    sections_to_seed = {
        section: sections[section]
        for section in SEED_SECTION_KEYS
        if section in missing_or_empty or get_section(section) is None
    }
    save_sections(sections_to_seed)
    return sorted(sections_to_seed)


def _is_empty_payload(payload: object) -> bool:
    if payload is None:
        return True
    if isinstance(payload, (list, dict)):
        return len(payload) == 0
    return False


def main() -> None:
    seed_database()
    print("Seed data loaded into SQLite database.")


if __name__ == "__main__":
    main()
