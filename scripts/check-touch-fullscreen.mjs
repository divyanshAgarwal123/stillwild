import { chromium,expect } from '@playwright/test';
import {writeFile} from 'node:fs/promises';
let browser,context;
const timer=setTimeout(()=>void browser?.close(),40000);
try{
 browser=await chromium.launch({executablePath:process.env.STILLWILD_CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,timeout:15000});
 context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 const page=await context.newPage();page.setDefaultTimeout(12000);await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Enter fullscreen wallpaper'}).tap();
 await expect(page.locator('.topbar')).toBeHidden();await expect(page.locator('.inspector')).toBeHidden();
 await page.waitForTimeout(5500);
 const back=page.getByRole('button',{name:/Back to studio/});await expect(back).toBeVisible();await expect(page.locator('.wallpaper-controls')).toHaveCSS('opacity','1');
 await page.screenshot({path:'.asyncly/visual-captures/touch-wallpaper.jpg',type:'jpeg',quality:88});
 await back.tap();await expect(page.locator('.topbar')).toBeVisible();
 await writeFile('.asyncly/visual-captures/touch-fullscreen-report.json',JSON.stringify({result:'passed',checkedAt:new Date().toISOString(),origin:'http://127.0.0.1:5173',viewport:{width:390,height:844},checks:['Touch wallpaper hides studio controls','Touch return control remains visible after desktop fade duration','Tapping return exits fullscreen and restores studio']},null,2));
 console.log('PASS Touch wallpaper has a persistent, working exit; studio controls hidden');
}finally{clearTimeout(timer);await context?.close();await browser?.close();}
