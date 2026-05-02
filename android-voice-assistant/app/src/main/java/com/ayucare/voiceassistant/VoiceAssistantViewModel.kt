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
import com.ayucare.voiceassistant.data.AppUiState
import com.ayucare.voiceassistant.data.ActivityCard
import com.ayucare.voiceassistant.data.AssistantCarePanel
import com.ayucare.voiceassistant.data.AssistantJournalPanel
import com.ayucare.voiceassistant.data.AssistantProgressPanel
import com.ayucare.voiceassistant.data.AssistantVisualState
import com.ayucare.voiceassistant.data.CareActivity
import com.ayucare.voiceassistant.data.CareRecommendationCard
import com.ayucare.voiceassistant.data.CareSlotOption
import com.ayucare.voiceassistant.data.ClaraApiClient
import com.ayucare.voiceassistant.data.ConnectionState
import com.ayucare.voiceassistant.data.CbtNote
import com.ayucare.voiceassistant.data.DashboardScheduleItem
import com.ayucare.voiceassistant.data.JournalData
import com.ayucare.voiceassistant.data.JournalEntry
import com.ayucare.voiceassistant.data.JournalPreview
import com.ayucare.voiceassistant.data.JournalTask
import com.ayucare.voiceassistant.data.VoiceConfig
import com.ayucare.voiceassistant.data.VoiceUiState
import com.ayucare.voiceassistant.data.parseAssistantProgressPanel
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
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import kotlin.math.abs
import kotlin.math.sqrt
import kotlin.time.Duration.Companion.seconds

class VoiceAssistantViewModel(application: android.app.Application) : AndroidViewModel(application) {
    private val _uiState = MutableStateFlow(VoiceUiState())
    val uiState: StateFlow<VoiceUiState> = _uiState.asStateFlow()

    private val _appState = MutableStateFlow(AppUiState())
    val appState: StateFlow<AppUiState> = _appState.asStateFlow()

    private val client = OkHttpClient.Builder()
        .readTimeout(0, java.util.concurrent.TimeUnit.MILLISECONDS)
        .build()
    private val apiClient = ClaraApiClient(client)

    private var socket: WebSocket? = null
    private var recorder: AudioRecord? = null
    private var captureJob = viewModelScope.launch { }
    private var isCapturing = false
    private var recordingStartedAtMs = 0L

    private var playbackTrack: AudioTrack? = null
    private var playbackRate = 24000
    @Volatile
    private var suppressAssistantPlayback = false

    init {
        refreshAppData()
    }

    fun setServerUrl(url: String) {
        _uiState.update { it.copy(serverUrl = url) }
        refreshAppData(url)
    }

    fun setWarning(message: String) {
        _uiState.update { it.copy(warning = message) }
    }

    fun refreshAppData(baseUrl: String = _uiState.value.serverUrl) {
        viewModelScope.launch {
            _appState.update { it.copy(isLoading = true, error = "") }
            try {
                _appState.value = apiClient.loadAppData(baseUrl)
            } catch (error: Throwable) {
                _appState.update {
                    it.copy(
                        isLoading = false,
                        error = error.message ?: "Could not load backend data",
                    )
                }
            }
        }
    }

    fun createCareActivity(kind: String, sourceItemId: String, note: String? = null) {
        viewModelScope.launch {
            try {
                val activity = apiClient.createCareActivity(
                    baseUrl = _uiState.value.serverUrl,
                    kind = kind,
                    sourceItemId = sourceItemId,
                    note = note,
                )
                _appState.update { state ->
                    state.copy(careActivity = listOf(activity) + state.careActivity)
                }
            } catch (error: Throwable) {
                _appState.update {
                    it.copy(error = error.message ?: "Could not create care activity")
                }
            }
        }
    }

    fun toggleJournalTask(taskId: String) {
        val current = _appState.value.journal.tasks.firstOrNull { it.id == taskId } ?: return
        val nextStatus = if (current.status == "completed") "todo" else "completed"
        viewModelScope.launch {
            try {
                val updated = apiClient.updateJournalTaskStatus(
                    baseUrl = _uiState.value.serverUrl,
                    taskId = taskId,
                    status = nextStatus,
                )
                _appState.update { state ->
                    state.copy(
                        journal = state.journal.copy(
                            tasks = state.journal.tasks.map { task ->
                                if (task.id == updated.id) updated else task
                            },
                        ),
                    )
                }
            } catch (error: Throwable) {
                _appState.update {
                    it.copy(error = error.message ?: "Could not update journal task")
                }
            }
        }
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
                            activityCards = emptyList(),
                            carePanel = null,
                            progressPanel = null,
                            journalPanel = null,
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
                statusText = "Session ended",
                activityCards = emptyList(),
                carePanel = null,
                progressPanel = null,
                journalPanel = null,
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

            "current_activity" -> {
                val primary = payload.optJSONObject("activityCard")?.parseActivityCard()
                    ?: payload.optJSONObject("currentItem")?.parseActivityCard()
                    ?: payload.optJSONObject("upcomingItem")?.parseActivityCard()
                primary?.let { showActivityCards(listOf(it)) }
            }

            "schedule_snapshot" -> {
                val cards = payload.optJSONArray("items").mapObjects { it.parseActivityCard() }
                showActivityCards(cards)
            }

            "health_snapshot" -> {
                showProgressPanel(payload.parseAssistantProgressPanel())
            }

            "journal_confirmation_required" -> {
                val itemType = payload.optString("itemType")
                showJournalPanel(
                    AssistantJournalPanel(
                        mode = "confirmation",
                        title = journalPanelTitle(itemType, "confirmation"),
                        message = payload.optString("message"),
                        itemType = itemType,
                        preview = payload.optJSONObject("preview")?.parseJournalPreview(itemType),
                    )
                )
            }

            "journal_snapshot" -> {
                val journal = payload.optJSONObject("journal")?.parseJournalPayload() ?: JournalData()
                _appState.update { it.copy(journal = journal) }
                showJournalPanel(
                    AssistantJournalPanel(
                        mode = "snapshot",
                        title = "Journal snapshot",
                        message = payload.optString("message"),
                        journal = journal,
                    )
                )
            }

            "journal_entry_created" -> {
                val entry = payload.optJSONObject("entry")?.parseJournalEntryPayload()
                if (entry != null) {
                    _appState.update { state ->
                        state.copy(journal = state.journal.copy(entries = listOf(entry) + state.journal.entries.filter { it.id != entry.id }))
                    }
                    showJournalPanel(
                        AssistantJournalPanel(
                            mode = "saved",
                            title = "Reflection saved",
                            message = payload.optString("message"),
                            itemType = "reflection",
                            entry = entry,
                        )
                    )
                }
            }

            "journal_cbt_note_created" -> {
                val note = payload.optJSONObject("cbtNote")?.parseCbtNotePayload()
                if (note != null) {
                    _appState.update { state ->
                        state.copy(journal = state.journal.copy(cbtNotes = listOf(note) + state.journal.cbtNotes.filter { it.id != note.id }))
                    }
                    showJournalPanel(
                        AssistantJournalPanel(
                            mode = "saved",
                            title = "Reframe saved",
                            message = payload.optString("message"),
                            itemType = "cbt_note",
                            cbtNote = note,
                        )
                    )
                }
            }

            "journal_task_created", "journal_task_updated" -> {
                val task = payload.optJSONObject("task")?.parseJournalTaskPayload()
                if (task != null) {
                    _appState.update { state ->
                        state.copy(journal = state.journal.copy(tasks = listOf(task) + state.journal.tasks.filter { it.id != task.id }))
                    }
                    showJournalPanel(
                        AssistantJournalPanel(
                            mode = "saved",
                            title = if (payload.optString("type") == "journal_task_created") "Task added" else "Task updated",
                            message = payload.optString("message"),
                            itemType = "task",
                            task = task,
                        )
                    )
                }
            }

            "journal_task_deleted" -> {
                val task = payload.optJSONObject("task")?.parseJournalTaskPayload()
                val taskId = task?.id.orEmpty()
                if (taskId.isNotBlank()) {
                    _appState.update { state ->
                        state.copy(journal = state.journal.copy(tasks = state.journal.tasks.filter { it.id != taskId }))
                    }
                }
                showJournalPanel(
                    AssistantJournalPanel(
                        mode = "saved",
                        title = "Task deleted",
                        message = payload.optString("message"),
                        itemType = "task",
                        task = task,
                    )
                )
            }

            "activity_completion_logged" -> {
                val card = payload.optJSONObject("activityCard")?.parseActivityCard()
                if (card != null) {
                    showActivityCards(listOf(card))
                    applyCompletedActivity(card)
                }
            }

            "care_recommendations", "care_activity_confirmation_required" -> {
                val recommendations = payload.optJSONArray("recommendations").mapObjects {
                    it.parseCareRecommendationCard()
                }
                if (recommendations.isNotEmpty()) {
                    showCarePanel(
                        AssistantCarePanel(
                            mode = "recommendations",
                            title = carePanelTitle(payload.optString("kind"), recommendations.size),
                            message = payload.optString("message"),
                            kind = payload.optString("kind"),
                            recommendations = recommendations,
                        )
                    )
                }
            }

            "care_booking_slots" -> {
                val selected = payload.optJSONObject("selected")?.parseCareRecommendationCard()
                val slots = payload.optJSONArray("slots").mapObjects { it.parseCareSlotOption() }
                showCarePanel(
                    AssistantCarePanel(
                        mode = "bookingSlots",
                        title = if (payload.optString("kind") == "lab") "Choose a lab slot" else "Choose an appointment",
                        message = payload.optString("message"),
                        kind = payload.optString("kind"),
                        selected = selected,
                        slots = slots,
                    )
                )
            }

            "care_order_review" -> {
                val selected = payload.optJSONObject("selected")?.parseCareRecommendationCard()
                showCarePanel(
                    AssistantCarePanel(
                        mode = "orderReview",
                        title = if (payload.optString("kind") == "food") "Review meal order" else "Review order",
                        message = payload.optString("message"),
                        kind = payload.optString("kind"),
                        selected = selected,
                        fulfillment = payload.optString("fulfillment"),
                        quantity = payload.optInt("quantity", 1),
                        eta = payload.optString("eta"),
                        totalPrice = payload.optDouble("totalPrice", 0.0),
                    )
                )
            }

            "care_activity_created" -> {
                val activity = payload.optJSONObject("activity")?.parseCareActivityPayload()
                if (activity != null) {
                    _appState.update { state ->
                        state.copy(careActivity = listOf(activity) + state.careActivity.filter { it.id != activity.id })
                    }
                    showCarePanel(
                        AssistantCarePanel(
                            mode = "confirmation",
                            title = if (activity.kind == "food" || activity.kind == "product") "Order placed" else "Booking confirmed",
                            message = payload.optString("message"),
                            kind = activity.kind,
                            activity = activity,
                        )
                    )
                }
            }

            "care_activity_error" -> {
                _uiState.update { it.copy(warning = payload.optString("message")) }
            }

            "journal_error" -> {
                _uiState.update { it.copy(warning = payload.optString("message")) }
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

            "activity_completion_error" -> {
                _uiState.update { it.copy(warning = payload.optString("message")) }
            }
        }
    }

    private fun showActivityCards(cards: List<ActivityCard>) {
        if (cards.isEmpty()) return
        _uiState.update { it.copy(activityCards = cards.take(6), carePanel = null, progressPanel = null, journalPanel = null) }
    }

    private fun showCarePanel(panel: AssistantCarePanel) {
        _uiState.update {
            it.copy(
                carePanel = panel,
                activityCards = emptyList(),
                progressPanel = null,
                journalPanel = null,
            )
        }
    }

    private fun showProgressPanel(panel: AssistantProgressPanel) {
        _uiState.update {
            it.copy(
                progressPanel = panel,
                carePanel = null,
                activityCards = emptyList(),
                journalPanel = null,
            )
        }
    }

    private fun showJournalPanel(panel: AssistantJournalPanel) {
        _uiState.update {
            it.copy(
                journalPanel = panel,
                progressPanel = null,
                carePanel = null,
                activityCards = emptyList(),
            )
        }
    }

    private fun applyCompletedActivity(card: ActivityCard) {
        _appState.update { state ->
            when (card.kind) {
                "schedule" -> state.copy(
                    dashboard = state.dashboard.copy(
                        todaysSchedule = state.dashboard.todaysSchedule.map { item ->
                            if (item.id == card.id) item.withCompletion(card) else item
                        },
                    ),
                )
                "task" -> state.copy(
                    journal = state.journal.copy(
                        tasks = state.journal.tasks.map { task ->
                            if (task.id == card.id) task.withCompletion(card) else task
                        },
                    ),
                )
                else -> state
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

private fun JSONObject.parseActivityCard(): ActivityCard =
    ActivityCard(
        id = optString("id"),
        kind = optString("kind"),
        title = optString("title"),
        category = optString("category"),
        status = optString("status"),
        timeLabel = optString("timeLabel"),
        supportingText = optString("supportingText"),
        scheduledFor = optString("scheduledFor"),
        completionNote = optString("completionNote"),
        completedAt = optString("completedAt"),
    )

private fun JSONObject.parseCareRecommendationCard(): CareRecommendationCard =
    CareRecommendationCard(
        id = optString("id"),
        kind = optString("kind"),
        title = optString("title"),
        provider = optString("provider"),
        detail = optString("detail"),
        price = optDouble("price"),
        rating = optDouble("rating"),
        image = optString("image"),
        category = optString("category"),
        offer = optString("offer"),
        eta = optString("eta"),
        isOnline = optBoolean("isOnline"),
        reviews = optInt("reviews"),
        location = optString("location"),
        availability = optString("availability"),
    )

private fun JSONObject.parseCareSlotOption(): CareSlotOption =
    CareSlotOption(
        id = optString("id"),
        date = optString("date"),
        dayLabel = optString("dayLabel"),
        time = optString("time"),
        mode = optString("mode"),
        scheduledFor = optString("scheduledFor"),
    )

private fun JSONObject.parseCareActivityPayload(): CareActivity =
    CareActivity(
        id = optString("id"),
        kind = optString("kind"),
        status = optString("status"),
        title = optString("title"),
        provider = optString("provider"),
        scheduledFor = optString("scheduledFor"),
        eta = optString("eta"),
        price = optDouble("price"),
        sourceItemId = optString("sourceItemId"),
        createdAt = optString("createdAt"),
        note = optString("note"),
        slotId = optString("slotId"),
        fulfillment = optString("fulfillment"),
        quantity = optInt("quantity", 1),
    )

private fun JSONObject.parseJournalPayload(): JournalData =
    JournalData(
        tasks = optJSONArray("tasks").mapObjects { it.parseJournalTaskPayload() },
        entries = optJSONArray("entries").mapObjects { it.parseJournalEntryPayload() },
        cbtNotes = optJSONArray("cbtNotes").mapObjects { it.parseCbtNotePayload() },
    )

private fun JSONObject.parseJournalTaskPayload(): JournalTask =
    JournalTask(
        id = optString("id"),
        title = optString("title"),
        status = optString("status"),
        priority = optString("priority"),
        category = optString("category"),
        dueDate = optString("dueDate"),
        completionNote = optString("completionNote"),
        completedAt = optString("completedAt"),
    )

private fun JSONObject.parseJournalEntryPayload(): JournalEntry =
    JournalEntry(
        id = optString("id"),
        date = optString("date"),
        time = optString("time"),
        title = optString("title"),
        excerpt = optString("excerpt"),
        content = optString("content"),
        mood = optString("mood"),
        tags = optJSONArray("tags").mapStrings(),
        source = optString("source"),
    )

private fun JSONObject.parseCbtNotePayload(): CbtNote =
    CbtNote(
        id = optString("id"),
        date = optString("date"),
        time = optString("time"),
        situation = optString("situation"),
        thought = optString("thought"),
        feeling = optString("feeling"),
        reframe = optString("reframe"),
        action = optString("action"),
        source = optString("source"),
    )

private fun JSONObject.parseJournalPreview(itemType: String): JournalPreview {
    val title = when (itemType) {
        "cbt_note" -> optString("situation").ifBlank { "Thought reframe" }
        "task" -> optString("title").ifBlank { "Mental-load task" }
        else -> optString("title").ifBlank { "Reflection" }
    }
    val body = listOf(
        optString("excerpt"),
        optString("content"),
        optString("thought"),
        optString("reframe"),
        optString("action"),
        optString("dueDate"),
    ).firstOrNull { it.isNotBlank() }.orEmpty()
    return JournalPreview(
        itemType = itemType,
        title = title,
        body = body,
        mood = optString("mood"),
        tags = optJSONArray("tags").mapStrings(),
        status = optString("status"),
        priority = optString("priority"),
        category = optString("category"),
        dueDate = optString("dueDate"),
        thought = optString("thought"),
        feeling = optString("feeling"),
        reframe = optString("reframe"),
        nextAction = optString("action").ifBlank {
            optString("nextAction").ifBlank { optString("smallAction") }
        },
    )
}

private fun carePanelTitle(kind: String, count: Int): String {
    val label = when (kind) {
        "doctor" -> "doctor"
        "lab" -> "lab"
        "food" -> "meal"
        "product" -> "care"
        else -> "care"
    }
    return "$count ${label} option${if (count == 1) "" else "s"}"
}

private fun journalPanelTitle(itemType: String, mode: String): String {
    val label = when (itemType) {
        "cbt_note" -> "Reframe"
        "task" -> "Mental-load task"
        else -> "Reflection"
    }
    return if (mode == "confirmation") "$label needs approval" else label
}

private fun DashboardScheduleItem.withCompletion(card: ActivityCard): DashboardScheduleItem =
    copy(
        status = card.status.ifBlank { status },
        completionNote = card.completionNote,
        completedAt = card.completedAt,
    )

private fun JournalTask.withCompletion(card: ActivityCard): JournalTask =
    copy(
        status = when (card.status) {
            "pending" -> status
            else -> card.status.ifBlank { status }
        },
        completionNote = card.completionNote,
        completedAt = card.completedAt,
    )

private fun <T> JSONArray?.mapObjects(transform: (JSONObject) -> T): List<T> {
    if (this == null) return emptyList()
    return (0 until length()).mapNotNull { index ->
        optJSONObject(index)?.let(transform)
    }
}

private fun JSONArray?.mapStrings(): List<String> {
    if (this == null) return emptyList()
    return (0 until length()).mapNotNull { index ->
        optString(index).takeIf { it.isNotBlank() }
    }
}
