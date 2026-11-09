import {useEffect,useRef,useState} from 'react';
import {clamp} from './model';

// Keep the user's intermediate text (empty, minus, decimal) separate from valid preview values.
export default function NumberField({label,value,onChange,min,max,step=1,disabled=false,begin,end,normalize}:{label:string;value:number;onChange:(value:number)=>void;min:number;max:number;step?:number;disabled?:boolean;begin:()=>void;end:()=>void;normalize?:(value:number)=>number}){
 const format=(n:number)=>String(Number(n.toFixed(2))),[draft,setDraft]=useState(()=>format(value)),editing=useRef(false);
 useEffect(()=>{if(!editing.current)setDraft(format(value));},[value]);
 const bounded=(n:number)=>normalize?normalize(clamp(n,min,max)):clamp(n,min,max);
 return <input type="number" aria-label={label} value={draft} min={min} max={max} step={step} disabled={disabled}
  onFocus={()=>{editing.current=true;begin();}}
  onChange={e=>{const raw=e.target.value;setDraft(raw);if(raw===''||!Number.isFinite(e.target.valueAsNumber))return;const next=bounded(e.target.valueAsNumber);onChange(next);if(normalize&&next!==e.target.valueAsNumber)setDraft(format(next));}}
  onBlur={e=>{editing.current=false;const n=e.target.valueAsNumber;if(e.target.value!==''&&Number.isFinite(n)){const next=bounded(n);onChange(next);setDraft(format(next));}else setDraft(format(value));end();}}
  onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();e.currentTarget.blur();}if(e.key==='Escape'){setDraft(format(value));e.currentTarget.blur();}}}/>;
}
