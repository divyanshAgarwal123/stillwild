import './release-context.mjs';
import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const out=resolve(process.env.STILLWILD_EVIDENCE_DIR||'.asyncly/visual-captures/scene-studio');await mkdir(out,{recursive:true});let browser,context,page;const timer=setTimeout(()=>void browser?.close(),540000),checks=[];
try{
 browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,timeout:15000});context=await browser.newContext({viewport:{width:1280,height:800},acceptDownloads:true});page=await context.newPage();await page.goto('http://127.0.0.1:5173/?view=studio',{waitUntil:'networkidle'});const pause=page.getByRole('button',{name:'Pause preview',exact:true});if(await pause.isVisible())await pause.click();
 for(const [asset,kind,file]of [['braies-lake','water','water'],['forest-falcade','cloud','cloud'],['tokyo-asakusa','bloom','bloom']]){
  await page.evaluate(async({asset,kind})=>{const {makeWallpaper}=await import('/src/photo/model.ts'),{analyseLayer}=await import('/src/photo/analysis.ts'),{newRegion}=await import('/src/photo/scene.ts');const p=makeWallpaper(asset);p.duration=4;p.paused=true;for(const w of Object.values(p.weather))w.enabled=false;const l=p.layers[0],a=await analyseLayer(l,p,new AbortController().signal),r={...newRegion(kind,a.masks[kind]),enabled:true,amount:kind==='bloom'?75:55,feather:40};l.scene={profile:a.profile,crop:a.crop,sourceAspect:a.sourceAspect,regions:[r]};window.__sceneExport=p;},{asset,kind});
  const deliver=async(name,format,enabled=true)=>{const pending=page.waitForEvent('download',{timeout:210000});await page.evaluate(async({name,format,enabled})=>{const {png,video}=await import('/src/photo/render.ts');const p=structuredClone(window.__sceneExport);p.layers[0].scene.regions[0].enabled=enabled;const blob=format==='video'?(await video(p,false,()=>{},new AbortController().signal)).blob:await png(p,1,format==='png'?3840:1280,false);const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);},{name,format,enabled});await(await pending).saveAs(resolve(out,name));};
  await deliver(file+'-before.png','poster',false);await deliver(file+'-after.png','poster',true);await deliver(file+'-4s.webm','video');if(file==='water'){await deliver('water-before-4s.webm','video',false);await deliver('water-4k.png','png');}
  const scene=await page.evaluate(()=>window.__sceneExport.layers[0].scene);checks.push({asset,kind,scene,result:'exported',duration:4,expectedFrames:96});console.log('EXPORTED',file);
 }
 await writeFile(out+'/export-creation.json',JSON.stringify({result:'exported; decode verification separate',checks},null,2));
}finally{clearTimeout(timer);await context?.close();await browser?.close();}
