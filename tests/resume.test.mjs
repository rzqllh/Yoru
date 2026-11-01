import assert from 'node:assert/strict'
import {test} from 'node:test'
import {findAnimeProgress, isResumableProgress, resolveDetailResumeTarget} from '../frontend/src/lib/resume.ts'

test('short video is resumable until near completion instead of excluded by fixed 10s',()=>{
 assert.equal(isResumableProgress({seconds:2,duration:9}),true)
 assert.equal(isResumableProgress({seconds:8.9,duration:9}),false)
})
test('progress requires meaningful nonzero position; duration may be unknown',()=>{
 for(const seconds of [0,-1,NaN,Infinity])assert.equal(isResumableProgress({seconds,duration:120}),false)
 assert.equal(isResumableProgress({seconds:34,duration:0}),true)
 assert.equal(isResumableProgress({seconds:115,duration:120}),false)
 assert.equal(isResumableProgress({seconds:109,duration:120}),true)
})
test('invalid or non-seekable duration does not create a misleading resume target',()=>{
 for(const duration of [-1,-120,NaN,Infinity,-Infinity]){
  assert.equal(isResumableProgress({seconds:34,duration}),false,`invalid duration ${duration}`)
 }
 assert.equal(isResumableProgress({seconds:34,duration:0}),true)
 assert.equal(isResumableProgress({seconds:34,duration:120}),true)
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
 assert.equal(emptyResult.resumableProgress, null)
 assert.equal(emptyResult.targetEpisode?.number, 1)

 // Progress exists but completed
 const completedProgress = [
  { anime: testAnime, episode: 1, seconds: 1395, duration: 1400, updatedAt: 1 },
 ]
 const completedResult = resolveDetailResumeTarget(displayed, completedProgress, testAnime)
 assert.notEqual(completedResult.animeProgress, null)
 assert.equal(completedResult.resumableProgress, null)
 assert.equal(completedResult.targetEpisode?.number, 1)

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
 assert.equal(result.resumableProgress?.episode, 2)
 assert.equal(result.targetEpisode?.id, 'ep-2')
 assert.equal(result.targetEpisode?.number, 2)
})

test('resolveDetailResumeTarget synthesizes target episode if resumable episode not yet in displayed list', () => {
 const ep1 = { id: 'ep-1', animeId: 'mal:42', number: 1, title: 'Episode 1' }
 const displayed = [ep1]

 const activeProgress = [
  { anime: testAnime, episode: 5, seconds: 600, duration: 1400, updatedAt: 1 },
 ]
 const result = resolveDetailResumeTarget(displayed, activeProgress, testAnime)
 assert.equal(result.resumableProgress?.episode, 5)
 assert.equal(result.targetEpisode?.number, 5)
 assert.equal(result.targetEpisode?.title, 'Episode 5')
})

