import { PALETTES, seeded } from './model';
import type { ArtObject, Composition } from './model';
import { drawCover, getBackplate, environmentReady } from './assets';

export const ART_WIDTH = 1600;
export const ART_HEIGHT = 900;
const shapes = new Map<string, Path2D>();
let paper: HTMLCanvasElement | null = null;

function paperTexture() {
  if (paper) return paper;
  paper = document.createElement('canvas'); paper.width=480; paper.height=480;
  const c = paper.getContext('2d')!;
  const image = c.createImageData(480,480); const random = seeded(218);
  for(let i=0;i<image.data.length;i+=4) {
    const v = random()>.5 ? 255 : 30;
    image.data[i]=v; image.data[i+1]=v; image.data[i+2]=v;
    image.data[i+3]=Math.floor(random()*22);
  }
  c.putImageData(image,0,0);
  c.strokeStyle='rgba(90,74,48,.045)'; c.lineWidth=.5;
  for(let i=0;i<1400;i++) { const x=random()*480,y=random()*480;c.beginPath();c.moveTo(x,y);c.lineTo(x+random()*7-3,y+random()*4);c.stroke(); }
  return paper;
}
function leaf(p:Path2D,x:number,y:number,len:number,width:number,angle:number) {
  const dx=Math.cos(angle),dy=Math.sin(angle),nx=-dy,ny=dx;
  p.moveTo(x,y);
  p.bezierCurveTo(x+dx*len*.25+nx*width,y+dy*len*.25+ny*width,x+dx*len*.8+nx*width*.5,y+dy*len*.8+ny*width*.5,x+dx*len,y+dy*len);
  p.bezierCurveTo(x+dx*len*.8-nx*width*.45,y+dy*len*.8-ny*width*.45,x+dx*len*.25-nx*width,y+dy*len*.25-ny*width,x,y);
}
function stem(p:Path2D,x:number,y:number,tx:number,ty:number,width=3) {
  p.moveTo(x-width,y);p.quadraticCurveTo((x+tx)*.5-15,(y+ty)*.5,tx,ty);p.quadraticCurveTo((x+tx)*.5-9,(y+ty)*.5,x+width,y);p.closePath();
}
export function objectShape(o: ArtObject):Path2D {
  const key=`${o.kind}-${o.seed}`;if(shapes.has(key))return shapes.get(key)!;
  const p=new Path2D(),random=seeded(o.seed);
  if(o.kind==='fern') {
    for(let frond=0;frond<7;frond++) {
      const direction=-2.7+frond*.37, length=360+random()*240;
      const tx=Math.cos(direction)*length,ty=Math.sin(direction)*length;
      stem(p,0,0,tx,ty,2.8);
      for(let j=1;j<21;j++) {
        const t=j/22,x=tx*t-14*Math.sin(t*Math.PI),y=ty*t;
        const ll=(Math.sin(t*Math.PI)**.72)*(60+random()*17)*(length/500);
        for(const side of [-1,1]) {
          const a=direction+side*(.85+random()*.15);
          leaf(p,x,y,ll,7*(1-t)+1.5,a);
        }
      }
    }
  } else if(o.kind==='olive'||o.kind==='eucalyptus') {
    for(let b=0;b<5;b++) {
      const tx=(b-1.6)*85+(random()-.5)*70,ty=-390-random()*270;
      stem(p,0,0,tx,ty,3.1);
      for(let j=1;j<10;j++) {
        const t=j/10, x=tx*t-10*Math.sin(t*Math.PI),y=ty*t;
        for(const side of [-1,1]) {
          const len=34+random()*37,a=-Math.PI/2+side*(.75+random()*.5);
          const endX=x+Math.cos(a)*len*.7,endY=y+Math.sin(a)*len*.7;
          stem(p,x,y,endX,endY,.9);
          leaf(p,endX,endY,len,o.kind==='olive'?12+random()*6:23+random()*9,a);
        }
      }
    }
  } else if(o.kind==='grass') {
    for(let b=0;b<15;b++) {
      const tx=(random()-.5)*370,ty=-230-random()*230;
      stem(p,0,0,tx,ty,1.5);
      for(let j=0;j<6;j++) { const t=.43+j*.09;leaf(p,tx*t,ty*t,26+random()*18,3,-1.6+(b%2? .7:-.7)); }
    }
  } else if(o.kind==='circle'){p.arc(0,-150,130,0,Math.PI*2);p.closePath();
  } else if(o.kind==='arch') {
    p.moveTo(-170,0);p.lineTo(-170,-350);p.bezierCurveTo(-170,-580,170,-580,170,-350);p.lineTo(170,0);p.closePath();
  } else {
    p.moveTo(-115,20);p.bezierCurveTo(-150,8,-140,-28,-107,-30);p.bezierCurveTo(-111,-77,-53,-98,-22,-67);p.bezierCurveTo(6,-123,87,-102,94,-58);p.bezierCurveTo(150,-68,165,2,123,24);p.bezierCurveTo(52,45,-44,37,-115,20);p.closePath();
  }
  if(shapes.size>=128)shapes.delete(shapes.keys().next().value!);shapes.set(key,p);return p;
}
export function objectTransform(o:ArtObject,s:Composition,time:number) {
  const amplitude=s.wind/100;
  const sway=o.kind==='arch'||o.kind==='circle'?0:s.scene==='garden' ? Math.sin(time*.65+o.seed)*amplitude*.035 : Math.sin(time*.28+o.seed)*amplitude*.016;
  return {x:o.x*1600+(s.scene==='rain'?Math.sin(time*.22+o.seed)*amplitude*12:0), y:o.y*900, angle:o.rotation*Math.PI/180+sway, scale:o.scale};
}
function setTransform(c:CanvasRenderingContext2D,o:ArtObject,s:Composition,t:number,shadow=false) {
  const m=objectTransform(o,s,t);
  c.translate(m.x+(shadow?(o.x-s.light.x)*100:0),m.y+(shadow?(o.y-s.light.y)*52:0));
  c.rotate(m.angle+(shadow?.035:0));c.scale(m.scale*(shadow?1.07:1),m.scale*(shadow?1.07:1));
}
function bloom(c:CanvasRenderingContext2D,x:number,y:number,r:number,color:string,seed:number,opacity:number) {
  const random=seeded(seed);
  c.save(); c.globalCompositeOperation='multiply';
  for(let layer=0;layer<4;layer++) {
    c.beginPath();
    for(let j=0;j<30;j++) {
      const a=j/30*Math.PI*2,rr=r*(.8+random()*.3)*(1-layer*.045);
      const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr*.75;
      if(j===0)c.moveTo(px,py);else c.lineTo(px,py);
    }
    c.closePath();c.globalAlpha=opacity*(layer===0?.12:.055);c.fillStyle=color;c.fill();
    if(layer===0){c.strokeStyle=color;c.lineWidth=.9;c.globalAlpha=opacity*.13;c.stroke();}
  }
  const g=c.createRadialGradient(x-r*.25,y-r*.2,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.globalAlpha=opacity*.10;c.fillRect(x-r,y-r,r*2,r*2);
  c.restore();
}
function drawRain(c:CanvasRenderingContext2D,s:Composition,t:number,pixelScale:number) {
  const palette=PALETTES[s.palette],wind=s.wind/100;
  for(let i=0;i<s.objects.length;i++) {
    const o=s.objects[i], random=seeded(o.seed*17),color=palette.rain[i%palette.rain.length];
    for(let j=0;j<Math.round(s.rainAmount*.65);j++) {
      const delay=random()*13, life=Math.max(0,t-delay), spread=(random()-.5)*370*o.scale;
      const x=o.x*1600+spread+(random()-.5)*wind*100;
      const y=510+random()*330;
      const radius=(18+random()*66)*Math.min(1,life/4);
      if(life>0)bloom(c,x,y,radius,color,o.seed*100+j,Math.min(1,life/7)*(s.ink/65));
    }
    for(let j=0;j<Math.round(s.rainAmount*.31);j++) {
      const cycle=(t*(.15+random()*.1)+random())%1;
      const x=o.x*1600+(random()-.5)*195*o.scale+cycle*wind*46;
      const top=o.y*900+36*o.scale,y=top+cycle*(790-top);
      c.save();c.globalAlpha=(.2+cycle*.3)*(s.ink/65);c.strokeStyle=color;c.lineWidth=1+random()*1.7;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(x+wind*3,y+4+random()*9);c.stroke();c.restore();
    }
    c.save();setTransform(c,o,s,t);c.fillStyle=color;c.globalAlpha=.1;c.filter=`blur(${14*pixelScale}px)`;c.fill(objectShape(o));c.restore();
    c.save();setTransform(c,o,s,t);const g=c.createLinearGradient(0,-100,0,35);g.addColorStop(0,palette.paper);g.addColorStop(1,color);c.globalAlpha=.53;c.fillStyle=g;c.fill(objectShape(o));c.globalAlpha=.24;c.strokeStyle=color;c.lineWidth=1;c.stroke(objectShape(o));c.restore();
  }
}
function drawPaperScene(c:CanvasRenderingContext2D,s:Composition,time:number,width:number,height:number) {
  c.save();c.clearRect(0,0,width,height);c.scale(width/1600,height/900);
  const palette=PALETTES[s.palette];c.fillStyle=palette.paper;c.fillRect(0,0,1600,900);
  if(s.scene==='rain'){c.fillStyle='#fffdf6';c.globalAlpha=.62;c.fillRect(0,0,1600,900);c.globalAlpha=1;}
  const light=c.createRadialGradient(s.light.x*1600,s.light.y*900,0,s.light.x*1600,s.light.y*900,1350*(.7+s.light.softness*.3/44));
  light.addColorStop(0,palette.glow);light.addColorStop(.44,palette.paper);light.addColorStop(1,palette.secondary);
  c.globalAlpha=s.light.intensity/100*(s.scene==='rain'?.28:.75);c.fillStyle=light;c.fillRect(0,0,1600,900);c.globalAlpha=1;
  if(s.scene==='garden') {
    c.save();c.translate(s.light.x*1600,s.light.y*900);c.rotate(-.48);c.filter=`blur(${27*width/1600}px)`;
    const beam=c.createLinearGradient(-400,0,450,0);beam.addColorStop(0,'transparent');beam.addColorStop(.42,'rgba(255,247,211,.15)');beam.addColorStop(.6,'rgba(255,247,211,.3)');beam.addColorStop(1,'transparent');c.fillStyle=beam;c.globalAlpha=Math.min(2,s.light.beam/34)*(s.light.mode==='diffuse'?.2:1);c.fillRect(-400,-1000,950,2300);c.restore();
    for(let i=0;i<s.objects.length;i++) {
      const o=s.objects[i];c.save();setTransform(c,o,s,time,true);c.fillStyle=palette.shadow;c.globalAlpha=s.light.mode==='diffuse'?.08:s.light.mode==='studio'?.27:.16;c.filter=`blur(${(3+s.light.softness*.18+(i%3)*5)*width/1600}px)`;c.fill(objectShape(o));c.restore();
    }
    // Distant fronds lend the paper a softer second layer.
    const fern=s.objects.find(o=>o.kind==='fern');if(fern){const distant={...fern,x:.06,y:.62,scale:.94,rotation:45,seed:98};c.save();setTransform(c,distant,s,time);c.filter=`blur(${5*width/1600}px)`;c.fillStyle=palette.secondary;c.globalAlpha=.22;c.fill(objectShape(distant));c.restore();}
    for(let i=0;i<s.objects.length;i++) {
      const o=s.objects[i];c.save();setTransform(c,o,s,time);
      const g=c.createLinearGradient(-100,-700,150,100);g.addColorStop(0,i%2?palette.secondary:palette.ink);g.addColorStop(.62,palette.ink);g.addColorStop(1,palette.shadow);
      if(o.kind==='arch'||o.kind==='circle'){
        const paperGradient=c.createLinearGradient(-170,-400,170,0);paperGradient.addColorStop(0,palette.glow);paperGradient.addColorStop(1,palette.paper);
        c.fillStyle=paperGradient;c.globalAlpha=.95;c.fill(objectShape(o));c.lineWidth=1;c.strokeStyle='rgba(255,255,235,.4)';c.stroke(objectShape(o));
      }else{c.fillStyle=g;c.globalAlpha=o.id==='plant-3'?.48:o.id==='plant-2'?.66:.9;c.fill(objectShape(o));}c.restore();
    }
  }else{drawRain(c,{...s,objects:s.objects.filter(o=>o.kind==='cloud')},time,width/1600);for(const o of s.objects.filter(o=>o.kind!=='cloud')){c.save();setTransform(c,o,s,time);c.fillStyle=palette.ink;c.globalAlpha=.7;c.fill(objectShape(o));c.restore();}}
  c.save();c.globalAlpha=s.effects.grain/65*.8;c.fillStyle=c.createPattern(paperTexture(),'repeat')!;c.fillRect(0,0,1600,900);c.restore();
  const vignette=c.createRadialGradient(800,400,290,800,450,1050);vignette.addColorStop(0,'transparent');vignette.addColorStop(1,s.scene==='rain'?'rgba(78,58,33,.045)':'rgba(78,58,33,.12)');c.fillStyle=vignette;c.fillRect(0,0,1600,900);
  c.restore();
}
export function hitObject(c:CanvasRenderingContext2D,s:Composition,time:number,x:number,y:number):ArtObject|undefined {
  return [...s.objects].reverse().find(o=>{
    const m=objectTransform(o,s,time),dx=x*1600-m.x,dy=y*900-m.y;
    const px=(dx*Math.cos(-m.angle)-dy*Math.sin(-m.angle))/m.scale,py=(dx*Math.sin(-m.angle)+dy*Math.cos(-m.angle))/m.scale;
    return c.isPointInPath(objectShape(o),px,py)|| (Math.abs(px)<24&&Math.abs(py+(o.kind==='circle'?150:o.kind==='cloud'?25:200))<30)|| (o.kind==='cloud'&&px>-140&&px<150&&py>-100&&py<40);
  });
}
export async function exportArtwork(s:Composition,time:number,width=3840):Promise<Blob> {
  if(![1920,2560,3840].includes(width))throw new Error('Choose 1080p, 1440p, or 4K.');
  await environmentReady(s.theme,s.effects.backplate);const height=width*9/16;
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  drawArtwork(canvas.getContext('2d')!,s,time,width,height);
  const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob)throw new Error('Your browser could not create the image. Please try again.');
  return blob;
}

function radial(c:CanvasRenderingContext2D,x:number,y:number,r:number,color:string,alpha:number){
 c.save();const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.globalAlpha=alpha;c.fillRect(x-r,y-r,r*2,r*2);c.restore();
}
function drawEnvironment(c:CanvasRenderingContext2D,s:Composition,t:number){
 const future=s.theme==='future',image=s.effects.backplate?getBackplate(s.theme):null;
 if(image)drawCover(c,image,1600,900);else{
  const sky=c.createLinearGradient(0,0,0,900);sky.addColorStop(0,future?'#061820':'#708c77');sky.addColorStop(.58,future?'#153c42':'#c4c6a0');sky.addColorStop(1,future?'#030d15':'#273f36');c.fillStyle=sky;c.fillRect(0,0,1600,900);
  const random=seeded(s.seed+29);
  for(let layer=0;layer<4;layer++){c.beginPath();c.moveTo(0,900);for(let i=0;i<=24;i++){const x=i/24*1600,y=480+layer*65+Math.sin(i*.7+layer)*60+random()*45;c.lineTo(x,y);}c.lineTo(1600,900);c.closePath();c.fillStyle=future?['#152c34','#102932','#0b202a','#07161d'][layer]:['#678374','#4a6a5a','#345849','#193a32'][layer];c.fill();}
  if(!future){for(let i=0;i<12;i++){const x=random()*1600,y=650+random()*150;c.save();c.translate(x,y);c.scale(.8+random()*.8,1);c.fillStyle='#203e32';c.globalAlpha=.55;c.fillRect(-3,-460,6,460);for(let branch=0;branch<5;branch++){c.beginPath();c.ellipse(0,-400+branch*65,90-branch*9,55,0,0,Math.PI*2);c.fill();}c.restore();}}
  c.fillStyle=future?'#091f29':'#47736a';c.globalAlpha=.5;c.fillRect(0,690,1600,210);c.globalAlpha=1;
 }
 if(image){c.save();c.globalCompositeOperation='soft-light';c.fillStyle=(future?['#286c72','#6f4489','#b37837','#426ca1']:['#a8b693','#34754a','#ba853f','#3d648c'])[s.palette];c.globalAlpha=s.palette===0?.08:.32;c.fillRect(0,0,1600,900);c.restore();}
 if(s.theme==='future'){
  c.save();c.globalCompositeOperation='screen';c.lineCap='round';c.filter=`blur(${12*Math.abs(c.getTransform().a)}px)`;
  const hue=s.palette===1?'#8471d1':s.palette===2?'#c79453':s.palette===3?'#679bcf':'#49a996';
  for(let j=0;j<7;j++){c.beginPath();for(let i=0;i<=28;i++){const x=480+i*45,y=105+j*17+Math.sin(i*.18+t*.13*(.2+s.wind/40)+j*.12)*55+Math.sin(i*.43+t*.08)*13;if(i===0)c.moveTo(x,y);else c.lineTo(x,y);}c.strokeStyle=hue;c.globalAlpha=(.005+s.effects.bloom*.00012)*(1-j/9);c.lineWidth=28;c.stroke();}c.restore();
 }
 // Shaded foreground objects share the same geometry and interaction model as Paper.
 for(const o of s.objects.filter(o=>o.kind!=='cloud')){
  c.save();setTransform(c,o,s,t,true);c.filter=`blur(${(3+s.light.softness*.13)}px)`;c.fillStyle='#020b0e';c.globalAlpha=.35;c.fill(objectShape(o));c.restore();
  c.save();setTransform(c,o,s,t);
  if(future){
   const g=c.createLinearGradient(-140,-500,170,20);g.addColorStop(0,'#d1e4e6');g.addColorStop(.18,'#304c57');g.addColorStop(.46,'#0a1c29');g.addColorStop(.74,s.palette===1?'#695584':s.palette===2?'#b28f56':s.palette===3?'#688db7':'#398979');g.addColorStop(1,'#061720');c.fillStyle=g;c.globalAlpha=.82;c.fill(objectShape(o));c.strokeStyle=s.palette===1?'#b69be0':'#7fcabb';c.globalAlpha=.55;c.lineWidth=1.4;c.stroke(objectShape(o));
   if(o.kind==='arch'||o.kind==='circle'){c.save();c.globalAlpha=.16+s.effects.bloom*.003;c.shadowColor=s.palette===2?'#efbb6d':'#5dc7d2';c.shadowBlur=18;c.strokeStyle=c.shadowColor;c.lineWidth=2.5;c.stroke(objectShape(o));c.restore();}
  }else{
   const g=c.createLinearGradient(-130,-600,180,50);g.addColorStop(0,['#8d9d5e','#799c66','#b49964','#7592a7'][s.palette]);g.addColorStop(.3,['#425f32','#325c3b','#71623c','#415a68'][s.palette]);g.addColorStop(.6,'#293f29');g.addColorStop(1,'#10241b');c.fillStyle=g;c.globalAlpha=.75;c.fill(objectShape(o));c.strokeStyle='#bbcc8666';c.lineWidth=.8;c.globalAlpha=.3;c.stroke(objectShape(o));
  }c.restore();
  if(future&&(o.kind==='circle'||o.kind==='arch')){c.save();c.translate(o.x*1600,Math.max(690,o.y*900));c.scale(1,-.24);c.translate(0,-60);c.globalAlpha=.14;c.fillStyle='#5aa8a9';c.fill(objectShape({...o,rotation:0}));c.restore();}
 }
 if(s.scene==='rain')drawWeather(c,s,t);
}
function drawWeather(c:CanvasRenderingContext2D,s:Composition,t:number){
 const future=s.theme==='future';
 const sources=s.objects.filter(o=>o.kind==='cloud');
 for(const o of sources){
  const random=seeded(o.seed*79),color=future?(s.palette===2?'#f3c17f':'#98d6dd'):'#d1e2da';
  // Cloud objects become atmospheric rain volumes, never cartoon silhouettes.
  c.save();const sy=Math.max(.35,o.scale*.4);c.scale(o.scale,sy);radial(c,o.x*1600/o.scale,o.y*900/sy,190,color,.035);c.restore();
  const count=Math.round(s.rainAmount*.9);
  for(let j=0;j<count;j++){
   const phase=(t*(.3+random()*.16)+random())%1;
   const x=o.x*1600+(random()-.5)*600*o.scale+phase*s.wind*.7;
   const top=o.y*900-50,y=top+phase*(950-top),length=8+random()*22;
   c.beginPath();c.moveTo(x,y);c.lineTo(x+s.wind*.06,y+length);c.strokeStyle=color;c.lineWidth=.5+random();c.globalAlpha=(.11+random()*.16)*(s.ink/60);c.stroke();
  }
  c.globalAlpha=1;
  for(let j=0;j<12;j++){const phase=(t*.34+random())%1,x=o.x*1600+(random()-.5)*600*o.scale,y=700+random()*180;c.beginPath();c.ellipse(x,y,3+phase*17,1+phase*3,0,0,Math.PI*2);c.strokeStyle=color;c.lineWidth=.6;c.globalAlpha=(1-phase)*.18*s.rainAmount/70;c.stroke();}c.globalAlpha=1;
 }
}
function drawInk(c:CanvasRenderingContext2D,s:Composition,t:number){
 const blue=s.palette===3,ink=['#292e2c','#634635','#284437','#203b5b'][s.palette];
 c.fillStyle=['#eceae2','#eee5d8','#e5e9df','#e2e8ec'][s.palette];c.fillRect(0,0,1600,900);
 const random=seeded(s.seed);c.save();
 for(let i=0;i<7;i++){
  const x=900+random()*330,y=220+random()*440;c.beginPath();c.ellipse(x,y,90+random()*150,160+random()*120,-.4+random()*.8,0,Math.PI*2);c.fillStyle=ink;c.globalAlpha=.012+s.ink*.0002;c.fill();
 }
 c.restore();
 for(const o of s.objects){
  if(o.kind==='cloud'){
   const r=seeded(o.seed);for(let j=0;j<Math.round(s.rainAmount*.5);j++){const x=o.x*1600+(r()-.5)*370,y=440+r()*370,life=Math.min(1,Math.max(0,t-r()*9)/5);bloom(c,x,y,(12+r()*60)*life,ink,o.seed*10+j,s.ink/75);}
   c.save();c.translate(o.x*1600,o.y*900);c.strokeStyle=ink;c.globalAlpha=.16;c.lineCap='round';for(let j=0;j<10;j++){c.beginPath();c.moveTo(-140+r()*50,-20+r()*40);c.bezierCurveTo(-80,-50,65,30,140-r()*40,-20+r()*40);c.lineWidth=1+r()*9;c.stroke();}c.restore();continue;
  }
  c.save();setTransform(c,o,s,t);c.fillStyle=ink;c.globalAlpha=o.kind==='arch'||o.kind==='circle'?.075:.6;c.fill(objectShape(o));
  const r=seeded(o.seed+5);for(let line=0;line<3;line++){c.translate((r()-.5)*2,(r()-.5)*2);c.strokeStyle=ink;c.lineWidth=.7+line*.5;c.globalAlpha=.16;c.stroke(objectShape(o));}c.restore();
 }
 c.save();c.strokeStyle=ink;c.lineWidth=.8;c.globalAlpha=.18;c.beginPath();c.moveTo(1080,170);c.lineTo(1210,170);c.moveTo(1145,145);c.lineTo(1145,195);c.stroke();c.restore();
}
function drawLight(c:CanvasRenderingContext2D,s:Composition){
 const l=s.light,x=l.x*1600,y=l.y*900,amount=l.intensity/100;
 c.save();
 if(l.mode==='moon'){c.fillStyle='#06152e';c.globalAlpha=s.theme==='paper'||s.theme==='ink'?.23:.57;c.fillRect(0,0,1600,900);}
 if(l.mode==='diffuse'){c.fillStyle=s.theme==='future'?'#8199a3':'#e7e9e1';c.globalAlpha=.09*amount;c.fillRect(0,0,1600,900);}
 c.globalAlpha=1;
 if(l.mode==='neon'){c.globalCompositeOperation='screen';radial(c,x,y,410+l.softness*6,s.palette===1?'#754dce':s.palette===2?'#d38d3f':'#248e9a',amount*.35);radial(c,1600-x,Math.min(850,y+200),480,'#ba7543',amount*.15);}
 else if(l.mode==='studio'){
  c.fillStyle='#040a0f';c.globalAlpha=.18;c.fillRect(0,0,1600,900);c.globalAlpha=1;c.globalCompositeOperation='screen';
  const g=c.createRadialGradient(x,y,0,x,y,850);g.addColorStop(0,'#fff7db');g.addColorStop(.3,'#cec6aa');g.addColorStop(1,'transparent');c.fillStyle=g;c.globalAlpha=amount*.26;c.fillRect(0,0,1600,900);
 }else{c.globalCompositeOperation='screen';radial(c,x,y,450+l.softness*7,l.mode==='moon'?'#829ed8':l.mode==='golden'?'#edbc65':'#e4eede',amount*(s.theme==='paper'&&l.mode==='golden'?0:s.theme==='paper'?.07:.14));}
 if(l.beam>0&&!(s.theme==='paper'&&l.mode==='golden')){
  c.save();c.globalCompositeOperation='screen';c.translate(x,y);c.rotate((l.x-.5)*-.5+.3);
  const g=c.createLinearGradient(0,-100,0,1200);g.addColorStop(0,l.mode==='neon'?'#528a9e':l.mode==='moon'?'#8faac2':'#e9d7a0');g.addColorStop(1,'transparent');
  c.fillStyle=g;c.globalAlpha=l.beam/100*(l.mode==='studio'?.28:.075);c.beginPath();c.moveTo(-18,-70);c.lineTo(520,1050);c.lineTo(-320,1050);c.closePath();c.fill();c.restore();
 }
 c.restore();
 if(l.warmth!==64){c.save();c.globalCompositeOperation='soft-light';c.fillStyle=l.warmth>64?'#df9a4c':'#4386b1';c.globalAlpha=Math.abs(l.warmth-64)/100*.45;c.fillRect(0,0,1600,900);c.restore();}
 if(l.exposure!==0){c.save();c.fillStyle=l.exposure>0?'#fffdf3':'#00040b';c.globalAlpha=Math.abs(l.exposure)/100*.68;c.fillRect(0,0,1600,900);c.restore();}
}
function drawAtmosphere(c:CanvasRenderingContext2D,s:Composition,t:number){
 const e=s.effects,future=s.theme==='future',ink=s.theme==='ink';
 if(e.haze>0){
  for(let i=0;i<3;i++){c.save();c.scale(1,.2);const x=350+i*430+Math.sin(t*.08+i)*70,y=(450+i*100)/.2;radial(c,x,y,640,future?'#63899a':ink?'#d1d4d1':'#d8e2cd',e.haze/100*.13);c.restore();}
 }
 if(e.bloom>0){c.save();c.globalCompositeOperation='screen';radial(c,s.light.x*1600,s.light.y*900,450+e.bloom*3,future?'#428e9a':'#d6c693',e.bloom/100*.13);c.restore();}
 const random=seeded(s.seed+92),count=Math.floor(e.particles*.9);
 for(let i=0;i<count;i++){
  const x=(random()*1600+t*(2+random()*4)*(.25+s.wind/40))%1600,y=(random()*900+Math.sin(t*.3+i)*7)%900,r=.6+random()*1.5,alpha=(.3+.3*Math.sin(t*.65+i))*e.particles/100;
  c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=future?'#9edbcb':ink?'#555d57':'#ece1a1';c.globalAlpha=alpha;c.fill();
  if(!ink&&i%4===0)radial(c,x,y,r*4,future?'#6ddbc8':'#ead28b',alpha*.18);
 }
 c.globalAlpha=1;
 if(s.effects.storm&&s.scene==='rain'){
  // A slow, one-second lift every 29 seconds. Caller suppresses it for reduced motion.
  const phase=t%29;const lift=phase>24&&phase<26?Math.sin((phase-24)/2*Math.PI)*.09:0;
  if(lift>0){c.fillStyle='#c4d4e5';c.globalAlpha=lift;c.fillRect(0,0,1600,900);c.globalAlpha=1;}
 }
}
export function drawArtwork(c:CanvasRenderingContext2D,s:Composition,time:number,width:number,height:number){
 const t=time;
 if(s.theme==='paper')drawPaperScene(c,s,t,width,height);
 else{c.save();c.clearRect(0,0,width,height);c.scale(width/1600,height/900);if(s.theme==='ink')drawInk(c,s,t);else drawEnvironment(c,s,t);c.restore();}
 c.save();c.scale(width/1600,height/900);drawLight(c,s);drawAtmosphere(c,s,t);
 if(s.theme!=='paper'&&s.effects.grain>0){c.save();c.globalAlpha=s.effects.grain/100*(s.theme==='ink'?1:.35);c.fillStyle=c.createPattern(paperTexture(),'repeat')!;c.fillRect(0,0,1600,900);c.restore();}
 c.restore();
}
export const renderCacheStats=()=>({shapes:shapes.size,textures:paper?1:0,maxShapes:128});
