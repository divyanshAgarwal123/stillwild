// Focused reproduction of the timed-out release Wan export, without repeating
// already-passing interpolation, cache, framing or general control checks.
import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {recordingDiagnostics} from './release-recording-diagnostics.mjs';
const out=resolve(process.env.STILLWILD_EVIDENCE_DIR||'.asyncly/visual-captures/release-retest/wan-export');
await mkdir(out,{recursive:true});let browser,context,page;
const errors=[],consoleMessages=[],events=[],deadline=setTimeout(()=>void browser?.close(),120000);
try{
 browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,timeout:15000});
 context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,acceptDownloads:true});
 await context.addInitScript(()=>localStorage.setItem('stillwild.photo.reduced','false'));
 await context.addInitScript(recordingDiagnostics);
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(['error','warning'].includes(m.type()))consoleMessages.push({type:m.type(),text:m.text()});});
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await page.getByLabel('Import project file',{exact:true}).setInputFiles(resolve('.asyncly/visual-captures/free-wan-api/Forest-free-API.stillwild.json'));
 await expect(page.locator('.p-import-status')).toHaveCount(0,{timeout:20000});
 await page.getByRole('tab',{name:'Motion',exact:true}).click();
 await page.getByRole('combobox',{name:'Known source FPS',exact:true}).selectOption('16');
 await page.getByRole('checkbox',{name:'Source-frame blending',exact:true}).check();
 await page.getByRole('combobox',{name:'Loop timing',exact:true}).selectOption('fit');
 const pause=page.getByRole('button',{name:'Pause loop',exact:true});if(await pause.isVisible())await pause.click();
 await page.getByRole('slider',{name:'Timeline scrub',exact:true}).fill('1.125');
 await page.waitForTimeout(750);
 await page.evaluate(()=>{
  window.__releaseExport={visibility:[],nativeFrames:0};document.addEventListener('visibilitychange',()=>window.__releaseExport.visibility.push({hidden:document.hidden,at:performance.now()}));
  if(window.VideoEncoder){const encode=VideoEncoder.prototype.encode;VideoEncoder.prototype.encode=function(frame,...args){window.__releaseExport.nativeFrames++;return encode.call(this,frame,...args);};}
  else{const original=HTMLCanvasElement.prototype.captureStream;HTMLCanvasElement.prototype.captureStream=function(...args){const stream=original.apply(this,args),t=stream.getVideoTracks()[0],request=t.requestFrame.bind(t);t.requestFrame=()=>{window.__releaseExport.nativeFrames++;request();};return stream;};}
 });
 await page.getByRole('button',{name:'Export',exact:true}).click();
 const downloaded=Promise.race([page.waitForEvent('download',{timeout:45000}),page.waitForFunction(()=>window.__recordingDiagnostics.toasts.some(t=>/could not keep project timing|Video decoding timed out|Video encoder failed/.test(t)),null,{timeout:45000}).then(()=>{throw Error('The UI rejected this export; retained raw recording and diagnostic events.');})]);
 await page.getByRole('button',{name:'Export 4s silent loop',exact:true}).click();
 const file=resolve(out,'wan-fitted-1080p.webm');await(await downloaded).saveAs(file);
 await page.getByRole('button',{name:'Close dialog',exact:true}).click();
 const proof=await page.evaluate(()=>window.__releaseExport);
 const opts={timeout:30000,encoding:'utf8'};
 const video=JSON.parse(execFileSync('ffprobe',['-v','error','-count_frames','-show_streams','-show_format','-of','json',file],opts));
 const stream=video.streams.find(s=>s.codec_type==='video');
 assert.deepEqual([stream.width,stream.height],[1920,1080]);assert.equal(Number(video.format.duration),4);
 assert.equal(video.streams.filter(s=>s.codec_type==='audio').length,0);assert.equal(proof.nativeFrames,96);
 assert.ok(Number(stream.nb_read_frames)>=90);
 execFileSync('ffmpeg',['-v','error','-i',file,'-f','null','-'],opts);
 execFileSync('ffmpeg',['-y','-v','error','-ss','1','-i',file,'-frames:v','1','-vf','scale=1280:720',resolve(out,'decoded-export-review.jpg')],opts);
 const motion=[];await page.getByRole('button',{name:'Play loop',exact:true}).click();
 for(let i=0;i<5;i++){await page.waitForTimeout(600);const path=resolve(out,`motion-${i}.jpg`);await page.locator('.photo-artboard canvas').screenshot({path,type:'jpeg',quality:85});motion.push({path,time:await page.getByLabel('Current time',{exact:true}).innerText()});}
 await page.getByRole('button',{name:'Pause loop',exact:true}).click();
 assert.deepEqual(errors,[]);
 await writeFile(resolve(out,'report.json'),JSON.stringify({result:'passed',checkedAt:new Date().toISOString(),origin:'http://127.0.0.1:5173',checks:[{name:'Focused real Wan fitted 16fps-blended 4s 1080p UI export fully decodes, is silent and requests 96 native frames',result:'passed'}],video,proof,motion:{selector:'.photo-artboard canvas',durationMs:3000,frameCount:5,frames:motion},errors,consoleMessages},null,2));
 console.log('PASS Focused real Wan export',JSON.stringify({frames:stream.nb_read_frames,duration:video.format.duration,proof}));
}catch(e){
 if(page){await page.screenshot({path:resolve(out,'failure.jpg'),type:'jpeg',quality:85}).catch(()=>{});events.push(await page.evaluate(()=>({toast:document.querySelector('.p-toast')?.textContent,progress:document.querySelector('.p-export-progress')?.textContent,hidden:document.hidden,proof:window.__releaseExport,recording:{events:window.__recordingDiagnostics?.events,toasts:window.__recordingDiagnostics?.toasts}})).catch(()=>null));const raw=await page.evaluate(async()=>{const b=window.__recordingDiagnostics?.blob;if(!b)return null;const a=new Uint8Array(await b.arrayBuffer());let s='';for(let i=0;i<a.length;i+=8192)s+=String.fromCharCode(...a.subarray(i,i+8192));return btoa(s);}).catch(()=>null);if(raw)await writeFile(resolve(out,'rejected-raw.webm'),Buffer.from(raw,'base64'));}
 await writeFile(resolve(out,'report.json'),JSON.stringify({result:'failed',error:e.stack,events,errors,consoleMessages},null,2));throw e;
}finally{clearTimeout(deadline);await context?.close();await browser?.close();}
