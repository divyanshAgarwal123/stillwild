import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const base=process.env.STILLWILD_URL||'http://127.0.0.1:5173';
const out=resolve('.asyncly/visual-captures');await mkdir(out,{recursive:true});
const results=[],errors=[],contexts=[];
let browser;
const timeout=setTimeout(()=>{errors.push('Overall browser verification exceeded 180 seconds');void browser?.close();},180000);
const digest=data=>createHash('sha256').update(data).digest('hex');
const log=(name,detail={})=>{results.push({name,status:'passed',...detail});console.log('PASS',name);};
const saved=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('stillwild.composition.v1')));
const frame=async page=>{await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));return page.locator('.artwork canvas').evaluate(el=>el.toDataURL());};
const waitSave=page=>expect.poll(()=>saved(page)).not.toBeNull();
const setRange=async(page,label,value)=>{
 const range=page.getByRole('slider',{name:label,exact:true});
 await range.evaluate((el,v)=>{el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:11,pointerType:'mouse'}));const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));el.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:11}));},String(value));
 await expect(range).toHaveValue(String(value));
};
async function visibleCanvas(page){const box=await page.locator('.artwork canvas').boundingBox();assert.ok(box&&box.x>=0&&box.y>=0&&box.x+box.width<=page.viewportSize().width+1&&box.y+box.height<=page.viewportSize().height+1,'Critical artwork must be fully visible in viewport');await expect(page.locator('.artwork canvas')).toBeVisible();return box;}
async function shareLink(page){await page.getByRole('button',{name:'Share',exact:true}).click();const url=await page.locator('#share-link').inputValue();const state=JSON.parse(Buffer.from(new URLSearchParams(new URL(url).hash.slice(1)).get('art'),'base64').toString());assert.equal(state.frozen,true);await page.getByRole('button',{name:'Close dialog'}).click();return {url,state};}
async function download(page,name){const event=page.waitForEvent('download');await page.getByRole('button',{name:'Export image',exact:true}).click();const file=await event;await file.saveAs(resolve(out,name));const bytes=await readFile(resolve(out,name));assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.equal(bytes.readUInt32BE(16),3840);assert.equal(bytes.readUInt32BE(20),2160);return {bytes,sha256:digest(bytes)};}
async function context(options={}){
 const c=await browser.newContext({viewport:{width:1440,height:1100},deviceScaleFactor:1,acceptDownloads:true,...options});contexts.push(c);
 await c.addInitScript(()=>{window.__mainDraws=0;const original=CanvasRenderingContext2D.prototype.clearRect;CanvasRenderingContext2D.prototype.clearRect=function(...args){if(this.canvas.closest?.('.artwork'))window.__mainDraws++;return original.apply(this,args);};});
 return c;
}
async function newPage(c,url=base){const page=await c.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.goto(url,{waitUntil:'networkidle'});return page;}
async function ensurePaused(page){const pause=page.getByRole('button',{name:'Pause animation',exact:true});if(await pause.count())await pause.click();await expect(page.getByRole('button',{name:'Play animation',exact:true})).toBeVisible();await page.waitForTimeout(350);}
async function drag(page,x,y,dx,dy){const box=await page.locator('.artwork canvas').boundingBox();await page.mouse.move(box.x+box.width*x,box.y+box.height*y);await page.mouse.down();await page.mouse.move(box.x+box.width*(x+dx),box.y+box.height*(y+dy),{steps:8});await page.mouse.up();}
try{
 browser=await chromium.launch({executablePath:process.env.STILLWILD_CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,timeout:15000});
 const c=await context(),page=await newPage(c);await visibleCanvas(page);await ensurePaused(page);await waitSave(page);
 const idle=await page.evaluate(()=>window.__mainDraws);await page.waitForTimeout(600);assert.equal(await page.evaluate(()=>window.__mainDraws),idle);log('Paused canvas performs no continuous redraws');
 const initial=await saved(page);
 await drag(page,.60,.66,-.08,-.06);
 await expect.poll(async()=>((await saved(page)).objects.find(o=>o.kind==='arch').x)).toBeCloseTo(.52,1);
 const moved=await saved(page);assert.notEqual(moved.objects[0].y,initial.objects[0].y);
 await page.getByRole('button',{name:'Undo',exact:true}).click();await expect.poll(async()=>(await saved(page)).objects[0].x).toBe(initial.objects[0].x);log('Paper arch hit testing, pointer dragging, saved coordinates, and undo');
 await page.getByRole('button',{name:'Select Fern 2',exact:true}).click();const beforeMove=(await saved(page)).objects.find(o=>o.id==='plant-0').x;await page.locator('.artwork canvas').focus();await page.keyboard.press('ArrowRight');await expect.poll(async()=>(await saved(page)).objects.find(o=>o.id==='plant-0').x).toBeGreaterThan(beforeMove);log('Keyboard object movement');
 await page.getByRole('button',{name:'Select Paper arch 1',exact:true}).click();await setRange(page,'Size',95);await setRange(page,'Rotation',-12);await expect.poll(async()=>(await saved(page)).objects[0].scale).toBe(.95);log('Paper size and rotation controls');
 const beforeLight=await frame(page);await page.getByRole('button',{name:'Move light',exact:true}).click();await drag(page,.73,.18,-.5,.15);await page.getByRole('button',{name:'Done',exact:true}).click();await expect.poll(async()=>(await saved(page)).light.x).toBeCloseTo(.23,1);assert.notEqual(await frame(page),beforeLight);
 const shadowDelta=await page.evaluate(async()=>{const {drawArtwork}=await import('/src/art.ts');const {makePreset}=await import('/src/model.ts');const s=makePreset();s.objects=s.objects.filter(o=>o.kind==='arch');s.light.intensity=0;const canvas=document.createElement('canvas');canvas.width=800;canvas.height=450;const ctx=canvas.getContext('2d');s.light.x=.05;drawArtwork(ctx,s,16,800,450);const a=ctx.getImageData(0,0,800,450).data;s.light.x=.95;drawArtwork(ctx,s,16,800,450);const b=ctx.getImageData(0,0,800,450).data;let changed=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])>4)changed++;return changed;});assert.ok(shadowDelta>300,'Moving the light must move cast shadows even without changing the background');log('Movable light visibly moves cast shadows independently of glow',{changedShadowPixels:shadowDelta});
 for(const name of ['Forest hush','Afterglow','Golden hour']){await page.getByRole('button',{name:`Apply ${name} preset`}).click();await expect(page.getByRole('button',{name:`Apply ${name} preset`})).toHaveAttribute('aria-pressed','true');await visibleCanvas(page);}await ensurePaused(page);log('All three Shadow Garden presets render immediately');
 await page.getByRole('button',{name:'Sage palette'}).click();await setRange(page,'Wind',61);await setRange(page,'Warmth & glow',41);await expect.poll(async()=>(await saved(page)).wind).toBe(61);
 const persisted=await saved(page);await page.reload({waitUntil:'networkidle'});assert.deepEqual(await saved(page),persisted);await expect(page.getByRole('button',{name:'Sage palette'})).toHaveAttribute('aria-pressed','true');await expect(page.getByRole('button',{name:'Play animation',exact:true})).toBeVisible();log('Palette, wind, light, objects, and pause survive reload');
 await page.getByRole('button',{name:'Play animation',exact:true}).click();const moving=await frame(page);await page.waitForTimeout(500);assert.notEqual(await frame(page),moving);await ensurePaused(page);log('Gentle wind animates and resumes cleanly');
 await page.getByRole('switch',{name:'Reduced motion'}).click();const reducedCount=await page.evaluate(()=>window.__mainDraws);await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>window.__mainDraws),reducedCount);await page.getByRole('button',{name:'Terracotta palette'}).click();await page.waitForTimeout(100);assert.ok(await page.evaluate(()=>window.__mainDraws)>reducedCount);await page.getByRole('switch',{name:'Reduced motion'}).click();log('Explicit reduced motion stops redraws and still redraws edits');
 const gardenShare=await shareLink(page);const fresh=await context();await fresh.addInitScript(()=>{localStorage.setItem('stillwild.paused','false');localStorage.setItem('stillwild.reduced','false');});const gardenCopy=await newPage(fresh,gardenShare.url);await expect(gardenCopy.getByRole('button',{name:'Play animation',exact:true})).toBeVisible();await expect.poll(()=>saved(gardenCopy)).toEqual(gardenShare.state);assert.equal(digest(await frame(gardenCopy)),digest(await frame(page)),'Garden preview pixel hashes must match');log('New-tab garden share restores exact frozen pixels regardless of local play');
 const gardenExport=await download(page,'shadow-garden-4k.png'),copyExport=await download(gardenCopy,'shadow-garden-shared-4k.png');assert.equal(gardenExport.sha256,copyExport.sha256);
 const parity=await page.evaluate(async()=>{const {exportArtwork}=await import('/src/art.ts');const s=JSON.parse(localStorage.getItem('stillwild.composition.v1'));const blob=await exportArtwork(s,s.time);return Array.from(new Uint8Array(await blob.arrayBuffer()));});assert.equal(digest(Buffer.from(parity)),gardenExport.sha256);log('Garden export is a real 3840×2160 artwork-only PNG; shared export is byte-identical',{sha256:gardenExport.sha256});
 await page.getByRole('button',{name:'Reset',exact:true}).click();await ensurePaused(page);await visibleCanvas(page);await page.screenshot({path:resolve(out,'shadow-garden-desktop.jpg'),type:'jpeg',quality:90});
 await page.getByRole('button',{name:'Enter fullscreen wallpaper'}).click();await expect(page.locator('.app')).toHaveClass(/wallpaper-mode/);await expect(page.locator('.topbar')).toBeHidden();await expect(page.locator('.inspector')).toBeHidden();assert.equal(await page.evaluate(()=>!!document.fullscreenElement),true);await page.waitForTimeout(5200);await visibleCanvas(page);await page.screenshot({path:resolve(out,'garden-wallpaper.jpg'),type:'jpeg',quality:90});await page.keyboard.press('Escape');await expect(page.locator('.topbar')).toBeVisible();assert.equal(await page.evaluate(()=>!!document.fullscreenElement),false);log('Native fullscreen hides studio controls and Escape returns to studio');
 // Shadow Garden core has passed before Rainprint acceptance begins.
 await page.getByRole('button',{name:/^Rainprint/}).click();await page.setViewportSize({width:1440,height:1250});await ensurePaused(page);await visibleCanvas(page);await page.screenshot({path:resolve(out,'rainprint-desktop.jpg'),type:'jpeg',quality:90});
 const clouds=await saved(page);await drag(page,.27,.20,.09,.08);await expect.poll(async()=>(await saved(page)).objects[0].x).toBeCloseTo(.36,1);await page.getByRole('button',{name:'Undo',exact:true}).click();await expect.poll(async()=>(await saved(page)).objects[0].x).toBe(clouds.objects[0].x);log('Rainprint cloud hit testing, dragging, and undo');
 const wash=await frame(page);await setRange(page,'Rainfall',80);await setRange(page,'Pigment',95);await setRange(page,'Drift',75);assert.notEqual(await frame(page),wash);await expect.poll(async()=>(await saved(page)).ink).toBe(95);log('Independent rainfall, pigment, and wind controls update the watercolor');
 await page.getByRole('button',{name:'Play animation',exact:true}).click();const rainBefore=await frame(page);await page.waitForTimeout(500);assert.notEqual(await frame(page),rainBefore);await ensurePaused(page);const rainFrozen=await frame(page);await page.waitForTimeout(400);assert.equal(await frame(page),rainFrozen);log('Rain animates and freeze-a-moment pauses exact droplets and blooms');
 for(const name of ['Forest hush','Afterglow','Golden hour'])await page.getByRole('button',{name:`Apply ${name} preset`}).click();await ensurePaused(page);
 const rainShare=await shareLink(page);const rainCopy=await newPage(fresh,rainShare.url);await rainCopy.setViewportSize({width:1440,height:1250});await expect.poll(()=>saved(rainCopy)).toEqual(rainShare.state);await expect(rainCopy.getByRole('button',{name:'Play animation',exact:true})).toBeVisible();const rainFrameCopy=await frame(rainCopy),rainFrameOriginal=await frame(page);if(digest(rainFrameCopy)!==digest(rainFrameOriginal)){await writeFile(resolve(out,'rain-share-original.png'),Buffer.from(rainFrameOriginal.split(',')[1],'base64'));await writeFile(resolve(out,'rain-share-copy.png'),Buffer.from(rainFrameCopy.split(',')[1],'base64'));console.log('Rain share diagnostic',JSON.stringify({payload:rainShare.state,original:await saved(page),copy:await saved(rainCopy),originalCanvas:await page.locator('.artwork canvas').evaluate(c=>({width:c.width,height:c.height})),copyCanvas:await rainCopy.locator('.artwork canvas').evaluate(c=>({width:c.width,height:c.height}))}));}assert.equal(digest(rainFrameCopy),digest(rainFrameOriginal),'Rain preview pixel hashes must match');
 const rainExport=await download(page,'rainprint-4k.png'),rainCopyExport=await download(rainCopy,'rainprint-shared-4k.png');assert.equal(rainExport.sha256,rainCopyExport.sha256);assert.notEqual(rainExport.sha256,gardenExport.sha256);log('Rain link freezes exact pixels; both real 3840×2160 rain exports match',{sha256:rainExport.sha256});
 const rainState=await saved(page);await page.reload({waitUntil:'networkidle'});assert.deepEqual(await saved(page),rainState);log('Rain composition and frozen time survive reload');
 // Reduced-motion preference must work on a fresh device without local settings.
 const reducedContext=await context({reducedMotion:'reduce'}),reducedPage=await newPage(reducedContext);await expect(reducedPage.getByRole('switch',{name:'Reduced motion'})).toHaveAttribute('aria-checked','true');const systemCount=await reducedPage.evaluate(()=>window.__mainDraws);await reducedPage.waitForTimeout(450);assert.equal(await reducedPage.evaluate(()=>window.__mainDraws),systemCount);log('System prefers-reduced-motion is honored on first visit');
 const mobileContext=await context({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),mobile=await newPage(mobileContext);await ensurePaused(mobile);await visibleCanvas(mobile);assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await mobile.screenshot({path:resolve(out,'shadow-garden-mobile.jpg'),type:'jpeg',quality:90});
 const touch=await mobileContext.newCDPSession(mobile);const box=await mobile.locator('.artwork canvas').boundingBox();const sx=box.x+box.width*.6,sy=box.y+box.height*.66;
 await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:sx,y:sy}]});await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:sx-25,y:sy-14}]});await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect.poll(async()=>(await saved(mobile)).objects[0].x).toBeLessThan(.56);log('390px mobile layout has no overflow and real touch drags the paper arch');
 await mobile.getByRole('button',{name:/^Rainprint/}).click();await ensurePaused(mobile);await visibleCanvas(mobile);await mobile.screenshot({path:resolve(out,'rainprint-mobile.jpg'),type:'jpeg',quality:90});const rb=await mobile.locator('.artwork canvas').boundingBox();const rx=rb.x+rb.width*.27,ry=rb.y+rb.height*.2;await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rx,y:ry}]});await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:rx+25,y:ry+12}]});await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect.poll(async()=>(await saved(mobile)).objects[0].x).toBeGreaterThan(.3);await touch.detach();log('Rain clouds support real touch dragging on narrow mobile');
 // Motion evidence: bounded, deterministic keyframes plus a real-time browser replay.
 const motionState=await saved(page);const motion=await page.evaluate(async s=>{const {drawArtwork}=await import('/src/art.ts');const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=675;return [0,.5,1,1.5,2].map(offset=>{drawArtwork(canvas.getContext('2d'),s,s.time+offset,1200,675);return canvas.toDataURL('image/jpeg',.88);});},motionState);
 for(let i=0;i<motion.length;i++)await writeFile(resolve(out,`rain-motion-${i}.jpg`),Buffer.from(motion[i].split(',')[1],'base64'));
 assert.notEqual(motion[0],motion[4]);log('Five deterministic rain motion frames captured at production timing');
 const gardenMotion=await reducedPage.evaluate(async()=>{const {drawArtwork}=await import('/src/art.ts');const {makePreset}=await import('/src/model.ts');const s=makePreset();const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=675;return [0,.5,1,1.5,2].map(offset=>{drawArtwork(canvas.getContext('2d'),s,s.time+offset,1200,675);return canvas.toDataURL('image/jpeg',.88);});});
 for(let i=0;i<gardenMotion.length;i++)await writeFile(resolve(out,`garden-motion-${i}.jpg`),Buffer.from(gardenMotion[i].split(',')[1],'base64'));assert.notEqual(gardenMotion[0],gardenMotion[4]);log('Five deterministic botanical wind motion frames captured');
 for(const scene of ['garden','rain']){
  const video=await page.evaluate(async scene=>{
   const {drawArtwork}=await import('/src/art.ts');const {makePreset}=await import('/src/model.ts');const s=makePreset(scene);
   const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=675;const ctx=canvas.getContext('2d');
   const stream=canvas.captureStream(24),chunks=[];let raf=0,recorder;
   try{
    recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:1800000});
    recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
    const done=new Promise(resolve=>{recorder.onstop=resolve;});recorder.start();
    const start=performance.now();await new Promise(resolve=>{
     const render=now=>{drawArtwork(ctx,s,s.time+(now-start)/1000,1200,675);if(now-start>=3000)resolve();else raf=requestAnimationFrame(render);};raf=requestAnimationFrame(render);
    });recorder.stop();await done;const blob=new Blob(chunks,{type:'video/webm'});return Array.from(new Uint8Array(await blob.arrayBuffer()));
   }finally{cancelAnimationFrame(raf);if(recorder?.state==='recording')recorder.stop();stream.getTracks().forEach(track=>track.stop());}
  },scene);
  await writeFile(resolve(out,`${scene}-motion.webm`),Buffer.from(video));
 }
 log('Three-second artwork-only real-time replays recorded for both scenes; streams closed');
 const malformed=await newPage(await context(),base+'/#art=broken');await expect(malformed.getByRole('heading',{name:'Shadow Garden.'})).toBeVisible();await expect(malformed.locator('.toast[role="status"]')).toContainText('could not be restored');log('Invalid share link recovers safely with a clear notice');
 assert.deepEqual(errors,[],'Browser must have no uncaught errors or failed console requests');
}catch(e){errors.push(e.stack||String(e));console.error(e);process.exitCode=1;}
finally{
 clearTimeout(timeout);for(const c of contexts)await c.close().catch(()=>{});await browser?.close().catch(()=>{});
 const report={origin:base,checkedAt:new Date().toISOString(),result:errors.length?'failed':'passed',checks:results,errors};await writeFile(resolve(out,'browser-report.json'),JSON.stringify(report,null,2));
 console.log(`${results.length} checks passed; ${errors.length} errors. Report: ${resolve(out,'browser-report.json')}`);
}
