import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import ClassicApp from './ClassicApp';
import PhotoStudio from './photo/Studio';
import {animateSurface,cancelPresentation,installMotionInput} from './photo/uiMotion';
const initialClassic=()=>location.hash.includes('art=')||location.hash==='#art'||new URLSearchParams(location.search).get('workspace')==='classic';
export default function App(){
 const [classic,setClassic]=useState(initialClassic),[visitedClassic,setVisitedClassic]=useState(initialClassic),photo=useRef<HTMLDivElement>(null),original=useRef<HTMLDivElement>(null),previous=useRef(classic);
 useEffect(installMotionInput,[]);
 useEffect(()=>{const handler=()=>{if(location.hash.includes('art=')||location.hash==='#art'){setVisitedClassic(true);setClassic(true);}else if(location.hash.includes('studio=')||location.hash==='#studio')setClassic(false);};window.addEventListener('hashchange',handler);return()=>window.removeEventListener('hashchange',handler);},[]);
 useEffect(()=>{document.documentElement.classList.toggle('photo-mode',!classic);return()=>document.documentElement.classList.remove('photo-mode');},[classic]);
 useLayoutEffect(()=>{if(previous.current===classic)return;previous.current=classic;const node=classic?original.current:photo.current;animateSurface(node,'navigation');node?.querySelector<HTMLElement>('button')?.focus({preventScroll:true});},[classic]);
 return <><div className="workspace-route" ref={photo} hidden={classic} inert={classic}><PhotoStudio active={!classic} onClassic={()=>{cancelPresentation();history.replaceState(null,'',location.pathname+'?workspace=classic');setVisitedClassic(true);setClassic(true);}}/></div>{visitedClassic&&<div className="workspace-route" ref={original} hidden={!classic} inert={!classic}><div className="classic-workspace"><button onClick={()=>{history.replaceState(null,'',location.pathname);setClassic(false);}}>← Photo studio</button><span>Classic · your original Paper, Ink, Shadow Garden and Rainprint work</span></div><ClassicApp active={classic}/></div>}</>;
}
