/**
 * Deliberately conservative process-wide ceilings for backend API quotas.
 * This prevents unlimited anonymous provider-key consumption on local servers.
 * Multi-instance public operation still requires gateway-level rate limits and auth.
 */
function rollingWindow(cap:number,ms:number){
 let resetAt=0,requests=0
 return (now=Date.now())=>{
  if(now>=resetAt){resetAt=now+ms;requests=0}
  if(requests>=cap)return false
  requests++
  return true
 }
}
export const subtitleSearchLimit=rollingWindow(40,60000)
export const subtitleFileLimit=rollingWindow(20,60000)
