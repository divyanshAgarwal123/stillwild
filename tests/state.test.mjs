import test from 'node:test';
import assert from 'node:assert/strict';
import {makePreset,validateComposition,encodeComposition,decodeComposition,seeded,loadComposition,parseBackup,STORAGE_KEY,LEGACY_KEY,MAX_OBJECTS} from '../src/model.ts';
import {makePreset as oldPreset} from '../src/legacy.ts';

test('all 24 theme/scene presets are valid, independent, and composed deliberately',()=>{
 for(const theme of ['paper','natural','ink','future'])for(const scene of ['garden','rain'])for(let p=0;p<3;p++){
  const s=makePreset(scene,p,theme);assert.deepEqual(validateComposition(s),s);assert.equal(s.theme,theme);assert.equal(s.scene,scene);
  if(scene==='garden'&&theme==='natural')assert.ok(s.objects.every(o=>o.kind!=='arch'&&o.kind!=='circle'&&o.scale<.7));
  if(scene==='garden'&&theme==='future')assert.equal(s.objects.length,0);
  s.light.x=.01;assert.notEqual(makePreset(scene,p,theme).light.x,.01);
 }
});
test('legacy compositions migrate all original parameters into Paper and retain seeds/time/objects',()=>{
 for(const scene of ['garden','rain'])for(let p=0;p<3;p++){
  const old=oldPreset(scene,p);old.time=47.23;old.frozen=true;old.objects[0].rotation=17;
  const s=validateComposition(old);assert.equal(s.version,2);assert.equal(s.theme,'paper');assert.deepEqual(s.objects,old.objects);for(const key of ['time','frozen','palette','wind','ink','rainAmount'])assert.deepEqual(s[key],old[key]);
  for(const key of ['x','y','intensity'])assert.equal(s.light[key],old.light[key]);
 }
});
test('valid v1 share links migrate and always open frozen',()=>{
 const old=oldPreset('rain',1);old.frozen=false;const migrated=decodeComposition('#art='+btoa(JSON.stringify(old)));assert.equal(migrated.theme,'paper');assert.equal(migrated.frozen,true);assert.deepEqual(migrated.objects,old.objects);
});
test('v2 links round-trip all visual fields without mixer or audio start authority',()=>{
 const s=makePreset('rain',2,'future');s.time=88.123;s.frozen=true;s.effects.storm=true;s.objects.push({id:'circle-a',kind:'circle',x:.4,y:.8,scale:.7,rotation:30,seed:92});assert.deepEqual(decodeComposition('#art='+encodeComposition(s)),s);assert.ok(!JSON.stringify(s).includes('audio'));assert.equal(decodeComposition('#art=broken'),null);
});
test('corrupt v2 storage does not prevent valid v1 recovery; both raw originals survive',()=>{
 const legacy=oldPreset('garden',2),raw=JSON.stringify(legacy),map=new Map([[STORAGE_KEY,'{broken-v2'],[LEGACY_KEY,raw]]);
 globalThis.location={hash:''};globalThis.localStorage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
 const loaded=loadComposition();assert.equal(loaded.composition.theme,'paper');assert.deepEqual(loaded.composition.objects,legacy.objects);assert.equal(map.get(LEGACY_KEY),raw);assert.equal(map.get(STORAGE_KEY),'{broken-v2');assert.equal(map.get('stillwild.recovery.'+STORAGE_KEY),'{broken-v2');
});
test('fresh installs choose Natural; failed recovery backup prevents automatic overwrite',()=>{
 globalThis.location={hash:''};globalThis.localStorage={getItem:()=>null,setItem:()=>{}};assert.equal(loadComposition().composition.theme,'natural');
 const raw=JSON.stringify(oldPreset());globalThis.localStorage={getItem:k=>k===STORAGE_KEY?'bad':k===LEGACY_KEY?raw:null,setItem:()=>{throw new Error('quota');}};const loaded=loadComposition();assert.equal(loaded.composition.theme,'paper');assert.equal(loaded.preventOverwrite,true);
});
test('strict schema rejects unsupported enums, nonfinite values, duplicate IDs, and object floods',()=>{
 for(const patch of [{version:3},{theme:'unknown'},{scene:'x'},{seed:NaN},{preset:4},{frozen:'true'},{wind:Infinity},{time:NaN}])assert.equal(validateComposition({...makePreset(),...patch}),null);
 const s=makePreset();s.light.mode='bad';assert.equal(validateComposition(s),null);const e=makePreset();e.effects.storm='true';assert.equal(validateComposition(e),null);
 const dup=makePreset();dup.objects.push({...dup.objects[0]});assert.equal(validateComposition(dup),null);
 const flood=makePreset();flood.objects=Array.from({length:MAX_OBJECTS+1},(_,i)=>({...flood.objects[0],id:'element-'+i}));assert.equal(validateComposition(flood),null);
 const empty=makePreset();empty.objects=[];assert.ok(validateComposition(empty));
});
test('finite out-of-bounds numeric input is clamped into safe rendering ranges',()=>{
 const s=makePreset();s.wind=900;s.light.x=-10;s.effects.particles=999;s.objects[0].scale=30;const v=validateComposition(s);assert.equal(v.wind,100);assert.equal(v.light.x,0);assert.equal(v.effects.particles,100);assert.equal(v.objects[0].scale,1.7);
});
test('composition backups import v1/v2 and reject malformed, oversized, or invalid files',()=>{
 const s=makePreset('rain',0,'ink');assert.deepEqual(parseBackup(JSON.stringify({format:'stillwild-composition',version:2,composition:s})),s);assert.equal(parseBackup(JSON.stringify(oldPreset())).theme,'paper');assert.throws(()=>parseBackup('hello'),/not valid JSON/);assert.throws(()=>parseBackup(' '.repeat(131073)),/128 KB/);assert.throws(()=>parseBackup('{"version":999}'),/invalid values/);
});
test('seeded procedural randomness is reproducible and bounded',()=>{const a=seeded(71),b=seeded(71),c=seeded(72),seq=Array.from({length:50},a);assert.deepEqual(seq,Array.from({length:50},b));assert.notDeepEqual(seq,Array.from({length:50},c));assert.ok(seq.every(n=>n>=0&&n<1));});
