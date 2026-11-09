import {makeWallpaper,NEUTRAL} from './model.ts';
import type {Project} from './model.ts';
export const WELCOME_KEY='stillwild.welcome.v1';
export const FEATURED_SCENES=['forest-falcade','dunes-light','tokyo-asakusa'] as const;
export function directWorkspace(url:{hash:string;search:string}){const q=new URLSearchParams(url.search);return /^#(?:studio|art)(?:=|$)/.test(url.hash)||q.get('workspace')==='classic'||q.get('view')==='studio';}
export function welcomeSeen(storage?:Pick<Storage,'getItem'>){try{return (storage??window.localStorage).getItem(WELCOME_KEY)==='1';}catch{return false;}}
export function rememberWelcome(storage?:Pick<Storage,'setItem'>){try{(storage??window.localStorage).setItem(WELCOME_KEY,'1');return true;}catch{return false;}}
function appearanceValue(value:unknown):unknown{if(Array.isArray(value))return value.map(appearanceValue);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([k])=>!['id','name','paused','seed'].includes(k)).map(([k,v])=>[k,appearanceValue(v)]));return value;}
export function projectAppearance(project:Project){const {time:_time,...rest}=project;return JSON.stringify(appearanceValue(rest));}
export function hasAppearanceEdits(project:Project){const source=project.layers.find(l=>l.kind==='image');if(!source)return project.layers.length>0;try{return projectAppearance(project)!==projectAppearance(makeWallpaper(source.asset));}catch{return project.layers.length>1||source.cropZoom!==1||source.cropX!==.5||source.cropY!==.5||source.rotation!==0||source.flipX||source.flipY||source.opacity!==100||JSON.stringify(source.grade)!==JSON.stringify(NEUTRAL)||!!source.selectiveColour?.enabled||!!source.automation?.enabled||!!source.scene?.regions.some(r=>r.enabled)||source.strokes.length>0||source.pins.length>0||!!project.sound?.layers.length;}}
export type Delivery={projectId:string;appearance:string;kind:'PNG'|'video';name:string;frame?:number};
export function deliveredCurrent(project:Project,delivery:Delivery|null,frame=project.time){return !!delivery&&delivery.projectId===project.id&&delivery.appearance===projectAppearance(project)&&(delivery.kind!=='PNG'||delivery.frame!==undefined&&Math.abs(delivery.frame-frame)<.000001);}
// Produce first, hand off only complete bytes, acknowledge only after the handoff succeeds.
export async function deliverArtwork(produce:()=>Promise<Blob>,handoff:(blob:Blob)=>void,signal?:AbortSignal){const blob=await produce();signal?.throwIfAborted();if(!blob.size)throw Error('The export is empty. Please try again.');handoff(blob);}

export async function openFeaturedScene(open:()=>Promise<void>,leave:()=>void){await open();leave();}
