import {useEffect,useRef,useState} from 'react';
import type {MutableRefObject} from 'react';
import {drawArtwork,hitObject} from './art';
import {getAssetStatus,preloadAssets} from './assets';
import {clamp,MAX_TIME,OBJECT_NAMES} from './model';
import type {Composition} from './model';
export type ArtworkProps={composition:Composition;paused:boolean;reduced:boolean;selected:string|null;lightMode:boolean;timeRef:MutableRefObject<number>;onStart:()=>void;onEnd:()=>void;onChange:(s:Composition)=>void;onSelect:(id:string|null)=>void};
export default function Artwork({composition,paused,reduced,selected,lightMode,timeRef,onStart,onEnd,onChange,onSelect}:ArtworkProps){
 const canvas=useRef<HTMLCanvasElement>(null),latest=useRef(composition),[hidden,setHidden]=useState(document.hidden),[assetsRevision,assetsChanged]=useState(0);latest.current=composition;
 const dragging=useRef<{id:string;startX:number;startY:number;x:number;y:number;composition:Composition}|null>(null);
 useEffect(()=>{const visibility=()=>setHidden(document.hidden),assets=()=>assetsChanged(n=>n+1);document.addEventListener('visibilitychange',visibility);window.addEventListener('stillwild:assets',assets);void preloadAssets();return()=>{document.removeEventListener('visibilitychange',visibility);window.removeEventListener('stillwild:assets',assets);};},[]);
 useEffect(()=>{const el=canvas.current!,ctx=el.getContext('2d')!;const resize=()=>{if(document.hidden)return;const bounds=el.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);el.width=Math.round(bounds.width*dpr);el.height=Math.round(bounds.height*dpr);drawArtwork(ctx,latest.current,timeRef.current,el.width,el.height);};const observer=new ResizeObserver(resize);observer.observe(el);resize();return()=>observer.disconnect();},[timeRef]);
 useEffect(()=>{
  if(hidden)return;const el=canvas.current!,ctx=el.getContext('2d')!,bounds=el.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);const width=Math.round(bounds.width*dpr),height=Math.round(bounds.height*dpr);if(el.width!==width||el.height!==height){el.width=width;el.height=height;}drawArtwork(ctx,composition,timeRef.current,el.width,el.height);
  if(paused||reduced||composition.effects.speed===0)return;
  let raf=0,previous=performance.now(),lastDraw=0;
  const render=(now:number)=>{if(document.hidden)return;timeRef.current=Math.min(MAX_TIME,timeRef.current+Math.min((now-previous)/1000,.08)*(composition.effects.speed/50));previous=now;if(now-lastDraw>=40){drawArtwork(ctx,composition,timeRef.current,el.width,el.height);lastDraw=now;}raf=requestAnimationFrame(render);};raf=requestAnimationFrame(render);return()=>cancelAnimationFrame(raf);
 },[composition,paused,reduced,hidden,assetsRevision,timeRef]);
 const point=(e:React.PointerEvent)=>{const r=canvas.current!.getBoundingClientRect();return {x:clamp((e.clientX-r.left)/r.width,0,1),y:clamp((e.clientY-r.top)/r.height,0,1)};};
 const down=(e:React.PointerEvent<HTMLElement>,forcedId?:string)=>{
  if(e.button!==0)return;e.preventDefault();const p=point(e);e.currentTarget.setPointerCapture(e.pointerId);
  if(lightMode){onStart();dragging.current={id:'light',startX:p.x,startY:p.y,x:p.x,y:p.y,composition};onChange({...composition,light:{...composition.light,x:p.x,y:p.y}});return;}
  const hit=forcedId?composition.objects.find(o=>o.id===forcedId):hitObject(canvas.current!.getContext('2d')!,composition,timeRef.current,p.x,p.y);onSelect(hit?.id||null);
  if(hit){onStart();dragging.current={id:hit.id,startX:p.x,startY:p.y,x:hit.x,y:hit.y,composition};}
 };
 const move=(e:React.PointerEvent)=>{const d=dragging.current;if(!d)return;const p=point(e);if(d.id==='light'){onChange({...d.composition,light:{...d.composition.light,x:p.x,y:p.y}});return;}onChange({...d.composition,objects:d.composition.objects.map(o=>o.id===d.id?{...o,x:clamp(d.x+p.x-d.startX,-.2,1.2),y:clamp(d.y+p.y-d.startY,-.2,1.24)}:o)});};
 const release=()=>{if(dragging.current){dragging.current=null;onEnd();}};
 const target=composition.objects.find(o=>o.id===selected);
 const keyboard=(e:React.KeyboardEvent)=>{if(!e.key.startsWith('Arrow'))return;e.preventDefault();onStart();const dx=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0,dy=e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0,step=e.shiftKey?.03:.008;if(lightMode)onChange({...composition,light:{...composition.light,x:clamp(composition.light.x+dx*step,0,1),y:clamp(composition.light.y+dy*step,0,1)}});else if(target)onChange({...composition,objects:composition.objects.map(o=>o.id===selected?{...o,x:clamp(o.x+dx*step,-.2,1.2),y:clamp(o.y+dy*step,-.2,1.24)}:o)});};
 const status=getAssetStatus(composition.theme);
 return <div className={`artwork ${lightMode?'light-tool':''}`} data-testid="artwork" onPointerMove={move} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}>
  <canvas ref={canvas} onPointerDown={down} onKeyDown={keyboard} onKeyUp={onEnd} onBlur={onEnd} tabIndex={0} role="img" aria-label={`${composition.theme} ${composition.scene==='garden'?'Shadow Garden':'Rainprint'} artwork. Drag an element or select one in the inspector and use arrow keys.`}/>
  {lightMode&&<div className="light-marker" style={{left:`${composition.light.x*100}%`,top:`${composition.light.y*100}%`}}><span/><i/></div>}
  {target&&!lightMode&&<button className="selection-marker" onPointerDown={e=>down(e,target.id)} aria-label="Drag selected element" style={{left:`${clamp(target.x*100,4,96)}%`,top:`${clamp(target.y*100-(target.kind==='cloud'?0:target.kind==='circle'?8:22),8,90)}%`}}><span/>{OBJECT_NAMES[target.kind]}</button>}
  {composition.effects.backplate&&status==='loading'&&<div className="asset-note">Preparing the environment…</div>}
  {composition.effects.backplate&&status==='error'&&<div className="asset-note">Procedural environment · image unavailable</div>}
 </div>;
}
export function Thumbnail({composition}:{composition:Composition}){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const draw=()=>drawArtwork(canvas.current!.getContext('2d')!,composition,composition.time,480,270);draw();window.addEventListener('stillwild:assets',draw);return()=>window.removeEventListener('stillwild:assets',draw);},[composition]);
 return <canvas ref={canvas} width={480} height={270} aria-hidden="true"/>;
}
