import {Simulation} from '../../src/simulation.js';
import {GravityIntegrator,invariants} from '../../src/physics/gravity.js';
import {G} from './research-reference.mjs';
import {writeFile} from 'node:fs/promises';
const samples=[];
for(let i=0;i<4;i++){
 const seed=`V052-INDEPENDENT-${i}`,s=new Simulation({seed,autorestart:false});s.tick();const initial=s.initialBodies,finals=[];
 for(const maxStep of [.00075,.000375,.0001875]){
  const p=new GravityIntegrator(structuredClone(initial),G);p.advance(4.5,{maxStep,adaptive:false});finals.push({maxStep,adaptive:false,bodies:p.bodies,diagnostics:p.diagnostics()});
 }
 const p=new GravityIntegrator(structuredClone(initial),G);p.advance(4.5);finals.push({maxStep:.00075,eta:.0075,adaptive:true,bodies:p.bodies,diagnostics:p.diagnostics()});
 samples.push({seed,G,solverTime:4.5,initial,finals,radii:[s.settings._13,s.settings._21,s.settings._3,s.settings.newproperty20]});
}
await writeFile('docs/v052/results/validation-samples.json',JSON.stringify(samples,null,2)+'\n');
