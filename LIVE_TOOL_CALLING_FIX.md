# Gemini Live Tool Calling Fix

## Quick Summary

The voice assistant was getting stuck on schedule questions because Gemini Live produced a tool call, but our ADK compatibility bridge did not pass that tool call to ADK immediately.

For normal spoken replies like "hi", this was not a problem because the model could answer directly with audio and transcript events. But for a schedule question like:

```text
What is the next task I should be doing according to my schedule?
```

the model needed to call `get_current_schedule_item` before it could answer. The Live API expects tool calls to be handled synchronously: receive the tool call, execute the local tool, send the tool response back, then let the model continue speaking. Our bridge was accidentally waiting for `turn_complete` before yielding the tool call to ADK. That meant ADK never got the chance to execute the schedule tool in time, so the frontend stayed in the "Processing" state.

The fix was to update `backend/voice_assistant/monkey_patch.py` so Live tool calls are yielded immediately and function responses are sent back with the current Gemini Live SDK method, `send_tool_response(...)`.

## What The User Saw

The assistant worked for a simple greeting:

```text
User: Hi
Assistant: Hi, Harsha. How can I help you today?
```

Then it got stuck when asked a schedule-aware question:

```text
User: What is the next task I should be doing according to my schedule?
```

In the UI, the right panel stayed on "Processing". No schedule card appeared in the chat.

In the backend logs, the important clue was this line:

```text
input_text: "What is the next task I should be doing according to my schedule?"
function_calls: []
function_responses: []
```

That told us three things:

1. The microphone and transcription path were working.
2. The backend WebSocket was receiving the user's question.
3. ADK was not seeing a schedule tool call after the transcription.

The problem was therefore not the microphone, frontend audio capture, schedule data, or card rendering. The failure was in the Live model to ADK tool-calling bridge.

## How This App Is Supposed To Work

The voice assistant has two important schedule tools:

```python
get_current_schedule_item
get_today_schedule
```

They are registered on the ADK agent in `backend/voice_assistant/agent.py`.

The agent instructions explicitly say that when the user asks about the next task, next activity, or what they should do now, the model must call `get_current_schedule_item` before answering.

The intended flow is:

1. User speaks into the browser.
2. Frontend streams PCM audio to the backend WebSocket at `/live`.
3. Backend forwards that audio to Gemini Live through ADK.
4. Gemini Live transcribes the user audio.
5. Gemini Live decides the question needs a tool.
6. Gemini Live emits a `tool_call` for `get_current_schedule_item`.
7. ADK executes the Python tool.
8. Backend receives the tool response payload, including the schedule card data.
9. Backend sends that payload to the frontend.
10. Frontend renders the activity card in the chat.
11. Gemini receives the tool response and speaks a natural answer.

The broken step was step 6 to step 7.

Gemini Live emitted a tool call, but the bridge did not yield it to ADK immediately, so ADK could not execute the tool at the right time.

## The Important Difference Between Normal Replies And Tool Replies

A normal reply does not need a local Python function. For example:

```text
User: Hi
Assistant: Hi, Harsha.
```

Gemini can answer this directly. The backend only has to forward audio and transcript events.

A schedule reply is different. Gemini does not have direct access to the schedule database. It must call one of our Python tools:

```python
get_current_schedule_item()
```

That means the Live session must pause model output, ask the application to run the tool, receive the tool result, and then continue.

This is called synchronous function calling. "Synchronous" here means the model is waiting for the tool result before it can properly finish the response.

If the app does not send the tool response back, the model is stuck waiting. That is exactly why the UI stayed on "Processing".

## What Was Wrong In The Existing Bridge

The project has a file named:

```text
backend/voice_assistant/monkey_patch.py
```

This file exists because the app needed compatibility behavior for Gemini 3.1 Flash Live and ADK.

Before the fix, the bridge had two main problems.

### Problem 1: Tool Calls Were Buffered Until `turn_complete`

The installed ADK receive loop collected Live API tool calls into an internal list called `tool_call_parts`.

Conceptually, it behaved like this:

```python
if message.tool_call:
    tool_call_parts.append(...)

if message.server_content.turn_complete:
    yield tool_call_parts
```

That is backwards for Live API synchronous tool use.

For Live API tool calling, the application needs to handle `message.tool_call` immediately. It should not wait for `turn_complete`.

The official Gemini Live flow is:

```python
async for response in session.receive():
    if response.tool_call:
        run_the_tool()
        await session.send_tool_response(...)
```

The model may not send a normal `turn_complete` before the tool is answered, because it is waiting for the tool answer. So if the bridge waits for `turn_complete` before yielding the tool call, the application can deadlock.

That is what happened here.

### Problem 2: Function Responses Used An Older Send Shape

The previous patch sent function responses through a generic send call:

```python
await session.send(
    input=types.LiveClientToolResponse(...)
)
```

The current Gemini Live SDK exposes a dedicated method for tool responses:

```python
await session.send_tool_response(function_responses=function_responses)
```

Using the dedicated method matches the current Live API contract and ADK's own updated implementation.

## How We Figured It Out

The investigation started from the logs.

The logs showed the user transcript arrived correctly:

```text
input_text: "What is the next task I should be doing according to my schedule?"
```

But the same event summaries repeatedly showed:

```text
function_calls: []
function_responses: []
```

That ruled out several possible causes:

- The browser was recording audio correctly.
- The backend WebSocket was receiving audio.
- Gemini was transcribing the audio.
- The schedule tool itself was registered on the agent.
- The frontend card rendering was not the first place to look, because no tool payload was being sent.

Next, we inspected the schedule tool directly. Calling `get_current_schedule_item(...)` by itself returned a valid `current_activity` payload with an `activityCard`. So the schedule tool was not broken.

Then we inspected the installed ADK Live connection code inside the virtual environment. The key discovery was that ADK's `GeminiLlmConnection.receive()` was buffering `message.tool_call` and only yielding it later when `turn_complete` arrived.

That behavior is risky for Live API synchronous tools because the model expects the tool response before it can complete the turn.

The result was a loop like this:

```text
Gemini: I need a schedule tool result before I can continue.
ADK bridge: I will only deliver the tool call after the turn completes.
Gemini: I cannot complete the turn until I get the tool result.
Frontend: Still Processing...
```

Once that loop was visible, the fix became clear.

## The Fix

The fix was implemented in:

```text
backend/voice_assistant/monkey_patch.py
```

### Fix 1: Yield Tool Calls Immediately

The patched receive loop now checks for `message.tool_call` and immediately yields an `LlmResponse` containing function-call parts:

```python
if message.tool_call:
    function_calls = message.tool_call.function_calls or []
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
```

This lets ADK see the function call right away. Once ADK sees it, ADK can execute the matching Python tool, such as:

```python
get_current_schedule_item()
```

That produces the schedule payload the frontend needs.

### Fix 2: Send Function Responses With `send_tool_response`

The patched send path now sends function responses like this:

```python
await self._gemini_session.send_tool_response(
    function_responses=function_responses,
)
```

This is the current Gemini Live SDK method for returning tool results to the model.

That matters because after ADK executes the schedule tool, Gemini still needs the result so it can speak a natural answer.

### Fix 3: Add Logging Around Tool Calls And Tool Responses

The patch also logs tool-call and tool-response names:

```text
live_patch.tool_call names=['get_current_schedule_item']
live_patch.send_tool_response names=['get_current_schedule_item']
```

These logs make future debugging much easier. If a schedule question fails again, we can quickly tell whether the model emitted a tool call and whether the app sent the response back.

## Why The Fix Worked

The fix worked because it restored the correct Live API timing.

Before:

```text
Live tool_call arrives
Bridge stores it
Bridge waits for turn_complete
Model waits for tool_response
Nothing moves forward
```

After:

```text
Live tool_call arrives
Bridge immediately yields it to ADK
ADK runs get_current_schedule_item
Backend sends schedule payload to frontend
Bridge sends tool_response back to Gemini
Gemini continues and speaks the answer
```

The frontend did not need a fallback because the real tool path now works. The card is rendered from the actual tool payload, not from a manually guessed schedule intent.

## Why We Did Not Add A Fallback

One tempting workaround would have been:

```text
If the user says "schedule", manually call the schedule tool from the backend.
```

That would have made the UI appear to work, but it would not have fixed the real issue. It would also create two separate tool-calling systems:

1. Real ADK/Gemini tool calls.
2. A custom backend fallback that bypasses the model.

That would make the app harder to reason about and easier to break later.

The right fix was to repair the main Live tool-calling pipeline so the assistant behaves the same way other ADK/Gemini Live apps do.

## Tests Added

A new test file was added:

```text
backend/tests/test_monkey_patch.py
```

The tests use fake Live sessions, so they do not call the real Gemini API.

The first test verifies that if Gemini Live emits a `tool_call` without `turn_complete`, the patched receive loop still yields the function call immediately.

The second test verifies that function responses are sent through:

```python
send_tool_response(...)
```

and not through the older generic send path.

The tests were run with:

```bash
cd backend
uv run python -m unittest discover -s tests -q
```

The changed files were also syntax-checked with:

```bash
cd backend
uv run python -m py_compile voice_assistant/monkey_patch.py tests/test_monkey_patch.py
```

## Files To Know

### `backend/voice_assistant/agent.py`

Defines the ADK agent and registers the tools:

```python
tools=[get_current_schedule_item, get_today_schedule]
```

This file tells the model that schedule questions must use schedule tools.

### `backend/voice_assistant/tools.py`

Contains the actual schedule tool implementations.

For this bug, the most relevant tool was:

```python
get_current_schedule_item
```

This function reads the dashboard and journal data, decides what schedule item is currently most relevant, and returns a payload containing an activity card.

### `backend/voice_assistant/main.py`

Contains the FastAPI app and `/live` WebSocket.

This file forwards browser audio to ADK and sends assistant transcript, audio, state, and tool payload messages back to the frontend.

### `backend/voice_assistant/monkey_patch.py`

Contains the compatibility patch for Gemini 3.1 Flash Live behavior.

This is where the actual bug was fixed.

### `frontend/src/pages/VoiceAssistant.tsx`

Contains the voice assistant UI.

It listens for backend messages like:

```text
current_activity
schedule_snapshot
assistant_text
state
```

When it receives a valid `current_activity` payload, it renders the schedule card in the chat.

## Mental Model For Future Debugging

When debugging this kind of issue, follow the pipeline in order:

```text
Browser mic
  -> WebSocket audio chunks
  -> Gemini input transcription
  -> Gemini tool_call
  -> ADK tool execution
  -> function_response back to Gemini
  -> backend tool payload to frontend
  -> frontend card rendering
  -> assistant spoken answer
```

Do not start by guessing at the UI. First find the earliest missing event.

In this case, the earliest missing event was the ADK-visible function call. The transcript existed, but the function call did not appear in the backend event summaries.

That pointed directly to the Live-to-ADK bridge.

## The Main Lesson

Gemini Live tool calling is timing-sensitive.

For ordinary text or audio responses, the app can wait for model output events. But for tool calls, the app must respond as soon as the model asks for the tool. Waiting for a final turn-complete signal can block the model, because the model may be waiting for the tool response before it can complete the turn.

The key rule is:

```text
Handle Live API tool_call messages immediately.
```

That rule is what this fix restores.
