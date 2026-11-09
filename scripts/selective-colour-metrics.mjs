// Shared test metrics only: no app behavior or thresholds are imported here.
export function hsv(r,g,b){r/=255;g/=255;b/=255;const v=Math.max(r,g,b),lo=Math.min(r,g,b),d=v-lo;return{h:(d===0?0:v===r?((g-b)/d+6)%6:v===g?(b-r)/d+2:(r-g)/d+4)*60,s:v===0?0:d/v,v};}
export function distance(a,b){return Math.abs(((a-b+540)%360)-180);}
export function compareColour(before,after,channels=4){
 const groups={selected:{count:0,difference:0,purple:0,valueError:0,saturationError:0},unselected:{count:0,difference:0},neutral:{count:0,difference:0}};
 for(let i=0;i<before.length;i+=channels){const a=hsv(before[i],before[i+1],before[i+2]),b=hsv(after[i],after[i+1],after[i+2]),diff=(Math.abs(before[i]-after[i])+Math.abs(before[i+1]-after[i+1])+Math.abs(before[i+2]-after[i+2]))/3;
  if(distance(a.h,347.2)<35&&a.s>.3&&a.v>.2){const g=groups.selected;g.count++;g.difference+=diff;g.purple+=distance(b.h,262.58)<10?1:0;g.valueError+=Math.abs(a.v-b.v);g.saturationError+=Math.abs(a.s-b.s);}
  if(a.h>=70&&a.h<=220&&a.s>.3&&a.v>.15){groups.unselected.count++;groups.unselected.difference+=diff;}
  if(a.s<.06&&a.v>.1){groups.neutral.count++;groups.neutral.difference+=diff;}
 }
 for(const g of Object.values(groups))for(const key of Object.keys(g))if(key!=='count')g[key]/=Math.max(1,g.count);
 return groups;
}
