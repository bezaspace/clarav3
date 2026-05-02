package com.ayucare.voiceassistant.ui.screen

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.automirrored.outlined.DirectionsWalk
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowRight
import androidx.compose.material.icons.outlined.AccessTime
import androidx.compose.material.icons.outlined.BarChart
import androidx.compose.material.icons.outlined.CalendarToday
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.CropSquare
import androidx.compose.material.icons.outlined.GraphicEq
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.LocalHospital
import androidx.compose.material.icons.outlined.Mic
import androidx.compose.material.icons.outlined.MicOff
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Restaurant
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.Scaffold
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.ayucare.voiceassistant.VoiceAssistantViewModel
import com.ayucare.voiceassistant.data.AssistantVisualState
import com.ayucare.voiceassistant.data.ConnectionState
import com.ayucare.voiceassistant.data.VoiceUiState
import com.ayucare.voiceassistant.ui.theme.WellnessBlue
import com.ayucare.voiceassistant.ui.theme.WellnessBackground
import com.ayucare.voiceassistant.ui.theme.WellnessLavender
import com.ayucare.voiceassistant.ui.theme.WellnessMustard
import com.ayucare.voiceassistant.ui.theme.WellnessPink
import com.ayucare.voiceassistant.ui.theme.WellnessSage
import com.ayucare.voiceassistant.ui.theme.WellnessSurface
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.sin

data class BottomTabItem(val title: String, val icon: ImageVector)

data class InsightRing(val title: String, val value: Float, val color: Color)

data class ScheduleItem(
    val title: String,
    val subtitle: String,
    val time: String,
    val icon: ImageVector,
    val accent: Color,
)

data class HealthMetric(
    val title: String,
    val value: String,
    val caption: String,
    val icon: ImageVector,
    val accent: Color,
)

data class ScheduleDay(
    val label: String,
    val date: String,
    val title: String,
    val events: List<ScheduleEvent>,
)

data class ScheduleEvent(
    val time: String,
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
    val accent: Color,
)

data class BiomarkerReading(
    val name: String,
    val current: String,
    val target: String,
    val note: String,
    val progress: Float,
    val accent: Color,
)

data class NutritionSeries(
    val label: String,
    val color: Color,
    val values: List<Float>,
)

data class FitnessStat(
    val title: String,
    val value: String,
    val unit: String,
    val caption: String,
    val progress: Float,
    val color: Color,
)

data class FitnessGoal(
    val title: String,
    val current: String,
    val target: String,
    val percent: Int,
    val color: Color,
    val icon: ImageVector,
)

data class MindStat(
    val title: String,
    val value: String,
    val unit: String,
    val caption: String,
    val accent: Color,
    val icon: ImageVector,
)

data class SleepStage(
    val label: String,
    val duration: String,
    val percent: String,
    val color: Color,
    val weight: Float,
)

data class JournalTab(
    val id: String,
    val label: String,
    val icon: ImageVector,
)

data class MockReflection(
    val id: String,
    val title: String,
    val date: String,
    val time: String,
    val mood: String,
    val excerpt: String,
    val content: String,
    val tags: List<String>,
    val tone: Color,
)

data class MockReframe(
    val id: String,
    val date: String,
    val time: String,
    val situation: String,
    val thought: String,
    val feeling: String,
    val reframe: String,
    val action: String,
)

data class MockMentalLoadTask(
    val id: String,
    val title: String,
    val status: String,
    val priority: String,
    val category: String,
    val dueDate: String,
)

data class ClaraJournalEvent(
    val title: String,
    val detail: String,
    val time: String,
    val color: Color,
)

@Composable
fun VoicePage(viewModel: VoiceAssistantViewModel) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { granted ->
            if (!granted) {
                viewModel.setWarning("Microphone permission denied. Enable it to use voice assistant.")
            } else {
                viewModel.beginPress()
            }
        },
    )

    val tabs = remember {
        listOf(
            BottomTabItem("Home", Icons.Outlined.Home),
            BottomTabItem("Progress", Icons.Outlined.BarChart),
            BottomTabItem("Voice", Icons.Outlined.Mic),
            BottomTabItem("Journal", Icons.Outlined.ChatBubbleOutline),
            BottomTabItem("Care", Icons.Outlined.LocalHospital),
        )
    }
    var selectedTab by remember { mutableStateOf(0) }
    var showingSchedule by remember { mutableStateOf(false) }
    var showingBiomarkers by remember { mutableStateOf(false) }

    Scaffold(
        modifier = Modifier.background(MaterialTheme.colorScheme.background),
        bottomBar = {
            if (!showingSchedule && !showingBiomarkers) {
                ClaraBottomBar(
                    tabs = tabs,
                    selectedTab = selectedTab,
                    onTabSelected = {
                        selectedTab = it
                        showingSchedule = false
                        showingBiomarkers = false
                    },
                )
            }
        },
    ) { padding ->
        when {
            showingBiomarkers -> BiomarkersDetailPage(
                onBack = { showingBiomarkers = false },
                modifier = Modifier.padding(padding),
            )
            showingSchedule -> FullSchedulePage(
                onBack = { showingSchedule = false },
                modifier = Modifier.padding(padding),
            )
            selectedTab == 0 -> HomeDashboard(
                onScheduleViewAll = { showingSchedule = true },
                modifier = Modifier.padding(padding),
            )
            selectedTab == 1 -> ProgressPage(
                onBiomarkersViewAll = { showingBiomarkers = true },
                modifier = Modifier.padding(padding),
            )
            selectedTab == 2 -> AssistantPage(
                state = state,
                onMicClick = {
                    val granted = ContextCompat.checkSelfPermission(
                        context,
                        Manifest.permission.RECORD_AUDIO
                    ) == PackageManager.PERMISSION_GRANTED

                    if (!granted) {
                        permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                    } else if (state.isRecording) {
                        viewModel.endPress()
                    } else {
                        viewModel.beginPress()
                    }
                },
                onEndSession = viewModel::disconnect,
                modifier = Modifier.padding(padding),
            )
            selectedTab == 3 -> JournalPage(
                modifier = Modifier.padding(padding),
            )
            else -> CarePage(modifier = Modifier.padding(padding))
        }
    }
}

@Composable
private fun HomeDashboard(
    onScheduleViewAll: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val schedule = remember {
        listOf(
            ScheduleItem(
                title = "Dr. Sarah Johnson",
                subtitle = "Cardiology consultation",
                time = "10:30 AM",
                icon = Icons.Outlined.LocalHospital,
                accent = WellnessMustard,
            ),
            ScheduleItem(
                title = "Take Aspirin",
                subtitle = "1 tablet after lunch",
                time = "01:00 PM",
                icon = Icons.Outlined.Restaurant,
                accent = WellnessSage,
            ),
            ScheduleItem(
                title = "Evening Walk",
                subtitle = "30 min in Gulshan Park",
                time = "07:30 PM",
                icon = Icons.AutoMirrored.Outlined.DirectionsWalk,
                accent = Color(0xFF65B881),
            ),
        )
    }
    val metrics = remember {
        listOf(
            HealthMetric(
                title = "Sleep",
                value = "7h 30m",
                caption = "Great",
                icon = Icons.Outlined.GraphicEq,
                accent = WellnessBlue,
            ),
            HealthMetric(
                title = "Steps",
                value = "6,432",
                caption = "Goal 10,000",
                icon = Icons.AutoMirrored.Outlined.DirectionsWalk,
                accent = WellnessSage,
            ),
            HealthMetric(
                title = "Mood",
                value = "Good",
                caption = "Balanced",
                icon = Icons.Outlined.ChatBubbleOutline,
                accent = Color(0xFFBCEAE9),
            ),
        )
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFFFFE785),
                        Color(0xFFFFF6D6),
                        Color(0xFFFFFCF4),
                    ),
                ),
            )
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawCircle(
                color = Color(0xFFFFD34F).copy(alpha = 0.42f),
                radius = size.width * 0.56f,
                center = Offset(size.width * 0.08f, size.height * 0.02f),
            )
            drawCircle(
                color = Color(0xFFBFE7D2).copy(alpha = 0.23f),
                radius = size.width * 0.48f,
                center = Offset(size.width * 0.98f, size.height * 0.5f),
            )
            drawCircle(
                color = Color.White.copy(alpha = 0.72f),
                radius = size.width * 0.7f,
                center = Offset(size.width * 0.55f, size.height * 1.03f),
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 18.dp)
                .padding(top = 18.dp, bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            HomeTopBar()
            GreetingBlock()
            ScheduleCard(schedule = schedule, onViewAll = onScheduleViewAll)
            HealthSummary(metrics = metrics)
            CareInsightCard()
        }
    }
}

@Composable
private fun FullSchedulePage(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val days = remember {
        listOf(
            ScheduleDay(
                label = "Mon",
                date = "13",
                title = "Monday, May 13",
                events = emptyList(),
            ),
            ScheduleDay("Tue", "14", "Tuesday, May 14", emptyList()),
            ScheduleDay(
                label = "Wed",
                date = "15",
                title = "Yesterday, May 15",
                events = listOf(
                    ScheduleEvent("8:15 AM", "Morning medication", "Vitamin D with breakfast", Icons.Outlined.GraphicEq, WellnessMustard),
                    ScheduleEvent("11:00 AM", "Check-in call", "Coach Priya, 15 min", Icons.Outlined.ChatBubbleOutline, WellnessBlue),
                    ScheduleEvent("6:15 PM", "Dinner", "Dal, rice, cucumber salad", Icons.Outlined.Restaurant, WellnessSage),
                    ScheduleEvent("9:30 PM", "Magnesium", "Take before bed", Icons.Outlined.LocalHospital, WellnessPink),
                ),
            ),
            ScheduleDay(
                label = "Thu",
                date = "16",
                title = "Today, May 16",
                events = listOf(
                    ScheduleEvent("8:00 AM", "Vitamin D", "Take with food", Icons.Outlined.GraphicEq, Color(0xFFE7E6F4)),
                    ScheduleEvent("8:30 AM", "Breakfast", "Oatmeal, berries, almonds", Icons.Outlined.Restaurant, WellnessSage),
                    ScheduleEvent("10:00 AM", "Therapy session", "Virtual", Icons.Outlined.LocalHospital, WellnessPink),
                    ScheduleEvent("12:00 PM", "Hydration reminder", "500 ml water", Icons.Outlined.AccessTime, WellnessBlue),
                    ScheduleEvent("12:30 PM", "Lunch", "Grilled salmon, quinoa, greens", Icons.Outlined.Restaurant, WellnessMustard),
                    ScheduleEvent("3:00 PM", "Walk", "20 min - light activity", Icons.AutoMirrored.Outlined.DirectionsWalk, Color(0xFFD7EFC0)),
                    ScheduleEvent("6:30 PM", "Dinner", "Lentil soup, salad", Icons.Outlined.Restaurant, WellnessSage),
                    ScheduleEvent("8:00 PM", "Evening reflection", "2 min journal", Icons.Outlined.ChatBubbleOutline, Color(0xFFBCEAE9)),
                    ScheduleEvent("9:30 PM", "Magnesium", "Take before bed", Icons.Outlined.LocalHospital, WellnessPink),
                ),
            ),
            ScheduleDay(
                label = "Fri",
                date = "17",
                title = "Tomorrow, May 17",
                events = listOf(
                    ScheduleEvent("7:45 AM", "Wake-up stretch", "8 min mobility", Icons.AutoMirrored.Outlined.DirectionsWalk, Color(0xFFD7EFC0)),
                    ScheduleEvent("9:00 AM", "Breakfast", "Eggs, toast, fruit", Icons.Outlined.Restaurant, WellnessSage),
                    ScheduleEvent("1:00 PM", "Take Aspirin", "1 tablet after lunch", Icons.Outlined.LocalHospital, WellnessMustard),
                    ScheduleEvent("7:00 PM", "Family dinner", "Keep sodium light", Icons.Outlined.Restaurant, WellnessBlue),
                ),
            ),
            ScheduleDay("Sat", "18", "Saturday, May 18", emptyList()),
            ScheduleDay("Sun", "19", "Sunday, May 19", emptyList()),
        )
    }
    var selectedDay by remember { mutableStateOf(3) }
    val day = days[selectedDay]

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFFFFF0B5),
                        Color(0xFFFFFBF1),
                        Color(0xFFFFFFFF),
                    ),
                ),
            ),
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawCircle(
                color = Color(0xFFFFD85A).copy(alpha = 0.24f),
                radius = size.width * 0.46f,
                center = Offset(size.width * 0.92f, size.height * 0.03f),
            )
            drawCircle(
                color = Color(0xFFBCEAE9).copy(alpha = 0.19f),
                radius = size.width * 0.58f,
                center = Offset(size.width * 0.08f, size.height * 0.76f),
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 18.dp)
                .padding(top = 18.dp, bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            ScheduleTopBar(title = day.title, onBack = onBack)
            DayPicker(days = days, selectedDay = selectedDay, onDaySelected = { selectedDay = it })
            DailyReadinessCard(day = day)
            ScheduleTimeline(events = day.events)
        }
    }
}

@Composable
private fun ScheduleTopBar(title: String, onBack: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconButton(
            modifier = Modifier
                .size(38.dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.7f)),
            onClick = onBack,
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Outlined.ArrowBack,
                contentDescription = "Back",
                tint = WellnessDark,
            )
        }
        Text(
            text = title,
            modifier = Modifier.weight(1f),
            style = MaterialTheme.typography.titleMedium.copy(
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = WellnessDark,
            textAlign = TextAlign.Center,
        )
        Box(
            modifier = Modifier
                .size(38.dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.7f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = Icons.Outlined.CalendarToday,
                contentDescription = null,
                modifier = Modifier.size(18.dp),
                tint = WellnessDark,
            )
        }
    }
}

@Composable
private fun DayPicker(
    days: List<ScheduleDay>,
    selectedDay: Int,
    onDaySelected: (Int) -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        days.forEachIndexed { index, day ->
            val selected = selectedDay == index
            Column(
                modifier = Modifier
                    .width(43.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(if (selected) Color(0xFFFFD95A) else Color.Transparent)
                    .clickable { onDaySelected(index) }
                    .padding(vertical = 9.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Text(
                    text = day.label,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = if (selected) WellnessDark else Color(0xFF7F7865),
                )
                Text(
                    text = day.date,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = WellnessDark,
                )
            }
        }
    }
}

@Composable
private fun DailyReadinessCard(day: ScheduleDay) {
    val complete = if (day.events.isEmpty()) "Rest day" else "${day.events.size} planned"
    WellnessPanel {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFFFE37D)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = Icons.Outlined.AccessTime,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp),
                    tint = WellnessDark,
                )
            }
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = complete,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = WellnessDark,
                )
                Text(
                    text = "Balanced meals, care reminders, movement, and wind-down.",
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 12.sp),
                    color = Color(0xFF817865),
                )
            }
        }
    }
}

@Composable
private fun ScheduleTimeline(events: List<ScheduleEvent>) {
    WellnessPanel {
        if (events.isEmpty()) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 28.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Icon(
                    imageVector = Icons.Outlined.CalendarToday,
                    contentDescription = null,
                    modifier = Modifier.size(30.dp),
                    tint = Color(0xFF9B927D),
                )
                Text(
                    text = "No care items planned",
                    style = MaterialTheme.typography.titleMedium.copy(fontSize = 16.sp),
                    color = WellnessDark,
                )
                Text(
                    text = "A quiet day is part of the plan.",
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 12.sp),
                    color = Color(0xFF817865),
                )
            }
        } else {
            events.forEachIndexed { index, event ->
                TimelineRow(event = event, isLast = index == events.lastIndex)
            }
        }
    }
}

@Composable
private fun TimelineRow(event: ScheduleEvent, isLast: Boolean) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(76.dp),
        verticalAlignment = Alignment.Top,
    ) {
        Text(
            text = event.time,
            modifier = Modifier
                .width(68.dp)
                .padding(top = 4.dp),
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = WellnessDark,
        )
        Column(
            modifier = Modifier
                .width(18.dp)
                .fillMaxHeight(),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Box(
                modifier = Modifier
                    .size(7.dp)
                    .clip(CircleShape)
                    .background(event.accent),
            )
            if (!isLast) {
                Box(
                    modifier = Modifier
                        .width(1.dp)
                        .fillMaxHeight()
                        .background(event.accent.copy(alpha = 0.24f)),
                )
            }
        }
        Spacer(Modifier.width(8.dp))
        Row(
            modifier = Modifier.weight(1f),
            verticalAlignment = Alignment.Top,
        ) {
            Box(
                modifier = Modifier
                    .size(43.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(event.accent.copy(alpha = 0.28f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = event.icon,
                    contentDescription = null,
                    modifier = Modifier.size(22.dp),
                    tint = WellnessDark,
                )
            }
            Spacer(Modifier.width(12.dp))
            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(top = 1.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Text(
                    text = event.title,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = WellnessDark,
                )
                Text(
                    text = event.subtitle,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                    ),
                    color = Color(0xFF817865),
                )
            }
            Icon(
                imageVector = Icons.AutoMirrored.Outlined.KeyboardArrowRight,
                contentDescription = null,
                modifier = Modifier
                    .padding(top = 8.dp)
                    .size(20.dp),
                tint = Color(0xFFB7AE9C),
            )
        }
    }
}

@Composable
private fun ProgressPage(
    onBiomarkersViewAll: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val sections = remember { listOf("Medication", "Nutrition", "Fitness", "Mind") }
    var selectedSection by remember { mutableStateOf(0) }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFFFFE785),
                        Color(0xFFFFF6D6),
                        Color(0xFFFFFCF4),
                    ),
                ),
            ),
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawCircle(
                color = Color(0xFFFFD34F).copy(alpha = 0.38f),
                radius = size.width * 0.55f,
                center = Offset(size.width * 0.08f, size.height * 0.02f),
            )
            drawCircle(
                color = Color(0xFFD7EFC0).copy(alpha = 0.22f),
                radius = size.width * 0.5f,
                center = Offset(size.width * 0.92f, size.height * 0.62f),
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 18.dp)
                .padding(top = 18.dp, bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            ProgressTopBar()
            ProgressSectionTabs(
                sections = sections,
                selectedSection = selectedSection,
                onSectionSelected = { selectedSection = it },
            )
            if (selectedSection == 0) {
                HealthScoreCard()
                MedicationAdherenceCard()
                BiomarkersCard(onViewAll = onBiomarkersViewAll)
            } else if (selectedSection == 1) {
                NutritionPageContent()
            } else if (selectedSection == 2) {
                FitnessPageContent()
            } else {
                MindPageContent()
            }
        }
    }
}

@Composable
private fun ProgressTopBar() {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Spacer(Modifier.weight(1f))
        Text(
            text = "Progress",
            style = MaterialTheme.typography.titleMedium.copy(
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = WellnessDark,
            textAlign = TextAlign.Center,
        )
        Row(
            modifier = Modifier.weight(1f),
            horizontalArrangement = Arrangement.End,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            HeaderIconButton(icon = Icons.Outlined.Search, label = "Search")
            Spacer(Modifier.width(8.dp))
            HeaderIconButton(icon = Icons.Outlined.Notifications, label = "Notifications")
        }
    }
}

@Composable
private fun ProgressSectionTabs(
    sections: List<String>,
    selectedSection: Int,
    onSectionSelected: (Int) -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        sections.forEachIndexed { index, section ->
            val selected = selectedSection == index
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(18.dp))
                    .shadow(
                        elevation = if (selected) 10.dp else 0.dp,
                        shape = RoundedCornerShape(18.dp),
                        spotColor = Color(0x22000000),
                    )
                    .background(if (selected) Color.White.copy(alpha = 0.9f) else Color.Transparent)
                    .clickable { onSectionSelected(index) }
                    .padding(horizontal = if (index == 0) 15.dp else 10.dp, vertical = 10.dp),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = section,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = WellnessDark,
                    maxLines = 1,
                )
            }
        }
    }
}

@Composable
private fun NutritionPageContent() {
    val macroSeries = remember {
        listOf(
            NutritionSeries(
                label = "Carbs",
                color = Color(0xFFFFB84D),
                values = listOf(218f, 226f, 210f, 232f, 240f, 228f, 216f, 236f, 242f, 230f, 222f, 238f, 246f, 233f, 224f, 229f, 235f, 241f, 227f, 220f, 232f, 244f, 249f, 236f, 225f, 231f, 238f, 242f, 234f, 228f),
            ),
            NutritionSeries(
                label = "Protein",
                color = Color(0xFF66C37A),
                values = listOf(82f, 88f, 91f, 84f, 96f, 92f, 86f, 98f, 101f, 93f, 89f, 95f, 104f, 99f, 94f, 97f, 102f, 106f, 96f, 91f, 100f, 108f, 112f, 103f, 98f, 101f, 106f, 110f, 104f, 99f),
            ),
            NutritionSeries(
                label = "Fats",
                color = Color(0xFF7BA7F2),
                values = listOf(62f, 58f, 64f, 67f, 60f, 63f, 59f, 66f, 68f, 61f, 57f, 64f, 70f, 65f, 61f, 63f, 67f, 69f, 62f, 58f, 64f, 71f, 73f, 66f, 63f, 65f, 68f, 70f, 67f, 64f),
            ),
        )
    }
    val microSeries = remember {
        listOf(
            NutritionSeries(
                label = "Fiber",
                color = Color(0xFF66C37A),
                values = listOf(64f, 68f, 71f, 66f, 74f, 78f, 69f, 73f, 76f, 80f, 72f, 75f, 82f, 86f, 79f, 77f, 84f, 88f, 81f, 76f, 83f, 90f, 92f, 86f, 82f, 85f, 89f, 93f, 88f, 84f),
            ),
            NutritionSeries(
                label = "Iron",
                color = Color(0xFFFF8A8F),
                values = listOf(58f, 61f, 55f, 63f, 67f, 60f, 64f, 69f, 66f, 62f, 57f, 65f, 70f, 68f, 63f, 61f, 67f, 72f, 69f, 64f, 66f, 73f, 76f, 71f, 68f, 70f, 74f, 78f, 75f, 72f),
            ),
            NutritionSeries(
                label = "Magnesium",
                color = Color(0xFF9B8CF2),
                values = listOf(72f, 70f, 74f, 76f, 71f, 78f, 75f, 80f, 82f, 77f, 73f, 79f, 84f, 86f, 81f, 78f, 83f, 87f, 85f, 80f, 82f, 88f, 90f, 86f, 83f, 85f, 89f, 91f, 88f, 86f),
            ),
            NutritionSeries(
                label = "Vitamin D",
                color = Color(0xFFFFD957),
                values = listOf(44f, 45f, 46f, 45f, 48f, 49f, 47f, 50f, 51f, 52f, 50f, 53f, 54f, 56f, 55f, 57f, 58f, 60f, 59f, 61f, 62f, 64f, 65f, 66f, 65f, 67f, 68f, 70f, 71f, 72f),
            ),
        )
    }

    NutritionTargetDonutCard()
    NutritionLineChartCard(
        title = "Macros",
        subtitle = "30-day intake trend in grams",
        series = macroSeries,
        footer = "Protein is trending up while carbs are staying in the planned range.",
        valueSuffix = "g",
    )
    NutritionLineChartCard(
        title = "Micros",
        subtitle = "30-day target coverage",
        series = microSeries,
        footer = "Vitamin D is catching up slowly; fiber and magnesium are the strongest streaks.",
        valueSuffix = "%",
    )
}

@Composable
private fun NutritionTargetDonutCard() {
    WellnessPanel {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = "Calories & Macros",
                modifier = Modifier.weight(1f),
                style = MaterialTheme.typography.titleMedium.copy(
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = WellnessDark,
            )
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color.White.copy(alpha = 0.72f))
                    .padding(horizontal = 11.dp, vertical = 7.dp),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = "Edit goals",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Color(0xFF817865),
                )
            }
        }
        Spacer(Modifier.height(18.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier.size(126.dp),
                contentAlignment = Alignment.Center,
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val stroke = 12.dp.toPx()
                    val diameter = min(size.width, size.height) - stroke
                    val topLeft = Offset(stroke / 2f, stroke / 2f)
                    drawArc(
                        color = Color(0xFFEDE8D8),
                        startAngle = -90f,
                        sweepAngle = 360f,
                        useCenter = false,
                        topLeft = topLeft,
                        size = androidx.compose.ui.geometry.Size(diameter, diameter),
                        style = Stroke(width = stroke, cap = StrokeCap.Round),
                    )
                    val achievedSweep = 360f * 0.78f
                    val gap = 4f
                    val segments = listOf(
                        Pair(Color(0xFFFFB84D), 0.45f),
                        Pair(Color(0xFF66C37A), 0.30f),
                        Pair(Color(0xFF4D5358), 0.25f),
                    )
                    var start = -90f
                    segments.forEach { (color, portion) ->
                        val sweep = achievedSweep * portion - gap
                        drawArc(
                            color = color,
                            startAngle = start,
                            sweepAngle = sweep.coerceAtLeast(1f),
                            useCenter = false,
                            topLeft = topLeft,
                            size = androidx.compose.ui.geometry.Size(diameter, diameter),
                            style = Stroke(width = stroke, cap = StrokeCap.Round),
                        )
                        start += achievedSweep * portion
                    }
                }
            }
            Spacer(Modifier.width(16.dp))
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Row(verticalAlignment = Alignment.Bottom) {
                    Text(
                        text = "1,642",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontSize = 25.sp,
                            lineHeight = 27.sp,
                            fontWeight = FontWeight.Bold,
                        ),
                        color = WellnessDark,
                    )
                    Spacer(Modifier.width(4.dp))
                    Text(
                        text = "/2,100 kcal",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                        ),
                        color = Color(0xFF817865),
                    )
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(9.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF9DD27D)),
                    )
                    Spacer(Modifier.width(6.dp))
                    Text(
                        text = "78% of goal",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                        ),
                        color = Color(0xFF817865),
                    )
                }
                Spacer(Modifier.height(4.dp))
                MacroBreakdownRow(label = "Carbs", percent = "45%", grams = "184g", color = Color(0xFFFFB84D))
                MacroBreakdownRow(label = "Protein", percent = "30%", grams = "123g", color = Color(0xFF66C37A))
                MacroBreakdownRow(label = "Fat", percent = "25%", grams = "46g", color = Color(0xFF4D5358))
            }
        }
    }
}

@Composable
private fun MacroBreakdownRow(label: String, percent: String, grams: String, color: Color) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(10.dp)
                .clip(CircleShape)
                .background(color),
        )
        Spacer(Modifier.width(7.dp))
        Text(
            text = label,
            modifier = Modifier.weight(1f),
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = Color(0xFF746C5E),
        )
        Text(
            text = percent,
            modifier = Modifier.width(34.dp),
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = WellnessDark,
            textAlign = TextAlign.End,
        )
        Spacer(Modifier.width(8.dp))
        Text(
            text = grams,
            modifier = Modifier.width(38.dp),
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = WellnessDark,
            textAlign = TextAlign.End,
        )
    }
}

@Composable
private fun NutritionLineChartCard(
    title: String,
    subtitle: String,
    series: List<NutritionSeries>,
    footer: String,
    valueSuffix: String,
) {
    WellnessPanel {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium.copy(
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = WellnessDark,
        )
        Text(
            text = subtitle,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
            ),
            color = Color(0xFF817865),
        )
        Spacer(Modifier.height(12.dp))
        NutritionLineChart(series = series)
        Spacer(Modifier.height(10.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            series.forEach { item ->
                NutritionLegendChip(
                    label = item.label,
                    value = "${item.values.last().toInt()}$valueSuffix",
                    color = item.color,
                    modifier = Modifier.weight(1f),
                )
            }
        }
        Spacer(Modifier.height(10.dp))
        Text(
            text = footer,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
            ),
            color = Color(0xFF817865),
        )
    }
}

@Composable
private fun NutritionLineChart(series: List<NutritionSeries>) {
    val allValues = series.flatMap { it.values }
    val minValue = (allValues.minOrNull() ?: 0f) * 0.88f
    val maxValue = (allValues.maxOrNull() ?: 1f) * 1.08f
    val range = (maxValue - minValue).coerceAtLeast(1f)

    Canvas(
        modifier = Modifier
            .fillMaxWidth()
            .height(178.dp)
            .clip(RoundedCornerShape(18.dp))
            .background(Color.White.copy(alpha = 0.5f))
            .padding(12.dp),
    ) {
        val chartLeft = 8.dp.toPx()
        val chartRight = size.width - 8.dp.toPx()
        val chartTop = 12.dp.toPx()
        val chartBottom = size.height - 18.dp.toPx()
        val chartHeight = chartBottom - chartTop
        val chartWidth = chartRight - chartLeft

        repeat(4) { index ->
            val y = chartTop + chartHeight * index / 3f
            drawLine(
                color = Color(0xFFEDE8D8),
                start = Offset(chartLeft, y),
                end = Offset(chartRight, y),
                strokeWidth = 1.dp.toPx(),
            )
        }

        series.forEach { item ->
            val points = item.values.mapIndexed { index, value ->
                val x = chartLeft + chartWidth * index / (item.values.lastIndex.coerceAtLeast(1)).toFloat()
                val y = chartBottom - ((value - minValue) / range) * chartHeight
                Offset(x, y)
            }
            points.zipWithNext().forEach { (start, end) ->
                drawLine(
                    color = item.color,
                    start = start,
                    end = end,
                    strokeWidth = 3.5.dp.toPx(),
                    cap = StrokeCap.Round,
                )
            }
            points.lastOrNull()?.let { point ->
                drawCircle(
                    color = Color.White,
                    radius = 5.5.dp.toPx(),
                    center = point,
                )
                drawCircle(
                    color = item.color,
                    radius = 3.8.dp.toPx(),
                    center = point,
                )
            }
        }
    }
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        listOf("Day 1", "Day 15", "Day 30").forEach { label ->
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = Color(0xFF8D846F),
            )
        }
    }
}

@Composable
private fun NutritionLegendChip(
    label: String,
    value: String,
    color: Color,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(14.dp))
            .background(color.copy(alpha = 0.18f))
            .padding(horizontal = 9.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(color),
            )
            Spacer(Modifier.width(5.dp))
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = WellnessDark,
                maxLines = 1,
            )
        }
        Text(
            text = value,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = WellnessDark,
        )
    }
}

@Composable
private fun FitnessPageContent() {
    val stats = remember {
        listOf(
            FitnessStat("Active minutes", "232", "min", "Goal 300 min", 0.77f, WellnessSage),
            FitnessStat("Workouts", "5", "this week", "Goal 5", 1f, Color(0xFF7BA7F2)),
            FitnessStat("Calories burned", "1,642", "kcal", "Daily burn", 0.72f, WellnessMustard),
            FitnessStat("Exercise streak", "12", "days", "Still warm", 0.86f, WellnessPink),
        )
    }
    val activeMinutes = remember { listOf(8f, 14f, 46f, 20f, 25f, 54f, 48f, 30f, 50f) }
    val performance = remember { listOf(510f, 470f, 650f, 560f, 610f, 635f, 780f) }
    val goals = remember {
        listOf(
            FitnessGoal("Workouts this month", "16", "20", 80, Color(0xFF7BA7F2), Icons.Outlined.GraphicEq),
            FitnessGoal("Active minutes", "920", "1,200 min", 77, WellnessSage, Icons.AutoMirrored.Outlined.DirectionsWalk),
            FitnessGoal("Run 5K", "3", "4 runs", 75, Color(0xFFFFB84D), Icons.AutoMirrored.Outlined.DirectionsWalk),
            FitnessGoal("Strength sessions", "8", "10", 80, Color(0xFF9B8CF2), Icons.Outlined.LocalHospital),
        )
    }

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            FitnessStatTile(stats[0])
            FitnessStatTile(stats[2])
        }
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            FitnessStatTile(stats[1])
            FitnessStatTile(stats[3])
        }
    }
    WeeklyGoalAndBalanceCard()
    FitnessTrendCard(
        title = "Active minutes trend",
        subtitle = "This week",
        values = activeMinutes,
        color = WellnessSage,
        labels = listOf("M", "T", "W", "T", "F", "S", "S"),
        footer = "Best day: Saturday, 54 active minutes.",
    )
    StrengthHighlightsCard()
    CardioHighlightsCard()
    WorkoutTypeSplitCard()
    FitnessTrendCard(
        title = "Performance trend",
        subtitle = "4 weeks",
        values = performance,
        color = Color(0xFF9B8CF2),
        labels = listOf("Apr 21", "Apr 28", "May 5", "May 12", "May 19"),
        footer = "Training load is up 18% with a clean recovery pattern.",
    )
    MonthlyGoalsCard(goals = goals)
}

@Composable
private fun FitnessStatTile(stat: FitnessStat) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(104.dp)
            .shadow(8.dp, RoundedCornerShape(18.dp), spotColor = Color(0x12000000)),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.78f)),
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .border(1.dp, Color.White.copy(alpha = 0.85f), RoundedCornerShape(18.dp))
                .padding(13.dp),
            verticalArrangement = Arrangement.SpaceBetween,
        ) {
            Text(
                text = stat.title,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = WellnessDark,
            )
            Row(verticalAlignment = Alignment.Bottom) {
                Text(
                    text = stat.value,
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontSize = 24.sp,
                        lineHeight = 26.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = WellnessDark,
                )
                Spacer(Modifier.width(4.dp))
                Text(
                    text = stat.unit,
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp),
                    color = Color(0xFF817865),
                )
            }
            Column(verticalArrangement = Arrangement.spacedBy(5.dp)) {
                Text(
                    text = stat.caption,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Color(0xFF817865),
                )
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .clip(RoundedCornerShape(6.dp))
                        .background(Color(0xFFEDE8D8)),
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(stat.progress.coerceIn(0f, 1f))
                            .fillMaxHeight()
                            .background(stat.color),
                    )
                }
            }
        }
    }
}

@Composable
private fun WeeklyGoalAndBalanceCard() {
    WellnessPanel {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Weekly goal progress",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = WellnessDark,
                )
                Spacer(Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.Bottom) {
                    Text(
                        text = "77%",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontSize = 27.sp,
                            fontWeight = FontWeight.Bold,
                        ),
                        color = WellnessDark,
                    )
                    Spacer(Modifier.width(6.dp))
                    Text(
                        text = "232 of 300 min",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                        ),
                        color = Color(0xFF817865),
                    )
                }
                Spacer(Modifier.height(10.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(7.dp)
                        .clip(RoundedCornerShape(7.dp))
                        .background(Color(0xFFEDE8D8)),
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(0.77f)
                            .fillMaxHeight()
                            .background(WellnessSage),
                    )
                }
            }
            Spacer(Modifier.width(18.dp))
            RingPercent(percent = 0.77f, color = WellnessSage, modifier = Modifier.size(78.dp))
        }
        Spacer(Modifier.height(18.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = "Training balance",
                modifier = Modifier.weight(1f),
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = WellnessDark,
            )
            Text(
                text = "This week",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = Color(0xFF817865),
            )
        }
        Spacer(Modifier.height(10.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(9.dp)) {
            BalanceLabel("Strength", "45%", Color(0xFF9B8CF2), Modifier.weight(1f))
            BalanceLabel("Cardio", "35%", WellnessSage, Modifier.weight(1f))
            BalanceLabel("Mobility", "20%", WellnessBlue, Modifier.weight(1f))
        }
        Spacer(Modifier.height(8.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(10.dp)
                .clip(RoundedCornerShape(10.dp)),
        ) {
            Box(Modifier.weight(45f).fillMaxHeight().background(Color(0xFF9B8CF2)))
            Box(Modifier.weight(35f).fillMaxHeight().background(WellnessSage))
            Box(Modifier.weight(20f).fillMaxHeight().background(WellnessBlue))
        }
    }
}

@Composable
private fun RingPercent(percent: Float, color: Color, modifier: Modifier = Modifier) {
    Box(modifier = modifier, contentAlignment = Alignment.Center) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val stroke = 10.dp.toPx()
            val diameter = min(size.width, size.height) - stroke
            val topLeft = Offset(stroke / 2f, stroke / 2f)
            drawArc(
                color = Color(0xFFEDE8D8),
                startAngle = -90f,
                sweepAngle = 360f,
                useCenter = false,
                topLeft = topLeft,
                size = androidx.compose.ui.geometry.Size(diameter, diameter),
                style = Stroke(width = stroke, cap = StrokeCap.Round),
            )
            drawArc(
                color = color,
                startAngle = -90f,
                sweepAngle = 360f * percent.coerceIn(0f, 1f),
                useCenter = false,
                topLeft = topLeft,
                size = androidx.compose.ui.geometry.Size(diameter, diameter),
                style = Stroke(width = stroke, cap = StrokeCap.Round),
            )
        }
    }
}

@Composable
private fun BalanceLabel(label: String, value: String, color: Color, modifier: Modifier = Modifier) {
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = Color(0xFF746C5E),
        )
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(7.dp).clip(CircleShape).background(color))
            Spacer(Modifier.width(5.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = WellnessDark,
            )
        }
    }
}

@Composable
private fun FitnessTrendCard(
    title: String,
    subtitle: String,
    values: List<Float>,
    color: Color,
    labels: List<String>,
    footer: String,
) {
    WellnessPanel {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = title,
                modifier = Modifier.weight(1f),
                style = MaterialTheme.typography.titleMedium.copy(
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = WellnessDark,
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = Color(0xFF817865),
            )
        }
        Spacer(Modifier.height(12.dp))
        SoftLineChart(values = values, color = color, modifier = Modifier.height(152.dp))
        Spacer(Modifier.height(6.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            labels.forEachIndexed { index, label ->
                if (index == 0 || index == labels.lastIndex || labels.size <= 7 || index % 2 == 0) {
                    Text(
                        text = label,
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                        ),
                        color = Color(0xFF8D846F),
                    )
                }
            }
        }
        Spacer(Modifier.height(8.dp))
        Text(
            text = footer,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
            ),
            color = Color(0xFF817865),
        )
    }
}

@Composable
private fun SoftLineChart(values: List<Float>, color: Color, modifier: Modifier = Modifier) {
    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(Color.White.copy(alpha = 0.52f))
            .padding(12.dp),
    ) {
        val minValue = (values.minOrNull() ?: 0f) * 0.82f
        val maxValue = (values.maxOrNull() ?: 1f) * 1.12f
        val range = (maxValue - minValue).coerceAtLeast(1f)
        val left = 12.dp.toPx()
        val right = size.width - 12.dp.toPx()
        val top = 14.dp.toPx()
        val bottom = size.height - 18.dp.toPx()
        val width = right - left
        val height = bottom - top

        repeat(4) { index ->
            val y = top + height * index / 3f
            drawLine(Color(0xFFEDE8D8), Offset(left, y), Offset(right, y), strokeWidth = 1.dp.toPx())
        }
        val points = values.mapIndexed { index, value ->
            Offset(
                x = left + width * index / values.lastIndex.coerceAtLeast(1).toFloat(),
                y = bottom - ((value - minValue) / range) * height,
            )
        }
        points.zipWithNext().forEach { (start, end) ->
            drawLine(color.copy(alpha = 0.28f), Offset(start.x, bottom), Offset(start.x, start.y), strokeWidth = 1.dp.toPx())
            drawLine(color, start, end, strokeWidth = 3.5.dp.toPx(), cap = StrokeCap.Round)
        }
        points.forEachIndexed { index, point ->
            if (index == points.lastIndex || index % 2 == 0) {
                drawCircle(Color.White, radius = 5.5.dp.toPx(), center = point)
                drawCircle(color, radius = 3.8.dp.toPx(), center = point)
            }
        }
    }
}

@Composable
private fun StrengthHighlightsCard() {
    WellnessPanel {
        CardTitleRow("Strength highlights", "This week")
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            FitnessMiniMetric("Total volume lifted", "14,280", "lb", "+8% vs last week", WellnessBlue, Modifier.weight(1f))
            FitnessMiniMetric("Reps completed", "1,248", "reps", "+6% vs last week", WellnessSage, Modifier.weight(1f))
        }
        Spacer(Modifier.height(10.dp))
        FitnessMiniMetric("Personal bests", "4", "this month", "+2 new PRs", WellnessMustard, Modifier.fillMaxWidth())
    }
}

@Composable
private fun CardioHighlightsCard() {
    WellnessPanel {
        CardTitleRow("Cardio highlights", "This week")
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            FitnessMiniMetric("Avg heart rate", "142", "bpm", "On track", WellnessPink, Modifier.weight(1f))
            FitnessMiniMetric("Distance", "18.6", "mi", "+1.6 mi", WellnessSage, Modifier.weight(1f))
        }
        Spacer(Modifier.height(10.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            FitnessMiniMetric("Avg pace", "8:42", "/mi", "On track", WellnessBlue, Modifier.weight(1f))
            FitnessMiniMetric("VO2 max", "48", "ml/kg/min", "+3 vs last week", Color(0xFF9B8CF2), Modifier.weight(1f))
        }
    }
}

@Composable
private fun CardTitleRow(title: String, meta: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text(
            text = title,
            modifier = Modifier.weight(1f),
            style = MaterialTheme.typography.titleMedium.copy(
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = WellnessDark,
        )
        Text(
            text = meta,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = Color(0xFF817865),
        )
    }
}

@Composable
private fun FitnessMiniMetric(
    title: String,
    value: String,
    unit: String,
    caption: String,
    color: Color,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White.copy(alpha = 0.58f))
            .border(1.dp, Color(0xFFF1E9D8), RoundedCornerShape(16.dp))
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(7.dp),
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, fontWeight = FontWeight.Bold),
            color = Color(0xFF746C5E),
        )
        Row(verticalAlignment = Alignment.Bottom) {
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium.copy(fontSize = 21.sp, fontWeight = FontWeight.Bold),
                color = WellnessDark,
            )
            Spacer(Modifier.width(4.dp))
            Text(
                text = unit,
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp),
                color = Color(0xFF817865),
            )
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(8.dp).clip(CircleShape).background(color))
            Spacer(Modifier.width(6.dp))
            Text(
                text = caption,
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, fontWeight = FontWeight.Bold),
                color = Color(0xFF26A568),
            )
        }
    }
}

@Composable
private fun WorkoutTypeSplitCard() {
    WellnessPanel {
        CardTitleRow("Workout-type split", "This week")
        Spacer(Modifier.height(14.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            SegmentedDonut(
                segments = listOf(
                    Pair(Color(0xFF9B8CF2), 0.45f),
                    Pair(WellnessSage, 0.35f),
                    Pair(WellnessPink, 0.15f),
                    Pair(WellnessMustard, 0.05f),
                ),
                modifier = Modifier.size(112.dp),
            )
            Spacer(Modifier.width(18.dp))
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(9.dp)) {
                SplitLegend("Strength", "45%", Color(0xFF9B8CF2))
                SplitLegend("Cardio", "35%", WellnessSage)
                SplitLegend("Mobility", "15%", WellnessPink)
                SplitLegend("HIIT", "5%", WellnessMustard)
            }
        }
    }
}

@Composable
private fun SegmentedDonut(segments: List<Pair<Color, Float>>, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val stroke = 18.dp.toPx()
        val diameter = min(size.width, size.height) - stroke
        val topLeft = Offset(stroke / 2f, stroke / 2f)
        var start = -90f
        segments.forEach { (color, portion) ->
            val sweep = 360f * portion - 4f
            drawArc(
                color = color,
                startAngle = start,
                sweepAngle = sweep.coerceAtLeast(1f),
                useCenter = false,
                topLeft = topLeft,
                size = androidx.compose.ui.geometry.Size(diameter, diameter),
                style = Stroke(width = stroke, cap = StrokeCap.Round),
            )
            start += 360f * portion
        }
    }
}

@Composable
private fun SplitLegend(label: String, value: String, color: Color) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(9.dp).clip(CircleShape).background(color))
        Spacer(Modifier.width(8.dp))
        Text(
            text = label,
            modifier = Modifier.weight(1f),
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 12.sp, fontWeight = FontWeight.Bold),
            color = Color(0xFF746C5E),
        )
        Text(
            text = value,
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 12.sp, fontWeight = FontWeight.Bold),
            color = WellnessDark,
        )
    }
}

@Composable
private fun MonthlyGoalsCard(goals: List<FitnessGoal>) {
    WellnessPanel {
        SectionHeader(title = "Monthly goals")
        Spacer(Modifier.height(10.dp))
        goals.forEachIndexed { index, goal ->
            MonthlyGoalRow(goal = goal)
            if (index != goals.lastIndex) {
                Spacer(Modifier.height(12.dp))
            }
        }
    }
}

@Composable
private fun MonthlyGoalRow(goal: FitnessGoal) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(34.dp)
                .clip(CircleShape)
                .background(goal.color.copy(alpha = 0.2f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(goal.icon, contentDescription = null, modifier = Modifier.size(18.dp), tint = goal.color)
        }
        Spacer(Modifier.width(10.dp))
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = goal.title,
                    modifier = Modifier.weight(1f),
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 12.sp, fontWeight = FontWeight.Bold),
                    color = WellnessDark,
                )
                Text(
                    text = "${goal.current} / ${goal.target}",
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, fontWeight = FontWeight.Bold),
                    color = Color(0xFF746C5E),
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    text = "${goal.percent}%",
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, fontWeight = FontWeight.Bold),
                    color = WellnessDark,
                )
            }
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(RoundedCornerShape(6.dp))
                    .background(Color(0xFFEDE8D8)),
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth(goal.percent / 100f)
                        .fillMaxHeight()
                        .background(goal.color),
                )
            }
        }
    }
}

@Composable
private fun MindPageContent() {
    val sleepStats = remember {
        listOf(
            MindStat("Sleep duration", "7h 42", "m", "Goal 8h", WellnessBlue, Icons.Outlined.GraphicEq),
            MindStat("Sleep quality", "78", "Good", "Restorative", WellnessMustard, Icons.Outlined.Notifications),
            MindStat("Bedtime consistency", "87%", "Great", "Stable rhythm", Color(0xFF9B8CF2), Icons.Outlined.AccessTime),
            MindStat("Sleep debt", "25", "min", "Low", Color(0xFFBCEAE9), Icons.AutoMirrored.Outlined.KeyboardArrowRight),
            MindStat("Time asleep", "7h 18", "m", "Quiet night", WellnessSage, Icons.Outlined.CalendarToday),
            MindStat("Restfulness", "7.6", "/10", "Good", WellnessPink, Icons.Outlined.ChatBubbleOutline),
        )
    }
    val stages = remember {
        listOf(
            SleepStage("Deep", "1h 32m", "21%", Color(0xFF6D63F6), 21f),
            SleepStage("Core", "4h 16m", "58%", Color(0xFF7BA7F2), 58f),
            SleepStage("REM", "1h 24m", "19%", Color(0xFF66C7AF), 19f),
            SleepStage("Awake", "30m", "4%", Color(0xFFFF9DB0), 4f),
        )
    }
    val sleepTrend = remember { listOf(5.1f, 7.8f, 6.7f, 6.2f, 6.6f, 7.3f, 5.8f, 8.0f, 6.7f) }
    val mood = remember { listOf(6.8f, 8.4f, 5.6f, 7.5f, 4.8f, 7.9f, 7.4f) }
    val stability = remember { listOf(5.1f, 6.3f, 5.4f, 4.7f, 5.2f, 3.4f, 4.5f) }
    val stress = remember { listOf(8f, 6.2f, 4.9f, 6.5f, 4.3f, 3.8f, 4.4f, 3.4f) }

    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            MindStatTile(sleepStats[0])
            MindStatTile(sleepStats[2])
            MindStatTile(sleepStats[4])
        }
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            MindStatTile(sleepStats[1])
            MindStatTile(sleepStats[3])
            MindStatTile(sleepStats[5])
        }
    }
    SleepStagesCard(stages = stages)
    FitnessTrendCard(
        title = "Sleep trend",
        subtitle = "7 days",
        values = sleepTrend,
        color = Color(0xFF9B8CF2),
        labels = listOf("M", "T", "W", "T", "F", "S", "S"),
        footer = "Average sleep is 6h 52m. Saturday was the strongest recovery night.",
    )
    SleepFactorsCard()
    MindBalanceCards()
    MoodStabilityCard(mood = mood, stability = stability)
    StressLoadCard(values = stress)
}

@Composable
private fun MindStatTile(stat: MindStat) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(103.dp)
            .shadow(8.dp, RoundedCornerShape(18.dp), spotColor = Color(0x12000000)),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.78f)),
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .border(1.dp, Color.White.copy(alpha = 0.86f), RoundedCornerShape(18.dp))
                .padding(12.dp),
            verticalArrangement = Arrangement.SpaceBetween,
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = stat.title,
                    modifier = Modifier.weight(1f),
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, fontWeight = FontWeight.Bold),
                    color = WellnessDark,
                )
                Box(
                    modifier = Modifier.size(25.dp).clip(CircleShape).background(stat.accent.copy(alpha = 0.22f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(stat.icon, contentDescription = null, modifier = Modifier.size(14.dp), tint = stat.accent)
                }
            }
            Row(verticalAlignment = Alignment.Bottom) {
                Text(
                    text = stat.value,
                    style = MaterialTheme.typography.titleMedium.copy(fontSize = 24.sp, lineHeight = 25.sp, fontWeight = FontWeight.Bold),
                    color = WellnessDark,
                )
                Spacer(Modifier.width(4.dp))
                Text(
                    text = stat.unit,
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, fontWeight = FontWeight.Bold),
                    color = Color(0xFF817865),
                )
            }
            Text(
                text = stat.caption,
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, fontWeight = FontWeight.Bold),
                color = Color(0xFF26A568),
            )
        }
    }
}

@Composable
private fun SleepStagesCard(stages: List<SleepStage>) {
    WellnessPanel {
        Text(
            text = "Sleep stages",
            style = MaterialTheme.typography.titleMedium.copy(fontSize = 17.sp, fontWeight = FontWeight.Bold),
            color = WellnessDark,
        )
        Text(
            text = "Last night",
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 12.sp, fontWeight = FontWeight.Medium),
            color = Color(0xFF817865),
        )
        Spacer(Modifier.height(14.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(28.dp)
                .clip(RoundedCornerShape(14.dp))
                .background(Color(0xFFEDE8D8)),
        ) {
            stages.forEach { stage ->
                Box(
                    modifier = Modifier
                        .weight(stage.weight)
                        .fillMaxHeight()
                        .background(stage.color),
                )
            }
        }
        Spacer(Modifier.height(14.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            stages.take(2).forEach { stage -> SleepStageLegend(stage, Modifier.weight(1f)) }
        }
        Spacer(Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            stages.drop(2).forEach { stage -> SleepStageLegend(stage, Modifier.weight(1f)) }
        }
    }
}

@Composable
private fun SleepStageLegend(stage: SleepStage, modifier: Modifier = Modifier) {
    Row(modifier = modifier, verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(10.dp).clip(RoundedCornerShape(3.dp)).background(stage.color))
        Spacer(Modifier.width(7.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = stage.label,
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 12.sp, fontWeight = FontWeight.Bold),
                color = WellnessDark,
            )
            Text(
                text = stage.duration,
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, fontWeight = FontWeight.Medium),
                color = Color(0xFF817865),
            )
        }
        Text(
            text = stage.percent,
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, fontWeight = FontWeight.Bold),
            color = WellnessDark,
        )
    }
}

@Composable
private fun SleepFactorsCard() {
    WellnessPanel {
        Text(
            text = "Sleep factors",
            style = MaterialTheme.typography.titleMedium.copy(fontSize = 17.sp, fontWeight = FontWeight.Bold),
            color = WellnessDark,
        )
        Spacer(Modifier.height(12.dp))
        SleepFactorRow("Late caffeine", "After 2 PM", "- Impact", WellnessPink, Icons.Outlined.Restaurant)
        SleepFactorRow("Screen time", "High", "- Impact", WellnessPink, Icons.Outlined.Notifications)
        SleepFactorRow("Evening walk", "30 min", "+ Impact", WellnessSage, Icons.AutoMirrored.Outlined.DirectionsWalk)
        SleepFactorRow("Meditation", "10 min", "+ Impact", WellnessSage, Icons.Outlined.ChatBubbleOutline)
    }
}

@Composable
private fun SleepFactorRow(
    title: String,
    value: String,
    impact: String,
    color: Color,
    icon: ImageVector,
) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 7.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier.size(30.dp).clip(RoundedCornerShape(10.dp)).background(color.copy(alpha = 0.2f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(icon, contentDescription = null, modifier = Modifier.size(16.dp), tint = WellnessDark)
        }
        Spacer(Modifier.width(10.dp))
        Text(
            text = title,
            modifier = Modifier.weight(1f),
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 12.sp, fontWeight = FontWeight.Bold),
            color = WellnessDark,
        )
        Text(
            text = value,
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, fontWeight = FontWeight.Bold),
            color = Color(0xFF817865),
        )
        Spacer(Modifier.width(10.dp))
        Box(
            modifier = Modifier.clip(RoundedCornerShape(12.dp)).background(color.copy(alpha = 0.24f)).padding(horizontal = 9.dp, vertical = 5.dp),
        ) {
            Text(
                text = impact,
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, fontWeight = FontWeight.Bold),
                color = if (impact.startsWith("+")) Color(0xFF2F9E5C) else Color(0xFFC65B63),
            )
        }
    }
}

@Composable
private fun MindBalanceCards() {
    WellnessPanel {
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            MindMiniMetric("Mind balance score", "82", "Good", WellnessSage, Modifier.weight(1f))
            MindMiniMetric("Average mood", "7.6", "/10 this week", WellnessMustard, Modifier.weight(1f))
        }
        Spacer(Modifier.height(10.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            MindMiniMetric("High-stress episodes", "3", "This week", WellnessPink, Modifier.weight(1f))
            MindMiniMetric("Mindfulness minutes", "94", "This week", Color(0xFFBCEAE9), Modifier.weight(1f))
        }
    }
}

@Composable
private fun MindMiniMetric(
    title: String,
    value: String,
    caption: String,
    color: Color,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White.copy(alpha = 0.6f))
            .border(1.dp, Color(0xFFF1E9D8), RoundedCornerShape(16.dp))
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(7.dp),
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, fontWeight = FontWeight.Bold),
            color = WellnessDark,
        )
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium.copy(fontSize = 25.sp, fontWeight = FontWeight.Bold),
            color = WellnessDark,
        )
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(8.dp).clip(CircleShape).background(color))
            Spacer(Modifier.width(6.dp))
            Text(
                text = caption,
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, fontWeight = FontWeight.Bold),
                color = Color(0xFF817865),
            )
        }
    }
}

@Composable
private fun MoodStabilityCard(mood: List<Float>, stability: List<Float>) {
    WellnessPanel {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                Text(
                    text = "Mood stability",
                    style = MaterialTheme.typography.titleMedium.copy(fontSize = 17.sp, fontWeight = FontWeight.Bold),
                    color = WellnessDark,
                )
                Text(
                    text = "7-day emotional rhythm",
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 12.sp, fontWeight = FontWeight.Medium),
                    color = Color(0xFF817865),
                )
            }
            MoodLegendChip("Mood", Color(0xFF7567F4))
            Spacer(Modifier.width(8.dp))
            MoodLegendChip("Stability", WellnessSage)
        }
        Spacer(Modifier.height(14.dp))
        MoodStabilityChart(
            series = listOf(
                NutritionSeries("Mood", Color(0xFF7567F4), mood),
                NutritionSeries("Stability", WellnessSage, stability),
            ),
            modifier = Modifier.height(190.dp),
        )
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            MoodSummaryPill("Average mood", "7.6", Color(0xFF7567F4), Modifier.weight(1f))
            MoodSummaryPill("Stable days", "5/7", WellnessSage, Modifier.weight(1f))
        }
    }
}

@Composable
private fun MoodLegendChip(label: String, color: Color) {
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(14.dp))
            .background(color.copy(alpha = 0.15f))
            .padding(horizontal = 8.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.size(8.dp).clip(CircleShape).background(color))
        Spacer(Modifier.width(5.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, fontWeight = FontWeight.Bold),
            color = WellnessDark,
        )
    }
}

@Composable
private fun MoodSummaryPill(label: String, value: String, color: Color, modifier: Modifier = Modifier) {
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(14.dp))
            .background(Color.White.copy(alpha = 0.58f))
            .border(1.dp, Color(0xFFF1E9D8), RoundedCornerShape(14.dp))
            .padding(horizontal = 11.dp, vertical = 9.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.size(9.dp).clip(CircleShape).background(color))
        Spacer(Modifier.width(7.dp))
        Text(
            text = label,
            modifier = Modifier.weight(1f),
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp, fontWeight = FontWeight.Bold),
            color = Color(0xFF746C5E),
        )
        Text(
            text = value,
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 13.sp, fontWeight = FontWeight.Bold),
            color = WellnessDark,
        )
    }
}

@Composable
private fun MoodStabilityChart(series: List<NutritionSeries>, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(Color.White.copy(alpha = 0.52f))
            .padding(horizontal = 10.dp, vertical = 10.dp),
    ) {
        Row(modifier = Modifier.weight(1f)) {
            Column(
                modifier = Modifier
                    .width(24.dp)
                    .fillMaxHeight(),
                verticalArrangement = Arrangement.SpaceBetween,
                horizontalAlignment = Alignment.End,
            ) {
                listOf("10", "5", "0").forEach {
                    Text(
                        text = it,
                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, fontWeight = FontWeight.Bold),
                        color = Color(0xFF8D846F),
                    )
                }
            }
            Spacer(Modifier.width(8.dp))
            MultiSoftLineChart(
                series = series,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight(),
            )
        }
        Spacer(Modifier.height(8.dp))
        Row(modifier = Modifier.padding(start = 32.dp).fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            listOf("M", "T", "W", "T", "F", "S", "S").forEach {
                Text(
                    text = it,
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, fontWeight = FontWeight.Bold),
                    color = Color(0xFF8D846F),
                )
            }
        }
    }
}

@Composable
private fun MultiSoftLineChart(series: List<NutritionSeries>, modifier: Modifier = Modifier) {
    val all = series.flatMap { it.values }
    val minValue = ((all.minOrNull() ?: 0f) - 1f).coerceAtLeast(0f)
    val maxValue = ((all.maxOrNull() ?: 10f) + 1f).coerceAtMost(10f)
    val range = (maxValue - minValue).coerceAtLeast(1f)
    Canvas(
        modifier = modifier
            .fillMaxWidth()
    ) {
        val left = 4.dp.toPx()
        val right = size.width - 4.dp.toPx()
        val top = 8.dp.toPx()
        val bottom = size.height - 8.dp.toPx()
        val width = right - left
        val height = bottom - top
        repeat(5) { index ->
            val y = top + height * index / 4f
            drawLine(Color(0xFFEDE8D8), Offset(left, y), Offset(right, y), strokeWidth = 1.dp.toPx())
        }
        series.forEach { item ->
            val points = item.values.mapIndexed { index, value ->
                Offset(
                    x = left + width * index / item.values.lastIndex.coerceAtLeast(1).toFloat(),
                    y = bottom - ((value - minValue) / range) * height,
                )
            }
            points.zipWithNext().forEach { (start, end) ->
                drawLine(item.color.copy(alpha = 0.38f), Offset(start.x, bottom), Offset(start.x, start.y), strokeWidth = 1.dp.toPx())
                drawLine(item.color, start, end, strokeWidth = 3.5.dp.toPx(), cap = StrokeCap.Round)
            }
            points.forEachIndexed { index, point ->
                if (index == 0 || index == points.lastIndex || index == 3 || index == 5) {
                    drawCircle(Color.White, 5.8.dp.toPx(), point)
                    drawCircle(item.color, 3.8.dp.toPx(), point)
                }
            }
        }
    }
}

@Composable
private fun StressLoadCard(values: List<Float>) {
    WellnessPanel {
        Text(
            text = "Stress load by day",
            style = MaterialTheme.typography.titleMedium.copy(fontSize = 17.sp, fontWeight = FontWeight.Bold),
            color = WellnessDark,
        )
        Spacer(Modifier.height(12.dp))
        Row(
            modifier = Modifier.fillMaxWidth().height(170.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.Bottom,
        ) {
            Column(
                modifier = Modifier.width(32.dp).fillMaxHeight(),
                verticalArrangement = Arrangement.SpaceBetween,
            ) {
                listOf("High", "Med", "Low").forEach {
                    Text(
                        text = it,
                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, fontWeight = FontWeight.Bold),
                        color = Color(0xFF817865),
                    )
                }
            }
            values.forEachIndexed { index, value ->
                val color = when {
                    value >= 6.5f -> Color(0xFFFFA13D)
                    value >= 5f -> WellnessMustard
                    else -> WellnessSage
                }
                Column(
                    modifier = Modifier.weight(1f).fillMaxHeight(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Bottom,
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(0.62f)
                            .fillMaxHeight((value / 9f).coerceIn(0.12f, 1f))
                            .clip(RoundedCornerShape(topStart = 8.dp, topEnd = 8.dp))
                            .background(color),
                    )
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = listOf("M", "T", "W", "T", "F", "S", "S", "S")[index],
                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, fontWeight = FontWeight.Bold),
                        color = Color(0xFF8D846F),
                    )
                }
            }
        }
    }
}

@Composable
private fun HealthScoreCard() {
    WellnessPanel {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.Top,
        ) {
            Text(
                text = "Your Health Score",
                modifier = Modifier.weight(1f),
                style = MaterialTheme.typography.titleMedium.copy(
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = WellnessDark,
            )
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .clip(CircleShape)
                    .background(Color.White.copy(alpha = 0.72f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = Icons.Outlined.CalendarToday,
                    contentDescription = null,
                    modifier = Modifier.size(14.dp),
                    tint = Color(0xFF8D846F),
                )
            }
        }
        Spacer(Modifier.height(16.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier.size(104.dp),
                contentAlignment = Alignment.Center,
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val strokeWidth = 14.dp.toPx()
                    val diameter = min(size.width, size.height) - strokeWidth
                    val topLeft = Offset(strokeWidth / 2f, strokeWidth / 2f)
                    drawArc(
                        color = Color(0xFFEDE8D8),
                        startAngle = 132f,
                        sweepAngle = 276f,
                        useCenter = false,
                        topLeft = topLeft,
                        size = androidx.compose.ui.geometry.Size(diameter, diameter),
                        style = Stroke(width = strokeWidth, cap = StrokeCap.Round),
                    )
                    drawArc(
                        brush = Brush.sweepGradient(
                            colors = listOf(
                                Color(0xFFFFD957),
                                Color(0xFF68BE74),
                                Color(0xFFFFD957),
                            ),
                        ),
                        startAngle = 132f,
                        sweepAngle = 276f * 0.78f,
                        useCenter = false,
                        topLeft = topLeft,
                        size = androidx.compose.ui.geometry.Size(diameter, diameter),
                        style = Stroke(width = strokeWidth, cap = StrokeCap.Round),
                    )
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "78",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontSize = 27.sp,
                            lineHeight = 28.sp,
                            fontWeight = FontWeight.Bold,
                        ),
                        color = WellnessDark,
                    )
                    Text(
                        text = "Good",
                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 11.sp),
                        color = Color(0xFF6F6758),
                    )
                }
            }
            Spacer(Modifier.width(18.dp))
            Column(verticalArrangement = Arrangement.spacedBy(7.dp)) {
                Text(
                    text = "Good",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Color(0xFF75BA72),
                )
                Text(
                    text = "+12% vs last month",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Color(0xFF26A568),
                )
            }
        }
    }
}

@Composable
private fun MedicationAdherenceCard() {
    val days = listOf("M", "T", "W", "T", "F", "S", "S")
    val adherence = listOf(
        listOf(0.95f, 0.92f, 0.88f, 1.00f, 0.82f, 0.90f, 0.96f, 0.78f, 0.46f, 0.18f),
        listOf(0.84f, 0.90f, 0.86f, 0.92f, 0.80f, 0.88f, 0.93f, 0.74f, 0.58f, 0.30f),
        listOf(0.97f, 0.91f, 0.89f, 0.85f, 0.93f, 0.95f, 0.88f, 0.67f, 0.28f, 0.55f),
        listOf(0.76f, 0.82f, 0.86f, 0.90f, 0.80f, 0.84f, 0.87f, 0.72f, 0.62f, 0.22f),
        listOf(0.91f, 0.96f, 0.88f, 0.94f, 0.86f, 0.92f, 0.90f, 0.80f, 0.38f, 0.70f),
        listOf(0.72f, 0.78f, 0.84f, 0.81f, 0.75f, 0.79f, 0.83f, 0.60f, 0.26f, 0.48f),
        listOf(0.86f, 0.91f, 0.82f, 0.88f, 0.79f, 0.85f, 0.89f, 0.68f, 0.52f, 0.20f),
    )
    WellnessPanel {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = "Medication Adherence",
                modifier = Modifier.weight(1f),
                style = MaterialTheme.typography.titleMedium.copy(
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = WellnessDark,
            )
            Text(
                text = "Last 10 doses",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = Color(0xFF817865),
            )
            Icon(
                imageVector = Icons.AutoMirrored.Outlined.KeyboardArrowRight,
                contentDescription = null,
                modifier = Modifier.size(18.dp),
                tint = Color(0xFF9D9482),
            )
        }
        Spacer(Modifier.height(14.dp))
        adherence.forEachIndexed { dayIndex, scores ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(22.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = days[dayIndex],
                    modifier = Modifier.width(22.dp),
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Color(0xFF746C5E),
                    textAlign = TextAlign.Center,
                )
                Spacer(Modifier.width(6.dp))
                scores.forEach { score ->
                    Box(
                        modifier = Modifier.weight(1f),
                        contentAlignment = Alignment.Center,
                    ) {
                        AdherenceHeatCell(score = score)
                    }
                }
            }
        }
        Spacer(Modifier.height(14.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            AdherenceLegend(color = adherenceColor(1.0f), label = "100%")
            AdherenceLegend(color = adherenceColor(0.78f), label = "75%")
            AdherenceLegend(color = adherenceColor(0.48f), label = "50%")
            AdherenceLegend(color = adherenceColor(0.12f), label = "0%")
        }
    }
}

@Composable
private fun AdherenceHeatCell(score: Float) {
    Box(
        modifier = Modifier
            .size(18.dp)
            .clip(RoundedCornerShape(6.dp))
            .background(adherenceColor(score)),
    )
}

private fun adherenceColor(score: Float): Color {
    return when {
        score >= 0.9f -> Color(0xFF9CCF79)
        score >= 0.75f -> Color(0xFFBFDDA3)
        score >= 0.5f -> Color(0xFFF5D989)
        score >= 0.25f -> Color(0xFFF5B09D)
        else -> Color(0xFFF1A3AE)
    }
}

@Composable
private fun AdherenceLegend(color: Color, label: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(13.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(color),
        )
        Spacer(Modifier.width(6.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
            ),
            color = Color(0xFF746C5E),
        )
    }
}

@Composable
private fun BiomarkersCard(onViewAll: () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        SectionHeader(title = "Biomarkers", onViewAll = onViewAll)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            BiomarkerTile(
                title = "Blood Pressure",
                value = "120/80",
                status = "Normal",
                modifier = Modifier.weight(1f),
            )
            BiomarkerTile(
                title = "Blood Sugar",
                value = "98 mg/dL",
                status = "Normal",
                modifier = Modifier.weight(1f),
            )
        }
    }
}

@Composable
private fun BiomarkerTile(
    title: String,
    value: String,
    status: String,
    modifier: Modifier = Modifier,
) {
    Card(
        modifier = modifier
            .height(134.dp)
            .shadow(10.dp, RoundedCornerShape(16.dp), spotColor = Color(0x14000000)),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.72f)),
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .border(1.dp, Color(0xFFF1E9D8), RoundedCornerShape(16.dp))
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(9.dp),
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = Color(0xFF88C386),
            )
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium.copy(
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = WellnessDark,
            )
            Text(
                text = status,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = Color(0xFF26A568),
            )
        }
    }
}

@Composable
private fun BiomarkersDetailPage(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val biomarkers = remember {
        listOf(
            BiomarkerReading("Blood Pressure", "120/80", "118/76", "Cardio steady", 0.76f, WellnessSage),
            BiomarkerReading("Fasting Glucose", "98 mg/dL", "90-95", "Morning draw", 0.68f, WellnessBlue),
            BiomarkerReading("HbA1c", "5.7%", "5.4%", "Three-month glucose", 0.62f, WellnessMustard),
            BiomarkerReading("LDL Cholesterol", "118 mg/dL", "< 100", "Lower gently", 0.52f, WellnessPink),
            BiomarkerReading("HDL Cholesterol", "52 mg/dL", "> 60", "Protective range", 0.58f, Color(0xFFBCEAE9)),
            BiomarkerReading("Triglycerides", "142 mg/dL", "< 120", "Meal timing helps", 0.55f, Color(0xFFE8D6FF)),
            BiomarkerReading("Total Cholesterol", "188 mg/dL", "< 180", "Near target", 0.72f, WellnessSage),
            BiomarkerReading("ApoB", "92 mg/dL", "< 80", "Lipid risk marker", 0.48f, WellnessPink),
            BiomarkerReading("hs-CRP", "2.1 mg/L", "< 1.0", "Inflammation", 0.44f, WellnessMustard),
            BiomarkerReading("Vitamin D", "31 ng/mL", "40-50", "Supplementing", 0.57f, Color(0xFFFFE37D)),
            BiomarkerReading("Ferritin", "48 ng/mL", "60-90", "Iron stores", 0.54f, Color(0xFFFFC6A8)),
            BiomarkerReading("Hemoglobin", "13.4 g/dL", "13.8-15", "Oxygen carrying", 0.69f, WellnessBlue),
            BiomarkerReading("TSH", "2.8 mIU/L", "1.0-2.5", "Thyroid signal", 0.61f, Color(0xFFE8D6FF)),
            BiomarkerReading("Creatinine", "0.86 mg/dL", "< 0.9", "Kidney function", 0.82f, WellnessSage),
            BiomarkerReading("eGFR", "96", "> 100", "Filtration rate", 0.74f, Color(0xFFBCEAE9)),
            BiomarkerReading("ALT", "28 U/L", "< 24", "Liver enzyme", 0.6f, WellnessMustard),
            BiomarkerReading("AST", "24 U/L", "< 22", "Liver enzyme", 0.66f, WellnessSage),
            BiomarkerReading("B12", "412 pg/mL", "500-700", "Nerve health", 0.5f, WellnessBlue),
            BiomarkerReading("Omega-3 Index", "5.2%", "8%", "Fatty acid status", 0.46f, Color(0xFFBCEAE9)),
            BiomarkerReading("Resting Insulin", "9.8 uIU/mL", "< 7", "Metabolic signal", 0.43f, WellnessPink),
        )
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFFFFF0B5),
                        Color(0xFFFFFBF1),
                        Color(0xFFFFFFFF),
                    ),
                ),
            ),
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawCircle(
                color = Color(0xFFFFD85A).copy(alpha = 0.22f),
                radius = size.width * 0.52f,
                center = Offset(size.width * 0.9f, size.height * 0.02f),
            )
            drawCircle(
                color = Color(0xFFD7EFC0).copy(alpha = 0.2f),
                radius = size.width * 0.55f,
                center = Offset(size.width * 0.04f, size.height * 0.72f),
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 18.dp)
                .padding(top = 18.dp, bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            BiomarkersDetailTopBar(onBack = onBack)
            BiomarkerSummaryCard()
            biomarkers.forEach { reading ->
                BiomarkerReadingRow(reading = reading)
            }
        }
    }
}

@Composable
private fun BiomarkersDetailTopBar(onBack: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconButton(
            modifier = Modifier
                .size(38.dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.72f)),
            onClick = onBack,
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Outlined.ArrowBack,
                contentDescription = "Back",
                tint = WellnessDark,
            )
        }
        Text(
            text = "Biomarkers",
            modifier = Modifier.weight(1f),
            style = MaterialTheme.typography.titleMedium.copy(
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = WellnessDark,
            textAlign = TextAlign.Center,
        )
        Box(
            modifier = Modifier
                .size(38.dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.72f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = Icons.Outlined.CalendarToday,
                contentDescription = null,
                modifier = Modifier.size(18.dp),
                tint = WellnessDark,
            )
        }
    }
}

@Composable
private fun BiomarkerSummaryCard() {
    WellnessPanel {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(52.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFFFE37D)),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = "20",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontSize = 19.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = WellnessDark,
                )
            }
            Spacer(Modifier.width(13.dp))
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "Quarterly biomarker plan",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = WellnessDark,
                )
                Text(
                    text = "Last panel: May 2026  •  Next target: August 2026",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                    ),
                    color = Color(0xFF817865),
                )
            }
        }
    }
}

@Composable
private fun BiomarkerReadingRow(reading: BiomarkerReading) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(9.dp, RoundedCornerShape(20.dp), spotColor = Color(0x12000000)),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.78f)),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color.White.copy(alpha = 0.86f), RoundedCornerShape(20.dp))
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(reading.accent.copy(alpha = 0.3f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Box(
                        modifier = Modifier
                            .size(13.dp)
                            .clip(CircleShape)
                            .background(reading.accent),
                    )
                }
                Spacer(Modifier.width(11.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = reading.name,
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                        ),
                        color = WellnessDark,
                    )
                    Text(
                        text = reading.note,
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                        ),
                        color = Color(0xFF817865),
                    )
                }
                Text(
                    text = "${(reading.progress * 100).toInt()}%",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Color(0xFF26A568),
                )
            }
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                BiomarkerValuePill(
                    label = "Current",
                    value = reading.current,
                    modifier = Modifier.weight(1f),
                )
                BiomarkerValuePill(
                    label = "Target",
                    value = reading.target,
                    modifier = Modifier.weight(1f),
                )
            }
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color(0xFFEDE8D8)),
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth(reading.progress.coerceIn(0f, 1f))
                        .fillMaxHeight()
                        .clip(RoundedCornerShape(8.dp))
                        .background(
                            Brush.horizontalGradient(
                                colors = listOf(
                                    reading.accent,
                                    Color(0xFF68BE74),
                                ),
                            ),
                        ),
                )
            }
        }
    }
}

@Composable
private fun BiomarkerValuePill(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(14.dp))
            .background(Color(0xFFFFFBF1))
            .border(1.dp, Color(0xFFF1E9D8), RoundedCornerShape(14.dp))
            .padding(horizontal = 11.dp, vertical = 9.dp),
        verticalArrangement = Arrangement.spacedBy(3.dp),
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = Color(0xFF8D846F),
        )
        Text(
            text = value,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = WellnessDark,
            maxLines = 1,
        )
    }
}

@Composable
private fun HomeTopBar() {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Spacer(Modifier.weight(1f))
        Text(
            text = "Home",
            style = MaterialTheme.typography.titleMedium.copy(
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = WellnessDark,
        )
        Row(
            modifier = Modifier.weight(1f),
            horizontalArrangement = Arrangement.End,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            HeaderIconButton(icon = Icons.Outlined.Search, label = "Search")
            Spacer(Modifier.width(8.dp))
            HeaderIconButton(icon = Icons.Outlined.Notifications, label = "Notifications")
        }
    }
}

@Composable
private fun HeaderIconButton(icon: ImageVector, label: String) {
    Box(
        modifier = Modifier
            .size(40.dp)
            .shadow(10.dp, CircleShape, spotColor = Color(0x22000000))
            .clip(CircleShape)
            .background(Color.White.copy(alpha = 0.88f))
            .border(1.dp, Color.White.copy(alpha = 0.74f), CircleShape),
        contentAlignment = Alignment.Center,
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            modifier = Modifier.size(21.dp),
            tint = WellnessDark,
        )
    }
}

@Composable
private fun GreetingBlock() {
    Column(verticalArrangement = Arrangement.spacedBy(7.dp)) {
        Text(
            text = "Good Morning,\nClara!",
            style = MaterialTheme.typography.displayLarge.copy(
                fontSize = 29.sp,
                lineHeight = 33.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = WellnessDark,
        )
        Text(
            text = "Here's your health overview",
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = Color(0xFF594F35),
        )
    }
}

@Composable
private fun ScheduleCard(schedule: List<ScheduleItem>, onViewAll: () -> Unit) {
    WellnessPanel {
        SectionHeader(title = "Today's Schedule", onViewAll = onViewAll)
        Spacer(Modifier.height(12.dp))
        schedule.forEachIndexed { index, item ->
            ScheduleRow(item = item)
            if (index != schedule.lastIndex) {
                HorizontalDivider(
                    modifier = Modifier.padding(start = 42.dp, top = 11.dp, bottom = 11.dp),
                    thickness = 1.dp,
                    color = Color(0xFFF1E9D8),
                )
            }
        }
    }
}

@Composable
private fun ScheduleRow(item: ScheduleItem) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top,
    ) {
        Box(
            modifier = Modifier
                .size(25.dp)
                .clip(CircleShape)
                .background(item.accent.copy(alpha = 0.22f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = item.icon,
                contentDescription = null,
                modifier = Modifier.size(14.dp),
                tint = item.accent,
            )
        }
        Spacer(Modifier.width(10.dp))
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Outlined.AccessTime,
                    contentDescription = null,
                    modifier = Modifier.size(12.dp),
                    tint = Color(0xFFB6AE9A),
                )
                Spacer(Modifier.width(4.dp))
                Text(
                    text = item.time,
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                    color = Color(0xFF8C846F),
                )
            }
            Text(
                text = item.title,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = WellnessDark,
            )
            Text(
                text = item.subtitle,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                ),
                color = Color(0xFF7D7665),
            )
        }
        Icon(
            imageVector = Icons.AutoMirrored.Outlined.KeyboardArrowRight,
            contentDescription = null,
            modifier = Modifier
                .padding(top = 19.dp)
                .size(23.dp),
            tint = Color(0xFFB7AE9C),
        )
    }
}

@Composable
private fun HealthSummary(metrics: List<HealthMetric>) {
    WellnessPanel {
        SectionHeader(title = "Health Summary")
        Spacer(Modifier.height(14.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            metrics.forEach { item ->
                HealthMetricTile(metric = item, modifier = Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun HealthMetricTile(metric: HealthMetric, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .height(152.dp)
            .shadow(12.dp, RoundedCornerShape(17.dp), spotColor = metric.accent.copy(alpha = 0.34f))
            .clip(RoundedCornerShape(17.dp))
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        metric.accent.copy(alpha = 0.5f),
                        metric.accent.copy(alpha = 0.24f),
                    ),
                ),
            )
            .padding(horizontal = 10.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.SpaceBetween,
        horizontalAlignment = Alignment.Start,
    ) {
        Box(
            modifier = Modifier
                .size(28.dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.46f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = metric.icon,
                contentDescription = null,
                modifier = Modifier.size(16.dp),
                tint = if (metric.title == "Mood") Color(0xFF13A978) else WellnessDark,
            )
        }
        Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
            Text(
                text = metric.title,
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 12.sp),
                color = WellnessDark,
            )
            Text(
                text = metric.value,
                style = MaterialTheme.typography.titleMedium.copy(
                    fontSize = 22.sp,
                    lineHeight = 22.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = WellnessDark,
            )
            Text(
                text = metric.caption,
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 12.sp),
                color = Color(0xFF5073C9),
            )
        }
    }
}

@Composable
private fun CareInsightCard() {
    WellnessPanel {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFFFE37D)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = Icons.Outlined.LocalHospital,
                    contentDescription = null,
                    modifier = Modifier.size(21.dp),
                    tint = WellnessDark,
                )
            }
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Hydration streak",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = WellnessDark,
                )
                Text(
                    text = "5 glasses logged today. Clara suggests one more before dinner.",
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 12.sp),
                    color = Color(0xFF817865),
                )
            }
            Text(
                text = "82%",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = Color(0xFF1B9F6D),
            )
        }
    }
}

@Composable
private fun SectionHeader(title: String, onViewAll: (() -> Unit)? = null) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium.copy(
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = WellnessDark,
        )
        Spacer(Modifier.weight(1f))
        Text(
            text = "View all",
            modifier = Modifier
                .clip(RoundedCornerShape(12.dp))
                .then(if (onViewAll != null) Modifier.clickable { onViewAll() } else Modifier)
                .padding(horizontal = 8.dp, vertical = 4.dp),
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = WellnessDark,
        )
    }
}

@Composable
private fun WellnessPanel(content: @Composable () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(12.dp, RoundedCornerShape(24.dp), spotColor = Color(0x18000000)),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.82f)),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color.White.copy(alpha = 0.82f), RoundedCornerShape(24.dp))
                .padding(16.dp),
        ) {
            content()
        }
    }
}

@Composable
private fun ClaraBottomBar(
    tabs: List<BottomTabItem>,
    selectedTab: Int,
    onTabSelected: (Int) -> Unit,
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(94.dp)
            .background(Color.Transparent),
        contentAlignment = Alignment.TopCenter,
    ) {
        Row(
            modifier = Modifier
                .padding(horizontal = 12.dp, vertical = 14.dp)
                .fillMaxWidth()
                .height(64.dp)
                .shadow(18.dp, RoundedCornerShape(32.dp), spotColor = Color(0x66000000))
                .clip(RoundedCornerShape(32.dp))
                .background(Color(0xFF101010))
                .padding(horizontal = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            tabs.forEachIndexed { index, tab ->
                if (index == 2) {
                    Spacer(modifier = Modifier.weight(1f))
                } else {
                    BottomNavItem(
                        item = tab,
                        selected = selectedTab == index,
                        modifier = Modifier.weight(1f),
                        onClick = { onTabSelected(index) },
                    )
                }
            }
        }

        Box(
            modifier = Modifier
                .padding(top = 0.dp)
                .size(67.dp)
                .shadow(16.dp, CircleShape, spotColor = Color(0x55000000))
                .clip(CircleShape)
                .background(Color(0xFFFFD956))
                .border(4.dp, Color(0xFFFFF3B7), CircleShape)
                .clickable { onTabSelected(2) },
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = tabs[2].icon,
                contentDescription = tabs[2].title,
                modifier = Modifier.size(30.dp),
                tint = Color(0xFF24210F),
            )
        }
    }
}

@Composable
private fun BottomNavItem(
    item: BottomTabItem,
    selected: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
) {
    val active = if (selected) Color(0xFFFFDF61) else Color(0xFF9B9B9B)
    Column(
        modifier = modifier
            .fillMaxHeight()
            .clickable(onClick = onClick)
            .padding(top = 10.dp, bottom = 7.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween,
    ) {
        Icon(
            imageVector = item.icon,
            contentDescription = item.title,
            modifier = Modifier.size(21.dp),
            tint = active,
        )
        Text(
            text = item.title,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 10.sp,
                fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
            ),
            color = active,
            maxLines = 1,
        )
    }
}

private val WellnessDark = Color(0xFF24210F)

@Composable
private fun JournalPage(
    modifier: Modifier = Modifier,
) {
    val tabs = remember {
        listOf(
            JournalTab("today", "Today", Icons.Outlined.ChatBubbleOutline),
            JournalTab("reflections", "Reflections", Icons.Outlined.CalendarToday),
            JournalTab("reframes", "Reframes", Icons.Outlined.GraphicEq),
            JournalTab("mental_load", "Mental Load", Icons.Outlined.AccessTime),
        )
    }
    val reflections = remember { mockReflections() }
    val reframes = remember { mockReframes() }
    val events = remember { mockClaraJournalEvents() }
    var tasks by remember { mutableStateOf(mockMentalLoadTasks()) }
    var selectedTab by remember { mutableStateOf("today") }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFFFFEBA3),
                        Color(0xFFFFFAED),
                        Color(0xFFFFFFFF),
                    ),
                ),
            ),
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawCircle(
                color = Color(0xFFBCEAE9).copy(alpha = 0.25f),
                radius = size.width * 0.48f,
                center = Offset(size.width * 0.92f, size.height * 0.12f),
            )
            drawCircle(
                color = Color(0xFFE8D6FF).copy(alpha = 0.22f),
                radius = size.width * 0.56f,
                center = Offset(size.width * 0.02f, size.height * 0.72f),
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 18.dp)
                .padding(top = 18.dp, bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            JournalTopBar()
            JournalTabRow(tabs = tabs, selectedTab = selectedTab, onSelected = { selectedTab = it })

            when (selectedTab) {
                "reflections" -> JournalReflectionsView(
                    reflections = reflections,
                )
                "reframes" -> JournalReframesView(
                    reframes = reframes,
                )
                "mental_load" -> JournalMentalLoadView(
                    tasks = tasks,
                    onToggleTask = { task ->
                        tasks = tasks.map {
                            if (it.id == task.id) {
                                it.copy(status = if (it.status == "completed") "todo" else "completed")
                            } else {
                                it
                            }
                        }
                    },
                )
                else -> JournalTodayView(
                    reflections = reflections,
                    reframes = reframes,
                    tasks = tasks,
                    events = events,
                    onToggleTask = { task ->
                        tasks = tasks.map {
                            if (it.id == task.id) {
                                it.copy(status = if (it.status == "completed") "todo" else "completed")
                            } else {
                                it
                            }
                        }
                    },
                )
            }
        }
    }
}

@Composable
private fun JournalTopBar() {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
            Text(
                text = "Journal",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontSize = 24.sp,
                    lineHeight = 27.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = WellnessDark,
            )
            Text(
                text = "Private reflections, reframes, and mental-load notes.",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                ),
                color = Color(0xFF746C5E),
            )
        }
    }
}

@Composable
private fun JournalTabRow(
    tabs: List<JournalTab>,
    selectedTab: String,
    onSelected: (String) -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        tabs.forEach { tab ->
            val selected = selectedTab == tab.id
            Column(
                modifier = Modifier
                    .weight(1f)
                    .height(64.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .background(if (selected) Color.White.copy(alpha = 0.9f) else Color.White.copy(alpha = 0.38f))
                    .border(
                        1.dp,
                        if (selected) Color.White.copy(alpha = 0.95f) else Color.White.copy(alpha = 0.48f),
                        RoundedCornerShape(18.dp),
                    )
                    .clickable { onSelected(tab.id) }
                    .padding(horizontal = 6.dp, vertical = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.SpaceBetween,
            ) {
                Icon(
                    imageVector = tab.icon,
                    contentDescription = tab.label,
                    modifier = Modifier.size(18.dp),
                    tint = if (selected) WellnessDark else Color(0xFF8D846F),
                )
                Text(
                    text = tab.label,
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = if (selected) WellnessDark else Color(0xFF8D846F),
                    textAlign = TextAlign.Center,
                    maxLines = 1,
                )
            }
        }
    }
}

@Composable
private fun JournalTodayView(
    reflections: List<MockReflection>,
    reframes: List<MockReframe>,
    tasks: List<MockMentalLoadTask>,
    events: List<ClaraJournalEvent>,
    onToggleTask: (MockMentalLoadTask) -> Unit,
) {
    val latestReflection = reflections.firstOrNull()
    val latestReframe = reframes.firstOrNull()
    val openTasks = tasks.filter { it.status != "completed" }
    val heavyTasks = openTasks.filter { it.priority == "high" }
    val suggestedTask = openTasks.firstOrNull { it.priority != "high" } ?: openTasks.firstOrNull()
    val loadLabel = when {
        heavyTasks.size >= 2 -> "Heavy"
        openTasks.size >= 3 -> "Manageable"
        openTasks.isNotEmpty() -> "Light"
        else -> "Clear"
    }

    JournalHeroCard(
        reflection = latestReflection,
        loadLabel = loadLabel,
        openTaskCount = openTasks.size,
        reframeCount = reframes.size,
    )

    if (latestReframe != null) {
        JournalReframeCard(reframe = latestReframe, compact = true)
    }

    suggestedTask?.let {
        SuggestedMentalLoadCard(
            task = it,
            onToggleTask = onToggleTask,
        )
    } ?: JournalEmptyCard()

    ClaraActivityTrail(events = events)
}

@Composable
private fun JournalHeroCard(
    reflection: MockReflection?,
    loadLabel: String,
    openTaskCount: Int,
    reframeCount: Int,
) {
    WellnessPanel {
        Row(verticalAlignment = Alignment.Top) {
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    text = "Today",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Color(0xFF1B9F6D),
                )
                Text(
                    text = reflection?.mood ?: "No check-in yet",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontSize = 28.sp,
                        lineHeight = 30.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = WellnessDark,
                )
                Text(
                    text = reflection?.excerpt ?: "When Clara saves a reflection, reframe, or mental-load item, it will appear here after you approve it.",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 13.sp,
                        lineHeight = 19.sp,
                        fontWeight = FontWeight.Medium,
                    ),
                    color = Color(0xFF746C5E),
                )
            }
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background((reflection?.tone ?: WellnessBlue).copy(alpha = 0.28f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = Icons.Outlined.ChatBubbleOutline,
                    contentDescription = null,
                    modifier = Modifier.size(23.dp),
                    tint = reflection?.tone ?: WellnessBlue,
                )
            }
        }

        Spacer(Modifier.height(16.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            JournalMiniMetric("Mental load", loadLabel, "$openTaskCount open", WellnessMustard, Modifier.weight(1f))
            JournalMiniMetric("Reframes", reframeCount.toString(), "Thoughts reframed", WellnessSage, Modifier.weight(1f))
        }
    }
}

@Composable
private fun JournalMiniMetric(
    title: String,
    value: String,
    caption: String,
    color: Color,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(color.copy(alpha = 0.16f))
            .border(1.dp, color.copy(alpha = 0.18f), RoundedCornerShape(16.dp))
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = Color(0xFF746C5E),
        )
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium.copy(
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = WellnessDark,
        )
        Text(
            text = caption,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = Color(0xFF817865),
            maxLines = 1,
        )
    }
}

@Composable
private fun SuggestedMentalLoadCard(
    task: MockMentalLoadTask,
    onToggleTask: (MockMentalLoadTask) -> Unit,
) {
    WellnessPanel {
        CardTitleRow("Suggested next step", task.dueDate)
        Spacer(Modifier.height(12.dp))
        JournalTaskRow(task = task, onToggleTask = onToggleTask)
    }
}

@Composable
private fun ClaraActivityTrail(events: List<ClaraJournalEvent>) {
    WellnessPanel {
        CardTitleRow("Recent activity", "Journal")
        Spacer(Modifier.height(12.dp))
        events.forEachIndexed { index, event ->
            Row(verticalAlignment = Alignment.Top) {
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(event.color.copy(alpha = 0.22f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Box(
                        modifier = Modifier
                            .size(9.dp)
                            .clip(CircleShape)
                            .background(event.color),
                    )
                }
                Spacer(Modifier.width(10.dp))
                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = event.title,
                            modifier = Modifier.weight(1f),
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                            ),
                            color = WellnessDark,
                        )
                        Text(
                            text = event.time,
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                            ),
                            color = Color(0xFF8D846F),
                        )
                    }
                    Text(
                        text = event.detail,
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontSize = 12.sp,
                            lineHeight = 17.sp,
                            fontWeight = FontWeight.Medium,
                        ),
                        color = Color(0xFF746C5E),
                    )
                }
            }
            if (index != events.lastIndex) {
                HorizontalDivider(
                    modifier = Modifier.padding(start = 38.dp, top = 12.dp, bottom = 12.dp),
                    thickness = 1.dp,
                    color = Color(0xFFF1E9D8),
                )
            }
        }
    }
}

@Composable
private fun JournalReflectionsView(
    reflections: List<MockReflection>,
) {
    SectionHeader(title = "Saved reflections")
    reflections.forEach { reflection ->
        JournalReflectionCard(reflection = reflection)
    }
}

@Composable
private fun JournalReflectionCard(
    reflection: MockReflection,
) {
    WellnessPanel {
        Row(verticalAlignment = Alignment.Top) {
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "${reflection.date}  •  ${reflection.time}",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Color(0xFF8D846F),
                )
                Text(
                    text = reflection.title,
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontSize = 18.sp,
                        lineHeight = 22.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = WellnessDark,
                )
            }
            JournalChip(label = reflection.mood, color = reflection.tone)
        }
        Spacer(Modifier.height(10.dp))
        Text(
            text = reflection.content,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 13.sp,
                lineHeight = 20.sp,
                fontWeight = FontWeight.Medium,
            ),
            color = Color(0xFF746C5E),
        )
        Spacer(Modifier.height(12.dp))
        JournalTagRow(tags = reflection.tags)
    }
}

@Composable
private fun JournalReframesView(
    reframes: List<MockReframe>,
) {
    SectionHeader(title = "Reframes")
    reframes.forEach { reframe ->
        JournalReframeCard(reframe = reframe, compact = false)
    }
}

@Composable
private fun JournalReframeCard(
    reframe: MockReframe,
    compact: Boolean,
) {
    WellnessPanel {
        Row(verticalAlignment = Alignment.Top) {
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = if (compact) "Latest reframe" else "${reframe.date}  •  ${reframe.time}",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Color(0xFF8D846F),
                )
                Text(
                    text = reframe.situation,
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontSize = 18.sp,
                        lineHeight = 22.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = WellnessDark,
                )
            }
            JournalChip(label = "Reframe", color = WellnessSage)
        }

        Spacer(Modifier.height(12.dp))
        ReframePair(label = "Original thought", value = reframe.thought, color = WellnessPink)
        Spacer(Modifier.height(8.dp))
        ReframePair(label = "Feeling", value = reframe.feeling, color = WellnessMustard)
        Spacer(Modifier.height(8.dp))
        ReframePair(label = "Kinder reframe", value = reframe.reframe, color = WellnessSage)

        if (!compact) {
            Spacer(Modifier.height(8.dp))
            ReframePair(label = "Small action", value = reframe.action, color = WellnessBlue)
        }
    }
}

@Composable
private fun ReframePair(label: String, value: String, color: Color) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(15.dp))
            .background(color.copy(alpha = 0.13f))
            .border(1.dp, color.copy(alpha = 0.16f), RoundedCornerShape(15.dp))
            .padding(horizontal = 12.dp, vertical = 10.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = Color(0xFF746C5E),
        )
        Text(
            text = value,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 13.sp,
                lineHeight = 18.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = WellnessDark,
        )
    }
}

@Composable
private fun JournalMentalLoadView(
    tasks: List<MockMentalLoadTask>,
    onToggleTask: (MockMentalLoadTask) -> Unit,
) {
    val groups = listOf(
        "Heavy on my mind" to tasks.filter { it.status != "completed" && it.priority == "high" },
        "Can handle today" to tasks.filter { it.status != "completed" && it.priority != "high" },
        "Done" to tasks.filter { it.status == "completed" },
    )

    groups.forEach { (title, items) ->
        WellnessPanel {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = title,
                    modifier = Modifier.weight(1f),
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = WellnessDark,
                )
                JournalChip(label = items.size.toString(), color = if (title == "Done") WellnessSage else WellnessMustard)
            }
            Spacer(Modifier.height(12.dp))
            if (items.isEmpty()) {
                Text(
                    text = if (title == "Done") "Completed mental-load items will appear here." else "Nothing waiting in this group right now.",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 12.sp,
                        lineHeight = 18.sp,
                        fontWeight = FontWeight.Medium,
                    ),
                    color = Color(0xFF817865),
                )
            } else {
                items.forEachIndexed { index, task ->
                    JournalTaskRow(task = task, onToggleTask = onToggleTask)
                    if (index != items.lastIndex) {
                        HorizontalDivider(
                            modifier = Modifier.padding(vertical = 12.dp),
                            thickness = 1.dp,
                            color = Color(0xFFF1E9D8),
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun JournalTaskRow(
    task: MockMentalLoadTask,
    onToggleTask: (MockMentalLoadTask) -> Unit,
) {
    val isDone = task.status == "completed"
    val priorityColor = when (task.priority) {
        "high" -> WellnessPink
        "medium" -> WellnessMustard
        else -> WellnessSage
    }
    Row(verticalAlignment = Alignment.Top) {
        Box(
            modifier = Modifier
                .size(30.dp)
                .clip(CircleShape)
                .background(if (isDone) WellnessSage.copy(alpha = 0.24f) else Color.White.copy(alpha = 0.72f))
                .border(1.dp, if (isDone) WellnessSage else Color(0xFFE6DDCB), CircleShape)
                .clickable { onToggleTask(task) },
            contentAlignment = Alignment.Center,
        ) {
            if (isDone) {
                Box(
                    modifier = Modifier
                        .size(12.dp)
                        .clip(CircleShape)
                        .background(WellnessSage),
                )
            }
        }
        Spacer(Modifier.width(11.dp))
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                text = task.title,
                style = MaterialTheme.typography.labelSmall.copy(
                    fontSize = 14.sp,
                    lineHeight = 19.sp,
                    fontWeight = FontWeight.Bold,
                ),
                color = if (isDone) Color(0xFF8D846F) else WellnessDark,
            )
            Row(horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                JournalChip(label = task.priority.replaceFirstChar { it.uppercase() }, color = priorityColor)
                JournalChip(label = task.category, color = WellnessBlue)
                JournalChip(label = task.dueDate, color = Color(0xFFE8D6FF))
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = task.status.replaceFirstChar { it.uppercase() },
                    modifier = Modifier.weight(1f),
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                    ),
                    color = Color(0xFF817865),
                )
            }
        }
    }
}

@Composable
private fun JournalTagRow(tags: List<String>) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(7.dp),
    ) {
        tags.take(3).forEach { tag ->
            JournalChip(label = tag, color = WellnessBlue)
        }
    }
}

@Composable
private fun JournalChip(label: String, color: Color) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(13.dp))
            .background(color.copy(alpha = 0.18f))
            .border(1.dp, color.copy(alpha = 0.2f), RoundedCornerShape(13.dp))
            .padding(horizontal = 8.dp, vertical = 5.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = WellnessDark,
            maxLines = 1,
        )
    }
}

@Composable
private fun JournalEmptyCard() {
    WellnessPanel {
        Text(
            text = "Your private space is ready",
            style = MaterialTheme.typography.titleMedium.copy(
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
            ),
            color = WellnessDark,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            text = "When Clara helps you save a reflection, reframe a thought, or clear mental load, it will appear here after you approve it.",
            style = MaterialTheme.typography.labelSmall.copy(
                fontSize = 13.sp,
                lineHeight = 19.sp,
                fontWeight = FontWeight.Medium,
            ),
            color = Color(0xFF746C5E),
        )
    }
}

private fun mockReflections(): List<MockReflection> = listOf(
    MockReflection(
        id = "morning-clarity",
        title = "Morning clarity",
        date = "Today",
        time = "7:12 AM",
        mood = "Calm",
        excerpt = "I woke up lighter after keeping the evening wind-down simple.",
        content = "I woke up lighter after keeping the evening wind-down simple. The quiet routine is starting to feel like something I can protect, not another rule I need to perform.",
        tags = listOf("Sleep", "Mindfulness", "Routine"),
        tone = WellnessSage,
    ),
    MockReflection(
        id = "work-pressure",
        title = "Pressure before the team review",
        date = "Yesterday",
        time = "6:40 PM",
        mood = "Stretched",
        excerpt = "The review felt bigger in my head than it probably is.",
        content = "The review felt bigger in my head than it probably is. Clara helped me separate the actual preparation from the fear that I will disappoint everyone.",
        tags = listOf("Work", "Stress"),
        tone = WellnessMustard,
    ),
    MockReflection(
        id = "walk-helped",
        title = "Walk helped more than expected",
        date = "Apr 28",
        time = "8:10 PM",
        mood = "Grounded",
        excerpt = "A short walk changed the texture of the evening.",
        content = "A short walk changed the texture of the evening. I did not solve everything, but I came back with enough space to make dinner and stop scrolling.",
        tags = listOf("Movement", "Self-care"),
        tone = WellnessBlue,
    ),
)

private fun mockReframes(): List<MockReframe> = listOf(
    MockReframe(
        id = "review-reframe",
        date = "Today",
        time = "9:05 AM",
        situation = "Team review is coming up",
        thought = "If I miss one detail, everyone will think I am unprepared.",
        feeling = "Anxious, tight chest",
        reframe = "Being prepared means knowing the important points, not controlling every possible question.",
        action = "Write the three decisions I need from the room.",
    ),
    MockReframe(
        id = "diet-slip",
        date = "Yesterday",
        time = "8:46 PM",
        situation = "Office snacks after lunch",
        thought = "I ruined my progress again.",
        feeling = "Guilty, frustrated",
        reframe = "One snack is data, not a verdict. The next meal can still match my plan.",
        action = "Pre-pack tomorrow's afternoon snack.",
    ),
    MockReframe(
        id = "sleep-routine",
        date = "Apr 28",
        time = "10:12 PM",
        situation = "Felt tempted to work late",
        thought = "If I stop now, I am falling behind.",
        feeling = "Restless, pressured",
        reframe = "Stopping on time is part of tomorrow's productivity.",
        action = "Close the laptop and set one clear first task for morning.",
    ),
)

private fun mockMentalLoadTasks(): List<MockMentalLoadTask> = listOf(
    MockMentalLoadTask(
        id = "prep-review",
        title = "Write the three decisions needed for the team review",
        status = "todo",
        priority = "high",
        category = "Work",
        dueDate = "Today",
    ),
    MockMentalLoadTask(
        id = "message-cousin",
        title = "Reply to cousin about Sunday's family plan",
        status = "todo",
        priority = "medium",
        category = "Family",
        dueDate = "Today",
    ),
    MockMentalLoadTask(
        id = "snack-prep",
        title = "Pack a steady afternoon snack",
        status = "todo",
        priority = "low",
        category = "Food",
        dueDate = "Tomorrow",
    ),
    MockMentalLoadTask(
        id = "book-lab",
        title = "Book full body lab test",
        status = "completed",
        priority = "high",
        category = "Health",
        dueDate = "Yesterday",
    ),
)

private fun mockClaraJournalEvents(): List<ClaraJournalEvent> = listOf(
    ClaraJournalEvent(
        title = "Saved a reframe",
        detail = "Team review anxiety was turned into one kinder thought and a small action.",
        time = "9:05 AM",
        color = WellnessSage,
    ),
    ClaraJournalEvent(
        title = "Added mental-load task",
        detail = "Reply to cousin about Sunday's plan was saved as something manageable today.",
        time = "8:28 AM",
        color = WellnessMustard,
    ),
    ClaraJournalEvent(
        title = "Saved reflection",
        detail = "Morning clarity was added after you approved Clara's summary.",
        time = "7:12 AM",
        color = WellnessBlue,
    ),
)

@Composable
private fun AssistantPage(
    state: VoiceUiState,
    onMicClick: () -> Unit,
    onEndSession: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val activeColor = when (state.visualState) {
        AssistantVisualState.Error -> MaterialTheme.colorScheme.error
        AssistantVisualState.Speaking -> WellnessPink
        AssistantVisualState.Holding -> WellnessLavender
        AssistantVisualState.Awaiting -> WellnessBlue
        AssistantVisualState.Listening -> WellnessSage
        AssistantVisualState.Idle -> WellnessMustard
    }

    val statusLabel = when {
        state.isRecording -> "Listening"
        state.connectionState == ConnectionState.Connecting -> "Connecting"
        state.connectionState == ConnectionState.Error -> "Connection issue"
        state.visualState == AssistantVisualState.Speaking -> "Speaking"
        state.visualState == AssistantVisualState.Awaiting -> "Thinking"
        state.visualState == AssistantVisualState.Listening -> "Ready"
        else -> "Tap to talk"
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        WellnessSurface,
                        WellnessBackground,
                        WellnessBlue.copy(alpha = 0.24f),
                    ),
                ),
            ),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp, vertical = 22.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween,
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = if (state.sessionId.isBlank()) "No active session" else "Session active",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.72f),
                )

                OutlinedButton(
                    enabled = state.connectionState != ConnectionState.Idle,
                    onClick = onEndSession,
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Close,
                        contentDescription = "End session",
                        modifier = Modifier.size(18.dp),
                    )
                    Spacer(Modifier.width(6.dp))
                    Text("End session")
                }
            }

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center,
            ) {
                AssistantAura(
                    visualState = state.visualState,
                    waveform = state.waveform,
                    color = activeColor,
                    modifier = Modifier.fillMaxSize(),
                )
            }

            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Text(
                    text = statusLabel,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onBackground,
                    textAlign = TextAlign.Center,
                )

                IconButton(
                    modifier = Modifier
                        .size(104.dp)
                        .clip(CircleShape)
                        .border(2.dp, activeColor, CircleShape)
                        .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.94f)),
                    onClick = onMicClick,
                ) {
                    Icon(
                        imageVector = if (state.isRecording) Icons.Outlined.Mic else Icons.Outlined.MicOff,
                        contentDescription = if (state.isRecording) "Tap when done" else "Tap to talk",
                        modifier = Modifier.size(48.dp),
                        tint = MaterialTheme.colorScheme.onSurface,
                    )
                }

                if (state.warning.isNotBlank()) {
                    Text(
                        text = state.warning,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.error,
                        textAlign = TextAlign.Center,
                    )
                } else {
                    Spacer(Modifier.height(18.dp))
                }
            }
        }
    }
}

@Composable
private fun AssistantAura(
    visualState: AssistantVisualState,
    waveform: List<Float>,
    color: Color,
    modifier: Modifier = Modifier,
) {
    val transition = rememberInfiniteTransition(label = "assistant_aura")
    val pulse by transition.animateFloat(
        initialValue = 0.86f,
        targetValue = 1.12f,
        animationSpec = infiniteRepeatable(
            animation = tween(
                durationMillis = if (visualState == AssistantVisualState.Speaking) 760 else 1500,
                easing = FastOutSlowInEasing,
            ),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "aura_pulse",
    )
    val phase by transition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(4200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart,
        ),
        label = "aura_phase",
    )

    Canvas(modifier = modifier) {
        val center = Offset(size.width / 2f, size.height / 2f)
        val baseRadius = min(size.width, size.height) * 0.22f
        val activeRadius = baseRadius * pulse
        val listeningScale = when (visualState) {
            AssistantVisualState.Holding, AssistantVisualState.Listening -> 1.12f
            AssistantVisualState.Awaiting -> 0.96f
            AssistantVisualState.Speaking -> 1.24f
            AssistantVisualState.Error -> 0.9f
            AssistantVisualState.Idle -> 1f
        }

        drawCircle(
            brush = Brush.radialGradient(
                colors = listOf(
                    color.copy(alpha = 0.42f),
                    color.copy(alpha = 0.16f),
                    Color.Transparent,
                ),
                center = center,
                radius = activeRadius * 2.9f,
            ),
            radius = activeRadius * 2.9f,
            center = center,
        )

        repeat(4) { index ->
            val ringRadius = activeRadius * listeningScale + index * baseRadius * 0.22f
            drawCircle(
                color = color.copy(alpha = 0.32f - index * 0.055f),
                radius = ringRadius,
                center = center,
                style = Stroke(width = (8f - index).coerceAtLeast(3f), cap = StrokeCap.Round),
            )
        }

        val nodeCount = 44
        repeat(nodeCount) { index ->
            val angle = Math.toRadians((index * 360f / nodeCount + phase).toDouble())
            val wave = waveform.getOrNull(index % waveform.size) ?: 0.08f
            val boost = if (visualState == AssistantVisualState.Speaking) {
                0.42f + wave * 1.8f + 0.22f * sin(Math.toRadians(phase.toDouble() + index * 18.0)).toFloat()
            } else {
                0.12f + wave * 0.8f
            }
            val inner = activeRadius * (1.08f + boost * 0.18f)
            val outer = inner + baseRadius * boost.coerceIn(0.12f, 1.45f)
            val start = Offset(
                x = center.x + cos(angle).toFloat() * inner,
                y = center.y + sin(angle).toFloat() * inner,
            )
            val end = Offset(
                x = center.x + cos(angle).toFloat() * outer,
                y = center.y + sin(angle).toFloat() * outer,
            )
            drawLine(
                color = color.copy(alpha = if (visualState == AssistantVisualState.Speaking) 0.78f else 0.42f),
                start = start,
                end = end,
                strokeWidth = if (visualState == AssistantVisualState.Speaking) 6f else 4f,
                cap = StrokeCap.Round,
            )
        }

        drawCircle(
            color = WellnessSurface.copy(alpha = 0.94f),
            radius = activeRadius * 0.82f,
            center = center,
        )
        drawCircle(
            color = color.copy(alpha = 0.68f),
            radius = activeRadius * 0.46f,
            center = center,
        )
        drawCircle(
            color = WellnessSurface.copy(alpha = 0.62f),
            radius = activeRadius * 0.18f,
            center = center,
        )
    }
}

@Composable
private fun PlaceholderTab(label: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .fillMaxHeight()
            .padding(16.dp),
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Icon(Icons.Outlined.CropSquare, contentDescription = label)
            Spacer(Modifier.height(12.dp))
            Text("$label page")
            Text(
                text = "Added in next iteration",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun CircularProgressStat(title: String, progress: Float, color: Color, modifier: Modifier) {
    val ratio = progress.coerceIn(0f, 1f)
    Card(
        modifier = modifier
            .height(130.dp)
            .padding(4.dp),
        shape = RoundedCornerShape(20.dp),
    ) {
        BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
            val stroke = 10.dp
            Canvas(modifier = Modifier.fillMaxSize()) {
                val diameter = min(size.width, size.height)
                val strokePx = stroke.toPx()
                drawArc(
                    color = color.copy(alpha = 0.18f),
                    startAngle = 140f,
                    sweepAngle = 260f,
                    useCenter = false,
                    style = Stroke(width = strokePx),
                    size = androidx.compose.ui.geometry.Size(diameter, diameter),
                )
                drawArc(
                    color = color,
                    startAngle = 140f,
                    sweepAngle = 260f * ratio,
                    useCenter = false,
                    style = Stroke(width = strokePx),
                    size = androidx.compose.ui.geometry.Size(diameter, diameter),
                )
            }
            Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Text("${(ratio * 100).toInt()}%", style = MaterialTheme.typography.titleMedium)
                Text(title, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

@Composable
private fun WellnessBarChart(values: List<Float>) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(90.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        verticalAlignment = Alignment.Bottom,
    ) {
        values.forEach { value ->
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
                    .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(10.dp))
            ) {
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .width(18.dp)
                        .fillMaxHeight(value)
                        .background(WellnessSage, RoundedCornerShape(topStart = 10.dp, topEnd = 10.dp))
                )
            }
        }
    }
}

@Composable
private fun Heatmap(values: List<List<Float>>) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        values.forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                row.forEach { value ->
                    val tone = if (value < 0.33f) WellnessSage else if (value < 0.66f) WellnessMustard else Color(0xFFF28D8D)
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(28.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(tone.copy(alpha = 0.2f + value * 0.8f))
                    )
                }
            }
        }
    }
}
