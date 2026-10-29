import { useEffect, useMemo, useRef, useState } from 'react'
import type Hls from 'hls.js'
import { AlertTriangle, ArrowLeft, Info, MonitorPlay, Subtitles } from 'lucide-react'
import type { Anime, Stream } from '../types'
import { connectAnimeEmbed, extractValidPlaybackProgress } from '../lib/animeembed'
import { getProgress, saveProgress } from '../lib/db'
import { useDialogFocus } from '../lib/useDialogFocus'

type Props = { anime: Anime | null; episode: number; stream: Stream; demo?: boolean; onClose: () => void }

export default function Player({ anime, episode, stream, demo = false, onClose }: Props) {
  const video = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [resumeAt, setResumeAt] = useState(0)
  const lastSave = useRef(0)
  const dialogRef = useDialogFocus()

  // Retrieve saved watch progress from IndexedDB
  useEffect(() => {
    let alive = true
    if (!demo && anime) {
      void getProgress(anime.id).then(value => {
        if (alive && value && value.episode === episode && value.seconds > 0) {
          setResumeAt(value.seconds)
        }
      }).catch(() => {})
    }
    return () => {
      alive = false
    }
  }, [anime, episode, demo])

  // Local HLS/MP4 video player setup
  useEffect(() => {
    const element = video.current
    if (!element || stream.format === 'embed') return
    let alive = true
    let hls: Hls | null = null
    setError('')
    setReady(false)

    if (stream.format === 'hls') {
      if (element.canPlayType('application/vnd.apple.mpegurl')) {
        element.src = stream.url
      } else {
        void import('hls.js').then(({ default: HlsClass }) => {
          if (!alive) return
          if (!HlsClass.isSupported()) {
            setError('Perangkat ini tidak mendukung HLS.')
            return
          }
          hls = new HlsClass({ enableWorker: true })
          hls.loadSource(stream.url)
          hls.attachMedia(element)
          hls.on(HlsClass.Events.ERROR, (_event, data) => {
            if (data.fatal && alive) setError(`HLS: ${data.details}`)
          })
        }).catch(() => {
          if (alive) setError('Modul HLS tidak dapat dimuat.')
        })
      }
    } else {
      element.src = stream.url
    }

    const onError = () => setError('Video tidak dapat dimuat. Periksa koneksi atau sumber stream.')
    element.addEventListener('error', onError)
    return () => {
      alive = false
      element.pause()
      element.removeEventListener('error', onError)
      hls?.destroy()
      element.removeAttribute('src')
      element.load()
    }
  }, [stream.url, stream.format])

  // Resume local video player when ready
  useEffect(() => {
    if (ready && resumeAt > 0 && video.current && video.current.duration > resumeAt + 3) {
      video.current.currentTime = resumeAt
    }
  }, [ready, resumeAt])

  // Save local playback progress
  const saveLocal = () => {
    if (demo || !anime || !video.current) return
    const v = video.current
    if (!Number.isFinite(v.currentTime) || v.currentTime < 0) return
    void saveProgress({
      anime,
      episode,
      seconds: v.currentTime,
      duration: Number.isFinite(v.duration) ? v.duration : 0,
      updatedAt: Date.now()
    }).catch(() => {})
  }

  // Construct iframe URL with resume parameter (?start=seconds)
  const resolvedEmbedUrl = useMemo(() => {
    if (stream.format !== 'embed') return stream.url
    try {
      const u = new URL(stream.url, window.location.href)
      if (resumeAt > 0 && !u.searchParams.has('start')) {
        u.searchParams.set('start', String(Math.floor(resumeAt)))
      }
      return u.toString()
    } catch {
      return stream.url
    }
  }, [stream.url, stream.format, resumeAt])

  // Connect to AnimeEmbed iframe postMessage events with strict security & schema validation
  useEffect(() => {
    if (stream.format !== 'embed' || demo || !anime) return
    const frame = iframeRef.current
    if (!frame) return

    const controller = connectAnimeEmbed(frame)
    const unsubscribe = controller.on(msg => {
      if (msg.event === 'progress' || msg.event === 'pause' || msg.event === 'ended') {
        const progress = extractValidPlaybackProgress(msg.data)
        if (!progress) return

        // Verify active episode identity before writing to IndexedDB
        if (!anime.id || typeof episode !== 'number') return

        const isTerminal = msg.event === 'pause' || msg.event === 'ended'
        const now = Date.now()
        if (isTerminal || now - lastSave.current > 5000) {
          lastSave.current = now
          void saveProgress({
            anime,
            episode,
            seconds: progress.currentTime,
            duration: progress.duration,
            updatedAt: now
          }).catch(() => {})
        }
      }
    })

    return () => {
      unsubscribe()
      controller.destroy()
    }
  }, [stream.format, demo, anime, episode])

  return (
    <div ref={dialogRef} tabIndex={-1} className="player-overlay" role="dialog" aria-modal="true" aria-label="Video player">
      <div className="player-top">
        <button type="button" className="icon-button glass" onClick={onClose} aria-label="Kembali">
          <ArrowLeft size={20} />
        </button>
        <div className="player-heading">
          <span>{demo ? 'PENGUJIAN PEMUTAR' : 'SEDANG MENONTON'}</span>
          <strong>{demo ? 'Sampel Pemutaran HLS' : anime?.title}</strong>
          <small>
            {demo
              ? 'Video lokal dengan subtitle Indonesia'
              : `Episode ${episode}${resumeAt > 0 ? ` · Melanjutkan dari ${Math.floor(resumeAt / 60)}m ${Math.floor(resumeAt % 60)}s` : ''}`}
          </small>
        </div>
        <div className="player-provider">{stream.providerId || 'Sumber default'}</div>
      </div>
      <div className="player-stage">
        {stream.format === 'embed' ? (
          <div className="embedded-source">
            <p className="embed-notice">
              Pemutar dari situs eksternal AnimeEmbed. Ketersediaan episode dan bahasa subtitle belum diverifikasi; progres tontonan tersimpan lokal otomatis ke browser.
            </p>
            <iframe
              ref={iframeRef}
              title={`External player · Episode ${episode}`}
              src={resolvedEmbedUrl}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              referrerPolicy="no-referrer"
              loading="eager"
            />
            <a href={resolvedEmbedUrl} target="_blank" rel="noopener noreferrer">
              Buka player eksternal jika iframe gagal
            </a>
          </div>
        ) : (
          <>
            {/* biome-ignore lint/a11y/useMediaCaption: Caption tracks are supplied dynamically from the active stream. */}
            <video
              ref={video}
              controls
              playsInline
              preload="metadata"
              crossOrigin="anonymous"
              onLoadedMetadata={() => {
                setReady(true)
                if (resumeAt > 0 && video.current && video.current.duration > resumeAt + 3) {
                  video.current.currentTime = resumeAt
                }
              }}
              onTimeUpdate={() => {
                if (Date.now() - lastSave.current > 6000) {
                  lastSave.current = Date.now()
                  saveLocal()
                }
              }}
              onPause={saveLocal}
              onEnded={saveLocal}
              autoPlay
            >
              {stream.tracks.map(t => (
                <track key={t.lang + t.url} kind="subtitles" srcLang={t.lang} label={t.label} src={t.url} default={t.lang === 'id'} />
              ))}
            </video>
            {!ready && !error && (
              <div className="player-loading">
                <MonitorPlay size={34} />
                <span>Menyiapkan pemutaran video…</span>
              </div>
            )}
            {error && (
              <div className="player-error">
                <AlertTriangle size={28} />
                <strong>Gagal memuat video</strong>
                <p>{error}</p>
              </div>
            )}
          </>
        )}
      </div>
      <div className="player-footer">
        <span>
          <Subtitles size={16} />{' '}
          {stream.format === 'embed'
            ? 'Subtitle English (bawaan AnimeEmbed)'
            : stream.subtitleMode === 'hard'
              ? 'Subtitle menyatu dengan video'
              : stream.tracks.length
                ? `${stream.tracks.length} track subtitle tersedia`
                : 'Subtitle tidak tersedia'}
        </span>
        <span>
          <Info size={16} />{' '}
          {demo
            ? 'Video sampel lokal dengan subtitle Indonesia.'
            : stream.format === 'embed'
              ? 'Progres tontonan tersimpan lokal di browser ini.'
              : 'Stream dikonfigurasi dari sumber lokal.'}
        </span>
      </div>
    </div>
  )
}
