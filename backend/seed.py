from __future__ import annotations

try:
    from voice_assistant.db import save_sections
except ModuleNotFoundError:
    from db import save_sections

try:
    from seed_data import get_seed_payload
except ModuleNotFoundError:
    from backend.seed_data import get_seed_payload


def main() -> None:
    payload = get_seed_payload()

    sections = {
        "dashboard": payload["dashboard"],
        "care_products": payload["care_products"],
        "care_professionals": payload["care_professionals"],
        "care_food": payload["care_food"],
        "care_activity": [],
        "journal_tasks": payload["journal_tasks"],
        "journal_entries": payload["journal_entries"],
        "biomarkers": payload["biomarkers"],
        "biomarkers_summary": payload["biomarkers_summary"],
        "diet": payload["diet"],
        "mental_health": payload["mental_health"],
        "workouts": payload["workouts"],
        "medication": payload["medication"],
    }
    save_sections(sections)
    print("Seed data loaded into SQLite database.")


if __name__ == "__main__":
    main()
