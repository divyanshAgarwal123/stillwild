// A bounded, seamless density tile; the same field is used by preview and export.
const tiles=new Map<number,Float32Array>();
const smooth=(v:number)=>v*v*(3-2*v);
const wrap=(v:number,n:number)=>(v%n+n)%n;
export function mistTile(seed:number){
 let tile=tiles.get(seed);if(tile)return tile;tile=new Float32Array(256*256);
 const random=(x:number,y:number,n:number)=>{const v=Math.sin(wrap(x,n)*127.1+wrap(y,n)*311.7+seed*31.7)*43758.5453;return v-Math.floor(v);};
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){let value=0,weight=0;for(let octave=0;octave<5;octave++){const n=4*2**octave,px=x/256*n,py=y/256*n,ix=Math.floor(px),iy=Math.floor(py),fx=smooth(px-ix),fy=smooth(py-iy),a=random(ix,iy,n)*(1-fx)+random(ix+1,iy,n)*fx,b=random(ix,iy+1,n)*(1-fx)+random(ix+1,iy+1,n)*fx,w=2**(-octave*.85);value+=(a*(1-fy)+b*fy)*w;weight+=w;}tile[y*256+x]=value/weight;}
 if(tiles.size>=4)tiles.delete(tiles.keys().next().value!);tiles.set(seed,tile);return tile;
}
function sample(tile:Float32Array,x:number,y:number){x=wrap(x*256,256);y=wrap(y*256,256);const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,a=tile[iy*256+ix]*(1-fx)+tile[iy*256+(ix+1)%256]*fx,b=tile[((iy+1)%256)*256+ix]*(1-fx)+tile[((iy+1)%256)*256+(ix+1)%256]*fx;return a*(1-fy)+b*fy;}
export type MistOptions={amount:number;angle:number;cycles:number;scale:number;placement?:'sky'|'valley'|'full';height?:number;falloff?:number};
export function mistDensity(tile:Float32Array,x:number,y:number,phase:number,w:MistOptions){
 const t=wrap(phase*w.cycles,1),blend=smooth(t),angle=w.angle*Math.PI/180,dx=Math.cos(angle)*.6,dy=Math.sin(angle)*.6,size=1.2+(100-w.scale)/35;
 const a=sample(tile,x*size-dx*t,y*size*.65-dy*t),b=sample(tile,x*size-dx*(t-1),y*size*.65-dy*(t-1));
 const density=Math.max(0,Math.min(1,((a*(1-blend)+b*blend)-.33)/.38));
 const center=(w.height??(w.placement==='valley'?65:28))/100,spread=.08+(w.falloff??55)/100*.5;
 const spatial=w.placement==='full'?1:Math.exp(-(((y-center)/spread)**2)*2);
 // Feather all outside edges; no rectangular clipping boundaries.
 const edge=smooth(Math.min(1,Math.max(0,Math.min(x,1-x)*14)));
 return density*density*spatial*edge*w.amount/100*.62;
}
