import assert from 'node:assert/strict'
import {test} from 'node:test'
import {readFileSync} from 'node:fs'
import {getCatalogEndpoint,catalogProviders} from '../backend/pipeline/catalog-sources.ts'
import {animeEmbedUrl,externalEpisode,externalStream} from '../backend/providers/public-embed.ts'
test('catalog migration keeps MAL IDs using Tenrai v1',()=>{
 assert.equal(getCatalogEndpoint('/anime/1/full'),'https://api.tenrai.org/v1/anime/1/full')
 assert.ok(catalogProviders().includes('Tenrai'))
 assert.equal(readFileSync(new URL('../backend/pipeline/jikan.ts',import.meta.url),'utf8').includes('https://api.jikan.moe/v4'),false)
})
test('embed URLs use fixed remote domain and validated numeric MAL identity',()=>{
 assert.equal(animeEmbedUrl(52991,1),'https://www.animeembed.com/embed/mal/52991/1')
 assert.throws(()=>animeEmbedUrl(0,1))
 assert.throws(()=>animeEmbedUrl(52991,-1))
 assert.equal(externalEpisode(52991,1).id,'public-embed:52991:1')
 assert.equal(externalStream('public-embed:52991:1')[0].format,'embed')
 assert.deepEqual(externalStream('public-embed:bad:1'),[])
})
