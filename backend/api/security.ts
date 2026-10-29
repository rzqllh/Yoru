/**
 * Local-first production HTTP safeguards.
 *
 * CSP must allow the external anime metadata artwork, optional HTTPS HLS media,
 * and the fixed AnimeEmbed iframe. Transport security (TLS/HSTS) belongs at the
 * HTTPS reverse proxy: the local Node server intentionally does not terminate TLS.
 */
export const SECURITY_HEADERS: Readonly<Record<string,string>> = Object.freeze({
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https:",
    "media-src 'self' blob: https:",
    "frame-src https://www.animeembed.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "form-action 'self'"
  ].join('; ')
})

/**
 * The default is loopback only. Network listening requires HOST=0.0.0.0 or ::.
 * This is NOT an authorization mechanism: public deployment still needs an
 * HTTPS reverse proxy, access controls appropriate to the deployment, and an
 * externally reviewed threat model.
 */
export function serverBinding(hostValue?:string,portValue?:string){
  const hostname = hostValue?.trim() || '127.0.0.1'
  const allowed = new Set(['127.0.0.1','localhost','::1','0.0.0.0','::'])
  if(!allowed.has(hostname))throw new Error('Invalid HOST: use an explicit loopback or wildcard binding')
  const port = portValue === undefined || portValue === '' ? 8787 : Number(portValue)
  if(!Number.isSafeInteger(port)||port<1||port>65535)throw new Error('Invalid PORT: expected 1–65535')
  return { hostname, port }
}
