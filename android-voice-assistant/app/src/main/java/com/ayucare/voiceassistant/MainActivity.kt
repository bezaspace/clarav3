package com.ayucare.voiceassistant

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import com.ayucare.voiceassistant.ui.screen.VoicePage
import com.ayucare.voiceassistant.ui.theme.VoiceTheme

class MainActivity : ComponentActivity() {
    private val viewModel: VoiceAssistantViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            VoiceTheme {
                VoicePage(viewModel = viewModel)
            }
        }
    }
}
