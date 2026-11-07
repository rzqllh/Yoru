/**
 * HMAC-Signed SSRF-Hardened Stream Proxy.
 * Relays HLS/MP4 streams that require specific Referer/Origin headers.
 * Only explicitly authorized HTTPS hosts may be relayed. DNS is pinned to the TLS connection;
 * redirects and private IP literals are rejected. Not an authorization bypass for upstream media.
 */
import type { Context } from 'hono'
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { lookup } from 'node:dns/promises'
import { request as httpsRequest } from 'node:https'
import { isIP } from 'node:net'
import { Readable, Transform } from 'node:stream'
import type { IncomingMessage } from 'node:http'

export function isPublicIPv4(value: string): boolean {
  const parts = value.split('.')
  if (parts.length !== 4 || !parts.every(p => /^\d{1,3}$/.test(p) && Number(p) <= 255))
    return false
  const [a, b, c] = parts.map(Number)
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false
  if (a === 100 && b >= 64 && b <= 127) return false
  if (a === 169 && b === 254) return false
  if (a === 172 && b >= 16 && b <= 31) return false
  if (a === 192 && (b === 168 || (b === 0 && c === 0) || (b === 0 && c === 2))) return false
  if (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) return false
  if (a === 203 && b === 0 && c === 113) return false
  if (a === 192 && b === 0 && c === 0) return false
  if (a === 192 && b === 88 && c === 99) return false
  return true
}

const proxySecret =
  process.env.STREAM_PROXY_SECRET ||
  process.env.YORU_SUBTITLE_SIGNING_SECRET ||
  randomBytes(32).toString('hex')

const PROXY_TTL_MS = 5 * 60 * 1000 // 5 minutes

function signature(url: string, referer: string, expires: string): string {
  return createHmac('sha256', proxySecret)
    .update(JSON.stringify([url, referer, expires]))
    .digest('hex')
}

export function grantProxyStreamUrl(
  targetUrl: string,
  options: { referer?: string } = {},
  now = Date.now()
): string {
  const referer = options.referer || ''
  const expires = String(now + PROXY_TTL_MS)
  const token = signature(targetUrl, referer, expires)

  const params = new URLSearchParams({
    url: targetUrl,
    expires,
    token
  })
  if (referer) params.set('referer', referer)
  return `/api/proxy/stream?${params.toString()}`
}

export function verifyProxyToken(
  url: string,
  expires: string,
  token: string,
  referer = '',
  now = Date.now()
): boolean {
  if (
    !url ||
    url.length > 2048 ||
    !/^[1-9]\d{12}$/.test(expires) ||
    !/^[a-f0-9]{64}$/.test(token)
  ) {
    return false
  }

  const expTime = Number(expires)
  if (expTime < now || expTime > now + PROXY_TTL_MS + 60000) {
    return false
  }

  const expected = Buffer.from(signature(url, referer, expires), 'hex')
  const actual = Buffer.from(token, 'hex')
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

// No implicit public relay: a reviewed, exact host allowlist must be configured.
// Only IPv4 connections are supported here; IPv6-only targets fail closed.
const approvedHosts = new Set(
  (process.env.STREAM_PROXY_ALLOWED_HOSTS || '')
    .split(',')
    .map(host => host.trim().toLowerCase())
    .filter(host => /^[a-z0-9.-]+$/.test(host) && host.length > 0)
)
const MAX_MANIFEST_BYTES = 1024 * 1024
const MAX_STREAM_BYTES = 128 * 1024 * 1024
type PinnedAddress = { address: string; family: 4 }

async function selectPinnedPublicAddress(hostname: string): Promise<PinnedAddress | null> {
  const host = hostname.toLowerCase()
  if (!approvedHosts.has(host) || isIP(host) !== 0 || host.endsWith('.local') ||
      host.endsWith('.internal') || host.endsWith('.localhost') || host === 'localhost') return null
  try {
    const records = await lookup(host, { all: true })
    const ipv4 = records.filter((record) => record.family === 4)
    if (!ipv4.length || ipv4.some(record => !isPublicIPv4(record.address))) return null
    return { address: ipv4[0].address, family: 4 }
  } catch {
    return null
  }
}

export async function isPublicHost(hostname: string): Promise<boolean> {
  return (await selectPinnedPublicAddress(hostname)) !== null
}

// HTTPS connects to a previously validated address while retaining the original
// hostname for TLS certificate verification/SNI. No automatic redirects.
async function requestPinned(url: URL, headers: Record<string, string>, pinned: PinnedAddress): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    const req = httpsRequest(url, {
      method: 'GET',
      headers,
      lookup: (_host, _options, callback) => callback(null, pinned.address, pinned.family)
    }, resolve)
    const timer = setTimeout(() => req.destroy(new Error('UPSTREAM_HEADER_TIMEOUT')), 12_000)
    req.once('response', () => clearTimeout(timer))
    req.once('error', error => {
      clearTimeout(timer)
      reject(error)
    })
    req.end()
  })
}

export function rewriteM3u8Manifest(
  manifest: string,
  baseUrl: string,
  referer: string,
  now = Date.now()
): string {
  const lines = manifest.split('\n')
  const base = new URL(baseUrl)
  const rewritten: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      rewritten.push(line)
      continue
    }

    if (trimmed.startsWith('#')) {
      // Check for URI in tags like #EXT-X-KEY:METHOD=...,URI="..."
      if (trimmed.includes('URI="')) {
        const tagRewritten = trimmed.replace(/URI="([^"]+)"/, (_, uri) => {
          try {
            const absolute = new URL(uri, base).toString()
            return `URI="${grantProxyStreamUrl(absolute, { referer }, now)}"`
          } catch {
            return `URI="${uri}"`
          }
        })
        rewritten.push(tagRewritten)
      } else {
        rewritten.push(line)
      }
    } else {
      // Media segment line or playlist URI
      try {
        const absolute = new URL(trimmed, base).toString()
        rewritten.push(grantProxyStreamUrl(absolute, { referer }, now))
      } catch {
        rewritten.push(line)
      }
    }
  }

  return rewritten.join('\n')
}

export async function handleStreamProxy(c: Context): Promise<Response> {
  const urlParam = c.req.query('url') || ''
  const expires = c.req.query('expires') || ''
  const token = c.req.query('token') || ''
  const referer = c.req.query('referer') || ''

  if (!urlParam || !expires || !token) return c.json({ error: 'INVALID_PROXY_REQUEST' }, 400)
  if (!verifyProxyToken(urlParam, expires, token, referer)) {
    return c.json({ error: 'INVALID_OR_EXPIRED_PROXY_GRANT' }, 403)
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(urlParam)
    if (parsedUrl.protocol !== 'https:' || parsedUrl.username || parsedUrl.password ||
        (parsedUrl.port && parsedUrl.port !== '443')) {
      return c.json({ error: 'UNSUPPORTED_PROXY_PROTOCOL' }, 400)
    }
  } catch {
    return c.json({ error: 'INVALID_PROXY_URL' }, 400)
  }

  const pinned = await selectPinnedPublicAddress(parsedUrl.hostname)
  if (!pinned) return c.json({ error: 'SSRF_TARGET_REJECTED' }, 403)

  const headers: Record<string, string> = {
    'User-Agent': 'Yoru-Verified-Stream-Client/1.0',
    Accept: '*/*'
  }
  if (referer) {
    try {
      const refUrl = new URL(referer)
      if (refUrl.protocol === 'https:') {
        headers.Referer = referer
        headers.Origin = refUrl.origin
      }
    } catch {
      return c.json({ error: 'INVALID_REFERER' }, 400)
    }
  }
  const range = c.req.header('range')
  if (range) {
    if (!/^bytes=\d+-\d*$/.test(range)) return c.json({ error: 'INVALID_RANGE' }, 416)
    headers.Range = range
  }

  try {
    const upstream = await requestPinned(parsedUrl, headers, pinned)
    const status = upstream.statusCode || 502
    if (status < 200 || status > 299) {
      // In particular, fail closed on Location redirects (no redirect chaining).
      upstream.destroy()
      return c.json({ error: status >= 300 && status < 400 ? 'UPSTREAM_REDIRECT_BLOCKED' : 'UPSTREAM_PROXY_ERROR' }, 502)
    }

    const contentType = String(upstream.headers['content-type'] || '')
    const isM3u8 = parsedUrl.pathname.endsWith('.m3u8') ||
      contentType.includes('application/vnd.apple.mpegurl') ||
      contentType.includes('application/x-mpegurl')

    if (isM3u8) {
      const chunks: Buffer[] = []
      let length = 0
      for await (const chunk of upstream) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
        length += buf.length
        if (length > MAX_MANIFEST_BYTES) {
          upstream.destroy()
          return c.json({ error: 'MANIFEST_TOO_LARGE' }, 413)
        }
        chunks.push(buf)
      }
      return new Response(
        rewriteM3u8Manifest(Buffer.concat(chunks).toString('utf8'), parsedUrl.toString(), referer),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/vnd.apple.mpegurl',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'private, no-store',
            'X-Content-Type-Options': 'nosniff'
          }
        }
      )
    }

    const advertisedLength = Number(upstream.headers['content-length'] || 0)
    if (!Number.isFinite(advertisedLength) || advertisedLength > MAX_STREAM_BYTES) {
      upstream.destroy()
      return c.json({ error: 'UPSTREAM_BODY_TOO_LARGE' }, 413)
    }

    let streamed = 0
    const bounded = new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        streamed += chunk.length
        if (streamed > MAX_STREAM_BYTES) {
          callback(new Error('UPSTREAM_BODY_TOO_LARGE'))
        } else {
          callback(null, chunk)
        }
      }
    })
    upstream.pipe(bounded)
    const outHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff'
    }
    if (contentType) outHeaders['Content-Type'] = contentType
    if (upstream.headers['content-length']) outHeaders['Content-Length'] = String(upstream.headers['content-length'])
    if (upstream.headers['content-range']) outHeaders['Content-Range'] = String(upstream.headers['content-range'])
    if (upstream.headers['accept-ranges']) outHeaders['Accept-Ranges'] = String(upstream.headers['accept-ranges'])

    return new Response(Readable.toWeb(bounded) as ReadableStream<Uint8Array>, {
      status: status === 206 ? 206 : 200,
      headers: outHeaders
    })
  } catch {
    return c.json({ error: 'UPSTREAM_FETCH_FAILED' }, 502)
  }
}
