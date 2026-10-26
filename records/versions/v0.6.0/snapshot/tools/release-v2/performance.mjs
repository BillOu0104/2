import {Simulation} from '../../src/simulation.js';
import {writeFile,mkdir} from 'node:fs/promises';
const resultDir=process.env.V2_RESULT_DIR??`/tmp/three-body-v2-performance-${Date.now()}`;await mkdir(resultDir,{recursive:true});
const results=[];
for(let k=0;k<3;k++){
 const sim=new Simulation({seed:`FORMAL-V2-PERF-${k}`},{},{trace:true}),times=[],start=performance.now();let peakSampledRSS=process.memoryUsage().rss;
 for(let frame=0;frame<12000;frame++){
  const t=performance.now();sim.tick();if(frame%2===0){sim.snapshot({compact:true});sim.orbitTrace.drain();}times.push(performance.now()-t);
  if(frame%100===0)peakSampledRSS=Math.max(peakSampledRSS,process.memoryUsage().rss);
  if(sim.controlled.stellarFailure||sim.controlled.numericalUnknown)break;
 }
 const elapsed=performance.now()-start;times.sort((a,b)=>a-b);const q=p=>times[Math.floor((times.length-1)*p)];
 results.push({seed:sim.settings.seed,frames:sim.controlled.frame,years:sim.controlled.year,wallMilliseconds:elapsed,framesPerSecond:times.length/elapsed*1000,medianTickMs:q(.5),p95TickMs:q(.95),p99TickMs:q(.99),maxTickMs:q(1),sampledRSSBytes:peakSampledRSS,steps:sim.controlled.integrator.steps,stellarFailure:sim.controlled.stellarFailure,numericalUnknown:sim.controlled.numericalUnknown,controlEvents:sim.controlled.cost.projectionEvents});
}
await writeFile(`${resultDir}/performance.json`,JSON.stringify({scope:'Three predetermined short 200-year runs with physical trace sampling and compact snapshots every two ticks. CPU wall timing only; not Windows Wallpaper Engine or full-GPU performance. RSS sampled every 100 frames, not a true continuous peak.',results},null,2)+'\n');console.log(JSON.stringify(results,null,2));
