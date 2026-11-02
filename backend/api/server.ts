import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { app } from './app.js'
import { serverBinding } from './security.js'

const production = process.env.NODE_ENV === 'production'
const staticRoot = existsSync(resolve(process.cwd(), 'frontend/dist'))
  ? resolve(process.cwd(), 'frontend/dist')
  : resolve(process.cwd(), '../frontend/dist')
if (production) {
  if (!existsSync(staticRoot)) throw new Error('Frontend dist missing: run npm run build first')
  app.get('/subtitles/:file', async c => {
    const file = c.req.param('file')
    if (!/^[a-z0-9-]+\.vtt$/i.test(file)) return c.notFound()
    const filePath = resolve(staticRoot, 'subtitles', file)
    if (!existsSync(filePath)) return c.notFound()
    const content = await readFile(filePath, 'utf8')
    return c.text(content, 200, {
      'Content-Type': 'text/vtt; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    })
  })
  app.use('/*', serveStatic({ root: staticRoot }))
  app.get('/api/*', c => c.json({ error: 'NOT_FOUND' }, 404))
  app.get('*', serveStatic({ path: resolve(staticRoot, 'index.html') }))
}
const {hostname,port}=serverBinding(process.env.HOST,process.env.PORT)
const server = serve({ fetch: app.fetch, port, hostname })
console.info(`Yoru API${production?' + web':''}: http://${hostname}:${port}`)
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => server.close())
}
