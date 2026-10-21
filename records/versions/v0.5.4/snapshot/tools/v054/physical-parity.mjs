import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';
import {Simulation} from '../../src/simulation.js';
const baseline=process.argv[2];if(!baseline)throw Error('Pass a clean worktree checked out at the v0.5.3 tag');
const {Simulation:Previous}=await import(pathToFileURL(`${baseline}/src/simulation.js`));
const results=[];const physical=bodies=>bodies.map(b=>Object.fromEntries(['x','y','z','vx','vy','vz','mass'].map(k=>[k,b[k]])));
for(let i=0;i<8;i++){
 const seed=`V054-PHYSICS-PARITY-${i}`,settings={seed,autorestart:false},old=new Previous(settings),current=new Simulation(settings);let ticks=0,error=null;
 for(;ticks<12000;ticks++){
  let a,b;try{old.tick();}catch(e){a=e;}try{current.tick();}catch(e){b=e;}
  if(a||b){assert.equal(a?.code,b?.code);assert.equal(a?.message,b?.message);error=a?.message;break;}
  if(ticks%120===0){assert.deepEqual(physical(old.snapshot().bodies),physical(current.snapshot().bodies));assert.deepEqual(old.snapshot().physics,current.snapshot().physics);}
 }
 const a=old.snapshot(),b=current.snapshot();assert.deepEqual(physical(a.bodies),physical(b.bodies));assert.deepEqual(a.physics,b.physics);
 results.push({seed,ticks,years:a.year,exactStateParity:true,exactConservationDiagnosticParity:true,energy:a.physics?.energy,error});
}
await writeFile('docs/v054/results/physical-parity.json',JSON.stringify({passed:true,baseline:'v0.5.3 / 292d21d',source:'Actual production Simulation in both versions; no resets; eight predetermined seeds x 200 displayed years',results},null,2)+'\n');console.log(JSON.stringify({passed:true,seeds:results.length},null,2));
