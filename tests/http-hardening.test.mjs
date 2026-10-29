import test from 'node:test'
import assert from 'node:assert/strict'
import {SECURITY_HEADERS,serverBinding} from '../backend/api/security.ts'

test('local server binding defaults to loopback and validated port',()=>{
 assert.deepEqual(serverBinding(),{hostname:'127.0.0.1',port:8787})
 assert.deepEqual(serverBinding('0.0.0.0','3000'),{hostname:'0.0.0.0',port:3000})
 assert.deepEqual(serverBinding('::','443'),{hostname:'::',port:443})
 for(const host of ['192.168.0.1','attacker.example',' 0.0.0.0.invalid','']) {
  if(host==='')continue
  assert.throws(()=>serverBinding(host),/Invalid HOST/)
 }
 for(const port of ['0','-1','65536','NaN','2.5'])assert.throws(()=>serverBinding(undefined,port),/Invalid PORT/)
})

test('security headers prevent framing, MIME sniffing and restrict iframe origin',()=>{
 assert.equal(SECURITY_HEADERS['X-Content-Type-Options'],'nosniff')
 assert.equal(SECURITY_HEADERS['X-Frame-Options'],'DENY')
 const csp=SECURITY_HEADERS['Content-Security-Policy']
 for(const d of ["default-src 'self'","object-src 'none'","frame-ancestors 'none'","base-uri 'self'","frame-src https://www.animeembed.com"]) {
  assert.ok(csp.includes(d),d)
 }
 assert.ok(!csp.includes('unsafe-eval'))
 assert.ok(!csp.includes('http:'))
})
