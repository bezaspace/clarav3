package com.ayucare.voiceassistant.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import com.ayucare.voiceassistant.ui.theme.WellnessBackground
import com.ayucare.voiceassistant.ui.theme.WellnessBorder
import com.ayucare.voiceassistant.ui.theme.WellnessDarkText
import com.ayucare.voiceassistant.ui.theme.WellnessMediumText
import com.ayucare.voiceassistant.ui.theme.WellnessMustard
import com.ayucare.voiceassistant.ui.theme.WellnessPink
import com.ayucare.voiceassistant.ui.theme.WellnessSage
import com.ayucare.voiceassistant.ui.theme.WellnessSurface
import com.ayucare.voiceassistant.ui.theme.WellnessTypography
import com.ayucare.voiceassistant.ui.theme.WellnessBlue
import com.ayucare.voiceassistant.ui.theme.WellnessLavender

private val WellnessLightColorScheme = lightColorScheme(
    primary = WellnessMustard,
    onPrimary = WellnessDarkText,
    secondary = WellnessSage,
    onSecondary = WellnessDarkText,
    tertiary = WellnessPink,
    onTertiary = WellnessDarkText,
    background = WellnessBackground,
    onBackground = WellnessDarkText,
    surface = WellnessSurface,
    onSurface = WellnessDarkText,
    surfaceVariant = WellnessBlue,
    onSurfaceVariant = WellnessDarkText,
    outline = WellnessBorder,
    outlineVariant = WellnessBorder,
)

@Composable
fun VoiceTheme(
    darkTheme: Boolean = false,
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) WellnessLightColorScheme else WellnessLightColorScheme,
        typography = WellnessTypography,
        shapes = WellnessShapes,
        content = content,
    )
}
