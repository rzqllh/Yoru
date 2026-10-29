/** Tenrai's Jikan-v4-compatible v1 API preserves canonical MAL IDs. */
export const CATALOG_BASE='https://api.tenrai.org/v1'
export const catalogProviders=()=>['Tenrai']
export function getCatalogEndpoint(path:string):string{
 if(!path.startsWith('/')||path.startsWith('//'))throw new Error('Invalid catalog path')
 return `${CATALOG_BASE}${path}`
}
