import type {Layer} from './model';

// Optional fields preserve the linear crossfade and manual clock of older files.
export function clipTiming(l:Layer,time:number,duration=8){
 const c=l.clip!,span=c.out-c.in,blend=Math.min(c.blend,span/2),period=span-blend;
 const repeats=c.timing==='fit'?Math.max(1,Math.round(duration*c.speed/period)):1;
 const speed=c.timing==='fit'?period*repeats/duration:c.speed;
 const projectPhase=((time%duration)+duration)%duration/duration;
 const pos=c.timing==='fit'?((projectPhase*repeats)%1)*period:((time*speed%period)+period)%period,first=c.in+blend+pos;
 const linear=blend?Math.max(0,(first-(c.out-blend))/blend):0;
 const weight=c.timing==='fit'?linear*linear*(3-2*linear):linear;
 return {first,second:c.in+Math.max(0,first-(c.out-blend)),weight,speed,repeats,repeat:period/speed};
}

export function sourceFrames(time:number,fps:number,duration:number,trimIn=0,trimOut=duration){
 const last=Math.max(0,Math.min(Math.ceil(duration*fps)-1,Math.ceil(trimOut*fps-1e-9)-1)),lower=Math.min(last,Math.max(0,Math.ceil(trimIn*fps-1e-9))),position=Math.max(lower,Math.min(time*fps,last));
 const first=Math.floor(position),second=Math.min(first+1,last);
 return {first,second,weight:position-first};
}
