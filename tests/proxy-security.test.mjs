import test from 'node:test'
import assert from 'node:assert/strict'
import { Hono } from 'hono'
import {
  isPublicIPv4,
  isPublicHost,
  grantProxyStreamUrl,
  verifyProxyToken,
  rewriteM3u8Manifest,
  handleStreamProxy
} from '../backend/api/proxy.ts'

test('rejects private, reserved and documentation IPv4 addresses', () => {
  for (const host of ['127.0.0.1', '10.0.0.1', '169.254.10.1', '192.168.1.1',
    '100.100.1.1', '192.0.0.5', '198.18.0.1', '203.0.113.9']) {
    assert.equal(isPublicIPv4(host), false, host)
  }
  assert.equal(isPublicIPv4('8.8.8.8'), true)
})

test('literal IP and local names cannot become public upstreams', async () => {
  assert.equal(await isPublicHost('localhost'), false)
  assert.equal(await isPublicHost('127.0.0.1'), false)
  assert.equal(await isPublicHost('::1'), false)
  assert.equal(await isPublicHost('internal.local'), false)
})

test('proxy grant enforces expiry and rejects modified signature inputs', () => {
  const now = Date.now()
  const relative = grantProxyStreamUrl('https://example.invalid/seg.ts', {}, now)
  const q = new URL(relative, 'http://localhost').searchParams
  assert.equal(verifyProxyToken(q.get('url'), q.get('expires'), q.get('token'), '', now), true)
  assert.equal(verifyProxyToken('https://other.invalid/a', q.get('expires'), q.get('token'), '', now), false)
  assert.equal(verifyProxyToken(q.get('url'), q.get('expires'), q.get('token'), '', now + 3600_000), false)
})

test('HLS rewriting signs segments and nested key URIs', () => {
  const manifest = '#EXTM3U\n#EXT-X-KEY:METHOD=AES-128,URI="keys/key.bin"\nsegment.ts\n'
  const out = rewriteM3u8Manifest(manifest, 'https://example.invalid/playlist/main.m3u8', '')
  assert.match(out, /#EXT-X-KEY:METHOD=AES-128,URI="\/api\/proxy\/stream\?/)
  assert.match(out, /\n\/api\/proxy\/stream\?/)
})

test('unapproved target is denied before any upstream network request', async () => {
  const app = new Hono()
  app.get('/api/proxy/stream', handleStreamProxy)
  const path = grantProxyStreamUrl('https://malicious.invalid/stream.m3u8')
  const response = await app.request('http://localhost' + path)
  assert.equal(response.status, 403)
  assert.deepEqual(await response.json(), { error: 'SSRF_TARGET_REJECTED' })
})
