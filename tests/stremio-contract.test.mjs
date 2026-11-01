import assert from 'node:assert/strict'
import {test} from 'node:test'
import {isPublicIPv4,validateStremioConfig,parseStremioStreams,classifyStremioUnplayable,stremioStreamPath} from '../backend/providers/stremio-core.ts'

test('only globally routable IPv4 hosts can be connected to',()=>{
 for(const value of ['127.0.0.1','10.0.0.4','172.20.5.1','192.168.1.20','169.254.169.254','0.0.0.0','100.64.0.1','198.51.100.3','224.1.2.3'])assert.equal(isPublicIPv4(value),false,value)
 assert.equal(isPublicIPv4('8.8.8.8'),true)
 assert.equal(isPublicIPv4('1.1.1.1'),true)
})
const addon={id:'example',name:'Configured addon',manifestUrl:'https://addon.example.com/manifest.json',anime:[{malId:1,stremioId:'kitsu:1',episodes:[1,2],season:1}]}
test('configuration whitelists exactly approved addon origin, IDs and episodes',()=>{
 const valid=validateStremioConfig({addons:[addon]})
 assert.equal(valid.addons[0].anime[0].stremioId,'kitsu:1')
 for(const input of [
  {...addon,manifestUrl:'http://addon.example.com/manifest.json'},
  {...addon,manifestUrl:'https://localhost/manifest.json'},
  {...addon,manifestUrl:'https://addon.example.com/manifest.json?token=secret'},
  {...addon,manifestUrl:'https://addon.example.com:444/manifest.json'},
  {...addon,anime:[{...addon.anime[0],stremioId:'../bad'}]},
  {...addon,anime:[{...addon.anime[0],episodes:[1,1]}]}
 ])assert.throws(()=>validateStremioConfig({addons:[input]}))
 assert.throws(()=>validateStremioConfig({addons:[addon,addon]}),/Duplicate/i)
})
test('stream path is anchored to addon manifest directory and encodes episode identity',()=>{
 const url=stremioStreamPath(addon,'kitsu:1',1,2)
 assert.equal(url.toString(),'https://addon.example.com/stream/series/kitsu%3A1%3A1%3A2.json')
})
test('Stremio stream response accepts HTTPS HLS/MP4, rejects magnet URLs and labels subtitle IDs accurately',()=>{
 const res=parseStremioStreams({streams:[
  {url:'magnet:?xt=urn:btih:example',name:'torrent'},
  {url:'https://cdn.example.com/show/master.m3u8',name:'Sub Indo 1080p',subtitles:[{lang:'id',url:'https://cdn.example.com/1.vtt'}]},
  {url:'https://cdn.example.com/show/episode.mp4',name:'1080p',subtitles:[]},
  {url:'https://cdn.example.com/bad.avi'},
 ]},'stremio-example')
 assert.equal(res.length,2)
 assert.equal(res[0].format,'hls')
 assert.equal(res[0].subtitleMode,'soft')
 assert.equal(res[0].tracks[0].lang,'id')
 assert.equal(res[1].subtitleMode,'unknown')
})

test('Stremio media URLs never target localhost, IP literals, or private DNS domains',()=>{
 const result=parseStremioStreams({streams:[
  {url:'https://127.0.0.1/segment.m3u8'},
  {url:'https://192.168.1.1/episode.mp4'},
  {url:'https://cdn.example.com/x.m3u8',subtitles:[{lang:'id',url:'https://localhost/private.vtt'}]}
 ]},'stremio-example')
 assert.equal(result.length,1)
 assert.equal(result[0].tracks.length,0)
})

test('Torrentio standard IMDb mapping is explicit, never guessed from a MAL ID',()=>{
 const configured=validateStremioConfig({addons:[{...addon,anime:[{...addon.anime[0],stremioId:'tt1234567'}]}]})
 assert.equal(stremioStreamPath(configured.addons[0],'tt1234567',1,2).toString(),
  'https://addon.example.com/stream/series/tt1234567%3A1%3A2.json')
})
test('torrent-only responses remain honest disabled candidates, not invented browser streams',()=>{
 const payload={streams:[
  {infoHash:'a'.repeat(40),fileIdx:0,name:'Torrentio 1080p'},
  {url:'https://cdn.example.com/episode.m3u8',name:'Stream 720p'},
  {externalUrl:'https://watch.example.com/title',name:'External'},
  {url:'magnet:?xt=urn:btih:xyz',name:'Bad magnet'},
  {infoHash:'not-a-hash',name:'Invalid'},
 ]}
 assert.equal(parseStremioStreams(payload,'stremio-torrentio').length,1)
 assert.deepEqual(classifyStremioUnplayable(payload,'stremio-torrentio'),[
  {kind:'torrent',label:'Torrentio 1080p',reason:'Torrent membutuhkan mesin streaming/resolver yang terhubung; belum bisa diputar langsung.'},
  {kind:'external',label:'External',reason:'Tautan situs eksternal belum diverifikasi untuk pemutaran langsung.'},
  {kind:'unsupported',label:'Bad magnet',reason:'Format atau URL belum didukung pemutar browser.'}
 ])
})

test('Stremio native tracks normalize Indonesian and English aliases for player selection',()=>{
 const results=parseStremioStreams({streams:[{
  url:'https://cdn.example.com/anime/episode.m3u8',
  subtitles:[
   {lang:'ind',url:'https://cdn.example.com/ind.vtt'},
   {lang:'id-ID',url:'https://cdn.example.com/id-id.vtt'},
   {lang:'eng',url:'https://cdn.example.com/eng.vtt'},
   {lang:'en_US',url:'https://cdn.example.com/en-us.vtt'},
   {lang:'ja',url:'https://cdn.example.com/ja.vtt'}
  ]
 }]},'stremio-example')
 assert.deepEqual(results[0].tracks.map(x=>x.lang),['id','id','en','en','ja'])
 assert.deepEqual(results[0].tracks.slice(0,4).map(x=>x.label),['Bahasa Indonesia','Bahasa Indonesia','English','English'])
 assert.equal(results[0].subtitleMode,'soft')
})
