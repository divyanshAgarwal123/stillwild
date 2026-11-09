import {cropWindow,transferScene} from './scene.ts';
import type {Layer} from './model';
export type GenerationProvider='wan'|'google'|'kling'|'custom';
// The generated frame already contains the neutral source crop and padding.
// Copy editable placement/grade/mask once, keeping the video's crop neutral.
export function configureMotionLayer(base:Layer,duration:number,provider?:GenerationProvider,requestedDuration=duration,source?:Layer,outputAspect=provider==='wan'?832/480:16/9){
 const n=structuredClone(base);
 const span=provider==='wan'?Math.min(duration,requestedDuration):duration;
 n.clip=provider==='wan'?{in:0,out:span,speed:1,blend:Math.min(.4,span*.1),timing:'fit',fps:16,smooth:true,provider}:
  provider==='kling'||provider==='custom'?{in:0,out:span,speed:1,blend:Math.min(.2,span*.05),timing:'fit',provider}:
  {in:0,out:span,speed:1,blend:0,...(provider?{provider}:{})};
 if(source)for(const key of ['x','y','w','h','rotation','flipX','flipY','depth','opacity','blend','grade','strokes'] as const)Object.assign(n,{[key]:structuredClone(source[key])});
 if(source?.kind==='video')for(const key of ['cropX','cropY','cropZoom'] as const)n[key]=source[key];
 if(source?.scene)n.scene=transferScene(source.scene,cropWindow(source,source.scene.sourceAspect),cropWindow(n,outputAspect),outputAspect);
 if(source?.automation)n.automation=structuredClone(source.automation);
 if(source?.selectiveColour)n.selectiveColour=structuredClone(source.selectiveColour);
 return n;
}
