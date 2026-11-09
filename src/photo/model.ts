import {validateAutomation} from './automation.ts';
import type {LookAutomation} from './automation.ts';
import {validateSound} from './soundModel.ts';
import type {ProjectSound} from './soundModel.ts';
import {validateScene} from './scene.ts';
import type {SceneContext} from './scene.ts';
import {validateSelectiveColour} from './selectiveColour.ts';
import type {SelectiveColour} from './selectiveColour.ts';
// v3 is independent of Classic. Never rewrites v1/v2 keys or recovery data.
export const LIMITS={layers:12,strokes:48,points:160,pins:16,projects:16,imageBytes:16*1024*1024,portableBytes:144*1024*1024,pixels:40_000_000,storedEdge:4096,assets:10,videoLayers:3,videoBytes:32*1024*1024,videoDuration:30,videoPixels:4096*2160};
export type Direction='nature'|'urban'|'editorial';
export type Blend='normal'|'multiply'|'screen'|'overlay';
export type Tool='move'|'mask'|'restore'|'motion'|'freeze'|'pin';
export type Point={x:number;y:number};
export type Stroke={id:string;mode:'erase'|'restore'|'motion'|'freeze';radius:number;softness:number;angle:number;points:Point[]};
export type Pin=Point&{id:string;angle:number;strength:number;radius:number};
export type Grade={exposure:number;contrast:number;highlights:number;shadows:number;whites:number;blacks:number;saturation:number;vibrance:number;temperature:number;tint:number;hue:number;blur:number;sharpness:number;vignette:number;grain:number};
export const NEUTRAL:Grade={exposure:0,contrast:0,highlights:0,shadows:0,whites:0,blacks:0,saturation:0,vibrance:0,temperature:0,tint:0,hue:0,blur:0,sharpness:0,vignette:0,grain:0};
export type Layer={id:string;kind:'image'|'video'|'text'|'shape'|'gradient';name:string;visible:boolean;locked:boolean;opacity:number;blend:Blend;x:number;y:number;w:number;h:number;rotation:number;flipX:boolean;flipY:boolean;depth:number;asset:string;cropX:number;cropY:number;cropZoom:number;grade:Grade;selectiveColour?:SelectiveColour;scene?:SceneContext;automation?:LookAutomation;strokes:Stroke[];pins:Pin[];motion:{strength:number;cycles:number;angle:number;radius:number};text:string;font:'sans-serif'|'serif'|'monospace';fontSize:number;weight:number;align:'left'|'center'|'right';fill:string;fill2:string;shape:'rectangle'|'ellipse';clip?:{in:number;out:number;speed:number;blend:number;timing?:'manual'|'fit';fps?:number;smooth?:boolean;provider?:'wan'|'google'|'kling'|'custom';sourceLayerId?:string}};
export type Weather={enabled:boolean;amount:number;angle:number;cycles:number;scale:number;color:string;placement?:'sky'|'valley'|'full';height?:number;falloff?:number};
export type Project={version:3;id:string;name:string;direction:Direction;layers:Layer[];duration:number;time:number;paused:boolean;background:string;camera:{amount:number;zoom:number};weather:{rain:Weather;fog:Weather;dust:Weather;rays:Weather};seed:number;sound?:ProjectSound};
export const PHOTOS=[
 {id:'forest-falcade',category:'Nature',thumb:'/photos/thumbs/forest-falcade.jpg',name:'Alpine quiet',direction:'nature' as Direction,file:'/photos/forest-falcade.jpg',author:'Luca Bravo',width:4096,height:2726,source:'https://unsplash.com/photos/misty-forest-covering-a-mountain-slope-5Rdwb97xdWQ',note:'Misty forest · Falcade, Italy'},
 {id:'tokyo-asakusa',category:'Cities',thumb:'/photos/thumbs/tokyo-asakusa.jpg',name:'After the rain',direction:'urban' as Direction,file:'/photos/tokyo-asakusa.jpg',author:'Valentin BEAUVAIS',width:4096,height:6141,source:'https://unsplash.com/photos/wet-street-at-night-in-tokyo-yVUQlyRlJSw',note:'Night street · Asakusa, Tokyo'},
 {id:'coast-monochrome',category:'Coast',thumb:'/photos/thumbs/coast-monochrome.jpg',name:'Tidal studies',direction:'editorial' as Direction,file:'/photos/coast-monochrome.jpg',author:'Annie Spratt',width:4096,height:2732,source:'https://unsplash.com/photos/a-black-and-white-photo-of-waves-in-the-ocean-yN1lXxg5oKk',note:'Monochrome coast · wave studies'},
 {"id": "braies-lake", "name": "Quiet reflections", "direction": "nature" as Direction, "category": "Nature", "author": "Luca Bravo", "source": "https://unsplash.com/photos/banff-national-park-canada-oV4bR3YoR_s", "file": "/photos/braies-lake.jpg", "thumb": "/photos/thumbs/braies-lake.jpg", "width": 3840, "height": 2560, "note": "Quiet reflections"},
 {"id": "sorapiss", "name": "Above the pines", "direction": "nature" as Direction, "category": "Nature", "author": "Luca Bravo", "source": "https://unsplash.com/photos/worms-eye-view-of-mountain-during-daytime-ii5JY_46xH0", "file": "/photos/sorapiss.jpg", "thumb": "/photos/thumbs/sorapiss.jpg", "width": 3840, "height": 2560, "note": "Above the pines"},
 {"id": "forest-water", "name": "Woodland water", "direction": "nature" as Direction, "category": "Nature", "author": "Luca Bravo", "source": "https://unsplash.com/photos/body-of-water-surrounded-by-pine-trees-during-daytime-ESkw2ayO2As", "file": "/photos/forest-water.jpg", "thumb": "/photos/thumbs/forest-water.jpg", "width": 3840, "height": 2650, "note": "Woodland water"},
 {"id": "venice", "name": "Venice at dusk", "direction": "urban" as Direction, "category": "Cities", "author": "Luca Bravo", "source": "https://unsplash.com/photos/grand-canal-venice-italy-UKJev6G45f0", "file": "/photos/venice.jpg", "thumb": "/photos/thumbs/venice.jpg", "width": 3217, "height": 4825, "note": "Venice at dusk"},
 {"id": "dunes-light", "name": "Dune light", "direction": "editorial" as Direction, "category": "Minimal", "author": "Zetong Li", "source": "https://unsplash.com/photos/the-sun-is-shining-over-the-sand-dunes-9G8K_nycv7s", "file": "/photos/dunes-light.jpg", "thumb": "/photos/thumbs/dunes-light.jpg", "width": 3840, "height": 2560, "note": "Dune light"},
 {"id": "sand-rhythm", "name": "Sand rhythm", "direction": "editorial" as Direction, "category": "Minimal", "author": "Matt Artz", "source": "https://unsplash.com/photos/grayscale-photography-of-sand-vpDWWugLoIE", "file": "/photos/sand-rhythm.jpg", "thumb": "/photos/thumbs/sand-rhythm.jpg", "width": 2403, "height": 1920, "note": "Sand rhythm"},
 {"id": "nebula", "name": "Stellar nursery", "direction": "editorial" as Direction, "category": "Space", "author": "NASA", "source": "https://unsplash.com/photos/nebula-rTZW4f02zY8", "file": "/photos/nebula.jpg", "thumb": "/photos/thumbs/nebula.jpg", "width": 3840, "height": 3647, "note": "Stellar nursery"},
 {"id": "pacific-edge", "name": "Pacific edge", "direction": "editorial" as Direction, "category": "Coast", "author": "Paul Hanaoka", "source": "https://unsplash.com/photos/aerial-photography-of-seashore-DKnXlH_r3x4", "file": "/photos/pacific-edge.jpg", "thumb": "/photos/thumbs/pacific-edge.jpg", "width": 3741, "height": 2804, "note": "Pacific edge"},
 {"id": "galactic-dust", "name": "Galactic dust", "direction": "editorial" as Direction, "category": "Space", "author": "NASA, ESA and the LEGUS team / NASA Hubble Space Telescope", "source": "https://unsplash.com/photos/a-very-large-spiral-galaxy-with-a-bright-center-gtw2ufYvhnQ", "file": "/photos/galactic-dust.jpg", "thumb": "/photos/thumbs/galactic-dust.jpg", "width": 3799, "height": 4123, "note": "NGC 3368 \u00b7 telescope photography"}
];
export const uid=()=>crypto.randomUUID();
export const clamp=(v:number,a:number,b:number)=>Math.min(b,Math.max(a,v));
// Live edits and persisted projects must use the same whole-number loop count.
export const normalizeCycleCount=(value:unknown)=>Math.round(num(value,1,4));
export function layer(kind:Layer['kind'],asset='forest-falcade'):Layer{return {id:uid(),kind,name:kind==='video'?'Video clip':kind==='image'?'Photograph':kind==='text'?'Type layer':kind==='gradient'?'Gradient':'Shape',visible:true,locked:false,opacity:100,blend:'normal',x:.5,y:.5,w:kind==='image'||kind==='video'?1:.36,h:kind==='image'||kind==='video'?1:.22,rotation:0,flipX:false,flipY:false,depth:0,asset,cropX:.5,cropY:.5,cropZoom:1,grade:{...NEUTRAL},strokes:[],pins:[],motion:{strength:28,cycles:1,angle:0,radius:.3},text:'STILL / WILD',font:'sans-serif',fontSize:72,weight:500,align:'left',fill:'#eee9dc',fill2:'#1f2529',shape:'rectangle',...(kind==='video'?{clip:{in:0,out:4,speed:1,blend:0}}:{})};}
const weather=(color:string):Weather=>({enabled:false,amount:25,angle:15,cycles:1,scale:35,color});
export function makeProject(direction:Direction='nature'):Project{
 const photo=PHOTOS.find(p=>p.direction===direction)!,l=layer('image',photo.id);l.name=photo.name;
 const p:Project={version:3,id:uid(),name:photo.name,direction,layers:[l],duration:8,time:0,paused:false,background:'#111619',camera:{amount:0,zoom:0},weather:{rain:weather('#a8cadc'),fog:weather('#d6e0dd'),dust:weather('#dac8a4'),rays:weather('#f0cc91')},seed:417};
 if(direction==='nature'){l.grade={...NEUTRAL,contrast:8,shadows:8,saturation:-12,temperature:-5,vignette:12};l.pins=[{id:uid(),x:.28,y:.27,angle:12,strength:38,radius:.33},{id:uid(),x:.78,y:.35,angle:-12,strength:24,radius:.3}];l.strokes=[{id:uid(),mode:'freeze',radius:.22,softness:65,angle:0,points:[{x:.68,y:.93},{x:.95,y:.9}]}];p.weather.fog={...p.weather.fog,enabled:true,amount:12,scale:65};}
 if(direction==='urban'){l.cropY=.67;l.grade={...NEUTRAL,contrast:10,shadows:14,saturation:-6,temperature:-7,vignette:22};l.motion.strength=19;l.pins=[{id:uid(),x:.49,y:.85,angle:0,strength:38,radius:.24}];p.weather.rain={...p.weather.rain,enabled:true,amount:28,angle:12,cycles:2,scale:24};p.weather.fog={...p.weather.fog,enabled:true,amount:8,scale:35,color:'#6785a9'};}
 if(direction==='editorial'){l.grade={...NEUTRAL,contrast:22,blacks:-8,grain:14};l.motion.strength=18;l.pins=[{id:uid(),x:.6,y:.58,angle:-22,strength:38,radius:.36}];const t=layer('text');t.name='Tidal studies — title';t.text='TIDAL\nSTUDIES';t.x=.28;t.y=.34;t.w=.43;t.h=.33;t.fontSize=126;t.weight=600;t.fill='#202525';const caption=layer('text');caption.name='Edition caption';caption.text='FIELD NOTES     /     03\nTHE SLOW RETURN OF WATER';caption.fontSize=22;caption.x=.29;caption.y=.81;caption.w=.44;caption.h=.1;caption.fill='#283135';p.layers.push(t,caption);}
 return p;
}
function obj(v:unknown):Record<string,unknown>{if(!v||typeof v!=='object'||Array.isArray(v))throw Error('Expected a project object.');return v as Record<string,unknown>;}
function num(v:unknown,a:number,b:number){if(typeof v!=='number'||!Number.isFinite(v))throw Error('Project contains an invalid number.');return clamp(v,a,b);}
function str(v:unknown,max:number){if(typeof v!=='string'||v.length>max)throw Error('Project text is invalid or too long.');return v;}
function bool(v:unknown){if(typeof v!=='boolean')throw Error('Project contains an invalid switch.');return v;}
function choice<T extends string>(v:unknown,values:readonly T[]):T{if(!values.includes(v as T))throw Error('Unsupported project option.');return v as T;}
function color(v:unknown){const s=str(v,9);if(!/^#[0-9a-f]{6}$/i.test(s))throw Error('Use six-digit color values.');return s;}
function id(v:unknown){const s=str(v,64);if(!/^[a-zA-Z0-9_-]+$/.test(s))throw Error('Invalid project identifier.');return s;}
function array(v:unknown,max:number){if(!Array.isArray(v)||v.length>max)throw Error('Project exceeds its item limit.');return v as unknown[];}
export function validateProject(value:unknown,builtinsOnly=false):Project{
 const s=obj(value);if(JSON.stringify(value).length>2_000_000)throw Error('Project vectors exceed the 2 MB limit.');if(s.version!==3)throw Error('This is not a Stillwild v3 project. Classic has its own import.');
 const ids=new Set<string>();const layers=array(s.layers,LIMITS.layers).map(v=>{const o=obj(v),g=obj(o.grade),m=obj(o.motion);const grade={} as Grade;
 for(const key of Object.keys(NEUTRAL) as (keyof Grade)[])grade[key]=num(g[key],key==='blur'||key==='sharpness'||key==='grain'||key==='vignette'?0:key==='exposure'?-2:key==='hue'?-180:-100,key==='exposure'?2:key==='hue'?180:key==='blur'?20:100);
 const lid=id(o.id);if(ids.has(lid))throw Error('Duplicate layer identifier.');ids.add(lid);
 const asset=str(o.asset,64);if(!PHOTOS.some(p=>p.id===asset)&&(!/^local-[a-f0-9-]+$/.test(asset)||builtinsOnly))throw Error('Unknown or private image in this project link.');
 const strokes=array(o.strokes,LIMITS.strokes).map(v=>{const a=obj(v);return {id:id(a.id),mode:choice(a.mode,['erase','restore','motion','freeze'] as const),radius:num(a.radius,.005,.6),softness:num(a.softness,0,100),angle:num(a.angle,-180,180),points:array(a.points,LIMITS.points).map(v=>{const a=obj(v);return{x:num(a.x,-1,2),y:num(a.y,-1,2)};})};});
 const pins=array(o.pins,LIMITS.pins).map(v=>{const a=obj(v);return{id:id(a.id),x:num(a.x,0,1),y:num(a.y,0,1),angle:num(a.angle,-180,180),strength:num(a.strength,0,100),radius:num(a.radius,.02,1)};});
 if(new Set(pins.map(v=>v.id)).size!==pins.length||new Set(strokes.map(v=>v.id)).size!==strokes.length)throw Error('Duplicate motion or brush identifier.');
 const kind=choice(o.kind,['image','video','text','shape','gradient'] as const);let clip:Layer['clip'];if(kind==='video'){if(!asset.startsWith('local-')||builtinsOnly)throw Error('Private video needs a portable project.');const c=obj(o.clip);clip={in:num(c.in,0,LIMITS.videoDuration),out:num(c.out,0,LIMITS.videoDuration),speed:num(c.speed,.25,2),blend:num(c.blend,0,1),...(c.timing!==undefined?{timing:choice(c.timing,['manual','fit'] as const)}:{}),...(c.fps!==undefined?{fps:Math.round(num(c.fps,1,60))}:{}),...(c.smooth!==undefined?{smooth:bool(c.smooth)}:{}),...(c.provider!==undefined?{provider:choice(c.provider,['wan','google','kling','custom'] as const)}:{}),...(c.sourceLayerId!==undefined?{sourceLayerId:id(c.sourceLayerId)}:{})};if(clip.smooth&&!clip.fps)throw Error('Frame blending needs an explicit source FPS.');if(clip.out-clip.in<.1||clip.blend>(clip.out-clip.in)/2)throw Error('Clip trim must leave at least 0.1s; blend cannot exceed half the trim.');}
 const automation=o.automation===undefined?undefined:validateAutomation(o.automation);if(automation&&kind!=='image'&&kind!=='video')throw Error('Look automation needs a media layer.');
 const scene=o.scene===undefined?undefined:validateScene(o.scene);if(scene&&kind!=='image'&&kind!=='video')throw Error('Scene regions require a media layer.');
 const selectiveColour=o.selectiveColour===undefined?undefined:validateSelectiveColour(o.selectiveColour);if(selectiveColour&&kind!=='image'&&kind!=='video')throw Error('Selective colour requires a media layer.');
 return {id:lid,kind,...(clip?{clip}: {}),...(selectiveColour?{selectiveColour}:{}),...(scene?{scene}:{}),...(automation?{automation}:{}),name:str(o.name,64),visible:bool(o.visible),locked:bool(o.locked),opacity:num(o.opacity,0,100),blend:choice(o.blend,['normal','multiply','screen','overlay'] as const),x:num(o.x,-2,3),y:num(o.y,-2,3),w:num(o.w,.02,4),h:num(o.h,.02,4),rotation:num(o.rotation,-180,180),flipX:bool(o.flipX),flipY:bool(o.flipY),depth:num(o.depth,-100,100),asset,cropX:num(o.cropX,0,1),cropY:num(o.cropY,0,1),cropZoom:num(o.cropZoom,1,4),grade,strokes,pins,motion:{strength:num(m.strength,0,100),cycles:normalizeCycleCount(m.cycles),angle:num(m.angle,-180,180),radius:num(m.radius,.02,.6)},text:str(o.text,800),font:choice(o.font,['sans-serif','serif','monospace'] as const),fontSize:num(o.fontSize,8,280),weight:num(o.weight,100,900),align:choice(o.align,['left','center','right'] as const),fill:color(o.fill),fill2:color(o.fill2),shape:choice(o.shape,['rectangle','ellipse'] as const)} as Layer;
 });
 if(layers.filter(l=>l.kind==='video').length>LIMITS.videoLayers)throw Error('A project supports 3 video layers.');
 if(new Set(layers.filter(l=>(l.kind==='image'||l.kind==='video')&&l.asset.startsWith('local-')).map(l=>l.asset)).size>LIMITS.assets)throw Error('A project supports 10 distinct private media assets.');
 const c=obj(s.camera),weatherObject=obj(s.weather),weatherOut={} as Project['weather'];for(const key of ['rain','fog','dust','rays'] as const){const w=obj(weatherObject[key]);weatherOut[key]={enabled:bool(w.enabled),amount:num(w.amount,0,100),angle:num(w.angle,-180,180),cycles:normalizeCycleCount(w.cycles),scale:num(w.scale,1,100),color:color(w.color),...(w.placement!==undefined?{placement:choice(w.placement,['sky','valley','full'] as const)}:{}),...(w.height!==undefined?{height:num(w.height,0,100)}:{}),...(w.falloff!==undefined?{falloff:num(w.falloff,0,100)}:{})};}
 const sound=s.sound===undefined?undefined:validateSound(s.sound,builtinsOnly);
 if(new Set([...layers.filter(l=>l.asset.startsWith('local-')).map(l=>l.asset),...(sound?.layers.filter(l=>l.source==='import').map(l=>l.asset!)||[])]).size>LIMITS.assets)throw Error('Use at most ten distinct private media assets.');
 const duration=num(s.duration,4,12);if(![4,8,12].includes(duration))throw Error('Loop duration must be 4, 8 or 12 seconds.');
 return {version:3,id:id(s.id),name:str(s.name,64),direction:choice(s.direction,['nature','urban','editorial'] as const),layers,duration,time:num(s.time,0,duration),paused:bool(s.paused),background:color(s.background),camera:{amount:num(c.amount,0,100),zoom:num(c.zoom,0,100)},weather:weatherOut,...(sound?{sound}:{}),seed:Math.round(num(s.seed,0,1e6))};
}
export function privateAssets(p:Project){return [...new Set([...p.layers.filter(l=>(l.kind==='image'||l.kind==='video')&&l.asset.startsWith('local-')).map(l=>l.asset),...(p.sound?.layers.filter(l=>l.source==='import').map(l=>l.asset!)||[])])];}
export function encodeProject(p:Project){const valid=validateProject(p,true),bytes=new TextEncoder().encode(JSON.stringify({...valid,paused:true}));if(bytes.length>44000)throw Error('This detailed project is too large for a link. Download a portable project instead.');let text='';for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(text) .replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');}
export function decodeProject(hash:string){const raw=new URLSearchParams(hash.replace(/^#/,'' )).get('studio');if(!raw)return null;if(raw.length>100000)throw Error('Project link is too large.');return {...validateProject(JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(raw.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0)))),true),paused:true};}
export function loopPhase(t:number,duration:number){return ((t%duration)+duration)%duration/duration;}
export function fieldAt(l:Layer,x:number,y:number):Point{
 let dx=0,dy=0,freeze=1;const add=(px:number,py:number,r:number,a:number,strength:number)=>{const distance=Math.hypot((x-px)*16/9,y-py)/r;if(distance>=1)return;const f=(1-distance*distance)**2*strength;dx+=Math.cos(a*Math.PI/180)*f;dy+=Math.sin(a*Math.PI/180)*f;};
 for(const pin of l.pins)add(pin.x,pin.y,pin.radius,pin.angle,pin.strength/100);
 for(const stroke of l.strokes){if(stroke.mode!=='motion'&&stroke.mode!=='freeze')continue;let weight=0;for(const p of stroke.points){const d=Math.hypot((x-p.x)*16/9,y-p.y)/stroke.radius;if(d<1)weight=Math.max(weight,Math.min(1,(1-d)/(Math.max(.02,stroke.softness/100))));}if(stroke.mode==='freeze')freeze*=1-weight;else {dx+=Math.cos(stroke.angle*Math.PI/180)*weight;dy+=Math.sin(stroke.angle*Math.PI/180)*weight;}}
 // Edge anchors prevent undefined pixels from entering the crop.
 const edge=clamp(Math.min(x,y,1-x,1-y)*16,0,1);return{x:clamp(dx,-1,1)*freeze*edge,y:clamp(dy,-1,1)*freeze*edge};
}

// Gallery selection is by asset ID; legacy direction presets remain loadable.
export function makeWallpaper(photoId:string):Project{
 const photo=PHOTOS.find(v=>v.id===photoId);if(!photo)throw Error('Unknown wallpaper scene.');
 const p=makeProject(photo.direction),l=layer('image',photo.id);l.name=photo.name;l.grade={...NEUTRAL};l.motion.strength=0;p.name=photo.name;p.layers=[l];p.paused=false;
 for(const w of Object.values(p.weather))w.enabled=false;
 if(photo.id==='tokyo-asakusa')l.cropY=.67;
 return p;
}
