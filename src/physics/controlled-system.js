import {GravityIntegrator,invariants,axes,PhysicsError} from './gravity.js';
import {capture,deflect,reflect,emptyCost,norm,dot,cross,sub,pos,vel,center} from './minimal-control.js';
import {escapeCandidates} from '../escape-state.js';

export const V2_STEP=.0001875,V2_ETA=.001875;
const pairs=[[0,1],[0,2],[1,2]];
const distance=(a,b)=>norm(sub(pos(a),pos(b)));
const unit=v=>norm(v)>1e-14?v.map(x=>x/norm(v)):[0,0,1];
function budget(b,G){const e=invariants(b,G);return {...e,L:b.reduce((s,x)=>{const h=cross(pos(x),vel(x));return s.map((a,i)=>a+x.mass*h[i]);},[0,0,0])};}

// Reference frame and lifecycle match the native confirmation: .0075 solver
// units per frame,60 frames/display year. Rendering speed never skips physics.
export class ControlledSystem{
 constructor(bodies,G,settings,{onEvent=()=>{},onPlanetLoss=()=>{},onRespawn=()=>{},onStep=null}={}){
  if(!(G>0)||bodies.length!==4||bodies.slice(0,3).some(b=>!(b.mass>0)))throw new PhysicsError('v2-initial-state','长期三星模式需要三颗正质量恒星');
  this.bodies=structuredClone(bodies);this.G=G;this.settings=settings;this.onEvent=onEvent;this.onPlanetLoss=onPlanetLoss;this.onRespawn=onRespawn;this.onStep=onStep;
  this.scale=pairs.reduce((sum,[i,j])=>sum+distance(bodies[i],bodies[j]),0)/3;
  this.initialEnergy=invariants(bodies,G).inertialEnergy;this.cost=emptyCost();this.external=emptyCost();this.frame=0;this.returnFrame=null;this.planetLosses=0;this.planetRespawns=0;this.firstPlanetLoss=null;this.stellarFailure=null;this.numericalUnknown=null;this.timers={};this.processedContacts=0;this.maxResidual=0;this.lastPlanetLoss=null;
  this.integrator=new GravityIntegrator(this.bodies,G,{model:'newtonian',radii:()=>this.radii(this.integrator.time)});
 }
 get year(){return this.frame/60;}
 get enabled(){return !!this.settings.newproperty60;}
 get cfg(){return {capture:this.enabled,reflect:this.enabled,deflect:this.enabled&&this.settings.stabilityMode==='deflect-v2',redistribute:true,capturePositiveOnly:true,captureTriggerScale:8,captureSeparationFactor:1.5};}
 radii(time){return [this.settings._13,this.settings._21,this.settings._3,this.settings.newproperty20].map((r,i)=>i<3?r*(this.settings.stellarBreathing?1+.08*Math.sin(time/.45/120+i*2):1):r);}
 event(kind,detail={}){this.onEvent({kind,year:this.year,...detail});}
 externalChange(action){
  const a=budget(this.bodies,this.G),before=this.bodies[3].mass*norm(vel(this.bodies[3]));action();const b=budget(this.bodies,this.G),w=b.inertialEnergy-a.inertialEnergy;
  this.external.work+=w;this.external.absoluteWork+=Math.abs(w);
  for(let k=0;k<3;k++){this.external.deltaP[k]+=b.momentum[k]-a.momentum[k];this.external.deltaL[k]+=b.L[k]-a.L[k];}
  this.external.impulse+=Math.abs(this.bodies[3].mass*norm(vel(this.bodies[3]))-before);
 }
 losePlanet(cause,eventTime=this.integrator.time){
  if(!this.bodies[3].mass)return;
  const fraction=Math.max(0,Math.min(1,(eventTime-this.frameStartTime)/.0075)),year=(this.frameStartFrame+fraction)/60;
  this.externalChange(()=>{this.bodies[3].mass=0;});this.planetLosses++;this.firstPlanetLoss??=year;this.lastPlanetLoss={kind:cause,year};this.returnFrame=Math.ceil((year+5)*60-1e-8);
  this.event('planet-loss',{cause,year});this.onPlanetLoss({kind:cause,year});
 }
 respawn(){
  const s=this.settings,b=this.bodies,host=(2+this.planetRespawns)%3,h=b[host],c=center(b.slice(0,3)),L=[0,0,0];
  for(let i=0;i<3;i++){const l=cross(sub(pos(b[i]),c.slice(0,3)),sub(vel(b[i]),c.slice(3)));for(let k=0;k<3;k++)L[k]+=b[i].mass*l[k];}
  const normal=unit(L),phase=this.planetRespawns*2.399963229728653,raw=[Math.cos(phase),Math.sin(phase),.37],radial=unit(sub(raw,normal.map(x=>x*dot(raw,normal)))),tangent=cross(normal,radial);
  const radius=Math.max(.12*Math.min(...b.slice(0,3).filter((_,i)=>i!==host).map(x=>distance(h,x))),2.5*([s._13,s._21,s._3][host]+s.newproperty20)),speed=Math.sqrt(this.G*(h.mass+s.newproperty8)/radius);
  this.externalChange(()=>{b[3].mass=s.newproperty8;for(let k=0;k<3;k++){b[3][axes[k]]=h[axes[k]]+radius*radial[k];b[3][axes[k+3]]=h[axes[k+3]]-speed*tangent[k];}});
  this.planetRespawns++;this.returnFrame=null;
  for(let i=0;i<3;i++)this.integrator.contactKeys.delete(`${i}:3`);
  this.event('planet-respawn',{host,radius});this.onRespawn();
 }
 beforeStep(){
  const before=this.cost.projectionEvents;deflect(this.bodies,this.G,this.cfg,this.settings,this.cost);reflect(this.bodies,this.G,this.cfg,this.settings,this.cost);
  if(this.cost.projectionEvents!==before)this.event('stellar-protection',{events:this.cost.projectionEvents-before,solverTime:this.integrator.time});
 }
 acceptedStep(){
  for(;this.processedContacts<this.integrator.contacts.length;this.processedContacts++){
   const c=this.integrator.contacts[this.processedContacts];this.event('contact',structuredClone(c));
   if(c.pair.includes(3)){if(this.bodies[3].mass)this.losePlanet('accepted-step-engulfed',this.integrator.time);}
   else{this.stellarFailure={kind:'stellar-contact',year:c.time/.45,...structuredClone(c)};throw Object.assign(new Error('stellar-contact'),{physical:true});}
  }
  this.onStep?.(this.bodies,this.integrator.time);
 }
 escapes(){
  const b=this.bodies,G=this.G,all=center(b.slice(0,3)),active=new Set();
  const observe=(key,yes,detail)=>{if(yes){active.add(key);this.timers[key]=(this.timers[key]??0)+1/60;if(this.timers[key]>=3){if(key==='planet')this.losePlanet('confirmed-escape');else this.stellarFailure??={year:this.year,...detail};}}};
  if(b[3].mass>0)observe('planet',escapeCandidates(b,G,{...this.settings,newproperty60:false,gravityModel:'newtonian'}).some(x=>x.partition===7),{});
  const outside=b.slice(0,3).some(x=>norm(sub(pos(x),all.slice(0,3)))>this.settings.newproperty13);
  for(let i=0;i<3;i++){
   const others=b.slice(0,3).filter((_,j)=>j!==i),c=center(others),M=others.reduce((sum,x)=>sum+x.mass,0),r=sub(pos(b[i]),c.slice(0,3)),v=sub(vel(b[i]),c.slice(3)),R=norm(r),radial=dot(r,v)/R,size=Math.max(...others.map(x=>norm(sub(pos(x),c.slice(0,3))))),U=-G*(b[i].mass+M)/M*others.reduce((sum,x)=>sum+x.mass/distance(x,b[i]),0),E=.5*dot(v,v)+U;
   observe('star'+i,outside&&R>4*size&&radial>0&&E>.1*Math.abs(U),{kind:'stellar-separation',star:i,distance:R,specificEnergy:E});
  }
  let triple=outside,K=0,U=0;for(let i=0;i<3;i++)K+=.5*b[i].mass*dot(sub(vel(b[i]),all.slice(3)),sub(vel(b[i]),all.slice(3)));
  for(const[i,j]of pairs){const r=sub(pos(b[i]),pos(b[j])),v=sub(vel(b[i]),vel(b[j])),R=norm(r);U-=G*b[i].mass*b[j].mass/R;if(!(.5*dot(v,v)-G*(b[i].mass+b[j].mass)/R>0&&dot(r,v)>0))triple=false;}
  observe('triple',triple&&K+U>.1*Math.abs(U),{kind:'triple-disintegration',energy:K+U});
  for(const key of Object.keys(this.timers))if(!active.has(key))delete this.timers[key];
 }
 advanceFrame(){
  if(this.stellarFailure||this.numericalUnknown)return false;
  this.frameStartFrame=this.frame;this.frameStartTime=this.integrator.time;const count=this.cost.projectionEvents;
  try{this.integrator.advance(.0075,{maxStep:V2_STEP,eta:V2_ETA,beforeStep:()=>this.beforeStep(),onAcceptedStep:()=>this.acceptedStep()});}
  catch(e){if(e.physical){this.integrator.numericalError=null;this.event('stellar-failure',this.stellarFailure);return false;}this.numericalUnknown={code:e.code??'numerical-error',message:e.message};throw e;}
  this.frame++;capture(this.bodies,this.G,this.cfg,this.scale,this.cost);if(this.cost.projectionEvents>count){this.cost.activeFrames++;this.cost.projectionFrames++;}
  this.escapes();if(this.returnFrame!==null&&this.frame>=this.returnFrame)this.respawn();
  if(this.stellarFailure)this.event('stellar-failure',this.stellarFailure);
  return true;
 }
 finishWorld(world){if(this.bodies[3].mass&&world.planet.terminal)this.losePlanet(world.planet.terminal.kind);}
 observeResidual(){if(this.frame%60===0)this.maxResidual=Math.max(this.maxResidual,Math.abs(invariants(this.bodies,this.G).inertialEnergy-this.initialEnergy-this.cost.work-this.external.work)/Math.max(Math.abs(this.initialEnergy),1e-20));}
 equilibrium(){
  let flux=0;for(let i=0;i<3;i++){const d=Math.max(distance(this.bodies[i],this.bodies[3]),.01)*1e12/this.settings.newproperty69/1.496e11;flux+=1361*[this.settings._111lum_sun,this.settings._211lum_sun,this.settings._311lum_sun][i]/(d*d);}
  const base=(flux*.7/(4*5.67e-8))**.25-273.15,albedo=base<0?.3+.3*Math.min(1,-base/20):.3,x=Math.max(-270,Math.min(1500,(flux*(1-albedo)/(4*5.67e-8))**.25-273.15+10*Math.sin(this.year)));
  return Math.sign(x)*Math.round(Math.abs(x)*100)/100;
 }
 state(){
  const e=invariants(this.bodies,this.G),residual=Math.abs(e.inertialEnergy-this.initialEnergy-this.cost.work-this.external.work)/Math.max(Math.abs(this.initialEnergy),1e-20);
  return {bodies:structuredClone(this.bodies),com:{x:e.center[0],y:e.center[1],z:e.center[2]},G:this.G,step:V2_STEP,contacts:[],diagnostics:{model:'newtonian',solverTime:this.integrator.time,steps:this.integrator.steps,controlled:this.enabled,conservationApplicable:false,physicalModelValid:!this.stellarFailure,numericalError:this.numericalUnknown,stellarFailure:this.stellarFailure,relativeEnergyError:residual,maxRelativeEnergyError:this.maxResidual,energyResidualScope:'yearly sampled; measured control and planet external work subtracted',control:structuredClone(this.cost),planetExternal:structuredClone(this.external),planetLosses:this.planetLosses,planetRespawns:this.planetRespawns,planetPresent:this.bodies[3].mass>0,firstPlanetLoss:this.firstPlanetLoss,returnFrame:this.returnFrame}};
 }
}
