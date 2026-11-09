import type {Layer} from './model';

export function isAnimationSource(layer:Layer|null|undefined):layer is Layer&{kind:'image'}{
 return layer?.kind==='image'&&layer.visible&&layer.opacity>0&&!layer.locked;
}

// An explicit Animate action may change selection; merely opening AI must not.
export function animationSourceId(layers:readonly Layer[],selected:string|null):string|null{
 const current=layers.find(layer=>layer.id===selected);
 return (isAnimationSource(current)?current:[...layers].reverse().find(isAnimationSource))?.id||null;
}

// Layer order is bottom to top. Defaults should target pixels the user can see;
// explicit/manual selections are kept by the caller, even when hidden or locked.
export function defaultLayerId(layers:readonly Layer[]):string|null{
 const top=[...layers].reverse(),shown=(l:Layer)=>l.visible&&l.opacity>0;
 const pick=top.find(l=>shown(l)&&!l.locked&&(l.kind==='image'||l.kind==='video'))
  ||top.find(l=>shown(l)&&!l.locked)
  ||top.find(shown)
  ||top.find(l=>l.visible&&!l.locked)
  ||top.find(l=>l.visible)
  ||top.find(l=>!l.locked)
  ||top[0];
 return pick?.id||null;
}

// An applied animation keeps its original source, intentionally hidden beneath it.
export function wallpaperSource(layers:readonly Layer[],selected:string|null){
 const current=layers.find(l=>l.id===selected);
 if(isAnimationSource(current))return current;
 if(current?.kind==='video'&&current.visible&&!current.locked&&current.clip?.sourceLayerId){const original=layers.find(l=>l.id===current.clip!.sourceLayerId);return original?.kind==='image'&&!original.locked&&original.opacity>0?original:null;}
 if(current?.kind==='video'&&current.visible&&!current.locked){const candidates=layers.filter(isAnimationSource);return candidates.length===1?candidates[0]:null;}
 return layers.find(l=>l.id===animationSourceId(layers,selected))||null;
}
