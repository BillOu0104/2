import test from 'node:test';
import assert from 'node:assert/strict';
import { Habitability } from '../src/habitability.js';
import { Simulation } from '../src/simulation.js';
import { normalizeSettings,migrateSettings } from '../src/settings.js';
import { TrailHistory,trailComplexity,selectTrail } from '../src/adaptive-trails.js';
const settings=normalizeSettings();
const project=p=>({x:p.x,y:p.y,z:p.z});
function straight(count,step){const h=new TrailHistory();for(let i=0;i<count;i++)h.push({x:i*step,y:0,z:0},i/30);return h;}

test('22.6 C immediately reports fully suitable climate after a cold or hot interval',()=>{
 const h=new Habitability();h.update({tem:-100},settings);assert.equal(h.update({tem:22.6},settings).score,1);assert.equal(h.result.canGrow,true);
 assert.equal(h.update({tem:41},settings).score,0);assert.equal(h.result.canGrow,false);
});
test('warm damaged planets cannot show a suitable score or heal civilization',()=>{
 const h=new Habitability();h.health=.7;const result=h.update({tem:22.6},settings,1/60,{damaged:true});assert.equal(result.score,0);assert.equal(result.canGrow,false);assert.ok(result.health<.7);
 assert.equal(h.update({tem:22.6},settings,1/60,{terminal:true}).score,0);
});
test('tidal danger reduces suitability and blocks growth before structural failure',()=>{
 const result=new Habitability().update({tem:22.6},settings,1/60,{tideRatio:.75});assert.equal(result.score,.5);assert.equal(result.canGrow,false);
});
test('labels default off; existing v0.3 preferences migrate once, optional opt-in persists',()=>{
 assert.equal(settings.bodyLabels,false);assert.equal(migrateSettings({bodyLabels:true},3).bodyLabels,false);
 assert.equal(migrateSettings({presentationRevision:2,bodyLabels:true},3).bodyLabels,true);
});
test('recoverable damage no longer requests an automatic universe restart',()=>{
 const s=new Simulation({autorestart:true});s.tick();s.world.integrity=.97;s.tick();
 assert.equal(s.snapshot().world.planet.restartRequired,false);assert.equal(s.snapshot().world.planet.recoverable,true);
 for(let i=0;i<120;i++)s.tick();assert.equal(s.generation,1);
});
test('terminal planetary loss still advances to the next universe',()=>{
 const s=new Simulation({autorestart:true});s.tick();s.world.terminal={kind:'disrupted',zh:'大撕裂',en:'Great Tear'};
 for(let i=0;i<250;i++){s.tick();if(s.generation===2)break;}
 assert.equal(s.generation,2);assert.equal(s.snapshot().world.planet.terminal,null);
});
test('slow and fast simple trajectories have comparable visible lengths but different history spans',()=>{
 const slow=straight(3600,.25),fast=straight(600,2);
 const a=selectTrail(slow,project,{now:slow.get().time}),b=selectTrail(fast,project,{now:fast.get().time});
 assert.ok(Math.abs(a.arcPixels-b.arcPixels)<.01);assert.ok(a.arcPixels>700);assert.ok(a.seconds>b.seconds*6);assert.ok(a.seconds<=120);
});
test('rapid turns and revisits raise complexity, plain translation does not',()=>{
 const calm=straight(600,2),chaotic=new TrailHistory();
 for(let i=0;i<600;i++)chaotic.push({x:(i%30)*8,y:(i%2)*70,z:0},i/30);
 assert.equal(trailComplexity([calm],project,calm.get().time),0);assert.ok(trailComplexity([chaotic],project,chaotic.get().time)>.9);
});
test('complex motion shortens trails and can later restore long history without clearing samples',()=>{
 const h=straight(3000,1),now=h.get().time;const before=selectTrail(h,project,{now});
 let complex;for(let i=0;i<150;i++)complex=selectTrail(h,project,{now,complexity:1});assert.ok(complex.arcPixels<before.arcPixels*.25);
 let recovered;for(let i=0;i<150;i++)recovered=selectTrail(h,project,{now,complexity:0});assert.ok(recovered.arcPixels>before.arcPixels*.99);assert.equal(h.length,3000);
});
test('history, GPU budget and discontinuities stay bounded during long or paused runs',()=>{
 const h=straight(10000,1);assert.equal(h.length,4096);h.push({x:0,y:0,z:0},h.get().time);assert.equal(h.length,4096);
 const trail=selectTrail(h,project,{now:h.get().time,baseLength:2000,maxPoints:64});assert.ok(trail.points.length<=64);assert.equal(trail.fractions.at(-1),1);assert.ok(trail.fractions.every(Number.isFinite));
 h.clear();assert.equal(h.length,0);assert.equal(selectTrail(h,project,{now:0}).points.length,0);
 h.push({x:Infinity,y:0,z:0},1);assert.equal(h.length,0);
});
