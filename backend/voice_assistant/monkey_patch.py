"""Runtime ADK compatibility patch for Gemini 3.1 Flash Live."""

from __future__ import annotations

import logging
from typing import AsyncGenerator
from typing import TYPE_CHECKING

from google.adk.models.llm_response import LlmResponse
from google.adk.utils.context_utils import Aclosing
from google.adk.utils.variant_utils import GoogleLLMVariant
from google.genai import live
from google.genai import types

if TYPE_CHECKING:
    from google.adk.models.gemini_llm_connection import GeminiLlmConnection


logger = logging.getLogger("voice_assistant.monkey_patch")


def _is_gemini_3_1_model(model_version: str | None) -> bool:
    return bool(model_version and "3.1" in model_version)


def _build_full_text_response(
    connection: "GeminiLlmConnection",
    text: str,
) -> LlmResponse:
    return LlmResponse(
        content=types.Content(
            role="model",
            parts=[types.Part.from_text(text=text)],
        ),
        live_session_id=connection._gemini_session.session_id,
    )


async def _patched_send_content(self: "GeminiLlmConnection", content: types.Content) -> None:
    """Route Gemini 3.1 text turns through the realtime text channel."""
    assert content.parts
    if content.parts[0].function_response:
        function_responses = [part.function_response for part in content.parts]
        logger.info(
            "live_patch.send_tool_response names=%s",
            [response.name for response in function_responses],
        )
        await self._gemini_session.send_tool_response(
            function_responses=function_responses,
        )
        return

    if _is_gemini_3_1_model(getattr(self, "_model_version", None)):
        text_parts = [part.text for part in content.parts if part.text]
        if text_parts:
            await self._gemini_session.send_realtime_input(
                text="".join(text_parts)
            )
        return

    await self._gemini_session.send(
        input=types.LiveClientContent(
            turns=[content],
            turn_complete=True,
        )
    )


async def _patched_send_realtime(self: "GeminiLlmConnection", input) -> None:
    """Force audio blobs onto the new live API audio field."""
    if isinstance(input, types.Blob):
        if input.mime_type and input.mime_type.startswith("audio/"):
            await self._gemini_session.send_realtime_input(audio=input)
            return
        await self._gemini_session.send_realtime_input(media=input)
        return

    if isinstance(input, types.ActivityStart):
        await self._gemini_session.send_realtime_input(activity_start=input)
        return

    if isinstance(input, types.ActivityEnd):
        await self._gemini_session.send_realtime_input(activity_end=input)
        return

    raise ValueError(f"Unsupported input type: {type(input)}")


async def _patched_receive(
    self: "GeminiLlmConnection",
) -> AsyncGenerator[LlmResponse, None]:
    """Yield Gemini Live tool calls immediately so ADK can answer them."""
    text = ""
    async with Aclosing(self._gemini_session.receive()) as agen:
        async for message in agen:
            logger.debug("live_patch.receive message=%s", message)
            live_session_id = self._gemini_session.session_id

            if message.usage_metadata:
                yield LlmResponse(
                    usage_metadata=message.usage_metadata,
                    model_version=self._model_version,
                    live_session_id=live_session_id,
                )

            if message.server_content:
                content = message.server_content.model_turn
                if (
                    not (content and content.parts)
                    and message.server_content.grounding_metadata
                    and not message.server_content.turn_complete
                ):
                    yield LlmResponse(
                        grounding_metadata=message.server_content.grounding_metadata,
                        interrupted=message.server_content.interrupted,
                        model_version=self._model_version,
                        live_session_id=live_session_id,
                    )

                if content and content.parts:
                    llm_response = LlmResponse(
                        content=content,
                        interrupted=message.server_content.interrupted,
                        model_version=self._model_version,
                        live_session_id=live_session_id,
                    )
                    if not message.server_content.turn_complete:
                        llm_response.grounding_metadata = (
                            message.server_content.grounding_metadata
                        )
                    if content.parts[0].text:
                        text += content.parts[0].text
                        llm_response.partial = True
                    elif text and not content.parts[0].inline_data:
                        yield _build_full_text_response(self, text)
                        text = ""
                    yield llm_response

                if message.server_content.input_transcription:
                    if message.server_content.input_transcription.text:
                        self._input_transcription_text += (
                            message.server_content.input_transcription.text
                        )
                        yield LlmResponse(
                            input_transcription=types.Transcription(
                                text=message.server_content.input_transcription.text,
                                finished=False,
                            ),
                            partial=True,
                            model_version=self._model_version,
                            live_session_id=live_session_id,
                        )
                    if message.server_content.input_transcription.finished:
                        yield LlmResponse(
                            input_transcription=types.Transcription(
                                text=self._input_transcription_text,
                                finished=True,
                            ),
                            partial=False,
                            model_version=self._model_version,
                            live_session_id=live_session_id,
                        )
                        self._input_transcription_text = ""

                if message.server_content.output_transcription:
                    if message.server_content.output_transcription.text:
                        self._output_transcription_text += (
                            message.server_content.output_transcription.text
                        )
                        yield LlmResponse(
                            output_transcription=types.Transcription(
                                text=message.server_content.output_transcription.text,
                                finished=False,
                            ),
                            partial=True,
                            model_version=self._model_version,
                            live_session_id=live_session_id,
                        )
                    if message.server_content.output_transcription.finished:
                        yield LlmResponse(
                            output_transcription=types.Transcription(
                                text=self._output_transcription_text,
                                finished=True,
                            ),
                            partial=False,
                            model_version=self._model_version,
                            live_session_id=live_session_id,
                        )
                        self._output_transcription_text = ""

                if self._api_backend == GoogleLLMVariant.GEMINI_API and (
                    message.server_content.interrupted
                    or message.server_content.turn_complete
                    or message.server_content.generation_complete
                ):
                    if self._input_transcription_text:
                        yield LlmResponse(
                            input_transcription=types.Transcription(
                                text=self._input_transcription_text,
                                finished=True,
                            ),
                            partial=False,
                            model_version=self._model_version,
                            live_session_id=live_session_id,
                        )
                        self._input_transcription_text = ""
                    if self._output_transcription_text:
                        yield LlmResponse(
                            output_transcription=types.Transcription(
                                text=self._output_transcription_text,
                                finished=True,
                            ),
                            partial=False,
                            model_version=self._model_version,
                            live_session_id=live_session_id,
                        )
                        self._output_transcription_text = ""

                if (
                    message.server_content.interrupted
                    and not message.server_content.turn_complete
                ):
                    if text:
                        yield _build_full_text_response(self, text)
                        text = ""
                    else:
                        yield LlmResponse(
                            interrupted=message.server_content.interrupted,
                            model_version=self._model_version,
                            live_session_id=live_session_id,
                        )

            if message.tool_call:
                function_calls = message.tool_call.function_calls or []
                logger.info(
                    "live_patch.tool_call names=%s",
                    [function_call.name for function_call in function_calls],
                )
                if text:
                    yield _build_full_text_response(self, text)
                    text = ""
                yield LlmResponse(
                    content=types.Content(
                        role="model",
                        parts=[
                            types.Part(function_call=function_call)
                            for function_call in function_calls
                        ],
                    ),
                    model_version=self._model_version,
                    live_session_id=live_session_id,
                )

            if message.session_resumption_update:
                logger.debug("live_patch.session_resumption message=%s", message)
                yield LlmResponse(
                    live_session_resumption_update=message.session_resumption_update,
                    model_version=self._model_version,
                    live_session_id=live_session_id,
                )

            if message.go_away:
                logger.debug("live_patch.go_away message=%s", message.go_away)
                yield LlmResponse(
                    go_away=message.go_away,
                    model_version=self._model_version,
                    live_session_id=live_session_id,
                )

            if message.server_content and message.server_content.turn_complete:
                if text:
                    yield _build_full_text_response(self, text)
                    text = ""
                yield LlmResponse(
                    turn_complete=True,
                    interrupted=message.server_content.interrupted,
                    grounding_metadata=message.server_content.grounding_metadata,
                    model_version=self._model_version,
                    live_session_id=live_session_id,
                )
                break


def _build_patched_send_realtime_input(original_send_realtime_input):
    async def patched_send_realtime_input(
        self,
        *,
        media: types.Blob | dict | None = None,
        audio: types.Blob | dict | None = None,
        audio_stream_end: bool | None = None,
        video=None,
        text: str | None = None,
        activity_start=None,
        activity_end=None,
    ) -> None:
        if audio is None and isinstance(media, types.Blob):
            mime_type = media.mime_type or ""
            if mime_type.startswith("audio/"):
                audio = media
                media = None

        await original_send_realtime_input(
            self,
            media=media,
            audio=audio,
            audio_stream_end=audio_stream_end,
            video=video,
            text=text,
            activity_start=activity_start,
            activity_end=activity_end,
        )

    return patched_send_realtime_input


def patch_gemini_3_1_support() -> None:
    from google.adk.models import gemini_llm_connection

    gemini_llm_connection.GeminiLlmConnection.send_content = _patched_send_content
    gemini_llm_connection.GeminiLlmConnection.send_realtime = _patched_send_realtime
    gemini_llm_connection.GeminiLlmConnection.receive = _patched_receive
    live.AsyncSession.send_realtime_input = _build_patched_send_realtime_input(
        live.AsyncSession.send_realtime_input,
    )
