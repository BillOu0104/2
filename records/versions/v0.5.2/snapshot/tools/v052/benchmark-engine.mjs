// Measurement protocol ported verbatim except: production kernel/initialization,
// explicit numerical censoring, and early termination after an absorbing planet loss.
import {Simulation} from '../../src/simulation.js';
import {settingsFromInitial} from '../../src/settings.js';
import {WorldState} from '../../src/world-state.js';
import {GravityIntegrator} from '../../src/physics/gravity.js';
import {initial as referenceInitial,energy,angular,planetOrbit,center,G} from './research-reference.mjs';
const pairs=[[0,1],[0,2],[1,2],[0,3],[1,3],[2,3]];
const dot=(a,b)=>a.reduce((n,x,i)=>n+x*b[i],0),norm=a=>Math.hypot(...a),pos=b=>[b.x,b.y,b.z],vel=b=>[b.vx,b.vy,b.vz],sub=(a,b)=>a.map((x,i)=>x-b[i]),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
function initial(seed,cfg){
 if(cfg.initialization==='research'){const s=new Simulation({seed,autorestart:false,newproperty60:false,gravityModel:'newtonian',orbitalInitialization:'research'});s.tick();return {bodies:structuredClone(s.initialBodies),settings:s.settings};}
 return referenceInitial(seed,{mode:'chaotic',...cfg});
}
class LegacyDriver{
 constructor(bodies,cfg){this.bodies=bodies;const s=new Simulation(settingsFromInitial({gravityModel:'legacy',newproperty60:false,autorestart:false,newproperty28:cfg.eps??.1,newproperty29:cfg.k??2.8},bodies));this.physics=s.modules['008'];this.physics.initializePhysics();this.steps=0;}
 advance(duration,cfg){const n=Math.ceil(duration/(cfg.dt??.00075));for(let i=0;i<n;i++){this.physics.directStep(duration/n);this.steps++;}const current=this.physics.state().bodies;this.bodies.forEach((b,i)=>Object.assign(b,current[i]));}
}
class Integrator{
 constructor(bodies,cfg){this.inner=cfg.force==='legacy'?new LegacyDriver(bodies,cfg):new GravityIntegrator(bodies,G,{model:'newtonian'});this.bodies=bodies;}
 get steps(){return this.inner.steps;}
 advance(duration,cfg){if(cfg.force==='legacy')this.inner.advance(duration,cfg);else this.inner.advance(duration,{maxStep:cfg.dt??.00075,eta:cfg.eta??.0075,adaptive:cfg.adaptive!==false,maxSteps:200000});}
}
function diagnostics(b){
 const stars=b.slice(0,3),c=center(stars),planet=b[3],r=sub(pos(planet),c.slice(0,3)),v=sub(vel(planet),c.slice(3));
 const ss=pairs.slice(0,3).map(([i,j])=>distance(b[i],b[j])),sp=stars.map(s=>distance(s,planet));
 const Eplanet=dot(v,v)/2-G*stars.reduce((n,s,i)=>n+s.mass/sp[i],0),outward=dot(r,v)>0;
 return {ss,sp,minSS:Math.min(...ss),minSP:Math.min(...sp),planetRadius:norm(r),Eplanet,outward,shape:Math.max(...ss)/Math.min(...ss),starRadii:stars.map(s=>norm(sub(pos(s),c.slice(0,3)))),hostEnergies:stars.map((_,i)=>planetOrbit(b,i).energy)};
}
export function runTrial(seed,cfg,horizon){
 const start=performance.now(),{bodies,settings}=initial(seed,cfg),world=new WorldState(),integrator=new Integrator(bodies,cfg);
 const initialBodies=structuredClone(bodies),e0=energy(bodies,cfg.force,cfg.eps),en0=energy(bodies),L0=angular(bodies),sE=energy(bodies.slice(0,3)),d0=diagnostics(bodies);
 const Lscale=Math.sqrt(G*bodies.reduce((s,b)=>s+b.mass,0)**3*Math.max(...d0.ss));
 const initialMetrics={stars:sE,L:angular(bodies.slice(0,3)),dimensionlessL:norm(angular(bodies.slice(0,3)))/Lscale,planet:planetOrbit(bodies,cfg.host??2),hostEnergies:d0.hostEnergies,shape:d0.shape,crossingTime:Math.sqrt((d0.ss.reduce((a,b)=>a+b,0)/3)**3/(G*bodies.slice(0,3).reduce((n,b)=>n+b.mass,0)))/.45};
 let lossAt=null,lossReason=null,planetBoundaryAt=null,systemBoundaryAt=null,starBoundaryAt=null,positiveEscapeAt=null,terminalAt=null,starContactAt=null;
 let stableFrames=0,stableAlive=0,aliveFrames=0,temperate=0,compactNonhierFrames=0,jointStableFrames=0,hierFrames=0,boundPlanetAtEnd=false;
 let maxEnergyError=0,maxEnergyErrorBeforeLoss=0,maxEnergyErrorBeforeContact=0,maxNewtonEnergyChange=0,maxLError=0,maxLErrorBeforeLoss=0,maxMomentumErrorBeforeLoss=0,minSS=Infinity,minSP=Infinity,closestEncounter=null,lastEp=d0.Eplanet;
 const events=[],trajectory=[];let frames=0,error=null;
 const totalFrames=Math.round(horizon*60);
 for(let f=0;f<=totalFrames;f++){
  const years=f/60;
  if(f){try{integrator.advance(.0075,cfg);}catch(e){error=e.message;break;}}
  frames=f;
  const d=diagnostics(bodies),c=center(bodies),radii=bodies.map(b=>Math.hypot(b.x-c[0],b.y-c[1],b.z-c[2]));
  if(!Number.isFinite(d.Eplanet)){error='non-finite';break;}
  if(d.minSS<minSS){minSS=d.minSS;closestEncounter={years,starDistances:d.ss,planetEnergy:d.Eplanet};}minSP=Math.min(minSP,d.minSP);
  if(starContactAt===null&&pairs.slice(0,3).some(([i,j],k)=>d.ss[k]<[settings._13,settings._21,settings._3][i]+[settings._13,settings._21,settings._3][j]))starContactAt=years;
  if(planetBoundaryAt===null&&radii[3]>settings.newproperty13)planetBoundaryAt=years;
  if(systemBoundaryAt===null&&radii.some(r=>r>settings.newproperty13))systemBoundaryAt=years;
  if(starBoundaryAt===null&&radii.slice(0,3).some(r=>r>settings.newproperty13))starBoundaryAt=years;
  if(positiveEscapeAt===null&&radii[3]>settings.newproperty13&&d.Eplanet>0&&d.outward)positiveEscapeAt=years;
  const flux=1361*bodies.slice(0,3).reduce((s,b,i)=>s+[settings._111lum_sun,settings._211lum_sun,settings._311lum_sun][i]/(Math.max(d.sp[i],.01)*1e12/settings.newproperty69/1.496e11)**2,0);
  const base=(flux*.7/(4*5.67e-8))**.25-273.15,albedo=base<0?.3+.3*Math.min(1,-base/20):.3;
  const equilibrium=Math.max(-270,Math.min(1500,(flux*(1-albedo)/(4*5.67e-8))**.25-273.15+10*Math.sin(years)));
  const w=world.update(bodies,G,Number(equilibrium.toFixed(2)),settings,years,f?1/60:0,f?1/60:0);
  if(terminalAt===null&&w.planet.terminal)terminalAt=years;
  if(lossAt===null){if(w.planet.terminal){lossAt=years;lossReason=w.planet.terminal.kind;}else if(planetBoundaryAt!==null){lossAt=planetBoundaryAt;lossReason=positiveEscapeAt!==null?'positive-energy-escape':'boundary-crossing';}}
  const compact=d.starRadii.every(r=>r<=settings.newproperty13),nonhier=d.shape<3;
  if(f){
   if(lossAt===null){aliveFrames++;if(w.epoch.kind==='stable')stableAlive++;}
   if(lossAt===null&&w.epoch.kind==='stable')stableFrames++;
   if(lossAt===null&&w.planet.temperature>=settings.newproperty45&&w.planet.temperature<=settings.newproperty46)temperate++;
   if(compact&&nonhier&&starContactAt===null){compactNonhierFrames++;if(lossAt===null&&w.epoch.kind==='stable')jointStableFrames++;}
   if(!nonhier)hierFrames++;
  }
  const E=energy(bodies,cfg.force,cfg.eps),En=energy(bodies),L=angular(bodies);
  maxEnergyError=Math.max(maxEnergyError,Math.abs(E.E-e0.E)/Math.max(Math.abs(e0.E),1e-20));
  if(lossAt===null&&starContactAt===null)maxEnergyErrorBeforeLoss=Math.max(maxEnergyErrorBeforeLoss,Math.abs(E.E-e0.E)/Math.max(Math.abs(e0.E),1e-20));
  if(starContactAt===null)maxEnergyErrorBeforeContact=Math.max(maxEnergyErrorBeforeContact,Math.abs(E.E-e0.E)/Math.max(Math.abs(e0.E),1e-20));
  maxNewtonEnergyChange=Math.max(maxNewtonEnergyChange,Math.abs(En.E-en0.E)/Math.max(Math.abs(en0.E),1e-20));
  maxLError=Math.max(maxLError,norm(sub(L,L0))/Math.max(norm(L0),Lscale*1e-12));
  if(lossAt===null&&starContactAt===null){maxLErrorBeforeLoss=Math.max(maxLErrorBeforeLoss,norm(sub(L,L0))/Math.max(norm(L0),Lscale*1e-12));const c0=center(initialBodies),mass=bodies.reduce((n,b)=>n+b.mass,0),momentum=center(bodies).slice(3).map((v,i)=>(v-c0[i+3])*mass);maxMomentumErrorBeforeLoss=Math.max(maxMomentumErrorBeforeLoss,norm(momentum)/Math.max(1,Math.sqrt(2*mass*e0.K)));}
  const jump=d.Eplanet-lastEp;
  if(jump>0&&d.minSP<.6){events.push({years,deltaPlanetSpecificEnergy:jump,planetSpecificEnergyBefore:lastEp,planetSpecificEnergyAfter:d.Eplanet,totalEnergyRelativeError:Math.abs(E.E-e0.E)/Math.max(Math.abs(e0.E),1e-20),minSS:d.minSS,minSP:d.minSP,stellarSpeeds:bodies.slice(0,3).map(b=>norm(sub(vel(b),center(bodies.slice(0,3)).slice(3))))});events.sort((a,b)=>b.deltaPlanetSpecificEnergy-a.deltaPlanetSpecificEnergy);events.length=Math.min(events.length,5);}lastEp=d.Eplanet;
  if(cfg.trace&&f%60===0)trajectory.push({years,positions:bodies.flatMap(b=>pos(b)),E:E.E,shape:d.shape,planetEnergy:d.Eplanet});
  boundPlanetAtEnd=d.hostEnergies.some(e=>e<0);
  if(lossAt!==null)break;
 }
 const completed=frames===totalFrames||lossAt!==null;
 return {source:'v0.5.2-production-kernel',integratedYears:frames/60,numericallyCensored:!!error&&lossAt===null,stoppedAtAbsorbingLoss:lossAt!==null,seed,profile:cfg.id,horizon,initial:initialMetrics,initialBodies,finalBodies:structuredClone(bodies),lossAt,lossReason,survived:lossAt===null&&completed,restrictedLife:lossAt??frames/60,planetBoundaryAt,systemBoundaryAt,starBoundaryAt,positiveEscapeAt,terminalAt,starContactAt,jointSurvived:lossAt===null&&starBoundaryAt===null&&starContactAt===null&&completed,stableFraction:stableFrames/totalFrames,stableConditional:aliveFrames?stableAlive/aliveFrames:0,temperateFraction:temperate/totalFrames,compactNonhierFraction:compactNonhierFrames/totalFrames,jointStableFraction:jointStableFrames/totalFrames,hierFraction:hierFrames/totalFrames,allStarsWithinBoundaryAtEnd:diagnostics(bodies).starRadii.every(r=>r<=settings.newproperty13),boundPlanetAtEnd,minSS,minSP,maxEnergyError,maxEnergyErrorBeforeLoss,maxEnergyErrorBeforeContact,maxNewtonEnergyChange,maxLError,maxLErrorBeforeLoss,maxMomentumErrorBeforeLoss,closestEncounter,energyGainEvents:events,trajectory,steps:integrator.steps,completed,error,wallSeconds:(performance.now()-start)/1000};
}
