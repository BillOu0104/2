import {Simulation} from '../../src/simulation.js';
import {GravityIntegrator,invariants} from '../../src/physics/gravity.js';
import {WorldState} from '../../src/world-state.js';
import {escapeCandidates} from '../../src/escape-state.js';
import {Habitability} from '../../src/habitability.js';
import {CivilizationState} from '../../src/civilization-state.js';
import {forces,capture,applyVelocity,norm,dot,cross,sub,pos,vel,keys,center} from './controllers/index.mjs';
export {keys};
export const G=1.3275440274585598e-8;
const starPairs=[[0,1],[0,2],[1,2]],distance=(a,b)=>norm(sub(pos(a),pos(b)));
const emptyCost=()=>({work:0,absoluteWork:0,impulse:0,deltaP:[0,0,0],deltaL:[0,0,0],peakAcceleration:0,accelerationIntegral:0,accelerationSquaredIntegral:0,activeTime:0,projectionEvents:0});
export function initialize(seed,cfg={}){const sim=new Simulation({seed,autorestart:false,newproperty60:false,orbitalInitialization:cfg.initialization??'research'});sim.tick();return {bodies:structuredClone(sim.initialBodies),settings:sim.settings};}
export class ControlledIntegrator extends GravityIntegrator{
 constructor(bodies,settings,cfg,cost){super(bodies,G,{model:'newtonian',radii:()=>[settings._13,settings._21,settings._3,0]});this.settings=settings;this.cfg=cfg;this.cost=cost;this.starContact=null;this.minSS=Infinity;}
 kick(h){super.kick(h);if(!this.cfg.barrier&&!this.cfg.cage)return;const a=forces(this.bodies,G,this.cfg,this.settings);for(let i=0;i<4;i++)if(this.bodies[i].mass)applyVelocity(this.bodies[i],a[i].map(x=>x*h),this.cost);}
 detectContacts(h){
  const radii=[this.settings._13,this.settings._21,this.settings._3].map((r,i)=>r*(this.settings.stellarBreathing?1+.08*Math.sin(this.time/.45/120+i*2):1));
  for(const [i,j]of starPairs){const old=[0,1,2].map(k=>this.saved[j*6+k]-this.saved[i*6+k]),change=sub(sub(pos(this.bodies[j]),pos(this.bodies[i])),old),den=dot(change,change),t=den?Math.max(0,Math.min(1,-dot(old,change)/den)):0,d=norm(old.map((x,k)=>x+t*change[k]));this.minSS=Math.min(this.minSS,d);if(d<=radii[i]+radii[j]&&this.starContact===null)this.starContact={pair:[i,j],time:this.time-h+t*h,distance:d,radius:radii[i]+radii[j]};}
 }
 advance(duration,options){
  return super.advance(duration,{...options,onAcceptedStep:(b,time)=>{const a=forces(b,G,this.cfg,this.settings),dt=time-(this.lastCostTime??0);this.lastCostTime=time;let total=0,power=0;
   for(let i=0;i<4;i++)if(b[i].mass){const x=norm(a[i]);this.cost.peakAcceleration=Math.max(this.cost.peakAcceleration,x);total+=x;power+=Math.abs(b[i].mass*dot(vel(b[i]),a[i]));this.cost.accelerationSquaredIntegral+=dt*x*x;this.cost.impulse+=dt*b[i].mass*x;}
   this.cost.accelerationIntegral+=dt*total;this.cost.absoluteWork+=dt*power;if(total>0)this.cost.activeTime+=dt;
   if(this.starContact)throw Object.assign(new Error('stellar-contact'),{physical:true});
  }});
 }
}
export function regenerate(bodies,settings,index){
 const p=bodies[3],h=(2+index)%3,host=bodies[h],stars=bodies.slice(0,3),c=center(stars),L=[0,0,0];
 for(const b of stars){const l=cross(sub(pos(b),c.slice(0,3)),sub(vel(b),c.slice(3)));for(let k=0;k<3;k++)L[k]+=b.mass*l[k];}
 const normal=norm(L)>1e-14?L.map(x=>x/norm(L)):[0,0,1],phase=index*2.399963229728653,raw=[Math.cos(phase),Math.sin(phase),.37],projection=sub(raw,normal.map(x=>x*dot(raw,normal))),radial=projection.map(x=>x/norm(projection)),tangent=cross(normal,radial),radii=[settings._13,settings._21,settings._3];
 const r=Math.max(.12*Math.min(...stars.filter((_,i)=>i!==h).map(b=>distance(host,b))),2.5*(radii[h]+settings.newproperty20)),speed=Math.sqrt(G*(host.mass+settings.newproperty8)/r);
 p.mass=settings.newproperty8;for(let k=0;k<3;k++){p[keys[k]]=host[keys[k]]+r*radial[k];p[keys[k+3]]=host[keys[k+3]]-speed*tangent[k];}
 return {host:h,radius:r};
}
export function createState(seed,cfg){
 const {bodies,settings}=initialize(seed,cfg),d=starPairs.map(([i,j])=>distance(bodies[i],bodies[j])),e=invariants(bodies,G),shared={civilizationAlive:false,civilizationCount:1,civilizationStartTime:0,civilizationRecords:[],universeNumber:1,text:'research-v2',lastCivilizationLifespan:0};
 return {seed,cfg,settings,bodies,initialBodies:structuredClone(bodies),scale:d.reduce((a,b)=>a+b,0)/3,initialInvariants:e,frame:0,cost:emptyCost(),external:{work:0,absoluteWork:0,deltaP:[0,0,0],deltaL:[0,0,0]},world:new WorldState(),habitat:new Habitability(),civilization:new CivilizationState(shared),shared,planetLosses:0,planetRespawns:0,firstPlanetLoss:null,planetReturnFrame:null,starFailure:null,error:null,escapeTimers:{},stableFrames:0,matureStableFrames:0,absentFrames:0,civilizationAliveFrames:0,civilizationBirths:0,civilizationDeaths:0,maxNumericalEnergyResidual:0,minSS:Infinity,closestPairChanges:0,lastPair:null,nonhierFrames:0,hierarchyRun:0,longestHierarchyFrames:0,bins:[],events:[],history:[],runtimeSeconds:0};
}
function externalChange(s,action){const before=invariants(s.bodies,G);const details=action();const after=invariants(s.bodies,G),w=after.inertialEnergy-before.inertialEnergy;s.external.work+=w;s.external.absoluteWork+=Math.abs(w);for(let k=0;k<3;k++){s.external.deltaP[k]+=after.momentum[k]-before.momentum[k];s.external.deltaL[k]+=after.angularMomentum[k]-before.angularMomentum[k];}return details;}
function removePlanet(s,kind){if(!s.bodies[3].mass)return;s.planetLosses++;s.firstPlanetLoss??=s.frame/60;s.planetReturnFrame=s.cfg.noRespawn?null:s.frame+300;externalChange(s,()=>{s.bodies[3].mass=0;});s.events.push({kind:'planet-loss',cause:kind,year:s.frame/60});if(s.shared.civilizationAlive){s.civilization.destroy({zh:kind,en:kind},s.frame/60,s.frame/60,s.settings);s.civilizationDeaths++;}}
function temperature(b,settings,t){let flux=0;for(let i=0;i<3;i++){const d=Math.max(distance(b[i],b[3]),.01)*1e12/settings.newproperty69/1.496e11;flux+=1361*[settings._111lum_sun,settings._211lum_sun,settings._311lum_sun][i]/(d*d);}const base=(flux*.7/(4*5.67e-8))**.25-273.15,albedo=base<0?.3+.3*Math.min(1,-base/20):.3;return Number(Math.max(-270,Math.min(1500,(flux*(1-albedo)/(4*5.67e-8))**.25-273.15+10*Math.sin(t))).toFixed(2));}
// Same seven partitions as production, allowing a genuinely absent destroyed planet.
export function candidates(bodies,settings){if(bodies[3].mass>0)return escapeCandidates(bodies,G,{...settings,newproperty60:false});const b=structuredClone(bodies);b[3].mass=1e-100;return escapeCandidates(b,G,{...settings,newproperty60:false}).filter(x=>x.partition!==7);}
export function advanceState(s,endFrame,{onCheckpoint=null,trace=false}={}){
 const start=performance.now(),integrator=new ControlledIntegrator(s.bodies,s.settings,s.cfg,s.cost);integrator.steps=s.steps??0;integrator.time=s.solverTime??0;integrator.lastCostTime=integrator.time;
 const opts={maxStep:s.cfg.dt??.00075,eta:s.cfg.eta??.0075};
 while(s.frame<endFrame&&!s.starFailure&&!s.error){
  try{integrator.advance(.0075,opts);}catch(e){if(e.physical){s.starFailure={kind:'stellar-contact',year:integrator.starContact.time/.45,...integrator.starContact};}else s.error={kind:e.code??'numerical-error',message:e.message,year:integrator.time/.45};break;}
  s.frame++;const year=s.frame/60,dt=1/60,b=s.bodies;
  const projected=capture(b,G,s.cfg,s.scale,s.cost);if(projected&&s.events.filter(x=>x.kind==='capture').length<200)s.events.push({kind:'capture',year,count:projected});
  const active=new Set();for(const c of candidates(b,s.settings)){active.add(c.partition);s.escapeTimers[c.partition]=(s.escapeTimers[c.partition]??0)+dt;if(s.escapeTimers[c.partition]>=3){if(c.kind==='stellar-separation'){s.starFailure={kind:'stellar-separation',year,...c};}else removePlanet(s,'confirmed-escape');}}
  for(const key of Object.keys(s.escapeTimers))if(!active.has(+key))delete s.escapeTimers[key];
  if(s.planetReturnFrame!==null&&s.frame>=s.planetReturnFrame){const details=externalChange(s,()=>regenerate(b,s.settings,s.planetRespawns));s.planetRespawns++;s.planetReturnFrame=null;s.world.reset();s.habitat.reset();s.civilization.reset();s.events.push({kind:'planet-respawn',year,...details});}
  let w=null;
  if(b[3].mass){w=s.world.update(b,G,temperature(b,s.settings,year),s.settings,year,dt,dt);const alive=s.shared.civilizationAlive;s.shared.tem=w.planet.temperature;
   s.habitat.update(s.shared,s.settings,dt,{alive,number:s.shared.civilizationCount,developmentYears:s.civilization.developmentYears,phase:s.civilization.phase,terminal:w.planet.terminal,damaged:!w.planet.canSupportLife,integrity:w.planet.integrity,tideRatio:w.planet.stressRatio,hazard:w.planet.stressRatio>1?'tidal':null});
   s.civilization.update(w,s.habitat.result,s.settings,year,year,dt);if(!alive&&s.shared.civilizationAlive){s.civilizationBirths++;s.habitat.begin(s.shared.civilizationCount);}if(alive&&!s.shared.civilizationAlive){s.civilizationDeaths++;s.habitat.reset();}
   if(w.planet.terminal)removePlanet(s,w.planet.terminal.kind);
  }else s.absentFrames++;
  const stable=!!b[3].mass&&w?.epoch.kind==='stable';if(stable){s.stableFrames++;if(s.frame>600000)s.matureStableFrames++;}if(s.shared.civilizationAlive)s.civilizationAliveFrames++;
  const d=starPairs.map(([i,j])=>distance(b[i],b[j])),minimum=Math.min(...d),pair=d.indexOf(minimum),ratio=Math.max(...d)/minimum;s.minSS=Math.min(s.minSS,integrator.minSS);if(pair!==s.lastPair){if(s.lastPair!==null)s.closestPairChanges++;s.lastPair=pair;}
  if(ratio<3)s.nonhierFrames++;if(ratio>5){s.hierarchyRun++;s.longestHierarchyFrames=Math.max(s.longestHierarchyFrames,s.hierarchyRun);}else s.hierarchyRun=0;
  if(s.frame%60===0){const e=invariants(b,G),residual=e.inertialEnergy-s.initialInvariants.inertialEnergy-s.cost.work-s.external.work;s.maxNumericalEnergyResidual=Math.max(s.maxNumericalEnergyResidual,Math.abs(residual)/Math.max(Math.abs(s.initialInvariants.inertialEnergy),1e-20));}
  if(trace)s.history.push({frame:s.frame,bodies:structuredClone(b),world:w,stellarContact:integrator.starContact,cost:structuredClone(s.cost)});
  if(s.frame%6000===0)s.history.push({year,distances:d,energy:invariants(b,G).inertialEnergy,costWork:s.cost.work,planetLosses:s.planetLosses,stableFraction:s.stableFrames/s.frame,nonhierFraction:s.nonhierFrames/s.frame});
  if(s.frame%60000===0){s.bins.push({year,stableFrames:s.stableFrames,matureStableFrames:s.matureStableFrames,nonhierFrames:s.nonhierFrames,closestPairChanges:s.closestPairChanges,planetLosses:s.planetLosses,absentFrames:s.absentFrames,control:structuredClone(s.cost)});s.steps=integrator.steps;s.solverTime=integrator.time;onCheckpoint?.(s);}
 }
 s.steps=integrator.steps;s.solverTime=integrator.time;s.runtimeSeconds+=(performance.now()-start)/1000;return s;
}
export function result(s,horizon){const total=Math.round(horizon*60),complete=s.frame===total&&!s.error&&!s.starFailure;return {seed:s.seed,profile:s.cfg.id,horizon,integratedYears:s.solverTime/.45,stellarIntact:complete,starFailure:s.starFailure,numericallyCensored:!!s.error,error:s.error,firstPlanetLoss:s.firstPlanetLoss,originalPlanetSurvived:complete&&!s.planetLosses,planetLosses:s.planetLosses,planetRespawns:s.planetRespawns,absentFraction:s.absentFrames/total,stableFraction:s.stableFrames/total,matureStableFraction:horizon>10000?s.matureStableFrames/((horizon-10000)*60):null,civilizationBirths:s.civilizationBirths,civilizationDeaths:s.civilizationDeaths,civilizationAliveFraction:s.civilizationAliveFrames/total,nonhierFraction:s.nonhierFrames/total,longestHierarchyYears:s.longestHierarchyFrames/60,closestPairChanges:s.closestPairChanges,minSS:s.minSS,control:s.cost,planetExternal:s.external,maxNumericalEnergyResidual:s.maxNumericalEnergyResidual,steps:s.steps,initialBodies:s.initialBodies,finalBodies:s.bodies,initialScale:s.scale,initialCrossingYears:Math.sqrt(s.scale**3/(G*s.bodies.slice(0,3).reduce((n,b)=>n+b.mass,0)))/.45,bins:s.bins,events:s.events,history:s.history,wallSeconds:s.runtimeSeconds};}
export function encode(s){return JSON.stringify(s,(k,v)=>k==='shared'&&v===s.civilization.shared?undefined:v);}
export function decode(text){const s=JSON.parse(text);s.world=Object.assign(new WorldState(),s.world);s.habitat=Object.assign(new Habitability(),s.habitat);s.civilization=Object.assign(new CivilizationState(s.shared),s.civilization);s.civilization.shared=s.shared;return s;}
