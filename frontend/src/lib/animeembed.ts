/**
 * AnimeEmbed client integration & message validation.
 * Complies with official animeembed.com specification.
 */

export const ANIMEEMBED_ORIGIN = 'https://www.animeembed.com'

export type AnimeEmbedEventType =
  | 'ready'
  | 'play'
  | 'pause'
  | 'buffering'
  | 'progress'
  | 'ended'
  | 'error'
  | 'commandresult'

export interface AnimeEmbedEventPayload {
  currentTime?: number
  duration?: number
  message?: string
  requestId?: string
  ok?: boolean
  [key: string]: unknown
}

export interface AnimeEmbedMessage {
  channel: 'animeembed'
  version: 1
  event: AnimeEmbedEventType
  data?: AnimeEmbedEventPayload
}

/**
 * Validates whether an incoming postMessage is a legitimate, well-formed
 * AnimeEmbed message from the expected iframe and origin.
 */
export function isValidAnimeEmbedMessage(
  event: MessageEvent,
  expectedWindow: Window | null,
  allowedOrigin = ANIMEEMBED_ORIGIN
): event is MessageEvent<AnimeEmbedMessage> {
  if (!event || !expectedWindow) return false
  if (event.origin !== allowedOrigin) return false
  if (event.source !== expectedWindow) return false

  const data = event.data
  if (!data || typeof data !== 'object') return false
  if (data.channel !== 'animeembed' || data.version !== 1) return false
  if (typeof data.event !== 'string') return false

  return true
}

/**
 * Extracts validated playback metrics (currentTime, duration) from an AnimeEmbed event.
 * Rejects NaN, negative timestamps, or implausible durations.
 */
export function extractValidPlaybackProgress(
  data?: AnimeEmbedEventPayload
): { currentTime: number; duration: number } | null {
  if (!data || typeof data !== 'object') return null

  const currentTime = Number(data.currentTime)
  if (!Number.isFinite(currentTime) || currentTime < 0 || currentTime > 604800) {
    return null
  }

  const rawDuration = Number(data.duration)
  const duration = Number.isFinite(rawDuration) && rawDuration >= 0 ? rawDuration : 0

  return { currentTime, duration }
}

export interface AnimeEmbedController {
  on(listener: (message: AnimeEmbedMessage) => void): () => void
  command(command: 'play' | 'pause' | 'seek' | 'setVolume' | 'setMuted' | string, data?: Record<string, unknown>): Promise<unknown>
  destroy(): void
}

/**
 * Connects to an AnimeEmbed iframe using the official AnimeEmbed SDK pattern.
 */
export function connectAnimeEmbed(frame: HTMLIFrameElement): AnimeEmbedController {
  if (!(frame instanceof HTMLIFrameElement)) {
    throw new TypeError('connectAnimeEmbed expects an HTMLIFrameElement')
  }

  let targetOrigin = ANIMEEMBED_ORIGIN
  try {
    if (frame.src) {
      targetOrigin = new URL(frame.src, window.location.href).origin
    }
  } catch {
    targetOrigin = ANIMEEMBED_ORIGIN
  }

  const listeners = new Set<(message: AnimeEmbedMessage) => void>()
  const pending = new Map<string, { resolve: (val: unknown) => void; reject: (err: Error) => void; timer: ReturnType<typeof setTimeout> }>()
  let serial = 0

  function receive(e: MessageEvent) {
    if (!isValidAnimeEmbedMessage(e, frame.contentWindow, targetOrigin)) return
    const message = e.data

    if (message.event === 'commandresult' && message.data?.requestId) {
      const p = pending.get(message.data.requestId)
      if (p) {
        clearTimeout(p.timer)
        pending.delete(message.data.requestId)
        if (message.data.ok) {
          p.resolve(message.data)
        } else {
          p.reject(new Error(message.data.message || 'Command failed'))
        }
      }
    }

    for (const fn of listeners) {
      try {
        fn(message)
      } catch (err) {
        console.error('AnimeEmbed event listener error:', err)
      }
    }
  }

  window.addEventListener('message', receive)

  return {
    on(fn: (message: AnimeEmbedMessage) => void) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    command(command: string, data: Record<string, unknown> = {}) {
      return new Promise((resolve, reject) => {
        if (!frame.contentWindow) {
          return reject(new Error('Iframe contentWindow is not available'))
        }
        const requestId = `ae-${++serial}`
        const timer = setTimeout(() => {
          pending.delete(requestId)
          reject(new Error('Player command timed out'))
        }, 15000)
        pending.set(requestId, { resolve, reject, timer })

        frame.contentWindow.postMessage(
          {
            channel: 'animeembed',
            version: 1,
            requestId,
            command,
            data
          },
          targetOrigin
        )
      })
    },
    destroy() {
      window.removeEventListener('message', receive)
      listeners.clear()
      for (const p of pending.values()) {
        clearTimeout(p.timer)
        p.reject(new Error('SDK disconnected'))
      }
      pending.clear()
    }
  }
}
