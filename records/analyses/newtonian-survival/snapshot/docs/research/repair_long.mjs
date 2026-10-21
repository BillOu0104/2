import {readFileSync,writeFileSync,openSync,writeSync,fsyncSync,closeSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {runTrial} from './engine-v4.mjs';
const input='docs/research/results/extended-10000.jsonl',out='docs/research/results/extended-10000-v2.jsonl',cfg=JSON.parse(readFileSync('docs/research/phase3.json'));
const hash=createHash('sha256').update(readFileSync(new URL('./engine-v4.mjs',import.meta.url))).update(readFileSync(input)).digest('hex');
if(existsSync(out+'.manifest.json')&&JSON.parse(readFileSync(out+'.manifest.json')).hash!==hash)throw Error('Corrected extension source mismatch');
writeFileSync(out+'.manifest.json',JSON.stringify({hash,input,config:cfg,maxSteps:5e7,reason:'The previous two unresolved trajectories reached a 5e6-step budget. This is not a physical loss. Rerun only unresolved rows with a higher compute budget; retain every original seed.'},null,2)+'\n');
const old=readFileSync(input,'utf8').trim().split('\n').map(JSON.parse),raw=existsSync(out)?readFileSync(out,'utf8'):'';
if(raw&&!raw.endsWith('\n'))throw Error('Truncated corrected result');
const keys=new Set(raw.trim().split('\n').filter(Boolean).map(JSON.parse).map(r=>`${r.profile}:${r.seed}`));
const fd=openSync(out,'a');
try{for(const r of old){if(keys.has(`${r.profile}:${r.seed}`))continue;let row=r;
 if(r.error){row={...runTrial(r.seed,{...cfg.profiles.find(p=>p.id===r.profile),maxSteps:5e7},10000),correctsNumericalBudgetLimit:true,previousNumericalStop:r.lossAt,integratedThisStage:true,outcomeKnown:true,finalStateAt:10000};console.log(JSON.stringify({seed:r.seed,profile:r.profile,survived:row.survived,jointSurvived:row.jointSurvived,lossAt:row.lossAt,error:row.error,steps:row.steps}));}
 writeSync(fd,JSON.stringify(row)+'\n');fsyncSync(fd);
}}finally{closeSync(fd);}
