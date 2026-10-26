import {Simulation} from './simulation.js';
import {createControlledSystem} from './v2-simulation.js';
const omit=(object,keys)=>Object.fromEntries(Object.entries(object).filter(([key])=>!keys.includes(key)&&typeof object[key]!=='function'));
// A complete accepted-frame checkpoint, not a restart from the same Seed.
// The batch runner must also verify its frozen source/configuration hashes.
export function checkpointV2(sim){
 if(!sim.controlled||sim.settings.stabilityMode==='off')throw new Error('V2 checkpoint requires an initialized V2 runtime');
 const c=sim.controlled,g=c.integrator;
 return structuredClone({format:'three-body-v2-full-state',version:1,
  simulation:omit(sim,['modules','random','input','settings','statistics','habitability','world','civilization','escape','orbitTrace','controlled']),
  randomState:sim.random.checkpoint(),settings:sim.settings,statistics:omit(sim.statistics,[]),habitability:omit(sim.habitability,[]),world:omit(sim.world,[]),civilization:omit(sim.civilization,['shared']),escape:omit(sim.escape,[]),orbitTrace:omit(sim.orbitTrace,[]),
  controlled:omit(c,['settings','integrator','onEvent','onPlanetLoss','onRespawn','onStep']),
  integrator:{...omit(g,['bodies','radii','cageAcceleration','saved','contactKeys']),saved:[...g.saved],contactKeys:[...g.contactKeys]}});
}
export function restoreV2(data){
 if(data.format!=='three-body-v2-full-state'||data.version!==1)throw new Error('Unsupported V2 checkpoint');
 const x=structuredClone(data),sim=new Simulation(x.settings,{}, {trace:x.simulation.traceEnabled});
 sim.generation=x.simulation.generation;sim.setRandom();sim.controlled=createControlledSystem(sim);
 // Keep the shared object captured by legacy module closures and CivilizationState.
 const shared=sim.shared,engine=sim.engine;Object.assign(sim,x.simulation);sim.shared=shared;sim.engine=engine;
 for(const key of Object.keys(shared))delete shared[key];Object.assign(shared,x.simulation.shared);Object.assign(engine,x.simulation.engine);
 for(const key of ['statistics','habitability','world','civilization','escape','orbitTrace'])Object.assign(sim[key],x[key]);
 const c=sim.controlled;Object.assign(c,x.controlled);c.settings=sim.settings;
 if(!('vectorImpulse'in c.external)){c.external.vectorImpulse=0;c.external.vectorImpulseComplete=false;}
 Object.assign(c.integrator,x.integrator);c.integrator.bodies=c.bodies;c.integrator.saved=new Float64Array(x.integrator.saved);c.integrator.contactKeys=new Set(x.integrator.contactKeys);
 sim.random.restore(x.randomState);sim.lastPhysicsState=c.state();sim.statePending=false;return sim;
}
// JSON transport preserves nonfinite sentinels used by diagnostic state.
export function encodeV2(data){return JSON.stringify(data,(_,v)=>v instanceof Set?{__v2Set:[...v]}:v instanceof Map?{__v2Map:[...v]}:typeof v==='number'&&!Number.isFinite(v)?{__v2Nonfinite:String(v)}:v);}
export function decodeV2(text){return JSON.parse(text,(_,v)=>v&&typeof v==='object'&&Object.keys(v).length===1?('__v2Nonfinite'in v?Number(v.__v2Nonfinite):'__v2Set'in v?new Set(v.__v2Set):'__v2Map'in v?new Map(v.__v2Map):v):v);}
