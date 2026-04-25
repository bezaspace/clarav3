import unittest

from voice_assistant.agent import create_voice_assistant_agent
from voice_assistant.db import reset_sections
from voice_assistant.db import save_sections
from voice_assistant.tools import get_health_snapshot


class HealthSnapshotToolTest(unittest.TestCase):
    def tearDown(self):
        reset_sections()

    def test_returns_dashboard_profile_and_progress_sections(self):
        save_sections(
            {
                "dashboard": {
                    "profile": {
                        "name": "Harsha",
                        "allergies": ["Peanuts", "Penicillin"],
                        "conditions": ["Seasonal Asthma"],
                        "history": [{"year": "2021", "event": "ACL Reconstruction"}],
                        "targets": [
                            {
                                "goal": "HbA1c Optimization",
                                "current": "6.2%",
                                "aim": "5.4%",
                                "effort": "High",
                            }
                        ],
                    },
                    "todaysSchedule": [{"id": 1, "title": "Breakfast"}],
                },
                "biomarkers": [
                    {
                        "id": "1",
                        "name": "HbA1c",
                        "baseline": 6.2,
                        "goal": 5.4,
                        "unit": "%",
                        "status": "concerning",
                    }
                ],
                "biomarkers_summary": {
                    "title": "Biological Optimization",
                    "priorityRisks": 3,
                },
                "diet": {"historyData": [{"date": "Apr 25", "protein": 100}], "sattvicGoal": 12},
                "mental_health": {
                    "historyData": [{"date": "Apr 25", "moodScore": 8}],
                    "adherenceData": [{"subject": "Meditation", "A": 85, "fullMark": 100}],
                    "quickStats": {"zenStreak": "14 Days"},
                },
                "workouts": {
                    "workoutData": [{"subject": "Yoga", "A": 120, "fullMark": 150}],
                    "sessions": [{"type": "Morning Yoga", "duration": "45 min"}],
                    "milestone": {"title": "12km Endurance"},
                },
                "medication": {
                    "overview": {"adherence": "92%"},
                    "adherenceRows": [{"id": 1, "level": 3}],
                },
            }
        )

        snapshot = get_health_snapshot()

        self.assertEqual(snapshot["type"], "health_snapshot")
        self.assertIn("generatedAt", snapshot)
        self.assertEqual(
            snapshot["sourceSections"],
            [
                "dashboard",
                "biomarkers",
                "biomarkers_summary",
                "diet",
                "mental_health",
                "workouts",
                "medication",
            ],
        )
        self.assertEqual(snapshot["dashboard"]["profile"]["allergies"], ["Peanuts", "Penicillin"])
        self.assertEqual(snapshot["dashboard"]["profile"]["conditions"], ["Seasonal Asthma"])
        self.assertEqual(snapshot["dashboard"]["profile"]["history"][0]["event"], "ACL Reconstruction")
        self.assertEqual(snapshot["dashboard"]["profile"]["targets"][0]["goal"], "HbA1c Optimization")
        self.assertEqual(snapshot["progress"]["biomarkers"][0]["name"], "HbA1c")
        self.assertEqual(snapshot["progress"]["biomarkersSummary"]["priorityRisks"], 3)
        self.assertEqual(snapshot["progress"]["diet"]["sattvicGoal"], 12)
        self.assertEqual(snapshot["progress"]["mentalHealth"]["quickStats"]["zenStreak"], "14 Days")
        self.assertEqual(snapshot["progress"]["workouts"]["sessions"][0]["type"], "Morning Yoga")
        self.assertEqual(snapshot["progress"]["medication"]["overview"]["adherence"], "92%")

    def test_uses_stable_defaults_for_missing_sections(self):
        reset_sections()

        snapshot = get_health_snapshot()

        self.assertEqual(snapshot["dashboard"], {"profile": {}, "todaysSchedule": []})
        self.assertEqual(snapshot["progress"]["biomarkers"], [])
        self.assertEqual(snapshot["progress"]["biomarkersSummary"], {})
        self.assertEqual(snapshot["progress"]["diet"], {"historyData": [], "sattvicGoal": 0})
        self.assertEqual(
            snapshot["progress"]["mentalHealth"],
            {"historyData": [], "adherenceData": [], "quickStats": {}},
        )
        self.assertEqual(
            snapshot["progress"]["workouts"],
            {"workoutData": [], "sessions": [], "milestone": {}},
        )
        self.assertEqual(snapshot["progress"]["medication"], {"overview": {}, "adherenceRows": []})

    def test_agent_registers_health_snapshot_tool(self):
        agent = create_voice_assistant_agent()

        tool_names = [getattr(tool, "__name__", str(tool)) for tool in agent.tools]

        self.assertIn("get_health_snapshot", tool_names)


if __name__ == "__main__":
    unittest.main()
