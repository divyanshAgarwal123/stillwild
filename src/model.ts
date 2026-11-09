import { makePreset as legacyPreset, validateComposition as validateLegacy, PALETTES } from './legacy.ts';
export { PALETTES, seeded } from './legacy.ts';
export type Scene = 'garden' | 'rain';
export type Theme = 'paper' | 'natural' | 'ink' | 'future';
export type LightMode = 'daylight' | 'golden' | 'diffuse' | 'moon' | 'studio' | 'neon';
export type ObjectKind = 'fern' | 'olive' | 'eucalyptus' | 'grass' | 'arch' | 'circle' | 'cloud';
export type ArtObject = { id:string; kind:ObjectKind; x:number; y:number; scale:number; rotation:number; seed:number };
export type Light = {mode:LightMode; x:number; y:number; intensity:number; exposure:number; warmth:number; softness:number; beam:number};
export type Effects = {haze:number; particles:number; grain:number; bloom:number; speed:number; storm:boolean; backplate:boolean};
export type Composition = {version:2;scene:Scene;theme:Theme;preset:number;palette:number;seed:number;wind:number;light:Light;effects:Effects;objects:ArtObject[];time:number;frozen:boolean;rainAmount:number;ink:number};
export const STORAGE_KEY='stillwild.composition.v2';
export const LEGACY_KEY='stillwild.composition.v1';
export const MAX_OBJECTS=18,MAX_FAVORITES=24,IMPORT_LIMIT=131072,MAX_TIME=1e9;
export const THEMES:{id:Theme;name:string;subtitle:string;description:string}[]=[
 {id:'paper',name:'Paper',subtitle:'THE ORIGINAL',description:'Botanical shadows, warm grain, and cut paper.'},
 {id:'natural',name:'Natural',subtitle:'INTO THE ELEMENTS',description:'Filtered light, shaded leaves, and rain-soaked air.'},
 {id:'ink',name:'Ink',subtitle:'GESTURE & GRAIN',description:'Charcoal washes and expressive marks on cotton paper.'},
 {id:'future',name:'Future',subtitle:'AFTER THE LIGHT',description:'Luminous sculpture, aurora, and reflected colour.'},
];
export const LIGHT_MODES:{id:LightMode;name:string}[]=[{id:'daylight',name:'Daylight'},{id:'golden',name:'Golden hour'},{id:'diffuse',name:'Overcast'},{id:'moon',name:'Moonlight'},{id:'studio',name:'Studio beam'},{id:'neon',name:'Neon'}];
const COLLECTION:Record<Theme,Record<Scene,{name:string;description:string}[]>>={
 paper:{garden:[{name:'Golden hour',description:'Warmth on a quiet wall'},{name:'Forest hush',description:'A softer shade of green'},{name:'Afterglow',description:'The last light, held'}],rain:[{name:'Colourfield',description:'Blue rain and ochre washes'},{name:'Rainwashed',description:'Soft green on cotton'},{name:'Rosewater',description:'A passing blush of rain'}]},
 natural:{garden:[{name:'First light',description:'A sunlit woodland clearing'},{name:'Fern sanctuary',description:'Deep shade and forest air'},{name:'Blue hour',description:'The garden after sundown'}],rain:[{name:'Petrichor',description:'Rain returning to the earth'},{name:'Cloud forest',description:'A landscape lost in mist'},{name:'Nightfall',description:'Moonlight on wet leaves'}]},
 ink:{garden:[{name:'Quiet gesture',description:'Charcoal, space, and one mark'},{name:'Botanical study',description:'Fine lines on cold-pressed paper'},{name:'Indigo silence',description:'A wash of blue-black ink'}],rain:[{name:'Rain study No. 1',description:'Ink finding its own edges'},{name:'Grey weather',description:'Diluted marks and soft rain'},{name:'Midnight wash',description:'Indigo on a pale ground'}]},
 future:{garden:[{name:'Noctiluca',description:'Sculptural light in a dark world'},{name:'Aurora chamber',description:'Violet ribbons and glass'},{name:'Solar echo',description:'Amber light after midnight'}],rain:[{name:'Neon weather',description:'Electric rain, liquid reflections'},{name:'Eventide',description:'An atmosphere of blue and violet'},{name:'Amber signal',description:'Warm rain on obsidian'}]},
};
export const getPresets=(theme:Theme,scene:Scene)=>COLLECTION[theme][scene];
export const PRESETS=COLLECTION.paper.garden;
export const OBJECT_NAMES:Record<ObjectKind,string>={fern:'Fern',olive:'Olive branch',eucalyptus:'Eucalyptus',grass:'Wild grass',arch:'Paper arch',circle:'Paper circle',cloud:'Rain source'};
export const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const number=(v:unknown,min:number,max:number)=>finite(v)?clamp(v,min,max):null;
const modes=LIGHT_MODES.map(v=>v.id),themes=THEMES.map(v=>v.id),kinds=Object.keys(OBJECT_NAMES);
export function makePreset(scene:Scene='garden',preset=0,theme:Theme='paper'):Composition {
 const legacy=legacyPreset(scene,preset);
 const natural=theme==='natural',future=theme==='future',ink=theme==='ink';
 const mode:LightMode=future?'neon':ink?'diffuse':preset===2?(natural?'moon':'golden'):preset===1?'diffuse':'golden';
 const s:Composition={...legacy,version:2,theme,seed:410+37*preset,light:{...legacy.light,mode,exposure:0,warmth:future?18:preset===2?24:64,softness:ink?74:natural?64:44,beam:future?48:ink?12:34},effects:{haze:natural?35:future?20:ink?8:0,particles:natural?18:future?44:ink?4:0,grain:ink?66:future?12:natural?16:65,bloom:future?54:natural?22:ink?2:0,speed:natural?42:future?35:50,storm:false,backplate:natural||future},wind:future?16:natural?28:ink?14:legacy.wind};
 if(natural&&scene==='garden')s.objects=s.objects.filter(o=>o.kind!=='arch').map((o,i)=>({...o,scale:Math.max(.3,o.scale*.47),x:i%2?.94:.08,y:1.14}));
 if(future&&scene==='garden')s.objects=[{id:'sculpture-orb',kind:'circle',x:.78,y:.76,scale:.44,rotation:0,seed:140}];
 if(natural){s.palette=preset===2?3:preset;s.rainAmount=58;s.ink=45;s.light.intensity=preset===2?48:68;}
 if(ink){s.palette=preset===2?3:0;s.ink=60;s.light.intensity=42;s.rainAmount=38;s.objects=s.objects.filter(o=>o.kind!=='grass');}
 if(future){s.palette=preset;s.rainAmount=64;s.ink=60;s.light.intensity=66;s.light.x=.69;s.light.y=.28;}
 if(scene==='garden'&&theme!=='paper'){
  s.objects=s.objects.map(o=>o.kind==='arch'?{...o,x:future?.69:ink?.62:.72,y:future?.82:.91,scale:future?.75:ink?.68:.57}:o);
  if(future)s.objects=s.objects.filter(o=>o.kind==='arch'||o.kind==='fern'||o.kind==='grass').map(o=>({...o,scale:o.kind==='arch'?o.scale:o.scale*.8}));
 }
 return s;
}
export function migrateLegacy(value:unknown):Composition|null {
 const old=validateLegacy(value);if(!old)return null;
 const base=makePreset(old.scene,old.preset,'paper');
 return {...base,...old,version:2,theme:'paper',light:{...base.light,...old.light,mode:'golden',beam:34,warmth:64},effects:{haze:0,particles:0,grain:65,bloom:0,speed:50,storm:false,backplate:false}};
}
export function validateComposition(value:unknown):Composition|null {
 if(!record(value))return null;if(value.version===1)return migrateLegacy(value);if(value.version!==2)return null;
 if(!['garden','rain'].includes(String(value.scene))||!themes.includes(value.theme as Theme)||!Number.isInteger(value.preset)||!finite(value.preset)||value.preset<0||value.preset>2||!Number.isInteger(value.palette)||!finite(value.palette)||value.palette<0||value.palette>3||typeof value.frozen!=='boolean')return null;
 if(!Number.isInteger(value.seed)||!finite(value.seed)||value.seed<0||value.seed>100000)return null;
 if(!record(value.light)||!modes.includes(value.light.mode as LightMode)||!record(value.effects)||typeof value.effects.storm!=='boolean'||typeof value.effects.backplate!=='boolean')return null;
 const l=value.light,e=value.effects;
 const numeric={wind:number(value.wind,0,100),time:number(value.time,0,MAX_TIME),rainAmount:number(value.rainAmount,0,100),ink:number(value.ink,0,100),x:number(l.x,0,1),y:number(l.y,0,1),intensity:number(l.intensity,0,100),exposure:number(l.exposure,-100,100),warmth:number(l.warmth,0,100),softness:number(l.softness,0,100),beam:number(l.beam,0,100),haze:number(e.haze,0,100),particles:number(e.particles,0,100),grain:number(e.grain,0,100),bloom:number(e.bloom,0,100),speed:number(e.speed,0,100)};
 if(Object.values(numeric).some(n=>n===null))return null;
 if(!Array.isArray(value.objects)||value.objects.length>MAX_OBJECTS)return null;
 const ids=new Set<string>(),objects:ArtObject[]=[];
 for(const o of value.objects){
  if(!record(o)||typeof o.id!=='string'||!/^[-a-zA-Z0-9_]{1,40}$/.test(o.id)||ids.has(o.id)||!kinds.includes(String(o.kind))||!Number.isInteger(o.seed)||!finite(o.seed)||o.seed<0||o.seed>100000)return null;
  const x=number(o.x,-.25,1.25),y=number(o.y,-.25,1.25),scale=number(o.scale,.3,1.7),rotation=number(o.rotation,-180,180);if(x===null||y===null||scale===null||rotation===null)return null;
  ids.add(o.id);objects.push({id:o.id,kind:o.kind as ObjectKind,x,y,scale,rotation,seed:o.seed});
 }
 const n=numeric as Record<keyof typeof numeric,number>;
 return {version:2,scene:value.scene as Scene,theme:value.theme as Theme,preset:value.preset,palette:value.palette,seed:value.seed,wind:n.wind,time:n.time,rainAmount:n.rainAmount,ink:n.ink,frozen:value.frozen,light:{mode:l.mode as LightMode,x:n.x,y:n.y,intensity:n.intensity,exposure:n.exposure,warmth:n.warmth,softness:n.softness,beam:n.beam},effects:{haze:n.haze,particles:n.particles,grain:n.grain,bloom:n.bloom,speed:n.speed,storm:e.storm as boolean,backplate:e.backplate as boolean},objects};
}
export function encodeComposition(s:Composition):string {
 const bytes=new TextEncoder().encode(JSON.stringify(s));let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
 return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
export function decodeComposition(hash:string):Composition|null {
 try{const raw=new URLSearchParams(hash.replace(/^#/, '')).get('art');if(!raw||raw.length>16000)return null;
 const bytes=Uint8Array.from(atob(raw.replace(/ /g,'+').replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
 const state=validateComposition(JSON.parse(new TextDecoder().decode(bytes)));return state?{...state,frozen:true}:null;
 }catch{return null;}
}
export function loadComposition():{composition:Composition;notice?:string;preventOverwrite?:boolean}{
 const shared=decodeComposition(location.hash);if(shared)return {composition:shared,notice:'Shared moment restored. Sound stays off.'};
 let problem=false,preventOverwrite=false;
 for(const key of [STORAGE_KEY,LEGACY_KEY]){
  let raw:string|null=null;
  try{raw=localStorage.getItem(key);if(!raw)continue;const s=validateComposition(JSON.parse(raw));
   if(s)return {composition:s,preventOverwrite,notice:key===LEGACY_KEY?'Your original composition is here, now with more room to create.':undefined};
  }catch{problem=true;}
  if(raw){problem=true;try{localStorage.setItem(`stillwild.recovery.${key}`,raw);}catch{preventOverwrite=true;}}
 }
 return {composition:makePreset('garden',0,'natural'),preventOverwrite,notice:location.hash.includes('art=')?'This link could not be restored. Your local work is still safe.':problem?'Saved data could not be read. A fresh studio is ready.':undefined};
}

export function parseBackup(text:string):Composition {
 if(new TextEncoder().encode(text).length>IMPORT_LIMIT)throw new Error('Choose a composition JSON file smaller than 128 KB.');
 let value:unknown;try{value=JSON.parse(text.replace(/^\uFEFF/,''));}catch{throw new Error('This file is not valid JSON. Your artwork has not changed.');}
 if(record(value)&&value.format==='stillwild-composition')value=value.composition;
 const s=validateComposition(value);if(!s)throw new Error('This composition has unsupported or invalid values. Your artwork has not changed.');return s;
}
export type Favorite={id:string;name:string;savedAt:string;composition:Composition};
export const LIBRARY_KEY='stillwild.library.v2';
export function readLibrary():Favorite[]{
 const raw=localStorage.getItem(LIBRARY_KEY);if(!raw)return [];if(raw.length>2e6)throw new Error('The saved collection is too large to read.');
 const value:unknown=JSON.parse(raw);if(!Array.isArray(value)||value.length>MAX_FAVORITES)throw new Error('The saved collection could not be read.');
 return value.map(item=>{if(!record(item)||typeof item.id!=='string'||typeof item.name!=='string'||item.name.length>64||typeof item.savedAt!=='string')throw new Error('A saved composition is invalid.');const composition=validateComposition(item.composition);if(!composition)throw new Error('A saved composition is invalid.');return {id:item.id,name:item.name,savedAt:item.savedAt,composition};});
}
export function newObject(kind:ObjectKind,current:Composition):ArtObject{
 const seed=(current.seed+current.objects.reduce((n,o)=>n+o.seed,0)+71)%100000;
 return {id:`element-${crypto.randomUUID().slice(0,12)}`,kind,x:kind==='cloud'?.5:kind==='arch'||kind==='circle'?.55:.35,y:kind==='cloud'?.24:kind==='arch'||kind==='circle'?.83:1.06,scale:kind==='arch'||kind==='circle'?.7:kind==='cloud'?1:.85,rotation:0,seed};
}

export function getPaletteOptions(theme:Theme):{name:string;swatches:string[]}[]{
 if(theme==='paper')return PALETTES.map(p=>({name:p.name,swatches:p.swatches}));
 const entries:Record<Exclude<Theme,'paper'>,{name:string;swatches:string[]}[]>={
  natural:[{name:'Original',swatches:['#bdc5ad','#687e53','#c2aa79','#304b3d']},{name:'Verdant',swatches:['#bdcbb0','#7c9e6b','#426c43','#243f32']},{name:'Amber',swatches:['#e0cf9c','#b29a5b','#77653e','#3c4931']},{name:'Blue hour',swatches:['#b3c5c7','#7598a5','#415f79','#1b3349']}],
  ink:[{name:'Graphite',swatches:['#eceae2','#bdc0b6','#747b72','#292e2c']},{name:'Umber',swatches:['#eee5d8','#c9b598','#9b795d','#634635']},{name:'Green-black',swatches:['#e5e9df','#adbaa5','#657d61','#284437']},{name:'Indigo',swatches:['#e2e8ec','#acbfd0','#6486a2','#203b5b']}],
  future:[{name:'Teal',swatches:['#0a222a','#2d6e70','#72b4ae','#c4a376']},{name:'Ultraviolet',swatches:['#171c33','#584b7c','#9a80be','#bcb6ce']},{name:'Amber',swatches:['#242522','#66543c','#b38b4f','#e0c69b']},{name:'Glacier',swatches:['#102133','#3a5d84','#79a9ca','#cfdee4']}],
 };return entries[theme];
}
