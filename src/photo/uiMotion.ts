import {useLayoutEffect,useRef} from 'react';
import type {RefObject} from 'react';

// Presentation only. No state mutation or delayed event callbacks live here.
export const UI_MOTION={press:100,release:150,panel:180,dialog:220,navigation:240,exit:160,reduced:100,ease:'cubic-bezier(0.23, 1, 0.32, 1)',drawerEase:'cubic-bezier(0.32, 0.72, 0, 1)'} as const;
export type MotionKind='navigation'|'back'|'panel'|'dialog'|'drawer';
const running=new Map<HTMLElement,()=>void>(),retiring=new Set<HTMLElement>();
export function motionPolicy(reduced:boolean,keyboard:boolean,kind:MotionKind){return {duration:keyboard?0:reduced?UI_MOTION.reduced:kind==='navigation'||kind==='back'?UI_MOTION.navigation:kind==='dialog'?UI_MOTION.dialog:UI_MOTION.panel,spatial:!reduced&&!keyboard,blur:kind==='back'&&!reduced&&!keyboard};}
function policy(kind:MotionKind){return motionPolicy(matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.uiReduced==='true',document.documentElement.dataset.uiInput==='keyboard',kind);}
export function cancelPresentation(){for(const stop of [...running.values()])stop();for(const el of retiring)el.remove();retiring.clear();}
export function installMotionInput(){
 const pointer=()=>{document.documentElement.dataset.uiInput='pointer';},key=()=>{document.documentElement.dataset.uiInput='keyboard';};
 document.addEventListener('pointerdown',pointer,true);document.addEventListener('keydown',key,true);
 const hidden=()=>{if(document.hidden)cancelPresentation();};document.addEventListener('visibilitychange',hidden);document.addEventListener('fullscreenchange',cancelPresentation);
 return()=>{document.removeEventListener('pointerdown',pointer,true);document.removeEventListener('keydown',key,true);document.removeEventListener('visibilitychange',hidden);document.removeEventListener('fullscreenchange',cancelPresentation);cancelPresentation();};
}
export function animateSurface(el:HTMLElement|null,kind:MotionKind='panel',exit=false,onDone?:()=>void){
 if(!el)return;const interrupted=running.has(el),computed=interrupted?getComputedStyle(el):null,current=computed?{opacity:computed.opacity,transform:computed.transform,filter:computed.filter}:null;running.get(el)?.();const p=policy(kind);
 if(!p.duration||document.hidden||(!exit&&!el.getClientRects().length)){onDone?.();return;}
 const duration=exit?Math.min(p.duration,UI_MOTION.exit):p.duration;
 const transform=kind==='back'?`translate3d(${exit?-42:24}px,0,0) scale(${exit?.98:.985})`:kind==='drawer'?'translate3d(0,18px,0)':kind==='navigation'?'translate3d(14px,0,0)':'translate3d(0,7px,0) scale(.99)';
 const displaced:Keyframe={opacity:exit?0:.3,...(p.spatial?{transform}:{}),...(p.blur?{filter:'blur(5px)'}:{})},settled:Keyframe={opacity:1,...(p.spatial?{transform:'none'}:{}),...(p.blur?{filter:'blur(0px)'}:{})};
 const frames=exit?[current||settled,displaced]:[current||displaced,settled];let animation:Animation|undefined,raf=0,done=false;
 const previous={transition:el.style.transition,opacity:el.style.opacity,transform:el.style.transform,filter:el.style.filter};
 const cleanup=()=>{if(done)return;done=true;clearTimeout(timer);cancelAnimationFrame(raf);animation?.cancel();if(!animation)Object.assign(el.style,previous);if(running.get(el)===cleanup)running.delete(el);onDone?.();};
 const timer=setTimeout(cleanup,duration+80);running.set(el,cleanup);
 if(typeof el.animate==='function'){
  animation=el.animate(frames,{duration,easing:kind==='drawer'?UI_MOTION.drawerEase:UI_MOTION.ease,fill:'none'});animation.onfinish=cleanup;
 }else{
  Object.assign(el.style,frames[0]);raf=requestAnimationFrame(()=>{el.style.transition=`opacity ${duration}ms ${UI_MOTION.ease}${p.spatial?`, transform ${duration}ms ${UI_MOTION.ease}`:''}${p.blur?`, filter ${duration}ms ${UI_MOTION.ease}`:''}`;Object.assign(el.style,frames[1]);});
 }
}
// One outgoing, inert snapshot at most. Incoming state is already live and interactive.
export function retireSurface(el:HTMLElement|null,kind:MotionKind='panel'){
 if(!el||!el.getClientRects().length||!policy(kind).duration||document.hidden||document.fullscreenElement||document.querySelector('.is-wallpaper'))return;
 for(const previous of retiring){running.get(previous)?.();previous.remove();}retiring.clear();
 const box=el.getBoundingClientRect(),copy=el.cloneNode(true) as HTMLElement;
 copy.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));copy.removeAttribute('id');copy.setAttribute('aria-hidden','true');copy.inert=true;copy.classList.add('motion-retiring');
 Object.assign(copy.style,{position:'fixed',inset:'auto',left:box.left+'px',top:box.top+'px',width:box.width+'px',height:box.height+'px',minHeight:'0',margin:'0',zIndex:'95',pointerEvents:'none'});
 const originals=el.querySelectorAll('canvas');copy.querySelectorAll('canvas').forEach((canvas,i)=>{const source=originals[i];if(!source)return;canvas.width=Math.min(640,source.width);canvas.height=Math.round(source.height*canvas.width/source.width);canvas.getContext('2d')?.drawImage(source,0,0,canvas.width,canvas.height);});
 const scope=document.createElement('div');scope.className=el.closest('.photo-studio')?.className||'motion-snapshot-scope';scope.inert=true;scope.setAttribute('aria-hidden','true');scope.style.setProperty('display','contents','important');scope.append(copy);document.body.append(scope);retiring.add(copy);animateSurface(copy,kind,true,()=>{scope.remove();retiring.delete(copy);});
}
type State={ready:boolean;active:boolean;entry:string;gallery:boolean;tab:string;drawer:string|null;advanced:boolean;modal:string|null;guide:boolean;delivered:boolean;wallpaper:boolean;project:string};
export function useStudioMotion(root:RefObject<HTMLDivElement|null>,state:State){
 const previous=useRef<State|null>(null);
 useLayoutEffect(()=>{const old=previous.current;previous.current=state;if(!old||!state.ready||!state.active)return;const node=root.current;if(!node)return;
  if(state.wallpaper){cancelPresentation();return;}
  if(old.entry!==state.entry&&state.entry==='work')animateSurface(node,'back');
  else if(old.gallery!==state.gallery||old.project!==state.project||old.active!==state.active){animateSurface(node.querySelector(state.gallery?'.wallpaper-gallery':'.p-main'),'navigation');node.querySelector<HTMLElement>(state.gallery?'.gallery-header button':'.p-project-name')?.focus({preventScroll:true});}
  if(old.drawer!==state.drawer||old.advanced!==state.advanced)animateSurface(node.querySelector(state.drawer==='library'?'.p-left':'.p-right'),'drawer');
  if(old.tab!==state.tab)animateSurface(node.querySelector('.p-properties-scroll'),'panel');
  if(old.modal!==state.modal&&state.modal)animateSurface(node.querySelector('.p-dialog'),'dialog');
  if(!old.guide&&state.guide)animateSurface(node.querySelector('.journey-guide'),'drawer');
  if(!old.delivered&&state.delivered)animateSurface(node.querySelector('.journey-delivery'),'panel');
  if(old.wallpaper&&!state.wallpaper)animateSurface(node.querySelector('.p-main'),'navigation');
 },[state.ready,state.active,state.entry,state.gallery,state.tab,state.drawer,state.advanced,state.modal,state.guide,state.delivered,state.wallpaper,state.project]);
}
