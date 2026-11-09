import test from 'node:test';
import assert from 'node:assert/strict';
import {newRegion,matteSummary,MASK_SIZE,mask64,cropWindow,suggestedBloomThreshold} from '../src/photo/scene.ts';
import {displacement,regionSize,REGION_LIMITS} from '../src/photo/regionRender.ts';
import {analysePixels} from '../src/photo/sceneAnalysis.ts';
test('all local movement fields have bounded zero, distinct amount response and smooth integer-loop closure',()=>{
 for(const kind of ['cloud','water','foliage'])for(const speed of [1,2,3,4]){
  const r={...newRegion(kind),enabled:true,speed,amount:100};
  for(const phase of [.0925,.2825,.5975]){const a=displacement(r,.37,.43,phase),b=displacement({...r,amount:30},.37,.43,phase),zero=displacement({...r,amount:0},.37,.43,phase);assert.ok(Math.hypot(a.x,a.y)>.0001);assert.ok(Math.hypot(a.x,a.y)<.06);assert.equal(Math.hypot(zero.x,zero.y),0);assert.ok(Math.abs(a.x*.3-b.x)<1e-10);assert.ok(Math.abs(a.y*.3-b.y)<1e-10);const end=displacement(r,.37,.43,phase+1);assert.ok(Math.hypot(a.x-end.x,a.y-end.y)<1e-10);}
  const a=displacement(r,.37,.43,.000001),b=displacement(r,.37,.43,.999999);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<.00001);
 }
});
test('cloud field starts visibly displaced and does not crossfade opposing samples at half phase',()=>{const r={...newRegion('cloud'),amount:100};const a=displacement(r,.4,.3,0),b=displacement(r,.4,.3,.5);assert.ok(Math.hypot(a.x,a.y)>.01);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>.03);});
test('empty and negligible matte readiness stays off until usable paint or an explicit full selection exists',()=>{const r=newRegion('water');assert.equal(r.enabled,false);assert.equal(matteSummary(r).usable,false);const tiny=new Uint8Array(MASK_SIZE);tiny[0]=255;r.mask=mask64(tiny);assert.equal(matteSummary(r).usable,false);r.strokes=[{id:'paint',mode:'paint',radius:.15,softness:40,points:[{x:.5,y:.6}]}];assert.equal(matteSummary(r).usable,true);r.mask=mask64(new Uint8Array(MASK_SIZE).fill(255));assert.ok(matteSummary(r).coverage>.99);});
test('curated recommendations exclude nonexistent Alpine water and rocky mountain cloud effects',()=>{const pixels=new Uint8ClampedArray(192*108*4).fill(160);const alpine=analysePixels(pixels,192,108,'forest-falcade'),pines=analysePixels(pixels,192,108,'sorapiss');assert.deepEqual(alpine.tools,['cloud','foliage']);assert.deepEqual(pines.tools,['foliage','water']);assert.ok(!analysePixels(pixels,192,108,'coast-monochrome').tools.includes('cloud'));});

test('readiness uses the current crop without erasing the stored matte',()=>{const values=Uint8Array.from({length:MASK_SIZE},(_,i)=>i%96<22?255:0),r=newRegion('cloud',values),basis={x:0,y:0,w:1,h:1},crop={x:.5,y:0,w:.5,h:1};assert.equal(matteSummary(r).usable,true);const saved=r.mask;assert.deepEqual(matteSummary(r,basis,crop),{coverage:0,active:0,usable:false});assert.equal(r.mask,saved);});
test('bloom threshold samples only the selected matte, ignoring a bright unselected sky',()=>{const brightness=Uint8Array.from({length:MASK_SIZE},(_,i)=>i<96*27?250:45),mask=Uint8Array.from({length:MASK_SIZE},(_,i)=>i<96*27?0:255);assert.ok(suggestedBloomThreshold(brightness,mask)<=6);});
test('region work is bounded by longest edge and pixel count for portrait, landscape and 4K',()=>{for(const[w,h]of [[960,2304],[4096,2160],[2160,4096],[3840,2160],[4096,4096]]){const q=regionSize(w,h);assert.ok(Math.max(q.width,q.height)<=REGION_LIMITS.longEdge);assert.ok(q.width*q.height<=REGION_LIMITS.pixels);}});
