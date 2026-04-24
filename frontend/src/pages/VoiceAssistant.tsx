import { useEffect, useRef, useState } from 'react'

import { AudioCaptureSession } from '@/src/audio/AudioCaptureSession'
import { AudioPlaybackQueue } from '@/src/audio/AudioPlaybackQueue'

const BACKEND_HTTP_URL =
  import.meta.env.VITE_VOICE_ASSISTANT_HTTP_URL ||
  import.meta.env.VITE_BACKEND_HTTP_URL ||
  'http://127.0.0.1:8000'
const BACKEND_WS_URL =
  import.meta.env.VITE_VOICE_ASSISTANT_WS_URL ||
  `${BACKEND_HTTP_URL.replace(/^http/i, 'ws').replace(/\/$/, '')}/live`

type ConnectionState = 'idle' | 'connecting' | 'ready' | 'error'
type VisualState = 'idle' | 'listening' | 'holding' | 'awaiting' | 'speaking' | 'error'

function getLiveSocketUrl() {
  return BACKEND_WS_URL
}

export default function VoiceAssistant() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle')
  const [visualState, setVisualState] = useState<VisualState>('idle')
  const [warning, setWarning] = useState('')

  const socketRef = useRef<WebSocket | null>(null)
  const playerRef = useRef<AudioPlaybackQueue | null>(null)
  const micRef = useRef<AudioCaptureSession | null>(null)
  const assistantSampleRateRef = useRef(24000)
  const isPttActiveRef = useRef(false)
  const speakingTimeoutRef = useRef<number | null>(null)
  const pendingCloseStateRef = useRef<{ connectionState: ConnectionState; visualState: VisualState; warning: string } | null>(null)

  useEffect(() => {
    return () => {
      if (speakingTimeoutRef.current !== null) {
        window.clearTimeout(speakingTimeoutRef.current)
      }
      micRef.current?.stop().catch(() => {})
      playerRef.current?.close().catch(() => {})
      if (socketRef.current && socketRef.current.readyState < WebSocket.CLOSING) {
        socketRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== ' ' || event.repeat) {
        return
      }

      const target = event.target
      const isEditable =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)

      if (isEditable) {
        return
      }

      event.preventDefault()
      beginPtt()
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key !== ' ') {
        return
      }
      event.preventDefault()
      endPtt()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [connectionState])

  const markPttActive = (active: boolean) => {
    isPttActiveRef.current = active
  }

  const stopAssistantPlaybackNow = () => {
    playerRef.current?.interrupt()
    if (speakingTimeoutRef.current !== null) {
      window.clearTimeout(speakingTimeoutRef.current)
      speakingTimeoutRef.current = null
    }
  }

  const scheduleListeningVisual = (delayMs: number) => {
    if (speakingTimeoutRef.current !== null) {
      window.clearTimeout(speakingTimeoutRef.current)
    }

    speakingTimeoutRef.current = window.setTimeout(() => {
      if (!isPttActiveRef.current) {
        setVisualState('listening')
      }
      speakingTimeoutRef.current = null
    }, delayMs)
  }

  const sendEvent = (payload: Record<string, unknown>) => {
    const socket = socketRef.current
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return
    }
    socket.send(JSON.stringify(payload))
  }

  const ensureConnection = async () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return
    }

    setConnectionState('connecting')
    setVisualState('idle')
    setWarning('')
    assistantSampleRateRef.current = 24000

    playerRef.current = new AudioPlaybackQueue()
    await playerRef.current.ensureReady()

    const mic = new AudioCaptureSession({
      onChunk: (chunk) => {
        const socket = socketRef.current
        if (!socket || socket.readyState !== WebSocket.OPEN) {
          return
        }
        socket.send(chunk)
      },
    })
    await mic.start()
    micRef.current = mic

    await new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(getLiveSocketUrl())
      socket.binaryType = 'arraybuffer'
      socketRef.current = socket

      let initialized = false
      const storedSessionId =
        typeof window !== 'undefined'
          ? window.localStorage?.getItem('clara3.session_id') || null
          : null

      socket.onopen = () => {
        socket.send(
          JSON.stringify({
            type: 'session_init',
            session_id: storedSessionId,
          })
        )
      }

      socket.onerror = () => {
        reject(new Error('Connection error. Check backend logs.'))
      }

      socket.onclose = () => {
        const pending = pendingCloseStateRef.current
        pendingCloseStateRef.current = null
        markPttActive(false)

        if (!initialized) {
          reject(new Error('Connection closed before session_started.'))
        }

        if (pending) {
          setConnectionState(pending.connectionState)
          setVisualState(pending.visualState)
          setWarning(pending.warning)
          return
        }

        setConnectionState('idle')
        setVisualState('idle')
      }

      socket.onmessage = (event: MessageEvent<string | ArrayBuffer>) => {
        if (typeof event.data === 'string') {
          const parsed = JSON.parse(event.data)

          if (parsed.type === 'session_started') {
            initialized = true
            if (parsed.session_id && typeof window !== 'undefined') {
              window.localStorage?.setItem('clara3.session_id', parsed.session_id)
            }
            setConnectionState('ready')
            if (!isPttActiveRef.current) {
              setVisualState('listening')
            }
            resolve()
            return
          }

          if (parsed.type === 'assistant_audio_format') {
            assistantSampleRateRef.current = parsed.sampleRate
            return
          }

          if (
            parsed.type === 'interrupted' ||
            parsed.type === 'assistant_interrupted'
          ) {
            stopAssistantPlaybackNow()
            if (!isPttActiveRef.current) {
              setVisualState('awaiting')
            }
            return
          }

          if (parsed.type === 'assistant_text' || parsed.type === 'transcript') {
            if (!isPttActiveRef.current && parsed.speaker !== 'user') {
              setVisualState('speaking')
              scheduleListeningVisual(1200)
            }
            return
          }

          if (parsed.type === 'state') {
            if (parsed.state === 'thinking' && !isPttActiveRef.current) {
              setVisualState('awaiting')
            }
            if (parsed.state === 'speaking' && !isPttActiveRef.current) {
              setVisualState('speaking')
            }
            return
          }

          if (parsed.type === 'warning' || parsed.type === 'error') {
            setWarning(parsed.message)
            if (parsed.type === 'error') {
              setConnectionState('error')
              setVisualState('error')
            }
          }

          return
        }

        if (event.data instanceof ArrayBuffer) {
          playerRef.current?.playPcm16Chunk(
            event.data,
            assistantSampleRateRef.current
          )
          if (!isPttActiveRef.current) {
            setVisualState('speaking')
          }
        }
      }
    })

    if (warning === 'Microphone unavailable.') {
      setWarning('')
    }
  }

  const disconnect = async () => {
    pendingCloseStateRef.current = null

    if (isPttActiveRef.current) {
      markPttActive(false)
      micRef.current?.pauseStream()
      sendEvent({ type: 'ptt_end' })
    }

    if (speakingTimeoutRef.current !== null) {
      window.clearTimeout(speakingTimeoutRef.current)
      speakingTimeoutRef.current = null
    }

    micRef.current?.pauseStream()
    if (micRef.current) {
      await micRef.current.stop()
      micRef.current = null
    }

    if (socketRef.current) {
      sendEvent({ type: 'stop_session' })
      socketRef.current.close()
      socketRef.current = null
    }

    if (playerRef.current) {
      await playerRef.current.close()
      playerRef.current = null
    }

    setConnectionState('idle')
    setVisualState('idle')
  }

  const beginPtt = async () => {
    if (connectionState === 'connecting' || isPttActiveRef.current) {
      return
    }

    try {
      if (connectionState !== 'ready') {
        await ensureConnection()
      }

      stopAssistantPlaybackNow()
      markPttActive(true)
      setVisualState('holding')
      micRef.current?.startStream()
      sendEvent({ type: 'ptt_start' })
    } catch (error) {
      await disconnect()
      setWarning((error as Error).message || 'Connection error. Check backend logs.')
      setVisualState('error')
      setConnectionState('error')
    }
  }

  const endPtt = () => {
    if (!isPttActiveRef.current) {
      return
    }

    markPttActive(false)
    micRef.current?.pauseStream()
    sendEvent({ type: 'ptt_end' })

    if (connectionState === 'ready') {
      setVisualState('awaiting')
    }
  }

  const handlePointerDown = async (event: React.MouseEvent) => {
    event.preventDefault()
    await beginPtt()
  }

  const handlePointerUp = (event: React.MouseEvent) => {
    event.preventDefault()
    endPtt()
  }

  const label =
    connectionState === 'idle'
      ? 'Hold to talk'
      : visualState === 'holding'
        ? 'Release when done'
        : visualState === 'listening'
          ? 'Ready'
          : visualState === 'awaiting'
            ? 'Processing'
            : visualState === 'speaking'
              ? 'Speaking'
              : visualState === 'error'
                ? 'Error'
                : 'Connecting'

  const orbColorClass =
    visualState === 'holding'
      ? 'from-emerald-300 to-emerald-500 animate-pulse'
      : visualState === 'speaking'
        ? 'from-blue-300 to-blue-500'
        : visualState === 'awaiting'
          ? 'from-amber-300 to-orange-400'
          : visualState === 'error'
            ? 'from-rose-300 to-rose-500'
            : 'from-teal-200 to-cyan-500'

  return (
    <div className="min-h-[calc(100vh-3rem)] flex flex-col items-center justify-center gap-4 py-8 text-stone-100">
      <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
        AI Voice Assistant
      </p>

      <button
        className={`relative h-40 w-40 rounded-full bg-gradient-to-br ${orbColorClass} shadow-2xl border border-white/20 transition-transform duration-200 ${
          isPttActiveRef.current ? 'scale-110' : ''
        }`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={() => {
          if (isPttActiveRef.current) {
            endPtt()
          }
        }}
        aria-label="Hold to talk"
      >
        <span className="absolute inset-5 rounded-full bg-black/10 border border-white/20" />
        <span className="sr-only">{label}</span>
      </button>

      <div className="text-center px-4">
        <p className="text-sm text-stone-100">{warning || label}</p>
        <p className="text-xs text-stone-500 mt-1">Hold orb or spacebar to talk</p>
      </div>

      <div className="mt-2 flex gap-2 flex-wrap justify-center">
        {connectionState !== 'idle' ? (
          <button
            type="button"
            onClick={() => disconnect()}
            className="px-4 py-2 rounded-lg border border-stone-700/80 bg-stone-900/50 text-xs uppercase tracking-wide"
          >
            Disconnect
          </button>
        ) : null}
      </div>
    </div>
  )
}
