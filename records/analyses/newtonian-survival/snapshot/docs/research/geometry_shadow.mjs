import {readFileSync,writeFileSync,existsSync,openSync,writeSync,fsyncSync,closeSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {initial,Integrator,energy} from './engine-v4.mjs';
const config=JSON.parse(readFileSync('docs/research/geometry.json')),profiles=config.profiles.filter(p=>['figure8-periodic-control','figure8-perturb01','figure8-perturb05'].includes(p.id)),out='docs/research/results/geometry-shadow.jsonl';
const hash=createHash('sha256').update(readFileSync(new URL('./engine-v4.mjs',import.meta.url))).update(JSON.stringify(profiles)).digest('hex');
if(existsSync(out+'.manifest.json')&&JSON.parse(readFileSync(out+'.manifest.json')).hash!==hash)throw Error('Shadow config mismatch');
writeFileSync(out+'.manifest.json',JSON.stringify({hash,profiles,seeds:16,prefix:'GEOMETRY-SENSITIVITY',horizon:3000,perturb:1e-9,method:'Same four-body integrator, same frame/step schedule. No WorldState needed for stellar sensitivity. Record geometric contacts; sensitivity after contact is not valid physical evidence.'},null,2)+'\n');
const raw=existsSync(out)?readFileSync(out,'utf8'):'';if(raw&&!raw.endsWith('\n'))throw Error('Truncated shadow tail');
const keys=new Set(raw.trim().split('\n').filter(Boolean).map(JSON.parse).map(r=>r.profile+':'+r.seed));
function evolve(seed,cfg,perturb){
 const {bodies,settings}=initial(seed,{...cfg,perturb}),p=new Integrator(bodies,cfg),points=[],E0=energy(bodies).E;let firstContact=null;
 for(let f=0;f<=3000*60;f++){
  if(f)p.advance(.0075,{...cfg,maxSteps:5e7});
  if(firstContact===null){const radii=[settings._13,settings._21,settings._3].map((r,i)=>r*(settings.stellarBreathing?1+.08*Math.sin(f/60/120+i*2):1));
   for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){const a=bodies[i],b=bodies[j],r=Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z),threshold=i<3&&j<3?radii[i]+radii[j]:radii[i]+settings.newproperty20;if(r<threshold)firstContact=f/60;}
  }
  if(f%300===0)points.push({years:f/60,positions:bodies.slice(0,3).flatMap(b=>[b.x,b.y,b.z]),energyError:Math.abs(energy(bodies).E-E0)/Math.abs(E0)});
 }return {points,firstContact};
}
const fd=openSync(out,'a');try{for(let i=0;i<16;i++)for(const cfg of profiles){const seed=`GEOMETRY-SENSITIVITY-${i}`;if(keys.has(cfg.id+':'+seed))continue;
 const a=evolve(seed,cfg,0),b=evolve(seed,cfg,1e-9),validUntil=Math.min(a.firstContact??Infinity,b.firstContact??Infinity),points=[];
 for(let k=0;k<a.points.length;k++){const x=a.points[k].positions,y=b.points[k].positions,cx=[0,1,2].map(j=>(x[j]+x[j+3]+x[j+6])/3),cy=[0,1,2].map(j=>(y[j]+y[j+3]+y[j+6])/3);let d=0,scale=0;for(let s=0;s<3;s++)for(let j=0;j<3;j++){d+=((x[s*3+j]-cx[j])-(y[s*3+j]-cy[j]))**2;scale+=(x[s*3+j]-cx[j])**2;}points.push({years:a.points[k].years,relativeSeparation:Math.sqrt(d/scale),energyError:a.points[k].energyError});}
 const first=points[0].relativeSeparation,valid=points.filter(p=>p.years<validUntil),row={seed,profile:cfg.id,initialSeparation:first,referenceFirstContact:a.firstContact,shadowFirstContact:b.firstContact,timeTo1percentBeforeContact:valid.find(p=>p.relativeSeparation>=.01)?.years??null,timeTo1e4AmplificationBeforeContact:valid.find(p=>p.relativeSeparation>=first*1e4)?.years??null,maxAmplificationBeforeContact:Math.max(...valid.map(p=>p.relativeSeparation/first)),points};
 writeSync(fd,JSON.stringify(row)+'\n');fsyncSync(fd);console.log(JSON.stringify({seed,profile:cfg.id,contact:a.firstContact,timeTo1percentBeforeContact:row.timeTo1percentBeforeContact,maxAmplificationBeforeContact:row.maxAmplificationBeforeContact}));
}}finally{closeSync(fd);}
