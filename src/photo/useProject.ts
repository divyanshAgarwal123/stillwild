import {useCallback,useEffect,useRef,useState} from 'react';
import {decodeProject,makeProject,validateProject} from './model';
import type {Project} from './model';
import {readCurrent,saveProject} from './storage';
import type {ImageAsset} from './storage';
// Bounded snapshots contain vectors/references only; image bytes never enter history.
export default function useProject(){
 const [project,setProject]=useState<Project>(()=>makeProject()),[ready,setReady]=useState(false),[status,setStatus]=useState('Opening local project…'),[revision,setRevision]=useState(0),[notice,setNotice]=useState(''),[restored,setRestored]=useState(false),[restoreAttempt,setRestoreAttempt]=useState(0);
 const activated=useRef(false);
 const editToken=useRef(0),importActive=useRef(false),saveTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const current=useRef(project),time=useRef(0),past=useRef<Project[]>([]),future=useRef<Project[]>([]),group=useRef<Project|null>(null),saveChain=useRef(Promise.resolve()),safe=useRef(true);
 const snapshot=useCallback(()=>({...current.current,time:time.current}),[]);
 const apply=useCallback((p:Project)=>{editToken.current++;current.current=p;time.current=p.time;setProject(p);setRevision(v=>v+1);},[]);
 useEffect(()=>{let live=true,timer:ReturnType<typeof setTimeout>;setReady(false);setStatus('Opening local project…');(async()=>{let p:Project|null=null;try{const shared=decodeProject(location.hash);p=shared||await Promise.race([readCurrent(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error('Local restore took too long. Your stored work has not been replaced.')),4500);})]);if(live){safe.current=true;if(p){activated.current=true;apply(p);setRestored(!shared);}setStatus(p?'Local project opened':'Choose an image to begin');setNotice('');}}catch(e){safe.current=false;if(live){setNotice(e instanceof Error?e.message:'Could not open local project.');setStatus('Session only · storage recovery');}}finally{clearTimeout(timer!);if(live)setReady(true);}})();return()=>{live=false;clearTimeout(timer!);};},[apply,restoreAttempt]);
 const begin=useCallback(()=>{if(!group.current)group.current=snapshot();},[snapshot]);
 const end=useCallback(()=>{if(!group.current)return;const before=group.current;group.current=null;if(JSON.stringify({...before,time:0})!==JSON.stringify({...current.current,time:0})){past.current=[...past.current.slice(-29),before];future.current=[];setRevision(v=>v+1);}},[]);
 const preview=useCallback((p:Project)=>{activated.current=true;editToken.current++;current.current=p;setProject(p);},[]);
 const commit=useCallback((p:Project)=>{activated.current=true;end();past.current=[...past.current.slice(-29),snapshot()];future.current=[];apply(validateProject(p));},[apply,end,snapshot]);
 const undo=useCallback(()=>{end();const p=past.current.pop();if(!p)return;future.current.push(snapshot());apply(p);},[apply,end,snapshot]);
 const redo=useCallback(()=>{end();const p=future.current.pop();if(!p)return;past.current.push(snapshot());apply(p);},[apply,end,snapshot]);
 const pause=useCallback(()=>{apply({...snapshot(),paused:!current.current.paused});},[apply,snapshot]);
 const scrub=useCallback((t:number)=>{editToken.current++;time.current=t;current.current={...current.current,time:t,paused:true};setProject(current.current);},[]);
 useEffect(()=>{if(!ready||!activated.current||!safe.current||importActive.current)return;setStatus('Saving…');let live=true;const timer=setTimeout(()=>{if(importActive.current)return;const p=snapshot();saveChain.current=saveChain.current.catch(()=>{}).then(async()=>{if(importActive.current)return;try{await saveProject(p);if(live)setStatus('Saved on this device');}catch(e){if(live)setStatus(e instanceof Error?e.message:'Not saved');}});},500);saveTimer.current=timer;return()=>{live=false;clearTimeout(timer);};},[project,ready,revision,snapshot]);
 useEffect(()=>{if(!ready)return;const timer=setInterval(()=>{if(importActive.current||!activated.current||!safe.current||current.current.paused||document.hidden)return;saveChain.current=saveChain.current.catch(()=>{}).then(()=>saveProject(snapshot())).catch(()=>setStatus('Not saved · export a portable file'));},7000);return()=>clearInterval(timer);},[ready,snapshot]);
 const startImport=()=>{importActive.current=true;if(saveTimer.current)clearTimeout(saveTimer.current);return editToken.current;};
 const finishImport=()=>{importActive.current=false;setRevision(v=>v+1);};
 const replaceImported=async(p:Project,assets:ImageAsset[],expected:number,signal:AbortSignal)=>{await saveChain.current.catch(()=>{});signal.throwIfAborted();if(editToken.current!==expected)throw Error('Import cancelled: the project changed while the file was loading. Your edits are intact.');await saveProject(p,assets,false,signal,()=>editToken.current===expected);signal.throwIfAborted();if(editToken.current!==expected)throw Error('Import cancelled: newer edits were kept.');commit(p);safe.current=true;};
 return {restored,recovery:!safe.current,retryRestore:()=>{if(!activated.current)setRestoreAttempt(v=>v+1);},startImport,finishImport,replaceImported,project,ready,time,snapshot,begin,end,preview,commit,undo,redo,pause,scrub,canUndo:past.current.length>0,canRedo:future.current.length>0,status,notice,revision,allowSave:()=>{activated.current=true;setRevision(v=>v+1);}};
}
