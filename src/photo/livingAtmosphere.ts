export type LivingScene='forest-falcade'|'dunes-light'|'tokyo-asakusa';
export const LIVING_LIMITS={longEdge:640,fps:20,maxDelta:.1} as const;
export function livingRunning(ready:boolean,paused:boolean,hidden:boolean,reduced:boolean){return ready&&!paused&&!hidden&&!reduced;}
const smooth=(a:number,b:number,v:number)=>{const x=Math.max(0,Math.min(1,(v-a)/(b-a)));return x*x*(3-2*x);};
export function makeLivingPlate(data:Uint8ClampedArray,width:number,height:number,scene:LivingScene){
 const mask=new Float32Array(width*height);for(let i=0;i<mask.length;i++){const r=data[i*4],g=data[i*4+1],b=data[i*4+2],hi=Math.max(r,g,b),lo=Math.min(r,g,b),lum=(r+g+b)/3,sat=(hi-lo)/Math.max(1,hi),y=Math.floor(i/width)/height;
  mask[i]=scene==='forest-falcade'?smooth(70,170,lum)*(1-smooth(.08,.32,sat))*(1-smooth(.68,.95,y)):scene==='dunes-light'?smooth(.24,.5,y):smooth(35,115,lum)*smooth(.12,.55,sat);
 }return {data,width,height,scene,mask,output:new Uint8ClampedArray(data.length)};
}
export type LivingPlate=ReturnType<typeof makeLivingPlate>;
// Image-space treatments: fog pixels drift, ridges stay fixed, existing lights breathe.
export function livingFrame(p:LivingPlate,seconds:number){
 const {width:w,height:h,data,mask,output,scene}=p,t=Number.isFinite(seconds)?seconds:0;
 const xs=Float32Array.from({length:w},(_,x)=>Math.sin(x/w*8-t*.38)),ys=Float32Array.from({length:h},(_,y)=>Math.sin(y/h*9+t*.24));
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=y*w+x,k=i*4,m=mask[i];output[k+3]=0;if(m<.015)continue;
  if(scene==='forest-falcade'){
   const sx=Math.max(0,Math.min(w-2,x+(ys[y]*4+xs[x]*2)*w/640)),sy=Math.max(0,Math.min(h-2,y+xs[x]*h/400)),ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy,a=(iy*w+ix)*4,b=a+4,c=a+w*4,d=c+4,gain=1+.025*xs[x]*ys[y];
   for(let n=0;n<3;n++)output[k+n]=((data[a+n]*(1-fx)+data[b+n]*fx)*(1-fy)+(data[c+n]*(1-fx)+data[d+n]*fx)*fy)*gain;
   output[k+3]=m*200;
  }else if(scene==='dunes-light'){
   // Travelling, diffuse exposure over the sand; no displacement of the ridges.
   const gain=(xs[x]*.65+ys[y]*.35)*.075,lum=(data[k]+data[k+1]+data[k+2])/3;
   for(let n=0;n<3;n++)output[k+n]=gain>0?255:0;
   output[k+3]=m*Math.abs(gain)*255*(gain>0?lum/255:.85);
  }else{
   const water=smooth(.54,.74,y/h),wave=xs[x]*ys[y],gain=(.5+.5*wave)*(.1+water*.12);
   const signGain=.94+.14*(.5+.5*wave),limit=255/Math.max(1,data[k],data[k+1],data[k+2]),colourGain=Math.min(signGain,limit);
   for(let n=0;n<3;n++)output[k+n]=data[k+n]*colourGain;output[k+3]=m*155;
   // Reflection shimmer uses only coloured highlight pixels, not buildings.
   if(water){const offset=Math.round(wave*1.8),q=(y*w+Math.max(0,Math.min(w-1,x+offset)))*4;for(let n=0;n<3;n++)output[k+n]=Math.min(255,data[q+n]*(1+gain));output[k+3]=m*water*115;}
  }
 }
 return output;
}
