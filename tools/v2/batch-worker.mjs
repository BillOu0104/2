import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {Simulation} from '../../src/simulation.js';
import {createControlledSystem} from '../../src/v2-simulation.js';
import {checkpointV2,restoreV2,encodeV2,decodeV2} from '../../src/v2-checkpoint.js';
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const [config,shardText='0',shardsText='1']=process.argv.slice(2),cfg=JSON.parse(fs.readFileSync(config)),shard=Number(shardText),shards=Number(shardsText),dir=cfg.output;
const manifest=JSON.parse(fs.readFileSync(dir+'/manifest.json')),hash=manifest.sourceHash;
const verify=()=>{assert.equal(sha(config),manifest.configHash);for(const[p,h]of Object.entries(manifest.files))assert.equal(sha(p),h,'Frozen source changed: '+p);};verify();
const write=(p,value)=>{fs.mkdirSync(path.dirname(p),{recursive:true});const text=encodeV2(value)+'\n',fd=fs.openSync(p+'.tmp','w');fs.writeFileSync(fd,text);fs.fsyncSync(fd);fs.closeSync(fd);fs.renameSync(p+'.tmp',p);};
const resultFile=dir+`/shard${shard}.jsonl`,done=new Map();
if(fs.existsSync(resultFile))for(const line of fs.readFileSync(resultFile,'utf8').trim().split('\n').filter(Boolean)){const r=decodeV2(line),key=r.seed+'|'+r.mode+'|'+r.horizon;assert(!done.has(key),'Duplicate result');assert.equal(r.sourceHash,hash);assert.equal(sha(r.checkpoint),r.checkpointSHA256);assert.equal(sha(r.rawFile),r.rawSHA256);done.set(key,r);}
const pairs=[[0,1],[0,2],[1,2]],d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
for(let index=0;index<cfg.seeds;index++){
 if(index%shards!==shard)continue;
 for(const mode of cfg.modes){
  verify();const seed=cfg.prefix+'-'+index,stem=dir+'/'+seed+'-'+mode,cpFile=stem+'.checkpoint.json';let sim,metrics;
  if(fs.existsSync(cpFile)){const cp=decodeV2(fs.readFileSync(cpFile,'utf8'));assert.equal(cp.sourceHash,hash);assert.equal(cp.configHash,manifest.configHash);assert.equal(cp.seed,seed);assert.equal(cp.mode,mode);sim=restoreV2(cp.simulation);metrics=cp.metrics;console.log(JSON.stringify({resume:seed,mode,year:sim.controlled.year}));}
  else{sim=new Simulation({seed,stabilityMode:mode,newproperty60:true,autorestart:true});sim.controlled=createControlledSystem(sim);metrics={stableFrames:0,matureStableFrames:0,absentFrames:0,aliveFrames:0,activeFrames:0,births:0,deaths:0,closestChanges:0,lastPair:null,nonhierFrames:0,matureNonhierFrames:0,hierarchyRun:0,longestHierarchy:0,minStellarDistance:Infinity,events:[],bins:[],wallSeconds:0};}
  const emit=sim.emit.bind(sim);sim.emit=(type,detail)=>{metrics.events.push({id:sim.eventSeq+1,type,year:sim.shared.xntime||0,detail:structuredClone(detail)});emit(type,detail);if(type==='civilization:birth')metrics.births++;if(type==='civilization:death')metrics.deaths++;};
  let start=performance.now();
  const checkpoint=()=>{metrics.wallSeconds+=(performance.now()-start)/1000;start=performance.now();write(cpFile,{sourceHash:hash,configHash:manifest.configHash,seed,mode,simulation:checkpointV2(sim),metrics});};
  for(const horizon of cfg.horizons){
   const key=seed+'|'+mode+'|'+horizon;if(done.has(key))continue;
   assert(sim.controlled.frame<=horizon*60,'Checkpoint passed an unrecorded endpoint');
   while(sim.controlled.frame<horizon*60&&!sim.controlled.stellarFailure&&!sim.controlled.numericalUnknown){
    try{sim.tick();}catch(e){assert(sim.controlled.numericalUnknown,'Unexpected programming error: '+e.stack);}
    const c=sim.controlled;if(c.stellarFailure||c.numericalUnknown)break;
    if(sim.world.state?.epoch.kind==='stable'&&c.bodies[3].mass>0){metrics.stableFrames++;if(c.frame>600000)metrics.matureStableFrames++;}if(!c.bodies[3].mass)metrics.absentFrames++;
    if(sim.shared.civilizationAlive){metrics.aliveFrames++;if(sim.civilization.phase==='active')metrics.activeFrames++;}
    const distances=pairs.map(([i,j])=>d(c.bodies[i],c.bodies[j])),minimum=Math.min(...distances),pair=distances.indexOf(minimum),ratio=Math.max(...distances)/minimum;metrics.minStellarDistance=Math.min(metrics.minStellarDistance,minimum);if(metrics.lastPair!==null&&pair!==metrics.lastPair)metrics.closestChanges++;metrics.lastPair=pair;
    if(ratio<3){metrics.nonhierFrames++;if(c.frame>600000)metrics.matureNonhierFrames++;}if(ratio>5){metrics.hierarchyRun++;metrics.longestHierarchy=Math.max(metrics.longestHierarchy,metrics.hierarchyRun);}else metrics.hierarchyRun=0;
    if(c.frame%60000===0){metrics.bins.push({year:c.year,stableFrames:metrics.stableFrames,matureStableFrames:metrics.matureStableFrames,planetLosses:c.planetLosses,planetRespawns:c.planetRespawns,absentFrames:metrics.absentFrames,control:structuredClone(c.cost)});checkpoint();console.log(JSON.stringify({progress:seed,mode,year:c.year,steps:c.integrator.steps}));}
   }
   verify();checkpoint();const c=sim.controlled,terminal=c.stellarFailure||c.numericalUnknown,total=horizon*60,complete=c.frame===total&&!terminal;
   const snapshot=stem+`-${horizon}.state.json`;fs.copyFileSync(cpFile,snapshot);const rawFile=stem+`-${horizon}.raw.json`;write(rawFile,{sourceHash:hash,configHash:manifest.configHash,seed,mode,horizon,settings:sim.settings,initialBodies:sim.initialBodies,finalBodies:c.bodies,stellarFailure:c.stellarFailure,numericalUnknown:c.numericalUnknown,control:c.cost,planetExternal:c.external,metrics});
   const r={seed,mode,horizon,sourceHash:hash,configHash:manifest.configHash,integratedYears:c.year,solverTime:c.integrator.time,stellarIntact:complete,starFailure:c.stellarFailure,numericalUNKNOWN:c.numericalUnknown,stableFraction:metrics.stableFrames/total,matureStableFraction:horizon>10000?metrics.matureStableFrames/((horizon-10000)*60):null,planetLosses:c.planetLosses,planetRespawns:c.planetRespawns,originalPlanetSurvived:complete&&!c.planetLosses,firstPlanetLoss:c.firstPlanetLoss,absentFraction:metrics.absentFrames/total,civilizationBirths:metrics.births,civilizationDeaths:metrics.deaths,civilizationAliveFraction:metrics.aliveFrames/total,civilizationActiveFraction:metrics.activeFrames/total,originalCivilizationSurvived:complete&&metrics.births>0&&metrics.deaths===0&&!!sim.shared.civilizationAlive,nonhierFraction:metrics.nonhierFrames/total,matureNonhierFraction:horizon>10000?metrics.matureNonhierFrames/((horizon-10000)*60):null,closestPairChanges:metrics.closestChanges,longestGeometricHierarchyYears:metrics.longestHierarchy/60,chaosEvidenceStatus:'GEOMETRY_ONLY_CONDITIONAL_FTLE_NOT_MEASURED',control:c.cost,planetExternal:c.external,maxNumericalEnergyResidual:c.maxResidual,steps:c.integrator.steps,wallSeconds:metrics.wallSeconds,maxRSSMiB:process.memoryUsage().rss/1048576,generation:sim.generation,rawFile,rawSHA256:sha(rawFile),checkpoint:snapshot,checkpointSHA256:sha(snapshot)};
   const fd=fs.openSync(resultFile,'a');fs.writeFileSync(fd,encodeV2(r)+'\n');fs.fsyncSync(fd);fs.closeSync(fd);done.set(key,r);console.log(JSON.stringify({complete:seed,mode,horizon,stellarIntact:complete,UNKNOWN:r.numericalUNKNOWN}));
   if(c.numericalUnknown)throw new Error('Numerical UNKNOWN preserved; stop for review');
  }
 }
}
