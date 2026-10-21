import {readFileSync,writeFileSync,existsSync,openSync,writeSync,fsyncSync,closeSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {runTrial} from './engine-v2.mjs';
const cfg=JSON.parse(readFileSync('docs/research/phase3.json'));
const load=p=>readFileSync(p,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
let previous=load('docs/research/results/phase3.jsonl');
if(previous.length!==cfg.seeds*cfg.profiles.length)throw Error('Complete all preregistered holdout seeds first');
for(const horizon of [3000,10000]){
 const out=`docs/research/results/extended-${horizon}.jsonl`,manifest=out+'.manifest.json';
 const hash=createHash('sha256').update(readFileSync(new URL('./engine-v2.mjs',import.meta.url))).update(JSON.stringify(cfg)).update(String(horizon)).digest('hex');
 if(existsSync(manifest)&&JSON.parse(readFileSync(manifest)).hash!==hash)throw Error('Extension manifest mismatch');
 writeFileSync(manifest,JSON.stringify({hash,config:cfg,horizon,rule:'All original 128 seeds remain. Known absorbing losses are inherited; extend only still-surviving trajectories. This is computational reuse, not seed screening.'},null,2)+'\n');
 const raw=existsSync(out)?readFileSync(out,'utf8'):'';if(raw&&!raw.endsWith('\n'))throw Error('Truncated extension tail');
 const done=new Set(raw.trim().split('\n').filter(Boolean).map(JSON.parse).map(r=>`${r.profile}:${r.seed}`));
 const fd=openSync(out,'a');let integrated=0,inherited=0;
 try{for(const old of previous){
  const key=`${old.profile}:${old.seed}`;if(done.has(key))continue;
  let row;
  if(old.lossAt!==null&&!old.error){
   row={...old,sourceResultHorizon:old.horizon,horizon,survived:false,jointSurvived:false,integratedThisStage:false,inheritedAbsorbingLoss:true,outcomeKnown:true,finalStateAt:old.finalStateAt??old.horizon,completed:false,wallSeconds:0,steps:0};
   for(const k of ['stableFraction','jointStableFraction','temperateFraction'])row[k]=old[k]*old.horizon/horizon;
   for(const k of ['compactNonhierFraction','hierFraction','allStarsWithinBoundaryAtEnd','maxEnergyError','maxNewtonEnergyChange'])row[k]=null;
   inherited++;
  }else{row={...runTrial(old.seed,cfg.profiles.find(p=>p.id===old.profile),horizon),integratedThisStage:true,inheritedAbsorbingLoss:false,outcomeKnown:true,finalStateAt:horizon};integrated++;console.log(JSON.stringify({horizon,seed:old.seed,profile:old.profile,survived:row.survived,life:row.restrictedLife}));}
  writeSync(fd,JSON.stringify(row)+'\n');fsyncSync(fd);
 }}finally{closeSync(fd);}
 console.log(JSON.stringify({horizon,integrated,inherited,existing:done.size}));previous=load(out);
}
