import assert from 'node:assert/strict'
import {test} from 'node:test'
import {existsSync,readFileSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const docs=['README.md','docs/public/README.md','docs/public/getting-started.md','docs/public/using-yoru.md','docs/public/providers.md','docs/public/troubleshooting.md','docs/public/development.md','docs/public/releases.md','docs/public/production-readiness.md','DESIGN.md']

test('public navigation points to real checked-in docs',()=>{
 for(const file of docs){
  const absolute=resolve(root,file)
  assert.ok(existsSync(absolute),`Missing: ${file}`)
  const content=readFileSync(absolute,'utf8')
  assert.ok(content.length>200,`Empty public doc: ${file}`)
  const links=[...content.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)].map(match=>match[1])
  for(const link of links){
   if(/^(?:https?:|mailto:)/.test(link))continue
   assert.ok(existsSync(resolve(dirname(absolute),link)),`Broken local link in ${file}: ${link}`)
  }
 }
})
test('release workflow never publishes a source-like web ZIP',()=>{
 const content=readFileSync(resolve(root,'.github/workflows/web-preview-release.yml'),'utf8')
 assert.equal(content.includes('gh release create'),false)
 assert.equal(content.includes('zip -qr'),false)
 assert.ok(content.includes('gh release delete-asset'))
})



test('internal notes are excluded and this documentation branch cannot auto-deploy',()=>{
 assert.equal(existsSync(resolve(root,'docs/internal/README.md')),false)
 assert.equal(existsSync(resolve(root,'docs/internal/.gitkeep')),false)
 const config=JSON.parse(readFileSync(resolve(root,'vercel.json'),'utf8'))
 assert.equal(config.git.deploymentEnabled['docs/cleanup-public-guides-20261029'],false)
 assert.equal(config.git.deploymentEnabled.main,undefined)
})
