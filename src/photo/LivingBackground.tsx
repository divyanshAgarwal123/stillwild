import {useEffect,useLayoutEffect,useRef} from 'react';
import {LIVING_LIMITS,livingFrame,livingRunning,makeLivingPlate} from './livingAtmosphere';
import type {LivingScene} from './livingAtmosphere';
export default function LivingBackground({image,scene,ready,paused,reduced}:{image:HTMLImageElement|null;scene:LivingScene;ready:boolean;paused:boolean;reduced:boolean}){
 const ref=useRef<HTMLCanvasElement>(null),clock=useRef(0),options=useRef({paused,reduced}),syncRef=useRef<(()=>void)|null>(null);options.current={paused,reduced};
 useEffect(()=>{
  const canvas=ref.current;if(!canvas)return;if(reduced){canvas.width=1;canvas.height=1;canvas.dataset.running='false';return;}if(!image||!ready||!image.naturalWidth)return;let live=true,raf=0,last=0,drawn=0,frames=0,total=0,max=0;
  const scale=Math.min(1,LIVING_LIMITS.longEdge/Math.max(image.naturalWidth,image.naturalHeight));canvas.width=Math.round(image.naturalWidth*scale);canvas.height=Math.round(image.naturalHeight*scale);
  const source=document.createElement('canvas');source.width=canvas.width;source.height=canvas.height;const ctx=canvas.getContext('2d')!,read=source.getContext('2d',{willReadFrequently:true})!;read.drawImage(image,0,0,source.width,source.height);
  const plate=makeLivingPlate(read.getImageData(0,0,source.width,source.height).data,source.width,source.height,scene),frame=ctx.createImageData(source.width,source.height);
  const mq=matchMedia('(prefers-reduced-motion: reduce)'),canRun=()=>live&&livingRunning(ready,options.current.paused,document.hidden,options.current.reduced||mq.matches);
  const render=(stamp:number)=>{raf=0;if(!canRun())return;if(last)clock.current+=(stamp-last)/1000;last=stamp;
   if(stamp-drawn>=1000/LIVING_LIMITS.fps){const start=performance.now();frame.data.set(livingFrame(plate,clock.current));ctx.putImageData(frame,0,0);
    if(scene==='tokyo-asakusa'){ctx.strokeStyle='rgba(173,206,217,.17)';ctx.lineWidth=.65;for(let i=0;i<32;i++){const x=(i*97)%canvas.width,y=((i*53+clock.current*100)%(canvas.height+30))-30;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-1,y+12);ctx.stroke();}}
    const ms=performance.now()-start;frames++;total+=ms;max=Math.max(max,ms);drawn=stamp;canvas.dataset.frames=String(frames);canvas.dataset.drawMeanMs=(total/frames).toFixed(2);canvas.dataset.drawMaxMs=max.toFixed(2);
   }raf=requestAnimationFrame(render);
  };
  const sync=()=>{cancelAnimationFrame(raf);raf=0;last=0;canvas.dataset.running=String(canRun());if(canRun())raf=requestAnimationFrame(render);};syncRef.current=sync;sync();
  document.addEventListener('visibilitychange',sync);mq.addEventListener('change',sync);
  return()=>{live=false;syncRef.current=null;canvas.dataset.running='false';cancelAnimationFrame(raf);document.removeEventListener('visibilitychange',sync);mq.removeEventListener('change',sync);ctx.clearRect(0,0,canvas.width,canvas.height);canvas.width=1;canvas.height=1;source.width=1;source.height=1;};
 },[image,scene,ready,reduced]);
 useLayoutEffect(()=>{syncRef.current?.();},[paused,reduced]);
 return <canvas ref={ref} className="welcome-living" aria-hidden="true" data-running="false" data-scene={scene}/>;
}
