import test from 'node:test';
import assert from 'node:assert/strict';
import { WorldState } from '../src/world-state.js';
import { Simulation } from '../src/simulation.js';
import { RunStatistics } from '../src/run-statistics.js';
import { ViewMotion } from '../src/view-motion.js';
import { normalizeSettings,migrateSettings } from '../src/settings.js';
import { clampWindow } from '../src/layout.js';
const settings=normalizeSettings({stellarBreathing:false});
const body=(x,mass=0)=>({x,y:0,z:0,vx:0,vy:0,vz:0,mass});
const scene=()=>[body(.05,1e6),body(10),body(-10),body(0,5000)];
function evolve(w,b,n,config=settings,offset=0){let result;for(let i=0;i<n;i++)result=w.update(b,1e-6,20,config,(offset+i)/60);return result;}

test('moderate damage stays recoverable and improves after the tidal passage ends',()=>{
 const w=new WorldState(),b=scene();let state=evolve(w,b,180);assert.ok(state.planet.damaged);assert.equal(state.planet.terminal,null);assert.equal(state.planet.restartRequired,false);const hurt=state.planet.integrity;
 b[0].x=10;state=evolve(w,b,1200,settings,180);assert.ok(state.planet.integrity>hurt);assert.equal(state.planet.recoverable,true);assert.equal(state.safeToWake,true);
});
test('greater structural strength reduces damage without altering physical tidal force',()=>{
 const a=evolve(new WorldState(),scene(),60,{...settings,planetStrength:1}),b=evolve(new WorldState(),scene(),60,{...settings,planetStrength:2});assert.equal(a.planet.tideRatio,b.planet.tideRatio);assert.ok(b.planet.integrity>a.planet.integrity);
});
test('prolonged strong tides still cause irreversible disruption and enable restart',()=>{
 const w=new WorldState(),b=scene();b[0].x=.042;b[0].mass=1e7;let s=evolve(w,b,180);assert.equal(s.planet.terminal.kind,'disrupted');assert.equal(s.planet.restartRequired,true);b[0].x=10;s=evolve(w,b,1200,settings,180);assert.equal(s.planet.integrity,0);assert.equal(s.planet.recoverable,false);
});
test('an escaped but intact system no longer causes repeated automatic universes',()=>{
 const s=new Simulation({newproperty50:true,newproperty60:false,newproperty52:0,newproperty13:4,newproperty26:0,newproperty34:0,x11:-2,y11:-2,z1:-2,x4:2,y4:2,z4:2,v1:0,vy1:0,vz1:0,vx2:0,vy2:0,vz2:0,vx3:0,vy3:0,vz3:0,vx4:0,vy4:0,vz4:0,autorestart:true});for(let i=0;i<180;i++)s.tick();assert.equal(s.snapshot().escaped,true);assert.equal(s.snapshot().world.planet.recoverable,true);assert.equal(s.generation,1);
});
function recorder(){
 const sim=new Simulation();sim.shared.universeNumber=8;sim.shared.civilizationCount=12;const c=sim.civilization;let runtime=0;
 return{sim,c,step(phenomena,n=1,safe=false,year=null){for(let i=0;i<n;i++){runtime+=1/60;c.update({epoch:{kind:'chaotic'},planet:{temperature:20,terminal:null},safeToWake:safe,phenomena},{canGrow:safe,comfortable:true,thermalFatal:false},settings,year??runtime,runtime);}}};
}
test('ordinary flying stars, giant suns, era changes and storage transitions do not flood logs',()=>{
 const r=recorder();r.step([{kind:'flying',count:1,zh:'一颗飞星',en:'Flying star'},{kind:'overhead',count:1,zh:'巨日',en:'Giant sun'}],1000);assert.equal(r.c.logs.length,0);
});
test('rare astronomy is confirmed, logged once per episode, and rate limited',()=>{
 const r=recorder(),rare=[{kind:'alignment',zh:'三日连珠',en:'Alignment'}];r.step(rare,24);assert.equal(r.c.logs.length,0);r.step(rare,600);assert.equal(r.c.logs.length,1);r.step([],1);r.step(rare,60);assert.equal(r.c.logs.length,1);r.step([],4000);r.step(rare,60);assert.equal(r.c.logs.length,2);
});
test('civilization lifecycle and longevity records include universe and civilization IDs',()=>{
 const r=recorder();r.step([],240,true);assert.ok(r.c.logs.some(l=>l.kind==='birth'&&l.zh.includes('宇宙8')&&l.zh.includes('文明12')));r.step([],1,true,60);assert.ok(r.c.logs.some(l=>l.kind==='longevity'));r.c.destroy({zh:'测试终态',en:'Test'},70,70,settings);assert.equal(r.sim.shared.civilizationRecords[0].universe,8);assert.ok(r.c.logs[0].zh.includes('延续'));
});
test('ranked civilizations retain their universe through death and reload',()=>{
 const s=new RunStatistics();s.observe(1,{civilizationAlive:true,civilizationCount:1});s.observe(20,{civilizationAlive:true,civilizationCount:1});s.finishCivilization({number:1});s.finishUniverse('test');s.observe(21,{civilizationAlive:true,civilizationCount:2});const restored=new RunStatistics(s.checkpoint());assert.equal(restored.snapshot().civilizationRanking[0].universe,1);assert.ok(restored.snapshot().civilizationRanking.some(r=>r.universe===2));
});
test('legacy ranking origin is backfilled only when an archive identifies it',()=>{
 const s=new RunStatistics({format:'three-body-statistics',version:1,totalYears:20,universeNumber:3,civilizations:[{number:7,lifespan:12}],legacyRecords:[{number:7,lifespan:12,generation:2}]});assert.equal(s.snapshot().civilizationRanking[0].universe,2);
});
test('drag no longer saturates, horizontal gain is lower and follow acceleration is reduced',()=>{
 const a=new ViewMotion();a.drag(.1,0);assert.equal(a.vy,.4);a.drag(.1,0);assert.equal(a.vy,.8);assert.ok(a.vy>.55);assert.equal(a.acceleration,.75);
});
test('idle return follows the nearest galaxy heading extremely slowly without overshoot',()=>{
 const m=new ViewMotion();m.x=.1;m.y=2*Math.PI+.2;m.returnToOrigin(60);assert.ok(Math.abs(Math.hypot(m.x,m.y)-(Math.hypot(.1,.2)-.003*Math.PI/3))<1e-12);assert.ok(m.x>0&&m.x<.1);m.returnToOrigin(100000);assert.equal(m.x,0);assert.equal(m.y,0);m.returnToOrigin(1);assert.equal(m.y,0);
});
test('window settings clamp coordinates and migrate defaults without losing custom layout',()=>{
 assert.deepEqual(clampWindow(-10,900,200,100,800,600),{x:4,y:496});const config=normalizeSettings({layout:{left:{x:-10,y:200},bad:{x:10,y:10},clock:{x:NaN,y:1}}});assert.deepEqual(config.layout,{left:{x:0,y:100}});
 const migrated=migrateSettings({presentationRevision:2,newproperty51:.35,newproperty61:'1',layout:{clock:{x:20,y:10}}});assert.equal(migrated.newproperty51,.003);assert.equal(migrated.newproperty61,1);assert.deepEqual(migrated.layout.clock,{x:20,y:10});
});
