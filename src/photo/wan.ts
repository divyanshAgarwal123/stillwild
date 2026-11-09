import type {Client} from '@gradio/client';

export const WAN_HOST='https://zerogpu-aoti-wan2-2-fp8da-aoti-faster.hf.space';
export const WAN_OPTIONS={events:['data','status'] as ('data'|'status')[],credentials:'omit' as const,record_history:false};
const MAX_VIDEO=32*1024*1024;
type Job=ReturnType<Client['submit']>;
type Options={image:Blob;prompt:string;duration:number;signal:AbortSignal;status:(message:string)=>void;timeoutMs?:number;connect?:()=>Promise<Client>;fetcher?:typeof fetch};

export function wanInputs(image:unknown,prompt:string,duration:number){
 if(!prompt.trim()||prompt.length>2400||![.5,1,2,4].includes(duration))throw Error('Enter a motion prompt and choose 0.5, 1, 2 or 4 seconds.');
 return [image,prompt.trim(),6,'camera shake, fast movement, cuts, new objects, text, distortion',duration,1,1,1708,false];
}
export function wanOutput(value:unknown){
 if(!Array.isArray(value)||value.length!==2||!Number.isInteger(value[1])||value[1]<0||value[1]>2147483647)throw Error('Wan returned an invalid video result.');
 let file=value[0];if(file&&typeof file==='object'&&'video' in file)file=file.video;
 if(!file||typeof file!=='object'||typeof file.url!=='string'||file.url.length>2048)throw Error('Wan returned no downloadable video.');
 const u=new URL(file.url);
 if(u.origin!==WAN_HOST||u.username||u.password||u.search||u.hash||!u.pathname.startsWith('/gradio_api/file=')||!u.pathname.endsWith('.mp4')||/%(?:2e|2f|5c)|\\|(?:^|\/)\.\.(?:\/|$)/i.test(u.pathname))throw Error('Wan returned an unsupported video URL.');
 if(file.size!==undefined&&file.size!==null&&(!Number.isFinite(file.size)||file.size<32||file.size>MAX_VIDEO))throw Error('Wan video exceeds the supported size.');
 if(file.mime_type&&file.mime_type!=='video/mp4')throw Error('Wan returned an unsupported video format.');
 return {url:u.href,seed:value[1] as number};
}
export function wanError(value:unknown){
 const text=typeof value==='string'?value:value instanceof Error?value.message:'';
 if(/quota|exceed|GPU.*(?:limit|duration)|daily|rate.limit|429/i.test(text))return Error('Free Wan daily GPU quota or rate limit reached. Wait for quota to reset; no job was retried.');
 if(/queue.*full|503/i.test(text))return Error('The shared Wan queue is full. Try again later; no job was retried.');
 if(/offline|sleep|paused|not found|404|unavailable/i.test(text))return Error('The public Wan demo is offline or unavailable. Try again later; no job was retried.');
 return Error('Wan could not complete this request. Check connectivity, browser CORS and demo availability. No job was retried.');
}
function abortable<T>(pending:Promise<T>,signal:AbortSignal):Promise<T>{
 return new Promise((resolve,reject)=>{const cancel=()=>reject(signal.reason);signal.addEventListener('abort',cancel,{once:true});if(signal.aborted)cancel();pending.then(resolve,reject).finally(()=>signal.removeEventListener('abort',cancel));});
}
export async function generateWan(options:Options){
 const {image,prompt,duration,status}=options;
 if(image.type!=='image/jpeg'||image.size<32||image.size>750000)throw Error('Wan needs a bounded JPEG source (up to 750 KB).');
 wanInputs(null,prompt,duration);
 const signal=AbortSignal.any([options.signal,AbortSignal.timeout(options.timeoutMs??600000)]),fetcher=options.fetcher??fetch;
 let client:Client|undefined,job:Job|undefined,finished=false;
 const stop=()=>{if(job&&!finished)void job.cancel().catch(()=>{});void job?.return?.();client?.close();};
 signal.addEventListener('abort',stop,{once:true});
 try{
  signal.throwIfAborted();status('Connecting to the public Wan demo…');
  const sdk=await import('@gradio/client');
  const pending=(options.connect?options.connect():sdk.Client.connect(WAN_HOST,{...WAN_OPTIONS})).then(c=>{if(signal.aborted){c.close();throw signal.reason;}return c;});
  client=await abortable(pending,signal);
  // SDK 2.7.2's cancel/reset requests omit credentials options. Enforce them
  // for every instance request and abort uploads before any late queue submit.
  const sdkFetch=client.fetch.bind(client);
  client.fetch=(input,init)=>{const url=String(input),cancel=/\/(cancel|reset)$/.test(url);if(!cancel)signal.throwIfAborted();if(url.includes('/upload'))status('Uploading the selected 832 × 480 crop…');return sdkFetch(input,{...init,credentials:'omit',redirect:'error',referrerPolicy:'no-referrer',signal:AbortSignal.any([...(init?.signal?[init.signal]:[]),cancel?AbortSignal.timeout(3000):signal])});};
  status('Preparing upload to the shared Wan queue…');
  job=client.submit('/generate_video',wanInputs(sdk.handle_file(image),prompt,duration));
  let output:ReturnType<typeof wanOutput>|undefined;
  for await(const event of { [Symbol.asyncIterator]:()=>({next:()=>abortable(job!.next(),signal),return:()=>job!.return!()}) }){
   signal.throwIfAborted();
   if(event.type==='status'){
    if(event.stage==='error'||event.success===false)throw wanError(event.message);
    if(event.stage==='pending')status(`Waiting in the shared Wan queue${Number.isFinite(event.position)?` · position ${event.position!+1}`:''}${Number.isFinite(event.eta)?` · estimated ${Math.ceil(event.eta!)}s`:''}…`);
    if(event.stage==='generating'||event.stage==='streaming')status('Wan is generating motion…');
   }
   if(event.type==='data')output=wanOutput(event.data);
  }
  if(!output)throw Error('Wan returned no downloadable video.');
  finished=true;client.close();status('Downloading the generated original…');
  const response=await fetcher(output.url,{signal,credentials:'omit',redirect:'error',referrerPolicy:'no-referrer'});
  if(!response.ok)throw wanError(String(response.status));
  if(Number(response.headers.get('content-length'))>MAX_VIDEO){await response.body?.cancel();throw Error('Wan video exceeds 32 MB.');}
  if(!response.body)throw Error('Wan returned an empty video.');
  const reader=response.body.getReader(),chunks:Uint8Array<ArrayBuffer>[]=[];let size=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_VIDEO)throw Error('Wan video exceeds 32 MB.');chunks.push(value);}}finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
  if(size<32)throw Error('Wan returned an empty video.');
  return {blob:new Blob(chunks,{type:'video/mp4'}),seed:output.seed};
 }catch(error){if(signal.aborted)throw signal.reason;if(error instanceof Error&&/^Wan |^Free Wan |^The (shared|public) Wan/.test(error.message))throw error;throw wanError(error);}
 finally{signal.removeEventListener('abort',stop);stop();}
}
