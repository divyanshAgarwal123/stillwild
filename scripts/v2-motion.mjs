import {chromium,expect} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {makePreset,STORAGE_KEY} from '../src/model.ts';
const out=resolve('.asyncly/visual-captures/v2');await mkdir(out,{recursive:true});let browser,context;const timer=setTimeout(()=>void browser?.close(),75000);const captures=[];
try{
 browser=await chromium.launch({executablePath:process.env.STILLWILD_CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,timeout:15000});
 for(const theme of ['paper','natural','ink','future']){
  context=await browser.newContext({viewport:{width:1440,height:1180},deviceScaleFactor:1});const state=makePreset(theme==='ink'?'rain':'garden',0,theme);state.frozen=false;
  await context.addInitScript(({state,key})=>{localStorage.setItem(key,JSON.stringify(state));localStorage.setItem('stillwild.reduced','false');},{state,key:STORAGE_KEY});
  const page=await context.newPage();await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});await page.evaluate(async()=>{const{preloadAssets}=await import('/src/assets.ts');await preloadAssets();});const target=page.locator('.artwork canvas');await expect(target).toBeVisible();const bounds=await target.boundingBox();if(bounds.y+bounds.height>1180)throw new Error('Motion target must fit viewport');
  const result=await page.evaluate(async()=>{
   const canvas=document.querySelector('.artwork canvas'),stream=canvas.captureStream(24),chunks=[],frames=[];let recorder,raf=0;
   try{
    recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:1600000});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};const done=new Promise(r=>recorder.onstop=r);recorder.start();const start=performance.now();let next=0;
    await new Promise(resolve=>{const tick=now=>{if(next<5&&now-start>=next*600){frames.push(canvas.toDataURL('image/jpeg',.88));next++;}if(now-start>=3000)resolve();else raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);});recorder.stop();await done;const blob=new Blob(chunks,{type:'video/webm'});return {video:Array.from(new Uint8Array(await blob.arrayBuffer())),frames,width:canvas.width,height:canvas.height};
   }finally{cancelAnimationFrame(raf);if(recorder?.state==='recording')recorder.stop();stream.getTracks().forEach(t=>t.stop());}
  });
  if(result.frames.length!==5||result.frames[0]===result.frames.at(-1))throw new Error(theme+' needs five visibly different deterministic-time frames');await writeFile(resolve(out,`${theme}-motion.webm`),Buffer.from(result.video));for(let i=0;i<result.frames.length;i++)await writeFile(resolve(out,`${theme}-motion-${i}.jpg`),Buffer.from(result.frames[i].split(',')[1],'base64'));captures.push({theme,selector:'.artwork canvas',durationMs:3000,frameCount:5,width:result.width,height:result.height,video:resolve(out,`${theme}-motion.webm`)});console.log('MOTION',theme,result.frames.length,'frames,',result.video.length,'bytes');await context.close();context=null;
 }
 await writeFile(resolve(out,'motion-report.json'),JSON.stringify({result:'passed',origin:'http://127.0.0.1:5173',checkedAt:new Date().toISOString(),captures},null,2));
 await writeFile(resolve(out,'motion-replay.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Stillwild Atelier — motion review</title><style>body{font:14px system-ui;color:#526742;background:#f7f8ef;max-width:1250px;padding:28px;margin:auto}h1,h2{font-family:Georgia;font-weight:400}p{font-size:12px;color:#869675;line-height:1.8}video{width:100%;border:6px solid #e4ebd7;border-radius:6px}h2{margin-top:30px}</style><h1>Stillwild, in motion.</h1><p>Three seconds per family, captured from the actual running Canvas at production timing. Each clip plays once when started. No sound or interface controls are included.</p>${captures.map(c=>`<h2>${c.theme[0].toUpperCase()+c.theme.slice(1)}</h2><video controls playsinline preload="metadata" poster="${c.theme}-motion-0.jpg" src="${c.theme}-motion.webm"></video>`).join('')}</html>`);
}finally{clearTimeout(timer);await context?.close();await browser?.close();}
