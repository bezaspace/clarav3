import unittest

from seed import seed_database_if_empty
from voice_assistant.db import get_section
from voice_assistant.db import reset_sections
from voice_assistant.db import save_sections


class StartupSeedTest(unittest.TestCase):
    def setUp(self):
        reset_sections()

    def tearDown(self):
        reset_sections()

    def test_seed_database_if_empty_populates_required_sections(self):
        seeded = seed_database_if_empty()

        self.assertIn("journal_entries", seeded)
        self.assertIn("journal_cbt_notes", seeded)
        self.assertGreater(len(get_section("journal_entries")), 0)
        self.assertGreater(len(get_section("journal_cbt_notes")), 0)

    def test_seed_database_if_empty_preserves_existing_non_empty_section(self):
        existing_entry = {
            "id": "custom",
            "date": "29 April, 2026",
            "title": "Custom",
            "excerpt": "Keep this.",
            "mood": "Calm",
            "tags": [],
        }
        save_sections({"journal_entries": [existing_entry]})

        seed_database_if_empty()

        self.assertEqual(get_section("journal_entries"), [existing_entry])
        self.assertGreater(len(get_section("journal_cbt_notes")), 0)

    def test_seed_database_if_empty_skips_full_database(self):
        first_seeded = seed_database_if_empty()
        second_seeded = seed_database_if_empty()

        self.assertGreater(len(first_seeded), 0)
        self.assertEqual(second_seeded, [])


if __name__ == "__main__":
    unittest.main()
