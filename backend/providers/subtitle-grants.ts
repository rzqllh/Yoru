import {createHmac,randomBytes,timingSafeEqual} from 'node:crypto'
const secret=process.env.YORU_SUBTITLE_SIGNING_SECRET||randomBytes(32).toString('hex')
const ttlMs=10*60*1000
const validProvider=(v:string)=>v==='subdl'||v==='subsource'||v==='opensubtitles'
function signature(provider:string,ref:string,expires:string){
 return createHmac('sha256',secret).update(JSON.stringify([provider,ref,expires])).digest('hex')
}
export function grantSubtitleUrl(sourceUrl:string,now=Date.now()):string{
 const base=new URL(sourceUrl,'http://yoru.local')
 const provider=base.searchParams.get('provider')||'',ref=base.searchParams.get('ref')||''
 if(base.pathname!=='/api/subtitles/file'||base.origin!=='http://yoru.local'||!validProvider(provider)||!ref)throw new Error('INVALID_SUBTITLE_GRANT')
 const expires=String(now+ttlMs)
 base.searchParams.set('expires',expires)
 base.searchParams.set('token',signature(provider,ref,expires))
 return base.pathname+base.search
}
export function verifySubtitleGrant(provider:string,ref:string,expires:string,token:string,now=Date.now()):boolean{
 if(!validProvider(provider)||!ref||ref.length>260||!/^[1-9]\d{12}$/.test(expires)||!/^[a-f0-9]{64}$/.test(token))return false
 const time=Number(expires)
 if(time<now||time>now+ttlMs)return false
 const expected=Buffer.from(signature(provider,ref,expires),'hex'),actual=Buffer.from(token,'hex')
 return expected.length===actual.length&&timingSafeEqual(expected,actual)
}
