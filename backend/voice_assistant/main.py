import asyncio
import base64
import json
import logging
import os
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Literal

from voice_assistant.db import get_section

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi import HTTPException
from fastapi import WebSocket
from fastapi import WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from google.adk.agents import LiveRequestQueue
from google.adk.agents.run_config import RunConfig
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.sessions import Session
from google.genai import types
from pydantic import BaseModel
from pydantic import ValidationError

from voice_assistant.agent import create_voice_assistant_agent
from voice_assistant.agent import voice_assistant_agent
from voice_assistant.care import create_care_activity
from voice_assistant.care import delete_care_activity
from voice_assistant.care import load_care_activity
from voice_assistant.journal import create_cbt_note
from voice_assistant.journal import create_journal_entry
from voice_assistant.journal import create_journal_task
from voice_assistant.journal import delete_journal_task
from voice_assistant.journal import load_journal
from voice_assistant.journal import update_journal_task
from voice_assistant.monkey_patch import patch_gemini_3_1_support
from seed import seed_database_if_empty
from seed_data import get_seed_payload
from voice_assistant.tools import SCHEDULE_SUMMARY_STATE_KEY
from voice_assistant.tools import SCHEDULE_TIMEZONE_STATE_KEY


patch_gemini_3_1_support()


env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)


APP_NAME = "clara3_voice_assistant"
USER_ID = "anonymous"
LOG_LEVEL = os.getenv("VOICE_ASSISTANT_LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("voice_assistant.live")
session_service = InMemorySessionService()
session_resumption_handles: dict[str, str] = {}
SEED_PAYLOAD = get_seed_payload()


class SessionInitMessage(BaseModel):
    type: Literal["session_init"]
    session_id: str | None = None


class ActivityStartMessage(BaseModel):
    type: Literal["activity_start"]


class ActivityEndMessage(BaseModel):
    type: Literal["activity_end"]


class DisconnectMessage(BaseModel):
    type: Literal["disconnect"]


class PttStartMessage(BaseModel):
    type: Literal["ptt_start"]


class PttEndMessage(BaseModel):
    type: Literal["ptt_end"]


class StopSessionMessage(BaseModel):
    type: Literal["stop_session"]


class CreateCareActivityRequest(BaseModel):
    sourceItemId: str
    note: str | None = None
    scheduledFor: str | None = None
    slotId: str | None = None
    fulfillment: str | None = None
    quantity: int | None = None


class CreateJournalEntryRequest(BaseModel):
    title: str
    content: str
    mood: str | None = None
    tags: list[str] | None = None
    source: Literal["assistant", "manual"] = "manual"


class CreateCbtNoteRequest(BaseModel):
    situation: str
    thought: str
    feeling: str
    reframe: str
    action: str
    linkedEntryId: str | None = None
    source: Literal["assistant", "manual"] = "manual"


class CreateJournalTaskRequest(BaseModel):
    title: str
    priority: Literal["low", "medium", "high"] = "medium"
    category: str = "Mind"
    dueDate: str = "Today"
    status: Literal["todo", "in-progress", "completed"] = "todo"
    source: Literal["assistant", "manual"] = "manual"


class UpdateJournalTaskRequest(BaseModel):
    title: str | None = None
    status: Literal["todo", "in-progress", "completed"] | None = None
    priority: Literal["low", "medium", "high"] | None = None
    category: str | None = None
    dueDate: str | None = None


ClientMessage = (
    SessionInitMessage
    | ActivityStartMessage
    | ActivityEndMessage
    | DisconnectMessage
    | PttStartMessage
    | PttEndMessage
    | StopSessionMessage
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    seeded_sections = seed_database_if_empty()
    if seeded_sections:
        logger.info("db.seed_startup sections=%s", seeded_sections)
    else:
        logger.info("db.seed_startup skipped=true")

    tool_names = [getattr(tool, "__name__", str(tool)) for tool in voice_assistant_agent.tools]
    logger.info(
        "runner.init model=%s tools=%s",
        voice_assistant_agent.model,
        tool_names,
    )
    yield


app = FastAPI(title="AyuCare Voice Assistant API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


def _load_payload(section: str, fallback: Any) -> Any:
    payload = get_section(section)
    if payload is None:
        return fallback
    return payload


def _load_dashboard_payload() -> dict[str, Any]:
    payload = _load_payload("dashboard", SEED_PAYLOAD["dashboard"])
    if not isinstance(payload, dict):
        return SEED_PAYLOAD["dashboard"]
    if not isinstance(payload.get("profile"), dict):
        return SEED_PAYLOAD["dashboard"]
    if not isinstance(payload.get("todaysSchedule"), list):
        return SEED_PAYLOAD["dashboard"]
    return payload


@app.get("/api/dashboard")
async def get_dashboard():
    return _load_dashboard_payload()


@app.get("/api/care/products")
async def get_care_products():
    return _load_payload("care_products", [])


@app.get("/api/care/professionals")
async def get_care_professionals():
    return _load_payload("care_professionals", [])


@app.get("/api/care/food")
async def get_care_food():
    return _load_payload("care_food", [])


@app.get("/api/care/activity")
async def get_care_activity(active_only: bool = False):
    return load_care_activity(active_only=active_only)


@app.post("/api/care/orders")
async def create_care_order(request: CreateCareActivityRequest):
    try:
        return create_care_activity(
            "product",
            request.sourceItemId,
            note=request.note,
            scheduled_for=request.scheduledFor,
            slot_id=request.slotId,
            fulfillment=request.fulfillment,
            quantity=request.quantity,
        )
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@app.post("/api/care/food-orders")
async def create_care_food_order(request: CreateCareActivityRequest):
    try:
        return create_care_activity(
            "food",
            request.sourceItemId,
            note=request.note,
            scheduled_for=request.scheduledFor,
            slot_id=request.slotId,
            fulfillment=request.fulfillment,
            quantity=request.quantity,
        )
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@app.post("/api/care/bookings")
async def create_care_booking(kind: Literal["doctor", "lab"], request: CreateCareActivityRequest):
    try:
        return create_care_activity(
            kind,
            request.sourceItemId,
            note=request.note,
            scheduled_for=request.scheduledFor,
            slot_id=request.slotId,
            fulfillment=request.fulfillment,
            quantity=request.quantity,
        )
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@app.delete("/api/care/activity/{activity_id}")
async def remove_care_activity(activity_id: str):
    try:
        return delete_care_activity(activity_id)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@app.get("/api/journal")
async def get_journal():
    return load_journal()


@app.post("/api/journal/entries")
async def create_journal_entry_route(request: CreateJournalEntryRequest):
    try:
        return create_journal_entry(
            title=request.title,
            content=request.content,
            mood=request.mood,
            tags=request.tags,
            source=request.source,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.post("/api/journal/cbt-notes")
async def create_cbt_note_route(request: CreateCbtNoteRequest):
    try:
        return create_cbt_note(
            situation=request.situation,
            thought=request.thought,
            feeling=request.feeling,
            reframe=request.reframe,
            action=request.action,
            linked_entry_id=request.linkedEntryId,
            source=request.source,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.post("/api/journal/tasks")
async def create_journal_task_route(request: CreateJournalTaskRequest):
    try:
        return create_journal_task(
            title=request.title,
            priority=request.priority,
            category=request.category,
            due_date=request.dueDate,
            status=request.status,
            source=request.source,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.patch("/api/journal/tasks/{task_id}")
async def update_journal_task_route(task_id: str, request: UpdateJournalTaskRequest):
    try:
        return update_journal_task(
            task_id,
            title=request.title,
            status=request.status,
            priority=request.priority,
            category=request.category,
            due_date=request.dueDate,
        )
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@app.delete("/api/journal/tasks/{task_id}")
async def delete_journal_task_route(task_id: str):
    try:
        return delete_journal_task(task_id)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@app.get("/api/progress/biomarkers")
async def get_progress_biomarkers():
    return {
        "biomarkers": _load_payload("biomarkers", []),
        "summary": _load_payload("biomarkers_summary", {}),
    }


@app.get("/api/progress/diet")
async def get_progress_diet():
    return _load_payload("diet", {"historyData": [], "sattvicGoal": 0})


@app.get("/api/progress/mental")
async def get_progress_mental():
    return _load_payload("mental_health", {"historyData": [], "adherenceData": [], "quickStats": {}})


@app.get("/api/progress/workouts")
async def get_progress_workouts():
    return _load_payload("workouts", {"workoutData": [], "sessions": [], "milestone": {}})


@app.get("/api/progress/medication")
async def get_progress_medication():
    return _load_payload("medication", {"overview": {}, "adherenceRows": []})


def _parse_client_message(raw_message: str) -> ClientMessage:
    payload = json.loads(raw_message)
    message_type = payload.get("type")

    if message_type == "session_init":
        return SessionInitMessage.model_validate(payload)
    if message_type == "activity_start":
        return ActivityStartMessage.model_validate(payload)
    if message_type == "activity_end":
        return ActivityEndMessage.model_validate(payload)
    if message_type == "disconnect":
        return DisconnectMessage.model_validate(payload)
    if message_type == "ptt_start":
        return PttStartMessage.model_validate(payload)
    if message_type == "ptt_end":
        return PttEndMessage.model_validate(payload)
    if message_type == "stop_session":
        return StopSessionMessage.model_validate(payload)

    raise ValueError(f"Unsupported message type: {message_type!r}")


def _build_schedule_context() -> tuple[dict[str, Any], str]:
    dashboard = _load_payload("dashboard", {})
    journal_tasks = _load_payload("journal_tasks", [])

    todays_schedule = dashboard.get("todaysSchedule", [])
    profile = dashboard.get("profile", {})
    profile_name = str(profile.get("name", "")).strip()
    pending_schedule_count = sum(
        1 for item in todays_schedule if str(item.get("status", "")).strip().lower() != "completed"
    )
    pending_task_count = sum(
        1 for task in journal_tasks if str(task.get("status", "")).strip().lower() != "completed"
    )
    summary_parts = [
        f"User name: {profile_name}." if profile_name else "",
        f"Today's schedule has {len(todays_schedule)} items with {pending_schedule_count} still pending.",
        f"There are {pending_task_count} open journal tasks.",
        "The user's local timezone is Asia/Kolkata.",
    ]
    summary = " ".join(part for part in summary_parts if part)
    state = {
        "app:schedule_available": True,
        "app:profile_name": profile_name,
        "app:schedule_item_count": len(todays_schedule),
        "app:pending_schedule_count": pending_schedule_count,
        "app:pending_journal_task_count": pending_task_count,
        SCHEDULE_TIMEZONE_STATE_KEY: "Asia/Kolkata",
        SCHEDULE_SUMMARY_STATE_KEY: summary,
    }
    return state, summary


async def _get_or_create_session(session_id: str, state: dict[str, Any]) -> Session:
    session = await session_service.get_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=session_id,
    )
    if session:
        logger.info("session.resume session_id=%s", session_id)
        return session

    logger.info("session.create session_id=%s", session_id)
    return await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=session_id,
        state=state,
    )


def _build_run_config(session_id: str) -> RunConfig:
    return RunConfig(
        response_modalities=[types.Modality.AUDIO],
        input_audio_transcription=types.AudioTranscriptionConfig(),
        output_audio_transcription=types.AudioTranscriptionConfig(),
        realtime_input_config=types.RealtimeInputConfig(
            activity_handling=types.ActivityHandling.START_OF_ACTIVITY_INTERRUPTS,
            automatic_activity_detection=types.AutomaticActivityDetection(
                disabled=True,
                start_of_speech_sensitivity=types.StartSensitivity.START_SENSITIVITY_HIGH,
                end_of_speech_sensitivity=types.EndSensitivity.END_SENSITIVITY_LOW,
                prefix_padding_ms=80,
                silence_duration_ms=300,
            ),
        ),
        context_window_compression=types.ContextWindowCompressionConfig(
            sliding_window=types.SlidingWindow()
        ),
        session_resumption=(
            types.SessionResumptionConfig(
                handle=session_resumption_handles.get(session_id),
            )
            if session_resumption_handles.get(session_id)
            else None
        ),
    )


def _server_message(message_type: str, **payload: object) -> dict[str, object]:
    return {"type": message_type, **payload}


def _get_function_responses(event: object) -> list[object]:
    getter = getattr(event, "get_function_responses", None)
    if callable(getter):
        return getter() or []
    return []


def _parse_function_response(function_response: object) -> dict[str, Any] | None:
    response = getattr(function_response, "response", None)
    if isinstance(response, dict):
        return response
    if isinstance(response, str):
        try:
            parsed = json.loads(response)
        except json.JSONDecodeError:
            return None
        return parsed if isinstance(parsed, dict) else None
    return None


def _extract_tool_payloads(event: object) -> list[dict[str, Any]]:
    payloads: list[dict[str, Any]] = []
    for function_response in _get_function_responses(event):
        parsed = _parse_function_response(function_response)
        if not parsed:
            continue
        if parsed.get("type") in {
            "current_activity",
            "schedule_snapshot",
            "health_snapshot",
            "care_activity_confirmation_required",
            "care_activity_created",
            "care_activity_error",
            "care_booking_slots",
            "care_order_review",
            "care_recommendations",
            "journal_confirmation_required",
            "journal_entry_created",
            "journal_cbt_note_created",
            "journal_task_created",
            "journal_task_updated",
            "journal_task_deleted",
            "journal_error",
            "activity_completion_logged",
            "activity_completion_error",
        }:
            payloads.append(parsed)
    return payloads


def _summarize_event(event: object) -> dict[str, object]:
    event_id = getattr(event, "id", None)
    invocation_id = getattr(event, "invocation_id", None)
    partial = getattr(event, "partial", None)
    interrupted = getattr(event, "interrupted", None)
    turn_complete = getattr(event, "turn_complete", None)
    input_text = getattr(getattr(event, "input_transcription", None), "text", None)
    output_text = getattr(getattr(event, "output_transcription", None), "text", None)
    function_calls = []
    function_responses = []
    if hasattr(event, "get_function_calls"):
        function_calls = [
            {
                "name": call.name,
                "args": call.args,
            }
            for call in event.get_function_calls()
        ]
    if _get_function_responses(event):
        function_responses = [
            {
                "name": getattr(response, "name", None),
                "response_keys": sorted((_parse_function_response(response) or {}).keys()),
            }
            for response in _get_function_responses(event)
        ]
    tool_payload_types = [
        payload.get("type")
        for payload in _extract_tool_payloads(event)
    ]
    audio_block_count = len(_iter_output_audio_blocks(event))
    return {
        "event_id": event_id,
        "invocation_id": invocation_id,
        "partial": partial,
        "interrupted": interrupted,
        "turn_complete": turn_complete,
        "input_text": input_text,
        "output_text": output_text,
        "function_calls": function_calls,
        "function_responses": function_responses,
        "tool_payload_types": tool_payload_types,
        "audio_block_count": audio_block_count,
    }


def _extract_audio_bytes(audio: object) -> bytes | None:
    if isinstance(audio, bytes):
        return audio
    if isinstance(audio, bytearray):
        return bytes(audio)
    if isinstance(audio, memoryview):
        return audio.tobytes()

    if hasattr(audio, "data"):
        data = getattr(audio, "data")
        if isinstance(data, str):
            try:
                return base64.b64decode(data)
            except Exception:
                return None
        if isinstance(data, memoryview):
            return data.tobytes()
        if isinstance(data, (bytes, bytearray)):
            return bytes(data)

    return None


def _extract_sample_rate(mime_type: str | None) -> int:
    if not mime_type:
        return 24000

    for token in mime_type.split(";"):
        token = token.strip().lower()
        if token.startswith("rate="):
            value = token.split("=", 1)[1].strip()
            if value.isdigit():
                return int(value)

    return 24000


def _iter_output_audio_blocks(event) -> list[tuple[bytes, int]]:
    audio_blocks: list[tuple[bytes, int]] = []

    output_audio = getattr(event, "output_audio", None)
    if output_audio is not None:
        inline_data = getattr(output_audio, "inline_data", None)
        audio_data = _extract_audio_bytes(output_audio)
        if audio_data is None and inline_data is not None:
            audio_data = _extract_audio_bytes(inline_data)

        if audio_data:
            mime_type = getattr(output_audio, "mime_type", None)
            if mime_type is None and inline_data is not None:
                mime_type = getattr(inline_data, "mime_type", None)
            sample_rate = getattr(output_audio, "sample_rate", None) or _extract_sample_rate(
                mime_type
            )
            audio_blocks.append((audio_data, int(sample_rate)))

    content = getattr(event, "content", None)
    if content is None:
        return audio_blocks

    parts = getattr(content, "parts", None)
    if not parts:
        return audio_blocks

    for part in parts:
        inline_data = getattr(part, "inline_data", None)
        if not inline_data:
            continue

        mime_type = getattr(inline_data, "mime_type", None) or ""
        if not isinstance(mime_type, str) or not mime_type.lower().startswith("audio/"):
            continue

        audio_data = _extract_audio_bytes(inline_data)
        if not audio_data:
            continue

        sample_rate = _extract_sample_rate(mime_type)
        audio_blocks.append((audio_data, sample_rate))

    return audio_blocks


@app.websocket("/live")
async def live(websocket: WebSocket):
    await websocket.accept()
    logger.info("ws.accept client_connected=true")
    send_lock = asyncio.Lock()
    live_request_queue = LiveRequestQueue()

    async def send_json(message: dict[str, object]) -> None:
        logger.info(
            "ws.send_json type=%s keys=%s",
            message.get("type"),
            sorted(message.keys()),
        )
        async with send_lock:
            await websocket.send_json(message)

    try:
        init_raw = await websocket.receive_text()
        logger.info("ws.receive_text initial=%s", init_raw)
        init_message = _parse_client_message(init_raw)
        if not isinstance(init_message, SessionInitMessage):
            raise ValueError("The first websocket message must be session_init.")

        session_id = init_message.session_id or str(uuid.uuid4())
        session_state, schedule_summary = _build_schedule_context()
        session = await _get_or_create_session(session_id, session_state)
        session_agent = create_voice_assistant_agent(schedule_summary=schedule_summary)
        runner = Runner(
            agent=session_agent,
            app_name=APP_NAME,
            session_service=session_service,
        )
        logger.info(
            "session.tools session_id=%s tools=%s state_keys=%s",
            session_id,
            [getattr(tool, "__name__", str(tool)) for tool in session_agent.tools],
            sorted(session.state.keys()),
        )

        await send_json(_server_message("session_started", session_id=session_id))
        await send_json(_server_message("state", state="idle"))

        async def forward_events() -> None:
            run_config = _build_run_config(session_id)

            async for event in runner.run_live(
                session=session,
                live_request_queue=live_request_queue,
                run_config=run_config,
            ):
                logger.info("runner.event %s", json.dumps(_summarize_event(event), default=str))
                if event.live_session_resumption_update:
                    update = event.live_session_resumption_update
                    if update.resumable and update.new_handle:
                        session_resumption_handles[session_id] = update.new_handle
                        logger.info(
                            "session.resumption_update session_id=%s resumable=%s",
                            session_id,
                            update.resumable,
                        )

                if event.interrupted:
                    await send_json(_server_message("interrupted"))

                if event.input_transcription and event.input_transcription.text:
                    await send_json(
                        _server_message(
                            "assistant_text",
                            text=event.input_transcription.text,
                            speaker="user",
                        )
                    )

                for payload in _extract_tool_payloads(event):
                    await send_json(payload)

                if event.output_transcription and event.output_transcription.text:
                    await send_json(
                        _server_message(
                            "assistant_text",
                            text=event.output_transcription.text,
                            speaker="assistant",
                        )
                    )

                content = getattr(event, "content", None)
                if content:
                    for part in getattr(content, "parts", []) or []:
                        if getattr(part, "text", None):
                            await send_json(
                                _server_message(
                                    "assistant_text",
                                    text=part.text,
                                    speaker="assistant",
                                )
                            )

                audio_blocks = _iter_output_audio_blocks(event)
                for audio_data, sample_rate in audio_blocks:
                    await websocket.send_bytes(audio_data)
                    await send_json(
                        _server_message(
                            "assistant_audio_format",
                            sampleRate=sample_rate,
                        )
                    )
                    await send_json(_server_message("state", state="speaking"))

                if event.turn_complete:
                    await send_json(_server_message("state", state="idle"))

        async def process_messages() -> None:
            while True:
                try:
                    incoming = await websocket.receive()
                except RuntimeError as error:
                    if "disconnect message has been received" in str(error):
                        logger.info("ws.disconnect already_received=true")
                        break
                    raise
                logger.info("ws.receive keys=%s", sorted(incoming.keys()))

                if incoming.get("type") == "websocket.disconnect":
                    logger.info(
                        "ws.disconnect code=%s reason=%s",
                        incoming.get("code"),
                        incoming.get("reason"),
                    )
                    break

                if incoming.get("bytes") is not None:
                    logger.info(
                        "ws.receive_audio bytes=%s",
                        len(incoming["bytes"]),
                    )
                    live_request_queue.send_realtime(
                        types.Blob(
                            data=incoming["bytes"],
                            mime_type="audio/pcm;rate=16000",
                        )
                    )
                    continue

                raw_message = incoming.get("text")
                if not raw_message:
                    continue

                logger.info("ws.receive_text payload=%s", raw_message)
                message = _parse_client_message(raw_message)

                if isinstance(message, (ActivityStartMessage, PttStartMessage)):
                    live_request_queue.send_activity_start()
                    await send_json(_server_message("state", state="listening"))
                    continue

                if isinstance(message, (ActivityEndMessage, PttEndMessage)):
                    live_request_queue.send_activity_end()
                    await send_json(_server_message("state", state="thinking"))
                    continue

                if isinstance(message, (DisconnectMessage, StopSessionMessage)):
                    break

                if isinstance(message, SessionInitMessage):
                    continue

        tasks = [
            asyncio.create_task(forward_events()),
            asyncio.create_task(process_messages()),
        ]
        done, pending = await asyncio.wait(
            tasks,
            return_when=asyncio.FIRST_COMPLETED,
        )

        for task in done:
            error = task.exception()
            if error is not None:
                raise error

        for task in pending:
            task.cancel()
        await asyncio.gather(*pending, return_exceptions=True)

    except WebSocketDisconnect:
        logger.info("ws.disconnect")
    except (ValidationError, ValueError, json.JSONDecodeError) as exc:
        logger.exception("ws.client_error")
        await send_json(_server_message("error", message=str(exc)))
        await websocket.close(code=1003, reason="Invalid websocket message")
    except Exception as exc:
        logger.exception("ws.internal_error")
        await send_json(_server_message("error", message=str(exc)))
        await websocket.close(code=1011, reason="Internal websocket error")
    finally:
        logger.info("ws.cleanup")
        live_request_queue.close()
