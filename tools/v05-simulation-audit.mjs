import {Simulation} from '../src/simulation.js';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
function initialized(seed,generation,k2){const s=new Simulation({seed,autorestart:false,k2});s.generation=generation;s.shared.universeNumber=generation;s.setRandom();s.modules['008'].init();return s;}
function measure(s,years){let internal=0,far=0,intact=0,stable=0,active=0,maxLevel=0,longest=0;const births=new Set();
 for(let tick=0;tick<years*60;tick++){s.tick();const w=s.world.state,p=s.lastPhysicsState.bodies[3],stars=s.lastPhysicsState.bodies.slice(0,3);if(s.shared.civilizationAlive){births.add(s.shared.civilizationCount);active+=s.civilization.phase==='active'?1/60:0;maxLevel=Math.max(maxLevel,s.civilization.result.development.level);longest=Math.max(longest,s.shared.xntime-s.shared.civilizationStartTime);}
  if(w.planet.intact){intact++;const center=stars.reduce((n,b)=>({x:n.x+b.x/3,y:n.y+b.y/3,z:n.z+b.z/3}),{x:0,y:0,z:0});const r=b=>Math.hypot(b.x-center.x,b.y-center.y,b.z-center.z),edge=Math.max(...stars.map(r),.01),distance=r(p);if(distance<=edge)internal++;if(distance>2*edge)far++;if(w.epoch.kind==='stable')stable++;}
 }
 return{seed:s.settings.seed,generation:s.generation,k2:s.settings.k2,births:births.size,longestCivilizationYears:longest,activeProductionYears:active,maxLevel,intactYears:intact/60,insideStellarEnvelope:intact?internal/intact:0,farBeyondTwiceEnvelope:intact?far/intact:0,stableFraction:intact?stable/intact:0,terminal:s.world.terminal?.kind??null,finalResilience:s.habitability.result.health};
}
const cohort=[1,2,10,49,100].map(g=>measure(initialized('TRISOLARIS',g,.3),200));
assert.ok(cohort.every(r=>r.births>0));assert.ok(cohort.filter(r=>r.longestCivilizationYears>100).length>=3);
const cages=[];for(let i=0;i<8;i++){const seed=i===0?'TRISOLARIS':`V05-CAGE-${i}`;cages.push({old:measure(initialized(seed,1,.22),200),current:measure(initialized(seed,1,.3),200)});}
const mean=(key,profile)=>cages.reduce((n,r)=>n+r[profile][key],0)/cages.length;
const report={version:'0.5.0',cohort,cageComparison:{runs:8,yearsPerRun:200,oldK2:.22,newK2:.3,oldInside:mean('insideStellarEnvelope','old'),newInside:mean('insideStellarEnvelope','current'),oldFar:mean('farBeyondTwiceEnvelope','old'),newFar:mean('farBeyondTwiceEnvelope','current'),oldStable:mean('stableFraction','old'),newStable:mean('stableFraction','current'),samples:cages},limits:['Finite matched-seed samples, not a guarantee of permanent binding or civilization longevity.','Civilization lifetime includes storage; active production years are measured separately.','Cohort generations use the same text Seed with its corresponding generation PRNG sequence.']};
await writeFile('docs/qa/v05-orbits-and-civilizations.json',JSON.stringify(report,null,2));console.log(JSON.stringify({cohort,cageComparison:{...report.cageComparison,samples:undefined}},null,2));
