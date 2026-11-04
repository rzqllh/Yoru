/**
 * HMAC-Signed SSRF-Hardened Stream Proxy.
 * Relays HLS/MP4 streams that require specific Referer/Origin headers.
 * Protects against SSRF with DNS pinning, loopback/private IP blocking, and short TTL tokens.
 */
import type { Context } from 'hono'
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { lookup } from 'node:dns/promises'

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

export async function isPublicHost(hostname: string): Promise<boolean> {
  if (
    !hostname ||
    hostname === 'localhost' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.invalid')
  ) {
    return false
  }

  // If already an IPv4 literal
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    return isPublicIPv4(hostname)
  }

  try {
    const res = await lookup(hostname, { all: true })
    if (!res || res.length === 0) return false
    for (const record of res) {
      if (record.family === 4) {
        if (!isPublicIPv4(record.address)) return false
      } else if (record.family === 6) {
        const addr = record.address.toLowerCase()
        if (
          addr === '::1' ||
          addr.startsWith('fe80:') ||
          addr.startsWith('fc') ||
          addr.startsWith('fd')
        ) {
          return false
        }
      }
    }
    return true
  } catch {
    return false
  }
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

  if (!urlParam || !expires || !token) {
    return c.json({ error: 'INVALID_PROXY_REQUEST' }, 400)
  }

  if (!verifyProxyToken(urlParam, expires, token, referer)) {
    return c.json({ error: 'INVALID_OR_EXPIRED_PROXY_GRANT' }, 403)
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(urlParam)
    if (parsedUrl.protocol !== 'https:' || parsedUrl.username || parsedUrl.password) {
      return c.json({ error: 'UNSUPPORTED_PROXY_PROTOCOL' }, 400)
    }
  } catch {
    return c.json({ error: 'INVALID_PROXY_URL' }, 400)
  }

  const isSafe = await isPublicHost(parsedUrl.hostname)
  if (!isSafe) {
    return c.json({ error: 'SSRF_TARGET_REJECTED' }, 403)
  }

  const headers: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
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
      // ignore invalid referer
    }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 12000)

  try {
    const upstream = await fetch(parsedUrl.toString(), {
      headers,
      signal: controller.signal,
      redirect: 'follow'
    })

    if (!upstream.ok) {
      return c.json(
        { error: 'UPSTREAM_PROXY_ERROR', status: upstream.status },
        upstream.status >= 500 ? 502 : 500
      )
    }

    const contentType = upstream.headers.get('content-type') || ''
    const isM3u8 =
      parsedUrl.pathname.endsWith('.m3u8') ||
      contentType.includes('application/vnd.apple.mpegurl') ||
      contentType.includes('application/x-mpegurl')

    if (isM3u8) {
      const manifestText = await upstream.text()
      const rewritten = rewriteM3u8Manifest(manifestText, parsedUrl.toString(), referer)
      return new Response(rewritten, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'private, no-cache, no-store, max-age=0'
        }
      })
    }

    // Binary segment or MP4
    const responseHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff'
    }
    if (contentType) responseHeaders['Content-Type'] = contentType
    const contentLength = upstream.headers.get('content-length')
    if (contentLength) responseHeaders['Content-Length'] = contentLength

    return new Response(upstream.body, {
      status: 200,
      headers: responseHeaders
    })
  } catch {
    return c.json({ error: 'UPSTREAM_FETCH_FAILED' }, 502)
  } finally {
    clearTimeout(timer)
  }
}
