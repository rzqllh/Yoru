import test from 'node:test'
import assert from 'node:assert/strict'
import {
  parseIndoEpisodes,
  parseIndoStreams,
  indonesiaBase
} from '../backend/providers/indonesia.ts'
import {
  grantProxyStreamUrl,
  verifyProxyToken,
  isPublicHost,
  rewriteM3u8Manifest,
  handleStreamProxy
} from '../backend/api/proxy.ts'
import { combineProviderResults } from '../backend/pipeline/provider-aggregation.ts'
import { readFileSync } from 'node:fs'

const fixtures = JSON.parse(
  readFileSync(new URL('./fixtures/aggregator-episodes.json', import.meta.url), 'utf8')
)

test('parseIndoEpisodes parses Sanka/Otakudesu normalized episodes correctly', () => {
  const episodes = parseIndoEpisodes(
    { data: fixtures.attackOnTitan.indoEpisodes },
    fixtures.attackOnTitan.malId
  )
  assert.equal(episodes.length, 2)
  assert.equal(episodes[0].id, 'indo-otakudesu:16498:1')
  assert.equal(episodes[0].animeId, 'mal:16498')
  assert.equal(episodes[0].number, 1)
  assert.equal(episodes[0].title, 'Untukmu, 2000 Tahun dari Sekarang')
  assert.equal(episodes[0].providerId, 'indo-otakudesu')
})

test('parseIndoEpisodes rejects non-integer or out-of-range episodes', () => {
  const input = {
    episodes: [
      { number: 0, title: 'Episode 0' },
      { number: -1, title: 'Episode -1' },
      { number: 'invalid', title: 'Invalid' },
      { number: 2001, title: 'Too large' },
      { number: 1, title: 'Valid Episode 1' },
      { number: 1, title: 'Duplicate Episode 1' }
    ]
  }
  const episodes = parseIndoEpisodes(input, 16498)
  assert.equal(episodes.length, 1)
  assert.equal(episodes[0].number, 1)
})

test('parseIndoStreams extracts HLS/MP4 streams with D01 hardsub warning for Indonesian releases', () => {
  const streams = parseIndoStreams(
    { streams: fixtures.attackOnTitan.indoStreams },
    16498,
    1
  )
  assert.equal(streams.length, 2)
  assert.equal(streams[0].format, 'hls')
  assert.equal(streams[0].url, 'https://cdn.example-indo.com/hls/aot-01.m3u8')
  assert.equal(streams[0].subtitleMode, 'hard')
  assert.equal(
    streams[0].hardsubWarning,
    'Subtitle Indonesia sudah menyatu di dalam video (hardsub fansub).'
  )
  assert.equal(streams[1].format, 'mp4')
  assert.equal(streams[1].url, 'https://cdn.example-indo.com/mp4/aot-01.mp4')
})

test('parseIndoStreams correctly attaches softsub VTT track when subtitleMode is soft', () => {
  const streams = parseIndoStreams(
    { streams: fixtures.frieren.indoStreams },
    52991,
    1
  )
  assert.equal(streams.length, 1)
  assert.equal(streams[0].subtitleMode, 'soft')
  assert.equal(streams[0].tracks.length, 1)
  assert.equal(streams[0].tracks[0].lang, 'id')
  assert.equal(streams[0].tracks[0].label, 'Indonesian')
  assert.equal(
    streams[0].tracks[0].url,
    'https://cdn.example-indo.com/sub/frieren-01-id.vtt'
  )
})

test('indonesiaBase strictly validates HTTPS URL without query, hash or port', () => {
  const original = process.env.INDONESIA_API_BASE
  try {
    delete process.env.INDONESIA_API_BASE
    delete process.env.SANKA_API_BASE
    assert.equal(indonesiaBase(), null)

    process.env.INDONESIA_API_BASE = 'http://insecure.com'
    assert.equal(indonesiaBase(), null)

    process.env.INDONESIA_API_BASE = 'https://api.fansubindo.org'
    assert.equal(indonesiaBase(), 'https://api.fansubindo.org')

    process.env.INDONESIA_API_BASE = 'https://valid-api.example.com'
    assert.equal(indonesiaBase(), null) // example.com dummy domain is blocked

    process.env.INDONESIA_API_BASE = 'https://valid-api.example.com:8443'
    assert.equal(indonesiaBase(), null)

    process.env.INDONESIA_API_BASE = 'https://valid-api.example.com/api?key=1'
    assert.equal(indonesiaBase(), null)
  } finally {
    if (original !== undefined) process.env.INDONESIA_API_BASE = original
    else delete process.env.INDONESIA_API_BASE
  }
})

test('combineProviderResults safely isolates Indonesian provider failures from healthy peers', () => {
  const settled = [
    { status: 'fulfilled', value: [{ id: 'local:1:1' }] },
    { status: 'fulfilled', value: [{ id: 'stremio:1:1' }] },
    { status: 'rejected', reason: new Error('Aggregator connection timeout') },
    { status: 'rejected', reason: new Error('Indo scraper layout changed') }
  ]
  const labels = ['local', 'stremio', 'miruro', 'indonesia']
  const res = combineProviderResults(settled, labels)

  assert.equal(res.items.length, 2)
  assert.deepEqual(res.warnings, ['miruro', 'indonesia'])
  assert.equal(res.allFailed, false)
})

test('grantProxyStreamUrl creates valid verifiable token with TTL', () => {
  const now = 1700000000000
  const url = 'https://cdn.example.com/video/master.m3u8'
  const referer = 'https://megacloud.tv/'
  const proxyUrl = grantProxyStreamUrl(url, { referer }, now)

  const parsed = new URL(proxyUrl, 'https://yoru.local')
  assert.equal(parsed.pathname, '/api/proxy/stream')
  assert.equal(parsed.searchParams.get('url'), url)
  assert.equal(parsed.searchParams.get('referer'), referer)

  const expires = parsed.searchParams.get('expires')
  const token = parsed.searchParams.get('token')
  assert.ok(expires)
  assert.ok(token)

  assert.equal(verifyProxyToken(url, expires, token, referer, now), true)
  // Rejects when expired
  assert.equal(
    verifyProxyToken(url, expires, token, referer, now + 6 * 60 * 1000 + 70000),
    false
  )
  // Rejects tampered URL
  assert.equal(
    verifyProxyToken(
      'https://cdn.example.com/tampered.m3u8',
      expires,
      token,
      referer,
      now
    ),
    false
  )
  // Rejects tampered referer
  assert.equal(
    verifyProxyToken(url, expires, token, 'https://evil.com', now),
    false
  )
})

test('isPublicHost rejects loopback, private IPv4, and internal domains to prevent SSRF', async () => {
  assert.equal(await isPublicHost('localhost'), false)
  assert.equal(await isPublicHost('127.0.0.1'), false)
  assert.equal(await isPublicHost('10.0.0.1'), false)
  assert.equal(await isPublicHost('192.168.1.1'), false)
  assert.equal(await isPublicHost('172.16.0.1'), false)
  assert.equal(await isPublicHost('169.254.169.254'), false)
  assert.equal(await isPublicHost('service.local'), false)
  assert.equal(await isPublicHost('internal.service.invalid'), false)
  // Direct IP literals must not bypass hostname allowlisting and TLS validation.
  assert.equal(await isPublicHost('8.8.8.8'), false)
  assert.equal(await isPublicHost('1.1.1.1'), false)
})

test('rewriteM3u8Manifest rewrites segment URLs to signed proxy URLs', () => {
  const originalManifest = [
    '#EXTM3U',
    '#EXT-X-VERSION:3',
    '#EXT-X-TARGETDURATION:10',
    '#EXTINF:10.0,',
    'segment001.ts',
    '#EXTINF:10.0,',
    'https://cdn.example.com/segment002.ts'
  ].join('\n')

  const baseUrl = 'https://cdn.example.com/hls/master.m3u8'
  const referer = 'https://megacloud.tv/'
  const rewritten = rewriteM3u8Manifest(originalManifest, baseUrl, referer, 1700000000000)

  const lines = rewritten.split('\n')
  assert.equal(lines[0], '#EXTM3U')
  assert.ok(lines[4].startsWith('/api/proxy/stream?url='))
  assert.ok(lines[4].includes('segment001.ts'))
  assert.ok(lines[6].startsWith('/api/proxy/stream?url='))
  assert.ok(lines[6].includes('segment002.ts'))
})

test('handleStreamProxy rejects unauthenticated or missing token requests', async () => {
  const mockContext = (query) => {
    let responseStatus = 200
    let responseJson = null
    return {
      c: {
        req: { query: (k) => query[k] || '' },
        json: (data, status = 200) => {
          responseStatus = status
          responseJson = data
          return new Response(JSON.stringify(data), { status })
        }
      },
      getStatus: () => responseStatus,
      getJson: () => responseJson
    }
  }

  const ctx1 = mockContext({})
  await handleStreamProxy(ctx1.c)
  assert.equal(ctx1.getStatus(), 400)
  assert.equal(ctx1.getJson().error, 'INVALID_PROXY_REQUEST')

  const ctx2 = mockContext({
    url: 'https://example.com/video.mp4',
    expires: '1700000000000',
    token: '0000000000000000000000000000000000000000000000000000000000000000'
  })
  await handleStreamProxy(ctx2.c)
  assert.equal(ctx2.getStatus(), 403)
  assert.equal(ctx2.getJson().error, 'INVALID_OR_EXPIRED_PROXY_GRANT')
})
