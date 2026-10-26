import {ControlledSystem} from './physics/controlled-system.js';

function absentWorld(sim){
 const old=sim.world.state??{stars:[],planet:{}},terminal={kind:sim.controlled.lastPlanetLoss?.kind??'absent',zh:'行星已毁灭 · 等待新行星',en:'Planet lost · awaiting a new planet'};
 const radii=sim.controlled.radii(sim.controlled.integrator.time);
 return {...old,stars:sim.controlled.bodies.slice(0,3).map((_,i)=>({...old.stars?.[i],radius:radii[i]})),epoch:{kind:'chaotic',primary:-1,stableFor:0,stableForUnit:'years'},phenomena:[],safeToWake:false,
  planet:{...old.planet,present:false,intact:false,terminal,canSupportLife:false,restartRequired:false,damaged:true,recoverable:false,integrity:0,condition:'absent',temperature:old.planet.temperature??-270,stressRatio:0,tideRatio:0}};
}
export function createControlledSystem(sim){
 // The existing initializer owns Seed/manual inputs. Initialize without taking
 // an extra physical frame; then the V2 runtime alone advances those bodies.
 sim.modules['008'].initializePhysics();sim.v2YearOrigin=sim.shared.xntime||0;
 const p=sim.modules['008'].state();
 return new ControlledSystem(sim.initialBodies,p.G,sim.settings,{
  onEvent:e=>sim.emit('physics:'+e.kind,e,sim.v2YearOrigin+e.year),
  onPlanetLoss:e=>{
   const names={'confirmed-escape':['行星确认逃逸','Planet escape confirmed'],'accepted-step-engulfed':['行星被恒星吞噬','Planet engulfed by a star'],engulfed:['行星被恒星吞噬','Planet engulfed by a star'],disrupted:['行星被潮汐撕裂','Planet tidally disrupted']};
   const cause={kind:e.kind,zh:names[e.kind]?.[0]??'行星毁灭',en:names[e.kind]?.[1]??'Planet destroyed'};
   sim.civilization.destroy(cause,sim.v2YearOrigin+e.year,sim.engine.runtime,sim.settings);sim.habitability.reset();sim.orbitTrace.resetBody(3);sim.world.terminal=cause;sim.emit('planet:destroyed',cause,sim.v2YearOrigin+e.year);
  },
  onRespawn:()=>{sim.orbitTrace.resetBody(3);sim.world.reset();sim.habitability.reset();sim.civilization.reset();sim.emit('planet:respawn',{number:sim.controlled.planetRespawns},sim.v2YearOrigin+sim.controlled.year);},
  onStep:sim.traceEnabled?(b,time)=>{if(sim.settings.newproperty14)sim.orbitTrace.observe(b,sim.engine.runtime-1/60+(time-sim.controlled.frameStartTime)/.0075/60);}:null
 });
}
export function tickControlled(sim){
 if(sim.pendingRestart)sim.restart(sim.pendingRestart);
 if(!sim.controlled)sim.controlled=createControlledSystem(sim);
 const c=sim.controlled;c.settings=sim.settings;
 if(c.stellarFailure||c.numericalUnknown)return sim.lastPhysicsState??c.state();
 if(sim.settings.gravityModel!=='newtonian'||sim.settings.civilizationMode!=='balanced'||sim.settings.physicsMode!=='reference')throw new Error('V2需要牛顿引力、文明延续模式和参考时钟；请切回旧版模式使用其他组合');
 sim.engine.runtime=++sim.tickCount/60;
 const before=sim.shared.civilizationRecords.length,alive=sim.shared.civilizationAlive;
 try{c.advanceFrame();}catch(e){sim.emit('physics:numerical-error',{code:e.code??'numerical-error',message:e.message,numericalUnknown:true});throw e;}
 sim.shared.xntime=sim.v2YearOrigin+(c.stellarFailure?.year??c.year);sim.statistics.totalYears=sim.shared.xntime;
 const b=c.bodies;
 if(c.stellarFailure){
  if(!sim.v2FailureNotified){sim.v2FailureNotified=true;sim.emit(c.stellarFailure.kind==='stellar-contact'?'system:stellar-contact':'system:escape',{...c.stellarFailure,modelValid:false});}
  sim.statistics.observe(sim.shared.xntime,sim.shared);
  for(const record of sim.shared.civilizationRecords.slice(before))sim.recordDeath(record);
  sim.shared.tj=1;sim.escape.result={confirmed:true,candidate:c.stellarFailure,years:3,confirmationYears:3};sim.lastPhysicsState=c.state();return sim.lastPhysicsState;
 }
 for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)sim.shared[`d${i+1}${j+1}`]=Math.hypot(b[i].x-b[j].x,b[i].y-b[j].y,b[i].z-b[j].z);
 sim.shared.text=`/Seed:${sim.settings.seed}/Universe:${sim.generation}`;
 let w;
 if(b[3].mass>0&&!c.stellarFailure){
  w=sim.world.update(b,c.G,c.equilibrium(),sim.settings,c.year,1/60,1/60);w.planet.present=true;sim.shared.tem=w.planet.temperature;
  const wasAlive=sim.shared.civilizationAlive,phase=sim.civilization.phase,level=sim.civilization.result?.development?.level;
  sim.habitability.update(sim.shared,sim.settings,1/60,{alive:wasAlive,number:sim.shared.civilizationCount,developmentYears:sim.civilization.developmentYears,phase,terminal:w.planet.terminal,damaged:!w.planet.canSupportLife,integrity:w.planet.integrity,tideRatio:w.planet.stressRatio,hazard:w.planet.stressRatio>1?'tidal':null});
  sim.civilization.update(w,sim.habitability.result,sim.settings,sim.shared.xntime,sim.engine.runtime,1/60);
  if(!wasAlive&&sim.shared.civilizationAlive){sim.habitability.begin(sim.shared.civilizationCount);Object.assign(sim.habitability.result,{health:1,population:1,storageQuality:1,level:1});}
  if(wasAlive&&!sim.shared.civilizationAlive){sim.habitability.reset();sim.habitability.update(sim.shared,sim.settings,0,{terminal:w.planet.terminal,damaged:!w.planet.canSupportLife,tideRatio:w.planet.stressRatio,integrity:w.planet.integrity});}
  sim.shared.civilizationDevelopment=sim.civilization.result?.development;
  if(level&&sim.shared.civilizationDevelopment?.level>level)sim.emit('civilization:level',{number:sim.shared.civilizationCount,universe:sim.generation,development:sim.shared.civilizationDevelopment});
  if(phase!==sim.civilization.phase)sim.emit('civilization:phase',{phase:sim.civilization.phase,number:sim.shared.civilizationCount});
  c.finishWorld(w);
  if(!b[3].mass)w=absentWorld(sim);
 }else w=absentWorld(sim);
 if(!b[3].mass){sim.shared.txt1=sim.settings.cnen2?'Awaiting a new planet':'等待新行星';sim.shared.txt7=sim.settings.cnen2?`Last lifetime: ${sim.shared.lastCivilizationLifespan??0} years`:`上个文明寿命：${sim.shared.lastCivilizationLifespan??0}年`;}
 c.observeResidual();
 sim.world.state=w;sim.shared.tem=w.planet.temperature;
 sim.era=w.epoch.kind==='stable'?(sim.settings.cnen2?'Stable Era':'恒纪元'):(sim.settings.cnen2?'Chaotic Era':'乱纪元');
 sim.statistics.observe(sim.shared.xntime,sim.shared);
 if(!alive&&sim.shared.civilizationAlive)sim.emit('civilization:birth',{number:sim.shared.civilizationCount});
 for(const record of sim.shared.civilizationRecords.slice(before))sim.recordDeath(record);
 if(sim.shared.civilizationRecords.length>1000)sim.shared.civilizationRecords.splice(0,sim.shared.civilizationRecords.length-1000);
 sim.escape.result={confirmed:!!c.stellarFailure,candidate:c.stellarFailure,years:0,confirmationYears:3};sim.shared.tj=c.stellarFailure?1:0;
 if(c.stellarFailure&&!sim.v2FailureNotified){sim.v2FailureNotified=true;sim.emit(c.stellarFailure.kind==='stellar-contact'?'system:stellar-contact':'system:escape',{...c.stellarFailure,modelValid:false});}
 sim.modules['156'].update('');sim.lastPhysicsState=c.state();return sim.lastPhysicsState;
}
