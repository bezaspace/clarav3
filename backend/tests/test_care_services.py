import asyncio
import unittest

from fastapi import HTTPException

from voice_assistant.agent import create_voice_assistant_agent
from voice_assistant.care import load_care_activity
from voice_assistant.db import reset_sections
from voice_assistant.db import save_sections
from voice_assistant.main import CreateCareActivityRequest
from voice_assistant.main import create_care_booking
from voice_assistant.main import create_care_food_order
from voice_assistant.main import create_care_order
from voice_assistant.main import get_care_activity
from voice_assistant.main import remove_care_activity
from voice_assistant.tools import manage_care_services


def seed_care_catalogs() -> None:
    save_sections(
        {
            "care_products": [
                {
                    "id": "p2",
                    "name": "Seasonal Fruit Basket",
                    "category": "Groceries",
                    "price": 180,
                    "unit": "4 fresh fruits",
                    "rating": 4.8,
                },
                {
                    "id": "p1",
                    "name": "Organic Apple Pack",
                    "category": "Groceries",
                    "price": 120,
                    "unit": "4 pcs",
                    "rating": 4.8,
                }
            ],
            "care_food": [
                {
                    "id": "f1",
                    "restaurant": "FitKitchen",
                    "name": "Quinoa Paneer Salad",
                    "category": "Healthy",
                    "price": 299,
                    "rating": 4.6,
                    "time": "30 min",
                    "veg": True,
                }
            ],
            "care_professionals": [
                {
                    "id": "d1",
                    "name": "Dr. Meera Rao",
                    "specialty": "Gastroenterologist",
                    "type": "Doctor",
                    "price": 1000,
                    "rating": 4.9,
                    "reviews": 100,
                    "location": "Bangalore",
                    "availability": "Today",
                    "isOnline": True,
                },
                {
                    "id": "l1",
                    "name": "Metric Pathology",
                    "specialty": "Full Body Checkup",
                    "type": "Lab",
                    "price": 1500,
                    "rating": 4.8,
                    "reviews": 200,
                    "location": "Bangalore",
                    "availability": "Home Collection",
                    "isOnline": False,
                },
            ],
        }
    )


class CareServicesTest(unittest.TestCase):
    def setUp(self):
        reset_sections()
        seed_care_catalogs()

    def tearDown(self):
        reset_sections()

    def test_manage_care_services_recommends_matching_options(self):
        response = manage_care_services(
            action="recommend",
            kind="food",
            query="healthy salad",
        )

        self.assertEqual(response["type"], "care_recommendations")
        self.assertEqual(response["recommendations"][0]["id"], "f1")
        self.assertEqual(response["recommendations"][0]["kind"], "food")

    def test_manage_care_services_returns_fruit_for_delivery_query(self):
        response = manage_care_services(
            action="recommend",
            kind="grocery",
            query="fresh fruit delivery",
        )

        self.assertEqual(response["type"], "care_recommendations")
        self.assertGreater(len(response["recommendations"]), 0)
        self.assertEqual(response["recommendations"][0]["id"], "p2")
        self.assertEqual(response["recommendations"][0]["title"], "Seasonal Fruit Basket")
        self.assertIn("image", response["recommendations"][0])
        self.assertIn("category", response["recommendations"][0])

    def test_manage_care_services_falls_back_when_query_has_no_exact_match(self):
        response = manage_care_services(
            action="recommend",
            kind="grocery",
            query="papaya home delivery",
        )

        self.assertEqual(response["type"], "care_recommendations")
        self.assertGreater(len(response["recommendations"]), 0)

    def test_manage_care_services_requires_confirmation_before_write(self):
        response = manage_care_services(
            action="create",
            kind="product",
            source_item_id="p1",
            confirmed=False,
        )

        self.assertEqual(response["type"], "care_activity_confirmation_required")
        self.assertEqual(load_care_activity(), [])

    def test_manage_care_services_creates_confirmed_booking(self):
        response = manage_care_services(
            action="create",
            kind="doctor",
            source_item_id="d1",
            confirmed=True,
            note="Bloating",
        )

        self.assertEqual(response["type"], "care_activity_created")
        self.assertEqual(response["activity"]["kind"], "doctor")
        self.assertEqual(response["activity"]["sourceItemId"], "d1")
        self.assertEqual(load_care_activity()[0]["note"], "Bloating")

    def test_api_routes_create_and_list_activity(self):
        asyncio.run(create_care_order(CreateCareActivityRequest(sourceItemId="p1")))
        asyncio.run(create_care_food_order(CreateCareActivityRequest(sourceItemId="f1")))
        asyncio.run(create_care_booking("doctor", CreateCareActivityRequest(sourceItemId="d1")))
        asyncio.run(create_care_booking("lab", CreateCareActivityRequest(sourceItemId="l1")))

        activity = asyncio.run(get_care_activity(active_only=True))
        self.assertEqual(
            [record["kind"] for record in activity],
            ["lab", "doctor", "food", "product"],
        )

    def test_api_route_deletes_activity(self):
        created = asyncio.run(create_care_order(CreateCareActivityRequest(sourceItemId="p1")))

        deleted = asyncio.run(remove_care_activity(created["id"]))

        self.assertEqual(deleted["status"], "deleted")
        self.assertEqual(load_care_activity(), [])

    def test_api_route_rejects_unknown_delete(self):
        with self.assertRaises(HTTPException) as error:
            asyncio.run(remove_care_activity("missing"))

        self.assertEqual(error.exception.status_code, 404)

    def test_api_route_rejects_unknown_item(self):
        with self.assertRaises(HTTPException) as error:
            asyncio.run(create_care_order(CreateCareActivityRequest(sourceItemId="missing")))

        self.assertEqual(error.exception.status_code, 404)

    def test_agent_registers_manage_care_services_tool(self):
        agent = create_voice_assistant_agent()

        tool_names = [getattr(tool, "__name__", str(tool)) for tool in agent.tools]

        self.assertIn("manage_care_services", tool_names)


if __name__ == "__main__":
    unittest.main()
