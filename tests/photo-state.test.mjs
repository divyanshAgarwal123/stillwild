import test from 'node:test';
import assert from 'node:assert/strict';
import {makeProject,validateProject,encodeProject,decodeProject,layer,fieldAt,loopPhase,privateAssets,LIMITS,normalizeCycleCount} from '../src/photo/model.ts';

test('three photo directions are independently valid and retain deliberate defaults',()=>{for(const d of ['nature','urban','editorial']){const p=makeProject(d);assert.deepEqual(validateProject(p),p);assert.equal(p.layers[0].kind,'image');assert.ok(p.layers[0].pins.length);p.layers[0].grade.exposure=2;assert.equal(makeProject(d).layers[0].grade.exposure,0);}assert.equal(makeProject('editorial').layers.length,3);});
test('built-in links round-trip every vector, crop, weather and grade field, paused',()=>{const p=makeProject('urban');p.time=3.29;p.layers[0].strokes.push({id:'mask',mode:'erase',radius:.2,softness:38,angle:29,points:[{x:.4,y:.3}]});p.layers[0].flipX=true;p.layers[0].rotation=27;p.weather.dust.enabled=true;p.weather.dust.angle=37;assert.deepEqual(decodeProject('#studio='+encodeProject(p)),{...p,paused:true});});
test('private image URLs, executable data, invalid kinds and foreign versions are rejected',()=>{const p=makeProject();for(const asset of ['https://evil.test/image.jpg','data:image/svg+xml,script','/foreign.png']){p.layers[0].asset=asset;assert.throws(()=>validateProject(p));}p.layers[0].asset='local-'+crypto.randomUUID();assert.equal(privateAssets(p).length,1);assert.throws(()=>encodeProject(p));assert.throws(()=>validateProject({...makeProject(),version:2}));});
test('nonfinite values, duplicate layers, oversized arrays and 11 distinct private images are rejected',()=>{const p=makeProject();p.layers[0].x=Infinity;assert.throws(()=>validateProject(p));p.layers[0].x=.5;p.layers.push(structuredClone(p.layers[0]));assert.throws(()=>validateProject(p));const images=Array.from({length:11},()=>layer('image','local-'+crypto.randomUUID()));assert.throws(()=>validateProject({...makeProject(),layers:images}));assert.throws(()=>validateProject({...makeProject(),layers:Array.from({length:13},()=>layer('shape'))}));assert.equal(LIMITS.assets,10);});
test('finite values clamp and all offered blend, text and shape options survive validation',()=>{const p=makeProject('editorial');p.layers[0].grade.exposure=900;p.layers[0].x=-900;p.layers[1].blend='overlay';p.layers[1].text='<script>plain text only</script>';p.layers[1].font='monospace';const v=validateProject(p);assert.equal(v.layers[0].grade.exposure,2);assert.equal(v.layers[0].x,-2);assert.equal(v.layers[1].text,p.layers[1].text);assert.equal(v.layers[1].blend,'overlay');});
test('motion field is localized, bounded, and a painted anchor freezes its core',()=>{const l=layer('image');l.pins=[{id:'test',x:.5,y:.5,angle:0,strength:100,radius:.4}];assert.ok(fieldAt(l,.5,.5).x>.9);assert.equal(fieldAt(l,.1,.1).x,0);l.strokes=[{id:'freeze',mode:'freeze',radius:.2,softness:50,angle:0,points:[{x:.5,y:.5}]}];assert.equal(fieldAt(l,.5,.5).x,0);assert.ok(fieldAt(l,.62,.5).x>0);});
test('loop phase is deterministic and approaches the endpoint continuously',()=>{for(const duration of [4,8,12]){assert.equal(loopPhase(duration,duration),0);assert.equal(loopPhase(-duration,duration),0);const e=.001,a=Math.sin(loopPhase(duration-e,duration)*Math.PI*2),b=Math.sin(loopPhase(e,duration)*Math.PI*2);assert.ok(Math.abs(a-b)<.004);}});

test('duplicate motion and stroke identifiers are rejected before import',()=>{const p=makeProject();p.layers[0].pins.push({...p.layers[0].pins[0]});assert.throws(()=>validateProject(p),/Duplicate/);const q=makeProject();q.layers[0].strokes.push({...q.layers[0].strokes[0]});assert.throws(()=>validateProject(q),/Duplicate/);});

// Numeric inputs can paste fractions even when their step is one.
test('live cycle normalization matches validation and links for motion and every weather effect',()=>{
 for(const [input,expected]of [[1.5,2],[1.49,1],[2.5,3],[3.75,4],[-10,1],[10,4]]){
  assert.equal(normalizeCycleCount(input),expected);
  const p=makeProject();p.layers[0].motion.cycles=input;
  for(const w of Object.values(p.weather))w.cycles=input;
  const valid=validateProject(p),shared=decodeProject('#studio='+encodeProject(p));
  assert.equal(valid.layers[0].motion.cycles,expected);
  for(const key of ['rain','fog','dust','rays'])assert.equal(valid.weather[key].cycles,expected);
  assert.deepEqual(shared,{...valid,paused:true});
 }
 for(const input of [NaN,Infinity,-Infinity,'2',null,undefined])assert.throws(()=>normalizeCycleCount(input),/invalid number/);
});
