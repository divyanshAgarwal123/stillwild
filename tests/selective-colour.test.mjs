import test from 'node:test';import assert from 'node:assert/strict';
import {DEFAULT_SELECTIVE_COLOUR as defaults,validateSelectiveColour,rgbHSV,hsvRGB,selectiveParams,selectivePixel} from '../src/photo/selectiveColour.ts';
import {makeProject,validateProject,encodeProject,decodeProject,layer} from '../src/photo/model.ts';
import {configureMotionLayer} from '../src/photo/motion.ts';
const active={...defaults,enabled:true},p=selectiveParams(active),near=(a,b,e=1e-8)=>assert.ok(Math.abs(a-b)<e,`${a} ≠ ${b}`);
test('legacy projects and links remain byte-equivalent with no optional selective field',()=>{
 for(const direction of ['nature','urban','editorial']){const original=makeProject(direction),text=JSON.stringify(original);assert.equal(JSON.stringify(validateProject(original)),text);assert.deepEqual(decodeProject('#studio='+encodeProject(original)),{...original,paused:true});assert.ok(original.layers.every(l=>!Object.hasOwn(l,'selectiveColour')));}
});
test('selective metadata strictly bounds switches, hex colours and finite values; no nonmedia state',()=>{
 assert.deepEqual(validateSelectiveColour(active),active);
 for(const bad of [null,[],{}, {...active,enabled:1},{...active,source:'#f0f'},{...active,target:'red'},...['range','softness','strength'].flatMap(key=>[NaN,Infinity,-1,'30'].map(v=>({...active,[key]:v}))),{...active,range:181},{...active,softness:91},{...active,strength:101},{...active,key:'secret'}])assert.throws(()=>validateSelectiveColour(bad));
 const q=makeProject('editorial');q.layers[1].selectiveColour=active;assert.throws(()=>validateProject(q),/media/);
});
test('circular matching crosses red 0/360 and converges selected hues to violet',()=>{
 const params=selectiveParams({...active,source:'#ff0000',range:12,softness:8});
 for(const degrees of [0,1,359,5,355]){const source=hsvRGB(degrees/360,.7,.8),changed=selectivePixel(...source,params),hsv=rgbHSV(...changed);near(hsv[0],p.target);near(hsv[1],.7);near(hsv[2],.8);}
});
test('matching preserves per-pixel saturation and value instead of painting a flat swatch',()=>{
 for(const saturation of [.3,.5,.8,1])for(const value of [.15,.5,1]){const input=hsvRGB(p.source,saturation,value),output=selectivePixel(...input,p),hsv=rgbHSV(...output);near(hsv[0],p.target);near(hsv[1],saturation);near(hsv[2],value);}
});
test('absence, disabled, Before and strength zero are exact identity, including out-of-gamut grade intermediates',()=>{
 for(const params of [selectiveParams(undefined),selectiveParams(defaults),selectiveParams({...active,strength:0}),selectiveParams(active,true)])for(const rgb of [[1,.1,.2],[.5,.5,.5],[0,0,0],[-.1,.8,1.2]])assert.deepEqual(selectivePixel(...rgb,params),rgb);
});
test('greys, low saturation, black, unselected greens and cyans remain exact',()=>{
 for(const rgb of [[.5,.5,.5],[.5,.49,.49],[0,0,0],[0,.8,.1],[0,.8,.8],[.1,.5,.9]])assert.deepEqual(selectivePixel(...rgb,p),rgb);
 assert.equal(selectiveParams({...active,source:'#888888'}),null);assert.equal(selectiveParams({...active,target:'#ffffff'}),null);
});
test('soft edges and partial strength interpolate along the short hue arc without changing saturation/value',()=>{
 const rgb=hsvRGB((p.source+50/360)%1,.8,.7),full=selectivePixel(...rgb,p),hsv=rgbHSV(...full);assert.notDeepEqual(full,rgb);assert.ok(Math.abs(hsv[0]-p.target)>1e-4);near(hsv[1],.8);near(hsv[2],.7);
 const half=selectivePixel(...hsvRGB(p.source,.8,.7),selectiveParams({...active,strength:50}));near(rgbHSV(...half)[0],(p.source+p.target)/2);
 const hard=selectiveParams({...active,range:0,softness:0});assert.deepEqual(selectivePixel(...hsvRGB(.2,.8,.7),hard),hsvRGB(.2,.8,.7));
});
test('built-in shares, duplicate and generated video snapshots retain independent editable settings',()=>{
 const original=makeProject();original.layers[0].selectiveColour={...active};const shared=decodeProject('#studio='+encodeProject(original));assert.deepEqual(shared.layers[0].selectiveColour,active);
 const copy=structuredClone(original.layers[0]);copy.selectiveColour.target='#00ff00';assert.equal(original.layers[0].selectiveColour.target,active.target);
 const video=configureMotionLayer(layer('video','local-'+crypto.randomUUID()),5,'kling',5,original.layers[0]);assert.deepEqual(video.selectiveColour,active);assert.notEqual(video.selectiveColour,original.layers[0].selectiveColour);assert.equal(video.cropZoom,1);
 const valid=validateProject({...original,layers:[...original.layers,video]});assert.deepEqual(valid.layers.at(-1).selectiveColour,active);assert.ok(Object.values(valid.layers[0].grade).every(v=>typeof v==='number'));
});
