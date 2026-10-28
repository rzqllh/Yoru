export type HealthPayload = {
  status: 'ok'
  service: 'anime-pwa-api'
  version: 1
}

export function createHealthPayload(): HealthPayload {
  return { status: 'ok', service: 'anime-pwa-api', version: 1 }
}
