import {Simulation} from '../src/simulation.js';
import {writeFile} from 'node:fs/promises';
export function measure(seed,mode,ticks=6000,profile={}){
 const sim=new Simulation({seed,orbitalInitialization:mode,autorestart:false,...profile});let stable=0,active=0,inner=0,streak=0,maxStreak=0,maxLife=0,maxRadius=0,terminalAt=null;
 for(let i=0;i<ticks;i++){
  sim.tick();const w=sim.world.state,p=sim.lastPhysicsState,planet=p.bodies[3],radius=Math.hypot(planet.x-p.com.x,planet.y-p.com.y,planet.z-p.com.z),extent=Math.max(...p.bodies.slice(0,3).map(b=>Math.hypot(b.x-p.com.x,b.y-p.com.y,b.z-p.com.z)));
  stable+=!w.planet.terminal&&w.epoch.kind==='stable';inner+=radius<=extent;maxRadius=Math.max(maxRadius,radius);
  if(sim.civilization.phase==='active'){active++;streak++;maxStreak=Math.max(maxStreak,streak);}else streak=0;
  if(sim.shared.civilizationAlive)maxLife=Math.max(maxLife,sim.shared.xntime-sim.shared.civilizationStartTime);
  if(w.planet.terminal&&terminalAt===null)terminalAt=i/60;
 }
 return{seed,years:sim.shared.xntime,stableFraction:stable/ticks,activeFraction:active/ticks,insideStellarExtentFraction:inner/ticks,maxContinuousDevelopmentYears:maxStreak/ticks*sim.shared.xntime,maxCivilizationYears:maxLife,maxPlanetRadius:maxRadius,terminalAtSeconds:terminalAt};
}
if(process.argv[1]?.endsWith('/orbital-audit.mjs')||process.argv[1]==='tools/orbital-audit.mjs'){
 const seeds=['TRISOLARIS','A','B','C','D','E','F','G'],original=seeds.map(s=>measure(s,'original')),balanced=seeds.map(s=>measure(s,'balanced'));
 const summary=rows=>({stableFraction:rows.reduce((n,r)=>n+r.stableFraction,0)/rows.length,activeFraction:rows.reduce((n,r)=>n+r.activeFraction,0)/rows.length,insideFraction:rows.reduce((n,r)=>n+r.insideStellarExtentFraction,0)/rows.length,maxRadius:Math.max(...rows.map(r=>r.maxPlanetRadius)),survivingPlanets:rows.filter(r=>r.terminalAtSeconds===null).length,developedBeyondOneYear:rows.filter(r=>r.maxContinuousDevelopmentYears>1).length});
 const long=Array.from({length:24},(_,i)=>measure(`LONG-${i}`,'balanced',24000));
 const report={conditions:'Original four-body solver and cage, fixed 60 Hz, same climate and era criteria; only initialization differs. 8 seeds x 100 simulated years per mode; 24 additional seeds x 400 years. No lifetime floor or forced stable label.',original:{summary:summary(original),runs:original},balanced:{summary:summary(balanced),runs:balanced},long:{summary:summary(long),runs:long}};
 await writeFile('docs/qa/v041-hotfix-orbits.json',JSON.stringify(report,null,2));console.log(JSON.stringify({original:report.original.summary,balanced:report.balanced.summary,long:report.long.summary},null,2));
}
