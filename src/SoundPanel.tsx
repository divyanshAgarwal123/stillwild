import {useEffect,useRef,useState} from 'react';
import {AmbientMixer,loadMixer,MIXER_KEY} from './audio';
import type {AudioStatus,MixerValues} from './audio';
import {Icon} from './icons';
// Kept mounted while tabs change: artwork pause and audio are intentionally independent.
export default function SoundPanel({visible,active:workspaceActive=true,notify}:{visible:boolean;active?:boolean;notify:(text:string)=>void}){
 const [values,setValues]=useState(loadMixer),[status,setStatus]=useState<AudioStatus>('off'),[muted,setMuted]=useState(false),[sleep,setSleep]=useState(0),[remaining,setRemaining]=useState(0);
 const engine=useRef<AmbientMixer|null>(null),sleepRef=useRef<ReturnType<typeof setTimeout>|null>(null),endAt=useRef(0);
 useEffect(()=>{const mixer=new AmbientMixer(setStatus);engine.current=mixer;const visibility=()=>void mixer.setHidden(document.hidden);document.addEventListener('visibilitychange',visibility);
  // Local read-only diagnostic access for browser validation; it never starts audio.
  Object.defineProperty(window,'__stillwildAudio',{value:{metrics:()=>mixer.metrics(),recordWav:(seconds:number)=>mixer.recordWav(seconds)},configurable:true});
  return()=>{document.removeEventListener('visibilitychange',visibility);if(sleepRef.current)clearTimeout(sleepRef.current);delete (window as unknown as Record<string,unknown>).__stillwildAudio;void mixer.dispose();};
 },[]);
 useEffect(()=>{engine.current?.setValues(values);try{localStorage.setItem(MIXER_KEY,JSON.stringify(values));}catch{notify('Sound levels could not be saved on this device.');}},[values]);
 useEffect(()=>{const timer=setInterval(()=>{if(endAt.current)setRemaining(Math.max(0,Math.ceil((endAt.current-Date.now())/60000)));},10000);return()=>clearInterval(timer);},[]);
 const active=['playing','muted','hidden','suspended','starting'].includes(status);
 const schedule=(minutes:number)=>{setSleep(minutes);if(sleepRef.current)clearTimeout(sleepRef.current);endAt.current=minutes?Date.now()+minutes*60000:0;setRemaining(minutes);if(minutes)sleepRef.current=setTimeout(()=>{void engine.current?.stop();setSleep(0);setRemaining(0);endAt.current=0;notify('Sleep timer finished. Sound is off.');},minutes*60000);};
 useEffect(()=>{if(!workspaceActive){void engine.current?.stop();if(sleepRef.current)clearTimeout(sleepRef.current);endAt.current=0;setSleep(0);setRemaining(0);setMuted(false);}},[workspaceActive]);
 const stop=()=>{void engine.current?.stop();schedule(0);setMuted(false);};
 const start=()=>{setMuted(false);void engine.current?.start(values);if(sleep)schedule(sleep);};
 return <div hidden={!visible} className="sound-panel tab-content" role="tabpanel" id="panel-sound" aria-labelledby="tab-sound">
  <div className="tab-intro"><span className="eyebrow">GENERATIVE SOUND</span><h3>A room to listen.</h3><p>Three quiet layers, made here in your browser. Audio is separate from the artwork’s pause.</p></div>
  <div className="sound-transport"><button className="button dark" onClick={active?stop:start} disabled={status==='starting'}><Icon name={active?'pause':'play'} size={15}/>{status==='starting'?'Starting…':active?'Stop sound':'Start sound'}</button><button className={`button outlined ${muted?'active':''}`} aria-pressed={muted} onClick={()=>{const next=!muted;setMuted(next);engine.current?.setMuted(next);}} disabled={!active}>{muted?'Unmute':'Mute'}</button></div>
  <p className="sound-status" role="status">{({off:'Sound is off. Start when you’re ready.',starting:'Preparing the soundscape…',playing:'Playing · artwork pause is independent',muted:'Muted · mixer is ready',hidden:'Quiet while this tab is hidden',suspended:'Audio suspended. Press Resume sound.',unsupported:'Web Audio is unavailable in this browser.',error:'Sound could not start. Try again.'})[status]}</p>
  {status==='suspended'&&<button className="button outlined" onClick={start}>Resume sound</button>}
  <div className="mixer-sliders">{(['master','rain','air','tone'] as const).map((key,i)=><label className={`mixer-row ${i===0?'master-row':''}`} key={key}><span><Icon name={i===1?'rain':i===2?'wind':i===3?'spark':'sound'} size={17}/><span>{({master:'Master volume',rain:'Rain',air:'Forest air',tone:'Soft tones'})[key]}<small>{({master:'The whole soundscape',rain:'A soft, filtered shower',air:'Slow air through the trees',tone:'A low harmonic bed'})[key]}</small></span><output>{values[key]}%</output></span><input type="range" min="0" max="100" aria-label={({master:'Master volume',rain:'Rain volume',air:'Forest air volume',tone:'Soft tones volume'})[key]} value={values[key]} style={{'--progress':`${values[key]}%`} as React.CSSProperties} onChange={e=>setValues({...values,[key]:Number(e.target.value)} as MixerValues)}/></label>)}</div>
  <label className="select-field">Sleep timer<select aria-label="Sound sleep timer" value={sleep} onChange={e=>schedule(Number(e.target.value))}><option value="0">Keep playing</option><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">60 minutes</option></select></label>{remaining>0&&<p className="field-note">Sound fades out in about {remaining} minutes.</p>}
  <div className="quiet-note"><Icon name="info" size={16}/><span>Your levels are remembered. Sound always starts off when you reload or open a link.</span></div>
 </div>;
}
