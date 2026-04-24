#!/usr/bin/env python3
"""Test script for get_current_schedule_item tool."""

import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from voice_assistant.db import save_sections, reset_sections
from voice_assistant.tools import get_current_schedule_item


def setup_test_data():
    """Populate database with test schedule and tasks."""
    sample_dashboard = {
        "todaysSchedule": [
            {
                "id": "1",
                "title": "Morning Standup",
                "type": "Work",
                "time": "09:00 AM",
                "duration": "30m",
                "status": "completed"
            },
            {
                "id": "2",
                "title": "Code Review",
                "type": "Work",
                "time": "10:00 AM",
                "duration": "1h",
                "status": "in-progress"
            },
            {
                "id": "3",
                "title": "Lunch Break",
                "type": "Personal",
                "time": "01:00 PM",
                "duration": "1h",
                "status": "pending"
            },
            {
                "id": "4",
                "title": "Team Meeting",
                "type": "Work",
                "time": "03:00 PM",
                "duration": "1h",
                "status": "pending"
            }
        ]
    }

    sample_journal_tasks = [
        {
            "id": "t1",
            "title": "Fix login bug",
            "category": "Development",
            "status": "pending",
            "priority": "high",
            "dueDate": "2025-04-25"
        },
        {
            "id": "t2",
            "title": "Update documentation",
            "category": "Documentation",
            "status": "completed",
            "priority": "medium",
            "dueDate": "2025-04-24"
        }
    ]

    save_sections({
        "dashboard": sample_dashboard,
        "journal_tasks": sample_journal_tasks
    })
    print("✓ Test data loaded into database")


def test_current_time():
    """Test with current time (no overrides)."""
    print("\n--- Test 1: Current Time ---")
    result = get_current_schedule_item()
    print(f"Message: {result['message']}")
    print(f"Activity Card: {result['activityCard']}")
    print(f"Generated At: {result['generatedAt']}")


def test_overdue_scenario():
    """Test with time override to simulate overdue item."""
    print("\n--- Test 2: Overdue Item (time set to 11:30 AM) ---")
    result = get_current_schedule_item(now_iso="2025-04-24T11:30:00+05:30")
    print(f"Message: {result['message']}")
    print(f"Activity Card: {result['activityCard']}")
    print(f"Current Item: {result['currentItem']}")


def test_upcoming_scenario():
    """Test with time override to simulate upcoming item."""
    print("\n--- Test 3: Upcoming Item (time set to 12:30 PM) ---")
    result = get_current_schedule_item(now_iso="2025-04-24T12:30:00+05:30")
    print(f"Message: {result['message']}")
    print(f"Activity Card: {result['activityCard']}")
    print(f"Upcoming Item: {result['upcomingItem']}")


def test_no_pending_items():
    """Test with all items completed."""
    print("\n--- Test 4: All Items Completed ---")
    all_completed_dashboard = {
        "todaysSchedule": [
            {
                "id": "1",
                "title": "Morning Standup",
                "type": "Work",
                "time": "09:00 AM",
                "duration": "30m",
                "status": "completed"
            }
        ]
    }
    save_sections({
        "dashboard": all_completed_dashboard,
        "journal_tasks": []
    })
    result = get_current_schedule_item()
    print(f"Message: {result['message']}")
    print(f"Activity Card: {result['activityCard']}")


def main():
    print("Testing get_current_schedule_item tool")
    print("=" * 50)

    # Reset and setup test data
    reset_sections()
    setup_test_data()

    # Run tests
    test_current_time()
    test_overdue_scenario()
    test_upcoming_scenario()
    test_no_pending_items()

    print("\n" + "=" * 50)
    print("All tests completed!")


if __name__ == "__main__":
    main()
