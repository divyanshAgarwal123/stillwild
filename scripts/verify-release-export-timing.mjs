import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
const out=resolve(process.env.STILLWILD_EVIDENCE_DIR||'.asyncly/visual-captures/release-retest/export-timing');
await mkdir(out,{recursive:true});let browser,context,page;
const checks=[],errors=[],downloads=[];const deadline=setTimeout(()=>void browser?.close(),180000);
const pass=(name,details={})=>{checks.push({name,result:'passed',...details});console.log('PASS',name,JSON.stringify(details));};
try{
 browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,timeout:15000});
 context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,acceptDownloads:true});
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('download',d=>downloads.push(d.suggestedFilename()));
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Pause loop',exact:true}).click();
 await page.getByRole('combobox',{name:'Loop duration',exact:true}).selectOption('4');
 await page.evaluate(()=>{
  const start=MediaRecorder.prototype.start,draw=CanvasRenderingContext2D.prototype.drawImage,capture=HTMLCanvasElement.prototype.captureStream,encoder=window.VideoEncoder;
  window.__timingRegression={active:false,delays:0,tracks:[],restore:()=>{CanvasRenderingContext2D.prototype.drawImage=draw;MediaRecorder.prototype.start=start;HTMLCanvasElement.prototype.captureStream=capture;window.VideoEncoder=encoder;}};
  window.VideoEncoder=undefined;
  MediaRecorder.prototype.start=function(...args){window.__timingRegression.active=true;return start.apply(this,args);};
  HTMLCanvasElement.prototype.captureStream=function(...args){const stream=capture.apply(this,args);window.__timingRegression.tracks.push(...stream.getTracks());return stream;};
  CanvasRenderingContext2D.prototype.drawImage=function(...args){if(window.__timingRegression.active&&!window.__timingRegression.delays){window.__timingRegression.delays++;const end=performance.now()+250;while(performance.now()<end){}}return draw.apply(this,args);};
 });
 await page.getByRole('button',{name:'Export',exact:true}).click();
 await page.getByRole('button',{name:'Export 4s silent loop',exact:true}).click();
 await expect(page.locator('.p-toast')).toContainText('could not keep project timing',{timeout:10000});
 await expect(page.locator('.p-export-progress')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Close dialog',exact:true})).toBeEnabled();
 const delayed=await page.evaluate(()=>({delays:window.__timingRegression.delays,tracks:window.__timingRegression.tracks.map(t=>t.readyState)}));
 assert.ok(delayed.delays>0);assert.ok(delayed.tracks.length&&delayed.tracks.every(s=>s==='ended'));assert.equal(downloads.length,0);
 await page.screenshot({path:resolve(out,'delayed-export-explicit-failure.jpg'),type:'jpeg',quality:85});
 await page.evaluate(()=>window.__timingRegression.restore());
 await page.getByRole('button',{name:'Close dialog',exact:true}).click();
 pass('Delayed recorder fallback rejects the export with timing feedback, no download and stopped tracks',delayed);
 const videos=[];
 for(const duration of [4,8,12]){
  await page.evaluate(duration=>{if(duration===4){const encode=VideoEncoder.prototype.encode;window.__timingEncode=encode;VideoEncoder.prototype.encode=function(...args){const end=performance.now()+60;while(performance.now()<end){}return encode.apply(this,args);};}else if(window.__timingEncode){VideoEncoder.prototype.encode=window.__timingEncode;delete window.__timingEncode;}},duration);const wallStart=Date.now();
  await page.getByRole('combobox',{name:'Loop duration',exact:true}).selectOption(String(duration));
  await page.getByRole('button',{name:'Export',exact:true}).click();
  const pending=page.waitForEvent('download',{timeout:30000});
  await page.getByRole('button',{name:`Export ${duration}s silent loop`,exact:true}).click();
  const path=resolve(out,`photo-${duration}s.webm`);await(await pending).saveAs(path);
  await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  const opts={encoding:'utf8',timeout:30000,maxBuffer:8*1024*1024};
  const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-count_frames','-show_entries','stream=codec_name,width,height,nb_read_frames:format=duration:packet=pts_time,duration_time','-of','json',path],opts));
  const packets=probe.packets.map(p=>({pts:Number(p.pts_time),duration:Number(p.duration_time||0)})),last=packets.at(-1);
  assert.deepEqual([probe.streams[0].width,probe.streams[0].height],[1920,1080]);
  assert.equal(Number(probe.format.duration),duration);
  assert.ok(packets.every((p,i)=>i===0||p.pts>packets[i-1].pts));
  assert.ok(packets[0].pts>=0&&packets[0].pts<=1/24);
  assert.ok(last.pts>=duration-2/24&&last.pts+last.duration<=duration+1/24,JSON.stringify({duration,last}));
  assert.ok(Number(probe.streams[0].nb_read_frames)>=duration*24*.9);
  execFileSync('ffmpeg',['-v','error','-i',path,'-f','null','-'],opts);
  videos.push({path,wallSeconds:(Date.now()-wallStart)/1000,probe,firstPTS:packets[0].pts,lastPTS:last.pts,lastPacketEnd:last.pts+last.duration});
  pass(`${duration}s UI export fully decodes and actual packet times agree with one project cycle`,{frames:probe.streams[0].nb_read_frames,firstPTS:packets[0].pts,lastPTS:last.pts,lastPacketEnd:last.pts+last.duration});
 }
 assert.deepEqual(errors,[]);
 await writeFile(resolve(out,'report.json'),JSON.stringify({result:'passed',checkedAt:new Date().toISOString(),checks,videos,errors},null,2));
}catch(e){await page?.screenshot({path:resolve(out,'failure.jpg'),type:'jpeg',quality:85}).catch(()=>{});const state=await page?.evaluate(()=>({toast:document.querySelector('.p-toast')?.textContent,progress:document.querySelector('.p-export-progress')?.textContent})).catch(()=>null);await writeFile(resolve(out,'report.json'),JSON.stringify({result:'failed',checks,errors,state,error:e.stack},null,2));throw e;}
finally{clearTimeout(deadline);await context?.close();await browser?.close();}
