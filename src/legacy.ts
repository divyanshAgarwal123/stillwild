export type Scene = 'garden' | 'rain';
export type PlantKind = 'fern' | 'olive' | 'eucalyptus' | 'grass';
export type ArtObject = { id: string; kind: PlantKind | 'cloud' | 'arch'; x: number; y: number; scale: number; rotation: number; seed: number };
export type Composition = { version: 1; scene: Scene; preset: number; palette: number; wind: number; light: { x: number; y: number; intensity: number }; objects: ArtObject[]; time: number; frozen: boolean; rainAmount: number; ink: number };
export const STORAGE_KEY = 'stillwild.composition.v1';
export const PALETTES = [
  { name: 'Parchment', paper: '#e8d9ba', ink: '#565c39', secondary: '#898d60', shadow: '#645a3d', glow: '#fff1c9', rain: ['#8dabbc', '#d6a18e', '#cabc87', '#a6b39b'], swatches: ['#e8d9ba', '#7f8862', '#b5a47c', '#555e45'] },
  { name: 'Sage', paper: '#d9dfca', ink: '#3e5e4b', secondary: '#839a76', shadow: '#536153', glow: '#f6f2cc', rain: ['#659385', '#8b9c71', '#688696', '#c4a57e'], swatches: ['#d9dfca', '#789179', '#b8c5a0', '#3e5e4b'] },
  { name: 'Terracotta', paper: '#ebceba', ink: '#805446', secondary: '#b67e60', shadow: '#815b52', glow: '#ffedcb', rain: ['#bd765e', '#cfa16f', '#9a7376', '#8f9a81'], swatches: ['#ebceba', '#b67e60', '#d4a588', '#805446'] },
  { name: 'Moonstone', paper: '#d8dce2', ink: '#48556b', secondary: '#8692a6', shadow: '#50546b', glow: '#f0e8df', rain: ['#7385aa', '#a891ae', '#6d9aa1', '#a7a1bb'], swatches: ['#d8dce2', '#8692a6', '#bac3cb', '#48556b'] },
];
export const PRESETS = [
  { name: 'Golden hour', description: 'A little warmth, held in time.', label: 'WARM & SUNLIT', palette: 0 },
  { name: 'Forest hush', description: 'Soft greens. A slower rhythm.', label: 'COOL & VERDANT', palette: 1 },
  { name: 'Afterglow', description: 'The last light of a long day.', label: 'SOFT & EARTHY', palette: 2 },
];
export function makePreset(scene: Scene = 'garden', preset = 0): Composition {
  const layouts = [
    [[.09, 1.08, 1.16, -17], [.84, 1.08, 1.12, 9], [.33, 1.09, .76, -15], [1.01, .96, 1.03, -46], [.64, 1.13, .62, -23]],
    [[.18, 1.1, 1.25, 4], [.89, 1.12, 1.21, -12], [.49, 1.13, .79, -27], [.97, .81, .87, -53], [.66, 1.13, .71, 15]],
    [[.05, 1.1, 1.17, -26], [.88, 1.08, 1.24, 16], [.32, 1.11, .86, 3], [.99, .84, .96, -59], [.68, 1.12, .68, -9]],
  ];
  const kinds: PlantKind[] = ['fern', 'olive', 'eucalyptus', 'fern', 'grass'];
  return { version: 1, scene, preset, palette: preset, wind: [24, 14, 36][preset], light: { x: [.73, .52, .82][preset], y: [.18, .12, .3][preset], intensity: [74, 54, 62][preset] }, objects: scene === 'garden' ? [{id:'paper-arch',kind:'arch',x:[.6,.57,.64][preset],y:.87,scale:.83,rotation:0,seed:6}, ...layouts[preset].map(([x,y,scale,rotation],i) => ({id: `plant-${i}`,kind:kinds[i],x,y,scale,rotation,seed: 17+i*37+preset*11}))] : [
    {id:'cloud-0',kind:'cloud',x:.27,y:.22,scale:1.2,rotation:0,seed:73+preset},
    {id:'cloud-1',kind:'cloud',x:.66,y:.31,scale:1,rotation:0,seed:31+preset},
    {id:'cloud-2',kind:'cloud',x:.82,y:.16,scale:.7,rotation:0,seed:54+preset},
  ], time: 16, frozen: false, rainAmount: 48, ink: 42 };
}
const bounded = (value: unknown, min: number, max: number): value is number => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
export function validateComposition(value: unknown): Composition | null {
  if (!value || typeof value !== 'object') return null;
  const s = value as Composition;
  if (s.version !== 1 || !['garden','rain'].includes(s.scene) || !Number.isInteger(s.preset) || !bounded(s.preset,0,2) || !Number.isInteger(s.palette) || !bounded(s.palette,0,3) || !bounded(s.wind,0,100) || !bounded(s.time,0,86400)) return null;
  if (typeof s.frozen !== 'boolean' || !bounded(s.rainAmount,0,100) || !bounded(s.ink,0,100)) return null;
  if (!s.light || !bounded(s.light.x,0,1) || !bounded(s.light.y,0,1) || !bounded(s.light.intensity,0,100)) return null;
  if (!Array.isArray(s.objects) || s.objects.length < 1 || s.objects.length > 12) return null;
  const ids = new Set();
  for (const o of s.objects) {
    if (!o || typeof o.id !== 'string' || o.id.length > 40 || ids.has(o.id) || !['fern','olive','eucalyptus','grass','cloud','arch'].includes(o.kind) || (s.scene==='rain') !== (o.kind==='cloud') || !bounded(o.x,-.25,1.25) || !bounded(o.y,-.25,1.25) || !bounded(o.scale,.3,1.7) || !bounded(o.rotation,-180,180) || !Number.isInteger(o.seed) || !bounded(o.seed,0,100000)) return null;
    ids.add(o.id);
  }
  return structuredClone(s);
}
export function encodeComposition(s: Composition): string {
  return btoa(JSON.stringify(s));
}
export function decodeComposition(hash: string): Composition | null {
  try {
    const raw = new URLSearchParams(hash.replace(/^#/, '')).get('art');
    if (!raw || raw.length > 12000) return null;
    return validateComposition(JSON.parse(atob(raw)));
  } catch { return null; }
}
export function loadComposition(): { composition: Composition; notice?: string } {
  const shared = decodeComposition(window.location.hash);
  if (shared) return {composition: shared, notice: 'A little world, shared with you.'};
  try {
    const stored = validateComposition(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'));
    if (stored) return {composition: stored};
  } catch { /* Storage may be unavailable in a private context. */ }
  return {composition: makePreset(), notice: window.location.hash.includes('art=') ? 'This link could not be restored. A fresh garden is ready.' : undefined};
}
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15,t | 1); t ^= t + Math.imul(t ^ t >>> 7,t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
