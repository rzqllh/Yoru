import assert from 'node:assert/strict'
import {test} from 'node:test'
import {isNativeCandidate} from '../frontend/src/lib/source-readiness.ts'

const candidate={format:'hls',url:'https://cdn.example.com/watch/master.m3u8',tracks:[],subtitleMode:'unknown'}
test('native availability never trusts an embed URL or invalid media reference',()=>{
 assert.equal(isNativeCandidate({...candidate,format:'embed'}),false)
 assert.equal(isNativeCandidate({...candidate,url:'http://cdn.example.com/a.m3u8'}),false)
 assert.equal(isNativeCandidate({...candidate,url:'https://127.0.0.1/a.m3u8'}),false)
 assert.equal(isNativeCandidate({...candidate,url:'https://cdn.example.com/stream.avi'}),false)
})
test('media candidates require actual browser verification later',()=>{
 assert.equal(isNativeCandidate(candidate),true)
 assert.equal(isNativeCandidate({...candidate,format:'mp4',url:'https://cdn.example.com/video.mp4'}),true)
 assert.equal(isNativeCandidate({...candidate,url:'/demo/stream.m3u8'}),true)
})
