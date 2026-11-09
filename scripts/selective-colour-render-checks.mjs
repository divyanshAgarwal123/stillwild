// Browser-only focused renderer checks, using local project assets and decoded frames.
import {PhotoRenderer} from '../src/photo/render.ts';
import {VideoFrames} from '../src/photo/media.ts';
import {readCurrent,loadImages} from '../src/photo/storage.ts';
import {layer,makeProject,NEUTRAL} from '../src/photo/model.ts';
import {DEFAULT_SELECTIVE_COLOUR as defaults} from '../src/photo/selectiveColour.ts';
import {compareColour} from './selective-colour-metrics.mjs';
const active={...defaults,enabled:true};
const check=(yes,message)=>{if(!yes)throw Error(message);};
const equal=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
function draw(renderer,p,frame,before=false){const c=document.createElement('canvas');c.width=640;c.height=360;renderer.render(c.getContext('2d'),p,p.time,640,360,{before,media:new Map([[p.layers.at(-1).id,frame]])});return{canvas:c,data:c.getContext('2d').getImageData(0,0,640,360).data};}
export async function runSelectiveRenderChecks(){
 const checks=[],gl=new PhotoRenderer(),cpu=new PhotoRenderer(true),media=new VideoFrames();
 try{
  check(gl.mode==='WebGL','WebGL shader must compile; silent fallback is not GPU proof.');
  const p=makeProject();p.paused=true;p.camera={amount:0,zoom:0};for(const w of Object.values(p.weather))w.enabled=false;
  const l=layer('video','local-00000000-0000-4000-8000-000000000000');l.grade={...NEUTRAL};p.layers=[l];p.background='#223344';
  const swatch=document.createElement('canvas');swatch.width=640;swatch.height=360;const ctx=swatch.getContext('2d'),colours=['#ff486f','#ff0033','#20a040','#20a0a0','#888888','#000000'];for(let i=0;i<colours.length;i++){ctx.fillStyle=colours[i];ctx.fillRect(i*640/6,0,640/6+1,360);}
  const baseline=draw(gl,p,swatch).data;l.selectiveColour={...active};const gpu=draw(gl,p,swatch).data,fallback=draw(cpu,p,swatch).data;
  let max=0,sum=0;for(let i=0;i<gpu.length;i++){const d=Math.abs(gpu[i]-fallback[i]);max=Math.max(max,d);sum+=d;}check(max<=2&&sum/gpu.length<.25,'Isolated selective GPU/fallback disagreement: '+JSON.stringify({max,mean:sum/gpu.length}));
  const synthetic=compareColour(baseline,gpu);check(synthetic.selected.purple>.99,'Synthetic pink/red must become target violet.');check(synthetic.unselected.difference===0&&synthetic.neutral.difference===0,'Synthetic greens/cyans/greys must remain exact.');
  for(const edit of [{...active,enabled:false},{...active,strength:0},{...active,target:'#888888'}]){l.selectiveColour=edit;check(equal(draw(gl,p,swatch).data,baseline),'GPU bypass must be exact.');check(equal(draw(cpu,p,swatch).data,baseline),'CPU bypass must be exact.');}
  l.selectiveColour=active;check(equal(draw(gl,p,swatch,true).data,baseline),'Before must bypass selective processing.');
  checks.push({name:'WebGL shader compilation, CPU agreement, hue selection and exact bypasses',result:'passed',maxByteDifference:max,meanByteDifference:sum/gpu.length,synthetic});
  l.strokes=[{id:'mask',mode:'erase',radius:.2,softness:0,angle:0,points:[{x:.08,y:.5}]}];const masked=draw(gl,p,swatch).data,at=(180*640+51)*4;check(equal(Array.from(masked.slice(at,at+3)),[34,51,68]),'Mask must reveal unchanged background.');l.strokes=[];l.opacity=50;const half=draw(gl,p,swatch).data,full=gpu;for(let k=0;k<3;k++)check(Math.abs(half[at+k]-(full[at+k]*.5+[34,51,68][k]*.5))<=2,'Opacity must composite selective result once.');
  checks.push({name:'Selective result obeys visibility mask and layer opacity',result:'passed'});
  // Exercise photo fallback cache with the same asset/grade/crop and only hue state changing.
  const photo=makeProject('urban');photo.layers=photo.layers.slice(0,1);photo.layers[0].grade={...NEUTRAL};photo.layers[0].pins=[];for(const w of Object.values(photo.weather))w.enabled=false;await loadImages(photo);photo.layers[0].selectiveColour={...active,range:180};const c=document.createElement('canvas');c.width=640;c.height=360;const r=c.getContext('2d');cpu.render(r,photo,0,640,360,{reduced:true});const first=r.getImageData(0,0,640,360).data;photo.layers[0].selectiveColour={...active,range:180,target:'#00ff00'};cpu.render(r,photo,0,640,360,{reduced:true});const second=r.getImageData(0,0,640,360).data;check(!equal(first,second),'Photo fallback must invalidate cached pixels on selective-only edit.');
  checks.push({name:'Photo CPU fallback cache invalidates on selective-only change',result:'passed'});
  const project=await readCurrent();check(project.layers.some(l=>l.kind==='video'),'Real video fixture required.');for(const l of project.layers)l.selectiveColour=undefined;await loadImages(project);const frames=[];
  for(const t of [0,1,2,3]){project.time=t;await media.prepare(project,t,false);const frame=media.frames.get(project.layers.at(-1).id);check(frame,'Decoded real frame missing.');const original=draw(gl,project,frame).data;project.layers.at(-1).selectiveColour=active;const result=draw(gl,project,frame),stats=compareColour(original,result.data);check(stats.selected.count>30&&stats.selected.purple>.96,'Real selected hues must become violet: '+JSON.stringify(stats));check(stats.unselected.count>1000&&stats.unselected.difference===0,'Real greens/cyans must remain exact: '+JSON.stringify(stats));check(stats.selected.valueError<.005&&stats.selected.saturationError<.015,'HSV brightness and saturation must survive.');frames.push({projectTime:t,...stats});if(t===2)window.__selectiveReviewPNG=result.canvas.toDataURL();project.layers.at(-1).selectiveColour=undefined;}
  checks.push({name:'Four actual decoded Kling frames change pink/red to violet while preserving unrelated regions and HSV detail',result:'passed',frames});
  return {result:'passed',checkedAt:new Date().toISOString(),checks};
 }finally{gl.dispose();cpu.dispose();media.dispose();}
}
