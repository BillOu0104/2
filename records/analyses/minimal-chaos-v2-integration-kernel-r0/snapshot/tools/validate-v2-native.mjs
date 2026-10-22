import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {Simulation} from '../src/simulation.js';
import {settingsFromInitial} from '../src/settings.js';
import {initialize} from '/workspace/2/docs/research-v2/engine.mjs';

const binary='/workspace/2/docs/research-v2/bin/native',dir='docs/integration-v2/results';fs.mkdirSync(dir,{recursive:true});
const binarySHA256=crypto.createHash('sha256').update(fs.readFileSync(binary)).digest('hex');
assert.equal(binarySHA256,'cf2117ac290bea83d6cfbdb07f98888412d594024e295887bc537bce5132f091');
const checks=[];const output={scope:'Integration validation against frozen native7f64a8a; short windows/forced fixtures, not a new100000year confirmation',binarySHA256,checks};
const save=()=>fs.writeFileSync(dir+'/native-comparison.json',JSON.stringify(output,null,2)+'\n');
function manual(kind){
 const b=[{x:-.07,y:0,z:0,vx:.3,vy:0,vz:0,mass:5e6},{x:.07,y:0,z:0,vx:-.3,vy:.01,vz:0,mass:5e6},{x:1.8,y:1,z:0,vx:0,vy:-.05,vz:0,mass:5e6},{x:1.8,y:1.3,z:0,vx:-.3,vy:-.05,vz:0,mass:5000}];
 if(kind==='reflection'){b[0].x=-.03;b[1].x=.03;}
 if(kind==='planet-contact'){b[0].x=-1.2;b[1].x=.4;b[3].x=1.82;b[3].y=1;b[0].vx=0;b[1].vx=0;}
 if(kind==='capture'){b[0].x=6;b[0].vx=.25;b[1].x=-.5;b[1].vx=0;b[1].vy=-.2;b[2].x=.5;b[2].y=0;b[2].vy=.2;b[3].x=.5;b[3].y=.3;}
 return b;
}
for(const mode of ['deflect-v2','reflect-v2'])for(const kind of ['natural','deflection','reflection','planet-contact','capture']){
 const seed='V2-INTEGRATION-'+kind;const cfg={seed,stabilityMode:mode,newproperty60:true,autorestart:true};
 const sim=new Simulation(kind==='natural'?cfg:settingsFromInitial(cfg,manual(kind)));sim.tick();
 if(kind==='natural')assert.deepEqual(sim.initialBodies,initialize(seed).bodies);
 const controller={...sim.controlled.cfg,dt:.0001875,eta:.001875,shadow:false};
 const file=dir+'/'+mode+'-'+kind+'.input.json',horizon=20;
 const input={seed,profile:mode+'-'+kind,sourceHash:'short-integration-fixture-original-native7f64a8a',configHash:'integration-fixture',horizon,settings:sim.settings,controller,bodies:sim.initialBodies.map(b=>({r:[b.x,b.y,b.z],v:[b.vx,b.vy,b.vz],mass:b.mass}))};
 fs.writeFileSync(file,JSON.stringify(input));const native=spawnSync(binary,[file],{encoding:'utf8',maxBuffer:32*1024*1024});assert.equal(native.status,0,native.stderr);fs.writeFileSync(file.replace('.input.json','.native.json'),native.stdout);const reference=JSON.parse(native.stdout);
 let stable=sim.world.state?.epoch.kind==='stable'&&sim.controlled.bodies[3].mass>0?1:0;
 for(let frame=1;frame<horizon*60&&!sim.controlled.stellarFailure;frame++){sim.tick();if(sim.world.state?.epoch.kind==='stable'&&sim.controlled.bodies[3].mass>0)stable++;}
 const c=sim.controlled;let maxState=0;
 for(let i=0;i<4;i++)for(let k=0;k<6;k++){const key=['x','y','z','vx','vy','vz'][k];maxState=Math.max(maxState,Math.abs(c.bodies[i][key]-(k<3?reference.finalBodies[i].r[k]:reference.finalBodies[i].v[k-3])));}
 const countFields=['projectionEvents','deflectionEvents','reflectionEvents','activeFrames'];const differentCounts=countFields.filter(k=>c.cost[k]!==reference.control[k]);
 const q={mode,kind,horizon,maxState,jsSteps:c.integrator.steps,nativeSteps:reference.steps,jsLosses:c.planetLosses,nativeLosses:reference.planetLosses,jsRespawns:c.planetRespawns,nativeRespawns:reference.planetRespawns,jsStable:stable/(horizon*60),nativeStable:reference.stableFraction,jsControl:c.cost,nativeControl:reference.control,differentCounts,generation:sim.generation,pass:maxState<1e-7&&c.integrator.steps===reference.steps&&c.planetLosses===reference.planetLosses&&c.planetRespawns===reference.planetRespawns&&differentCounts.length===0&&Math.abs(stable/(horizon*60)-reference.stableFraction)<1e-12};checks.push(q);save();console.log(JSON.stringify({mode,kind,maxState,steps:c.integrator.steps,losses:c.planetLosses,differentCounts,pass:q.pass}));
 if(!q.pass)throw new Error('Independent native comparison failed: '+mode+' '+kind);
}
assert(checks.some(x=>x.jsControl.deflectionEvents>0));assert(checks.some(x=>x.jsControl.reflectionEvents>0));assert(checks.some(x=>x.jsRespawns>0));assert(checks.some(x=>x.kind==='capture'&&x.jsControl.projectionEvents>x.jsControl.deflectionEvents+x.jsControl.reflectionEvents));
output.pass=true;save();
