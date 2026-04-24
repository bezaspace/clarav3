from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any, Mapping


DB_PATH = Path(__file__).resolve().parent.parent / "data" / "clara.db"
SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS app_sections (
  section TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"""


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.execute("PRAGMA foreign_keys = ON")
    connection.row_factory = sqlite3.Row
    connection.execute(SCHEMA_SQL)
    connection.commit()
    return connection


def get_section(section: str) -> Any | None:
    conn = _connect()
    try:
        row = conn.execute(
            "SELECT payload FROM app_sections WHERE section = ?",
            (section,),
        ).fetchone()
    finally:
        conn.close()

    if row is None:
        return None
    return json.loads(row["payload"])


def save_sections(sections: Mapping[str, Any]) -> None:
    conn = _connect()
    try:
        conn.executemany(
            """
            INSERT INTO app_sections (section, payload)
            VALUES (?, ?)
            ON CONFLICT(section) DO UPDATE SET
                payload = excluded.payload,
                updated_at = datetime('now')
            """,
            ((key, json.dumps(value),) for key, value in sections.items()),
        )
        conn.commit()
    finally:
        conn.close()


def reset_sections() -> None:
    conn = _connect()
    try:
        conn.execute("DELETE FROM app_sections")
        conn.commit()
    finally:
        conn.close()

