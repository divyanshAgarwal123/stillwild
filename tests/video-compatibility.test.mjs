import test from 'node:test';
import assert from 'node:assert/strict';
import {makeProject,layer,validateProject,privateAssets,encodeProject} from '../src/photo/model.ts';
import {configureMotionLayer} from '../src/photo/motion.ts';
test('video schema preserves old image projects and bounds media/trim without leaking in links',()=>{const old=makeProject();assert.deepEqual(validateProject(old),old);const l=layer('video','local-'+crypto.randomUUID());const p={...old,layers:[...old.layers,l]};assert.deepEqual(validateProject(p),p);assert.equal(privateAssets(p).length,1);assert.throws(()=>encodeProject(p));for(const clip of [{in:3,out:2,speed:1,blend:0},{in:0,out:.01,speed:1,blend:0},{in:0,out:1,speed:1,blend:.7}])assert.throws(()=>validateProject({...p,layers:[{...l,clip}]}));assert.throws(()=>validateProject({...p,layers:Array.from({length:4},()=>layer('video','local-'+crypto.randomUUID()))}));});
test('Kling insertion keeps source and newer edits, copies editable attributes once and serializes provenance without assumed FPS',()=>{
 const p=makeProject('editorial'),source=structuredClone(p.layers[0]);source.w=.6;source.h=.9;source.cropZoom=1.8;source.cropX=.3;source.rotation=13;source.flipX=true;source.grade.exposure=.8;source.strokes=[{id:'mask',mode:'erase',radius:.1,softness:50,angle:0,points:[{x:.2,y:.3}]}];
 const before=structuredClone(source),n=configureMotionLayer(layer('video','local-'+crypto.randomUUID()),5,'kling',5,source);
 assert.deepEqual(source,before);assert.deepEqual(n.grade,source.grade);assert.notEqual(n.grade,source.grade);assert.deepEqual(n.strokes,source.strokes);assert.equal(n.rotation,13);assert.equal(n.flipX,true);assert.equal(n.cropZoom,1);assert.equal(n.cropX,.5);assert.equal(n.clip.provider,'kling');assert.equal(n.clip.timing,'fit');assert.equal(n.clip.blend,.2);assert.equal(n.clip.fps,undefined);assert.equal(n.clip.smooth,undefined);
 p.layers[0].grade.exposure=-.5;p.layers.push(n);const valid=validateProject(JSON.parse(JSON.stringify(p)));assert.equal(valid.layers[0].grade.exposure,-.5);assert.equal(valid.layers.at(-1).clip.provider,'kling');
 assert.equal(configureMotionLayer(layer('video'),4,'wan',4).clip.fps,16);assert.equal(configureMotionLayer(layer('video'),4,'google').clip.timing,undefined);
});


test('legacy Google/Kling and new custom provenance validate and retain unknown cadence',()=>{for(const provider of ['google','kling','custom']){const p=makeProject(),v=configureMotionLayer(layer('video','local-'+crypto.randomUUID()),4,provider);p.layers.push(v);const restored=validateProject(JSON.parse(JSON.stringify(p)));assert.equal(restored.layers.at(-1).clip.provider,provider);assert.equal(restored.layers.at(-1).clip.fps,undefined);assert.equal(restored.layers.at(-1).clip.smooth,undefined);}const p=makeProject();p.layers.push({...layer('video','local-'+crypto.randomUUID()),clip:{in:0,out:4,speed:1,blend:0,provider:'unknown'}});assert.throws(()=>validateProject(p));});

test('custom reanimation preserves latest video crop/matte/grade and immutable Undo history',async()=>{
 const {applyAnimation}=await import('../src/photo/handoff.ts');const {makeWallpaper}=await import('../src/photo/model.ts');
 const p=makeWallpaper('forest-falcade'),source=structuredClone(p.layers[0]);const first=applyAnimation(p,{source,projectId:p.id},'local-'+crypto.randomUUID(),4,'custom',4).project;
 const v=first.layers.find(l=>l.kind==='video');v.cropZoom=1.8;v.cropX=.3;v.cropY=.6;v.grade.exposure=.6;v.strokes=[{id:'mask',mode:'erase',radius:.1,softness:55,angle:0,points:[{x:.4,y:.5}]}];
 const undo=structuredClone(first),second=applyAnimation(first,{source,projectId:p.id,appearanceId:v.id},'local-'+crypto.randomUUID(),4,'custom',4).project,n=second.layers.find(l=>l.kind==='video');
 assert.deepEqual(first,undo);assert.equal(n.cropZoom,1.8);assert.equal(n.cropX,.3);assert.equal(n.cropY,.6);assert.equal(n.grade.exposure,.6);assert.deepEqual(n.strokes,v.strokes);assert.equal(n.clip.provider,'custom');assert.equal(n.clip.fps,undefined);assert.equal(second.layers.length,2);assert.notEqual(n.asset,v.asset);
});

test('retained result is applied only while its video asset exists in its project; Undo permits reapply',async()=>{
 const {applyAnimation,animationApplied}=await import('../src/photo/handoff.ts');const {makeWallpaper}=await import('../src/photo/model.ts');
 const original=makeWallpaper('dunes-light'),source=structuredClone(original.layers[0]),snapshot={source,projectId:original.id},asset='local-'+crypto.randomUUID(),retained={projectId:original.id,asset:{id:asset}};
 assert.equal(animationApplied(original,null),false);assert.equal(animationApplied(original,retained),false);
 const first=applyAnimation(original,snapshot,asset,4,'custom',4).project;assert.equal(animationApplied(first,retained),true);
 const undo=structuredClone(original);assert.equal(animationApplied(undo,retained),false);
 const reapplied=applyAnimation(undo,snapshot,asset,4,'custom',4).project;assert.equal(animationApplied(reapplied,retained),true);assert.equal(reapplied.layers.filter(l=>l.kind==='video').length,1);assert.equal(animationApplied({...reapplied,id:crypto.randomUUID()},retained),false);
 assert.equal(animationApplied({...reapplied,layers:reapplied.layers.filter(l=>l.kind!=='video')},retained),false);
});
