import {readFileSync,writeFileSync,appendFileSync,existsSync} from 'node:fs';
import {runTrial} from './engine.mjs';
const config=JSON.parse(readFileSync(process.argv[2])),out='docs/research/results/chaos.jsonl';
if(existsSync(out))throw Error('Chaos diagnostics already exist; inspect before overwriting');
for(let i=0;i<16;i++)for(const cfg of config.profiles.filter(p=>['candidate','hierarchy-control'].includes(p.id))){
 const seed=`CHAOS-${i}`,a=runTrial(seed,{...cfg,trace:true},500),b=runTrial(seed,{...cfg,trace:true,perturb:1e-9},500);
 const points=[];
 for(let k=0;k<Math.min(a.trajectory.length,b.trajectory.length);k++){
  const x=a.trajectory[k].positions,y=b.trajectory[k].positions;
  const mean=z=>[0,1,2].map(j=>(z[j]+z[j+3]+z[j+6])/3),cx=mean(x),cy=mean(y);
  let d=0,scale=0;for(let s=0;s<3;s++)for(let j=0;j<3;j++){d+=((x[3*s+j]-cx[j])-(y[3*s+j]-cy[j]))**2;scale+=(x[3*s+j]-cx[j])**2;}
  points.push({years:a.trajectory[k].years,relativeStellarSeparation:Math.sqrt(d/scale),shape:a.trajectory[k].shape});
 }
 const first=points[0].relativeStellarSeparation;
 const until=threshold=>points.find(x=>x.relativeStellarSeparation>=threshold)?.years??null;
 appendFileSync(out,JSON.stringify({seed,profile:cfg.id,initialRelativeSeparation:first,timeTo1e4Amplification:points.find(x=>x.relativeStellarSeparation>=first*1e4)?.years??null,timeTo1percent:until(.01),referenceSurvived:a.survived,shadowSurvived:b.survived,referenceJointSurvived:a.jointSurvived,shadowJointSurvived:b.jointSurvived,referenceLoss:a.lossAt,shadowLoss:b.lossAt,referenceEnergyError:a.maxEnergyError,shadowEnergyError:b.maxEnergyError,points})+'\n');
 console.log(JSON.stringify({seed,profile:cfg.id,amplificationAt500:points.at(-1).relativeStellarSeparation/first,timeTo1percent:until(.01)}));
}
