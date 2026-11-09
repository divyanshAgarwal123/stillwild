import {useEffect,useRef,useState} from 'react';
import LivingBackground from './LivingBackground';
import type {LivingScene} from './livingAtmosphere';
import {FEATURED_SCENES} from './journey';
import {PHOTOS} from './model';
import {Icon} from '../icons';
export function Boot({message,retry,proceed}:{message:string;retry?:()=>void;proceed?:()=>void}){return <main className="journey-boot" aria-label="Opening Stillwild"><strong>stillwild</strong><p role="status">{message}</p>{retry&&<button onClick={retry}>Retry local restore</button>}{proceed&&<button onClick={proceed}>Continue without restoring</button>}</main>;}
export default function Welcome({resumeName,replay,instant,reduced=false,enter,choose,explore,close}:{resumeName?:string;replay:boolean;instant?:boolean;reduced?:boolean;enter:(id:string)=>Promise<void>;choose:()=>void;explore:()=>void;close:()=>void}){
 const [scene,setScene]=useState<string>(FEATURED_SCENES[0]),[imageState,setImageState]=useState<'loading'|'ready'|'failed'>('loading'),[attempt,setAttempt]=useState(0),[decodedKey,setDecodedKey]=useState(''),[busy,setBusy]=useState(false),[keyboard,setKeyboard]=useState(false),[error,setError]=useState(''),[osReduced,setOSReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),[paused,setPaused]=useState(false),[previous,setPrevious]=useState<{src:string;position:string}|null>(null);
 const motionReduced=reduced||osReduced;
 useEffect(()=>{const mq=matchMedia('(prefers-reduced-motion: reduce)'),change=()=>setOSReduced(mq.matches);mq.addEventListener('change',change);return()=>mq.removeEventListener('change',change);},[]);
 const busyRef=useRef(false),loadEpoch=useRef(0),sceneKey=scene+':'+attempt;
 const state=imageState==='ready'&&decodedKey!==sceneKey?'loading':imageState;
 const photo=PHOTOS.find(p=>p.id===scene)!,host=useRef<HTMLElement>(null),image=useRef<HTMLImageElement>(null),primary=useRef<HTMLButtonElement>(null);
 useEffect(()=>{primary.current?.focus({preventScroll:true});const hidden=()=>host.current?.classList.toggle('is-hidden',document.hidden);document.addEventListener('visibilitychange',hidden);hidden();return()=>{document.removeEventListener('visibilitychange',hidden);};},[]);
 useEffect(()=>{const epoch=++loadEpoch.current,element=image.current;let live=true,settled=false;setImageState('loading');
  const current=()=>live&&epoch===loadEpoch.current&&element===image.current;
  const failed=()=>{if(current()){settled=true;setImageState('failed');}};
  const decoded=async()=>{if(!element||!element.complete||!element.naturalWidth)return;try{await element.decode();if(current()){settled=true;setDecodedKey(sceneKey);setImageState('ready');}}catch{failed();}};
  element?.addEventListener('load',decoded);element?.addEventListener('error',failed);if(element?.complete){if(element.naturalWidth)void decoded();else failed();}
  const timer=setTimeout(()=>{if(current()&&!settled)setImageState('failed');},5000);
  return()=>{live=false;clearTimeout(timer);element?.removeEventListener('load',decoded);element?.removeEventListener('error',failed);};
 },[scene,attempt]);

 const run=async()=>{if(busyRef.current)return;busyRef.current=true;setBusy(true);setError('');try{await enter(scene);}catch(e){setError(e instanceof Error?e.message:'This scene could not open. Try the gallery.');busyRef.current=false;setBusy(false);}};
 return <section ref={host} className={`welcome-threshold photo-${scene} ${instant||keyboard?'keyboard-entry':''}`} role="dialog" aria-modal="true" aria-labelledby="welcome-title" data-image-state={state} data-scene-change={!!previous} onKeyDown={e=>{if(e.key==='Escape'&&!busy){e.preventDefault();close();}if(e.key==='Tab'){const items=[...host.current!.querySelectorAll<HTMLElement>('button:not(:disabled),a[href]')],first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}if(e.key==='Enter'||e.key===' ')setKeyboard(true);}}>
  <div className="welcome-scene" key={scene+attempt}>
   <img className="welcome-placeholder" src={photo.thumb} alt=""/>
   <>{previous&&<img className="welcome-previous" src={previous.src} alt="" style={{objectPosition:previous.position,opacity:state==='ready'?0:1}}/>}</>
   <img ref={image} className="welcome-photograph" src={photo.file} alt={photo.note}/>
   <LivingBackground image={image.current} scene={scene as LivingScene} ready={state==='ready'} paused={paused} reduced={motionReduced}/>
   <div className="welcome-exposure" aria-hidden="true"/>
  </div>
  <div className="welcome-scrim"/>
  <header className="welcome-top"><span>Living art for your desktop</span><button onClick={close} disabled={busy}>{replay?'Back to workspace':'Skip welcome'}<Icon name="arrow" size={16}/></button></header>
  <div className="welcome-copy"><h1 id="welcome-title">Stillwild<span aria-hidden="true">.</span></h1><p>Start with a photograph.<br/>Make it your own world.</p><div className="welcome-actions">{resumeName?<><button className="welcome-primary" ref={primary} onClick={close} disabled={busy}>Resume {resumeName}<Icon name="arrow" size={20}/></button><button onClick={()=>void run()} disabled={busy}>{busy?'Opening scene…':'Create from this scene'}</button></>:<button className="welcome-primary" ref={primary} onClick={()=>void run()} disabled={busy}>{busy?'Opening scene…':'Create wallpaper'}<Icon name="arrow" size={20}/></button>}<button onClick={choose} disabled={busy}>Choose my image</button></div><button className="welcome-explore" onClick={explore} disabled={busy}>Explore the scene collection<Icon name="gallery" size={16}/></button><small>Enter as a guest. No account needed.<br/>Your projects stay in this browser on this device.</small>{error&&<p className="welcome-load" role="alert">{error}</p>}</div>
  <div className="welcome-bottom"><div className="welcome-scenes" role="group" aria-label="Featured scenes">{FEATURED_SCENES.map(id=>{const p=PHOTOS.find(p=>p.id===id)!;return <button key={id} aria-label={`Feature ${p.name}`} aria-pressed={id===scene} onClick={()=>{if(id!==scene){if(state==='ready')setPrevious({src:photo.file,position:getComputedStyle(image.current!).objectPosition});setScene(id);setImageState('loading');}}} disabled={busy}><img src={p.thumb} alt=""/><span>{p.name}</span></button>;})}</div><div className="welcome-credit"><strong>{photo.name}</strong><a href={photo.source} target="_blank" rel="noreferrer">Photograph by {photo.author}</a><div className="welcome-load" role="status">{state==='loading'?'Loading bundled photograph…':state==='failed'?<>Full photograph unavailable. You can continue or choose another scene. <button onClick={()=>setAttempt(v=>v+1)}>Retry image</button></>:'Photograph ready'}</div><div className="welcome-ambient-control"><button aria-label={paused?'Play background':'Pause background'} aria-pressed={paused} disabled={motionReduced||state!=='ready'} onClick={()=>setPaused(v=>!v)}><Icon name={paused?'play':'pause'} size={14}/>{paused?'Play background':'Pause background'}</button>{motionReduced&&<small>Reduced motion · static background</small>}</div></div></div>
 </section>;
}
