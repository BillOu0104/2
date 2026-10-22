import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {Simulation} from '../../src/simulation.js';
import {settingsFromInitial} from '../../src/settings.js';
import {createControlledSystem} from '../../src/v2-simulation.js';
import {ChaosObserver} from './chaos-observer.mjs';
const dir=process.argv[2]??'docs/integration-v2/results/shadow-conformance-r1',binary=process.env.V2_NATIVE??'/workspace/2/docs/research-v2/bin/native';fs.mkdirSync(dir,{recursive:true});
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');assert.equal(sha(binary),'cf2117ac290bea83d6cfbdb07f98888412d594024e295887bc537bce5132f091');
const output={scope:'Conditional stellar shadow/dynamic hierarchy port;20year fixtures, not a long-term chaos validation',observerSHA256:sha('tools/v2/chaos-observer.mjs'),primarySourceSHA256:sha('src/physics/controlled-system.js'),binarySHA256:sha(binary),toleranceFTLE:1e-4,rows:[]};
const save=()=>fs.writeFileSync(dir+'/report.json',JSON.stringify(output,null,2)+'\n');
for(const mode of ['deflect-v2','reflect-v2'])for(const kind of ['natural','deflection','reflection','planet-contact','capture']){
 const previous=`docs/integration-v2/results/conformance-r3/${mode}-${kind}.input.json`,input=JSON.parse(fs.readFileSync(previous));input.controller.shadow=true;input.sourceHash='dd9de546d74b62483b487d40511fab862e37f516179d652228072b516734200e';input.configHash='shadow-port-20year-fixture';const ip=dir+`/${mode}-${kind}.input.json`;fs.writeFileSync(ip,JSON.stringify(input));const native=spawnSync(binary,[ip],{encoding:'utf8',maxBuffer:64*1024*1024});assert.equal(native.status,0,native.stderr);fs.writeFileSync(ip.replace('.input.json','.native.json'),native.stdout);const ref=JSON.parse(native.stdout);
 const initial=input.bodies.map(b=>({x:b.r[0],y:b.r[1],z:b.r[2],vx:b.v[0],vy:b.v[1],vz:b.v[2],mass:b.mass})),sim=new Simulation(settingsFromInitial(input.settings,initial));sim.controlled=createControlledSystem(sim);const observer=new ChaosObserver(sim.controlled);
 for(let i=0;i<1200;i++){sim.tick();assert.equal(sim.controlled.stellarFailure,null);observer.observe(sim.controlled);}
 const result=observer.result(20,true),diff=Math.abs(result.fullConditionalFTLE-ref.fullConditionalFTLE),counts=['tightPairChanges','closestPairChanges','longestDynamicalHierarchyYears','longestHierarchyYears','nonhierFraction','dynHierFraction'],differentCounts=counts.filter(k=>Math.abs(result[k]-ref[k])>1e-12),row={mode,kind,result,native:Object.fromEntries(['fullConditionalFTLE',...counts].map(k=>[k,ref[k]])),FTLEDifference:diff,differentCounts,pass:diff<=output.toleranceFTLE&&differentCounts.length===0};output.rows.push(row);save();console.log(JSON.stringify({mode,kind,diff,differentCounts,pass:row.pass}));
}
output.pass=output.rows.every(r=>r.pass);save();assert.equal(output.pass,true,'Shadow/native conformance failed; preserve and review, do not treat primary physics as failed');
