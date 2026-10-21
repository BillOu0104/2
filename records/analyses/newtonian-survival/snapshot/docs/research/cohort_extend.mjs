import {readFileSync,writeFileSync,existsSync,openSync,writeSync,fsyncSync,closeSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {runTrial} from './engine-v4.mjs';
const configPath=process.argv[2],cfg=JSON.parse(readFileSync(configPath)),dir=path.dirname(configPath);
const load=p=>readFileSync(p,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
let previous=load(path.join(dir,cfg.input)).filter(r=>cfg.profiles.some(p=>p.id===r.profile));
if(previous.length!==cfg.seeds*cfg.profiles.length||new Set(previous.map(r=>r.profile+':'+r.seed)).size!==previous.length)throw Error('Input cohort is incomplete or duplicated');
for(const horizon of cfg.horizons){
 const out=path.join(dir,cfg.outputPrefix+`-${horizon}.jsonl`),manifest=out+'.manifest.json';
 const hash=createHash('sha256').update(readFileSync(new URL('./engine-v4.mjs',import.meta.url))).update(readFileSync(configPath)).update(String(horizon)).digest('hex');
 if(existsSync(manifest)&&JSON.parse(readFileSync(manifest)).hash!==hash)throw Error('Extension config mismatch');
 writeFileSync(manifest,JSON.stringify({hash,config:cfg,horizon,rule:'Keep the entire fixed cohort; inherit known absorbing losses, recompute only unresolved/surviving trajectories; numerical stops are unresolved, never physical loss.',maxSteps:5e7},null,2)+'\n');
 const raw=existsSync(out)?readFileSync(out,'utf8'):'';if(raw&&!raw.endsWith('\n'))throw Error('Truncated extension file');
 const done=new Set(raw.trim().split('\n').filter(Boolean).map(JSON.parse).map(r=>r.profile+':'+r.seed));const fd=openSync(out,'a');let integrated=0,inherited=0;
 try{for(const old of previous){if(done.has(old.profile+':'+old.seed))continue;let row;
  if(old.lossAt!==null&&!old.error){row={...old,sourceResultHorizon:old.horizon,horizon,survived:false,jointSurvived:false,integratedThisStage:false,inheritedAbsorbingLoss:true,outcomeKnown:true,finalStateAt:old.finalStateAt??old.horizon,completed:false,wallSeconds:0,steps:0};for(const k of ['stableFraction','jointStableFraction','temperateFraction'])row[k]=old[k]*old.horizon/horizon;for(const k of ['compactNonhierFraction','hierFraction','allStarsWithinBoundaryAtEnd','maxEnergyError','maxNewtonEnergyChange'])row[k]=null;inherited++;}
  else{row={...runTrial(old.seed,{...cfg.profiles.find(p=>p.id===old.profile),maxSteps:5e7},horizon),integratedThisStage:true,inheritedAbsorbingLoss:false,outcomeKnown:true,finalStateAt:horizon};integrated++;console.log(JSON.stringify({horizon,seed:old.seed,profile:old.profile,survived:row.survived,jointSurvived:row.jointSurvived,lossAt:row.lossAt,error:row.error}));}
  writeSync(fd,JSON.stringify(row)+'\n');fsyncSync(fd);
 }}finally{closeSync(fd);}
 console.log(JSON.stringify({horizon,integrated,inherited}));previous=load(out);
}
