import { propertySchema } from './original-data.js';

export const defaults = Object.fromEntries(Object.entries(propertySchema)
  .filter(([, d]) => d.type && d.type !== 'group').map(([k, d]) => [k, d.value]));
export const extraDefaults = { seed: 'TRISOLARIS', music: false, volume: 0.35, trailsLength: 400, physicsMode: 'reference', pixelRatio: 4, bodyLabels: false, presentationRevision: 2, civilizationMode: 'balanced', thermalGrace: 8, wakeDelay: 3, epochWindow: 2, climateInertia: 1.5, stellarBreathing: true, renderQuality: 'native' };
// New installs show the requested tails; explicitly saved off/on preferences still win.
defaults.newproperty14 = true;
defaults.newproperty39 = true;
defaults.newproperty45 = -20;
defaults.newproperty46 = 40;
defaults.newproperty51 = .35;
defaults.newproperty3 = 0;
defaults.newproperty68 = 0;
export const effectivePropertySchema = { ...propertySchema,
  newproperty39:{...propertySchema.newproperty39,text:'显示右侧双排行 / Rankings',value:true},
  audiobar:{...propertySchema.audiobar,text:'显示基础信息与排行 / Runtime overview'},
  newproperty45: {...propertySchema.newproperty45,text:'常态活动低温边界 / Active life minimum °C',value:-20},
  newproperty46: {...propertySchema.newproperty46,text:'常态活动高温边界 / Active life maximum °C',value:40},
  newproperty43: {...propertySchema.newproperty43,text:'干仓低温耐受 / Dry storage minimum °C'},
  newproperty44: {...propertySchema.newproperty44,text:'干仓高温耐受 / Dry storage maximum °C'},
  newproperty51: {...propertySchema.newproperty51,value:.35}
};
export function normalizeSettings(source = {}, includeExtras = true) {
  const out = { ...defaults, ...(includeExtras ? extraDefaults : {}) };
  for (const [key, value] of Object.entries(source)) {
    const def = propertySchema[key];
    if (def?.type === 'bool') out[key] = value === true;
    else if (def?.type === 'slider' && Number.isFinite(Number(value))) out[key] = Math.min(def.max, Math.max(def.min, Number(value)));
    else if (def?.type === 'combo' && def.options.some(o => String(o.value) === String(value))) out[key] = String(value);
    else if (def?.type === 'color' && typeof value === 'string' && value.trim().split(/\s+/).length === 3) {
      const c = value.trim().split(/\s+/).map(Number);
      if (c.every(Number.isFinite)) out[key] = c.map(x => Math.min(1, Math.max(0, x))).join(' ');
    } else if (['textinput', 'scenetexture'].includes(def?.type) && typeof value === 'string') out[key] = value.slice(0, 4096);
    else if (key === 'seed' && typeof value === 'string') out.seed = value.slice(0, 120);
    else if (key === 'music') out.music = value === true;
    else if (key === 'volume' && Number.isFinite(+value)) out.volume = Math.min(1, Math.max(0, +value));
    else if (key === 'trailsLength' && Number.isFinite(+value)) out.trailsLength = Math.round(Math.min(2000, Math.max(20, +value)));
    else if (key === 'physicsMode' && ['reference', 'realtime'].includes(value)) out.physicsMode = value;
    else if (key === 'pixelRatio' && Number.isFinite(+value)) out.pixelRatio = Math.min(4, Math.max(0.5, +value));
    else if (key === 'bodyLabels') out.bodyLabels = value === true;
    else if (key === 'civilizationMode' && ['balanced', 'legacy'].includes(value)) out.civilizationMode = value;
    else if (key === 'thermalGrace' && Number.isFinite(+value)) out.thermalGrace = Math.min(60, Math.max(1, +value));
    else if (key === 'wakeDelay' && Number.isFinite(+value)) out.wakeDelay = Math.min(60,Math.max(1,+value));
    else if (key === 'epochWindow' && Number.isFinite(+value)) out.epochWindow = Math.min(20,Math.max(.25,+value));
    else if (key === 'climateInertia' && Number.isFinite(+value)) out.climateInertia = Math.min(30,Math.max(.05,+value));
    else if (key === 'stellarBreathing') out.stellarBreathing=value===true;
    else if (key === 'renderQuality' && ['native','8k'].includes(value)) out.renderQuality=value;
  }
  return out;
}
export function colorRGB(s = '1 1 1') { return s.split(/\s+/).map(Number); }
export function colorHex(s) { return '#' + colorRGB(s).map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join(''); }
export function fromHex(s) { return [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16) / 255).join(' '); }
export function plainText(s = '') { return s.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' '); }
export function algorithmId(s) { return `sykm-scene-v4-${s.physicsMode}60-civ-${s.civilizationMode}-v3-damage1`; }
export function migrateSettings(saved={},version=3){
  // One-time presentation migration for v0.3 installations with labels enabled.
  if(saved.presentationRevision!==extraDefaults.presentationRevision)saved={...saved,bodyLabels:saved.presentationRevision>=1?saved.bodyLabels:false,newproperty39:true};
  if(version<3)return normalizeSettings({...saved,newproperty45:-20,newproperty46:40,newproperty51:Math.abs(saved.newproperty51??3)>=2 ? .35 : (saved.newproperty51??.35),newproperty3:0,newproperty68:0});
  return normalizeSettings(saved);
}
export function seededRandom(seed) {
  let h = 2166136261;
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

export function settingsFromInitial(settings, bodies) {
  if (!Array.isArray(bodies) || bodies.length !== 4 || bodies.some(b => !['x','y','z','vx','vy','vz','mass'].every(k => Number.isFinite(b?.[k])))) throw new Error('初始四体参数无效');
  const result = { ...settings, newproperty50: true };
  const keys = [['x11','y11','z1','v1','vy1','vz1'],['x21','y21','z2','vx2','vy2','vz2'],['x3','y3','z3','vx3','vy3','vz3'],['x4','y4','z4','vx4','vy4','vz4']];
  bodies.forEach((b,i) => {
    ['x','y','z','vx','vy','vz'].forEach((axis,j) => result[keys[i][j]] = b[axis]);
    result[['_110','_26','_34','newproperty8'][i]] = b.mass;
  });
  return normalizeSettings(result);
}
