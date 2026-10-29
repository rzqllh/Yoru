/**
 * After Vite builds, inject the actual hashed JS/CSS assets into the PWA shell
 * cache. Vite does not emit these filenames in frontend/public/sw.js.
 * Deterministic output: identical build inputs yield the same SW cache version.
 */
import {createHash} from 'node:crypto'
import {readFile,readdir,writeFile} from 'node:fs/promises'
import {join,relative,sep} from 'node:path'

const dist=join(process.cwd(),'frontend','dist')
const assets=join(dist,'assets')
const file=join(dist,'sw.js')
const [html,template,entries]=await Promise.all([
 readFile(join(dist,'index.html'),'utf8'),
 readFile(file,'utf8'),
 readdir(assets,{recursive:true,withFileTypes:true})
])
const paths=entries.filter(entry=>entry.isFile()&&/\.(?:js|css)$/.test(entry.name))
 .map(entry=>{
  const filename=join(entry.parentPath,entry.name)
  return '/'+relative(dist,filename).split(sep).join('/')
 }).sort()
if(!paths.some(p=>p.endsWith('.js'))||!paths.some(p=>p.endsWith('.css')))
 throw new Error('Production JS/CSS artifacts missing from Vite build')
const marker='/* YORU_PRECACHE_ASSETS */ []'
if(!template.includes(marker))throw new Error('Service worker precache marker missing')
const versionMarker="const VERSION='yoru-shell-v2'"
if(!template.includes(versionMarker))throw new Error('Service worker version marker missing')
const digest=createHash('sha256').update(html).update('\n'+paths.join('\n')).digest('hex').slice(0,12)
const updated=template
 .replace(marker,JSON.stringify(paths))
 .replace(versionMarker,`const VERSION='yoru-shell-v3-${digest}'`)
await writeFile(file,updated)
console.info(`PWA: precached ${paths.length} bundled assets, shell v3-${digest}`)
