import {MASK_W,MASK_H,SCENE_PROFILES,PROFILE_TOOLS} from './scene.ts';
import type {SceneProfile,RegionKind,Crop} from './scene.ts';
export type SceneAnalysis={key:string;profile:SceneProfile;curated:boolean;note:string;tools:RegionKind[];palette:string[];luminance:number;contrast:number;highlights:number;crop:Crop;sourceAspect:number;masks:Record<RegionKind,Uint8Array>;coverage:Record<RegionKind,number>;brightness:Uint8Array;centers:Record<RegionKind,{x:number;y:number}>};
export function analysePixels(data:Uint8ClampedArray,width:number,height:number,asset:string,key=''):SceneAnalysis{
 const lum:number[]=[],bins=new Map<number,{r:number;g:number;b:number;n:number}>(),masks={cloud:new Uint8Array(MASK_W*MASK_H),water:new Uint8Array(MASK_W*MASK_H),foliage:new Uint8Array(MASK_W*MASK_H),bloom:new Uint8Array(MASK_W*MASK_H)};const brightness=new Uint8Array(MASK_W*MASK_H);let blueUpper=0,blueLower=0,greens=0,blues=0,dark=0,high=0,mean=0;
 for(let i=0;i<data.length;i+=4){const r=data[i],g=data[i+1],b=data[i+2],l=(.2126*r+.7152*g+.0722*b)/255;lum.push(l);mean+=l;if(i/4<width*height/2)blueUpper+=Math.max(0,b-r);else blueLower+=Math.max(0,b-r);if(l<.12)dark++;if(Math.max(r,g,b)>210)high++;if(g>r*1.1&&g>b*1.05)greens++;if(b>r*1.12&&g>r*1.03&&b>g*.7)blues++;const id=(r>>5)*64+(g>>5)*8+(b>>5),bin=bins.get(id)||{r:0,g:0,b:0,n:0};bin.r+=r;bin.g+=g;bin.b+=b;bin.n++;bins.set(id,bin);}
 mean/=lum.length;const sorted=[...lum].sort((a,b)=>a-b),contrast=sorted[Math.floor(sorted.length*.9)]-sorted[Math.floor(sorted.length*.1)];
 const curated=SCENE_PROFILES[asset],profile=curated?.profile||(mean<.32&&dark/lum.length>.28&&high/lum.length>.006?'city':dark/lum.length>.6?'space':blues/lum.length>.55&&contrast>.25&&blueLower<=blueUpper*1.2?'landscape':blues/lum.length>.18?'water':greens/lum.length>.12?'landscape':'minimal');
 const palette:string[]=[],rgb:number[][]=[];for(const bin of [...bins.values()].sort((a,b)=>b.n-a.n)){const c=[bin.r/bin.n,bin.g/bin.n,bin.b/bin.n];if(rgb.every(p=>Math.hypot(...c.map((v,i)=>v-p[i]))>40)){rgb.push(c);palette.push('#'+c.map(v=>Math.round(v).toString(16).padStart(2,'0')).join(''));}if(palette.length===5)break;}
 const clamp=(v:number)=>Math.max(0,Math.min(1,v)),smooth=(a:number,b:number,v:number)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
 for(let y=0;y<MASK_H;y++)for(let x=0;x<MASK_W;x++){const px=Math.min(width-2,Math.max(1,Math.round(x/(MASK_W-1)*(width-1)))),py=Math.min(height-2,Math.max(1,Math.round(y/(MASK_H-1)*(height-1)))),i=(py*width+px)*4,r=data[i]/255,g=data[i+1]/255,b=data[i+2]/255,max=Math.max(r,g,b),min=Math.min(r,g,b),s=max?1-min/max:0,l=lum[py*width+px],edge=Math.abs(l-lum[py*width+px+1])+Math.abs(l-lum[(py+1)*width+px]),v=y/(MASK_H-1),index=y*MASK_W+x;
 const sky=clamp((.88-v)*2),lower=smooth(.48,.7,v),green=clamp((g-r*.85)*6)*clamp((g-b*.8)*5),blue=clamp((b-r*.9)*4)*clamp((g-r*.8)*4)*clamp((b/Math.max(.01,g)-.6)*3);
 masks.cloud[index]=Math.round(255*smooth(.28,.63,l)*clamp(1-s*2.7)*sky*clamp(1-edge*2));
 brightness[index]=Math.round(max*255);
 const waterArea=asset==='coast-monochrome'||asset==='pacific-edge'?1:asset==='sorapiss'?smooth(.68,.87,v):asset==='forest-water'?smooth(.56,.78,v):lower;
 const waterTone=asset==='venice'?clamp(.35+blue*.5)*(1-smooth(.08,.3,edge)):profile==='water'&&s<.1?clamp(.4+l*.8+edge):blue*clamp(1-edge*2);
 masks.water[index]=Math.round(255*waterArea*waterTone);
 const leafGreen=smooth(.015,.09,g-Math.max(r,b))*smooth(.12,.35,s),warmLeaf=smooth(.18,.45,s)*smooth(.08,.24,r-b)*smooth(.3,.55,v)*(1-smooth(.62,.78,v));
 const leaf=asset==='sorapiss'?Math.max(leafGreen,warmLeaf):leafGreen;
 masks.foliage[index]=Math.round(255*Math.sqrt(leaf*clamp(1-l))*clamp(.7+edge*3));
 masks.bloom[index]=Math.round(255*clamp((max-.5)*2)**1.5);
 }
 const coverage={} as SceneAnalysis['coverage'],centers={} as SceneAnalysis['centers'];for(const kind of Object.keys(masks) as RegionKind[]){let sum=0,cx=0,cy=0;for(let i=0;i<masks[kind].length;i++){const v=masks[kind][i]/255;sum+=v;cx+=(i%MASK_W)/(MASK_W-1)*v;cy+=Math.floor(i/MASK_W)/(MASK_H-1)*v;}coverage[kind]=sum/masks[kind].length;centers[kind]={x:sum?cx/sum:.5,y:sum?cy/sum:.5};}
 return{key,profile,curated:!!curated,tools:curated?.tools||PROFILE_TOOLS[profile],note:curated?.note||'Suggested from local colour, brightness and texture. Correct the scene and paint the matte where needed.',palette,brightness,luminance:mean,contrast,highlights:high/lum.length,crop:{x:0,y:0,w:1,h:1},sourceAspect:width/height,masks,coverage,centers};
}
