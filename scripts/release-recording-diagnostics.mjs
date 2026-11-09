// Test-only recorder evidence, including output rejected before download.
export function recordingDiagnostics(){
 const Real=MediaRecorder;
 window.__recordingDiagnostics={events:[],blob:null,toasts:[]};
 window.MediaRecorder=class extends Real{
  constructor(...args){super(...args);const chunks=[];
   this.addEventListener('dataavailable',e=>{if(e.data.size)chunks.push(e.data);});
   for(const name of ['start','pause','resume','stop','error'])this.addEventListener(name,()=>{window.__recordingDiagnostics.events.push({type:name,at:performance.now()});if(name==='stop')window.__recordingDiagnostics.blob=new Blob(chunks,{type:this.mimeType});});
  }
 };
 const observe=()=>new MutationObserver(()=>{const text=document.querySelector('.p-toast')?.textContent;if(text&&window.__recordingDiagnostics.toasts.at(-1)!==text)window.__recordingDiagnostics.toasts.push(text);}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
 if(document.documentElement)observe();else addEventListener('DOMContentLoaded',observe,{once:true});
}
