package com.ayucare.voiceassistant.data

import androidx.compose.ui.graphics.Color

enum class ConnectionState {
    Idle,
    Connecting,
    Ready,
    Error,
}

enum class AssistantVisualState {
    Idle,
    Listening,
    Holding,
    Awaiting,
    Speaking,
    Error,
}

data class VoiceUiState(
    val connectionState: ConnectionState = ConnectionState.Idle,
    val visualState: AssistantVisualState = AssistantVisualState.Idle,
    val warning: String = "",
    val serverUrl: String = "http://127.0.0.1:8000",
    val sessionId: String = "",
    val statusText: String = "Tap and hold the mic to begin",
    val isRecording: Boolean = false,
    val waveform: List<Float> = List(28) { 0.06f },
    val assistantText: String = "",
    val userText: String = "",
    val assistantSampleRate: Int = 24000,
    val bottomSheetOpen: Boolean = false,
)

data class BottomSheetChip(
    val title: String,
    val tone: Color,
    val emoji: String,
)

