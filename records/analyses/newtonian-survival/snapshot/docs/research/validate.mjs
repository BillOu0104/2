import assert from 'node:assert/strict';
import {Simulation} from '../../src/simulation.js';
import {Integrator,initial,energy,potential,runTrial} from './engine.mjs';
const results=[];
for(const force of ['legacy','newton']){
 const s=new Simulation({seed:'VALIDATE',newproperty60:false,autorestart:false,newproperty28:force==='legacy'?.1:0});s.tick();
 const b=structuredClone(s.initialBodies),p=new Integrator(b,{force});
 for(let i=0;i<500;i++){s.tick();for(let j=0;j<10;j++)p.step(.00075);}
 let max=0;for(let i=0;i<4;i++)for(const k of ['x','y','z','vx','vy','vz'])max=Math.max(max,Math.abs(b[i][k]-s.lastPhysicsState.bodies[i][k]));
 assert.ok(max<1e-10,String(max));results.push({check:'actual-runtime-trajectory-parity',force,ticks:500,maxAbsoluteDifference:max});
}
for(const r of [.05,.15,.27,.4]){const h=1e-7,derivative=(potential(r+h,'legacy',.1,2.8)-potential(r-h,'legacy',.1,2.8))/(2*h);let f=r<=.1?r/.001:r<.28?(1-3/1.8+3/1.8*r/.1)/(r*r):1/(r*r);assert.ok(Math.abs(derivative-f)<1e-5);}
results.push({check:'legacy-force-potential-consistency',pass:true});
const seed='VALIDATE',a=runTrial(seed,{id:'test',force:'newton',planet:'bound',adaptive:true},2),b=runTrial(seed,{id:'test',force:'newton',planet:'bound',adaptive:true},2);assert.deepEqual(a.finalBodies,b.finalBodies);assert.equal(a.stableFraction,b.stableFraction);
results.push({check:'deterministic-initialization-and-outcomes',pass:true});
const ic=initial(seed,{planet:'bound',inPlane:true});assert.ok(energy(ic.bodies).E<0);
// Resolve the same duration with h, h/2, h/4; this does not slow the physical clock.
const states=[];for(const h of [.003,.0015,.00075]){const p=new Integrator(structuredClone(ic.bodies));for(let i=0;i<Math.round(3/h);i++)p.step(h);states.push(p.bodies);}
const diff=(a,b)=>Math.max(...a.flatMap((x,i)=>['x','y','z','vx','vy','vz'].map(k=>Math.abs(x[k]-b[i][k]))));
const e1=diff(states[0],states[2]),e2=diff(states[1],states[2]);assert.ok(e1<1e-5&&e2<e1);results.push({check:'same-duration-step-convergence',coarseDifference:e1,halfDifference:e2,ratio:e1/e2});
console.log(JSON.stringify({pass:true,results},null,2));
