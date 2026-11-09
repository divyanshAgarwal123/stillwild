import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
const out=resolve(process.env.STILLWILD_EVIDENCE_DIR||'.asyncly/visual-captures/release-retest/reduced-export');
await mkdir(out,{recursive:true});let browser,context,page;const checks=[];
const deadline=setTimeout(()=>void browser?.close(),120000);
const decode=path=>execFileSync('ffmpeg',['-v','error','-i',path,'-vf',"select='eq(n,0)+eq(n,24)+eq(n,48)+eq(n,72)',scale=320:180",'-fps_mode','vfr','-f','rawvideo','-pix_fmt','rgb24','pipe:1'],{timeout:30000,maxBuffer:4*1024*1024});
try{
 browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,timeout:15000});
 context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,acceptDownloads:true});
 page=await context.newPage();await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Open After the rain theme',exact:true}).click();await page.getByRole('button',{name:'Pause loop',exact:true}).click();
 await page.getByRole('combobox',{name:'Loop duration',exact:true}).selectOption('4');await page.getByRole('button',{name:'Reduced motion',exact:true}).click();
 await page.evaluate(()=>{
  const encode=VideoEncoder.prototype.encode;window.__restoreEncode=()=>VideoEncoder.prototype.encode=encode;
  VideoEncoder.prototype.encode=function(frame,...args){const n=window.__native.count++;if(n%24===0){const c=document.createElement('canvas');c.width=frame.displayWidth;c.height=frame.displayHeight;const ctx=c.getContext('2d');ctx.drawImage(frame,0,0);const data=ctx.getImageData(0,0,c.width,c.height).data;if(n===0)window.__native.png=c.toDataURL();window.__native.hashes.push(crypto.subtle.digest('SHA-256',data).then(v=>Array.from(new Uint8Array(v)).map(n=>n.toString(16).padStart(2,'0')).join('')));}return encode.call(this,frame,...args);};
 });
 for(const animate of [false,true]){
  await page.evaluate(()=>window.__native={count:0,hashes:[],png:''});await page.getByRole('button',{name:'Export',exact:true}).click();
  if(animate)await page.getByRole('checkbox',{name:'Explicitly export motion',exact:true}).check();
  const download=page.waitForEvent('download',{timeout:30000});await page.getByRole('button',{name:'Export 4s silent loop',exact:true}).click();
  const path=resolve(out,animate?'override.webm':'frozen.webm');await(await download).saveAs(path);await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  const native=await page.evaluate(async()=>({count:window.__native.count,hashes:await Promise.all(window.__native.hashes)}));
  assert.equal(native.count,96);assert.equal(new Set(native.hashes).size===1,!animate);
  const bytes=decode(path),frameBytes=320*180*3;let mean=0;for(let i=0;i<frameBytes;i++)mean+=Math.abs(bytes[2*frameBytes+i]-bytes[3*frameBytes+i]);mean/=frameBytes;
  let referenceDiff=null;
  if(!animate){
   const control=await page.evaluate(async()=>{
    const {Output,BufferTarget,CanvasSource,WebMOutputFormat}=await import('/node_modules/.vite/deps/mediabunny.js');
    const img=await createImageBitmap(await(await fetch(window.__native.png)).blob()),c=document.createElement('canvas');c.width=1920;c.height=1080;c.getContext('2d').drawImage(img,0,0);img.close();
    const output=new Output({format:new WebMOutputFormat(),target:new BufferTarget()}),source=new CanvasSource(c,{codec:'vp9',bitrate:12_000_000,latencyMode:'realtime',keyFrameInterval:1});
    output.addVideoTrack(source,{frameRate:24});await output.start();for(let i=0;i<96;i++)await source.add(i/24,1/24);source.close();await output.finalize();
    const bytes=new Uint8Array(output.target.buffer);let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);
   });
   const controlPath=resolve(out,'constant-image-control.webm');await writeFile(controlPath,Buffer.from(control,'base64'));
   const reference=decode(controlPath);assert.deepEqual(bytes,reference,'Decoded reduced-motion frames must exactly match a separately encoded constant-image control');referenceDiff=0;
  }else assert.ok(mean>.1,JSON.stringify({mean}));
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-count_frames','-show_entries','stream=codec_name,width,height,nb_read_frames:format=duration:packet=pts_time,duration_time','-of','json',path],{encoding:'utf8',timeout:30000}));
  assert.equal(Number(probe.format.duration),4);assert.deepEqual([probe.streams[0].width,probe.streams[0].height],[1920,1080]);
  const last=probe.packets.at(-1);assert.ok(Number(last.pts_time)+Number(last.duration_time)<=4+1/24);
  const row={name:animate?'Explicit reduced-motion override encodes moving native and decoded frames':'Reduced-motion native frames are identical; decoded output exactly matches independent constant-image codec control',result:'passed',native,decodedSettledMean:mean,decodedControlDifference:referenceDiff,probe,path};checks.push(row);console.log('PASS',row.name,JSON.stringify({mean,referenceDiff}));
 }
 await page.evaluate(()=>window.__restoreEncode());await writeFile(resolve(out,'report.json'),JSON.stringify({result:'passed',checkedAt:new Date().toISOString(),checks},null,2));
}catch(e){await writeFile(resolve(out,'report.json'),JSON.stringify({result:'failed',checks,error:e.stack},null,2));throw e;}
finally{clearTimeout(deadline);await context?.close();await browser?.close();}
