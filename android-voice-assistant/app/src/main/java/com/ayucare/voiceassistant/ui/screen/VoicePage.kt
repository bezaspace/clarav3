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
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
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
import androidx.compose.material.icons.outlined.BarChart
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material.icons.outlined.CropSquare
import androidx.compose.material.icons.outlined.GraphicEq
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.LocalHospital
import androidx.compose.material.icons.outlined.Mic
import androidx.compose.material.icons.outlined.MicOff
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.Scaffold
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
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
import kotlinx.coroutines.launch
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.sin

data class BottomTabItem(val title: String, val icon: androidx.compose.ui.graphics.vector.ImageVector)

data class InsightRing(val title: String, val value: Float, val color: Color)

@Composable
fun VoicePage(viewModel: VoiceAssistantViewModel) {
    val state by viewModel.uiState.collectAsState()
    val interaction = remember { MutableInteractionSource() }
    val isPressed by interaction.collectIsPressedAsState()
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { granted ->
            if (!granted) {
                viewModel.setWarning("Microphone permission denied. Enable it to use voice assistant.")
            }
        },
    )

    val tabs = listOf(
        BottomTabItem("Home", Icons.Outlined.Home),
        BottomTabItem("Assistant", Icons.Outlined.GraphicEq),
        BottomTabItem("Progress", Icons.Outlined.BarChart),
        BottomTabItem("Care", Icons.Outlined.LocalHospital),
        BottomTabItem("Journal", Icons.Outlined.ChatBubbleOutline),
        BottomTabItem("Profile", Icons.Outlined.Person),
    )
    var selectedTab by remember { mutableStateOf(0) }

    LaunchedEffect(isPressed) {
        if (isPressed) {
            val granted = ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.RECORD_AUDIO
            ) == PackageManager.PERMISSION_GRANTED

            if (!granted) {
                permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                return@LaunchedEffect
            }

            scope.launch {
                viewModel.beginPress()
            }
        } else {
            viewModel.endPress()
        }
    }

    Scaffold(
        modifier = Modifier.background(MaterialTheme.colorScheme.background),
        bottomBar = {
            NavigationBar {
                tabs.forEachIndexed { index, item ->
                    NavigationBarItem(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        icon = { Icon(item.icon, contentDescription = item.title) },
                        label = { Text(item.title) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = MaterialTheme.colorScheme.onPrimary,
                            selectedTextColor = MaterialTheme.colorScheme.onPrimary,
                            indicatorColor = MaterialTheme.colorScheme.primary,
                        ),
                    )
                }
            }
        },
    ) { padding ->
        when (selectedTab) {
            0 -> HomeDashboard(modifier = Modifier.padding(padding))
            1 -> AssistantPage(
                state = state,
                isPressed = isPressed,
                interaction = interaction,
                modifier = Modifier.padding(padding),
            )
            else -> PlaceholderTab(label = tabs[selectedTab].title)
        }
    }
}

@Composable
private fun HomeDashboard(modifier: Modifier = Modifier) {
    val ringStats = listOf(
        InsightRing("Focus", 0.86f, WellnessMustard),
        InsightRing("Mood", 0.67f, WellnessSage),
        InsightRing("Energy", 0.72f, WellnessBlue),
    )

    val bars = listOf(0.18f, 0.36f, 0.55f, 0.48f, 0.74f, 0.89f, 0.65f)
    val heatMatrix = listOf(
        listOf(0.2f, 0.4f, 0.7f, 0.3f, 0.5f, 0.2f, 0.6f),
        listOf(0.35f, 0.55f, 0.45f, 0.9f, 0.8f, 0.2f, 0.4f),
        listOf(0.1f, 0.25f, 0.65f, 0.35f, 0.6f, 0.8f, 0.3f),
        listOf(0.4f, 0.7f, 0.85f, 0.9f, 0.45f, 0.38f, 0.5f),
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = "Today",
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.onBackground,
        )

        Card(modifier = Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(24.dp))) {
            Column(modifier = Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Wellness rings", style = MaterialTheme.typography.titleMedium)
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    ringStats.forEach { item ->
                        CircularProgressStat(item.title, item.value, item.color, modifier = Modifier.weight(1f))
                    }
                }
            }
        }

        Card(modifier = Modifier.fillMaxWidth().shadow(3.dp, RoundedCornerShape(24.dp))) {
            Column(modifier = Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Activity heatmap + trend", style = MaterialTheme.typography.titleMedium)
                WellnessBarChart(values = bars)
                Heatmap(values = heatMatrix)
            }
        }
    }
}

@Composable
private fun AssistantPage(
    state: VoiceUiState,
    isPressed: Boolean,
    interaction: MutableInteractionSource,
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
        state.isRecording || isPressed -> "Listening"
        state.connectionState == ConnectionState.Connecting -> "Connecting"
        state.connectionState == ConnectionState.Error -> "Connection issue"
        state.visualState == AssistantVisualState.Speaking -> "Speaking"
        state.visualState == AssistantVisualState.Awaiting -> "Thinking"
        state.visualState == AssistantVisualState.Listening -> "Ready"
        else -> "Hold to talk"
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
            Spacer(Modifier.height(8.dp))

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
                    interactionSource = interaction,
                    onClick = {},
                ) {
                    Icon(
                        imageVector = if (state.isRecording || isPressed) Icons.Outlined.Mic else Icons.Outlined.MicOff,
                        contentDescription = if (state.isRecording || isPressed) "Listening" else "Hold to talk",
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
private fun PlaceholderTab(label: String) {
    Card(
        modifier = Modifier
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
