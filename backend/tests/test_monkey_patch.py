import unittest

from google.adk.utils.variant_utils import GoogleLLMVariant
from google.genai import types

from voice_assistant.monkey_patch import _patched_receive
from voice_assistant.monkey_patch import _patched_send_content


class FakeLiveSession:
    session_id = "live-session-1"

    def __init__(self, messages=None):
        self.messages = messages or []
        self.generic_sends = []
        self.tool_responses = []

    async def receive(self):
        for message in self.messages:
            yield message

    async def send(self, **kwargs):
        self.generic_sends.append(kwargs)

    async def send_tool_response(self, *, function_responses):
        self.tool_responses.append(function_responses)


class FakeConnection:
    def __init__(self, session):
        self._gemini_session = session
        self._api_backend = GoogleLLMVariant.GEMINI_API
        self._model_version = "gemini-3.1-flash-live-preview"
        self._input_transcription_text = ""
        self._output_transcription_text = ""


class GeminiLivePatchTest(unittest.IsolatedAsyncioTestCase):
    async def test_receive_yields_tool_call_without_turn_complete(self):
        function_call = types.FunctionCall(
            id="call-1",
            name="get_current_schedule_item",
            args={},
        )
        message = types.LiveServerMessage(
            tool_call=types.LiveServerToolCall(function_calls=[function_call]),
        )
        connection = FakeConnection(FakeLiveSession([message]))

        responses = [response async for response in _patched_receive(connection)]

        self.assertEqual(len(responses), 1)
        response_function_calls = [
            part.function_call
            for part in responses[0].content.parts
            if part.function_call
        ]
        self.assertEqual(response_function_calls, [function_call])

    async def test_function_responses_use_live_tool_response_api(self):
        function_response = types.FunctionResponse(
            id="call-1",
            name="get_current_schedule_item",
            response={"result": {"type": "current_activity"}},
        )
        content = types.Content(
            role="user",
            parts=[types.Part(function_response=function_response)],
        )
        session = FakeLiveSession()
        connection = FakeConnection(session)

        await _patched_send_content(connection, content)

        self.assertEqual(session.tool_responses, [[function_response]])
        self.assertEqual(session.generic_sends, [])


if __name__ == "__main__":
    unittest.main()
