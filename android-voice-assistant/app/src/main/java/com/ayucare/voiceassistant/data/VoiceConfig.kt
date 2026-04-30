package com.ayucare.voiceassistant.data

import java.net.URI

object VoiceConfig {
    const val DEFAULT_HTTP_URL = "http://127.0.0.1:8000"

    fun normalizeWebSocketUrl(raw: String): String {
        val trimmed = raw.trim().trimEnd('/')
        if (trimmed.isEmpty()) {
            return "ws://127.0.0.1:8000/live"
        }

        val normalized = when {
            trimmed.startsWith("ws://", ignoreCase = true) || trimmed.startsWith("wss://", ignoreCase = true) -> {
                trimmed
            }
            else -> {
                if (trimmed.startsWith("http://", ignoreCase = true)) {
                    trimmed.replaceFirst(Regex("^http://", RegexOption.IGNORE_CASE), "ws://")
                } else if (trimmed.startsWith("https://", ignoreCase = true)) {
                    trimmed.replaceFirst(Regex("^https://", RegexOption.IGNORE_CASE), "wss://")
                } else {
                    "ws://$trimmed"
                }
            }
        }

        return if (normalized.contains("/live")) {
            normalized
        } else {
            "$normalized/live"
        }
    }

    fun stripScheme(host: String): URI {
        val normalized = if (host.startsWith("ws://", true)) {
            "http://" + host.removePrefix("ws://")
        } else if (host.startsWith("wss://", true)) {
            "https://" + host.removePrefix("wss://")
        } else {
            host
        }
        return URI(normalized)
    }
}
