/* Offline app shell. API and external images are never cached. */
const VERSION='yoru-shell-v2'
const PRECACHE_ASSETS=/* YORU_PRECACHE_ASSETS */ []
const SHELL=['/','/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png','/demo-id.vtt','/demo/stream.m3u8','/demo/segment-000.ts','/demo/segment-001.ts','/demo/segment-002.ts']
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(VERSION).then(cache=>
  cache.addAll([...new Set([...SHELL,...PRECACHE_ASSETS])])
 ).then(()=>self.skipWaiting()))
})
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('yoru-shell-')&&key!==VERSION).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))
})
self.addEventListener('fetch',event=>{
 const request=event.request
 if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return
 const url=new URL(request.url)
 if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/@')||url.pathname.startsWith('/src/')||url.pathname.startsWith('/node_modules/'))return
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).then(response=>{
   if(response.ok){const copy=response.clone();void caches.open(VERSION).then(cache=>cache.put('/',copy))}return response
  }).catch(async()=>await caches.match('/')||Response.error()))
  return
 }
 if(/\.(?:js|css|png|svg|webmanifest|vtt|m3u8|ts)$/.test(url.pathname)){
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
   if(response.ok){const copy=response.clone();void caches.open(VERSION).then(cache=>cache.put(request,copy))}return response
  })))
 }
})
