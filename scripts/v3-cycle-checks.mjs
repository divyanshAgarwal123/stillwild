import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const origin='http://127.0.0.1:5173',out=resolve(process.env.STILLWILD_EVIDENCE_DIR||'.asyncly/visual-captures/v3/final-fix');
const checks=[],errors=[];let browser,context;
const timer=setTimeout(()=>void browser?.close(),180000);
const pass=(name,data)=>{checks.push({name,...data});console.log('PASS',name,JSON.stringify(data));};
const read=page=>page.evaluate(async()=> (await import('/src/photo/storage.ts')).readCurrent());
async function saved(page){await expect(page.locator('.p-save-status')).toHaveText('Saved on this device');}
async function liveParity(page){return page.evaluate(async()=>{
 const {readCurrent,loadImages}=await import('/src/photo/storage.ts'),{PhotoRenderer}=await import('/src/photo/render.ts');
 const project=await readCurrent(),live=document.querySelector('.photo-artboard canvas'),copy=document.createElement('canvas');
 copy.width=live.width;copy.height=live.height;await loadImages(project);
 const renderer=new PhotoRenderer(),hash=async a=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',a))).map(v=>v.toString(16).padStart(2,'0')).join('');
 try{renderer.render(copy.getContext('2d'),project,project.time,copy.width,copy.height);
  const a=live.getContext('2d').getImageData(0,0,copy.width,copy.height).data,b=copy.getContext('2d').getImageData(0,0,copy.width,copy.height).data;
  let sum=0;for(let i=0;i<a.length;i++)sum+=Math.abs(a[i]-b[i]);
  return{time:project.time,width:copy.width,height:copy.height,live:await hash(a),saved:await hash(b),mean:sum/a.length};
 }finally{renderer.dispose();copy.width=copy.height=1;}
});}
async function fractional(page,label){
 const input=page.getByRole('spinbutton',{name:`${label} value`,exact:true});
 await input.fill('1.5');
 // Assert while the number field still owns focus: blur/validation must not repair live state for us.
 await expect(input).toBeFocused();await expect(input).toHaveValue('2');
 await expect(page.getByRole('slider',{name:label,exact:true})).toHaveValue('2');
 await input.press('Tab');await saved(page);
}
try{
 await mkdir(out,{recursive:true});
 browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,timeout:15000});
 context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,acceptDownloads:true});
 await context.addInitScript(()=>localStorage.setItem('stillwild.photo.reduced','false'));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin,{waitUntil:'networkidle'});await expect(page.locator('.photo-loading')).toHaveCount(0);
 await page.getByRole('button',{name:'Pause loop',exact:true}).click();
 const scrub=page.getByRole('slider',{name:'Timeline scrub',exact:true});await scrub.focus();await scrub.press('Home');
 for(let i=0;i<200;i++)await scrub.press('ArrowRight');
 await page.getByRole('tab',{name:'Motion',exact:true}).click();
 const strength=page.getByRole('spinbutton',{name:'Motion strength value',exact:true});await strength.fill('100');await strength.press('Tab');
 await fractional(page,'Motion cycles');
 await expect.poll(async()=>(await read(page)).layers[0].motion.cycles).toBe(2);
 const motion=await liveParity(page);assert.equal(motion.time,2);assert.equal(motion.live,motion.saved,JSON.stringify(motion));
 await expect(page.locator('.photo-artboard canvas')).toBeInViewport({ratio:1});
 await page.screenshot({path:resolve(out,'motion-cycles.jpg'),type:'jpeg',quality:90});
 pass('Motion 1.5 normalizes to 2 before blur; frozen live pixels match saved render',motion);

 await page.getByRole('tab',{name:'Air',exact:true}).click();const weather={};
 for(const key of ['rain','fog','dust','rays']){
  await page.getByRole('checkbox',{name:`Enable ${key}`,exact:true}).check();
  for(const [label,value]of [[`${key} amount`,70],[`${key} direction`,37]]){const input=page.getByRole('spinbutton',{name:`${label} value`,exact:true});await input.fill(String(value));await input.press('Tab');}
  await fractional(page,`${key} cycles`);
  await expect.poll(async()=>(await read(page)).weather[key].cycles).toBe(2);
  weather[key]=await liveParity(page);assert.equal(weather[key].live,weather[key].saved,`${key}: ${JSON.stringify(weather[key])}`);
 }
 // Put the first corrected weather count and the complete artboard together in the review capture.
 await page.getByRole('spinbutton',{name:'rain cycles value',exact:true}).scrollIntoViewIfNeeded();
 await expect(page.locator('.photo-artboard canvas')).toBeInViewport({ratio:1});
 await page.screenshot({path:resolve(out,'weather-cycles.jpg'),type:'jpeg',quality:90});
 pass('All four weather 1.5 inputs normalize live and match saved frozen pixels',{weather});

 const original=await read(page);await writeFile(resolve(out,'normalized-project.json'),JSON.stringify(original,null,2));
 await page.getByRole('button',{name:'Share project',exact:true}).click();
 const url=await page.getByRole('textbox',{name:'Project share link',exact:true}).inputValue();
 await page.getByRole('button',{name:'Close dialog',exact:true}).click();
 const recipient=await context.newPage();recipient.on('pageerror',e=>errors.push(e.message));
 await recipient.goto(url,{waitUntil:'networkidle'});await expect(recipient.locator('.photo-loading')).toHaveCount(0);
 await expect(recipient.getByRole('button',{name:'Play loop',exact:true})).toBeVisible();
 await saved(recipient);const recipientParity=await liveParity(recipient),senderParity=await liveParity(page);
 assert.equal(recipientParity.live,senderParity.live,JSON.stringify({senderParity,recipientParity}));
 const shared=await recipient.evaluate(async hash=>(await import('/src/photo/model.ts')).decodeProject(hash),new URL(url).hash);
 assert.deepEqual(shared,{...original,paused:true});await recipient.close();
 const exports=await page.evaluate(async({project,url})=>{
  const {png}=await import('/src/photo/render.ts'),{decodeProject}=await import('/src/photo/model.ts');
  const shared=decodeProject(new URL(url).hash),a=await png(project,project.time),b=await png(shared,shared.time);
  const hash=async blob=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))).map(v=>v.toString(16).padStart(2,'0')).join('');
  const bitmap=await createImageBitmap(a);try{return{original:await hash(a),shared:await hash(b),width:bitmap.width,height:bitmap.height,bytes:a.size};}finally{bitmap.close();}
 },{project:original,url});
 assert.equal(exports.original,exports.shared,JSON.stringify(exports));assert.equal(exports.width,3840);assert.equal(exports.height,2160);
 await page.reload({waitUntil:'networkidle'});await expect(page.locator('.photo-loading')).toHaveCount(0);await saved(page);
 const restored=await read(page);assert.equal(restored.layers[0].motion.cycles,2);for(const w of Object.values(restored.weather))assert.equal(w.cycles,2);
 const reloadParity=await liveParity(page);assert.equal(reloadParity.live,senderParity.live,JSON.stringify(reloadParity));
 pass('Reload and new-tab frozen share preserve settings/pixels; real 4K PNG hashes match',{sender:senderParity.live,recipient:recipientParity.live,reload:reloadParity.live,exports});

 const boundaries=await page.evaluate(async()=>{
  const {readCurrent,loadImages}=await import('/src/photo/storage.ts'),{PhotoRenderer}=await import('/src/photo/render.ts');
  const p=await readCurrent();await loadImages(p);const width=800,height=450,c=document.createElement('canvas');c.width=width;c.height=height;
  const ctx=c.getContext('2d',{willReadFrequently:true}),renderer=new PhotoRenderer(),metrics=[];
  const frame=t=>{renderer.render(ctx,p,t,width,height);return new Uint8ClampedArray(ctx.getImageData(0,0,width,height).data);};
  const diff=(a,b)=>{let sum=0;for(let i=0;i<a.length;i++)if(i%4!==3)sum+=Math.abs(a[i]-b[i]);return sum/(width*height*3);};
  try{
   for(const kind of ['motion','rain','fog','dust','rays','combined'])for(const cycles of [1,2,3,4]){
    p.layers[0].motion.strength=kind==='motion'||kind==='combined'?100:0;p.layers[0].motion.cycles=cycles;
    for(const [key,w]of Object.entries(p.weather)){w.enabled=kind===key||kind==='combined';w.cycles=cycles;w.amount=70;w.angle=37;}
    const boundary=diff(frame(p.duration-.01),frame(.01)),interior=diff(frame(1.99),frame(2.01)),exact=diff(frame(0),frame(p.duration));
    metrics.push({kind,cycles,boundary,interior,exact});
   }
   p.layers[0].motion.cycles=2;for(const w of Object.values(p.weather))w.cycles=2;
   const sheet=document.createElement('canvas');sheet.width=1600;sheet.height=900;const s=sheet.getContext('2d');
   for(const [i,t]of [p.duration-.01,0,.01,2].entries()){frame(t);s.drawImage(c,(i%2)*width,Math.floor(i/2)*height);}
   return{metrics,sheet:Array.from(new Uint8Array(await(await new Promise(resolve=>sheet.toBlob(resolve,'image/jpeg',.9))).arrayBuffer()))};
  }finally{renderer.dispose();c.width=c.height=1;}
 });
 for(const m of boundaries.metrics){assert.equal(m.exact,0,JSON.stringify(m));assert.ok(m.boundary<Math.max(3,m.interior*3),JSON.stringify(m));}
 await writeFile(resolve(out,'loop-boundaries.jpg'),Buffer.from(boundaries.sheet));
 pass('Adjacent loop boundaries stay smooth for motion and every weather type at counts 1–4',{metrics:boundaries.metrics});

 // Retain a production-speed replay as well as deterministic boundary samples.
 await page.getByRole('button',{name:'Play loop',exact:true}).click();
 const motionCapture=await page.evaluate(async()=>{
  const canvas=document.querySelector('.photo-artboard canvas');let stream,recorder,timeout;const chunks=[],frames=[];
  try{
   stream=canvas.captureStream(24);recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9'});
   const done=new Promise((resolve,reject)=>{recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onstop=resolve;recorder.onerror=()=>reject(Error('Cycle replay recording failed'));timeout=setTimeout(()=>reject(Error('Cycle replay timeout')),8000);});
   recorder.start();const start=performance.now();
   for(let i=0;i<5;i++){
    await new Promise(resolve=>setTimeout(resolve,Math.max(0,i*700-(performance.now()-start))));
    frames.push(Array.from(new Uint8Array(await(await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.9))).arrayBuffer())));
   }
   await new Promise(resolve=>setTimeout(resolve,Math.max(0,3000-(performance.now()-start))));recorder.stop();await done;
   const {webmDuration}=await import('/src/photo/webm.ts'),blob=await webmDuration(new Blob(chunks,{type:'video/webm'}),3);
   return{frames,video:Array.from(new Uint8Array(await blob.arrayBuffer()))};
  }finally{if(timeout)clearTimeout(timeout);if(recorder&&recorder.state!=='inactive')recorder.stop();stream?.getTracks().forEach(t=>t.stop());}
 });
 await page.getByRole('button',{name:'Pause loop',exact:true}).click();
 const {createHash}=await import('node:crypto'),frameHashes=motionCapture.frames.map(v=>createHash('sha256').update(Buffer.from(v)).digest('hex'));
 assert.equal(new Set(frameHashes).size,5,JSON.stringify({frameHashes}));
 for(const [i,frame]of motionCapture.frames.entries())await writeFile(resolve(out,`motion-${i}.jpg`),Buffer.from(frame));
 await writeFile(resolve(out,'normalized-cycles-motion.webm'),Buffer.from(motionCapture.video));
 await writeFile(resolve(out,'motion-replay.html'),'<!doctype html><meta name="viewport" content="width=device-width"><title>Normalized cycle motion</title><style>body{margin:40px auto;padding:20px;max-width:1100px;background:#222;color:#ddd;font:16px system-ui}video{width:100%}</style><h1>Normalized cycles: live preview</h1><p>Three-second recording at production speed. Motion and all weather cycle counts are 2. Plays once per activation.</p><video controls preload="metadata" poster="motion-4.jpg" src="normalized-cycles-motion.webm"></video>');
 pass('Normalized live animation has five distinct frames and a bounded production-speed replay',{selector:'.photo-artboard canvas',frameCount:5,durationMs:3000,frameHashes});
 assert.deepEqual(errors,[]);
 await writeFile(resolve(out,'cycle-report.json'),JSON.stringify({result:'passed',checkedAt:new Date().toISOString(),origin,checks,errors},null,2));
}catch(error){await writeFile(resolve(out,'cycle-report.json'),JSON.stringify({result:'failed',checkedAt:new Date().toISOString(),checks,errors,failure:String(error)},null,2));throw error;
}finally{clearTimeout(timer);await context?.close();await browser?.close();}
