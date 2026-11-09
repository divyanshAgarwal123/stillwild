import {configureMotionLayer} from './motion.ts';
import {layer} from './model.ts';
import type {Layer,Project} from './model.ts';
import type {GenerationProvider} from './motion.ts';
export type AnimationSnapshot={source:Layer;projectId:string;appearanceId?:string};
export function animationApplied(project:Pick<Project,'id'|'layers'>,result:{projectId:string;asset:{id:string}}|null){
 return !!result&&project.id===result.projectId&&project.layers.some(l=>l.kind==='video'&&l.asset===result.asset.id);
}
export function animationConflict(p:Project,snapshot:AnimationSnapshot){
 if(p.id!==snapshot.projectId)return 'This result belongs to another wallpaper. Return to that wallpaper to apply it.';
 const source=p.layers.find(l=>l.id===snapshot.source.id);
 if(!source||source.kind!=='image')return 'The original photograph was removed. Restore it with Undo to apply this result.';
 if(source.locked||(!source.visible&&!p.layers.some(l=>l.kind==='video'&&l.visible&&!l.locked&&l.clip?.sourceLayerId===source.id))||source.opacity<=0)return 'Show and unlock the original photograph in Advanced to apply this result.';
 if(source.asset!==snapshot.source.asset||source.cropX!==snapshot.source.cropX||source.cropY!==snapshot.source.cropY||source.cropZoom!==snapshot.source.cropZoom||source.w/source.h!==snapshot.source.w/snapshot.source.h)return 'The photograph or crop changed. Restore the original crop to apply this result safely.';
 return null;
}
export function applyAnimation(p:Project,snapshot:AnimationSnapshot,asset:string,duration:number,provider:GenerationProvider,requestedDuration:number,outputAspect?:number){
 const conflict=animationConflict(p,snapshot);if(conflict)throw Error(conflict);
 const source=p.layers.find(l=>l.id===snapshot.source.id)!;
 const appearance=snapshot.appearanceId?p.layers.find(l=>l.id===snapshot.appearanceId):source;
 if(!appearance||appearance.locked||appearance.id!==source.id&&(!appearance.visible||appearance.clip?.sourceLayerId!==source.id&&!(appearance.kind==='video'&&!appearance.clip?.sourceLayerId&&p.layers.filter(l=>l.kind==='image'&&l.visible&&!l.locked&&l.opacity>0).length===1)))throw Error('The animated wallpaper changed. Restore it with Undo before applying this retained result.');
 const n=configureMotionLayer(layer('video',asset),duration,provider,requestedDuration,appearance,outputAspect);
 // The photo remains as the editable source, without filling video masks from below.
 n.clip={...n.clip!,sourceLayerId:source.id};
 const layers=p.layers.filter(l=>!(l.kind==='video'&&(l.clip?.sourceLayerId===source.id||l.id===snapshot.appearanceId))).map(l=>l.id===source.id?{...l,visible:false}:l),index=layers.findIndex(l=>l.id===source.id);layers.splice(index+1,0,n);
 return {project:{...p,layers},selected:n.id};
}
