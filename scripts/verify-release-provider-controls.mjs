import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const out=resolve(process.env.STILLWILD_EVIDENCE_DIR||'.asyncly/visual-captures/release-retest/provider-controls');
await mkdir(out,{recursive:true});
const host='https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space';
const config=JSON.parse(await readFile('scripts/fixtures/wan-config.json','utf8'));
const info=JSON.parse(await readFile('scripts/fixtures/wan-info.json','utf8'));
const fixture=await readFile('.asyncly/visual-captures/free-wan-api/Wan-Forest-original.mp4');
const key='test-fixture-not-a-real-key';
let browser,context,page,mode='success',googleStatus=200,wanJobs=0,googleJobs=0;
const pending=[],payloads=[],checks=[],errors=[];
const pass=(name,details={})=>{checks.push({name,result:'passed',...details});console.log('PASS',name);};
const deadline=setTimeout(()=>void browser?.close(),240000);
const status=()=>page.getByLabel('AI generation status',{exact:true});
const provider=()=>page.getByRole('combobox',{name:'Generation provider',exact:true});
const duration=()=>page.getByRole('combobox',{name:'AI video duration',exact:true});
const generate=()=>page.getByRole('button',{name:/^Generate with /});
const dismiss=async()=>{const b=page.getByRole('button',{name:'Dismiss result',exact:true});if(await b.isVisible())await b.click();};
try{
 browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,timeout:15000});
 context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 await context.addInitScript(()=>{
  const real=AbortSignal.timeout.bind(AbortSignal);
  AbortSignal.timeout=ms=>real(window.__providerTimeout&&[600000,240000].includes(ms)?1500:ms);
 });
 await context.route('https://**/*',async route=>{
  const req=route.request(),u=new URL(req.url());
  if(u.origin==='https://generativelanguage.googleapis.com'){
   assert.equal(req.method(),'POST');googleJobs++;payloads.push({provider:'google',body:req.postDataJSON()});
   assert.equal(req.headers()['x-goog-api-key'],key);
   if(mode==='wait')await new Promise(r=>pending.push(r));
   if(googleStatus!==200)return route.fulfill({status:googleStatus,json:{error:{message:key+' private detail'}}});
   return route.fulfill({json:{status:'completed',steps:[{type:'model_output',content:[{type:'video',mime_type:'video/mp4',data:fixture.toString('base64')}]}]}});
  }
  assert.equal(u.origin,host);
  if(u.pathname==='/config'||u.pathname==='/')return route.fulfill({json:config});
  if(u.pathname==='/gradio_api/info')return route.fulfill({json:info});
  if(u.pathname==='/gradio_api/upload')return route.fulfill({json:['/tmp/gradio/audit/source.jpg']});
  if(u.pathname==='/gradio_api/queue/join'){
   wanJobs++;payloads.push({provider:'wan',body:req.postDataJSON()});return route.fulfill({json:{event_id:'audit-'+wanJobs}});
  }
  if(u.pathname==='/gradio_api/queue/data'){
   const id='audit-'+wanJobs;if(mode==='wait')await new Promise(r=>pending.push(r));
   const output=mode==='offline'?{msg:'process_completed',event_id:id,success:false,output:{error:'offline '+key}}:
    {msg:'process_completed',event_id:id,success:true,output:{data:[{video:{url:host+'/gradio_api/file=/tmp/gradio/audit/video.mp4',size:fixture.length,mime_type:'video/mp4',meta:{_type:'gradio.FileData'}}},1708]}};
   return route.fulfill({contentType:'text/event-stream',body:[{msg:'estimation',event_id:id,rank:3,queue_size:6,rank_eta:20},{msg:'process_starts',event_id:id,eta:5},output,{msg:'close_stream'}].map(v=>'data: '+JSON.stringify(v)+'\n\n').join('')});
  }
  if(/\/(cancel|reset)$/.test(u.pathname))return route.fulfill({json:{success:true}});
  if(u.pathname.startsWith('/gradio_api/file='))return route.fulfill({body:fixture,contentType:'video/mp4'});
  throw Error('Unexpected mock route '+u.pathname);
 });
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/?view=studio',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Pause preview',exact:true}).click();await page.getByRole('button',{name:'Animate',exact:true}).click();
 await expect(provider()).toHaveValue('wan');assert.equal(wanJobs+googleJobs,0);
 const examples=['calm','forest','rain','coast'],durations=[.5,1,2,4],prompts=[];
 for(let i=0;i<4;i++){
  await page.getByRole('combobox',{name:'Calm motion example',exact:true}).selectOption(examples[i]);
  const prompt=await page.getByRole('textbox',{name:'AI motion prompt',exact:true}).inputValue();prompts.push(prompt);
  assert.match(prompt,/Preserve framing and matte padding/);
  await duration().selectOption(String(durations[i]));await generate().click();
  await expect(page.getByRole('button',{name:'Motion applied',exact:true})).toBeVisible({timeout:20000});
  const args=payloads.at(-1).body.data;assert.equal(args[1],prompt);assert.equal(args[4],durations[i]);
  assert.equal(wanJobs,i+1);await dismiss();
 }
 assert.equal(new Set(prompts).size,4);
 pass('Every calm/forest/rain/coast example and 0.5/1/2/4s choice reaches exactly one intercepted official SDK submission');
 const prompt=page.getByRole('textbox',{name:'AI motion prompt',exact:true});await prompt.fill('  ');await expect(generate()).toBeDisabled();
 await prompt.fill('Slow subtle existing motion');
 mode='wait';await generate().click();await expect.poll(()=>pending.length).toBe(1);
 await expect(prompt).toBeDisabled();await expect(duration()).toBeDisabled();
 await expect(page.getByRole('combobox',{name:'Calm motion example',exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'Stop waiting',exact:true}).click();
 await expect(status()).toContainText('Server cancellation is not guaranteed');pending.shift()();
 pass('Empty prompt disables generation; active jobs lock prompt/duration/example; explicit Stop reports its actual scope');
 mode='wait';await page.evaluate(()=>window.__providerTimeout=true);await generate().click();
 await expect.poll(()=>pending.length).toBe(1);await expect(status()).toContainText('timed out',{timeout:10000});
 pending.shift()();await page.evaluate(()=>window.__providerTimeout=false);
 await page.waitForTimeout(200);assert.equal(wanJobs,6);assert.equal(googleJobs,0);
 pass('Actual UI Wan timeout aborts waiting without resubmission or Google fallback (test shortens only provider deadline)');
 mode='offline';await generate().click();await expect(status()).toContainText('offline',{timeout:20000});
 assert.ok(!(await status().innerText()).includes(key));assert.equal(wanJobs,7);await page.waitForTimeout(200);assert.equal(wanJobs,7);
 pass('Installed SDK offline response is safely redacted and never retried');
 mode='success';await provider().selectOption('google');await expect(generate()).toBeDisabled();
 await page.getByRole('textbox',{name:'Gemini API key',exact:true}).fill(key);
 for(const seconds of [4,8]){
  await duration().selectOption(String(seconds));await generate().click();
  await expect(page.getByRole('heading',{name:'Google original',exact:true})).toBeVisible({timeout:20000});
  assert.equal(payloads.at(-1).body.response_format.duration,seconds+'s');await dismiss();
 }
 pass('Google remains an explicitly selected memory-only BYOK alternative; both 4s and 8s REST payloads are exercised');
 for(const code of [400,401,402,403,429,503]){
  googleStatus=code;const before=googleJobs;await generate().click();
  await expect(status()).toContainText(code===402?'payment':code===429?'quota':code===403?'denied':code===400||code===401?'rejected':'HTTP 503');
  assert.ok(!(await status().innerText()).includes(key));await page.waitForTimeout(100);assert.equal(googleJobs,before+1);
 }
 pass('Google 400/401/402/403/429/503 errors are actionable, redacted and single-submit');
 googleStatus=200;mode='wait';await page.evaluate(()=>window.__providerTimeout=true);const before=googleJobs;
 await generate().click();await expect.poll(()=>pending.length).toBe(1);await expect(status()).toContainText('timed out',{timeout:10000});
 pending.shift()();await page.evaluate(()=>window.__providerTimeout=false);await page.waitForTimeout(200);assert.equal(googleJobs,before+1);
 pass('Actual UI Google timeout aborts one request without an automatic retry');
 await page.getByRole('button',{name:'Clear key',exact:true}).click();
 await expect(page.getByRole('textbox',{name:'Gemini API key',exact:true})).toHaveValue('');await expect(generate()).toBeDisabled();
 await provider().selectOption('wan');await expect(generate()).toBeEnabled();
 await page.reload({waitUntil:'networkidle'});await page.getByRole('button',{name:'Animate',exact:true}).click();
 await expect(provider()).toHaveValue('wan');await provider().selectOption('google');
 await expect(page.getByRole('textbox',{name:'Gemini API key',exact:true})).toHaveValue('');
 assert.deepEqual(errors,[]);
 pass('Clear/reload remove the test key; switching to Wan needs no key and fresh sessions default to Wan');
 await page.screenshot({path:resolve(out,'google-optional-controls.jpg'),type:'jpeg',quality:85});
 await writeFile(resolve(out,'report.json'),JSON.stringify({result:'passed',checkedAt:new Date().toISOString(),mockOnly:true,checks,errors,wanJobs,googleJobs,payloads:payloads.map(p=>({provider:p.provider,duration:p.provider==='wan'?p.body.data[4]:p.body.response_format.duration}))},null,2));
}catch(e){await page?.screenshot({path:resolve(out,'failure.jpg'),type:'jpeg',quality:85}).catch(()=>{});await writeFile(resolve(out,'report.json'),JSON.stringify({result:'failed',checks,errors,error:e.stack},null,2));throw e;}
finally{clearTimeout(deadline);for(const release of pending)release();await context?.close();await browser?.close();}
