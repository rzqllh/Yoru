import { app } from '../backend/api/app.js'

/**
 * Single Node.js Vercel Function for the existing Hono API.
 * The rewrite carries the matched path in __yoru_route; never trust a client
 * supplied replacement when invoked outside the configured rewrite.
 */
export default {
  fetch(request: Request): Promise<Response> | Response {
    const url = new URL(request.url)
    const rewrittenPath = url.searchParams.get('__yoru_route')

    if (rewrittenPath !== null) {
      if (!/^[a-zA-Z0-9/_-]{1,180}$/.test(rewrittenPath) ||
          rewrittenPath.startsWith('/') || rewrittenPath.includes('//') ||
          rewrittenPath.split('/').some(segment => segment === '..' || segment === '.')) {
        return Response.json({error:'INVALID_API_ROUTE'},{status:400})
      }
      url.searchParams.delete('__yoru_route')
      url.pathname = '/api/' + rewrittenPath
    } else if (!url.pathname.startsWith('/api/')) {
      return Response.json({error:'INVALID_API_ROUTE'},{status:400})
    }
    return app.fetch(new Request(url,request))
  }
}
