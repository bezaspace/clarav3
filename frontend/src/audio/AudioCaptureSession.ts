const TARGET_SAMPLE_RATE = 16000
const TARGET_CHUNK_SAMPLES = 800

function downsampleToPcm16(
  input: Float32Array,
  sourceSampleRate: number,
  targetSampleRate: number,
) {
  if (input.length === 0) {
    return new Int16Array(0)
  }

  const safeSourceRate = sourceSampleRate > 0 ? sourceSampleRate : targetSampleRate
  const ratio = safeSourceRate / targetSampleRate
  const outputLength = Math.max(1, Math.round(input.length / ratio))
  const output = new Int16Array(outputLength)

  for (let index = 0; index < outputLength; index += 1) {
    const position = index * ratio
    const leftIndex = Math.min(Math.floor(position), input.length - 1)
    const rightIndex = Math.min(leftIndex + 1, input.length - 1)
    const fraction = position - leftIndex
    const interpolated =
      input[leftIndex] * (1 - fraction) + input[rightIndex] * fraction
    const sample = Math.max(-1, Math.min(1, interpolated))
    output[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff
  }

  return output
}

export class AudioCaptureSession {
  public onChunk: (chunk: ArrayBuffer) => void
  private audioContext: AudioContext | null = null
  private stream: MediaStream | null = null
  private source: MediaStreamAudioSourceNode | null = null
  private workletNode: AudioWorkletNode | null = null
  private inputRate = TARGET_SAMPLE_RATE
  private streaming = false
  private pending = new Int16Array(0)

  constructor({ onChunk }: { onChunk: (chunk: ArrayBuffer) => void }) {
    this.onChunk = onChunk
  }

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })

    this.audioContext = new AudioContext({ sampleRate: TARGET_SAMPLE_RATE })
    this.inputRate = this.audioContext.sampleRate

    await this.audioContext.audioWorklet.addModule('/audio-capture-worklet.js')
    await this.audioContext.resume()

    this.source = this.audioContext.createMediaStreamSource(this.stream)
    this.workletNode = new AudioWorkletNode(this.audioContext, 'audio-capture-processor', {
      numberOfInputs: 1,
      numberOfOutputs: 0,
      channelCount: 1,
    })

    this.source.connect(this.workletNode)

    this.workletNode.port.onmessage = (event: MessageEvent<Float32Array | ArrayLike<number>>) => {
      if (!this.streaming || !(event.data instanceof Float32Array)) {
        return
      }

      const floatSamples = event.data
      this.appendAndEmit(
        downsampleToPcm16(floatSamples, this.inputRate, TARGET_SAMPLE_RATE)
      )
    }
  }

  private appendAndEmit(incoming: Int16Array) {
    if (incoming.length === 0) {
      return
    }

    const merged = new Int16Array(this.pending.length + incoming.length)
    merged.set(this.pending)
    merged.set(incoming, this.pending.length)
    this.pending = merged

    while (this.pending.length >= TARGET_CHUNK_SAMPLES) {
      const frame = this.pending.slice(0, TARGET_CHUNK_SAMPLES)
      this.onChunk(frame.buffer)
      this.pending = this.pending.slice(TARGET_CHUNK_SAMPLES)
    }
  }

  private flushPending() {
    if (this.pending.length === 0) {
      return
    }

    const tail = this.pending.slice()
    this.pending = new Int16Array(0)
    this.onChunk(tail.buffer)
  }

  startStream() {
    this.streaming = true
  }

  pauseStream() {
    if (!this.streaming) {
      return
    }
    this.streaming = false
    this.flushPending()
  }

  isStreaming() {
    return this.streaming
  }

  async stop() {
    this.pauseStream()

    if (this.source) {
      this.source.disconnect()
      this.source = null
    }

    if (this.workletNode) {
      this.workletNode.disconnect()
      this.workletNode = null
    }

    if (this.stream) {
      for (const track of this.stream.getTracks()) {
        track.stop()
      }
      this.stream = null
    }

    if (this.audioContext) {
      await this.audioContext.close()
      this.audioContext = null
    }

    this.pending = new Int16Array(0)
  }
}
