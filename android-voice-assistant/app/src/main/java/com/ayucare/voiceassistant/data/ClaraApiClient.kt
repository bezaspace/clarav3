package com.ayucare.voiceassistant.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

class ClaraApiClient(private val client: OkHttpClient) {
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    suspend fun loadAppData(baseUrl: String): AppUiState = coroutineScope {
        val dashboard = async { getObject(baseUrl, "/api/dashboard").parseDashboard() }
        val products = async { getArray(baseUrl, "/api/care/products").mapObjects { it.parseProduct() } }
        val professionals = async { getArray(baseUrl, "/api/care/professionals").mapObjects { it.parseProfessional() } }
        val food = async { getArray(baseUrl, "/api/care/food").mapObjects { it.parseFoodItem() } }
        val activity = async { getArray(baseUrl, "/api/care/activity?active_only=true").mapObjects { it.parseCareActivity() } }
        val journal = async { getObject(baseUrl, "/api/journal").parseJournal() }
        val biomarkers = async { getObject(baseUrl, "/api/progress/biomarkers").parseBiomarkerData() }
        val diet = async { getObject(baseUrl, "/api/progress/diet").parseDietData() }
        val mental = async { getObject(baseUrl, "/api/progress/mental").parseMentalData() }
        val workouts = async { getObject(baseUrl, "/api/progress/workouts").parseWorkoutData() }
        val medication = async { getObject(baseUrl, "/api/progress/medication").parseMedicationData() }

        AppUiState(
            isLoading = false,
            dashboard = dashboard.await(),
            careProducts = products.await(),
            careProfessionals = professionals.await(),
            careFood = food.await(),
            careActivity = activity.await(),
            journal = journal.await(),
            biomarkers = biomarkers.await(),
            diet = diet.await(),
            mental = mental.await(),
            workouts = workouts.await(),
            medication = medication.await(),
        )
    }

    suspend fun createCareActivity(
        baseUrl: String,
        kind: String,
        sourceItemId: String,
        note: String? = null,
        scheduledFor: String? = null,
        slotId: String? = null,
        fulfillment: String? = null,
        quantity: Int? = null,
    ): CareActivity {
        val path = when (kind) {
            "food" -> "/api/care/food-orders"
            "doctor", "lab" -> "/api/care/bookings?kind=$kind"
            else -> "/api/care/orders"
        }
        val body = JSONObject()
            .put("sourceItemId", sourceItemId)
            .put("note", note ?: JSONObject.NULL)
            .put("scheduledFor", scheduledFor ?: JSONObject.NULL)
            .put("slotId", slotId ?: JSONObject.NULL)
            .put("fulfillment", fulfillment ?: JSONObject.NULL)
            .put("quantity", quantity ?: JSONObject.NULL)
        return postObject(baseUrl, path, body).parseCareActivity()
    }

    suspend fun updateJournalTaskStatus(
        baseUrl: String,
        taskId: String,
        status: String,
    ): JournalTask {
        val body = JSONObject().put("status", status)
        return patchObject(baseUrl, "/api/journal/tasks/${taskId.urlPathSafe()}", body).parseJournalTask()
    }

    private suspend fun getObject(baseUrl: String, path: String): JSONObject =
        request(baseUrl, path).let(::JSONObject)

    private suspend fun getArray(baseUrl: String, path: String): JSONArray =
        request(baseUrl, path).let(::JSONArray)

    private suspend fun postObject(baseUrl: String, path: String, body: JSONObject): JSONObject =
        request(baseUrl, path, method = "POST", body = body).let(::JSONObject)

    private suspend fun patchObject(baseUrl: String, path: String, body: JSONObject): JSONObject =
        request(baseUrl, path, method = "PATCH", body = body).let(::JSONObject)

    private suspend fun request(
        baseUrl: String,
        path: String,
        method: String = "GET",
        body: JSONObject? = null,
    ): String = withContext(Dispatchers.IO) {
        val url = "${baseUrl.trim().trimEnd('/')}$path"
        val builder = Request.Builder().url(url)
        when (method) {
            "POST", "PATCH" -> builder.method(method, body.toString().toRequestBody(jsonMediaType))
            else -> builder.get()
        }
        client.newCall(builder.build()).execute().use { response ->
            val responseBody = response.body?.string().orEmpty()
            if (!response.isSuccessful) {
                throw IOException("Request failed (${response.code}): $responseBody")
            }
            responseBody
        }
    }
}

private fun JSONObject.parseDashboard(): DashboardData {
    val profile = optJSONObject("profile") ?: JSONObject()
    return DashboardData(
        profile = DashboardProfile(
            name = profile.optString("name"),
            status = profile.optString("status"),
        ),
        todaysSchedule = optJSONArray("todaysSchedule").mapObjects { item ->
            DashboardScheduleItem(
                id = item.opt("id")?.toString().orEmpty(),
                time = item.optString("time"),
                title = item.optString("title"),
                type = item.optString("type"),
                duration = item.optString("duration"),
                status = item.optString("status"),
                completionNote = item.optString("completionNote"),
                completedAt = item.optString("completedAt"),
            )
        },
    )
}

private fun JSONObject.parseProduct(): Product = Product(
    id = optString("id"),
    name = optString("name"),
    category = optString("category"),
    price = optDouble("price"),
    originalPrice = if (has("originalPrice")) optDouble("originalPrice") else null,
    unit = optString("unit"),
    rating = optDouble("rating"),
    image = optString("image"),
    tag = optString("tag"),
    isOffer = optBoolean("isOffer"),
)

private fun JSONObject.parseProfessional(): Professional = Professional(
    id = optString("id"),
    name = optString("name"),
    specialty = optString("specialty"),
    type = optString("type"),
    experience = optString("experience"),
    rating = optDouble("rating"),
    reviews = optInt("reviews"),
    location = optString("location"),
    price = optDouble("price"),
    availability = optString("availability"),
    image = optString("image"),
    isOnline = optBoolean("isOnline"),
)

private fun JSONObject.parseFoodItem(): FoodItem = FoodItem(
    id = optString("id"),
    restaurant = optString("restaurant"),
    name = optString("name"),
    category = optString("category"),
    price = optDouble("price"),
    rating = optDouble("rating"),
    time = optString("time"),
    image = optString("image"),
    offer = optString("offer"),
    veg = optBoolean("veg"),
)

private fun JSONObject.parseCareActivity(): CareActivity = CareActivity(
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

private fun JSONObject.parseJournal(): JournalData = JournalData(
    tasks = optJSONArray("tasks").mapObjects { it.parseJournalTask() },
    entries = optJSONArray("entries").mapObjects { it.parseJournalEntry() },
    cbtNotes = optJSONArray("cbtNotes").mapObjects { it.parseCbtNote() },
)

private fun JSONObject.parseJournalTask(): JournalTask = JournalTask(
    id = optString("id"),
    title = optString("title"),
    status = optString("status"),
    priority = optString("priority"),
    category = optString("category"),
    dueDate = optString("dueDate"),
    completionNote = optString("completionNote"),
    completedAt = optString("completedAt"),
)

private fun JSONObject.parseJournalEntry(): JournalEntry = JournalEntry(
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

private fun JSONObject.parseCbtNote(): CbtNote = CbtNote(
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

private fun JSONObject.parseBiomarkerData(): BiomarkerData = BiomarkerData(
    biomarkers = optJSONArray("biomarkers").mapObjects {
        Biomarker(
            id = it.optString("id"),
            name = it.optString("name"),
            category = it.optString("category"),
            baseline = it.optDouble("baseline"),
            goal = it.optDouble("goal"),
            unit = it.optString("unit"),
            status = it.optString("status"),
            description = it.optString("description"),
        )
    },
    summary = (optJSONObject("summary") ?: JSONObject()).let {
        BiomarkerSummary(
            title = it.optString("title"),
            optimizationGoal = it.optString("optimizationGoal"),
            phase = it.optString("phase"),
            currentBaselineLabel = it.optString("currentBaselineLabel"),
            metricsAnalyzed = it.optInt("metricsAnalyzed"),
            nextRetest = it.optString("nextRetest"),
            daysRemaining = it.optInt("daysRemaining"),
            priorityRisks = it.optInt("priorityRisks"),
            priorityRisksLabel = it.optString("priorityRisksLabel"),
        )
    },
)

private fun JSONObject.parseDietData(): DietData = DietData(
    historyData = optJSONArray("historyData").mapObjects { it.parseHistoryPoint() },
    sattvicGoal = optInt("sattvicGoal"),
)

private fun JSONObject.parseMentalData(): MentalData = MentalData(
    historyData = optJSONArray("historyData").mapObjects { it.parseHistoryPoint() },
    adherenceData = optJSONArray("adherenceData").mapObjects {
        AdherenceDatum(
            subject = it.optString("subject"),
            value = it.optDouble("A"),
            fullMark = it.optDouble("fullMark", 100.0),
        )
    },
    quickStats = (optJSONObject("quickStats") ?: JSONObject()).let {
        MentalQuickStats(
            zenStreak = it.optString("zenStreak"),
            avgSleep = it.optString("avgSleep"),
            moodIndex = it.optString("moodIndex"),
        )
    },
)

private fun JSONObject.parseWorkoutData(): WorkoutData = WorkoutData(
    workoutData = optJSONArray("workoutData").mapObjects {
        WorkoutDatum(
            subject = it.optString("subject"),
            value = it.optDouble("A"),
            fullMark = it.optDouble("fullMark", 100.0),
        )
    },
    sessions = optJSONArray("sessions").mapObjects {
        WorkoutSessionData(
            type = it.optString("type"),
            duration = it.optString("duration"),
            intensity = it.optString("intensity"),
            cals = it.optString("cals"),
        )
    },
    milestone = (optJSONObject("milestone") ?: JSONObject()).let {
        WorkoutMilestoneData(
            title = it.optString("title"),
            achievedDate = it.optString("achievedDate"),
        )
    },
)

private fun JSONObject.parseMedicationData(): MedicationData = MedicationData(
    overview = (optJSONObject("overview") ?: JSONObject()).let {
        MedicationOverview(
            adherence = it.optString("adherence"),
            streak = it.optString("streak"),
            refill = it.optString("refill"),
            refillText = it.optString("refillText"),
        )
    },
    adherenceRows = optJSONArray("adherenceRows").mapObjects {
        AdherenceDay(
            id = it.optInt("id"),
            level = it.optInt("level"),
            date = it.optInt("date"),
            month = it.optInt("month"),
            monthName = it.optString("monthName"),
            fullDate = it.optString("fullDate"),
        )
    },
)

private fun JSONObject.parseHistoryPoint(): HistoryPoint = HistoryPoint(
    date = optString("date"),
    carbs = optDouble("carbs"),
    protein = optDouble("protein"),
    fats = optDouble("fats"),
    fiber = optDouble("fiber"),
    vitamins = optDouble("vitamins"),
    minerals = optDouble("minerals"),
    moodScore = optDouble("moodScore"),
    sleepHours = optDouble("sleepHours"),
    deepSleepHours = optDouble("deepSleepHours"),
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

private fun String.urlPathSafe(): String =
    java.net.URLEncoder.encode(this, "UTF-8").replace("+", "%20")
