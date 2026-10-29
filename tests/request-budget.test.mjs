import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createFixedWindowBudget} from '../backend/api/request-budget.ts'

test('subtitle per-process budget limits bursts and exposes bounded retry-after',()=>{
 const take=createFixedWindowBudget(2,60000)
 assert.deepEqual(take(1000),{ok:true,retryAfter:0})
 assert.deepEqual(take(1001),{ok:true,retryAfter:0})
 assert.deepEqual(take(1002),{ok:false,retryAfter:60})
 assert.deepEqual(take(60000),{ok:false,retryAfter:1})
 assert.deepEqual(take(61000),{ok:true,retryAfter:0})
})
test('budget rejects invalid configuration and clocks',()=>{
 assert.throws(()=>createFixedWindowBudget(0,60000))
 assert.throws(()=>createFixedWindowBudget(20,100))
 assert.throws(()=>createFixedWindowBudget(0.5,60000))
 const take=createFixedWindowBudget(1,60000)
 assert.throws(()=>take(Infinity))
})
