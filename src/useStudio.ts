import {useCallback,useEffect,useRef,useState} from 'react';
import {loadComposition,MAX_TIME,STORAGE_KEY} from './model';
import type {Composition} from './model';
const equivalent=(a:Composition,b:Composition)=>JSON.stringify({...a,time:0,frozen:false})===JSON.stringify({...b,time:0,frozen:false});
export function useStudio(){
 const initial=useRef<ReturnType<typeof loadComposition>|null>(null);if(!initial.current)initial.current=loadComposition();
 const [composition,setComposition]=useState(initial.current.composition),[revision,setRevision]=useState(0),[saveStatus,setSaveStatus]=useState('Saving on this device…');
 const current=useRef(composition),timeRef=useRef(composition.time),past=useRef<Composition[]>([]),future=useRef<Composition[]>([]),gesture=useRef<Composition|null>(null);
 const snapshot=useCallback(()=>({...current.current,time:Math.min(timeRef.current,MAX_TIME)}),[]);
 const apply=useCallback((s:Composition)=>{current.current=s;timeRef.current=s.time;setComposition(s);},[]);
 const push=useCallback((s:Composition)=>{past.current=[...past.current.slice(-39),structuredClone(s)];future.current=[];setRevision(n=>n+1);},[]);
 const begin=useCallback(()=>{if(!gesture.current)gesture.current=structuredClone(snapshot());},[snapshot]);
 const end=useCallback(()=>{const previous=gesture.current;gesture.current=null;if(previous&&!equivalent(previous,current.current))push(previous);},[push]);
 const preview=useCallback((s:Composition)=>apply({...s,time:timeRef.current}),[apply]);
 const commit=useCallback((s:Composition,preservePause=true)=>{end();const before=snapshot();if(!equivalent(before,s)||(!preservePause&&(before.time!==s.time||before.frozen!==s.frozen)))push(before);apply({...s,frozen:preservePause?before.frozen:s.frozen});},[end,snapshot,push,apply]);
 const undo=useCallback(()=>{end();const s=past.current.pop();if(!s)return;future.current.push(structuredClone(snapshot()));apply(s);setRevision(n=>n+1);},[end,snapshot,apply]);
 const redo=useCallback(()=>{end();const s=future.current.pop();if(!s)return;past.current.push(structuredClone(snapshot()));apply(s);setRevision(n=>n+1);},[end,snapshot,apply]);
 const pause=useCallback(()=>apply({...snapshot(),frozen:!current.current.frozen}),[apply,snapshot]);
 const save=useCallback(()=>{if(initial.current?.preventOverwrite){setSaveStatus('Not saved · export a backup to preserve recovery data');return;}try{localStorage.setItem(STORAGE_KEY,JSON.stringify(snapshot()));setSaveStatus('Saved on this device');}catch{setSaveStatus('Not saved · device storage unavailable');}},[snapshot]);
 useEffect(()=>{setSaveStatus('Saving on this device…');const timer=setTimeout(save,280);return()=>clearTimeout(timer);},[composition,save]);
 useEffect(()=>{const timer=setInterval(save,5000),onHide=()=>{if(document.hidden)save();};window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',onHide);return()=>{clearInterval(timer);window.removeEventListener('pagehide',save);document.removeEventListener('visibilitychange',onHide);};},[save]);
 return {composition,timeRef,snapshot,begin,end,preview,commit,undo,redo,pause,canUndo:past.current.length>0,canRedo:future.current.length>0,revision,saveStatus,notice:initial.current.notice};
}
