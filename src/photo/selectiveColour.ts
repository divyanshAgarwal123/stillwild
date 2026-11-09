export type SelectiveColour={enabled:boolean;source:string;target:string;range:number;softness:number;strength:number};
export const DEFAULT_SELECTIVE_COLOUR:SelectiveColour={enabled:false,source:'#ff486f',target:'#8b45ff',range:40,softness:18,strength:100};
export function validateSelectiveColour(value:unknown):SelectiveColour{
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid selective colour adjustment.');
 const o=value as Record<string,unknown>;
 if(Object.keys(o).some(k=>!Object.hasOwn(DEFAULT_SELECTIVE_COLOUR,k))||typeof o.enabled!=='boolean')throw Error('Invalid selective colour switch or field.');
 for(const k of ['source','target'])if(typeof o[k]!=='string'||!/^#[0-9a-f]{6}$/i.test(o[k] as string))throw Error('Selective colour needs six-digit colours.');
 for(const [k,max]of [['range',180],['softness',90],['strength',100]] as const)if(typeof o[k]!=='number'||!Number.isFinite(o[k])||o[k]<0||o[k]>max)throw Error('Selective colour values are outside their supported range.');
 return {enabled:o.enabled,source:o.source as string,target:o.target as string,range:o.range as number,softness:o.softness as number,strength:o.strength as number};
}
export function rgbHSV(r:number,g:number,b:number):[number,number,number]{
 const v=Math.max(r,g,b),lo=Math.min(r,g,b),d=v-lo;
 const h=d===0?0:v===r?((g-b)/d+6)%6:v===g?(b-r)/d+2:(r-g)/d+4;
 return [h/6,v===0?0:d/v,v];
}
export function hsvRGB(h:number,s:number,v:number):[number,number,number]{
 const n=((h%1)+1)%1*6,c=v*s,x=c*(1-Math.abs(n%2-1)),m=v-c;
 const q=n<1?[c,x,0]:n<2?[x,c,0]:n<3?[0,c,x]:n<4?[0,x,c]:n<5?[x,0,c]:[c,0,x];
 return [q[0]+m,q[1]+m,q[2]+m];
}
const colourHSV=(hex:string)=>rgbHSV(parseInt(hex.slice(1,3),16)/255,parseInt(hex.slice(3,5),16)/255,parseInt(hex.slice(5,7),16)/255);
export type SelectiveParams={source:number;target:number;range:number;softness:number;strength:number};
export function selectiveParams(edit:SelectiveColour|undefined,before=false):SelectiveParams|null{
 if(before||!edit?.enabled||edit.strength===0)return null;
 const a=colourHSV(edit.source),b=colourHSV(edit.target);
 // Grey wells have no meaningful hue: deliberately leave pixels unchanged.
 if(a[1]<.08||b[1]<.08)return null;
 return {source:a[0],target:b[0],range:edit.range/360,softness:edit.softness/360,strength:edit.strength/100};
}
const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function selectivePixel(r:number,g:number,b:number,p:SelectiveParams|null):[number,number,number]{
 if(!p)return [r,g,b];
 const hsv=rgbHSV(Math.max(0,Math.min(1,r)),Math.max(0,Math.min(1,g)),Math.max(0,Math.min(1,b)));
 const distance=Math.abs(((hsv[0]-p.source+.5)%1+1)%1-.5);
 const match=p.softness>0?1-smooth(p.range,p.range+p.softness,distance):distance<=p.range?1:0;
 const weight=match*smooth(.08,.25,hsv[1])*p.strength;
 if(weight===0)return [r,g,b];
 const delta=((p.target-hsv[0]+.5)%1+1)%1-.5;
 return hsvRGB(hsv[0]+delta*weight,hsv[1],hsv[2]);
}
// Same HSV math, circular distance, grey protection and stage as the CPU path.
export const SELECTIVE_COLOUR_GLSL=`
uniform float selectiveSource,selectiveTarget,selectiveRange,selectiveSoftness,selectiveStrength;
vec3 scHSV(vec3 c){float v=max(max(c.r,c.g),c.b),lo=min(min(c.r,c.g),c.b),d=v-lo,h=0.;if(d>0.){if(v==c.r)h=mod((c.g-c.b)/d+6.,6.);else if(v==c.g)h=(c.b-c.r)/d+2.;else h=(c.r-c.g)/d+4.;}return vec3(h/6.,v==0.?0.:d/v,v);}
vec3 scRGB(vec3 hsv){vec3 p=abs(fract(hsv.xxx+vec3(0.,2./3.,1./3.))*6.-3.);return hsv.z*mix(vec3(1.),clamp(p-1.,0.,1.),hsv.y);}
vec3 selectiveColour(vec3 c){if(selectiveStrength<=0.)return c;vec3 hsv=scHSV(clamp(c,0.,1.));float distance=abs(mod(hsv.x-selectiveSource+.5,1.)-.5);float match=selectiveSoftness>0.?1.-smoothstep(selectiveRange,selectiveRange+selectiveSoftness,distance):(distance<=selectiveRange?1.:0.);float weight=match*smoothstep(.08,.25,hsv.y)*selectiveStrength;if(weight<=0.)return c;float delta=mod(selectiveTarget-hsv.x+.5,1.)-.5;hsv.x=fract(hsv.x+delta*weight);return scRGB(hsv);}
`;
