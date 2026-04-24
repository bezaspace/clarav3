import { useEffect, useRef, useState, type MouseEvent } from 'react'
import {
  Brain,
  CheckCircle2,
  Circle,
  Clock3,
  Dumbbell,
  ListTodo,
  Pill,
  Power,
  PowerOff,
  Utensils,
} from 'lucide-react'

import { AudioCaptureSession } from '@/src/audio/AudioCaptureSession'
import { AudioPlaybackQueue } from '@/src/audio/AudioPlaybackQueue'
import type {
  ActivityCard,
  CurrentActivityPayload,
  ScheduleSnapshotPayload,
} from '@/src/lib/types'
import { cn } from '@/src/lib/utils'

const BACKEND_HTTP_URL =
  import.meta.env.VITE_VOICE_ASSISTANT_HTTP_URL ||
  import.meta.env.VITE_BACKEND_HTTP_URL ||
  'http://127.0.0.1:8000'
const BACKEND_WS_URL =
  import.meta.env.VITE_VOICE_ASSISTANT_WS_URL ||
  `${BACKEND_HTTP_URL.replace(/^http/i, 'ws').replace(/\/$/, '')}/live`
const VOICE_DEBUG = import.meta.env.DEV

type ConnectionState = 'idle' | 'connecting' | 'ready' | 'error'
type VisualState = 'idle' | 'listening' | 'holding' | 'awaiting' | 'speaking' | 'error'

function getLiveSocketUrl() {
  return BACKEND_WS_URL
}

function debugLog(message: string, payload?: unknown) {
  if (!VOICE_DEBUG) {
    return
  }

  if (payload === undefined) {
    console.debug(`[voice-assistant] ${message}`)
    return
  }

  console.debug(`[voice-assistant] ${message}`, payload)
}

function getActivityIcon(category: string, kind: ActivityCard['kind']) {
  switch (category) {
    case 'Mind':
      return <Brain size={16} />
    case 'Body':
      return <Dumbbell size={16} />
    case 'Diet':
      return <Utensils size={16} />
    case 'Medicine':
      return <Pill size={16} />
    default:
      return kind === 'task' ? <ListTodo size={16} /> : <Clock3 size={16} />
  }
}

function getActivityTone(category: string) {
  switch (category) {
    case 'Mind':
      return 'border-fuchsia-400/25 bg-fuchsia-400/10 text-fuchsia-200'
    case 'Body':
      return 'border-sky-400/25 bg-sky-400/10 text-sky-200'
    case 'Diet':
      return 'border-amber-400/25 bg-amber-400/10 text-amber-200'
    case 'Medicine':
      return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200'
    default:
      return 'border-stone-400/20 bg-stone-400/10 text-stone-200'
  }
}

function ActivityVisual({ item }: { item: ActivityCard }) {
  const isCompleted = item.status === 'completed'

  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-neutral-950/80 p-4 shadow-2xl shadow-black/30 backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]',
            getActivityTone(item.category)
          )}
        >
          {getActivityIcon(item.category, item.kind)}
          <span>{item.category}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-[11px] text-stone-400">
          <Clock3 size={12} />
          <span>{item.timeLabel || 'Any time'}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        {isCompleted ? (
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" />
        ) : (
          <Circle size={18} className="mt-0.5 shrink-0 text-stone-500" />
        )}
        <div className="min-w-0">
          <p
            className={cn(
              'truncate text-sm font-semibold',
              isCompleted ? 'text-stone-400 line-through' : 'text-stone-100'
            )}
          >
            {item.title}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-400">
            {item.supportingText}
          </p>
        </div>
      </div>
    </div>
  )
}

function isActivityCardPayload(value: unknown): value is ActivityCard {
  if (!value || typeof value !== 'object') {
    return false
  }

  const payload = value as Record<string, unknown>
  return (
    typeof payload.id === 'string' &&
    typeof payload.kind === 'string' &&
    typeof payload.title === 'string' &&
    typeof payload.category === 'string' &&
    typeof payload.status === 'string' &&
    typeof payload.timeLabel === 'string' &&
    typeof payload.supportingText === 'string'
  )
}

function isCurrentActivityPayload(value: unknown): value is CurrentActivityPayload {
  if (!value || typeof value !== 'object') {
    return false
  }

  return (value as Record<string, unknown>).type === 'current_activity'
}

function isScheduleSnapshotPayload(value: unknown): value is ScheduleSnapshotPayload {
  if (!value || typeof value !== 'object') {
    return false
  }

  const payload = value as Record<string, unknown>
  return payload.type === 'schedule_snapshot' && Array.isArray(payload.items)
}

export default function VoiceAssistant() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle')
  const [visualState, setVisualState] = useState<VisualState>('idle')
  const [warning, setWarning] = useState('')
  const [activityVisuals, setActivityVisuals] = useState<ActivityCard[]>([])

  const socketRef = useRef<WebSocket | null>(null)
  const playerRef = useRef<AudioPlaybackQueue | null>(null)
  const micRef = useRef<AudioCaptureSession | null>(null)
  const assistantSampleRateRef = useRef(24000)
  const isPttActiveRef = useRef(false)
  const speakingTimeoutRef = useRef<number | null>(null)
  const pendingCloseStateRef = useRef<{
    connectionState: ConnectionState
    visualState: VisualState
    warning: string
  } | null>(null)

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

  const showActivityVisuals = (items: ActivityCard[]) => {
    const normalizedItems = items.filter(isActivityCardPayload)
    if (!normalizedItems.length) {
      return
    }

    setActivityVisuals((current) => {
      const merged = [...normalizedItems, ...current]
      const seen = new Set<string>()
      return merged.filter((item) => {
        if (seen.has(item.id)) {
          return false
        }
        seen.add(item.id)
        return true
      }).slice(0, 6)
    })
  }

  const showPrimaryActivityVisual = (...items: unknown[]) => {
    const primaryItem = items.find(isActivityCardPayload)
    if (!primaryItem) {
      return
    }

    setActivityVisuals([primaryItem])
  }

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
      debugLog('sendEvent.skip', {
        payload,
        readyState: socket?.readyState,
      })
      return
    }
    debugLog('sendEvent', payload)
    socket.send(JSON.stringify(payload))
  }

  const ensureConnection = async () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      debugLog('ensureConnection.skip', { reason: 'already-open' })
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
        debugLog('socket.onopen', { storedSessionId })
        socket.send(
          JSON.stringify({
            type: 'session_init',
            session_id: storedSessionId,
          })
        )
      }

      socket.onerror = () => {
        debugLog('socket.onerror')
        reject(new Error('Connection error. Check backend logs.'))
      }

      socket.onclose = () => {
        debugLog('socket.onclose', {
          initialized,
          pendingCloseState: pendingCloseStateRef.current,
        })
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
          debugLog('socket.onmessage.text', parsed)

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

          if (isCurrentActivityPayload(parsed)) {
            showPrimaryActivityVisual(
              parsed.activityCard,
              parsed.currentItem,
              parsed.upcomingItem
            )
            return
          }

          if (isScheduleSnapshotPayload(parsed)) {
            showActivityVisuals([
              ...parsed.items,
              ...(parsed.pendingTasks || []),
            ])
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
          debugLog('socket.onmessage.audio', { byteLength: event.data.byteLength })
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
    debugLog('disconnect.start')
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
    setActivityVisuals([])
    debugLog('disconnect.done')
  }

  const handleSessionToggle = async () => {
    if (connectionState === 'idle' || connectionState === 'error') {
      try {
        await ensureConnection()
      } catch (error) {
        debugLog('sessionToggle.error', error)
        await disconnect()
        setWarning((error as Error).message || 'Connection error. Check backend logs.')
        setVisualState('error')
        setConnectionState('error')
      }
      return
    }

    await disconnect()
  }

  const beginPtt = async () => {
    if (connectionState === 'connecting' || isPttActiveRef.current) {
      debugLog('beginPtt.skip', {
        connectionState,
        isPttActive: isPttActiveRef.current,
      })
      return
    }

    try {
      debugLog('beginPtt.start', { connectionState })
      if (connectionState !== 'ready') {
        await ensureConnection()
      }

      stopAssistantPlaybackNow()
      markPttActive(true)
      setVisualState('holding')
      micRef.current?.startStream()
      sendEvent({ type: 'ptt_start' })
    } catch (error) {
      debugLog('beginPtt.error', error)
      await disconnect()
      setWarning((error as Error).message || 'Connection error. Check backend logs.')
      setVisualState('error')
      setConnectionState('error')
    }
  }

  const endPtt = () => {
    if (!isPttActiveRef.current) {
      debugLog('endPtt.skip', { reason: 'not-active' })
      return
    }

    debugLog('endPtt.start')
    markPttActive(false)
    micRef.current?.pauseStream()
    sendEvent({ type: 'ptt_end' })

    if (connectionState === 'ready') {
      setVisualState('awaiting')
    }
  }

  const handlePointerDown = async (event: MouseEvent) => {
    event.preventDefault()
    await beginPtt()
  }

  const handlePointerUp = (event: MouseEvent) => {
    event.preventDefault()
    endPtt()
  }

  const label =
    warning ||
    (connectionState === 'idle'
      ? 'Hold to talk'
      : visualState === 'holding'
        ? 'Listening'
        : visualState === 'listening'
          ? 'Ready'
          : visualState === 'awaiting'
            ? 'Processing'
            : visualState === 'speaking'
              ? 'Speaking'
              : visualState === 'error'
                ? 'Error'
                : 'Connecting')

  const orbColorClass =
    visualState === 'holding'
      ? 'from-emerald-200 via-teal-300 to-emerald-500'
      : visualState === 'speaking'
        ? 'from-sky-200 via-blue-300 to-indigo-500'
        : visualState === 'awaiting' || connectionState === 'connecting'
          ? 'from-amber-200 via-orange-300 to-rose-400'
          : visualState === 'error'
            ? 'from-rose-200 via-red-400 to-rose-600'
            : 'from-cyan-100 via-teal-300 to-emerald-400'

  const auraClass =
    visualState === 'speaking'
      ? 'bg-blue-400/25 animate-ping'
      : visualState === 'holding'
        ? 'bg-emerald-300/25 animate-pulse'
        : visualState === 'awaiting' || connectionState === 'connecting'
          ? 'bg-amber-300/20 animate-pulse'
          : visualState === 'error'
            ? 'bg-rose-400/25 animate-pulse'
            : 'bg-teal-300/15'

  const isSessionActive = connectionState === 'ready' || connectionState === 'connecting'

  return (
    <div className="relative flex min-h-[calc(100vh-3rem)] w-full items-end justify-center overflow-hidden pb-28 md:pb-12">
      <button
        type="button"
        onClick={handleSessionToggle}
        disabled={connectionState === 'connecting'}
        className="absolute right-2 top-2 z-10 inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-neutral-950/70 px-3 text-xs font-medium uppercase tracking-[0.14em] text-stone-300 shadow-xl shadow-black/20 backdrop-blur-md transition hover:border-white/20 hover:text-stone-100 disabled:cursor-wait disabled:opacity-60"
        aria-label={isSessionActive ? 'End voice session' : 'Start voice session'}
      >
        {isSessionActive ? <PowerOff size={16} /> : <Power size={16} />}
        <span>{isSessionActive ? 'End' : 'Start'}</span>
      </button>

      {activityVisuals.length ? (
        <div
          className={cn(
            'absolute inset-x-0 top-16 mx-auto grid w-full gap-3 px-2',
            activityVisuals.length === 1
              ? 'max-w-sm'
              : 'max-w-3xl sm:grid-cols-2 lg:grid-cols-3'
          )}
        >
          {activityVisuals.map((item) => (
            <div key={item.id}>
              <ActivityVisual item={item} />
            </div>
          ))}
        </div>
      ) : null}

      <button
        className={`relative h-36 w-36 rounded-full border border-white/20 bg-gradient-to-br ${orbColorClass} shadow-[0_0_70px_rgba(45,212,191,0.35)] transition duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:h-44 md:w-44 ${
          visualState === 'holding' ? 'scale-110' : ''
        }`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={() => {
          if (isPttActiveRef.current) {
            endPtt()
          }
        }}
        aria-label={label}
      >
        <span className={`absolute -inset-6 rounded-full ${auraClass}`} />
        <span className="absolute inset-4 rounded-full border border-white/25 bg-white/10 shadow-inner" />
        <span className="absolute inset-10 rounded-full bg-white/20 blur-sm" />
        <span className="sr-only" aria-live="polite">
          {label}
        </span>
      </button>
    </div>
  )
}
