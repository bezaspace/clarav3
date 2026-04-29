import unittest

from voice_assistant.agent import create_voice_assistant_agent
from voice_assistant.db import reset_sections
from voice_assistant.db import save_sections
from voice_assistant.journal import create_cbt_note
from voice_assistant.journal import create_journal_entry
from voice_assistant.journal import create_journal_task
from voice_assistant.journal import delete_journal_task
from voice_assistant.journal import load_cbt_notes
from voice_assistant.journal import load_journal
from voice_assistant.journal import load_journal_entries
from voice_assistant.journal import load_journal_tasks
from voice_assistant.journal import update_journal_task
from voice_assistant.tools import manage_journal


class JournalServicesTest(unittest.TestCase):
    def setUp(self):
        reset_sections()

    def tearDown(self):
        reset_sections()

    def test_loads_empty_journal_sections_safely(self):
        self.assertEqual(load_journal(), {"tasks": [], "entries": [], "cbtNotes": []})
        self.assertEqual(load_journal_entries(), [])
        self.assertEqual(load_cbt_notes(), [])
        self.assertEqual(load_journal_tasks(), [])

    def test_normalizes_legacy_journal_entry(self):
        save_sections(
            {
                "journal_entries": [
                    {
                        "id": "legacy",
                        "date": "23 April, 2026",
                        "title": "Morning Clarity",
                        "excerpt": "Good sleep helped.",
                        "mood": "Happy",
                        "tags": ["Sleep"],
                    }
                ]
            }
        )

        entry = load_journal_entries()[0]

        self.assertEqual(entry["id"], "legacy")
        self.assertEqual(entry["content"], "Good sleep helped.")
        self.assertEqual(entry["source"], "manual")
        self.assertIn("time", entry)

    def test_creates_journal_reflection(self):
        entry = create_journal_entry(
            title="Morning Clarity",
            content="I woke up calmer than usual.",
            mood="Calm",
            tags=["Sleep", "Mindfulness"],
        )

        self.assertEqual(entry["source"], "manual")
        self.assertEqual(load_journal_entries()[0]["id"], entry["id"])
        self.assertEqual(load_journal_entries()[0]["content"], "I woke up calmer than usual.")

    def test_creates_cbt_note(self):
        note = create_cbt_note(
            situation="Inbox was full",
            thought="I am behind.",
            feeling="Anxious",
            reframe="I can sort one thing at a time.",
            action="Clear the first message.",
        )

        self.assertEqual(note["situation"], "Inbox was full")
        self.assertEqual(load_cbt_notes()[0]["id"], note["id"])

    def test_creates_task(self):
        task = create_journal_task(
            title="Plan tomorrow",
            priority="high",
            category="Mind",
            due_date="Today",
        )

        self.assertEqual(task["status"], "todo")
        self.assertEqual(load_journal_tasks()[0]["title"], "Plan tomorrow")

    def test_updates_task_status_to_completed(self):
        task = create_journal_task(title="Close loop")

        updated = update_journal_task(task["id"], status="completed")

        self.assertEqual(updated["status"], "completed")
        self.assertEqual(load_journal_tasks()[0]["status"], "completed")

    def test_deletes_task(self):
        task = create_journal_task(title="Remove me")

        deleted = delete_journal_task(task["id"])

        self.assertEqual(deleted["status"], "deleted")
        self.assertEqual(load_journal_tasks(), [])

    def test_rejects_unknown_task_updates_and_deletes(self):
        with self.assertRaises(ValueError):
            update_journal_task("missing", status="completed")

        with self.assertRaises(ValueError):
            delete_journal_task("missing")

    def test_manage_journal_requires_confirmation_before_writes(self):
        response = manage_journal(
            action="create",
            item_type="reflection",
            title="Saved thought",
            content="This should wait for confirmation.",
            confirmed=False,
        )

        self.assertEqual(response["type"], "journal_confirmation_required")
        self.assertEqual(load_journal_entries(), [])

    def test_manage_journal_creates_only_after_confirmed_true(self):
        response = manage_journal(
            action="create",
            item_type="task",
            task_title="Buy notebook",
            priority="medium",
            category="Mind",
            due_date="Today",
            confirmed=True,
        )

        self.assertEqual(response["type"], "journal_task_created")
        self.assertEqual(load_journal_tasks()[0]["title"], "Buy notebook")
        self.assertEqual(load_journal_tasks()[0]["source"], "assistant")

    def test_manage_journal_creates_confirmed_default_action(self):
        response = manage_journal(
            item_type="reflection",
            content="I am having the second coffee of my day.",
            confirmed=True,
        )

        self.assertEqual(response["type"], "journal_entry_created")
        self.assertEqual(load_journal_entries()[0]["content"], "I am having the second coffee of my day.")

    def test_manage_journal_routes_reframed_reflection_to_cbt_note(self):
        response = manage_journal(
            action="create",
            item_type="reflection",
            title="Work Anxiety Conversation Reframe",
            content=(
                "Original thought: I'm worried I'm going to get fired because mass layoffs are happening. "
                "Reframe: While layoffs are happening, it doesn't mean I will definitely be affected."
            ),
            category="thought_reframe",
            confirmed=True,
        )

        self.assertEqual(response["type"], "journal_cbt_note_created")
        self.assertEqual(load_journal_entries(), [])
        self.assertEqual(load_cbt_notes()[0]["situation"], "Work Anxiety Conversation Reframe")
        self.assertIn("mass layoffs", load_cbt_notes()[0]["thought"])
        self.assertIn("doesn't mean", load_cbt_notes()[0]["reframe"])

    def test_agent_registers_manage_journal_tool(self):
        agent = create_voice_assistant_agent()

        tool_names = [getattr(tool, "__name__", str(tool)) for tool in agent.tools]

        self.assertIn("manage_journal", tool_names)


if __name__ == "__main__":
    unittest.main()
