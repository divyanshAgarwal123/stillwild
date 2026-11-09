// Trim Opus encoder tail padding in the finalized local WebM. Video packets are
// untouched. Rebuild cluster/cue sizes and positions after adding DiscardPadding.
// The installed muxer emits codec delay but not this final audio trim metadata.
export function finishAudioWebm(buffer:ArrayBuffer,seconds:number):Blob{
 const bytes=new Uint8Array(buffer);if(bytes.length>128*1024*1024||!Number.isFinite(seconds)||seconds<=0)throw Error('Sound export exceeded its bounds.');
 type E={id:number;at:number;start:number;end:number};
 const vint=(at:number,id=false)=>{const first=bytes[at];if(!first)throw Error('Invalid sound WebM.');let n=1,mask=128;while(!(first&mask)){mask>>=1;if(++n>8)throw Error('Invalid sound WebM.');}let value=id?first:first&(mask-1);for(let i=1;i<n;i++)value=value*256+bytes[at+i];return{n,value};};
 const read=(at:number):E=>{const id=vint(at,true),size=vint(at+id.n),start=at+id.n+size.n,end=start+size.value;if(end>bytes.length)throw Error('Invalid sound WebM size.');return{id:id.value,at,start,end};};
 const children=(e:E)=>{const list:E[]=[];for(let at=e.start;at<e.end;){const n=read(at);list.push(n);at=n.end;}return list;};
 const uint=(e:E)=>{let v=0;for(let i=e.start;i<e.end;i++)v=v*256+bytes[i];return v;};
 const raw=(e:E)=>bytes.slice(e.at,e.end),cat=(list:Uint8Array[])=>{const out=new Uint8Array(list.reduce((n,a)=>n+a.length,0));let at=0;for(const a of list){out.set(a,at);at+=a.length;}return out;};
 const integer=(v:number)=>{const result=[];do{result.unshift(v%256);v=Math.floor(v/256);}while(v>0);return Uint8Array.from(result);};
 const element=(id:number,data:Uint8Array)=>{let n=1;while(data.length>=2**(7*n)-1)n++;const size=new Uint8Array(n);let value=data.length;for(let i=n-1;i>=0;i--){size[i]=value%256;value=Math.floor(value/256);}size[0]|=1<<(8-n);return cat([integer(id),size,data]);};
 let segment:E|undefined;const prefix=[];for(let at=0;at<bytes.length;){const e=read(at);if(e.id===0x18538067){segment=e;break;}prefix.push(raw(e));at=e.end;}if(!segment)throw Error('Missing sound WebM segment.');const top=children(segment),tracks=top.find(e=>e.id===0x1654ae6b),info=top.find(e=>e.id===0x1549a966);if(!tracks||!info)throw Error('Missing sound WebM tracks.');const scaleField=children(info).find(e=>e.id===0x2ad7b1),scale=scaleField?uint(scaleField):1000000;let audioTrack=0,delay=0;
 for(const entry of children(tracks)){const fields=children(entry),type=fields.find(e=>e.id===0x83),number=fields.find(e=>e.id===0xd7);if(type&&uint(type)===2&&number){audioTrack=uint(number);const d=fields.find(e=>e.id===0x56aa);delay=d?uint(d):0;}}
 if(!audioTrack)throw Error('Chosen sound was not encoded. Turn off Include sound for a silent loop.');
 const blockTrack=(e:E)=>vint(e.start).value;let last:{cluster:E;group:E;block:E;base:number;duration:number}|undefined;
 for(const cluster of top.filter(e=>e.id===0x1f43b675)){const items=children(cluster),time=items.find(e=>e.id===0xe7),base=time?uint(time):0;for(const item of items){const fields=item.id===0xa0?children(item):[],block=item.id===0xa3?item:fields.find(e=>e.id===0xa1);if(block&&blockTrack(block)===audioTrack){const duration=fields.find(e=>e.id===0x9b);last={cluster,group:item,block,base,duration:duration?uint(duration):0};}}}
 if(!last||!last.duration)throw Error('Cannot determine final sound packet duration. Try a silent export.');const relative=new DataView(bytes.buffer).getInt16(last.block.start+vint(last.block.start).n),end=(last.base+relative+last.duration)*scale-delay,padding=Math.round(end-seconds*1e9);if(padding<0||padding>=last.duration*scale)throw Error('Sound could not keep the chosen loop duration. Try a silent export.');
 // Signed integer: positive means discard samples from the end of the last packet.
 let paddingBytes=integer(padding);if(paddingBytes[0]&128)paddingBytes=cat([Uint8Array.of(0),paddingBytes]);
 const replacements=new Map<number,Uint8Array>();if(padding){const fields=last.group.id===0xa0?children(last.group).filter(e=>e.id!==0x75a2).map(raw):[element(0xa1,bytes.slice(last.block.start,last.block.end))];replacements.set(last.group.at,element(0xa0,cat([...fields,element(0x75a2,paddingBytes)])));}
 const duration=new Uint8Array(8);new DataView(duration.buffer).setFloat64(0,seconds*1e9/scale);replacements.set(info.at,element(info.id,cat([...children(info).filter(e=>e.id!==0x4489).map(raw),element(0x4489,duration)])));
 const parts:Uint8Array[]=[],positions=new Map<number,number>();let offset=0;for(const e of top){if(e.id===0x114d9b74||e.id===0x1c53bb6b)continue;let value:Uint8Array;if(e.id===0x1f43b675){positions.set(e.at-segment.start,offset);value=element(e.id,cat(children(e).map(child=>replacements.get(child.at)||raw(child))));}else value=replacements.get(e.at)||raw(e);parts.push(value);offset+=value.length;}
 const cues=top.find(e=>e.id===0x1c53bb6b);if(cues){const rewrite=(e:E):Uint8Array=>{if(e.id===0xf1){const position=positions.get(uint(e));if(position===undefined)throw Error('Sound WebM cue could not be rebuilt.');return element(e.id,integer(position));}if([0x1c53bb6b,0xbb,0xb7].includes(e.id))return element(e.id,cat(children(e).map(rewrite)));return raw(e);};parts.push(rewrite(cues));}
 return new Blob([...prefix,element(segment.id,cat(parts))] as BlobPart[],{type:'video/webm'});
}
