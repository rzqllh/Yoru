import assert from 'node:assert/strict'
import {test} from 'node:test'
import {readFile} from 'node:fs/promises'
import vm from 'node:vm'

test('updating Yoru offline cache never deletes other apps caches on shared origin',async()=>{
 const source=await readFile(new URL('../frontend/public/sw.js',import.meta.url),'utf8')
 const listeners=new Map()
 const deleted=[]
 const cacheNames=['unrelated-app-v4','yoru-shell-older','yoru-shell-v1','yoru-shell-v2']
 const context={
  self:{addEventListener:(name,fn)=>listeners.set(name,fn),clients:{claim:async()=>{}}},
  caches:{keys:async()=>cacheNames,delete:async name=>{deleted.push(name);return true}},
 }
 vm.runInNewContext(source,context)
 const activate=listeners.get('activate')
 assert.equal(typeof activate,'function')
 let task
 activate({waitUntil:promise=>{task=promise}})
 await task
 assert.equal(deleted.includes('unrelated-app-v4'),false)
 assert.equal(deleted.includes('yoru-shell-older'),true)
})
