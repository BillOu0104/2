import {readFileSync,writeFileSync,openSync,writeSync,fsyncSync,closeSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {runTrial} from './engine.mjs';
const config=JSON.parse(readFileSync(process.argv[2])),out='docs/research/results/chaos.jsonl';
const hash=createHash('sha256').update(readFileSync(new URL('./engine.mjs',import.meta.url))).update(JSON.stringify(config)).digest('hex');
if(existsSync(out+'.manifest.json')&&JSON.parse(readFileSync(out+'.manifest.json')).hash!==hash)throw Error('Chaos config/engine mismatch');
writeFileSync(out+'.manifest.json',JSON.stringify({hash,config},null,2)+'\n');
const existing=existsSync(out)?readFileSync(out,'utf8'):'';if(existing&&!existing.endsWith('\n'))throw Error('Truncated chaos JSONL tail');
const keys=new Set(existing.trim().split('\n').filter(Boolean).map(l=>{const r=JSON.parse(l);return `${r.profile}:${r.seed}`;}));
for(let i=0;i<16;i++)for(const cfg of config.profiles.filter(p=>['candidate','hierarchy-control'].includes(p.id))){
 const seed=`CHAOS-${i}`;if(keys.has(`${cfg.id}:${seed}`))continue;
 const a=runTrial(seed,{...cfg,trace:true},500),b=runTrial(seed,{...cfg,trace:true,perturb:1e-9},500);
 const points=[];
 for(let k=0;k<Math.min(a.trajectory.length,b.trajectory.length);k++){
  const x=a.trajectory[k].positions,y=b.trajectory[k].positions;
  const mean=z=>[0,1,2].map(j=>(z[j]+z[j+3]+z[j+6])/3),cx=mean(x),cy=mean(y);
  let d=0,scale=0;for(let s=0;s<3;s++)for(let j=0;j<3;j++){d+=((x[3*s+j]-cx[j])-(y[3*s+j]-cy[j]))**2;scale+=(x[3*s+j]-cx[j])**2;}
  points.push({years:a.trajectory[k].years,relativeStellarSeparation:Math.sqrt(d/scale),shape:a.trajectory[k].shape});
 }
 const first=points[0].relativeStellarSeparation;
 const until=threshold=>points.find(x=>x.relativeStellarSeparation>=threshold)?.years??null;
 const fd=openSync(out,'a');writeSync(fd,JSON.stringify({seed,profile:cfg.id,initialRelativeSeparation:first,timeTo1e4Amplification:points.find(x=>x.relativeStellarSeparation>=first*1e4)?.years??null,timeTo1percent:until(.01),referenceSurvived:a.survived,shadowSurvived:b.survived,referenceJointSurvived:a.jointSurvived,shadowJointSurvived:b.jointSurvived,referenceLoss:a.lossAt,shadowLoss:b.lossAt,referenceEnergyError:a.maxEnergyError,shadowEnergyError:b.maxEnergyError,points})+'\n');fsyncSync(fd);closeSync(fd);
 console.log(JSON.stringify({seed,profile:cfg.id,amplificationAt500:points.at(-1).relativeStellarSeparation/first,timeTo1percent:until(.01)}));
}
