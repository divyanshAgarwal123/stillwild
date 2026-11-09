// Loaded only by the release audit. Every browser uses disposable storage.
import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const browsers=new Set(),contexts=[],blocked=[];
const launch=chromium.launch.bind(chromium);
chromium.launch=async options=>{
 const browser=await launch(options);browsers.add(browser);
 const create=browser.newContext.bind(browser);
 browser.newContext=async options=>{
  const context=await create({...options,deviceScaleFactor:1,serviceWorkers:'block'});
  contexts.push({createdAt:new Date().toISOString(),viewport:options?.viewport||null,persistent:false});
  context.setDefaultTimeout(10000);
  // Suite-specific mock routes are installed afterwards and take precedence.
  await context.route('**/*',route=>{
   const url=new URL(route.request().url());
   if(['127.0.0.1','localhost','[::1]'].includes(url.hostname))return route.continue();
   blocked.push({origin:url.origin,method:route.request().method()});
   return route.abort('blockedbyclient');
  });
  return context;
 };
 return browser;
};
const close=async()=>{for(const browser of browsers)await browser.close().catch(()=>{});};
for(const signal of ['SIGTERM','SIGINT'])process.once(signal,()=>void close().finally(()=>process.exit(124)));
process.on('exit',()=>writeFileSync(resolve(process.env.STILLWILD_EVIDENCE_DIR,(process.env.STILLWILD_SUITE||'run')+'-isolated-contexts.json'),JSON.stringify({checkedAt:new Date().toISOString(),contexts,blockedUnmockedNetwork:blocked},null,2)+'\n'));
