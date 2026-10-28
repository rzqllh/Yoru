import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { app } from './app.js'

const production = process.env.NODE_ENV === 'production'
const staticRoot = existsSync(resolve(process.cwd(), 'frontend/dist'))
  ? resolve(process.cwd(), 'frontend/dist')
  : resolve(process.cwd(), '../frontend/dist')
if (production) {
  if (!existsSync(staticRoot)) throw new Error('Frontend dist missing: run npm run build first')
  app.use('/*', serveStatic({ root: staticRoot }))
  app.get('/api/*', c => c.json({ error: 'NOT_FOUND' }, 404))
  app.get('*', serveStatic({ path: resolve(staticRoot, 'index.html') }))
}
const port = Number(process.env.PORT || 8787)
const server = serve({ fetch: app.fetch, port, hostname: '127.0.0.1' })
console.info(`Yoru API${production?' + web':''}: http://127.0.0.1:${port}`)
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => server.close())
}
