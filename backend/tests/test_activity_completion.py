import unittest

from voice_assistant.activity_completion import complete_activity
from voice_assistant.agent import create_voice_assistant_agent
from voice_assistant.db import get_section
from voice_assistant.db import reset_sections
from voice_assistant.db import save_sections
from voice_assistant.journal import create_journal_task
from voice_assistant.journal import load_journal_tasks
from voice_assistant.tools import get_today_schedule
from voice_assistant.tools import log_activity_completion


class ActivityCompletionTest(unittest.TestCase):
    def setUp(self):
        reset_sections()

    def tearDown(self):
        reset_sections()

    def test_completes_schedule_item_with_note(self):
        save_sections(
            {
                "dashboard": {
                    "todaysSchedule": [
                        {
                            "id": 1,
                            "time": "08:00 AM",
                            "title": "Breakfast",
                            "type": "Diet",
                            "duration": "320 kcal",
                            "status": "pending",
                        },
                        {
                            "id": 2,
                            "time": "09:30 AM",
                            "title": "Multivitamin",
                            "type": "Medicine",
                            "duration": "After breakfast",
                            "status": "pending",
                        },
                    ]
                }
            }
        )

        result = complete_activity(
            item_kind="schedule",
            item_id="1",
            completion_note="Ate most of the planned breakfast and tolerated it well.",
        )

        schedule = get_section("dashboard")["todaysSchedule"]
        self.assertEqual(result["item"]["status"], "completed")
        self.assertEqual(schedule[0]["completionNote"], "Ate most of the planned breakfast and tolerated it well.")
        self.assertEqual(schedule[1]["status"], "pending")
        self.assertIn("completedAt", schedule[0])

    def test_completes_task_with_note(self):
        task = create_journal_task(title="Buy groceries")

        result = complete_activity(
            item_kind="task",
            item_id=task["id"],
            completion_note="Completed the grocery errand without issues.",
        )

        updated = load_journal_tasks()[0]
        self.assertEqual(result["item"]["status"], "completed")
        self.assertEqual(updated["completionNote"], "Completed the grocery errand without issues.")
        self.assertIn("completedAt", updated)

    def test_completion_tool_returns_updated_activity_card(self):
        save_sections(
            {
                "dashboard": {
                    "todaysSchedule": [
                        {
                            "id": 8,
                            "time": "01:30 PM",
                            "title": "Lunch",
                            "type": "Diet",
                            "duration": "450 kcal",
                            "status": "pending",
                        }
                    ]
                }
            }
        )

        response = log_activity_completion(
            item_kind="schedule",
            item_id="8",
            completion_note="Finished lunch; no nausea or discomfort reported.",
        )

        self.assertEqual(response["type"], "activity_completion_logged")
        self.assertEqual(response["activityCard"]["status"], "completed")
        self.assertEqual(response["activityCard"]["completionNote"], "Finished lunch; no nausea or discomfort reported.")
        self.assertIn("completedAt", response["activityCard"])

    def test_activity_card_serialization_preserves_completion_fields(self):
        save_sections(
            {
                "dashboard": {
                    "todaysSchedule": [
                        {
                            "id": "a1",
                            "time": "10:00 AM",
                            "title": "Walk",
                            "type": "Body",
                            "duration": "20 min",
                            "status": "completed",
                            "completionNote": "Walk completed at an easy pace.",
                            "completedAt": "2026-05-02T10:30:00+05:30",
                        }
                    ]
                },
                "journal_tasks": [],
            }
        )

        payload = get_today_schedule(date="2026-05-02")

        self.assertEqual(payload["items"][0]["completionNote"], "Walk completed at an easy pace.")
        self.assertEqual(payload["items"][0]["completedAt"], "2026-05-02T10:30:00+05:30")

    def test_agent_registers_completion_tool(self):
        agent = create_voice_assistant_agent()

        tool_names = [getattr(tool, "__name__", str(tool)) for tool in agent.tools]

        self.assertIn("log_activity_completion", tool_names)


if __name__ == "__main__":
    unittest.main()
