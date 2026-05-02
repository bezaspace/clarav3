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


class FakeToolContext:
    def __init__(self):
        self.state = {}


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
                    "id": "d2",
                    "name": "Dr. Anil Verma",
                    "specialty": "General Physician",
                    "type": "Doctor",
                    "price": 700,
                    "rating": 4.7,
                    "reviews": 80,
                    "location": "Bangalore",
                    "availability": "Tomorrow",
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

        self.assertEqual(response["type"], "care_order_review")
        self.assertEqual(load_care_activity(), [])

    def test_manage_care_services_creates_confirmed_booking(self):
        response = manage_care_services(
            action="create",
            kind="doctor",
            source_item_id="d1",
            confirmed=True,
            note="Bloating",
            scheduled_for="Sat, 02 May at 10:30 AM",
            slot_id="doctor-d1-20260502-1",
        )

        self.assertEqual(response["type"], "care_activity_created")
        self.assertEqual(response["activity"]["kind"], "doctor")
        self.assertEqual(response["activity"]["sourceItemId"], "d1")
        self.assertEqual(response["activity"]["scheduledFor"], "Sat, 02 May at 10:30 AM")
        self.assertEqual(response["activity"]["slotId"], "doctor-d1-20260502-1")
        self.assertEqual(load_care_activity()[0]["note"], "Bloating")

    def test_manage_care_services_recommends_doctor_for_symptom_query(self):
        response = manage_care_services(
            action="recommend",
            kind="doctor",
            query="bloating and gas after meals",
        )

        self.assertEqual(response["type"], "care_recommendations")
        self.assertEqual(response["recommendations"][0]["id"], "d1")
        self.assertEqual(load_care_activity(), [])

    def test_manage_care_services_resolves_second_recommendation_from_context(self):
        context = FakeToolContext()
        recommend = manage_care_services(
            action="recommend",
            kind="doctor",
            query="doctor",
            tool_context=context,
        )
        self.assertGreaterEqual(len(recommend["recommendations"]), 2)

        response = manage_care_services(
            action="select",
            kind="doctor",
            query="the second one",
            tool_context=context,
        )

        self.assertEqual(response["type"], "care_booking_slots")
        self.assertEqual(response["selected"]["id"], recommend["recommendations"][1]["id"])

    def test_manage_care_services_returns_booking_slots_before_booking(self):
        response = manage_care_services(
            action="slots",
            kind="doctor",
            source_item_id="d1",
        )

        self.assertEqual(response["type"], "care_booking_slots")
        self.assertEqual(response["selected"]["id"], "d1")
        self.assertGreater(len(response["slots"]), 0)
        self.assertIn("scheduledFor", response["slots"][0])

    def test_manage_care_services_food_review_and_confirmed_order_metadata(self):
        review = manage_care_services(
            action="create",
            kind="food",
            source_item_id="f1",
            confirmed=False,
            quantity=2,
            fulfillment="Deliver now",
        )

        self.assertEqual(review["type"], "care_order_review")
        self.assertEqual(review["quantity"], 2)
        self.assertEqual(load_care_activity(), [])

        created = manage_care_services(
            action="create",
            kind="food",
            source_item_id="f1",
            confirmed=True,
            quantity=2,
            fulfillment="Deliver now",
        )

        self.assertEqual(created["type"], "care_activity_created")
        self.assertEqual(created["activity"]["quantity"], 2)
        self.assertEqual(created["activity"]["fulfillment"], "Deliver now")

    def test_api_routes_create_and_list_activity(self):
        asyncio.run(create_care_order(CreateCareActivityRequest(sourceItemId="p1", quantity=2)))
        asyncio.run(create_care_food_order(CreateCareActivityRequest(sourceItemId="f1")))
        asyncio.run(create_care_booking("doctor", CreateCareActivityRequest(sourceItemId="d1", scheduledFor="Sat, 02 May at 10:30 AM")))
        asyncio.run(create_care_booking("lab", CreateCareActivityRequest(sourceItemId="l1")))

        activity = asyncio.run(get_care_activity(active_only=True))
        self.assertEqual(
            [record["kind"] for record in activity],
            ["lab", "doctor", "food", "product"],
        )
        self.assertEqual(activity[1]["scheduledFor"], "Sat, 02 May at 10:30 AM")
        self.assertEqual(activity[3]["quantity"], 2)

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
