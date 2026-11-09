import type { Theme } from './model';
type Asset={path:string;image:HTMLImageElement|null;status:'loading'|'ready'|'error';promise:Promise<void>|null};
const assets:Record<string,Asset>={natural:{path:'/art/natural-conservatory.png',image:null,status:'loading',promise:null},future:{path:'/art/future-nocturne.png',image:null,status:'loading',promise:null}};
let all:Promise<void>|null=null;
export function preloadAssets():Promise<void>{
 if(all)return all;
 all=Promise.all(Object.values(assets).map(asset=>{
  const image=new Image();image.crossOrigin='anonymous';image.decoding='async';image.src=asset.path;
  let timer:ReturnType<typeof setTimeout>;
  const decoded=Promise.race([image.decode(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Environment load timed out')),8000);})]);
  asset.promise=decoded.then(()=>{asset.image=image;asset.status='ready';}).catch(()=>{asset.image=null;asset.status='error';image.src='';}).finally(()=>{clearTimeout(timer);window.dispatchEvent(new Event('stillwild:assets'));});
  return asset.promise;
 })).then(()=>{});return all;
}
export const getBackplate=(theme:Theme)=>assets[theme]?.image||null;
export const getAssetStatus=(theme:Theme)=>assets[theme]?.status||'procedural';
export function drawCover(ctx:CanvasRenderingContext2D,image:HTMLImageElement,width:number,height:number){const scale=Math.max(width/image.naturalWidth,height/image.naturalHeight);const w=image.naturalWidth*scale,h=image.naturalHeight*scale;ctx.drawImage(image,(width-w)/2,(height-h)/2,w,h);}

export async function environmentReady(theme:Theme,enabled:boolean):Promise<void>{
 if(!enabled||!assets[theme])return;void preloadAssets();await assets[theme].promise;
}
