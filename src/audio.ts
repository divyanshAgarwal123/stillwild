import { seeded, clamp } from './model';
export type MixerValues={master:number;rain:number;air:number;tone:number};
export type AudioStatus='off'|'starting'|'playing'|'muted'|'hidden'|'suspended'|'unsupported'|'error';
export const MIXER_KEY='stillwild.mixer.v2';
export const DEFAULT_MIXER:MixerValues={master:55,rain:38,air:28,tone:18};
export function validateMixer(v:unknown):MixerValues{
 const o=v&&typeof v==='object'?v as Record<string,unknown>:{};
 return Object.fromEntries(Object.entries(DEFAULT_MIXER).map(([k,fallback])=>[k,typeof o[k]==='number'&&Number.isFinite(o[k])?clamp(o[k],0,100):fallback])) as MixerValues;
}
export function loadMixer():MixerValues{try{return validateMixer(JSON.parse(localStorage.getItem(MIXER_KEY)||'null'));}catch{return {...DEFAULT_MIXER};}}
export class AmbientMixer{
 private context:AudioContext|null=null;
 private master:GainNode|null=null;
 private channels:Partial<Record<'rain'|'air'|'tone',GainNode>>={};
 private analyser:AnalyserNode|null=null;
 private sources:(AudioBufferSourceNode|OscillatorNode)[]=[];
 private nodes:AudioNode[]=[];
 private epoch=0;
 private disposed=false;
 private wantsAudio=false;
 private muted=false;
 private hidden=false;
 private latest:MixerValues={...DEFAULT_MIXER};
 status:AudioStatus='off';
 constructor(private onStatus:(status:AudioStatus)=>void=()=>{}){}
 private setStatus(status:AudioStatus){this.status=status;this.onStatus(status);}
 private gain(node:GainNode,value:number){const ctx=this.context;if(!ctx)return;node.gain.cancelScheduledValues(ctx.currentTime);node.gain.setTargetAtTime(value,ctx.currentTime,.065);}
 private apply(){
  if(!this.context||!this.master)return;
  for(const key of ['rain','air','tone'] as const){const node=this.channels[key];if(node)this.gain(node,this.latest[key]/100*({rain:.36,air:.5,tone:.09}[key]));}
  this.gain(this.master,this.wantsAudio&&!this.muted&&!this.hidden?this.latest.master/100:0);
 }
 setValues(values:MixerValues){this.latest=validateMixer(values);this.apply();}
 setMuted(muted:boolean){this.muted=muted;this.apply();if(this.context)this.setStatus(this.hidden?'hidden':muted?'muted':this.context.state==='running'?'playing':'suspended');}
 async setHidden(hidden:boolean){
  this.hidden=hidden;this.apply();const ctx=this.context;if(!ctx)return;
  if(hidden){this.setStatus('hidden');if(this.master){const now=ctx.currentTime;this.master.gain.cancelScheduledValues(now);this.master.gain.setValueAtTime(this.master.gain.value,now);this.master.gain.linearRampToValueAtTime(0,now+.12);}await new Promise(resolve=>setTimeout(resolve,240));if(this.context===ctx&&this.hidden)await ctx.suspend().catch(()=>{});}
  else if(this.wantsAudio){try{await ctx.resume();if(this.context===ctx)this.setStatus(this.muted?'muted':'playing');}catch{this.setStatus('suspended');}}
 }
 async start(values:MixerValues){
  if(this.disposed)return;this.latest=validateMixer(values);this.wantsAudio=true;this.muted=false;const epoch=++this.epoch;
  const AudioCtor=window.AudioContext||(window as typeof window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
  if(!AudioCtor){this.setStatus('unsupported');return;}
  this.setStatus('starting');
  try{
   if(!this.context||this.context.state==='closed'){
    const ctx=new AudioCtor();this.context=ctx;
    this.master=ctx.createGain();this.master.gain.value=0;
    const compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-18;compressor.knee.value=24;compressor.ratio.value=3;compressor.attack.value=.04;compressor.release.value=.35;
    this.analyser=ctx.createAnalyser();this.analyser.fftSize=2048;
    this.master.connect(compressor).connect(this.analyser).connect(ctx.destination);this.nodes.push(this.master,compressor,this.analyser);
    const buffer=ctx.createBuffer(2,ctx.sampleRate*8,ctx.sampleRate),random=seeded(502);
    for(let channel=0;channel<2;channel++){const data=buffer.getChannelData(channel);let brown=0;for(let i=0;i<data.length;i++){const white=random()*2-1;brown=(brown+.023*white)/1.023;data[i]=brown*2.8+white*.2;}}
    for(const key of ['rain','air'] as const){
     const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;source.playbackRate.value=key==='rain'?1.07:.62;
     const filter=ctx.createBiquadFilter();filter.type=key==='rain'?'highpass':'lowpass';filter.frequency.value=key==='rain'?850:480;filter.Q.value=.4;
     const soft=ctx.createBiquadFilter();soft.type='lowpass';soft.frequency.value=key==='rain'?5600:900;
     const gain=ctx.createGain();gain.gain.value=0;source.connect(filter).connect(soft).connect(gain).connect(this.master);this.channels[key]=gain;this.sources.push(source);this.nodes.push(source,filter,soft,gain);source.start();
     if(key==='air'){const lfo=ctx.createOscillator(),depth=ctx.createGain();lfo.frequency.value=.065;depth.gain.value=210;lfo.connect(depth).connect(filter.frequency);lfo.start();this.sources.push(lfo);this.nodes.push(lfo,depth);}
    }
    const tone=ctx.createGain();tone.gain.value=0;tone.connect(this.master);this.channels.tone=tone;this.nodes.push(tone);
    for(const [i,freq] of [110,164.8138,220.08].entries()){
     const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.value=[.42,.16,.1][i];osc.connect(gain).connect(tone);osc.start();this.sources.push(osc);this.nodes.push(osc,gain);
    }
    ctx.onstatechange=()=>{if(this.context!==ctx||!this.wantsAudio)return;if(ctx.state!=='running'&&ctx.state!=='closed')this.setStatus(this.hidden?'hidden':'suspended');else if(ctx.state==='running')this.setStatus(this.hidden?'hidden':this.muted?'muted':'playing');else if(ctx.state==='closed')this.setStatus('off');};
   }
   const ctx=this.context;await ctx.resume();if(epoch!==this.epoch||this.disposed)return;
   this.apply();this.setStatus(this.hidden?'hidden':this.muted?'muted':ctx.state==='running'?'playing':'suspended');
  }catch{if(epoch===this.epoch){this.setStatus('error');await this.release();}}
 }
 async stop(){
  ++this.epoch;this.wantsAudio=false;const ctx=this.context;if(this.master)this.gain(this.master,0);this.setStatus('off');
  await new Promise(resolve=>setTimeout(resolve,180));if(this.context===ctx&&!this.wantsAudio)await this.release();
 }
 private async release(){const ctx=this.context;this.context=null;for(const source of this.sources){try{source.stop();}catch{}}for(const node of this.nodes){try{node.disconnect();}catch{}}this.sources=[];this.nodes=[];this.channels={};this.master=null;this.analyser=null;if(ctx&&ctx.state!=='closed'){ctx.onstatechange=null;await ctx.close().catch(()=>{});}}
 async dispose(){this.disposed=true;++this.epoch;this.wantsAudio=false;await this.release();}
 metrics(){
  if(!this.analyser||!this.context)return {rms:0,peak:0,context:'none',nodes:0,status:this.status};
  if(this.context.state!=='running')return {rms:0,peak:0,context:this.context.state,nodes:this.nodes.length,status:this.status};
  const samples=new Float32Array(this.analyser.fftSize);this.analyser.getFloatTimeDomainData(samples);let square=0,peak=0;for(const v of samples){square+=v*v;peak=Math.max(peak,Math.abs(v));}
  return {rms:Math.sqrt(square/samples.length),peak,context:this.context.state,nodes:this.nodes.length,status:this.status};
 }
 async recordWav(seconds=2):Promise<Blob>{
  if(!this.context||!this.analyser)throw new Error('Start sound first.');
  const ctx=this.context,length=Math.ceil(Math.min(3,Math.max(.25,seconds))*ctx.sampleRate),samples=new Float32Array(length);let offset=0;
  // A temporary ScriptProcessor taps the actual post-master mix for local evidence only.
  const processor=ctx.createScriptProcessor(2048,1,1),silence=ctx.createGain();silence.gain.value=0;
  this.analyser.connect(processor);processor.connect(silence).connect(ctx.destination);
  let timer:ReturnType<typeof setTimeout>|undefined;
  try{await new Promise<void>((resolve,reject)=>{timer=setTimeout(()=>reject(new Error('Audio recording timed out.')),5000);processor.onaudioprocess=e=>{const data=e.inputBuffer.getChannelData(0),count=Math.min(data.length,length-offset);samples.set(data.subarray(0,count),offset);offset+=count;if(offset>=length)resolve();};});}
  finally{if(timer)clearTimeout(timer);processor.onaudioprocess=null;this.analyser?.disconnect(processor);processor.disconnect();silence.disconnect();}
  const bytes=new ArrayBuffer(44+length*2),view=new DataView(bytes);const str=(at:number,s:string)=>{for(let i=0;i<s.length;i++)view.setUint8(at+i,s.charCodeAt(i));};str(0,'RIFF');view.setUint32(4,36+length*2,true);str(8,'WAVE');str(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,ctx.sampleRate,true);view.setUint32(28,ctx.sampleRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);str(36,'data');view.setUint32(40,length*2,true);for(let i=0;i<length;i++)view.setInt16(44+i*2,clamp(samples[i],-1,1)*32767,true);return new Blob([bytes],{type:'audio/wav'});
 }
}
