import test from 'node:test';
import assert from 'node:assert/strict';
import { RunStatistics } from '../src/run-statistics.js';
import { Simulation } from '../src/simulation.js';
import { ViewMotion } from '../src/view-motion.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const tick=(s,n)=>{for(let i=0;i<n;i++)s.tick();return s.snapshot();};

test('total years survive universe restarts while universe age resets',()=>{
 const s=new Simulation({autorestart:false});const a=tick(s,600).statistics;close(a.totalYears,10);close(a.universe.lifespan,10);
 s.restart();const b=tick(s,1).statistics;assert.equal(b.universe.number,2);close(b.totalYears,10+1/60);close(b.universe.lifespan,1/60);close(b.universeRanking[0].lifespan,10);
});
test('time factor changes preserve continuity and apply the original squared rate only to new years',()=>{
 const s=new Simulation({autorestart:false});tick(s,60);s.configure({timespeed:3});close(tick(s,60).statistics.totalYears,10);
 s.configure({timespeed:1,newproperty26:20});close(tick(s,60).statistics.totalYears,14);
 const before=s.snapshot();assert.deepEqual(s.snapshot().statistics,before.statistics);
});
test('both top-five rankings sort descending and include the running entries',()=>{
 const s=new RunStatistics();for(let i=1;i<=8;i++){s.observe(s.totalYears+i,{civilizationAlive:true,civilizationCount:i});s.observe(s.totalYears+i,{civilizationAlive:true,civilizationCount:i});s.finishCivilization({number:i});s.finishUniverse('test');}
 s.observe(s.totalYears+20,{civilizationAlive:true,civilizationCount:9});s.observe(s.totalYears+30,{civilizationAlive:true,civilizationCount:9});
 const result=s.snapshot();for(const list of[result.universeRanking,result.civilizationRanking]){assert.equal(list.length,5);assert.equal(list[0].number,9);assert.equal(list[0].active,true);assert.ok(list.every((r,i)=>i===0||list[i-1].lifespan>=r.lifespan));}
});
test('reload closes the checkpointed run once, preserving totals, best runs and sequential IDs',()=>{
 const s=new RunStatistics();s.observe(3,{civilizationAlive:true,civilizationCount:1});s.observe(20,{civilizationAlive:true,civilizationCount:1});
 const resumed=new RunStatistics(s.checkpoint()),state=resumed.snapshot();close(state.totalYears,20);assert.equal(state.universe.number,2);assert.equal(state.universe.lifespan,0);assert.equal(state.universeRanking[0].number,1);close(state.civilizationRanking[0].lifespan,17);assert.equal(resumed.nextCivilization,2);
 const simulation=new Simulation({},s.checkpoint());simulation.tick();assert.equal(simulation.snapshot().generation,2);assert.equal(simulation.shared.civilizationCount,2);assert.ok(simulation.snapshot().year>20);
});
test('old civilization archives retain numbers, lifetime and distinct session records',()=>{
 const s=new RunStatistics({legacyRecords:[{number:50,lifespan:216,key:'a'},{number:50,lifespan:200,key:'b'},{number:7,lifespan:70,key:'c'}]});assert.equal(s.nextCivilization,51);assert.deepEqual(s.snapshot().civilizationRanking.map(r=>r.lifespan),[216,200,70]);
});
test('corrupt checkpoint fields do not break simulation startup',()=>{
 const saved={format:'three-body-statistics',version:1,totalYears:-10,universeNumber:NaN,universes:'broken',civilizations:[null,{number:1,lifespan:Infinity}]};
 const s=new Simulation({},saved);s.tick();assert.ok(Number.isFinite(s.snapshot().year));assert.ok(s.snapshot().statistics.universeRanking.every(r=>Number.isFinite(r.lifespan)));
});
test('drag accelerates promptly, allows uncapped angular speed and dissipates inertia faster',()=>{
 const m=new ViewMotion();m.drag(1,1);assert.ok(Math.hypot(m.vx,m.vy)>10);const initial=Math.hypot(m.vx,m.vy);m.coast(.5);assert.ok(Math.hypot(m.vx,m.vy)<initial*.5);
 for(let i=0;i<100;i++){m.drag(1,-1);m.coast(1/60);assert.ok(Number.isFinite(m.vy));}
});
test('follow mode retains bounded acceleration without a speed cap, and pause freezes movement',()=>{
 const m=new ViewMotion();for(let i=0;i<180;i++){const a=[m.vx,m.vy];m.follow(.2,Math.PI/2,1/60);assert.ok(Number.isFinite(m.vy));assert.ok(Math.hypot(m.vx-a[0],m.vy-a[1])<=Math.SQRT2*m.acceleration/60+1e-12);}
 const before={...m};m.follow(-1,-5,0);m.coast(0);assert.deepEqual({...m},before);
});
test('inertial motion gives equal results at 30 Hz and 120 Hz',()=>{
 const a=new ViewMotion(),b=new ViewMotion();a.drag(.1,0);b.drag(.1,0);for(let i=0;i<30;i++)a.coast(1/30);for(let i=0;i<120;i++)b.coast(1/120);close(a.y,b.y);close(a.vy,b.vy);
});
test('event history retains twelve log entries for the expanded central display',()=>{
 const s=new Simulation();for(let i=0;i<20;i++)s.civilization.log('test',`事件${i}`,`event ${i}`,i,i);assert.equal(s.civilization.logs.length,12);assert.equal(s.civilization.logs[0].zh,'事件19');
});
