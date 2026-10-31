import assert from 'node:assert/strict'
import {test} from 'node:test'
import {existsSync,readFileSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const docs=[
 'README.md','DESIGN.md','docs/public/README.md','docs/public/architecture.md',
 'docs/public/development.md','docs/public/getting-started.md','docs/public/operations.md',
 'docs/public/production-readiness.md','docs/public/providers.md','docs/public/quality-gates.md',
 'docs/public/releases.md','docs/public/security.md','docs/public/troubleshooting.md',
 'docs/public/using-yoru.md','docs/public/vercel-preview.md','docs/public/watch-order.md'
]

test('all public documentation links resolve to committed files',()=>{
 for(const file of docs){
  const absolute=resolve(root,file)
  assert.ok(existsSync(absolute),`Missing public document: ${file}`)
  const content=readFileSync(absolute,'utf8')
  assert.ok(content.length>200,`Empty public document: ${file}`)
  const links=[...content.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)].map(match=>match[1])
  for(const link of links){
   if(/^(?:https?:|mailto:)/.test(link))continue
   assert.ok(existsSync(resolve(dirname(absolute),link)),`Broken link in ${file}: ${link}`)
  }
 }
})

test('public source tree does not ship private planning or agent files',()=>{
 for(const path of ['docs/internal','docs/superpowers','AGENTS.md','.claude','.cursor','.codex']){
  assert.equal(existsSync(resolve(root,path)),false,`Unexpected private file or directory: ${path}`)
 }
 const template=readFileSync(resolve(root,'.github/PULL_REQUEST_TEMPLATE.md'),'utf8')
 assert.equal(/YORU_HANDOFF|YORU_TASK_TRACKER|docs\/internal|superpowers/i.test(template),false)
})

test('obsolete release asset cleanup workflow is no longer checked in',()=>{
 assert.equal(existsSync(resolve(root,'.github/workflows/web-preview-release.yml')),false)
})

test('engineering merges cannot start automatic Vercel deployments',()=>{
 const config=JSON.parse(readFileSync(resolve(root,'vercel.json'),'utf8'))
 assert.equal(config.git.deploymentEnabled,false)
 assert.equal(config.framework,'vite')
 assert.equal(config.rewrites[0].source,'/api/:path*')
})
