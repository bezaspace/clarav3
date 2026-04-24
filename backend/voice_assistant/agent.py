import os

from google.adk.agents import Agent
from google.adk.models.google_llm import Gemini


VOICE_ASSISTANT_MODEL = os.getenv(
    "VOICE_ASSISTANT_MODEL",
    "gemini-3.1-flash-live-preview",
)


voice_assistant_agent = Agent(
    name="voice_assistant",
    model=Gemini(model=VOICE_ASSISTANT_MODEL),
    description="Health-focused live voice assistant for a healthcare app",
    instruction=(
        "You are a warm, thoughtful AI assistant for a healthcare mobile-web experience. "
        "Use a calm, human tone and keep responses concise. "
        "Do not provide medical diagnosis. Encourage users to consult licensed clinicians "
        "for urgent concerns."
    ),
)
