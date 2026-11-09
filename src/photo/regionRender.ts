import type {Layer} from './model';
import {cropWindow,mappedMask,MASK_H,MASK_W} from './scene.ts';
import type {SceneRegion} from './scene.ts';
const make=(w=1,h=1)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const TAU=Math.PI*2;
export const REGION_LIMITS={longEdge:960,pixels:960*540,maskBytes:24*1024*1024,fieldBytes:256*1024} as const;
export function regionSize(w:number,h:number){const scale=Math.min(1,REGION_LIMITS.longEdge/Math.max(w,h),Math.sqrt(REGION_LIMITS.pixels/(w*h)));return{width:Math.max(1,Math.floor(w*scale)),height:Math.max(1,Math.floor(h*scale))};}
// One periodic source sample, rather than opposite-image crossfades that cancel into blur.
export function displacement(r:SceneRegion,x:number,y:number,phase:number){
 const t=phase*r.speed*TAU,a=r.direction*Math.PI/180,amount=r.amount/100,f=2+r.scale/12;
 let along:number,cross:number;
 if(r.kind==='cloud'){along=(Math.sin(t+.55)+.16*Math.sin(y*f+t))*amount*.035;cross=Math.cos(t+.55)*amount*.006;}
 else if(r.kind==='foliage'){const anchor=(1-y)**.65;along=Math.sin(t+y*f*.2+x*f*.3)*amount*.009*anchor;cross=Math.cos(t+x*f*.3)*amount*.004*anchor;}
 else{along=Math.sin((x*f+y*f*.43)*TAU-t)*amount*.015;cross=Math.cos((y*f*.7+x*1.3)*TAU+t)*amount*.004;}
 return{x:Math.cos(a)*along-Math.sin(a)*cross,y:Math.sin(a)*along+Math.cos(a)*cross};
}
type Matte={values:Float32Array;indices:Uint32Array};
type Field={s:Float32Array;c:Float32Array;cs:Float32Array;cc:Float32Array;rows:Float32Array;crossRows:Float32Array;anchor:Float32Array};
export class RegionRenderer{
 private output=make();private work=make();private effect=make();private bright=make();private blur=make();
 private maskBytes=0;private fieldBytes=0;private masks=new Map<string,Matte>();private fields=new Map<string,Field>();private dest:ImageData|null=null;
 private matte(r:SceneRegion,l:Layer,w:number,h:number,aspect:number):Matte{
  const crop=cropWindow(l,aspect),key=JSON.stringify([r.mask,r.strokes,r.feather,l.scene!.crop,crop,w,h]),old=this.masks.get(key);if(old)return old;
  const coarse=mappedMask(r,l.scene!.crop,crop),small=make(MASK_W,MASK_H),sc=small.getContext('2d')!,d=sc.createImageData(MASK_W,MASK_H);for(let i=0;i<coarse.length;i++)d.data[i*4+3]=coarse[i];sc.putImageData(d,0,0);
  const work=this.work.getContext('2d',{willReadFrequently:true})!;work.clearRect(0,0,w,h);work.filter='blur('+(r.feather/100*w*.008)+'px)';work.drawImage(small,0,0,w,h);work.filter='none';const pixels=work.getImageData(0,0,w,h).data,values=new Float32Array(w*h),active:number[]=[];
  for(let i=0;i<values.length;i++){values[i]=pixels[i*4+3]/255;if(pixels[i*4+3])active.push(i);}small.width=small.height=1;
  const result={values,indices:Uint32Array.from(active)};const bytes=values.byteLength+result.indices.byteLength;while(this.maskBytes+bytes>REGION_LIMITS.maskBytes&&this.masks.size){const k=this.masks.keys().next().value!,v=this.masks.get(k)!;this.maskBytes-=v.values.byteLength+v.indices.byteLength;this.masks.delete(k);}this.masks.set(key,result);this.maskBytes+=bytes;return result;
 }
 private field(r:SceneRegion,w:number,h:number){
  const key=JSON.stringify([r.kind,r.scale,w,h]),cached=this.fields.get(key);if(cached)return cached;
  const s=new Float32Array(w),c=new Float32Array(w),cs=new Float32Array(w),cc=new Float32Array(w),rows=new Float32Array(h),crossRows=new Float32Array(h),anchor=new Float32Array(h),f=2+r.scale/12;
  for(let x=0;x<w;x++){const a=x/w*(r.kind==='water'?f*TAU:f*.3),b=x/w*1.3*TAU;s[x]=Math.sin(a);c[x]=Math.cos(a);cs[x]=Math.sin(b);cc[x]=Math.cos(b);}
  for(let y=0;y<h;y++){rows[y]=y/h*(r.kind==='water'?f*.43*TAU:r.kind==='foliage'?f*.2:f);crossRows[y]=y/h*f*.7*TAU;anchor[y]=(1-y/h)**.65;}
  const result={s,c,cs,cc,rows,crossRows,anchor},bytes=Object.values(result).reduce((n,v)=>n+v.byteLength,0);
  while(this.fieldBytes+bytes>REGION_LIMITS.fieldBytes&&this.fields.size){const k=this.fields.keys().next().value!;this.fieldBytes-=Object.values(this.fields.get(k)!).reduce((n,v)=>n+v.byteLength,0);this.fields.delete(k);}
  this.fields.set(key,result);this.fieldBytes+=bytes;return result;
 }
 stats(){return{maskBytes:this.maskBytes,fieldBytes:this.fieldBytes,masks:this.masks.size,fields:this.fields.size,width:this.work.width,height:this.work.height};}

 apply(base:HTMLCanvasElement,l:Layer,phase:number,motion:boolean,sourceAspect:number){
  const regions=l.scene?.regions.filter(r=>r.enabled&&r.amount>0&&(motion||r.kind==='bloom'));if(!regions?.length)return base;
  const w=base.width,h=base.height,{width:ww,height:hh}=regionSize(w,h);
  if(this.output.width!==w||this.output.height!==h){this.output.width=w;this.output.height=h;}
  for(const c of [this.work,this.effect,this.bright,this.blur])if(c.width!==ww||c.height!==hh){c.width=ww;c.height=hh;}
  const out=this.output.getContext('2d')!,work=this.work.getContext('2d',{willReadFrequently:true})!,fx=this.effect.getContext('2d')!;
  if(!this.dest||this.dest.width!==ww||this.dest.height!==hh)this.dest=fx.createImageData(ww,hh);const dest=this.dest;
  out.clearRect(0,0,w,h);out.drawImage(base,0,0);
  for(const r of regions){
   const {values:mask,indices}=this.matte(r,l,ww,hh,sourceAspect);if(!indices.length)continue;
   work.clearRect(0,0,ww,hh);work.drawImage(this.output,0,0,ww,hh);const src=work.getImageData(0,0,ww,hh).data;dest.data.fill(0);
   if(r.kind==='bloom'){
    const bc=this.bright.getContext('2d')!,glow=this.blur.getContext('2d')!,threshold=r.threshold/100,bright=bc.createImageData(ww,hh);
    for(const i of indices){const j=i*4,max=Math.max(src[j],src[j+1],src[j+2])/255,weight=Math.max(0,(max-threshold)/Math.max(.01,1-threshold));for(let k=0;k<3;k++)bright.data[j+k]=src[j+k];bright.data[j+3]=Math.round(weight*mask[i]*src[j+3]);}bc.putImageData(bright,0,0);glow.clearRect(0,0,ww,hh);
    for(const [scale,alpha]of [[.004,.3],[.012,.45],[.03,.25]]){glow.globalAlpha=alpha;glow.filter='blur('+(ww*scale*(.2+r.radius/25))+'px)';glow.drawImage(this.bright,0,0);}glow.filter='none';glow.globalAlpha=1;const g=glow.getImageData(0,0,ww,hh).data;
    for(const i of indices){const j=i*4,amount=r.amount/100*3*g[j+3]/255;for(let k=0;k<3;k++)dest.data[j+k]=255-(255-src[j+k])*(1-Math.min(1,g[j+k]/255*amount));dest.data[j+3]=Math.round(Math.sqrt(mask[i])*255);}
   }else{
    const f=this.field(r,ww,hh),t=phase*r.speed*TAU,amount=r.amount/100,a=r.direction*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a),ct=Math.cos(t),st=Math.sin(t);
    for(let y=0;y<hh;y++){
     const rc=Math.cos(f.rows[y]+(r.kind==='water'?-t:t)),rs=Math.sin(f.rows[y]+(r.kind==='water'?-t:t)),xc=Math.cos(f.crossRows[y]+t),xs=Math.sin(f.crossRows[y]+t),cloudAlong=(Math.sin(t+.55)+.16*rs)*amount*.035,cloudCross=Math.cos(t+.55)*amount*.006;
     for(let x=0;x<ww;x++){const i=y*ww+x,raw=mask[i],u=Math.max(0,Math.min(1,(raw-.1)/.5)),m=r.kind==='foliage'?u*u*(3-2*u):raw;if(!m)continue;const j=i*4,wave=f.s[x]*rc+f.c[x]*rs,cross=f.cc[x]*xc-f.cs[x]*xs,along=r.kind==='cloud'?cloudAlong:r.kind==='foliage'?wave*amount*.009*f.anchor[y]:wave*amount*.015,across=r.kind==='cloud'?cloudCross:r.kind==='foliage'?(f.c[x]*ct-f.s[x]*st)*amount*.004*f.anchor[y]:cross*amount*.004;
      const sx=Math.max(0,Math.min(ww-1,x+(ca*along-sa*across)*ww*m)),sy=Math.max(0,Math.min(hh-1,y+(sa*along+ca*across)*hh*m)),ix=Math.floor(sx),iy=Math.floor(sy),dx=sx-ix,dy=sy-iy,k=(iy*ww+ix)*4,b=(iy*ww+Math.min(ww-1,ix+1))*4,c=(Math.min(hh-1,iy+1)*ww+ix)*4,d=(Math.min(hh-1,iy+1)*ww+Math.min(ww-1,ix+1))*4,wa=(1-dx)*(1-dy),wb=dx*(1-dy),wc=(1-dx)*dy,wd=dx*dy;
      for(let n=0;n<3;n++)dest.data[j+n]=src[k+n]*wa+src[b+n]*wb+src[c+n]*wc+src[d+n]*wd;
      // One sample, original alpha. Displacement tends to zero at the matte boundary.
      dest.data[j+3]=src[j+3]?255:0;
     }
    }
   }
   fx.putImageData(dest,0,0);out.globalCompositeOperation='source-atop';out.drawImage(this.effect,0,0,w,h);out.globalCompositeOperation='source-over';
  }return this.output;
 }
 dispose(){this.masks.clear();this.fields.clear();this.maskBytes=this.fieldBytes=0;this.dest=null;for(const c of [this.output,this.work,this.effect,this.bright,this.blur])c.width=c.height=1;}
}
