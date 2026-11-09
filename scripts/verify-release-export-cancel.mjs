import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const out=resolve(process.env.STILLWILD_EVIDENCE_DIR||'.asyncly/visual-captures/release-retest/export-cancel');
await mkdir(out,{recursive:true});let browser,context,page;const checks=[],downloads=[];
const deadline=setTimeout(()=>void browser?.close(),90000);
try{
 browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,timeout:15000});
 context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,acceptDownloads:true});
 page=await context.newPage();page.on('download',d=>downloads.push(d.suggestedFilename()));
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Pause loop',exact:true}).click();
 await page.getByRole('combobox',{name:'Loop duration',exact:true}).selectOption('4');
 await page.evaluate(()=>{
  const arrayBuffer=Blob.prototype.arrayBuffer,capture=HTMLCanvasElement.prototype.captureStream;
  const Encoder=window.VideoEncoder;window.__finalization={pending:false,tracks:[],encoders:[],restore:()=>{Blob.prototype.arrayBuffer=arrayBuffer;HTMLCanvasElement.prototype.captureStream=capture;window.VideoEncoder=Encoder;}};window.VideoEncoder=class extends Encoder{constructor(...args){super(...args);window.__finalization.encoders.push(this);}};
  Blob.prototype.arrayBuffer=async function(){if(this.type.startsWith('video/webm')&&!window.__finalization.pending){window.__finalization.pending=true;await new Promise(r=>window.__finalization.release=r);}return arrayBuffer.call(this);};
  HTMLCanvasElement.prototype.captureStream=function(...args){const stream=capture.apply(this,args);window.__finalization.tracks.push(...stream.getTracks());return stream;};
 });
 if(process.argv[2]==='failure'){
  await page.evaluate(()=>{window.__finalization.restore();const Encoder=window.VideoEncoder;window.__failedEncoders=[];window.__OriginalEncoder=Encoder;window.VideoEncoder=class extends Encoder{constructor(...args){super(...args);window.__failedEncoders.push(this);}encode(){throw Error('Release encoder failure probe');}};});
  await page.getByRole('button',{name:'Export',exact:true}).click();await page.getByRole('button',{name:'Export 4s silent loop',exact:true}).click();
  await expect(page.locator('.p-toast')).toContainText('Release encoder failure probe');await expect(page.locator('.p-export-progress')).toHaveCount(0);
  const encoders=await page.evaluate(()=>window.__failedEncoders.map(e=>e.state));assert.ok(encoders.length&&encoders.every(s=>s==='closed'));assert.equal(downloads.length,0);
  await page.evaluate(()=>window.VideoEncoder=window.__OriginalEncoder);checks.push({name:'Primary WebCodecs encode failure reports the injected error, closes the encoder and prevents download',result:'passed',encoders});console.log('PASS',checks.at(-1).name);
 }else for(const action of ['cancel','unmount']){
  await page.evaluate(()=>{window.__finalization.pending=false;window.__finalization.release=null;});
  await page.getByRole('button',{name:'Export',exact:true}).click();
  await page.getByRole('button',{name:'Export 4s silent loop',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__finalization.release)),{timeout:20000}).toBe(true);
  if(action==='cancel')await page.getByRole('button',{name:'Cancel export',exact:true}).click();
  else await page.locator('.p-top .p-classic').evaluate(el=>el.click());
  await page.evaluate(()=>window.__finalization.release());
  if(action==='cancel'){
   await expect(page.locator('.p-export-progress')).toHaveCount(0);
   await expect(page.locator('.p-toast')).toContainText('cancelled');
   await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  }else await expect(page.locator('.artwork canvas')).toBeVisible();
  await page.waitForTimeout(200);assert.equal(downloads.length,0);
  const states=await page.evaluate(()=>window.__finalization.tracks.map(t=>t.readyState));
  assert.ok(states.every(s=>s==='ended'));const encoders=await page.evaluate(()=>window.__finalization.encoders.map(e=>e.state));assert.ok(encoders.length&&encoders.every(s=>s==='closed'));
  checks.push({name:`${action} during awaited WebM inspection prevents download and frees tracks`,result:'passed',tracks:states,encoders});
  console.log('PASS',checks.at(-1).name);
 }
 await page.evaluate(()=>window.__finalization.restore());
 await writeFile(resolve(out,'report.json'),JSON.stringify({result:'passed',checkedAt:new Date().toISOString(),checks,downloads},null,2));
}catch(e){await page?.screenshot({path:resolve(out,'failure.jpg'),type:'jpeg',quality:85}).catch(()=>{});await writeFile(resolve(out,'report.json'),JSON.stringify({result:'failed',checks,downloads,error:e.stack},null,2));throw e;}
finally{clearTimeout(deadline);await context?.close();await browser?.close();}
