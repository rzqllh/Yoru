import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'

if (!existsSync('frontend/dist/index.html') || !existsSync('backend/dist/api/server.js')) {
 console.error('Build belum tersedia. Jalankan: npm run build')
 process.exit(1)
}
const child=spawn(process.execPath,['backend/dist/api/server.js'],{stdio:'inherit',env:{...process.env,NODE_ENV:'production'}})
for(const sig of ['SIGTERM','SIGINT'])process.on(sig,()=>child.kill(sig))
child.on('exit',code=>{process.exitCode=code??1})
