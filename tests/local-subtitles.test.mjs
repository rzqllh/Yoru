import assert from 'node:assert/strict'
import {test} from 'node:test'
import {parseLocalSubtitle} from '../frontend/src/lib/local-subtitles.ts'

test('accepts valid SRT timestamps and yields WebVTT without file upload',()=>{
 const text='1\r\n00:00:01,200 --> 00:00:03,450\r\nHalo dunia\r\n\r\n2\r\n00:00:04,000 --> 00:00:06,000\r\nTerima kasih'
 const result=parseLocalSubtitle(text,'episode.srt',text.length)
 assert.match(result,/^WEBVTT\n\n/)
 assert.match(result,/00:00:01\.200 --> 00:00:03\.450/)
 assert.match(result,/Halo dunia/)
 assert.doesNotMatch(result,/00:00:01,200/)
})

test('allows native VTT and strips markup from cue payload',()=>{
 const src='WEBVTT\n\n00:00:01.000 --> 00:00:02.000\n<b>Halo</b> <script>alert(1)</script>'
 const result=parseLocalSubtitle(src,'subtitle.vtt',src.length)
 assert.match(result,/^WEBVTT\n\n/)
 assert.doesNotMatch(result,/<script>|<b>/)
 assert.match(result,/Halo/)
})

test('rejects oversize, unknown files and invalid subtitle timing',()=>{
 assert.throws(()=>parseLocalSubtitle('WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nHalo','large.vtt',500001),/SUBTITLE_TOO_LARGE/)
 assert.throws(()=>parseLocalSubtitle('WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nHalo','movie.mp4',50),/INVALID_SUBTITLE_TYPE/)
 assert.throws(()=>parseLocalSubtitle('random text','bad.srt',11),/INVALID_SUBTITLE_CONTENT/)
})
