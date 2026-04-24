# AyuCare Voice Assistant Backend

Backend for the healthcare app's AI-powered live voice assistant, built with FastAPI and Google ADK.

## Structure

- `voice_assistant/agent.py` — ADK agent definition.
- `voice_assistant/main.py` — FastAPI app + `/live` WebSocket.
- `voice_assistant/monkey_patch.py` — compatibility patch for Gemini 3.1 Live behavior.
- `.env.example` — copy and fill API config.

## Setup

1. Copy the sample environment file:

```bash
cd backend
cp .env.example voice_assistant/.env
```

2. Edit `voice_assistant/.env` and set:

- `GOOGLE_API_KEY`
- `VOICE_ASSISTANT_MODEL` (defaults to `gemini-3.1-flash-live-preview`)
- `GOOGLE_GENAI_USE_VERTEXAI` (usually `False` for direct API usage)

3. Install backend dependencies:

```bash
uv sync
```

## Seed mock data into SQLite

Run this once after setup to populate the shared `app_sections` table used by all pages:

```bash
cd backend
python seed.py
```

This writes `backend/data/clara.db` with the same mock payloads used across dashboard, care, and progress pages.

## Run

```bash
uv run uvicorn voice_assistant.main:app --host 127.0.0.1 --port 8000 --reload
```

## Health check

- `GET /health` should return `{ "status": "ok" }`
- Voice flow endpoint: `ws://127.0.0.1:8000/live`
