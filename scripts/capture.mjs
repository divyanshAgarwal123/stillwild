import {chromium} from '@playwright/test';
const timeout=setTimeout(()=>{console.error('Capture exceeded its 55 second bound');process.exitCode=1;void browser?.close();},55000);
let browser,context;
try{
 browser=await chromium.launch({executablePath:process.env.STILLWILD_CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,timeout:15000});
 context=await browser.newContext({viewport:{width:1440,height:1050},deviceScaleFactor:1});
 const page=await context.newPage();page.setDefaultTimeout(12000);
 page.on('pageerror',e=>console.error('PAGE ERROR',e.message));
 await page.goto(process.env.STILLWILD_URL||'http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await page.getByRole('heading',{name:'Shadow Garden.'}).waitFor();
 await page.getByRole('button',{name:'Pause animation',exact:true}).click();
 await page.screenshot({path:'.asyncly/visual-captures/shadow-garden-initial.jpg',type:'jpeg',quality:90});
 console.log(await page.title());
}finally{clearTimeout(timeout);await context?.close();await browser?.close();}
