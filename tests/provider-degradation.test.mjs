import assert from 'node:assert/strict'
import {test} from 'node:test'
import {combineProviderResults} from '../backend/pipeline/provider-aggregation.ts'

test('returns all source entries when both providers succeed',()=>{
 const result=combineProviderResults([
  {status:'fulfilled',value:[{id:'local-a'}]},
  {status:'fulfilled',value:[{id:'addon-a'}]}
 ],['local','stremio'])
 assert.deepEqual(result,{items:[{id:'local-a'},{id:'addon-a'}],warnings:[],allFailed:false})
})
test('an invalid local provider does not hide a healthy Stremio addon',()=>{
 const result=combineProviderResults([
  {status:'rejected',reason:new Error('bad config')},
  {status:'fulfilled',value:[{id:'stremio-a'}]}
 ],['local','stremio'])
 assert.deepEqual(result,{items:[{id:'stremio-a'}],warnings:['local'],allFailed:false})
 assert.equal(JSON.stringify(result).includes('bad config'),false)
})
test('an unavailable Stremio addon does not hide the local episode list',()=>{
 const result=combineProviderResults([
  {status:'fulfilled',value:[{id:'local:1:1'}]},
  {status:'rejected',reason:new Error('external addon failure')}
 ],['local','stremio'])
 assert.deepEqual(result,{items:[{id:'local:1:1'}],warnings:['stremio'],allFailed:false})
})
test('no providers configured is different from both providers failing',()=>{
 const empty=combineProviderResults([
  {status:'fulfilled',value:[]},
  {status:'fulfilled',value:[]}
 ],['local','stremio'])
 assert.deepEqual(empty,{items:[],warnings:[],allFailed:false})
 const failing=combineProviderResults([
  {status:'rejected',reason:new Error('invalid config')},
  {status:'rejected',reason:new Error('invalid config')}
 ],['local','stremio'])
 assert.deepEqual(failing,{items:[],warnings:['local','stremio'],allFailed:true})
})

test('fulfilled non-array provider payloads degrade without hiding healthy peers',()=>{
 const result=combineProviderResults([
  {status:'fulfilled',value:null},
  {status:'fulfilled',value:{items:[{id:'invalid-wrapper'}]}},
  {status:'fulfilled',value:[{id:'healthy-source'}]},
  {status:'fulfilled',value:'not-an-array'}
 ],['null-provider','object-provider','healthy','string-provider'])
 assert.deepEqual(result,{
  items:[{id:'healthy-source'}],
  warnings:['null-provider','object-provider','string-provider'],
  allFailed:false
 })
 assert.equal(JSON.stringify(result).includes('invalid-wrapper'),false)
})

test('all fulfilled malformed provider payloads are failures, not healthy empty results',()=>{
 const malformed=combineProviderResults([
  {status:'fulfilled',value:null},
  {status:'fulfilled',value:{length:0}}
 ],['first','second'])
 assert.deepEqual(malformed,{items:[],warnings:['first','second'],allFailed:true})
})
