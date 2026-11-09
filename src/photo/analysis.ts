import {useEffect,useState} from 'react';
import {imageFor} from './storage';
import {VideoFrames} from './media';
import type {Layer,Project} from './model';
import {cropWindow} from './scene';
import {analysePixels} from './sceneAnalysis';
import type {SceneAnalysis} from './sceneAnalysis';
export type {SceneAnalysis} from './sceneAnalysis';
const cache=new Map<string,SceneAnalysis>();
export function analysisKey(l:Layer){return JSON.stringify([l.asset,l.cropX,l.cropY,l.cropZoom,l.w/l.h,l.clip?.in,l.clip?.out]);}
export async function analyseLayer(l:Layer,p:Project,signal:AbortSignal){const key=analysisKey(l),cached=cache.get(key);if(cached)return cached;let media:VideoFrames|undefined;try{let image:ImageBitmap|HTMLCanvasElement;if(l.kind==='image')image=await imageFor(l.asset,signal);else{media=new VideoFrames();await media.prepare({...p,layers:[l]},0,true,signal);image=media.frames.get(l.id)!;if(!image)throw Error('The video frame could not be analysed.');}signal.throwIfAborted();const sourceAspect=image.width/image.height,crop=cropWindow(l,sourceAspect),c=document.createElement('canvas');c.width=192;c.height=108;const ctx=c.getContext('2d',{willReadFrequently:true})!;ctx.drawImage(image,crop.x*image.width,crop.y*image.height,crop.w*image.width,crop.h*image.height,0,0,192,108);const result=analysePixels(ctx.getImageData(0,0,192,108).data,192,108,l.asset,key);result.crop=crop;result.sourceAspect=sourceAspect;signal.throwIfAborted();if(cache.size>=8)cache.delete(cache.keys().next().value!);cache.set(key,result);return result;}finally{media?.dispose();}}
export function useSceneAnalysis(l:Layer|null,p:Project){const [state,setState]=useState<{analysis:SceneAnalysis|null;error:string;loading:boolean}>({analysis:null,error:'',loading:false}),key=l&&['image','video'].includes(l.kind)?analysisKey(l):'';useEffect(()=>{const controller=new AbortController();setState({analysis:null,error:'',loading:!!key});if(l&&key)void analyseLayer(structuredClone(l),p,controller.signal).then(analysis=>{if(!controller.signal.aborted)setState({analysis,error:'',loading:false});}).catch(e=>{if(!controller.signal.aborted)setState({analysis:null,error:e instanceof Error?e.message:'Analysis unavailable.',loading:false});});return()=>controller.abort();},[key,p.id]);return state.analysis&&state.analysis.key!==key?{analysis:null,error:'',loading:!!key}:state;}

// Inspector guidance only. Debounced, cancellable and sampled after the actual
// grading backend; it never disables Apply based on a source-image estimate.
export function useGradedBrightness(l:Layer|null,enabled:boolean){
 const [result,setResult]=useState<{key:string;brightness:Uint8Array|null}>({key:'',brightness:null});
 const key=enabled&&l?JSON.stringify([l.asset,l.kind,l.grade,l.selectiveColour,l.cropX,l.cropY,l.cropZoom,l.w,l.h,l.strokes,l.clip]):'';
 useEffect(()=>{const controller=new AbortController();let renderer:import('./render').PhotoRenderer|undefined,media:VideoFrames|undefined;
  const timer=setTimeout(()=>{if(!l||!key)return;void(async()=>{
   try{const {PhotoRenderer}=await import('./render');controller.signal.throwIfAborted();renderer=new PhotoRenderer();
    let frame:HTMLCanvasElement|undefined;if(l.kind==='image')await imageFor(l.asset,controller.signal);else {media=new VideoFrames();const {makeWallpaper}=await import('./model');const p=makeWallpaper('forest-falcade');p.layers=[l];await media.prepare(p,0,true,controller.signal);frame=media.frames.get(l.id);}
    controller.signal.throwIfAborted();const data=renderer.highlightPixels(l,frame);if(data){const brightness=new Uint8Array(96*54);for(let i=0;i<brightness.length;i++)brightness[i]=Math.max(data[i*4],data[i*4+1],data[i*4+2]);setResult({key,brightness});}
   }catch{if(!controller.signal.aborted)setResult({key,brightness:null});}finally{renderer?.dispose();media?.dispose();}
  })();},100);
  return()=>{clearTimeout(timer);controller.abort();renderer?.dispose();media?.dispose();};
 },[key]);return result.key===key?result.brightness:null;
}
