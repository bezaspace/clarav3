# Development Notes

Short local setup notes for avoiding known verification traps in this repo.

## Backend Tests

Run backend tests from `backend/` with `PYTHONPATH=.` so `voice_assistant` imports resolve:

```bash
cd /home/harsha/clarav3/backend
PYTHONPATH=. uv run --isolated --python 3.11 --frozen --with pytest pytest
```

Notes:
- Test paths from `backend/` should be `tests/...`, not `backend/tests/...`.
- The default local Python may be 3.14, where `google.adk` may not be available. Use Python 3.11 for reliable ADK test runs.

## Android Build

This app does not currently include a Gradle wrapper. Use system `gradle` from the Android project folder:

```bash
cd /home/harsha/clarav3/android-voice-assistant
gradle assembleDebug
```

If Kotlin reports daemon or incremental-cache errors with a newer JDK, let Gradle fall back to non-daemon compilation. If it persists, retry with a stable JDK such as 17.
