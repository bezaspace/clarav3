# Android Voice Assistant Frontend

This is a separate Kotlin/Jetpack Compose Android app scaffold using the existing FastAPI backend at `/backend/voice_assistant/main.py`.

## Where this is
- Folder: `/home/harsha/clarav3/android-voice-assistant`
- App package: `com.ayucare.voiceassistant`

## What is included
- Separate Assistant page with:
  - Live websocket client for `/live`
  - Hold-to-talk streaming capture (16kHz PCM)
  - Assistant audio playback
  - Immediate local playback interruption when hold-to-talk starts
  - Animated assistant aura with no visible transcripts
  - Soft pastel theme and wellness dashboard home
  - 6-tab bottom navigation (Home, Assistant, Progress, Care, Journal, Profile)

## Run on your machine
1. Start backend on same machine:
   - `cd /home/harsha/clarav3/backend`
   - `uv run uvicorn voice_assistant.main:app --host 0.0.0.0 --port 8000`
2. Build Android app:
   - `cd /home/harsha/clarav3/android-voice-assistant`
   - `gradle assembleDebug`
3. Install:
   - `gradle installDebug`

## Use with USB-connected phone
- If you are using 127.0.0.1 in the app, keep this running on your phone to forward ports:
  - `adb reverse tcp:8000 tcp:8000`
- The app defaults to `http://127.0.0.1:8000`, so `adb reverse` is the expected local development path.

## Notes
- This build is intentionally minimal and focused only on the AI Voice Assistant page for your next-step UX validation.
