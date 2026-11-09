import {finishAudioWebm} from '../src/photo/audioWebm.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {webmDuration,webmTimeline,assertWebmTimeline} from '../src/photo/webm.ts';
test('streaming WebM gains finite Duration without changing its frame payload',async()=>{const bytes=Uint8Array.from([0x18,0x53,0x80,0x67,1,255,255,255,255,255,255,255,0x15,0x49,0xa9,0x66,0x87,0x2a,0xd7,0xb1,0x83,0x0f,0x42,0x40,0x1f,0x43,0xb6,0x75,0x81,0x55]);const blob=await webmDuration(new Blob([bytes],{type:'video/webm'}),8);const result=new Uint8Array(await blob.arrayBuffer());assert.equal(result.length,bytes.length+11);assert.deepEqual(result.slice(-6),bytes.slice(-6));const at=result.findIndex((v,i)=>v===0x44&&result[i+1]===0x89);assert.ok(at>0);assert.equal(new DataView(result.buffer).getFloat64(at+3),8000);});
test('foreign or invalid containers remain unchanged',async()=>{const b=new Blob(['not an EBML container']);assert.equal(await webmDuration(b,4),b);});
const concat=(...parts)=>Uint8Array.from(parts.flatMap(p=>Array.from(p)));
const size=n=>n<127?[128|n]:[64|(n>>8),n&255];
const element=(id,data)=>concat(id,size(data.length),data);
function recorded(times,{unknownCluster=false,secondCluster=false}={}){
 const info=element([0x15,0x49,0xa9,0x66],element([0x2a,0xd7,0xb1],[0x0f,0x42,0x40]));
 const blocks=times.map(t=>element([0xa3],[0x81,t>>8&255,t&255,0x80,0x55]));
 const data=concat(element([0xe7],[0]),...blocks);
 const cluster=unknownCluster?concat([0x1f,0x43,0xb6,0x75,0xff],data):element([0x1f,0x43,0xb6,0x75],data);
 const next=secondCluster?element([0x1f,0x43,0xb6,0x75],concat(element([0xe7],[0x0f,0x76]),element([0xa3],[0x81,0,0,0x80,0x55]))):[];
 return new Blob([concat([0x18,0x53,0x80,0x67,1,255,255,255,255,255,255,255],info,cluster,next)],{type:'video/webm'});
}
test('recorded WebM packet times must cover the intended cycle before Duration metadata is written',async()=>{
 const valid=recorded([0,42,1000,2000,3000,3958]);assert.equal((await assertWebmTimeline(valid,4)).last,3.958);
 const slow=await webmDuration(recorded([0,1000,3000,5000,7611]),4);
 assert.equal((await webmTimeline(slow)).last,7.611);await assert.rejects(assertWebmTimeline(slow,4),/project timing/);
 for(const times of [[0,42,1000],[0,1000,900,3958],[0,0,3958]])await assert.rejects(assertWebmTimeline(recorded(times),4),/project timing/);
});
test('streaming unknown-size clusters retain real block timestamps across cluster boundaries',async()=>{
 const timing=await assertWebmTimeline(recorded([0,1000,2000,3000],{unknownCluster:true,secondCluster:true}),4);
 assert.equal(timing.frames,5);assert.equal(timing.last,3.958);assert.equal(timing.increasing,true);
 await assert.rejects(assertWebmTimeline(new Blob(['invalid']),4),/project timing/);
});
test('audio packets do not corrupt the video timing guard in a sound-enabled WebM',async()=>{
 const track=(number,type)=>element([0xae],concat(element([0xd7],[number]),element([0x83],[type])));
 const tracks=element([0x16,0x54,0xae,0x6b],concat(track(1,1),track(2,2)));
 const blocks=[element([0xe7],[0]),...[[1,0],[2,0],[2,20],[1,1000],[2,5000],[1,3958]].map(([track,time])=>element([0xa3],[128|track,time>>8&255,time&255,0x80,0x55]))];
 const bytes=concat([0x18,0x53,0x80,0x67,1,255,255,255,255,255,255,255],tracks,element([0x1f,0x43,0xb6,0x75],concat(...blocks)));
 const result=await assertWebmTimeline(new Blob([bytes]),4);assert.equal(result.frames,3);assert.equal(result.last,3.958);
});

test('sound WebM finalizer bounds malformed containers and cannot silently emit missing audio',()=>{assert.throws(()=>finishAudioWebm(new Uint8Array([0]).buffer,4));assert.throws(()=>finishAudioWebm(new Uint8Array([0]).buffer,NaN));});
