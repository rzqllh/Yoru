import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {mkdtemp,mkdir,readFile,writeFile,rm,stat} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {test} from 'node:test'

const script=fileURLToPath(new URL('../scripts/verify-providers.mjs',import.meta.url))

test('provider CI smoke must not overwrite or delete personal provider configs',async()=>{
 const root=await mkdtemp(join(tmpdir(),'yoru-config-safety-'))
 try{
  const configDir=join(root,'configs')
  await mkdir(configDir)
  const local=join(configDir,'providers.local.json')
  const addon=join(configDir,'stremio.local.json')
  const localData='{"user":"original-local"}'
  const addonData='{"user":"original-stremio"}'
  await writeFile(local,localData)
  await writeFile(addon,addonData)
  const run=spawnSync(process.execPath,[script],{cwd:root,timeout:10000,encoding:'utf8'})
  assert.notEqual(run.status,0,'smoke must refuse a workspace that contains local configs')
  assert.equal(await readFile(local,'utf8'),localData,'existing local streams must be preserved')
  assert.equal(await readFile(addon,'utf8'),addonData,'existing addon configuration must be preserved')
 }finally{
  await rm(root,{recursive:true,force:true})
 }
})

test('provider CI smoke cleans only files it created when the second path exists',async()=>{
 const root=await mkdtemp(join(tmpdir(),'yoru-addon-safety-'))
 try{
  const configDir=join(root,'configs')
  await mkdir(configDir)
  const local=join(configDir,'providers.local.json')
  const addon=join(configDir,'stremio.local.json')
  const ownerData='{"owner":"keep-stremio"}'
  await writeFile(addon,ownerData)
  const run=spawnSync(process.execPath,[script],{cwd:root,timeout:10000,encoding:'utf8'})
  assert.notEqual(run.status,0)
  assert.equal(await readFile(addon,'utf8'),ownerData,'existing addon config must survive failure')
  await assert.rejects(stat(local),{code:'ENOENT'},'new fixture must be cleaned up')
 }finally{
  await rm(root,{recursive:true,force:true})
 }
})
