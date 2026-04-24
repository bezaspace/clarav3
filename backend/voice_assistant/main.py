import asyncio
import json
import base64
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI
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

from voice_assistant.agent import voice_assistant_agent
from voice_assistant.monkey_patch import patch_gemini_3_1_support


patch_gemini_3_1_support()


env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)


APP_NAME = "clara3_voice_assistant"
USER_ID = "anonymous"
session_service = InMemorySessionService()
runner: Runner | None = None
session_resumption_handles: dict[str, str] = {}


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
    global runner
    runner = Runner(
        agent=voice_assistant_agent,
        app_name=APP_NAME,
        session_service=session_service,
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


async def _get_or_create_session(session_id: str) -> Session:
    session = await session_service.get_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=session_id,
    )
    if session:
        return session

    return await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=session_id,
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
    if runner is None:
        await websocket.close(code=1011, reason="Runner is not initialized")
        return

    await websocket.accept()
    send_lock = asyncio.Lock()
    live_request_queue = LiveRequestQueue()

    async def send_json(message: dict[str, object]) -> None:
        async with send_lock:
            await websocket.send_json(message)

    try:
        init_raw = await websocket.receive_text()
        init_message = _parse_client_message(init_raw)
        if not isinstance(init_message, SessionInitMessage):
            raise ValueError("The first websocket message must be session_init.")

        session_id = init_message.session_id or str(uuid.uuid4())
        session = await _get_or_create_session(session_id)

        await send_json(_server_message("session_started", session_id=session_id))
        await send_json(_server_message("state", state="idle"))

        async def forward_events() -> None:
            run_config = _build_run_config(session_id)

            async for event in runner.run_live(
                session=session,
                live_request_queue=live_request_queue,
                run_config=run_config,
            ):
                if event.live_session_resumption_update:
                    update = event.live_session_resumption_update
                    if update.resumable and update.new_handle:
                        session_resumption_handles[session_id] = update.new_handle

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

                if event.output_transcription and event.output_transcription.text:
                    await send_json(
                        _server_message(
                            "assistant_text",
                            text=event.output_transcription.text,
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
                incoming = await websocket.receive()

                if incoming.get("bytes") is not None:
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
            return_when=asyncio.FIRST_EXCEPTION,
        )

        for task in done:
            task.result()

        for task in pending:
            task.cancel()

    except WebSocketDisconnect:
        pass
    except (ValidationError, ValueError, json.JSONDecodeError) as exc:
        await send_json(_server_message("error", message=str(exc)))
        await websocket.close(code=1003, reason="Invalid websocket message")
    except Exception as exc:
        await send_json(_server_message("error", message=str(exc)))
        await websocket.close(code=1011, reason="Internal websocket error")
    finally:
        live_request_queue.close()
