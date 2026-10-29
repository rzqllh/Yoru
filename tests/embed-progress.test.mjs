import assert from 'node:assert/strict'
import { test } from 'node:test'
import { animeEmbedUrl, externalStream } from '../backend/providers/public-embed.ts'

test('animeEmbedUrl appends start timestamp parameter when positive', () => {
  assert.equal(animeEmbedUrl(52991, 1), 'https://www.animeembed.com/embed/mal/52991/1')
  assert.equal(animeEmbedUrl(52991, 1, 0), 'https://www.animeembed.com/embed/mal/52991/1')
  assert.equal(animeEmbedUrl(52991, 1, -10), 'https://www.animeembed.com/embed/mal/52991/1')
  assert.equal(animeEmbedUrl(52991, 1, 150), 'https://www.animeembed.com/embed/mal/52991/1?start=150')
  assert.equal(animeEmbedUrl(52991, 1, 150.7), 'https://www.animeembed.com/embed/mal/52991/1?start=150')
})

test('externalStream includes start timestamp query when startSeconds provided', () => {
  const streams = externalStream('public-embed:52991:1', 120)
  assert.equal(streams.length, 1)
  assert.equal(streams[0].format, 'embed')
  assert.equal(streams[0].url, 'https://www.animeembed.com/embed/mal/52991/1?start=120')
  assert.equal(streams[0].providerId, 'External embed (unverified)')
})
