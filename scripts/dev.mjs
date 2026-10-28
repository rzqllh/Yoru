import { spawn } from 'node:child_process'

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const children = ['backend', 'frontend'].map((workspace) =>
  spawn(npm, ['run', 'dev', '-w', workspace], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  }),
)

let stopping = false
function stop() {
  if (stopping) return
  stopping = true
  for (const child of children) {
    if (child.exitCode === null) child.kill('SIGTERM')
  }
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, stop)
for (const child of children) {
  child.on('error', (error) => {
    console.error(error)
    stop()
    process.exitCode = 1
  })
  child.on('exit', (code) => {
    if (!stopping && code !== 0) {
      process.exitCode = code || 1
      stop()
    }
  })
}
