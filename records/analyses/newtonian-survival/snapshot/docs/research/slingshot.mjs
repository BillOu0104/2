import {writeFileSync} from 'node:fs';
import {initial,Integrator,energy,G} from './engine.mjs';
const reports=[];
// Diagnostic cases selected after the complete phase1 cohort, never used to screen an initializer.
for(const seed of ['EXPLORE-A-3','EXPLORE-A-15']){
 const {bodies}=initial(seed,{}),solver=new Integrator(bodies),E0=energy(bodies).E;
 const observe=()=>{
  const p=bodies[3],dist=bodies.slice(0,3).map(b=>Math.hypot(b.x-p.x,b.y-p.y,b.z-p.z));
  const ep=.5*(p.vx*p.vx+p.vy*p.vy+p.vz*p.vz)-G*bodies.slice(0,3).reduce((n,b,i)=>n+b.mass/dist[i],0);
  const power=bodies.slice(0,3).map((b,i)=>G*b.mass*((b.x-p.x)*b.vx+(b.y-p.y)*b.vy+(b.z-p.z)*b.vz)/dist[i]**3);
  return {ep,power,dist};
 };
 const start=observe(),work=[0,0,0],points=['years,planetSpecificEnergy,workStar1,workStar2,workStar3,energyError,minPlanetDistance'];
 let before=start,t=0,maxError=0,minSP=Infinity,firstPositive=null;
 for(let frame=0;frame<70*60;frame++){
  let remain=.0075;
  while(remain>1e-14){const h=Math.min(remain,.0001875,.0075*solver.timescale());solver.step(h);t+=h;remain-=h;const next=observe();for(let j=0;j<3;j++)work[j]+=.5*h*(before.power[j]+next.power[j]);before=next;}
  const err=Math.abs(energy(bodies).E-E0)/Math.abs(E0);maxError=Math.max(maxError,err);minSP=Math.min(minSP,...before.dist);
  if(firstPositive===null&&before.ep>0)firstPositive=(frame+1)/60;
  if(frame%6===5)points.push([(frame+1)/60,before.ep,...work,err,Math.min(...before.dist)].join(','));
 }
 const delta=before.ep-start.ep,workSum=work.reduce((a,b)=>a+b,0);
 writeFileSync(`docs/research/results/slingshot-${seed}.csv`,points.join('\n')+'\n');
 reports.push({seed,solverTime:t,displayYears:70,initialPlanetSpecificEnergy:start.ep,finalPlanetSpecificEnergy:before.ep,deltaPlanetSpecificEnergy:delta,integratedMovingStarWork:workSum,workByStar:work,workIdentityAbsoluteResidual:Math.abs(delta-workSum),maxTotalEnergyRelativeError:maxError,minPlanetDistance:minSP,firstPositivePlanetSpecificEnergyAt:firstPositive});
}
writeFileSync('docs/research/results/slingshot-summary.json',JSON.stringify({identity:'d[0.5*v_planet^2 - sum(G*M_star/r)]/dt = sum(G*M_star*(r_star-r_planet).v_star/r^3) in inertial COM frame',selection:'Post-hoc mechanism diagnostics; all cohort seeds retained; not evidence of an improved seed generator',reports},null,2)+'\n');
console.log(JSON.stringify(reports,null,2));
