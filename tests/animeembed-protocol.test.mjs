import test from 'node:test'
import assert from 'node:assert/strict'
import { animeEmbedUrl } from '../backend/providers/public-embed.ts'
import {
  ANIMEEMBED_ORIGIN,
  isValidAnimeEmbedMessage,
  extractValidPlaybackProgress
} from '../frontend/src/lib/animeembed.ts'

test('animeEmbedUrl constructs valid URL with optional start parameter and accent', () => {
  // Baseline without options
  assert.equal(
    animeEmbedUrl(52991, 1),
    'https://www.animeembed.com/embed/mal/52991/1'
  )

  // With resume start in seconds
  assert.equal(
    animeEmbedUrl(52991, 1, { start: 145 }),
    'https://www.animeembed.com/embed/mal/52991/1?start=145'
  )

  // Floors floating point seconds
  assert.equal(
    animeEmbedUrl(52991, 1, { start: 89.9 }),
    'https://www.animeembed.com/embed/mal/52991/1?start=89'
  )

  // start = 0 does not append redundant query param
  assert.equal(
    animeEmbedUrl(52991, 1, { start: 0 }),
    'https://www.animeembed.com/embed/mal/52991/1'
  )

  // With accent color hex
  assert.equal(
    animeEmbedUrl(52991, 1, { accent: 'c6f56a' }),
    'https://www.animeembed.com/embed/mal/52991/1?accent=c6f56a'
  )

  // With hash prefix and uppercase
  assert.equal(
    animeEmbedUrl(52991, 1, { accent: '#C6F56A' }),
    'https://www.animeembed.com/embed/mal/52991/1?accent=c6f56a'
  )

  // Combined start and accent
  assert.equal(
    animeEmbedUrl(52991, 1, { start: 300, accent: 'c6f56a' }),
    'https://www.animeembed.com/embed/mal/52991/1?start=300&accent=c6f56a'
  )

  // Rejects invalid start values
  assert.throws(() => animeEmbedUrl(52991, 1, { start: -10 }), /Invalid start offset/)
  assert.throws(() => animeEmbedUrl(52991, 1, { start: Number.NaN }), /Invalid start offset/)
  assert.throws(() => animeEmbedUrl(52991, 1, { start: 9999999 }), /Invalid start offset/)
})

test('isValidAnimeEmbedMessage strictly verifies origin, source window, channel, and version', () => {
  const fakeWindow = {}

  // Valid message
  const validEvent = {
    origin: ANIMEEMBED_ORIGIN,
    source: fakeWindow,
    data: {
      channel: 'animeembed',
      version: 1,
      event: 'progress',
      data: { currentTime: 42, duration: 1420 }
    }
  }
  assert.equal(isValidAnimeEmbedMessage(validEvent, fakeWindow), true)

  // Untrusted origin rejected
  assert.equal(
    isValidAnimeEmbedMessage({ ...validEvent, origin: 'https://evil-site.com' }, fakeWindow),
    false
  )
  assert.equal(
    isValidAnimeEmbedMessage({ ...validEvent, origin: 'http://www.animeembed.com' }, fakeWindow),
    false
  )

  // Source window mismatch rejected
  const otherWindow = {}
  assert.equal(isValidAnimeEmbedMessage(validEvent, otherWindow), false)

  // Wrong channel rejected
  assert.equal(
    isValidAnimeEmbedMessage(
      { ...validEvent, data: { ...validEvent.data, channel: 'other-player' } },
      fakeWindow
    ),
    false
  )

  // Wrong version rejected
  assert.equal(
    isValidAnimeEmbedMessage(
      { ...validEvent, data: { ...validEvent.data, version: 2 } },
      fakeWindow
    ),
    false
  )

  // Non-object or missing payload rejected
  assert.equal(isValidAnimeEmbedMessage({ ...validEvent, data: 'string-message' }, fakeWindow), false)
  assert.equal(isValidAnimeEmbedMessage({ ...validEvent, data: null }, fakeWindow), false)
})

test('extractValidPlaybackProgress validates schema and normalizes timestamps', () => {
  // Valid progress
  const valid = extractValidPlaybackProgress({ currentTime: 125.5, duration: 1420 })
  assert.deepEqual(valid, { currentTime: 125.5, duration: 1420 })

  // Missing duration defaults to 0
  const noDuration = extractValidPlaybackProgress({ currentTime: 50 })
  assert.deepEqual(noDuration, { currentTime: 50, duration: 0 })

  // Invalid / negative / NaN currentTime returns null
  assert.equal(extractValidPlaybackProgress({ currentTime: -5, duration: 100 }), null)
  assert.equal(extractValidPlaybackProgress({ currentTime: Number.NaN, duration: 100 }), null)
  assert.equal(extractValidPlaybackProgress({ currentTime: 'invalid', duration: 100 }), null)
  assert.equal(extractValidPlaybackProgress({ currentTime: 700000, duration: 100 }), null) // > 1 week
  assert.equal(extractValidPlaybackProgress(null), null)
  assert.equal(extractValidPlaybackProgress(undefined), null)

  // Negative duration is normalized to 0
  const negativeDuration = extractValidPlaybackProgress({ currentTime: 10, duration: -100 })
  assert.deepEqual(negativeDuration, { currentTime: 10, duration: 0 })
})
