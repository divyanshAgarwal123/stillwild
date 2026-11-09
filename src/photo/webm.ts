export const VIDEO_TIMING_ERROR='Video could not keep project timing on this device. No file was saved. Try a lighter composition or turn source-frame blending off.';

// Inspect real encoded block timestamps before adding seekable metadata. A
// Duration field cannot shorten a MediaRecorder stream recorded too slowly.
export async function webmTimeline(blob:Blob){
 if(blob.size>128*1024*1024)throw Error(VIDEO_TIMING_ERROR);
 const bytes=new Uint8Array(await blob.arrayBuffer());let scale=1_000_000,defaultDuration=0,videoTrack:number|null=null;
 const times:{time:number;duration:number}[]=[];
 function vint(at:number,id=false){const first=bytes[at];if(!first)throw Error(VIDEO_TIMING_ERROR);let length=1,mask=128;while(!(first&mask)){mask>>=1;if(++length>8)throw Error(VIDEO_TIMING_ERROR);}if(at+length>bytes.length)throw Error(VIDEO_TIMING_ERROR);let value=id?first:first&(mask-1),unknown=!id&&(first&(mask-1))===mask-1;for(let i=1;i<length;i++){value=value*256+bytes[at+i];unknown=unknown&&bytes[at+i]===255;}return{length,value,unknown};}
 function element(at:number,end:number){const id=vint(at,true),size=vint(at+id.length),start=at+id.length+size.length,stop=size.unknown?end:start+size.value;if(start>end||stop>end)throw Error(VIDEO_TIMING_ERROR);return{id:id.value,start,end:stop,unknown:size.unknown};}
 function uint(start:number,end:number){let value=0;for(let i=start;i<end;i++)value=value*256+bytes[i];return value;}
 function block(start:number,end:number,base:number,duration=0){const track=vint(start),at=start+track.length;if(at+3>end)throw Error(VIDEO_TIMING_ERROR);if(videoTrack!==null&&track.value!==videoTrack)return;const relative=new DataView(bytes.buffer).getInt16(at);times.push({time:base+relative,duration});}
 function children(start:number,end:number,kind:'segment'|'info'|'tracks'|'track'|'cluster',base=0):number{
  let at=start,trackNumber=0,trackType=0,trackDuration=0;
  while(at<end){const e=element(at,end);
   if(kind==='cluster'&&[0x1f43b675,0x1549a966,0x1654ae6b,0x1c53bb6b,0x114d9b74].includes(e.id))return at;
   if(e.id===0x1549a966)children(e.start,e.end,'info');
   else if(e.id===0x1654ae6b)children(e.start,e.end,'tracks');
   else if(kind==='tracks'&&e.id===0xae)children(e.start,e.end,'track');
   else if(kind==='info'&&e.id===0x2ad7b1)scale=uint(e.start,e.end);
   else if(kind==='track'&&e.id===0xd7)trackNumber=uint(e.start,e.end);
   else if(kind==='track'&&e.id===0x83)trackType=uint(e.start,e.end);
   else if(kind==='track'&&e.id===0x23e383)trackDuration=uint(e.start,e.end);
   else if(e.id===0x1f43b675){at=children(e.start,e.end,'cluster');continue;}
   else if(kind==='cluster'&&e.id===0xe7)base=uint(e.start,e.end);
   else if(kind==='cluster'&&e.id===0xa3)block(e.start,e.end,base);
   else if(kind==='cluster'&&e.id===0xa0){let child=e.start,content:ReturnType<typeof element>|undefined,duration=0;while(child<e.end){const item=element(child,e.end);if(item.id===0xa1)content=item;if(item.id===0x9b)duration=uint(item.start,item.end);child=item.end;}if(content)block(content.start,content.end,base,duration);}
   if(e.unknown)throw Error(VIDEO_TIMING_ERROR);at=e.end;
  }if(kind==='track'&&trackType===1){videoTrack=trackNumber;defaultDuration=trackDuration;}return at;
 }
 let at=0,segment=false;while(at<bytes.length){const e=element(at,bytes.length);if(e.id===0x18538067){children(e.start,e.end,'segment');segment=true;break;}at=e.end;}
 if(!segment||!times.length||!Number.isFinite(scale)||scale<=0)throw Error(VIDEO_TIMING_ERROR);
 const seconds=times.map(p=>({pts:p.time*scale/1e9,duration:p.duration?p.duration*scale/1e9:defaultDuration/1e9}));
 return {first:seconds[0].pts,last:seconds.at(-1)!.pts,lastEnd:seconds.at(-1)!.pts+seconds.at(-1)!.duration,frames:seconds.length,increasing:seconds.every((p,i)=>i===0||p.pts>seconds[i-1].pts)};
}
export async function assertWebmTimeline(blob:Blob,seconds:number,fps=24){
 const timing=await webmTimeline(blob),frame=1/fps;
 if(!Number.isFinite(seconds)||seconds<=0||!timing.increasing||timing.frames<2||timing.first<0||timing.first>frame||timing.last<seconds-2*frame||timing.lastEnd>seconds+frame)throw Error(VIDEO_TIMING_ERROR);
 return timing;
}

// MediaRecorder's streaming WebM omits Duration. Fill its Segment Info without
// touching frame data, so local players can seek and display the selected loop.
export async function webmDuration(blob:Blob,seconds:number):Promise<Blob>{
 const bytes=new Uint8Array(await blob.slice(0,65536).arrayBuffer());
 function vint(at:number,id=false){const first=bytes[at];if(!first)throw Error('Invalid EBML');let length=1,mask=128;while(!(first&mask)){mask>>=1;length++;if(length>8)throw Error('Invalid EBML');}let value=id?first:first&(mask-1),unknown=!id&&(first&(mask-1))===mask-1;for(let i=1;i<length;i++){value=value*256+bytes[at+i];unknown=unknown&&bytes[at+i]===255;}return{length,value,unknown};}
 try{let at=0,segment=-1;while(at<bytes.length){const id=vint(at,true),size=vint(at+id.length),start=at+id.length+size.length;if(id.value===0x18538067){if(!size.unknown)return blob;segment=start;break;}at=start+size.value;}if(segment<0)return blob;at=segment;while(at<bytes.length){const id=vint(at,true),size=vint(at+id.length),start=at+id.length+size.length;if(id.value===0x114d9b74||id.value===0x1f43b675)return blob;if(id.value===0x1549a966){let child=start,scale=1_000_000,existing=-1;while(child<start+size.value){const ci=vint(child,true),cs=vint(child+ci.length),data=child+ci.length+cs.length;if(ci.value===0x2ad7b1){scale=0;for(let i=0;i<cs.value;i++)scale=scale*256+bytes[data+i];}if(ci.value===0x4489&&cs.value===8)existing=data;child=data+cs.value;}const duration=new Uint8Array(11);duration.set([0x44,0x89,0x88]);new DataView(duration.buffer).setFloat64(3,seconds*1e9/scale);if(existing>=0)return new Blob([blob.slice(0,existing),duration.subarray(3),blob.slice(existing+8)],{type:blob.type});const newSize=size.value+11;if(newSize>=2**(7*size.length)-1)return blob;const encoded=new Uint8Array(size.length);let value=newSize;for(let i=size.length-1;i>=0;i--){encoded[i]=value%256;value=Math.floor(value/256);}encoded[0]|=1<<(8-size.length);return new Blob([blob.slice(0,at+id.length),encoded,blob.slice(start,start+size.value),duration,blob.slice(start+size.value)],{type:blob.type});}if(size.unknown)break;at=start+size.value;}return blob;}catch{return blob;}
}
