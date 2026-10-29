/**
 * Cross-platform production smoke: exercised by Windows CI independently from
 * Linux build/browser jobs. No external provider credentials or network.
 */
import assert from 'node:assert/strict'
import {spawn} from 'node:child_process'

const port=18787
const root='http://127.0.0.1:'+port
const child=spawn(process.execPath,['backend/dist/api/server.js'],{
 cwd:process.cwd(),
 env:{...process.env,HOST:'127.0.0.1',PORT:String(port),NODE_ENV:'production'},
 stdio:['ignore','pipe','pipe'],
 windowsHide:true,
})
let output='',spawnError=null,exited=false
child.stdout.on('data',data=>{output+=String(data)})
child.stderr.on('data',data=>{output+=String(data)})
child.on('error',error=>{spawnError=error})
child.on('exit',()=>{exited=true})

const request=async(path)=>fetch(root+path,{signal:AbortSignal.timeout(3000),redirect:'error'})
const wait=(milliseconds)=>new Promise(resolve=>setTimeout(resolve,milliseconds))

try{
 let ready=false
 for(let attempt=0;attempt<35;attempt++){
  if(spawnError)throw spawnError
  if(exited)throw new Error('Yoru server exited before ready: '+output)
  try{
   const response=await request('/api/health')
   if(response.ok){ready=true;break}
  }catch{/* wait for server binding */}
  await wait(250)
 }
 assert.ok(ready,'Yoru server did not become healthy: '+output)

 const health=await request('/api/health')
 assert.equal(health.status,200)
 assert.equal((await health.json()).status,'ok')
 assert.equal(health.headers.get('x-content-type-options'),'nosniff')
 assert.equal(health.headers.get('x-frame-options'),'DENY')
 assert.equal(health.headers.get('cache-control'),'no-store')
 assert.match(health.headers.get('content-security-policy')||'',/frame-ancestors/)

 const html=await request('/')
 assert.equal(html.status,200)
 assert.match(await html.text(),/<div id="root"/)

 const manifest=await request('/demo/stream.m3u8')
 assert.equal(manifest.status,200)
 assert.match(await manifest.text(),/segment-000\.ts/)

 assert.equal((await request('/api/anime/search?q=')).status,400)
 assert.equal((await request('/api/streams?episodeRef=bad')).status,400)
 assert.equal((await request('/api/unknown')).status,404)

 const source=await request('/api/providers')
 assert.equal(source.status,200)
 assert.ok(Array.isArray((await source.json()).providers))

 console.log('WINDOWS_PRODUCTION_SMOKE_PASS')
}finally{
 if(!exited)child.kill()
}
