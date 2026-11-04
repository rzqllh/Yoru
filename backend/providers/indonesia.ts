/**
 * Indonesian Anime Provider Adapter (D01 priority).
 * Adapts Indonesian fansub catalogs (Otakudesu, Samehadaku, SankaApi).
 * Emits clean HLS/MP4 streams with Indonesian subtitles (hardsub / softsub).
 */
type RecordValue = Record<string, unknown>
const obj = (x: unknown): RecordValue | null =>
  x && typeof x === 'object' && !Array.isArray(x) ? (x as RecordValue) : null
const arr = (x: unknown): unknown[] => (Array.isArray(x) ? x : [])
const str = (x: unknown, max = 180) =>
  typeof x === 'string' ? x.trim().slice(0, max) : ''

export function indonesiaBase(): string | null {
  const raw = process.env.INDONESIA_API_BASE || process.env.SANKA_API_BASE
  if (!raw) return null
  try {
    const url = new URL(raw)
    const host = url.hostname.toLowerCase()
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.port ||
      url.search ||
      url.hash ||
      !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host) ||
      /\.(local|localhost|internal|invalid)$/.test(host) ||
      host === 'localhost' ||
      host.endsWith('.example.com') ||
      !['', '/'].includes(url.pathname)
    )
      return null
    return url.origin
  } catch {
    return null
  }
}

export const isIndonesiaConfigured = () => indonesiaBase() !== null

const timeout = 7000
async function readJson(url: string, options: RequestInit = {}): Promise<unknown> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      redirect: 'error',
      headers: { Accept: 'application/json', ...options.headers }
    })
    if (!response.ok) throw new Error('INDONESIA_UPSTREAM_UNAVAILABLE')
    if (!(response.headers.get('content-type') || '').includes('json'))
      throw new Error('INVALID_INDONESIA_RESPONSE')
    const body = await response.text()
    if (body.length > 750000) throw new Error('INDONESIA_RESPONSE_TOO_LARGE')
    return JSON.parse(body) as unknown
  } finally {
    clearTimeout(timer)
  }
}

export type IndoEpisode = {
  id: string
  animeId: string
  number: number
  title: string
  providerId: string
}

export type IndoStream = {
  id: string
  format: 'hls' | 'mp4'
  url: string
  subtitleMode: 'hard' | 'soft' | 'unknown'
  tracks: { lang: string; label: string; url: string }[]
  quality?: string
  providerId: string
  hardsubWarning?: string
}

function mediaUrl(input: unknown, format: 'hls' | 'mp4'): string | null {
  try {
    const url = new URL(str(input, 2048))
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.port ||
      !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname) ||
      /\.(local|internal|invalid)$/.test(url.hostname) ||
      !(format === 'hls' ? /\.m3u8$/i.test(url.pathname) : /\.mp4$/i.test(url.pathname))
    )
      return null
    return url.toString()
  } catch {
    return null
  }
}

export function parseIndoEpisodes(payload: unknown, malId: number): IndoEpisode[] {
  const root = obj(payload)
  // Handles SankaApi shape { data: [...] } or { results: { episodes: [...] } }
  const rawList = arr(root?.data || obj(root?.results)?.episodes || root?.episodes)
  const out: IndoEpisode[] = []
  const seen = new Set<number>()

  for (const item of rawList.slice(0, 2000)) {
    const data = obj(item)
    const number = Number(data?.number ?? data?.episode)
    if (!Number.isSafeInteger(number) || number < 1 || number > 2000 || seen.has(number))
      continue
    seen.add(number)
    const title = str(data?.title, 110) || `Episode ${number}`
    out.push({
      id: `indo-otakudesu:${malId}:${number}`,
      animeId: `mal:${malId}`,
      number,
      title,
      providerId: 'indo-otakudesu'
    })
  }
  return out
}

export function parseIndoStreams(
  payload: unknown,
  malId: number,
  episode: number
): IndoStream[] {
  if (!Number.isSafeInteger(episode) || episode < 1 || episode > 2000) return []
  const root = obj(payload)
  const rawStreams = arr(root?.streams || obj(root?.data)?.streams || obj(root?.results)?.streams)
  const out: IndoStream[] = []

  let streamIndex = 0
  for (const raw of rawStreams.slice(0, 30)) {
    const entry = obj(raw)
    const typeStr = str(entry?.type || entry?.format, 10).toLowerCase()
    const format = typeStr === 'hls' ? 'hls' : typeStr === 'mp4' ? 'mp4' : null
    if (!format) continue
    const url = mediaUrl(entry?.url, format)
    if (!url) continue

    const quality = str(entry?.quality || entry?.resolution, 50) || undefined
    const isHardsub = entry?.subtitleMode !== 'soft'

    out.push({
      id: `indo-otakudesu:${malId}:${episode}:${streamIndex++}`,
      format,
      url,
      subtitleMode: isHardsub ? 'hard' : 'soft',
      tracks: isHardsub
        ? []
        : [
            {
              lang: 'id',
              label: 'Indonesian',
              url: str(entry?.subtitleUrl, 2048)
            }
          ].filter(t => t.url.startsWith('https://')),
      quality,
      providerId: 'indo-otakudesu',
      hardsubWarning: isHardsub
        ? 'Subtitle Indonesia sudah menyatu di dalam video (hardsub fansub).'
        : undefined
    })
  }
  return out
}

const episodeCache = new Map<number, { value: IndoEpisode[]; until: number }>()
const episodeInflight = new Map<number, Promise<IndoEpisode[]>>()

export async function getIndonesianEpisodes(
  malId: number,
  animeTitle?: string
): Promise<IndoEpisode[]> {
  const base = indonesiaBase()
  if (!base) return []
  const known = episodeCache.get(malId)
  if (known && known.until > Date.now()) return known.value

  const pending = episodeInflight.get(malId)
  if (pending) return pending

  const operation = (async () => {
    try {
      const searchParam = animeTitle ? `?title=${encodeURIComponent(animeTitle)}` : ''
      const data = await readJson(`${base}/api/indo/episodes/${malId}${searchParam}`)
      const episodes = parseIndoEpisodes(data, malId)
      if (episodeCache.size >= 1000) episodeCache.delete(episodeCache.keys().next().value ?? 0)
      episodeCache.set(malId, {
        value: episodes,
        until: Date.now() + (episodes.length ? 24 * 60 * 60 * 1000 : 30 * 60 * 1000)
      })
      return episodes
    } catch {
      return []
    } finally {
      episodeInflight.delete(malId)
    }
  })()

  episodeInflight.set(malId, operation)
  return operation
}

export async function getIndonesianStreams(ref: string): Promise<IndoStream[]> {
  const base = indonesiaBase()
  const match = /^indo-([a-z][a-z0-9-]{0,24}):([1-9]\d{0,8}):([1-9]\d{0,3})$/.exec(ref)
  if (!base || !match) return []
  const [, provider, malIdText, epText] = match
  const malId = Number(malIdText)
  const episode = Number(epText)
  if (episode > 2000) return []

  try {
    const data = await readJson(`${base}/api/indo/watch/${provider}/${malId}/${episode}`)
    return parseIndoStreams(data, malId, episode)
  } catch {
    return []
  }
}
