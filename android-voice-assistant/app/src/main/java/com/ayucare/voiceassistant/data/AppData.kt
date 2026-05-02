package com.ayucare.voiceassistant.data

data class AppUiState(
    val isLoading: Boolean = true,
    val error: String = "",
    val dashboard: DashboardData = DashboardData(),
    val careProducts: List<Product> = emptyList(),
    val careProfessionals: List<Professional> = emptyList(),
    val careFood: List<FoodItem> = emptyList(),
    val careActivity: List<CareActivity> = emptyList(),
    val journal: JournalData = JournalData(),
    val biomarkers: BiomarkerData = BiomarkerData(),
    val diet: DietData = DietData(),
    val mental: MentalData = MentalData(),
    val workouts: WorkoutData = WorkoutData(),
    val medication: MedicationData = MedicationData(),
)

data class DashboardData(
    val profile: DashboardProfile = DashboardProfile(),
    val todaysSchedule: List<DashboardScheduleItem> = emptyList(),
)

data class DashboardProfile(
    val name: String = "",
    val age: Int = 0,
    val bloodType: String = "",
    val prakriti: String = "",
    val status: String = "",
    val allergies: List<String> = emptyList(),
    val conditions: List<String> = emptyList(),
    val history: List<ProfileHistoryItem> = emptyList(),
    val targets: List<ProfileTarget> = emptyList(),
)

data class ProfileHistoryItem(
    val year: String = "",
    val event: String = "",
)

data class ProfileTarget(
    val goal: String = "",
    val current: String = "",
    val aim: String = "",
    val effort: String = "",
)

data class DashboardScheduleItem(
    val id: String = "",
    val time: String = "",
    val title: String = "",
    val type: String = "",
    val duration: String = "",
    val status: String = "",
    val completionNote: String = "",
    val completedAt: String = "",
)

data class ActivityCard(
    val id: String = "",
    val kind: String = "",
    val title: String = "",
    val category: String = "",
    val status: String = "",
    val timeLabel: String = "",
    val supportingText: String = "",
    val scheduledFor: String = "",
    val completionNote: String = "",
    val completedAt: String = "",
)

data class Product(
    val id: String = "",
    val name: String = "",
    val category: String = "",
    val price: Double = 0.0,
    val originalPrice: Double? = null,
    val unit: String = "",
    val rating: Double = 0.0,
    val image: String = "",
    val tag: String = "",
    val isOffer: Boolean = false,
)

data class Professional(
    val id: String = "",
    val name: String = "",
    val specialty: String = "",
    val type: String = "",
    val experience: String = "",
    val rating: Double = 0.0,
    val reviews: Int = 0,
    val location: String = "",
    val price: Double = 0.0,
    val availability: String = "",
    val image: String = "",
    val isOnline: Boolean = false,
)

data class FoodItem(
    val id: String = "",
    val restaurant: String = "",
    val name: String = "",
    val category: String = "",
    val price: Double = 0.0,
    val rating: Double = 0.0,
    val time: String = "",
    val image: String = "",
    val offer: String = "",
    val veg: Boolean = false,
)

data class CareActivity(
    val id: String = "",
    val kind: String = "",
    val status: String = "",
    val title: String = "",
    val provider: String = "",
    val scheduledFor: String = "",
    val eta: String = "",
    val price: Double = 0.0,
    val sourceItemId: String = "",
    val createdAt: String = "",
    val note: String = "",
    val slotId: String = "",
    val fulfillment: String = "",
    val quantity: Int = 1,
)

data class CareRecommendationCard(
    val id: String = "",
    val kind: String = "",
    val title: String = "",
    val provider: String = "",
    val detail: String = "",
    val price: Double = 0.0,
    val rating: Double = 0.0,
    val image: String = "",
    val category: String = "",
    val offer: String = "",
    val eta: String = "",
    val isOnline: Boolean = false,
    val reviews: Int = 0,
    val location: String = "",
    val availability: String = "",
)

data class CareSlotOption(
    val id: String = "",
    val date: String = "",
    val dayLabel: String = "",
    val time: String = "",
    val mode: String = "",
    val scheduledFor: String = "",
)

data class AssistantCarePanel(
    val mode: String = "",
    val title: String = "",
    val message: String = "",
    val kind: String = "",
    val recommendations: List<CareRecommendationCard> = emptyList(),
    val selected: CareRecommendationCard? = null,
    val slots: List<CareSlotOption> = emptyList(),
    val fulfillment: String = "",
    val quantity: Int = 1,
    val eta: String = "",
    val totalPrice: Double = 0.0,
    val activity: CareActivity? = null,
)

data class AssistantProgressPanel(
    val focus: String = "overview",
    val generatedAt: String = "",
    val snapshot: HealthSnapshot = HealthSnapshot(),
)

data class AssistantJournalPanel(
    val mode: String = "",
    val title: String = "",
    val message: String = "",
    val itemType: String = "",
    val preview: JournalPreview? = null,
    val journal: JournalData = JournalData(),
    val entry: JournalEntry? = null,
    val cbtNote: CbtNote? = null,
    val task: JournalTask? = null,
)

data class JournalPreview(
    val itemType: String = "",
    val title: String = "",
    val body: String = "",
    val mood: String = "",
    val tags: List<String> = emptyList(),
    val status: String = "",
    val priority: String = "",
    val category: String = "",
    val dueDate: String = "",
    val thought: String = "",
    val feeling: String = "",
    val reframe: String = "",
    val nextAction: String = "",
)

data class HealthSnapshot(
    val dashboard: DashboardData = DashboardData(),
    val biomarkers: BiomarkerData = BiomarkerData(),
    val diet: DietData = DietData(),
    val mentalHealth: MentalData = MentalData(),
    val workouts: WorkoutData = WorkoutData(),
    val medication: MedicationData = MedicationData(),
)

data class JournalData(
    val tasks: List<JournalTask> = emptyList(),
    val entries: List<JournalEntry> = emptyList(),
    val cbtNotes: List<CbtNote> = emptyList(),
)

data class JournalTask(
    val id: String = "",
    val title: String = "",
    val status: String = "",
    val priority: String = "",
    val category: String = "",
    val dueDate: String = "",
    val completionNote: String = "",
    val completedAt: String = "",
)

data class JournalEntry(
    val id: String = "",
    val date: String = "",
    val time: String = "",
    val title: String = "",
    val excerpt: String = "",
    val content: String = "",
    val mood: String = "",
    val tags: List<String> = emptyList(),
    val source: String = "",
)

data class CbtNote(
    val id: String = "",
    val date: String = "",
    val time: String = "",
    val situation: String = "",
    val thought: String = "",
    val feeling: String = "",
    val reframe: String = "",
    val action: String = "",
    val source: String = "",
)

data class BiomarkerData(
    val biomarkers: List<Biomarker> = emptyList(),
    val summary: BiomarkerSummary = BiomarkerSummary(),
)

data class Biomarker(
    val id: String = "",
    val name: String = "",
    val category: String = "",
    val baseline: Double = 0.0,
    val goal: Double = 0.0,
    val unit: String = "",
    val status: String = "",
    val description: String = "",
)

data class BiomarkerSummary(
    val title: String = "",
    val optimizationGoal: String = "",
    val phase: String = "",
    val currentBaselineLabel: String = "",
    val metricsAnalyzed: Int = 0,
    val nextRetest: String = "",
    val daysRemaining: Int = 0,
    val priorityRisks: Int = 0,
    val priorityRisksLabel: String = "",
)

data class HistoryPoint(
    val date: String = "",
    val carbs: Double = 0.0,
    val protein: Double = 0.0,
    val fats: Double = 0.0,
    val fiber: Double = 0.0,
    val vitamins: Double = 0.0,
    val minerals: Double = 0.0,
    val moodScore: Double = 0.0,
    val sleepHours: Double = 0.0,
    val deepSleepHours: Double = 0.0,
)

data class DietData(
    val historyData: List<HistoryPoint> = emptyList(),
    val sattvicGoal: Int = 0,
)

data class MentalData(
    val historyData: List<HistoryPoint> = emptyList(),
    val adherenceData: List<AdherenceDatum> = emptyList(),
    val quickStats: MentalQuickStats = MentalQuickStats(),
)

data class AdherenceDatum(
    val subject: String = "",
    val value: Double = 0.0,
    val fullMark: Double = 100.0,
)

data class MentalQuickStats(
    val zenStreak: String = "",
    val avgSleep: String = "",
    val moodIndex: String = "",
)

data class WorkoutData(
    val workoutData: List<WorkoutDatum> = emptyList(),
    val sessions: List<WorkoutSessionData> = emptyList(),
    val milestone: WorkoutMilestoneData = WorkoutMilestoneData(),
)

data class WorkoutDatum(
    val subject: String = "",
    val value: Double = 0.0,
    val fullMark: Double = 100.0,
)

data class WorkoutSessionData(
    val type: String = "",
    val duration: String = "",
    val intensity: String = "",
    val cals: String = "",
)

data class WorkoutMilestoneData(
    val title: String = "",
    val achievedDate: String = "",
)

data class MedicationData(
    val overview: MedicationOverview = MedicationOverview(),
    val adherenceRows: List<AdherenceDay> = emptyList(),
)

data class MedicationOverview(
    val adherence: String = "",
    val streak: String = "",
    val refill: String = "",
    val refillText: String = "",
)

data class AdherenceDay(
    val id: Int = 0,
    val level: Int = 0,
    val date: Int = 0,
    val month: Int = 0,
    val monthName: String = "",
    val fullDate: String = "",
)
