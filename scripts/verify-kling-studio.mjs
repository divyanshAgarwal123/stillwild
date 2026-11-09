// Isolated UI acceptance. Every fal/Kling response below is MOCKED; no paid job.
import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
const out=resolve(process.env.STILLWILD_EVIDENCE_DIR||'.asyncly/visual-captures/kling-studio'),origin='http://127.0.0.1:5173',model='https://queue.fal.run/fal-ai/kling-video/v2.6/pro/image-to-video',task='https://queue.fal.run/fal-ai/kling-video/requests/mock-kling-123',media='https://v3b.fal.media/files/test/mocked.mp4';
await mkdir(out,{recursive:true});const fixture=await readFile(resolve(out,'mocked-kling-fixture.mp4')),sha=b=>createHash('sha256').update(b).digest('hex'),key='mock-personal-fal-key',google='mock-google-key';
let browser,context,page,mode='success',complete=false,posts=[],requests=[];const checks=[],errors=[];
const timer=setTimeout(()=>void browser?.close(),180000),pass=name=>{checks.push({name,result:'passed',evidence:'mocked provider / isolated local UI'});console.log('PASS',name);};
const click=name=>page.getByRole('button',{name,exact:true}).click(),tab=name=>page.getByRole('tab',{name,exact:true}).click();
const status=()=>page.locator('[aria-label="AI generation status"]');
const current=()=>page.evaluate(async()=>(await import('/src/photo/storage.ts')).readCurrent());
const download=async(button,path)=>{const pending=page.waitForEvent('download',{timeout:20000});await button.click();const d=await pending;await d.saveAs(resolve(out,path));return readFile(resolve(out,path));};
const setNumber=async(name,value)=>{const n=page.getByRole('spinbutton',{name,exact:true});await n.fill(String(value));await n.press('Tab');await expect(n).toHaveValue(String(value));};
try{
 browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,timeout:15000});
 context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,acceptDownloads:true});
 await context.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__copiedPrompt=text;}}}));
 await context.route('https://queue.fal.run/**',async route=>{
  const req=route.request(),url=req.url();requests.push({url,method:req.method(),headers:req.headers()});
  assert.equal(req.headers().authorization,'Key '+key);assert.ok(!url.includes(key));
  if(req.method()==='POST'){
   assert.equal(url,model);posts.push(req.postDataJSON());assert.equal(req.headers()['x-fal-no-retry'],'1');assert.equal(req.headers()['x-fal-store-io'],'0');
   if(mode==='invalid')return route.fulfill({status:401,json:{error:key}});
   return route.fulfill({status:200,json:{request_id:'mock-kling-123',status:'IN_QUEUE',status_url:task+'/status',response_url:task,cancel_url:task+'/cancel'}});
  }
  if(url===task+'/status')return route.fulfill({json:{request_id:'mock-kling-123',status:complete?'COMPLETED':'IN_PROGRESS'}});
  assert.equal(url,task);return route.fulfill({json:{video:{url:media,content_type:'video/mp4',file_size:fixture.length}}});
 });
 await context.route(media,async route=>{assert.equal(route.request().headers().authorization,undefined);assert.ok(!route.request().url().includes(key));return route.fulfill({contentType:'video/mp4',body:mode==='bad-media'?Buffer.alloc(128):fixture});});
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin,{waitUntil:'networkidle'});
 await page.evaluate(async()=>{const {makeProject}=await import('/src/photo/model.ts'),{saveProject}=await import('/src/photo/storage.ts');const p=makeProject('editorial');p.name='Disposable Kling acceptance';p.paused=true;p.duration=4;const l=p.layers[0];l.w=.63;l.h=.9;l.rotation=13;l.flipX=true;l.cropZoom=1.7;l.cropX=.32;l.grade.exposure=.4;l.strokes=[{id:'mask-probe',mode:'erase',radius:.08,softness:55,angle:0,points:[{x:.8,y:.9}]}];await saveProject(p);});
 await page.reload({waitUntil:'networkidle'});await click('Select Tidal studies');await tab('AI');
 await expect(page.getByRole('combobox',{name:'Generation provider'})).toHaveValue('wan');
 await page.getByRole('combobox',{name:'Generation provider'}).selectOption('kling');
 await expect(page.getByRole('button',{name:/Generate with Kling/})).toBeDisabled();await expect(page.getByRole('textbox',{name:'fal API key',exact:true})).toHaveAttribute('type','password');
 await expect(page.locator('.p-ai')).toContainText('$0.35');await expect(page.getByRole('checkbox',{name:'Match first and last frame'})).not.toBeChecked();
 await page.getByRole('textbox',{name:'fal API key',exact:true}).fill(key);
 await page.getByRole('combobox',{name:'Generation provider'}).selectOption('google');await expect(page.getByRole('textbox',{name:'Gemini API key'})).toHaveValue('');await page.getByRole('textbox',{name:'Gemini API key'}).fill(google);
 await page.getByRole('combobox',{name:'Generation provider'}).selectOption('kling');await expect(page.getByRole('textbox',{name:'fal API key'})).toHaveValue(key);
 await page.getByRole('combobox',{name:'AI video duration'}).selectOption('10');await expect(page.getByRole('button',{name:/Generate with Kling/})).toContainText('$0.70');await page.getByRole('combobox',{name:'AI video duration'}).selectOption('5');
 await page.getByRole('combobox',{name:'Calm motion example'}).selectOption('neon');await expect(page.getByRole('textbox',{name:'AI motion prompt'})).toContainText('volumetric scattering');
 await page.getByRole('checkbox',{name:'Match first and last frame'}).check();
 pass('Kling credit/cost controls, no-key disabled, isolated session passwords and optional matched frame anchors');
 const before=await current(),source=before.layers[0],neutral=await page.evaluate(async l=>(await import('/src/photo/render.ts')).photoSource(l),source);
 await expect(page.locator('.photo-artboard canvas')).toBeInViewport({ratio:1});await page.screenshot({path:resolve(out,'kling-controls-desktop.jpg'),type:'jpeg',quality:85});
 await page.getByRole('button',{name:/Generate with Kling/}).evaluate(el=>{el.click();el.click();});
 await expect(status()).toContainText(/Kling (queued|is generating)/,{timeout:15000});assert.equal(posts.length,1);
 assert.equal(posts[0].generate_audio,false);assert.equal(posts[0].duration,'5');assert.equal(posts[0].end_image_url,posts[0].start_image_url);assert.equal(posts[0].start_image_url,'data:image/jpeg;base64,'+neutral);
 const dimensions=await page.evaluate(async uri=>{const b=await(await fetch(uri)).blob(),i=await createImageBitmap(b);try{return[i.width,i.height];}finally{i.close();}},posts[0].start_image_url);assert.deepEqual(dimensions,[1280,720]);
 await tab('Grade');await setNumber('Exposure value',-1.2);await click('Add shape layer');await tab('AI');complete=true;
 await expect(status()).toContainText('Video ready',{timeout:20000});assert.equal(posts.length,1);
 const original=await download(page.getByRole('button',{name:'Download generated original',exact:true}),'mocked-original.mp4');assert.equal(sha(original),sha(fixture));
 await click('Add video to current project');await expect(status()).toContainText('Editable video layer added');
 await expect(page.getByRole('combobox',{name:'Loop timing'})).toHaveValue('fit');await expect(page.getByRole('combobox',{name:'Known source FPS'})).toHaveValue('');await expect(page.getByRole('checkbox',{name:'Source-frame blending'})).toBeDisabled();
 await expect.poll(async()=>{const p=await current();return p.layers.length;}).toBe(before.layers.length+2);
 let saved=await current(),v=saved.layers.find(l=>l.kind==='video');assert.equal(saved.layers[0].grade.exposure,-1.2);assert.equal(v.grade.exposure,.4);assert.equal(v.rotation,13);assert.equal(v.flipX,true);assert.equal(v.w,.63);assert.equal(v.h,.9);assert.deepEqual(v.strokes,source.strokes);assert.equal(v.cropZoom,1);assert.equal(v.cropX,.5);assert.equal(v.clip.provider,'kling');assert.equal(v.clip.blend,.2);
 pass('One explicit silent creation, neutral 1280×720 snapshot, keyless original download and insertion preserve source/current edits, transforms, mask and single crop');
 await page.getByRole('combobox',{name:'Loop timing'}).selectOption('manual');await setNumber('Playback speed value',1.2);await setNumber('Trim in value',.5);await setNumber('Trim out value',4.5);await setNumber('Loop crossfade value',.15);await page.getByRole('combobox',{name:'Loop timing'}).selectOption('fit');
 await tab('Grade');await setNumber('Exposure value',1.1);await click('Undo');await expect(page.getByRole('spinbutton',{name:'Exposure value'})).toHaveValue('0.4');
 await page.locator('.p-projects summary').click();const portableBytes=await download(page.getByRole('button',{name:'Download portable project',exact:true}),'mocked-kling.stillwild.json');const portable=JSON.parse(portableBytes);assert.ok(!portableBytes.includes(Buffer.from(key))&&!portableBytes.includes(Buffer.from(google)));assert.ok(!page.url().includes(key));
 const kept=await page.evaluate(async()=>{const s=await import('/src/photo/storage.ts'),p=await s.readCurrent(),v=p.layers.find(l=>l.kind==='video'),a=await s.getAsset(v.asset);return Array.from(new Uint8Array(await a.blob.arrayBuffer()));});assert.equal(sha(Buffer.from(kept)),sha(fixture));
 await page.reload({waitUntil:'networkidle'});await tab('AI');await page.getByRole('combobox',{name:'Generation provider'}).selectOption('kling');await expect(page.getByRole('textbox',{name:'fal API key'})).toHaveValue('');
 const local=await page.evaluate(()=>JSON.stringify({local:{...localStorage},session:{...sessionStorage}}));assert.ok(!local.includes(key)&&!local.includes(google));
 await tab('Motion');await expect(page.getByRole('combobox',{name:'Loop timing'})).toHaveValue('fit');await expect(page.getByRole('spinbutton',{name:'Preferred speed value'})).toHaveValue('1.2');await expect(page.getByText('Kling source; cadence is not assumed.',{exact:false})).toBeVisible();
 const second=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});try{const q=await second.newPage();await q.goto(origin,{waitUntil:'networkidle'});await q.getByLabel('Import project file',{exact:true}).setInputFiles(resolve(out,'mocked-kling.stillwild.json'));await expect(q.locator('.p-toast')).toContainText('Portable project restored');const p=await q.evaluate(async()=>(await import('/src/photo/storage.ts')).readCurrent());assert.equal(p.layers.find(l=>l.kind==='video').clip.provider,'kling');}finally{await second.close();}
 pass('Editable trim/speed/crossfade, grade Undo, exact source bytes and Kling provenance survive portable import/reload; keys do not');
 // Save a real export from the inserted MOCKED result; inspect actual packet times.
 await click('Export');const exported=await download(page.getByRole('button',{name:'Export 4s silent loop',exact:true}),'mocked-kling-export-4s.webm');assert.ok(exported.length>1000);await click('Close dialog');
 const file=resolve(out,'mocked-kling-export-4s.webm'),probe=JSON.parse(execFileSync('ffprobe',['-v','error','-count_frames','-show_packets','-show_entries','stream=codec_name,width,height,nb_read_frames:format=duration:packet=pts_time,duration_time','-of','json',file],{timeout:20000}));execFileSync('ffmpeg',['-v','error','-i',file,'-f','null','-'],{timeout:30000});const pts=probe.packets.map(p=>+p.pts_time),end=pts.at(-1)+ +probe.packets.at(-1).duration_time;assert.equal(probe.format.duration,'4.000000');assert.equal(probe.streams[0].width,1920);assert.equal(probe.streams[0].height,1080);assert.ok(pts.every((p,i)=>!i||p>pts[i-1]));assert.ok(Math.abs(end-4)<.043);await writeFile(resolve(out,'export-probe.json'),JSON.stringify(probe,null,2));
 pass('Kling insertion uses the existing timestamped 1080p exporter: full decode, increasing packet PTS and one 4s project cycle');
 await click('Select Tidal studies');await tab('AI');await page.getByRole('textbox',{name:'fal API key'}).fill(key);mode='invalid';const count=posts.length;await page.getByRole('button',{name:/Generate with Kling/}).click();await expect(status()).toContainText('fal rejected');assert.equal(posts.length,count+1);assert.ok(!(await status().textContent()).includes(key));await click('Clear key');await expect(page.getByRole('textbox',{name:'fal API key'})).toHaveValue('');await expect(page.getByRole('button',{name:/Generate with Kling/})).toBeDisabled();
 pass('Mocked invalid fal key reports sanitized feedback, exactly one POST, clear key and disabled generation');
 mode='success';complete=false;await page.getByRole('textbox',{name:'fal API key'}).fill(key);await page.getByRole('button',{name:/Generate with Kling/}).click();await expect(status()).toContainText(/Kling (queued|is generating)/);const stopped=posts.length;await click('Stop waiting');await expect(status()).toContainText('may still run and be charged');await page.waitForTimeout(100);assert.equal(posts.length,stopped);
 mode='bad-media';complete=true;await page.getByRole('button',{name:/Generate with Kling/}).click();await expect(status()).toContainText('genuine MP4');const invalid=await download(page.getByRole('button',{name:'Download generated original',exact:true}),'mocked-undecodable-original.mp4');assert.equal(invalid.length,128);
 pass('Stop waiting halts local work without resubmission; undecodable generated original remains downloadable');
 // Manual website route: no upload or generation. Its landing page is intercepted.
 await page.locator('.p-ai-website summary').click();await page.getByRole('combobox',{name:'Calm motion example'}).selectOption('waterfall');
 await download(page.getByRole('button',{name:'Download Kling source frame',exact:true}),'website-source-1280x720.jpg');await click('Copy Kling motion prompt');assert.match(await page.evaluate(()=>window.__copiedPrompt),/waterfall/);
 const link=page.getByRole('link',{name:'Open Kling website ↗',exact:true});await expect(link).toHaveAttribute('href','https://kling.ai/app');await expect(link).toHaveAttribute('target','_blank');await expect(link).toHaveAttribute('rel','noreferrer');
 const priorPosts=posts.length;await page.getByLabel('Import Kling website video file',{exact:true}).setInputFiles(resolve(out,'mocked-kling-fixture.mp4'));await expect(status()).toContainText('Website clip validated');await click('Add video to current project');await expect(status()).toContainText('Editable video layer added');assert.equal(posts.length,priorPosts);
 pass('Manual website handoff downloads neutral source, copies prompt, offers official new-tab link and validates/imports editable video without any provider request');
 await click('Select Tidal studies');await tab('AI');await page.setViewportSize({width:390,height:844});await click('Properties');await page.getByRole('combobox',{name:'Generation provider'}).selectOption('kling');await page.getByRole('textbox',{name:'fal API key'}).fill('');await page.getByRole('button',{name:/Generate with Kling/}).scrollIntoViewIfNeeded();await expect(page.getByRole('button',{name:/Generate with Kling/})).toBeVisible();await expect(page.getByRole('button',{name:/Generate with Kling/})).toBeDisabled();await page.screenshot({path:resolve(out,'kling-touch-390.jpg'),type:'jpeg',quality:85});
 pass('390px responsive Kling controls remain reachable with no-key generation disabled');
 assert.deepEqual(errors,[]);await writeFile(resolve(out,'browser-report.json'),JSON.stringify({result:'passed',checkedAt:new Date().toISOString(),providerEvidence:'ALL MOCKED; no live generation, keys or billing',checks,fixtureSHA256:sha(fixture),postCount:posts.length,errors,packetTiming:{first:pts[0],last:pts.at(-1),end},requests:requests.map(r=>({url:r.url,method:r.method,authorizationSent:!!r.headers.authorization}))},null,2));
}catch(e){await page?.screenshot({path:resolve(out,'failure.jpg'),type:'jpeg',quality:85}).catch(()=>{});await writeFile(resolve(out,'browser-report.json'),JSON.stringify({result:'failed',providerEvidence:'ALL MOCKED',checks,postCount:posts.length,errors,error:e.stack},null,2));throw e;}
finally{clearTimeout(timer);await context?.close();await browser?.close();}
