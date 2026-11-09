import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {makeWallpaper,encodeProject} from '../src/photo/model.ts';
const stage=process.argv[2]||'before',out=resolve('.asyncly/visual-captures/motion-efficacy-retest',stage);await mkdir(out,{recursive:true});
let browser,context;const timer=setTimeout(()=>void browser?.close(),90000),checks=[],errors=[];
try{browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});context=await browser.newContext({viewport:{width:1280,height:900},deviceScaleFactor:1});await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));const project=makeWallpaper('braies-lake');project.paused=true;await p.goto('http://127.0.0.1:5173/?view=studio#studio='+encodeProject(project));await expect(p.locator('.photo-artboard canvas')).toBeVisible();
await p.locator('.wallpaper-actions').getByRole('button',{name:'Customize',exact:true}).click();await p.getByRole('button',{name:'Advanced +',exact:true}).click();await p.getByRole('tab',{name:'Local retouch',exact:true}).click();await expect(p.locator('.scene-add-tools')).toBeVisible();await p.locator('.scene-add-tools button').filter({hasText:'Water flow'}).click();await expect(p.getByLabel('Enable Water flow',{exact:true})).toBeVisible();await p.waitForTimeout(250);await p.screenshot({path:out+'/region-picked-paused.jpg',type:'jpeg',quality:88});
checks.push({name:'Region picker initial result',enabled:await p.getByLabel('Enable Water flow',{exact:true}).isChecked(),guide:await p.locator('.scene-matte').isVisible(),paused:await p.locator('.p-transport').getByLabel('Play preview',{exact:true}).count(),text:await p.locator('.scene-controls').innerText()});
if(stage!=='before'){
 await p.getByRole('button',{name:'Apply & preview',exact:true}).click();await expect(p.getByLabel('Enable Water flow',{exact:true})).toBeChecked();await expect(p.locator('.scene-matte')).toHaveCount(0);await expect(p.locator('.region-preview-status')).toContainText('Paused');
 const held=await p.locator('.photo-artboard canvas').evaluate(c=>c.toDataURL());await p.waitForTimeout(180);assert.equal(await p.locator('.photo-artboard canvas').evaluate(c=>c.toDataURL()),held);
 await p.locator('.region-preview-status').getByRole('button',{name:'Play preview',exact:true}).click();await expect(p.locator('.region-preview-status')).toContainText('Playing');await p.waitForTimeout(200);assert.notEqual(await p.locator('.photo-artboard canvas').evaluate(c=>c.toDataURL()),held);checks.push({name:'Apply shows artwork, respects paused preference; explicit Play starts visible motion',passed:true});
}
await writeFile(out+'/ui-report.json',JSON.stringify({stage,checks,errors},null,2));console.log(JSON.stringify(checks));assert.deepEqual(errors,[]);
}finally{clearTimeout(timer);await context?.close();await browser?.close();}
