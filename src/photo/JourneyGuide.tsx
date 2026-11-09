import {animateSurface} from './uiMotion';
import {useLayoutEffect,useState} from 'react';
import type {Project} from './model';
import {deliveredCurrent,hasAppearanceEdits} from './journey';
import type {Delivery} from './journey';
import {Icon} from '../icons';
export default function JourneyGuide({project,chosen,delivery,frame,close,action,welcome}:{project:Project;chosen:boolean;delivery:Delivery|null;frame:number;close:()=>void;action:(target:'choose'|'animate'|'look'|'crop'|'motion'|'sound'|'use')=>void;welcome:()=>void}){
 const [step,setStep]=useState(0),animated=project.layers.some(l=>l.kind==='video'&&l.visible),edited=hasAppearanceEdits(project),done=deliveredCurrent(project,delivery,frame);
 useLayoutEffect(()=>{animateSurface(document.querySelector('.journey-guide-body'));},[step]);
 const statuses=[chosen?'Image selected':'Choose an image',animated?'Editable video present':'Optional',edited?'Edits present':'Ready to customize',done?'Download started':'Ready to export'];
 return <aside className="journey-guide" aria-label="Wallpaper guide" onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();close();}}}>
  <div className="journey-guide-title"><strong>Make your wallpaper</strong><button aria-label="Close guide" onClick={close}><Icon name="close" size={18}/></button></div>
  <nav aria-label="Wallpaper guide steps">{['Choose','Animate','Customize','Use'].map((name,i)=><button key={name} aria-current={step===i?'step':undefined} onClick={()=>setStep(i)}><span>{name}</span><small>{statuses[i]}</small></button>)}</nav>
  <div className="journey-guide-body">{step===0?<><p>Pick a scene from the collection or choose a JPEG, PNG or WebP of your own. Private media stays here unless you choose to send a frame to a generation provider.</p><button onClick={()=>action('choose')}>Choose a photograph</button></>:step===1?<><p>Animation is optional. Generate from your image, then keep editing the result in this workspace. Wan is a free trial with shared queue/daily limits. Your API connects a compatible browser-accessible service using your own session key; service charges may apply.</p><button onClick={()=>action('animate')}>Open Animate scene</button><button onClick={()=>setStep(2)}>Keep my still image</button></>:step===2?<><p>Shape the image with light and colour. Add Look keyframes for changing light. Sound starts only when you press Start sound.</p><div className="journey-guide-links"><button onClick={()=>action('look')}>Edit light & colour</button><button onClick={()=>action('crop')}>Adjust crop</button><button onClick={()=>action('motion')}>Look keyframes</button><button onClick={()=>action('sound')}>Sound</button></div></>:<><p>{done?'Your artwork was handed to the browser for download. Check Downloads, then set the PNG as your desktop background.':'Download a 4K still or an optional live loop. Keep an editable backup with any private media. A separate host is needed for video wallpapers; compatibility varies.'}</p><button onClick={()=>action('use')}>{done?'Delivery & backup':'Use my wallpaper'}</button></>}</div>
  <footer><button onClick={welcome}>Replay welcome</button><button onClick={close}>Skip guide</button></footer>
 </aside>;
}
