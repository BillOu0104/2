// Research-only h8 copy of frozen worker48537d5; see precision-worker.diff.
import {applyPrecision} from './precision-options.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {ChaosObserver} from './chaos-observer.mjs';
import {Simulation} from '../../src/simulation.js';
import {createControlledSystem} from '../../src/v2-simulation.js';
import {checkpointV2,restoreV2,encodeV2,decodeV2} from '../../src/v2-checkpoint.js';
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const [config,shardText='0',shardsText='1']=process.argv.slice(2),cfg=JSON.parse(fs.readFileSync(config)),shard=Number(shardText),shards=Number(shardsText),dir=cfg.output;
const manifest=JSON.parse(fs.readFileSync(dir+'/manifest.json')),hash=manifest.sourceHash;
const verify=()=>{assert.equal(sha(config),manifest.configHash);for(const[p,h]of Object.entries(manifest.files))assert.equal(sha(p),h,'Frozen source changed: '+p);};verify();
const write=(p,value)=>{fs.mkdirSync(path.dirname(p),{recursive:true});const text=encodeV2(value)+'\n',fd=fs.openSync(p+'.tmp','w');fs.writeFileSync(fd,text);fs.fsyncSync(fd);fs.closeSync(fd);fs.renameSync(p+'.tmp',p);};
const resultFile=dir+`/shard${shard}.jsonl`,done=new Map();
const endpointDir=dir+'/endpoints';fs.mkdirSync(endpointDir,{recursive:true});
for(const file of fs.readdirSync(endpointDir).filter(x=>x.endsWith('.json'))){const r=decodeV2(fs.readFileSync(endpointDir+'/'+file,'utf8')),key=r.seed+'|'+r.mode+'|'+r.horizon;assert(!done.has(key),'Duplicate endpoint');assert.equal(r.sourceHash,hash);assert.equal(r.configHash,manifest.configHash);assert.equal(sha(r.checkpoint),r.checkpointSHA256);assert.equal(sha(r.rawFile),r.rawSHA256);done.set(key,r);}
const preserveWrite=(p,data)=>{if(fs.existsSync(p))fs.renameSync(p,p+'.unpublished-'+sha(p));write(p,data);};
const pairs=[[0,1],[0,2],[1,2]],d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
for(let index=cfg.start??0;index<(cfg.start??0)+cfg.seeds;index++){
 if(index%shards!==shard)continue;
 for(const mode of cfg.modes){
  verify();const seed=cfg.prefix+'-'+index,stem=dir+'/'+seed+'-'+mode,cpFile=stem+'.checkpoint.json';let sim,metrics,observer;
  if(fs.existsSync(cpFile)){const cp=decodeV2(fs.readFileSync(cpFile,'utf8'));assert.equal(cp.sourceHash,hash);assert.equal(cp.configHash,manifest.configHash);assert.equal(cp.seed,seed);assert.equal(cp.mode,mode);assert.deepEqual(cp.precision,cfg.precision);sim=restoreV2(cp.simulation);metrics=cp.metrics;observer=ChaosObserver.restore(cp.observer);console.log(JSON.stringify({resume:seed,mode,year:sim.controlled.year}));}
  else{sim=new Simulation({seed,stabilityMode:mode,newproperty60:true,autorestart:true});sim.controlled=createControlledSystem(sim);metrics={stableFrames:0,matureStableFrames:0,absentFrames:0,aliveFrames:0,activeFrames:0,births:0,deaths:0,closestChanges:0,lastPair:null,nonhierFrames:0,matureNonhierFrames:0,hierarchyRun:0,longestHierarchy:0,minStellarDistance:Infinity,events:[],bins:[],wallSeconds:0,observerUNKNOWN:null,stableYoungFrames:0,matureStableYoungFrames:0,lastRespawnFrame:null,cumulativeProjectionAngularImpulse:0};observer=new ChaosObserver(sim.controlled);}
  applyPrecision(sim.controlled,observer,cfg.precision);
  if(cfg.initialRegistry){const registry=JSON.parse(fs.readFileSync(cfg.initialRegistry)),buffer=Buffer.alloc(4*7*8);let offset=0;for(const b of sim.initialBodies)for(const key of ['x','y','z','vx','vy','vz','mass']){buffer.writeDoubleBE(b[key],offset);offset+=8;}assert.equal(crypto.createHash('sha256').update(buffer).digest('hex'),registry.seeds[seed].initialSHA256,'Pre-registered initial state mismatch');}
  const emit=sim.emit.bind(sim);sim.emit=(type,detail)=>{metrics.events.push({id:sim.eventSeq+1,type,year:sim.shared.xntime||0,detail:structuredClone(detail)});emit(type,detail);if(type==='planet:respawn')metrics.lastRespawnFrame=sim.controlled.frame;if(['physics:deflect','physics:reflect','physics:capture'].includes(type))metrics.cumulativeProjectionAngularImpulse+=Math.hypot(...detail.deltaL);if(type==='civilization:birth')metrics.births++;if(type==='civilization:death')metrics.deaths++;};
  let start=performance.now();
  const checkpoint=()=>{metrics.wallSeconds+=(performance.now()-start)/1000;start=performance.now();write(cpFile,{precision:cfg.precision,sourceHash:hash,configHash:manifest.configHash,seed,mode,simulation:checkpointV2(sim),metrics,observer:observer.checkpoint()});};
  for(const horizon of cfg.horizons){
   const key=seed+'|'+mode+'|'+horizon;if(done.has(key))continue;
   assert(sim.controlled.frame<=horizon*60,'Checkpoint passed an unrecorded endpoint');
   while(sim.controlled.frame<horizon*60&&!sim.controlled.stellarFailure&&!sim.controlled.numericalUnknown&&!metrics.observerUNKNOWN){
    try{sim.tick();}catch(e){assert(sim.controlled.numericalUnknown,'Unexpected programming error: '+e.stack);}
    const c=sim.controlled;if(c.stellarFailure||c.numericalUnknown)break;
    try{observer.observe(c);}catch(e){metrics.observerUNKNOWN={scope:'conditional-shadow',code:e.code??'observer-error',message:e.message,year:c.year};break;}
    if(sim.world.state?.epoch.kind==='stable'&&c.bodies[3].mass>0){metrics.stableFrames++;if(c.frame>600000)metrics.matureStableFrames++;if(metrics.lastRespawnFrame!==null&&c.frame-metrics.lastRespawnFrame<=1500){metrics.stableYoungFrames++;if(c.frame>600000)metrics.matureStableYoungFrames++;}}if(!c.bodies[3].mass)metrics.absentFrames++;
    if(sim.shared.civilizationAlive){metrics.aliveFrames++;if(sim.civilization.phase==='active')metrics.activeFrames++;}
    const distances=pairs.map(([i,j])=>d(c.bodies[i],c.bodies[j])),minimum=Math.min(...distances),pair=distances.indexOf(minimum),ratio=Math.max(...distances)/minimum;metrics.minStellarDistance=Math.min(metrics.minStellarDistance,minimum);if(metrics.lastPair!==null&&pair!==metrics.lastPair)metrics.closestChanges++;metrics.lastPair=pair;
    if(ratio<3){metrics.nonhierFrames++;if(c.frame>600000)metrics.matureNonhierFrames++;}if(ratio>5){metrics.hierarchyRun++;metrics.longestHierarchy=Math.max(metrics.longestHierarchy,metrics.hierarchyRun);}else metrics.hierarchyRun=0;
    if(c.frame%60000===0){metrics.bins.push({year:c.year,stableFrames:metrics.stableFrames,matureStableFrames:metrics.matureStableFrames,planetLosses:c.planetLosses,planetRespawns:c.planetRespawns,absentFrames:metrics.absentFrames,control:structuredClone(c.cost)});checkpoint();console.log(JSON.stringify({progress:seed,mode,year:c.year,steps:c.integrator.steps}));}
   }
   verify();checkpoint();const c=sim.controlled,terminal=c.stellarFailure||c.numericalUnknown||metrics.observerUNKNOWN,total=horizon*60,complete=c.frame===total&&!terminal;
   const snapshot=stem+`-${horizon}.state.json`;if(fs.existsSync(snapshot))fs.renameSync(snapshot,snapshot+'.unpublished-'+sha(snapshot));fs.copyFileSync(cpFile,snapshot);const rawFile=stem+`-${horizon}.raw.json`;preserveWrite(rawFile,{precision:cfg.precision,sourceHash:hash,configHash:manifest.configHash,seed,mode,horizon,settings:sim.settings,initialBodies:sim.initialBodies,finalBodies:c.bodies,stellarFailure:c.stellarFailure,numericalUnknown:c.numericalUnknown,control:c.cost,planetExternal:c.external,metrics,chaos:observer.result(horizon,complete),shadowWindows:observer.windows});
   const r={precision:cfg.precision,seed,mode,horizon,shard,shards,sourceHash:hash,configHash:manifest.configHash,integratedYears:c.year,solverTime:c.integrator.time,stellarIntact:complete,starFailure:c.stellarFailure,numericalUNKNOWN:c.numericalUnknown??metrics.observerUNKNOWN,primaryNumericalUNKNOWN:c.numericalUnknown,observerUNKNOWN:metrics.observerUNKNOWN,stableFraction:metrics.stableFrames/total,matureStableFraction:horizon>10000?metrics.matureStableFrames/((horizon-10000)*60):null,planetLosses:c.planetLosses,planetRespawns:c.planetRespawns,originalPlanetSurvived:complete&&!c.planetLosses,firstPlanetLoss:c.firstPlanetLoss,absentFraction:metrics.absentFrames/total,civilizationBirths:metrics.births,civilizationDeaths:metrics.deaths,civilizationAliveFraction:metrics.aliveFrames/total,civilizationActiveFraction:metrics.activeFrames/total,originalCivilizationSurvived:complete&&metrics.births>0&&metrics.deaths===0&&!!sim.shared.civilizationAlive,nonhierFraction:metrics.nonhierFrames/total,matureNonhierFraction:horizon>10000?metrics.matureNonhierFrames/((horizon-10000)*60):null,closestPairChanges:metrics.closestChanges,longestGeometricHierarchyYears:metrics.longestHierarchy/60,...observer.result(horizon,complete),chaosEvidenceStatus:'CONDITIONAL_STELLAR_FTLE_AND_GEOMETRIC_DYNAMIC_HIERARCHY',stablePostRespawn25Contribution:metrics.stableYoungFrames/total,matureStablePostRespawn25Contribution:horizon>10000?metrics.matureStableYoungFrames/((horizon-10000)*60):null,controlObservedActiveFrameFraction:c.cost.activeFrames/total,controlApplication:'velocity pulses; peak/mean continuous acceleration undefined without specified duration',cumulativeProjectionAngularImpulse:metrics.cumulativeProjectionAngularImpulse,control:c.cost,planetExternal:c.external,maxNumericalEnergyResidual:c.maxResidual,steps:c.integrator.steps,wallSeconds:metrics.wallSeconds,maxRSSMiB:process.memoryUsage().rss/1048576,generation:sim.generation,rawFile,rawSHA256:sha(rawFile),checkpoint:snapshot,checkpointSHA256:sha(snapshot)};
   const endpoint=endpointDir+'/'+seed+'-'+mode+'-'+horizon+'.json';assert(!fs.existsSync(endpoint),'Published endpoint is immutable');write(endpoint,r);done.set(key,r);console.log(JSON.stringify({complete:seed,mode,horizon,stellarIntact:complete,UNKNOWN:r.numericalUNKNOWN}));
   if(c.numericalUnknown||metrics.observerUNKNOWN)throw new Error('Numerical UNKNOWN preserved; stop for review');
  }
 }
}

const own=[...done.values()].filter(r=>r.shard===shard).sort((a,b)=>a.seed.localeCompare(b.seed)||a.mode.localeCompare(b.mode)||a.horizon-b.horizon);const fd=fs.openSync(resultFile+'.tmp','w');fs.writeFileSync(fd,own.map(r=>encodeV2(r)).join('\n')+'\n');fs.fsyncSync(fd);fs.closeSync(fd);fs.renameSync(resultFile+'.tmp',resultFile);
