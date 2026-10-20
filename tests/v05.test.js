import test from 'node:test';
import assert from 'node:assert/strict';
import {Habitability} from '../src/habitability.js';
import {CivilizationState} from '../src/civilization-state.js';
import {normalizeSettings,migrateSettings} from '../src/settings.js';
import {Simulation} from '../src/simulation.js';
import {civilizationLevels,levelFor} from '../src/civilization-levels.js';
import {fadeMotion} from '../src/motion-visuals.js';
import {RunStatistics} from '../src/run-statistics.js';
const settings=normalizeSettings({autorestart:false,stellarBreathing:false});
function fixture(overrides={}){
 const config=normalizeSettings({...settings,...overrides}),shared={civilizationAlive:false,civilizationCount:1,civilizationStartTime:0,lastCivilizationLifespan:0,civilizationRecords:[],universeNumber:2};
 const civ=new CivilizationState(shared),hab=new Habitability();let time=0;
 return {civ,hab,shared,config,run(seconds,temperature=20,safe=true){for(let i=0;i<Math.round(seconds*60);i++){time+=1/60;const world={planet:{temperature,terminal:null},phenomena:[],safeToWake:safe};hab.update({tem:temperature},config,1/60,{alive:shared.civilizationAlive,number:shared.civilizationCount,phase:civ.phase,developmentYears:civ.developmentYears});civ.update(world,hab.result,config,time,time);}}};
}
test('empty worlds have no reserves; a late birth starts a fresh, healthy civilization',()=>{
 const f=fixture();f.run(300,-250);assert.equal(f.hab.health,null);assert.equal(f.hab.population,null);assert.equal(f.civ.result.development,null);assert.equal(f.shared.civilizationAlive,false);
 f.run(1);assert.equal(f.shared.civilizationAlive,true);assert.equal(f.hab.health,1);assert.equal(f.civ.result.development.level,1);
});
test('safe dry storage preserves population, quality, civilization identity and accumulated development',()=>{
 const f=fixture();f.run(8);const stage=f.civ.result.development;assert.equal(stage.level,2);f.run(150,-80);assert.equal(f.shared.civilizationAlive,true);assert.equal(f.civ.phase,'dormant');assert.ok(f.hab.health>.98);assert.equal(f.civ.result.development.developmentYears,stage.developmentYears);
 f.run(4);assert.equal(f.civ.phase,'active');assert.equal(f.shared.civilizationCount,1);assert.equal(f.civ.logs.filter(x=>x.kind==='birth').length,1);assert.equal(f.civ.result.development.level,2);
});
test('population and dry quality measure different losses, with higher levels providing stronger climate protection',()=>{
 const a=new Habitability(),b=new Habitability();for(let i=0;i<6000;i++){a.update({tem:-220},settings,1/60,{alive:true,number:1,phase:'dormant',developmentYears:0});b.update({tem:-220},settings,1/60,{alive:true,number:2,phase:'dormant',developmentYears:150});}
 assert.ok(a.storageQuality<a.population);assert.ok(b.health>a.health);assert.equal(a.result.low,-20);assert.equal(b.result.low,-48);assert.equal(b.result.high,68);assert.equal(b.result.storageLow,settings.newproperty43-130);
});
test('extended resilience remains finite in sustained extreme heat and resets only for the next civilization',()=>{
 const f=fixture();f.run(2);f.run(180,1500);assert.equal(f.shared.civilizationAlive,false);assert.equal(f.shared.civilizationRecords.length,1);assert.equal(f.hab.health,null);f.run(1);assert.equal(f.shared.civilizationAlive,true);assert.equal(f.shared.civilizationCount,2);assert.equal(f.civ.result.development.level,1);assert.equal(f.hab.health,1);
});
test('only actual safe production drives all six technology stages, retaining maximum stage in death records',()=>{
 const f=fixture();f.run(355);assert.equal(f.civ.result.development.level,6);assert.equal(f.civ.logs.filter(x=>x.kind==='level').length,5);assert.ok(f.civ.result.development.developmentYears>=350);
 f.civ.destroy({zh:'测试',en:'Test'},400,400,f.config);assert.equal(f.shared.civilizationRecords[0].development.level,6);assert.equal(f.civ.result.development,null);
 const g=fixture({civilizationLevels:false});g.run(30);assert.equal(g.civ.developmentYears,0);assert.equal(g.civ.result.development.level,1);
});
test('development multiplier affects progression but not lifespan or original physical trajectories',()=>{
 const a=fixture(),b=fixture({developmentRate:4});a.run(7);b.run(7);assert.ok(b.civ.developmentYears>a.civ.developmentYears*3.99);assert.equal(a.shared.civilizationStartTime,b.shared.civilizationStartTime);assert.ok(levelFor(b.civ.developmentYears).level>levelFor(a.civ.developmentYears).level);
 const sa=new Simulation(),sb=new Simulation({developmentRate:4,dragSensitivity:11});for(let i=0;i<180;i++){sa.tick();sb.tick();}assert.deepEqual(sa.snapshot().bodies,sb.snapshot().bodies);
});
test('v0.5 migration upgrades old defaults while retaining custom survival, view and cage preferences',()=>{
 const s=migrateSettings({presentationRevision:5,k2:.22,thermalGrace:8,wakeDelay:3,viewSensitivity:.03,layout:{clock:{x:20,y:10}}});assert.equal(s.k2,.3);assert.equal(s.thermalGrace,30);assert.equal(s.wakeDelay,1);assert.equal(s.dragSensitivity,5);assert.equal(s.viewSensitivity,.03);assert.deepEqual(s.layout.clock,{x:20,y:10});
 const custom=migrateSettings({presentationRevision:5,k2:.27,thermalGrace:11,wakeDelay:5});assert.equal(custom.k2,.27);assert.equal(custom.thermalGrace,11);assert.equal(custom.wakeDelay,5);
 assert.equal(normalizeSettings({dragSensitivity:99}).dragSensitivity,20);assert.equal(normalizeSettings({birthDelay:-1}).birthDelay,.1);
});
test('level metadata is retained in active rankings, death rankings and persisted checkpoints',()=>{
 const stats=new RunStatistics(),development={...civilizationLevels[2],developmentYears:21};stats.observe(10,{civilizationAlive:true,civilizationCount:1,civilizationDevelopment:development});stats.observe(60,{civilizationAlive:true,civilizationCount:1,civilizationDevelopment:development});assert.equal(stats.snapshot().civilizationRanking[0].development.level,3);const restored=new RunStatistics(stats.checkpoint());assert.equal(restored.snapshot().civilizationRanking[0].development.level,3);
});
test('ring now appears gently and disappears promptly with consistent elapsed-time integration',()=>{
 assert.ok(fadeMotion(0,true,.2)<.3);assert.ok(fadeMotion(1,false,.2)<.34);let v=0;for(let i=0;i<120;i++)v=fadeMotion(v,true,1/120);assert.ok(Math.abs(v-fadeMotion(0,true,1))<1e-12);
});

test('reserve failure caused by ongoing tides is not misreported as freezing or burning',()=>{
 const h=new Habitability();for(let i=0;i<600;i++)h.update({tem:20},settings,1/60,{alive:true,number:1,phase:'dormant',tideRatio:100});assert.equal(h.result.thermalFatal,true);assert.ok(h.result.fatalCause.zh.includes('潮汐'));
});
