import assert from 'node:assert/strict'
import {test} from 'node:test'
import {
 classifyProgressState,
 findAnimeProgress,
 isResumableProgress,
 resolveDetailResumeTarget,
} from '../frontend/src/lib/resume.ts'

test('classifyProgressState categorizes playback positions correctly', () => {
 assert.equal(classifyProgressState(null), 'NEVER_STARTED')
 assert.equal(classifyProgressState(undefined), 'NEVER_STARTED')
 assert.equal(classifyProgressState({ seconds: 0, duration: 120 }), 'NEVER_STARTED')
 assert.equal(classifyProgressState({ seconds: 0, duration: 0 }), 'NEVER_STARTED')

 // Invalid positions
 for (const seconds of [-1, -120, NaN, Infinity, -Infinity]) {
  assert.equal(classifyProgressState({ seconds, duration: 120 }), 'INVALID')
 }
 for (const duration of [-1, -120, NaN, Infinity, -Infinity]) {
  assert.equal(classifyProgressState({ seconds: 30, duration }), 'INVALID')
 }
 // Seconds exceeding known duration
 assert.equal(classifyProgressState({ seconds: 125, duration: 120 }), 'INVALID')

 // Resumable
 assert.equal(classifyProgressState({ seconds: 34, duration: 0 }), 'RESUMABLE')
 assert.equal(classifyProgressState({ seconds: 34, duration: 120 }), 'RESUMABLE')
 assert.equal(classifyProgressState({ seconds: 2, duration: 9 }), 'RESUMABLE')
 assert.equal(classifyProgressState({ seconds: 109, duration: 120 }), 'RESUMABLE')

 // Completed
 assert.equal(classifyProgressState({ seconds: 115, duration: 120 }), 'COMPLETED')
 assert.equal(classifyProgressState({ seconds: 8.9, duration: 9 }), 'COMPLETED')
})

test('short video is resumable until near completion instead of excluded by fixed 10s', () => {
 assert.equal(isResumableProgress({ seconds: 2, duration: 9 }), true)
 assert.equal(isResumableProgress({ seconds: 8.9, duration: 9 }), false)
})

test('progress requires meaningful nonzero position; duration may be unknown', () => {
 for (const seconds of [0, -1, NaN, Infinity]) {
  assert.equal(isResumableProgress({ seconds, duration: 120 }), false)
 }
 assert.equal(isResumableProgress({ seconds: 34, duration: 0 }), true)
 assert.equal(isResumableProgress({ seconds: 115, duration: 120 }), false)
 assert.equal(isResumableProgress({ seconds: 109, duration: 120 }), true)
})

test('invalid or non-seekable duration does not create a misleading resume target', () => {
 for (const duration of [-1, -120, NaN, Infinity, -Infinity]) {
  assert.equal(isResumableProgress({ seconds: 34, duration }), false, `invalid duration ${duration}`)
 }
 assert.equal(isResumableProgress({ seconds: 34, duration: 0 }), true)
 assert.equal(isResumableProgress({ seconds: 34, duration: 120 }), true)
})

const testAnime = {
 id: 'mal:42',
 malId: 42,
 title: 'Test Anime',
 englishTitle: null,
 japaneseTitle: null,
 poster: null,
 cover: null,
 synopsis: '',
 score: 8,
 episodes: 12,
 year: 2024,
 status: 'Finished Airing',
 type: 'TV',
 rating: 'PG-13',
 genres: ['Action'],
 studios: ['Studio A'],
 trailerYoutubeId: null,
}

test('findAnimeProgress matches by id or malId', () => {
 const progressList = [
  { anime: testAnime, episode: 3, seconds: 500, duration: 1400, updatedAt: 1 },
 ]
 assert.equal(findAnimeProgress(undefined, testAnime), null)
 assert.equal(findAnimeProgress([], testAnime), null)
 assert.equal(findAnimeProgress(progressList, testAnime)?.episode, 3)
 assert.equal(findAnimeProgress(progressList, { id: 'mal:99', malId: 42 })?.episode, 3)
 assert.equal(findAnimeProgress(progressList, { id: 'mal:99', malId: 99 }), null)
})

test('resolveDetailResumeTarget falls back to Episode 1 when no resumable progress exists', () => {
 const ep1 = { id: 'ep-1', animeId: 'mal:42', number: 1, title: 'Episode 1' }
 const ep2 = { id: 'ep-2', animeId: 'mal:42', number: 2, title: 'Episode 2' }
 const displayed = [ep1, ep2]

 // No progress
 const emptyResult = resolveDetailResumeTarget(displayed, [], testAnime)
 assert.equal(emptyResult.animeProgress, null)
 assert.equal(emptyResult.progressState, 'NEVER_STARTED')
 assert.equal(emptyResult.status, 'NEVER_STARTED')
 assert.equal(emptyResult.resumableProgress, null)
 assert.equal(emptyResult.targetEpisode?.number, 1)

 // Progress exists with seconds = 0 (never started)
 const zeroProgress = [
  { anime: testAnime, episode: 1, seconds: 0, duration: 1400, updatedAt: 1 },
 ]
 const zeroResult = resolveDetailResumeTarget(displayed, zeroProgress, testAnime)
 assert.equal(zeroResult.progressState, 'NEVER_STARTED')
 assert.equal(zeroResult.status, 'NEVER_STARTED')
 assert.equal(zeroResult.resumableProgress, null)
 assert.equal(zeroResult.targetEpisode?.number, 1)

 // Progress exists but completed
 const completedProgress = [
  { anime: testAnime, episode: 1, seconds: 1395, duration: 1400, updatedAt: 1 },
 ]
 const completedResult = resolveDetailResumeTarget(displayed, completedProgress, testAnime)
 assert.notEqual(completedResult.animeProgress, null)
 assert.equal(completedResult.progressState, 'COMPLETED')
 assert.equal(completedResult.status, 'COMPLETED')
 assert.equal(completedResult.resumableProgress, null)
 assert.equal(completedResult.targetEpisode?.number, 1)

 // Corrupt progress with negative seconds
 const invalidProgress = [
  { anime: testAnime, episode: 1, seconds: -10, duration: 1400, updatedAt: 1 },
 ]
 const invalidResult = resolveDetailResumeTarget(displayed, invalidProgress, testAnime)
 assert.equal(invalidResult.progressState, 'INVALID')
 assert.equal(invalidResult.status, 'INVALID')
 assert.equal(invalidResult.resumableProgress, null)
 assert.equal(invalidResult.targetEpisode?.number, 1)

 // Empty displayed list without progress
 const noEpisodes = resolveDetailResumeTarget([], [], testAnime)
 assert.equal(noEpisodes.targetEpisode, null)
})

test('resolveDetailResumeTarget targets existing episode when resumable progress exists', () => {
 const ep1 = { id: 'ep-1', animeId: 'mal:42', number: 1, title: 'Episode 1' }
 const ep2 = { id: 'ep-2', animeId: 'mal:42', number: 2, title: 'Episode 2' }
 const displayed = [ep1, ep2]

 const activeProgress = [
  { anime: testAnime, episode: 2, seconds: 400, duration: 1400, updatedAt: 1 },
 ]
 const result = resolveDetailResumeTarget(displayed, activeProgress, testAnime)
 assert.equal(result.progressState, 'RESUMABLE')
 assert.equal(result.status, 'RESUMABLE')
 assert.equal(result.resumableProgress?.episode, 2)
 assert.equal(result.targetEpisode?.id, 'ep-2')
 assert.equal(result.targetEpisode?.number, 2)
})

test('resolveDetailResumeTarget does NOT synthesize target episode if resumable episode is absent from displayed list', () => {
 const ep1 = { id: 'ep-1', animeId: 'mal:42', number: 1, title: 'Episode 1' }
 const displayed = [ep1]

 const activeProgress = [
  { anime: testAnime, episode: 99, seconds: 600, duration: 1400, updatedAt: 1 },
 ]
 const result = resolveDetailResumeTarget(displayed, activeProgress, testAnime)
 // Must NOT invent a fake Episode 99
 assert.equal(result.status, 'SOURCE_UNAVAILABLE')
 assert.equal(result.resumableProgress, null)
 assert.equal(result.targetEpisode?.number, 1)
})

test('resolveDetailResumeTarget verifies provider candidate availability when provided', () => {
 const ep1 = { id: 'ep-1', animeId: 'mal:42', number: 1, title: 'Episode 1' }
 const ep2 = { id: 'ep-2', animeId: 'mal:42', number: 2, title: 'Episode 2' }
 const displayed = [ep1, ep2]

 const activeProgress = [
  { anime: testAnime, episode: 2, seconds: 400, duration: 1400, updatedAt: 1 },
 ]

 // Candidate exists for Episode 2
 const candidateForEp2 = [{ id: 'cand-2', animeId: 'mal:42', number: 2, title: 'Ep 2', providerId: 'fixture' }]
 const res1 = resolveDetailResumeTarget(displayed, activeProgress, testAnime, candidateForEp2)
 assert.equal(res1.status, 'RESUMABLE')
 assert.equal(res1.resumableProgress?.episode, 2)
 assert.equal(res1.targetEpisode?.number, 2)

 // Only public-embed candidate exists for Episode 2 (disallowed per D02)
 const embedOnlyCandidate = [{ id: 'cand-2', animeId: 'mal:42', number: 2, title: 'Ep 2', providerId: 'public-embed' }]
 const resEmbed = resolveDetailResumeTarget(displayed, activeProgress, testAnime, embedOnlyCandidate)
 assert.equal(resEmbed.status, 'SOURCE_UNAVAILABLE')
 assert.equal(resEmbed.resumableProgress, null)
 assert.equal(resEmbed.targetEpisode?.number, 2)

 // Candidate exists only for Episode 1, not Episode 2
 const candidateForEp1Only = [{ id: 'cand-1', animeId: 'mal:42', number: 1, title: 'Ep 1', providerId: 'fixture' }]
 const res2 = resolveDetailResumeTarget(displayed, activeProgress, testAnime, candidateForEp1Only)
 assert.equal(res2.status, 'SOURCE_UNAVAILABLE')
 assert.equal(res2.resumableProgress, null)
 assert.equal(res2.targetEpisode?.number, 2)
})
