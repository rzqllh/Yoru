type CacheEntry = { value: number | null; expires: number }
const malToAniListCache = new Map<number, CacheEntry>()
const aniListToMalCache = new Map<number, CacheEntry>()

const TTL_MS = 6 * 60 * 60 * 1000 // 6 hours
const MAX_CACHE_SIZE = 2000
const REQUEST_TIMEOUT_MS = 7000

function isSafeId(id: unknown): id is number {
  return typeof id === 'number' && Number.isSafeInteger(id) && id > 0 && id < 100_000_000
}

export function parseCanonicalId(raw: unknown): { namespace: 'mal' | 'anilist'; numericId: number } | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  const match = /^(mal|anilist):([1-9]\d{0,7})$/.exec(trimmed)
  if (!match) return null
  const namespace = match[1] as 'mal' | 'anilist'
  const numericId = Number(match[2])
  if (!isSafeId(numericId)) return null
  return { namespace, numericId }
}

export function formatCanonicalId(namespace: 'mal' | 'anilist', numericId: number): string {
  if (!isSafeId(numericId)) throw new Error('Invalid numeric identity')
  return `${namespace}:${numericId}`
}

async function requestGraphQL(query: string, variables: Record<string, unknown>): Promise<unknown> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      signal: controller.signal,
      redirect: 'error',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    })
    if (!response.ok) return null
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('json')) return null
    const text = await response.text()
    if (text.length > 250_000) return null
    return JSON.parse(text)
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchAniListIdByMalId(malId: number): Promise<number | null> {
  if (!isSafeId(malId)) return null
  const cached = malToAniListCache.get(malId)
  if (cached && cached.expires > Date.now()) return cached.value

  const payload = await requestGraphQL(
    'query ($idMal: Int) { Media(idMal: $idMal, type: ANIME) { id idMal } }',
    { idMal: malId }
  )

  const media = (payload as { data?: { Media?: { id?: number; idMal?: number } } })?.data?.Media
  const aniId = isSafeId(media?.id) ? media.id : null

  if (malToAniListCache.size >= MAX_CACHE_SIZE) malToAniListCache.clear()
  malToAniListCache.set(malId, { value: aniId, expires: Date.now() + TTL_MS })

  if (aniId && isSafeId(media?.idMal)) {
    if (aniListToMalCache.size >= MAX_CACHE_SIZE) aniListToMalCache.clear()
    aniListToMalCache.set(aniId, { value: media.idMal, expires: Date.now() + TTL_MS })
  }

  return aniId
}

export async function fetchMalIdByAniListId(aniListId: number): Promise<number | null> {
  if (!isSafeId(aniListId)) return null
  const cached = aniListToMalCache.get(aniListId)
  if (cached && cached.expires > Date.now()) return cached.value

  const payload = await requestGraphQL(
    'query ($id: Int) { Media(id: $id, type: ANIME) { id idMal } }',
    { id: aniListId }
  )

  const media = (payload as { data?: { Media?: { id?: number; idMal?: number } } })?.data?.Media
  const malId = isSafeId(media?.idMal) ? media.idMal : null

  if (aniListToMalCache.size >= MAX_CACHE_SIZE) aniListToMalCache.clear()
  aniListToMalCache.set(aniListId, { value: malId, expires: Date.now() + TTL_MS })

  if (malId && isSafeId(media?.id)) {
    if (malToAniListCache.size >= MAX_CACHE_SIZE) malToAniListCache.clear()
    malToAniListCache.set(malId, { value: media.id, expires: Date.now() + TTL_MS })
  }

  return malId
}

export function clearIdMappingCache(): void {
  malToAniListCache.clear()
  aniListToMalCache.clear()
}
