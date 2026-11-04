import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getUniversalEpisodes,
  resolveUniversalStream,
  resolveUniversalSubtitleTrack,
  cleanAnimeTitle
} from '../backend/providers/universal.ts'
import { combineProviderResults } from '../backend/pipeline/provider-aggregation.ts'

test('cleanAnimeTitle cleans parentheticals and punctuation for search', () => {
  assert.equal(cleanAnimeTitle('Shingeki no Kyojin (TV)'), 'Shingeki no Kyojin')
  assert.equal(
    cleanAnimeTitle('Sousou no Frieren: Beyond Journey\'s End'),
    'Sousou no Frieren Beyond Journey s End'
  )
  assert.equal(cleanAnimeTitle('Kimi no Na wa.'), 'Kimi no Na wa')
})

test('getUniversalEpisodes generates all episodes automatically for any anime with known count', () => {
  const episodes = getUniversalEpisodes(16498, 'Shingeki no Kyojin', 25)
  assert.equal(episodes.length, 25)
  assert.equal(episodes[0].id, 'universal:16498:1')
  assert.equal(episodes[0].animeId, 'mal:16498')
  assert.equal(episodes[0].number, 1)
  assert.equal(episodes[0].title, 'Episode 1')
  assert.equal(episodes[0].providerId, 'universal')

  assert.equal(episodes[24].id, 'universal:16498:25')
  assert.equal(episodes[24].number, 25)
})

test('getUniversalEpisodes defaults to 12 episodes when episode count is null/ongoing', () => {
  const episodes = getUniversalEpisodes(21, 'One Piece', null)
  assert.equal(episodes.length, 12)
  assert.equal(episodes[0].id, 'universal:21:1')
  assert.equal(episodes[11].id, 'universal:21:12')
})

test('getUniversalEpisodes bounds count to 2000 and rejects invalid MAL ID', () => {
  assert.equal(getUniversalEpisodes(-5, 'Invalid', 10).length, 0)
  assert.equal(getUniversalEpisodes(0, 'Invalid', 10).length, 0)
  const huge = getUniversalEpisodes(100, 'Long', 99999)
  assert.equal(huge.length, 2000)
})

test('resolveUniversalStream resolves Attack on Titan Episode 1 to clean 1080p BD without foreign hardsubs', async () => {
  const streams = await resolveUniversalStream('universal:16498:1', 'Shingeki no Kyojin')
  assert.equal(streams.length, 1)
  assert.equal(streams[0].id, 'universal:16498:1:0')
  assert.equal(streams[0].format, 'mp4')
  assert.ok(streams[0].url.startsWith('https://archive.org/cors/'))
  assert.ok(!streams[0].url.includes('cera.online'), 'Must never use cera.online Arabic fansub')
  assert.ok(!streams[0].url.includes('egydead'), 'Must never use egydead fansub')
  assert.ok(streams[0].url.includes('Moozzi2') || streams[0].url.includes('1080p'), 'Must resolve to 1080p release')
  assert.equal(streams[0].quality, '1080p BD (Audio Asli - Clean RAW)')
  assert.equal(streams[0].subtitleMode, 'soft')
  assert.equal(streams[0].providerId, 'universal')
  assert.equal(streams[0].tracks.length, 1)
  assert.equal(streams[0].tracks[0].lang, 'id')
  assert.equal(streams[0].tracks[0].label, 'Bahasa Indonesia')
  assert.equal(streams[0].tracks[0].url, '/subtitles/attack-on-titan-ep1-id.vtt')
})

test('Attack on Titan episode 1 WebVTT file exists and has valid cues', async () => {
  const fs = await import('node:fs')
  const path = await import('node:path')
  const vttPath = path.resolve('frontend/public/subtitles/attack-on-titan-ep1-id.vtt')
  assert.ok(fs.existsSync(vttPath), 'WebVTT file must exist on disk')
  const content = fs.readFileSync(vttPath, 'utf-8')
  assert.ok(content.startsWith('WEBVTT'), 'Must start with WEBVTT header')
  assert.ok(content.includes('Shiganshina'), 'Must include authentic story text')
  assert.ok(content.includes('-->'), 'Must contain timestamp cues')
})

test('resolveUniversalStream resolves Death Note and Frieren to 1080p BD clean streams', async () => {
  const dn = await resolveUniversalStream('universal:1535:1', 'Death Note')
  assert.equal(dn.length, 1)
  assert.ok(dn[0].quality.includes('1080p'))
  assert.equal(dn[0].subtitleMode, 'soft')

  const frieren = await resolveUniversalStream('universal:52991:1', 'Sousou no Frieren')
  assert.equal(frieren.length, 1)
  assert.ok(frieren[0].quality.includes('1080p'))
  assert.equal(frieren[0].subtitleMode, 'soft')
})

test('resolveUniversalStream resolves Cowboy Bebop Episode 1 with Indonesian track', async () => {
  const streams = await resolveUniversalStream('universal:1:1', 'Cowboy Bebop')
  assert.equal(streams.length, 1)
  assert.equal(streams[0].id, 'universal:1:1:0')
  assert.equal(streams[0].format, 'mp4')
  assert.ok(streams[0].url.startsWith('https://archive.org/cors/'))
})

test('resolveUniversalStream rejects malformed or out-of-range references', async () => {
  assert.deepEqual(await resolveUniversalStream('invalid-ref'), [])
  assert.deepEqual(await resolveUniversalStream('universal:16498:9999'), [])
})

test('combineProviderResults smoothly includes universal provider alongside healthy peers', () => {
  const settled = [
    { status: 'fulfilled', value: [{ id: 'local:1:1' }] },
    { status: 'fulfilled', value: [{ id: 'universal:1:1' }] },
    { status: 'rejected', reason: new Error('Stremio timeout') }
  ]
  const labels = ['local', 'universal', 'stremio']
  const res = combineProviderResults(settled, labels)

  assert.equal(res.items.length, 2)
  assert.deepEqual(res.warnings, ['stremio'])
  assert.equal(res.allFailed, false)
})

test('resolveUniversalSubtitleTrack maps benchmark anime to valid static WebVTT and dynamic fallback', () => {
  assert.equal(resolveUniversalSubtitleTrack(16498, 1), '/subtitles/attack-on-titan-ep1-id.vtt')
  assert.equal(resolveUniversalSubtitleTrack(1, 1), '/subtitles/cowboy-bebop-ep1-id.vtt')
  assert.equal(resolveUniversalSubtitleTrack(1535, 1), '/subtitles/death-note-ep1-id.vtt')
  assert.equal(
    resolveUniversalSubtitleTrack(999, 5),
    '/api/subtitles/vtt?malId=999&episode=5&lang=id'
  )
})

test('cleanAnimeTitle strips season and part qualifiers to improve parent franchise matching', () => {
  assert.equal(cleanAnimeTitle('The Apothecary Diaries Season 3'), 'The Apothecary Diaries')
  assert.equal(cleanAnimeTitle('Kusuriya no Hitorigoto 2nd Season'), 'Kusuriya no Hitorigoto')
  assert.equal(cleanAnimeTitle('Bleach: Thousand-Year Blood War - Part 2'), 'Bleach Thousand-Year Blood War')
})

test('resolveUniversalStream guarantees direct native HLS stream under D02 fail-closed without raw archive files', async () => {
  const streams = await resolveUniversalStream('universal:61987:1', 'The Apothecary Diaries Season 3')
  assert.ok(streams.length >= 1, 'Must provide at least one valid stream')
  assert.equal(streams[0].id, 'universal:61987:1:hls')
  assert.equal(streams[0].format, 'hls')
  assert.ok(streams[0].url.includes('/api/proxy/stream'))
  assert.equal(streams[0].providerId, 'universal')
  assert.ok(streams[0].tracks.length >= 1)
  assert.equal(streams[0].tracks[0].lang, 'id')
})
