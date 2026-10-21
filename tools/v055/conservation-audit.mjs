import {pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';
const root=process.argv[2]||process.cwd(),output=process.argv[3]||'docs/v055/results/conservation-before.json';
const {Simulation}=await import(pathToFileURL(`${root}/src/simulation.js`));
const axes=['x','y','z'],norm=x=>Math.hypot(...x);
function measure(bodies,G){
 const mass=bodies.reduce((n,b)=>n+b.mass,0),position=axes.map(k=>bodies.reduce((n,b)=>n+b.mass*b[k],0)/mass),momentum=axes.map(k=>bodies.reduce((n,b)=>n+b.mass*b['v'+k],0));
 let energy=bodies.reduce((n,b)=>n+.5*b.mass*axes.reduce((s,k)=>s+b['v'+k]**2,0),0);
 for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)energy-=G*bodies[i].mass*bodies[j].mass/norm(axes.map(k=>bodies[i][k]-bodies[j][k]));
 return{mass,position,momentum,energy};
}
const results=[];
for(let i=0;i<4;i++){
 const seed=`V055-CONSERVATION-${i}`,s=new Simulation({seed,newproperty60:false,autorestart:false});s.tick();let state=s.snapshot(),initial=measure(s.initialBodies,state.G),maxCenterDrift=0,maxMomentumError=0,maxEnergyError=0,maxEnergyErrorBeforeContact=0,firstContactYear=null,error=null;
 const momentumScale=Math.max(1,...s.initialBodies.map(b=>b.mass*norm(axes.map(k=>b['v'+k]))));
 for(let n=1;n<60000;n++){
  try{s.tick();}catch(e){error={code:e.code,message:e.message,year:s.shared.xntime};break;}
  state=s.snapshot();const v=measure(state.bodies,state.G),time=state.physics.solverTime;
  maxCenterDrift=Math.max(maxCenterDrift,norm(v.position.map((x,k)=>x-initial.position[k]-initial.momentum[k]/initial.mass*time)));
  maxMomentumError=Math.max(maxMomentumError,norm(v.momentum.map((x,k)=>x-initial.momentum[k]))/momentumScale);
  const de=Math.abs((v.energy-initial.energy)/initial.energy);maxEnergyError=Math.max(maxEnergyError,de);
  if(!state.physics.contacts.length)maxEnergyErrorBeforeContact=Math.max(maxEnergyErrorBeforeContact,de);else if(firstContactYear===null)firstContactYear=state.year;
 }
 const end=measure(state.bodies,state.G);results.push({seed,years:state.year,initialCenter:initial.position,initialCenterVelocity:initial.momentum.map(x=>x/initial.mass),finalCenter:end.position,maxCenterDrift,maxNormalizedMomentumError:maxMomentumError,maxRelativeInertialEnergyError:maxEnergyError,maxRelativeInertialEnergyErrorBeforeContact:maxEnergyErrorBeforeContact,firstContactYear,bodies:state.bodies.map(b=>({position:axes.map(k=>b[k]),velocity:axes.map(k=>b['v'+k]),mass:b.mass})),error});
}
await writeFile(output,JSON.stringify({source:root,protocol:'Four predetermined seeds, 1000 displayed years each; default research/Newtonian, cage and restart off. Inertial energy, momentum and predicted COM computed independently from all physical bodies every tick. Contact errors separated; no seed filtering.',results},null,2)+'\n');
console.log(JSON.stringify(results.map(({seed,years,maxCenterDrift,maxNormalizedMomentumError,maxRelativeInertialEnergyError,maxRelativeInertialEnergyErrorBeforeContact,firstContactYear,error})=>({seed,years,maxCenterDrift,maxNormalizedMomentumError,maxRelativeInertialEnergyError,maxRelativeInertialEnergyErrorBeforeContact,firstContactYear,error})),null,2));
