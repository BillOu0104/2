// Physics checks for the weak-binding trigger: activation, no-op regions,
// conserved invariants, and independent native/JS frame evolution.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {capture} from './controllers/index.mjs';
import {createState,advanceState,keys,G} from './engine.mjs';
import {invariants} from '../../src/physics/gravity.js';
const checks=[],dir='docs/research-v2/work';fs.mkdirSync(dir,{recursive:true});
const cost=()=>({work:0,absoluteWork:0,impulse:0,deltaP:[0,0,0],deltaL:[0,0,0],projectionEvents:0});
const cfg={id:'trigger8',capture:true,redistribute:true,capturePositiveOnly:true,captureTriggerScale:8,captureSeparationFactor:1.5};
for(const mode of ['weak-outgoing','weak-incoming','strong-outgoing','positive-only-noop']){
 const s=createState('V2-TRIGGER-FIXTURE',cfg),b=s.bodies,scale=2,mu=G*15e6;
 for(let i=0;i<3;i++)Object.assign(b[i],{x:[6,-.5,.5][i],y:0,z:0,vx:0,vy:[0,-.2,.2][i],vz:0});
 b[0].vx=Math.sqrt(2*(mu/6-mu/((mode==='strong-outgoing'?6:16)*scale)))*(mode==='weak-incoming'?-1:1);
 const before=structuredClone(b),inv=invariants(b,G),c=cost(),n=capture(b,G,{...cfg,captureTriggerScale:mode==='positive-only-noop'?0:8},scale,c);
 if(mode==='weak-outgoing'){
  assert(n>0);const after=invariants(b,G);assert(Math.abs(after.inertialEnergy-inv.inertialEnergy)<1e-8*Math.abs(inv.inertialEnergy));
  assert(Math.hypot(...c.deltaP)<1e-8);assert(Math.hypot(...c.deltaL)<1e-8);assert(c.absoluteWork>0&&c.impulse>0);assert(Math.abs(c.work)<1e-8);
 }else{assert.equal(n,0);assert.deepEqual(b,before);}
 checks.push({mode,pass:true,cost:c});
}
const s=createState('V2-TRIGGER-CROSS-LANGUAGE',{...cfg,captureRadiusScale:1}),b=s.bodies;
for(let i=0;i<3;i++)Object.assign(b[i],{x:[6,-.5,.5][i],y:0,z:0,vx:0,vy:[0,-.2,.2][i],vz:0});
Object.assign(b[3],{x:.5,y:.3,z:0,vx:-.3,vy:.2,vz:0});
s.scale=(6.5+5.5+1)/3;b[0].vx=Math.sqrt(2*(G*15e6/6-G*15e6/(16*s.scale)));
s.initialBodies=structuredClone(b);s.initialInvariants=invariants(b,G);
const input={seed:s.seed,profile:s.cfg.id,sourceHash:'trigger-fixture',configHash:'trigger-fixture',horizon:1,controller:s.cfg,settings:s.settings,bodies:b.map(x=>({r:keys.slice(0,3).map(k=>x[k]),v:keys.slice(3).map(k=>x[k]),mass:x.mass}))};
const file=dir+'/trigger-fixture.input.json';fs.writeFileSync(file,JSON.stringify(input));
const proc=spawnSync('docs/research-v2/bin/native',[file],{encoding:'utf8'});assert.equal(proc.status,0,proc.stderr);const native=JSON.parse(proc.stdout);advanceState(s,60);
let max=0;for(let i=0;i<4;i++)for(let k=0;k<6;k++)max=Math.max(max,Math.abs(s.bodies[i][keys[k]]-(k<3?native.finalBodies[i].r[k]:native.finalBodies[i].v[k-3])));
assert(max<1e-9);assert(native.control.projectionEvents>0);assert(Math.abs(native.control.work)<1e-6);
checks.push({mode:'native-js-60frames',pass:true,maxStateDifference:max,cost:native.control});
fs.writeFileSync('docs/research-v2/results/trigger-validation.json',JSON.stringify(checks,null,2)+'\n');console.log(JSON.stringify(checks));
