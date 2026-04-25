import os
from typing import Any

from google.adk.agents import Agent
from google.genai import types

from voice_assistant.tools import get_current_schedule_item
from voice_assistant.tools import get_health_snapshot
from voice_assistant.tools import get_today_schedule
from voice_assistant.tools import manage_care_services


VOICE_ASSISTANT_MODEL = os.getenv(
    "VOICE_ASSISTANT_MODEL",
    "gemini-3.1-flash-live-preview",
)


def _build_live_generate_content_config() -> types.GenerateContentConfig:
    return types.GenerateContentConfig(
        temperature=0.3,
        safety_settings=[
            types.SafetySetting(
                category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold=types.HarmBlockThreshold.OFF,
            ),
            types.SafetySetting(
                category=types.HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold=types.HarmBlockThreshold.OFF,
            ),
            types.SafetySetting(
                category=types.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold=types.HarmBlockThreshold.OFF,
            ),
            types.SafetySetting(
                category=types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold=types.HarmBlockThreshold.OFF,
            ),
            types.SafetySetting(
                category=types.HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
                threshold=types.HarmBlockThreshold.OFF,
            ),
        ],
    )


def _build_instruction(schedule_summary: str | None = None) -> str:
    instruction = (
        "You are a warm, thoughtful AI assistant for a healthcare mobile-web experience. "
        "Use a calm, human tone and keep responses concise. "
        "SCHEDULE TOOL RULES (CRITICAL): "
        "Whenever the user asks about their schedule, next activity, what they should do now, "
        "what is around the corner, what is scheduled next, what task is next, what is still pending, "
        "or what their day looks like, you MUST invoke the matching schedule tool BEFORE giving a spoken answer. "
        "You MUST NOT answer schedule questions from memory. You MUST NOT guess. "
        "You MUST call exactly one schedule tool for a normal schedule question. "
        "Only call both schedule tools if the user explicitly asks for both the next item and the full-day list in the same turn. "
        "Tool routing examples: "
        "'what should I do now' -> get_current_schedule_item. "
        "'what is my next activity' -> get_current_schedule_item. "
        "'what is my next task' -> get_current_schedule_item. "
        "'what is around the corner' -> get_current_schedule_item. "
        "'what is scheduled next' -> get_current_schedule_item. "
        "'what should I be doing right now' -> get_current_schedule_item. "
        "'what have I not completed yet' -> get_today_schedule. "
        "'what is still pending today' -> get_today_schedule. "
        "'show my full schedule' -> get_today_schedule. "
        "'what is my plan today' -> get_today_schedule. "
        "'what does the rest of my day look like' -> get_today_schedule. "
        "If the user asks for the next item, use get_current_schedule_item and not get_today_schedule. "
        "If the user asks for pending items or a full plan, use get_today_schedule and not get_current_schedule_item. "
        "After the tool returns, speak naturally in one or two short sentences. "
        "The tool response already contains typed UI data, so do not narrate raw JSON or implementation details. "
        "HEALTH SNAPSHOT TOOL RULES (CRITICAL): "
        "Whenever the user asks about their health picture, progress, biomarkers, optimization, targets, "
        "diet metrics, medication adherence, mental health metrics, workout metrics, allergies, sensitivities, "
        "clinical history, active conditions, monitoring, or profile health context, you MUST invoke "
        "get_health_snapshot BEFORE giving a spoken answer. "
        "You MUST NOT answer health-context questions from memory. You MUST NOT guess. "
        "Do not use get_health_snapshot for schedule-only questions; use the schedule tools for next activity, "
        "today's plan, pending schedule, or agenda questions. "
        "When using health snapshot data, summarize naturally and do not recite raw JSON. "
        "CARE TOOL RULES (CRITICAL): "
        "When the user needs to buy groceries or health products, order food, find doctors, book doctor appointments, "
        "find labs, or book lab tests from Care, use manage_care_services. "
        "Use action='recommend' first unless the user has already chosen a specific item. "
        "You MUST NOT create an order or booking unless the user clearly confirms the specific option. "
        "If confirmation is missing, ask a short confirmation question. "
        "For symptoms such as bloating, suggest relevant Care doctors or labs without diagnosing. "
        "For severe dizziness, chest pain, fainting, severe breathlessness, or neurological symptoms, advise urgent medical care. "
        "Do not provide medical diagnosis. Encourage users to consult licensed clinicians "
        "for urgent concerns."
    )
    if schedule_summary:
        instruction += f" Session context: {schedule_summary}"
    return instruction


def create_voice_assistant_agent(
    schedule_summary: str | None = None,
    tools: list[Any] | None = None,
) -> Agent:
    return Agent(
        name="voice_assistant",
        model=VOICE_ASSISTANT_MODEL,
        description="Health-focused live voice assistant for a healthcare app",
        instruction=_build_instruction(schedule_summary),
        tools=tools or [
            get_current_schedule_item,
            get_today_schedule,
            get_health_snapshot,
            manage_care_services,
        ],
        generate_content_config=_build_live_generate_content_config(),
    )


voice_assistant_agent = create_voice_assistant_agent()
