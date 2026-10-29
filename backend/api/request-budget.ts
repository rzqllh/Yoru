/**
 * Per-process quota brake against accidental provider API key exhaustion.
 * Not a replacement for reverse-proxy, authenticated or distributed rate limiting.
 */
export function createFixedWindowBudget(limit:number,windowMs:number){
 if(!Number.isSafeInteger(limit)||limit<1||!Number.isSafeInteger(windowMs)||windowMs<1000)
  throw new Error('INVALID_RATE_LIMIT')
 let start=0
 let count=0
 return function consume(now:number):{ok:boolean;retryAfter:number}{
  if(!Number.isFinite(now)||now<0)throw new Error('INVALID_CLOCK')
  if(start===0||now>=start+windowMs){start=now;count=0}
  if(count>=limit)return {ok:false,retryAfter:Math.max(1,Math.ceil((start+windowMs-now)/1000))}
  count++
  return {ok:true,retryAfter:0}
 }
}
