import {sceneMotion} from './sceneMotion';
import {useEffect,useRef,useState} from 'react';
import type {Layer,Project} from './model';
import {DEFAULT_CONNECTION,apiBoundary,connectionIssue,generateCustom} from './customApi';
import type {ApiConnection} from './customApi';
import {generateWan} from './wan';
import {validateVideo} from './media';
import {download} from './storage';
import type {ImageAsset} from './storage';
type Provider='wan'|'custom';
type Prepared={image:string;source:Layer;projectId:string;appearanceId?:string};
export type MotionResult={id:string;asset:ImageAsset;source:Layer;projectId:string;appearanceId?:string;provider:Provider;requestedDuration:number};
const prompts={
 calm:'Locked camera. Gentle, selective natural motion in the existing scene. Preserve composition, people and objects. No cuts, new objects or text. Preserve framing and matte padding. Calm wallpaper movement.',
 forest:'Locked camera. A very light breeze moves a few leaves and thin mist drifts slowly. Keep trunks and landscape still. Preserve framing and matte padding. No new objects or cuts.',
 rain:'Locked camera. Subtle rain and slow ripples in existing puddles. Keep buildings, signs and people still. Preserve framing and matte padding. No camera movement, new objects or cuts.',
 coast:'Locked camera. Small, slow waves in the existing water. Keep the horizon and rocks still. Preserve framing and matte padding. No new objects or cuts.',
 waterfall:'Locked camera. Natural continuous waterfall flow and fine drifting spray; clouds move slowly. Keep cliffs, trees and composition steady. Preserve framing and matte padding. No cuts, camera movement, new objects or text.',
 neon:'Locked camera. Cinematic cyan and magenta light illuminates existing mist and waterfall spray, with reflected light in the water and soft volumetric scattering. Keep cliffs, trees and composition steady. Preserve natural detail and framing. No flat color overlay, cuts, camera movement, new objects or text.'
};
const name=(p:Provider)=>p==='wan'?'Wan':'Your API';
const imageBlob=(image:string)=>new Blob([Uint8Array.from(atob(image),c=>c.charCodeAt(0))],{type:'image/jpeg'});
const FORMAT_FIELDS:([keyof ApiConnection,string,string?])[]=[['authHeader','Authentication header'],['authPrefix','Authentication prefix'],['trustPath','Authenticated API path','Blank uses the endpoint directory. Use a directory such as /v1/; / explicitly trusts this origin.'],['statusPath','Status field path'],['pending','Pending status values'],['complete','Complete status values'],['failed','Failed status values'],['pollPath','Poll URL field path'],['resultPath','Result URL field path'],['videoPath','Video URL field path'],['dataPath','Video base64 field path'],['mimePath','Video MIME field path'],['idPath','Job ID field path'],['pollTemplate','Poll URL template'],['resultTemplate','Result URL template']];
export default function AnimationPanel({visible,source,sourceImage,insert,onOpen,project,isApplied}:{isApplied:(result:MotionResult)=>boolean;project:Pick<Project,'id'|'layers'>;onOpen:()=>void;visible:boolean;source:Layer|null;sourceImage:(provider:Provider)=>Promise<Prepared>;insert:(result:MotionResult)=>Promise<void>}){
 const promptDrafts=useRef(new Map<string,string>());
 // This component stays mounted through task/view changes. Never serialize connection state.
 const [provider,setProvider]=useState<Provider>('wan'),[connection,setConnection]=useState<ApiConnection>({...DEFAULT_CONNECTION}),[key,setKey]=useState(''),[prompt,setPrompt]=useState(prompts.calm),[wanDuration,setWanDuration]=useState(4),[customDuration,setCustomDuration]=useState('4');
 const [status,setStatus]=useState(''),[busy,setBusy]=useState(false),[original,setOriginal]=useState<{blob:Blob;provider:Provider}|null>(null),[result,setResult]=useState<MotionResult|null>(null),[url,setURL]=useState(''),[adding,setAdding]=useState(false);
 const applied=!!result&&isApplied(result),appliedStatus='Motion applied and saved on this device. Customize your wallpaper now; the original photo is kept.';
 const displayStatus=result&&!applied&&status===appliedStatus?(project.id===result.projectId?'Retained motion is available. Apply it to this wallpaper again.':'Retained motion belongs to another wallpaper. Return there to apply it.'):status;
 const job=useRef<AbortController|null>(null),mounted=useRef(false),addingRef=useRef(false),eligible=source?.kind==='image'&&!source.locked&&source.opacity>0,duration=provider==='wan'?wanDuration:Number(customDuration);
 const issue=provider==='custom'?connectionIssue(connection,key,location.origin):'',validDuration=Number.isFinite(duration)&&duration>=.1&&duration<=30;
 let boundary='';try{if(connection.endpoint){const b=apiBoundary(connection,'',location.origin);boundary=b.origin+b.prefix;}}catch{/* The actionable connection validation is shown below. */}
 useEffect(()=>{if(source)setPrompt(promptDrafts.current.get(source.asset)||sceneMotion(source.asset).prompt);},[source?.asset]);
 const editPrompt=(value:string)=>{setPrompt(value);if(source)promptDrafts.current.set(source.asset,value);};
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;job.current?.abort();};},[]);
 useEffect(()=>{if(!original){setURL('');return;}const u=URL.createObjectURL(original.blob);setURL(u);return()=>URL.revokeObjectURL(u);},[original]);
 const clear=()=>{job.current?.abort();setKey('');setConnection({...DEFAULT_CONNECTION});setStatus('Connection and key cleared from this page session.');};
 async function generate(){
  if(job.current||addingRef.current||!eligible||issue||!validDuration||!prompt.trim())return;
  const controller=new AbortController(),chosen=provider,seconds=duration,text=prompt,personalKey=key,config={...connection};job.current=controller;setBusy(true);setResult(null);setOriginal(null);setStatus('Preparing selected photo crop…');
  try{
   const prepared=await sourceImage(chosen);controller.signal.throwIfAborted();const update=(value:string)=>{if(mounted.current&&!controller.signal.aborted)setStatus(value);};
   const blob=chosen==='wan'?(await generateWan({image:imageBlob(prepared.image),prompt:text,duration:seconds,signal:controller.signal,status:update})).blob:await generateCustom({connection:config,key:personalKey,image:prepared.image,prompt:text,duration:seconds,signal:controller.signal,status:update,localOrigin:location.origin});
   controller.signal.throwIfAborted();if(mounted.current){setOriginal({blob,provider:chosen});setStatus('Decoding the generated original…');}
   const asset=await validateVideo(blob,chosen==='wan'?'Wan motion':'Your API motion',undefined,controller.signal);controller.signal.throwIfAborted();
   if(chosen==='wan'&&(asset.width!==832||asset.height!==480))throw Error('Wan returned unexpected dimensions. Keep the original download; this result cannot safely use the prepared framing.');
   if(mounted.current){const ready={id:crypto.randomUUID(),asset,source:prepared.source,projectId:prepared.projectId,appearanceId:prepared.appearanceId,provider:chosen,requestedDuration:seconds};setResult(ready);await add(ready);}
  }catch(e){if(mounted.current)setStatus(controller.signal.aborted?`Stopped waiting for ${name(chosen)}. Server cancellation is not guaranteed; a submitted job may still run${chosen==='custom'?' and be charged':''}.`:e instanceof DOMException&&e.name==='TimeoutError'?`${name(chosen)} timed out. The remote job may still run. No generation was retried.`:e instanceof Error?e.message:'Generation failed. Provider details are hidden.');}
  finally{if(job.current===controller)job.current=null;if(mounted.current)setBusy(false);}
 }
 async function add(value=result){if(!value||addingRef.current||isApplied(value))return;addingRef.current=true;setAdding(true);try{await insert(value);if(mounted.current){setStatus(appliedStatus);}}catch(e){if(mounted.current)setStatus(e instanceof Error?e.message:'Could not save the video. Download the original to keep it.');}finally{addingRef.current=false;if(mounted.current)setAdding(false);}}
 const edit=(field:keyof ApiConnection,value:string|boolean)=>setConnection(v=>({...v,[field]:value}));
 return <><section className="p-section p-ai" hidden={!visible} aria-label="AI motion panel">
  <h2>Animate your wallpaper</h2><p className="p-hint">Generated motion applies here automatically. Your original photo and editable look are kept.</p>
  <label className="p-field">Connection<select aria-label="Generation provider" value={provider} disabled={adding} onChange={e=>{job.current?.abort();setProvider(e.target.value as Provider);}}><option value="wan">Wan · free shared quota</option><option value="custom">Your API</option></select></label>
  <p className="p-ai-source">Source: {eligible?source!.name:'Select a visible, unlocked photograph'}</p>
  {provider==='wan'?<p className="p-hint">Free trial on a shared Wan demo: no key or card. Shared queue, daily limits and availability vary; no guaranteed allocation, automatic retries or paid fallback. Your crop and prompt go to the public service.</p>:<>
   <label className="p-field">Generation endpoint<input type="url" aria-label="Generation endpoint" autoComplete="off" spellCheck={false} value={connection.endpoint} disabled={busy} onChange={e=>edit('endpoint',e.target.value)}/></label>
   <label className="p-field">API key<input type="password" aria-label="API key" autoComplete="off" spellCheck={false} value={key} disabled={busy} onChange={e=>setKey(e.target.value)}/></label>
   <label className="p-field">Model · optional<input aria-label="API model" autoComplete="off" spellCheck={false} maxLength={160} value={connection.model} disabled={busy} onChange={e=>edit('model',e.target.value)}/></label>
   <button onClick={clear}>Clear connection</button><p className="p-hint">Key and settings stay in this page session, including while panels change. Reload or Clear connection removes them and stops local waiting. Your service may charge for a submitted job.</p>
   <details className="p-api-format"><summary>API format</summary><fieldset disabled={busy}><p className="p-hint">JSON POST by default: model, prompt, numeric duration and image data URL. The endpoint must match this format and allow browser CORS. A key cannot identify a service. Multipart and service-specific protocols need another adapter; support for every service is not promised.</p>
    <label className="p-field">JSON request template<textarea aria-label="JSON request template" rows={8} spellCheck={false} maxLength={65536} value={connection.template} onChange={e=>edit('template',e.target.value)}/></label>
    <p className="p-hint">Safe value placeholders: {'{{model}}, {{prompt}}, {{duration}}, {{image_data_url}}, {{image_base64}}'}. An exact duration placeholder becomes a number. No code or key placeholder is executed.</p>
    {FORMAT_FIELDS.map(([field,label,hint])=><label className="p-field" key={field}>{label}<input aria-label={label} autoComplete="off" spellCheck={false} value={String(connection[field])} maxLength={field.endsWith('Template')?4096:1024} onChange={e=>edit(field,e.target.value)}/>{hint&&<small>{hint}</small>}</label>)}
    <p className="p-hint">Field paths use dots and array indexes, for example output.0.url; blank disables a mapping. Job URL templates accept {'{{id}}'} only. Default states: queued/pending/running/processing → completed/succeeded/success/done. Results: video.url or video.base64, optionally video.mime_type; poll_url/result_url for queued work. Direct MP4/WebM responses also work.</p>
    {['localhost','127.0.0.1','[::1]'].includes(location.hostname)&&<label className="p-check"><input type="checkbox" aria-label="Allow same-origin localhost development" checked={connection.allowLocalhost} onChange={e=>edit('allowLocalhost',e.target.checked)}/>Allow HTTP on this exact local development origin</label>}
   </fieldset></details>
   <p className="p-hint">Authenticated requests stay within the configured endpoint origin and API path. Media downloads use no credentials. Redirects are disabled; browser access and API-format compatibility are required.</p>
   {boundary&&<p className="p-hint">Authentication boundary: endpoint origin and {connection.trustPath||'its directory'}.</p>}
   {issue&&<p className="p-hint" role="status" aria-label="API connection validation">{issue}</p>}
  </>}
  <label className="p-field">Calm motion example<select aria-label="Calm motion example" defaultValue="calm" disabled={busy} onChange={e=>editPrompt(prompts[e.target.value as keyof typeof prompts])}><option value="calm">Selective calm movement</option><option value="forest">Forest · light breeze and mist</option><option value="rain">Rain · subtle puddle ripples</option><option value="coast">Coast · slow small waves</option><option value="waterfall">Clouds &amp; waterfall · natural motion</option><option value="neon">Cyan &amp; magenta · light through mist</option></select></label>
  <label className="p-field">Motion prompt<textarea aria-label="AI motion prompt" rows={5} maxLength={2400} value={prompt} disabled={busy} onChange={e=>editPrompt(e.target.value)}/></label>
  {provider==='wan'?<label className="p-field">Duration<select aria-label="AI video duration" value={wanDuration} disabled={busy} onChange={e=>setWanDuration(Number(e.target.value))}><option value={.5}>0.5 seconds · quick check</option><option value={1}>1 second</option><option value={2}>2 seconds</option><option value={4}>4 seconds</option></select></label>:<label className="p-field">Duration · seconds<input type="number" aria-label="API video duration" min={.1} max={30} step={.1} value={customDuration} disabled={busy} onChange={e=>setCustomDuration(e.target.value)}/></label>}
  <details className="animation-quality"><summary>Quality &amp; source details</summary><p className="p-hint">The neutral source crop is fitted with matte padding into {provider==='wan'?'832 × 480':'1280 × 720'}. The service must preserve that framing. Insertion removes padding; rotation, flips, grading and masks stay editable. Wan has known 16 fps source cadence; Your API cadence is unknown. Larger exports do not add source detail. Drift, ghosting and visible joins can remain.</p></details>
  <button className="p-primary p-wide" disabled={busy||adding||!!issue||!validDuration||!prompt.trim()||!eligible} onClick={()=>void generate()}>{provider==='wan'?'Generate with free Wan':'Generate with Your API'}</button>
  {busy&&<button className="p-wide" onClick={()=>job.current?.abort()}>Stop waiting</button>}
  <p className="p-hint" role="status" aria-label="AI generation status">{displayStatus}</p>
  {original&&<button className="p-wide" onClick={()=>download(original.blob,`stillwild-${original.provider}-original.${original.blob.type==='video/mp4'?'mp4':'webm'}`)}>Download generated original</button>}
  {original&&<div className="p-ai-result"><h3>{name(original.provider)} original</h3>{url&&<video src={url} controls muted playsInline preload="metadata" aria-label="Generated video preview"/>}{result&&<><p className="p-hint">{result.asset.width} × {result.asset.height} · {result.asset.duration?.toFixed(2)}s · {result.provider==='wan'?'known 16 fps; optional source-frame blending':'source FPS unknown'}. Original media stays intact; source audio is muted. Export is silent unless Include sound is chosen.</p><button className="p-primary p-wide" disabled={adding||busy||applied} onClick={()=>void add()}>{applied?'Motion applied':'Apply retained motion'}</button></>}<button className="p-wide" disabled={busy||adding} onClick={()=>{setResult(null);setOriginal(null);setStatus('Result dismissed.');}}>Dismiss result</button></div>}
 </section>{!visible&&(busy||original&&!applied)&&<button className="motion-session-notice" onClick={onOpen}>{busy?'Animation in progress · view status':'Retained motion result · review / apply'}</button>}</>;
}
