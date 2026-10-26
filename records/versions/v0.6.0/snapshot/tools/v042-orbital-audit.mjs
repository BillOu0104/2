import {Simulation} from '../src/simulation.js';
import {settingsFromInitial} from '../src/settings.js';
import {writeFile} from 'node:fs/promises';
export function measureChaotic(seed,mode='chaotic',ticks=12000,profile={}){
 const sim=new Simulation({stabilityMode:'off',seed,orbitalInitialization:mode,autorestart:false,...profile});let far=0,unbound=0,intact=0,inner=0,stable=0,development=0,terminal=false;
 const min=[Infinity,Infinity,Infinity],max=[0,0,0];
 for(let i=0;i<ticks;i++){
  sim.tick();const p=sim.lastPhysicsState,w=sim.world.state,planet=p.bodies[3],stars=p.bodies.slice(0,3),extent=Math.max(.1,...stars.map(b=>Math.hypot(b.x-p.com.x,b.y-p.com.y,b.z-p.com.z))),radius=Math.hypot(planet.x-p.com.x,planet.y-p.com.y,planet.z-p.com.z);
  const mass=p.bodies.reduce((n,b)=>n+b.mass,0),v=['vx','vy','vz'].map(k=>p.bodies.reduce((n,b)=>n+b.mass*b[k],0)/mass);
  const energy=.5*((planet.vx-v[0])**2+(planet.vy-v[1])**2+(planet.vz-v[2])**2)-p.G*stars.reduce((n,b)=>n+b.mass/Math.hypot(b.x-planet.x,b.y-planet.y,b.z-planet.z),0);
  if(!w.planet.terminal){intact++;far+=radius>extent*2;unbound+=energy>0&&radius>extent*1.5;inner+=radius<extent;}
  terminal=!!w.planet.terminal;stable+=!terminal&&w.epoch.kind==='stable';development+=sim.civilization.phase==='active';
  for(const [j,[a,b]]of[[0,[0,1]],[1,[1,2]],[2,[0,2]]]){const d=Math.hypot(stars[a].x-stars[b].x,stars[a].y-stars[b].y,stars[a].z-stars[b].z);min[j]=Math.min(min[j],d);max[j]=Math.max(max[j],d);}
 }
 return{seed,years:sim.shared.xntime,farFraction:far/Math.max(1,intact),unboundFarFraction:unbound/Math.max(1,intact),insideFraction:inner/Math.max(1,intact),stableFraction:stable/ticks,developmentFraction:development/ticks,survivingPlanet:!terminal,stellarDistanceRatios:max.map((m,i)=>m/Math.max(1e-8,min[i]))};
}
export function sensitiveDependence(ticks=12000,profile={}){
 const s=new Simulation({stabilityMode:'off',seed:'TRISOLARIS',autorestart:false,...profile});s.tick();const first=s.initialBodies,second=structuredClone(first);second[0].vx+=1e-7;
 const a=new Simulation(settingsFromInitial(s.settings,first)),b=new Simulation(settingsFromInitial(s.settings,second));let maxSeparation=0;
 for(let i=0;i<ticks;i++){a.tick();b.tick();if(i%60===0){const x=a.lastPhysicsState,y=b.lastPhysicsState;maxSeparation=Math.max(maxSeparation,Math.sqrt(x.bodies.slice(0,3).reduce((n,p,j)=>n+(p.x-x.com.x-y.bodies[j].x+y.com.x)**2+(p.y-x.com.y-y.bodies[j].y+y.com.y)**2+(p.z-x.com.z-y.bodies[j].z+y.com.z)**2,0)/3));}}
 return{initialVelocityPerturbation:1e-7,years:a.shared.xntime,maxStellarRmsSeparation:maxSeparation};
}
if(process.argv[1]?.endsWith('v042-orbital-audit.mjs')){
 const seeds=['TRISOLARIS','A','B','C','D','E','F','G',...Array.from({length:8},(_,i)=>`CHAOS-${i}`)],oldProfile={brfontcoloraaaaaarandomposrange:2,rc:.2,k2:.5,newproperty67:2.1};
 const original=seeds.map(s=>measureChaotic(s,'original',12000,oldProfile)),chaotic=seeds.map(s=>measureChaotic(s));
 const summarize=rows=>Object.fromEntries([...['farFraction','unboundFarFraction','insideFraction','stableFraction','developmentFraction'].map(k=>[k,rows.reduce((n,r)=>n+r[k],0)/rows.length]),['survivingPlanets',rows.filter(r=>r.survivingPlanet).length]]);
 const report={conditions:'16 matched Seeds, each 200 simulated years at 60 Hz, auto restart off. Old original defaults versus v0.4.2 larger chaotic defaults. Far = planet radius > 2 times current stellar extent; unbound-far also requires positive stellar binding energy and radius > 1.5 times extent. Occupancies average each seed while its planet is intact. These are finite-run proxies for an ejection, not asymptotic escape probabilities. No damping, planet tether or stable-era override.',oldProfile,original:{summary:summarize(original),runs:original},chaotic:{summary:summarize(chaotic),runs:chaotic},sensitivity:sensitiveDependence()};
 await writeFile('docs/qa/v042-orbits.json',JSON.stringify(report,null,2));console.log(JSON.stringify({original:report.original.summary,chaotic:report.chaotic.summary,sensitivity:report.sensitivity},null,2));
}
