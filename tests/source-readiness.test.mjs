import assert from 'node:assert/strict'
import {test} from 'node:test'
import {isNativeCandidate,verifyNativeSource} from '../frontend/src/lib/source-readiness.ts'

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

test('native media preflight refuses private and special-purpose IP hosts',()=>{
 for(const host of ['0.0.0.0','172.20.1.5','169.254.169.254','100.100.100.100','127.0.0.2','192.168.1.15','[::1]','[fe80::1]']){
  assert.equal(isNativeCandidate({...candidate,url:`https://${host}/watch/master.m3u8`}),false,`must reject ${host}`)
 }
})

test('native media preflight refuses internal DNS names and trailing-dot localhost',()=>{
 for(const host of ['localhost.','media.local','nas.internal','device.lan','media.localhost','intranet']){
  assert.equal(isNativeCandidate({...candidate,url:`https://${host}/watch/master.m3u8`}),false,`must reject ${host}`)
 }
 assert.equal(isNativeCandidate({...candidate,url:'https://video.example.org/ep1.m3u8'}),true)
})

test('malformed provider URL fields fail closed instead of throwing',async()=>{
 for(const url of [null,undefined,0,false,{},['https://cdn.example.com/watch/master.m3u8']]){
  const malformed={...candidate,url}
  assert.equal(isNativeCandidate(malformed),false)
  await assert.rejects(verifyNativeSource(malformed),/Format atau URL sumber tidak didukung/)
 }
 assert.equal(isNativeCandidate(null),false)
 assert.equal(isNativeCandidate(undefined),false)
 assert.equal(isNativeCandidate('https://cdn.example.com/watch/master.m3u8'),false)
})

test('only the shipped demo HLS fixture qualifies as a relative playable candidate',async()=>{
 assert.equal(isNativeCandidate({...candidate,url:'/demo/stream.m3u8'}),true)
 for(const url of ['/demo/missing.m3u8','/demo/clip.mp4','/demo/../api/health',
  '/demo/stream.m3u8?redirect=1','/demo/stream.m3u8#fragment']){
  const stream={...candidate,url}
  assert.equal(isNativeCandidate(stream),false,`unexpected demo candidate: ${url}`)
  await assert.rejects(verifyNativeSource(stream),/Format atau URL sumber tidak didukung/)
 }
 assert.equal(isNativeCandidate({...candidate,format:'mp4',url:'/demo/stream.m3u8'}),false)
})
