package com.ayucare.voiceassistant

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioRecord
import android.media.AudioTrack
import android.media.MediaRecorder
import android.media.audiofx.AutomaticGainControl
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.ayucare.voiceassistant.data.AssistantVisualState
import com.ayucare.voiceassistant.data.ConnectionState
import com.ayucare.voiceassistant.data.VoiceConfig
import com.ayucare.voiceassistant.data.VoiceUiState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import okio.ByteString
import org.json.JSONException
import org.json.JSONObject
import kotlin.math.abs
import kotlin.math.sqrt
import kotlin.time.Duration.Companion.seconds

class VoiceAssistantViewModel(application: android.app.Application) : AndroidViewModel(application) {
    private val _uiState = MutableStateFlow(VoiceUiState())
    val uiState: StateFlow<VoiceUiState> = _uiState.asStateFlow()

    private val client = OkHttpClient.Builder()
        .readTimeout(0, java.util.concurrent.TimeUnit.MILLISECONDS)
        .build()

    private var socket: WebSocket? = null
    private var recorder: AudioRecord? = null
    private var captureJob = viewModelScope.launch { }
    private var isCapturing = false
    private var recordingStartedAtMs = 0L

    private var playbackTrack: AudioTrack? = null
    private var playbackRate = 24000
    @Volatile
    private var suppressAssistantPlayback = false

    fun setServerUrl(url: String) {
        _uiState.update { it.copy(serverUrl = url) }
    }

    fun setWarning(message: String) {
        _uiState.update { it.copy(warning = message) }
    }

    fun connect() {
        val state = _uiState.value
        if (state.connectionState == ConnectionState.Ready || state.connectionState == ConnectionState.Connecting) {
            return
        }

        val wsUrl = VoiceConfig.normalizeWebSocketUrl(state.serverUrl)
        _uiState.update {
            it.copy(
                connectionState = ConnectionState.Connecting,
                visualState = AssistantVisualState.Listening,
                warning = "",
                statusText = "Connecting to assistant..."
            )
        }

        val request = Request.Builder().url(wsUrl).build()

        socket?.close(1000, "reconnect")
        socket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                val payload = JSONObject().apply {
                    put("type", "session_init")
                    if (_uiState.value.sessionId.isNotBlank()) {
                        put("session_id", _uiState.value.sessionId)
                    }
                }
                webSocket.send(payload.toString())
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                handleTextEvent(text)
            }

            override fun onMessage(webSocket: WebSocket, bytes: ByteString) {
                handleAudio(bytes.toByteArray())
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                suppressAssistantPlayback = false
                stopCapture()
                releasePlayback()
                _uiState.update {
                    it.copy(
                        connectionState = ConnectionState.Error,
                        visualState = AssistantVisualState.Error,
                        warning = t.message ?: "Could not connect to backend"
                    )
                }
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                suppressAssistantPlayback = false
                if (_uiState.value.connectionState != ConnectionState.Error) {
                    _uiState.update {
                        it.copy(
                            connectionState = ConnectionState.Idle,
                            visualState = AssistantVisualState.Idle,
                            isRecording = false,
                        )
                    }
                }
                stopCapture()
                releasePlayback()
            }

            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                webSocket.close(1000, "closing")
            }
        })
    }

    fun disconnect() {
        if (_uiState.value.connectionState == ConnectionState.Idle) {
            return
        }

        stopCapture()
        suppressAssistantPlayback = false
        sendEvent(mapOf("type" to "stop_session"))
        socket?.close(1000, "user_disconnect")
        socket = null
        _uiState.update {
            it.copy(
                connectionState = ConnectionState.Idle,
                visualState = AssistantVisualState.Idle,
                isRecording = false,
                sessionId = "",
                warning = "",
                statusText = "Session ended"
            )
        }
        releasePlayback()
    }

    fun beginPress() {
        viewModelScope.launch(Dispatchers.IO) {
            if (_uiState.value.isRecording || isCapturing) {
                return@launch
            }

            val connected = when (_uiState.value.connectionState) {
                ConnectionState.Ready -> true
                ConnectionState.Connecting -> waitForReady()
                ConnectionState.Idle, ConnectionState.Error -> {
                    connect()
                    waitForReady()
                }
            }

            if (!connected) {
                return@launch
            }

            suppressAssistantPlayback = true
            releasePlayback()
            _uiState.update {
                it.copy(
                    isRecording = true,
                    visualState = AssistantVisualState.Holding,
                    statusText = "Listening",
                    warning = ""
                )
            }
            sendEvent(mapOf("type" to "ptt_start"))
            recordingStartedAtMs = System.currentTimeMillis()
            startCapture()
        }
    }

    fun endPress() {
        if (!_uiState.value.isRecording) {
            return
        }

        _uiState.update {
            it.copy(
                visualState = AssistantVisualState.Awaiting,
                statusText = "Processing"
            )
        }

        viewModelScope.launch(Dispatchers.IO) {
            val elapsed = System.currentTimeMillis() - recordingStartedAtMs
            if (elapsed in 0 until MIN_CAPTURE_MS) {
                delay(MIN_CAPTURE_MS - elapsed)
            }

            stopCapture()
            suppressAssistantPlayback = false
            sendEvent(mapOf("type" to "ptt_end"))
        }
    }

    private suspend fun waitForReady(): Boolean {
        return try {
            withTimeout(8.seconds) {
                val state = _uiState.filter { s ->
                    s.connectionState == ConnectionState.Ready || s.connectionState == ConnectionState.Error
                }.first()
                state.connectionState == ConnectionState.Ready
            }
        } catch (_: TimeoutCancellationException) {
            _uiState.update {
                it.copy(
                    connectionState = ConnectionState.Error,
                    visualState = AssistantVisualState.Error,
                    warning = "Connection timed out"
                )
            }
            false
        }
    }

    private fun handleTextEvent(raw: String) {
        val payload = try {
            JSONObject(raw)
        } catch (_: JSONException) {
            return
        }

        when (payload.optString("type")) {
            "session_started" -> {
                _uiState.update {
                    it.copy(
                        connectionState = ConnectionState.Ready,
                        sessionId = payload.optString("session_id", ""),
                        visualState = AssistantVisualState.Listening,
                        statusText = "Session connected"
                    )
                }
            }

            "assistant_audio_format" -> {
                playbackRate = payload.optInt("sampleRate", 24000)
                _uiState.update { it.copy(assistantSampleRate = playbackRate) }
            }

            "assistant_text", "transcript" -> {
                val speaker = payload.optString("speaker")
                val text = payload.optString("text", "")
                if (text.isBlank()) return

                _uiState.update {
                    if (speaker == "user") {
                        it.copy(userText = text, statusText = "Listening")
                    } else {
                        it.copy(
                            assistantText = text,
                            statusText = "Speaking",
                            visualState = if (it.isRecording) {
                                it.visualState
                            } else {
                                AssistantVisualState.Speaking
                            },
                        )
                    }
                }
            }

            "state" -> {
                when (payload.optString("state")) {
                    "listening" -> _uiState.update {
                        it.copy(
                            visualState = if (it.isRecording) AssistantVisualState.Holding else AssistantVisualState.Listening,
                            statusText = "Listening",
                        )
                    }
                    "thinking", "awaiting" -> _uiState.update {
                        it.copy(
                            visualState = AssistantVisualState.Awaiting,
                            statusText = "Thinking",
                        )
                    }
                    "speaking" -> _uiState.update {
                        if (it.isRecording) {
                            it
                        } else {
                            it.copy(
                                visualState = AssistantVisualState.Speaking,
                                statusText = "Speaking",
                            )
                        }
                    }
                }
            }

            "interrupted", "assistant_interrupted" -> {
                releasePlayback()
                _uiState.update {
                    it.copy(
                        visualState = if (it.isRecording) AssistantVisualState.Holding else AssistantVisualState.Awaiting,
                        statusText = if (it.isRecording) "Listening" else "Interrupted",
                    )
                }
            }

            "warning", "error" -> {
                val message = payload.optString("message")
                if (payload.optString("type") == "error") {
                    _uiState.update {
                        it.copy(
                            warning = message,
                            connectionState = ConnectionState.Error,
                            visualState = AssistantVisualState.Error,
                            statusText = message
                        )
                    }
                } else {
                    _uiState.update { it.copy(warning = message) }
                }
            }
        }
    }

    private fun handleAudio(bytes: ByteArray) {
        if (bytes.isEmpty() || suppressAssistantPlayback || _uiState.value.isRecording) {
            return
        }

        ensurePlaybackTrack(playbackRate)
        playbackTrack?.write(bytes, 0, bytes.size)
        if (!_uiState.value.isRecording) {
            _uiState.update {
                it.copy(
                    visualState = AssistantVisualState.Speaking,
                    statusText = "Speaking",
                )
            }
        }
    }

    private fun sendEvent(payload: Map<String, String>) {
        socket?.send(JSONObject(payload).toString())
    }

    private fun startCapture() {
        if (isCapturing) {
            return
        }

        try {
            val sampleRate = 16000
            val minSize = AudioRecord.getMinBufferSize(sampleRate, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT)
            val bufferSize = maxOf(minSize, 4000)

            val record = AudioRecord(
                MediaRecorder.AudioSource.VOICE_COMMUNICATION,
                sampleRate,
                AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT,
                bufferSize
            )

            if (record.state != AudioRecord.STATE_INITIALIZED) {
                suppressAssistantPlayback = false
                _uiState.update {
                    it.copy(
                        warning = "Microphone unavailable.",
                        visualState = AssistantVisualState.Error,
                        isRecording = false,
                    )
                }
                return
            }

            val agc = AutomaticGainControl.create(record.audioSessionId)
            agc?.enabled = true

            recorder = record
            isCapturing = true
            record.startRecording()

            captureJob.cancel()
            captureJob = viewModelScope.launch(Dispatchers.IO) {
                val frame = ByteArray(bufferSize)
                while (isCapturing) {
                    val read = record.read(frame, 0, frame.size)
                    if (read > 0) {
                        socket?.send(ByteString.of(*frame.copyOfRange(0, read)))
                        updateWaveform(frame, read)
                    }
                    if (read < 0) {
                        break
                    }
                }
            }
        } catch (_: Throwable) {
            suppressAssistantPlayback = false
            _uiState.update {
                it.copy(
                    warning = "Could not start microphone. Check permission and hardware.",
                    visualState = AssistantVisualState.Error
                )
            }
            stopCapture()
        }
    }

    private fun stopCapture() {
        isCapturing = false
        try {
            captureJob.cancel()
            recorder?.stop()
            recorder?.release()
        } catch (_: Throwable) {
            // ignore
        }
        recorder = null
        _uiState.update { it.copy(isRecording = false) }
    }

    private fun releasePlayback() {
        try {
            playbackTrack?.pause()
            playbackTrack?.flush()
            playbackTrack?.release()
        } catch (_: Throwable) {
            // ignore
        }
        playbackTrack = null
    }

    private fun ensurePlaybackTrack(rate: Int) {
        if (playbackTrack != null && playbackRate == rate) {
            return
        }

        releasePlayback()
        playbackRate = rate

        val format = AudioFormat.Builder()
            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
            .setSampleRate(rate)
            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
            .build()

        val attributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_MEDIA)
            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
            .build()

        val minBuffer = AudioTrack.getMinBufferSize(rate, AudioFormat.CHANNEL_OUT_MONO, AudioFormat.ENCODING_PCM_16BIT)
        val bufferSize = maxOf(minBuffer, 2048)

        playbackTrack = AudioTrack.Builder()
            .setAudioAttributes(attributes)
            .setAudioFormat(format)
            .setBufferSizeInBytes(bufferSize)
            .setTransferMode(AudioTrack.MODE_STREAM)
            .build()

        playbackTrack?.play()
    }

    private fun updateWaveform(frame: ByteArray, byteCount: Int) {
        if (byteCount <= 1) {
            return
        }

        var idx = 0
        var sum = 0.0
        var samples = 0

        while (idx + 1 < byteCount) {
            val sample = (frame[idx + 1].toInt() shl 8) or (frame[idx].toInt() and 0xFF)
            val value = if (sample >= 32768) sample - 65536 else sample
            sum += abs(value.toDouble()).let { it * it }
            idx += 2
            samples += 1
        }

        if (samples == 0) {
            return
        }

        val rms = sqrt(sum / samples) / 32768.0
        val clamped = rms.coerceIn(0.0, 1.0).toFloat()

        _uiState.update { current ->
            val copied = current.waveform.toMutableList()
            copied.removeAt(0)
            copied.add(clamped)
            current.copy(waveform = copied)
        }
    }

    companion object {
        private const val MIN_CAPTURE_MS = 900L
    }
}
