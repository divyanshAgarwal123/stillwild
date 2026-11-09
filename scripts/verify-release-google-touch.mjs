import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const out=resolve(process.env.STILLWILD_EVIDENCE_DIR||'.asyncly/visual-captures/release-retest/google-touch');
await mkdir(out,{recursive:true});let browser,context;
const deadline=setTimeout(()=>void browser?.close(),60000);
try{
 browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,timeout:15000});
 context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const page=await context.newPage();await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Library & layers',exact:true}).tap();
 await page.getByRole('button',{name:'Import video clip',exact:false}).tap();
 await page.getByLabel('Import video file',{exact:true}).setInputFiles(resolve('.asyncly/visual-captures/gemini-motion/fixture.mp4'));
 await expect(page.locator('.p-import-status')).toHaveCount(0);
 await page.getByRole('button',{name:'Close panel',exact:true}).tap();
 await page.getByRole('button',{name:'Properties',exact:true}).tap();
 await page.getByRole('tab',{name:'Motion',exact:true}).tap();
 const speed=page.getByRole('spinbutton',{name:'Playback speed value',exact:true});await speed.fill('1.25');await speed.press('Tab');await expect(speed).toHaveValue('1.25');
 await page.getByRole('tab',{name:'AI',exact:true}).tap();
 await expect(page.getByRole('combobox',{name:'Generation provider',exact:true})).toHaveValue('wan');
 await page.getByRole('combobox',{name:'Generation provider',exact:true}).selectOption('google');
 await expect(page.getByRole('link',{name:'Get API key'})).toBeVisible();
 await expect(page.getByRole('textbox',{name:'Gemini API key',exact:true})).toHaveValue('');
 await expect(page.getByRole('button',{name:/Generate with Google/})).toBeDisabled();
 await page.screenshot({path:resolve(out,'google-touch-390.jpg'),type:'jpeg',quality:85});
 await writeFile(resolve(out,'report.json'),JSON.stringify({result:'passed',checkedAt:new Date().toISOString(),checks:[{name:'390px touch video import/edit, explicit optional Google selection, key link and disabled empty-key generation',result:'passed'}]},null,2));
 console.log('PASS Corrected Google mobile path keeps the Free Wan default and explicitly chooses Google');
}finally{clearTimeout(deadline);await context?.close();await browser?.close();}
