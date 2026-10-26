import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeSettings,migrateSettings,settingsFromInitial} from '../src/settings.js';
import {controllerPatch} from '../src/controller-settings.js';
import {replaySettings} from '../src/seed-compatibility.js';
import {Simulation} from '../src/simulation.js';
import {ControlledSystem,V2_STEP,V2_ETA} from '../src/physics/controlled-system.js';
import {PlaybackClock} from '../src/playback-clock.js';
import {checkpointV2,restoreV2} from '../src/v2-checkpoint.js';
const G=1.3275440274585598e-8,body=(x,y=0,mass=5e6)=>({x,y,z:0,vx:0,vy:0,vz:0,mass});
const initial=()=>[body(-1.2),body(.4),body(1.8,1),body(1.8,1.3,5000)];

test('production defaults enable deflect-v2 at the frozen h4 precision',()=>{
 const s=normalizeSettings();assert.equal(s.stabilityMode,'deflect-v2');assert.equal(s.newproperty60,true);assert.equal(s.newproperty53/1000,V2_STEP);assert.equal(s.encounterAccuracy,V2_ETA);assert.equal(s.timespeed,1);assert.equal(s.playbackRate,1);
 const sim=new Simulation();sim.tick();assert.ok(sim.controlled);assert.ok(sim.controlled.integrator.steps>=40);assert.equal(sim.generation,1);
});
test('old saved UI preferences survive default upgrade and the old physics profile can be restored',()=>{
 const saved={physicsRevision:1,presentationRevision:6,gravityModel:'plummer',physicsMode:'realtime',newproperty53:.5,encounterAccuracy:.02,timespeed:2,newproperty60:false,seed:'KEEP',layout:{clock:{x:20,y:12}},music:true};
 const next=migrateSettings(saved);assert.equal(next.stabilityMode,'deflect-v2');assert.equal(next.newproperty60,true);assert.deepEqual(next.layout,saved.layout);assert.equal(next.seed,'KEEP');assert.equal(next.music,true);
 const old=normalizeSettings({...next,...controllerPatch(next,{stabilityMode:'off'})});for(const key of ['gravityModel','physicsMode','newproperty53','encounterAccuracy','timespeed','newproperty60'])assert.equal(old[key],saved[key]);
 assert.equal(migrateSettings({...saved,stabilityMode:'off'}).stabilityMode,'off');
});
test('old Seed archives explicitly use old physics and reflection research archives are not silently reinterpreted',()=>{
 assert.equal(replaySettings({physicsRevision:1,gravityModel:'newtonian'}).stabilityMode,'off');assert.equal(replaySettings({}).gravityModel,'legacy');assert.throws(()=>replaySettings({stabilityMode:'reflect-v2'}),/研究分支/);
});
test('protection and playback toggles preserve the universe; explicit physics/mode changes close the old run',()=>{
 const sim=new Simulation({seed:'PRODUCTION-BOUNDARY'});sim.tick();const c=sim.controlled,generation=sim.generation;
 sim.configure({newproperty60:false,playbackRate:4,bodyLabels:true});sim.tick();assert.equal(sim.controlled,c);assert.equal(sim.generation,generation);assert.equal(sim.settings.playbackRate,4);
 sim.configure({stabilityMode:'off'});sim.tick();assert.equal(sim.controlled,null);assert.equal(sim.generation,generation+1);assert.equal(sim.statistics.universes[0].reason,'settings');assert.equal(sim.settings.newproperty60,false);assert.equal(sim.settings.newproperty53,.75);
});
test('P5 vector impulse records a direction change that the historical magnitude-only metric misses',()=>{
 const b=initial();b[3].vx=.4;const c=new ControlledSystem(b,G,normalizeSettings());const m=b[3].mass;
 c.externalChange(()=>{c.bodies[3].vx=0;c.bodies[3].vy=.4;});assert.equal(c.external.impulse,0);assert.ok(Math.abs(c.external.vectorImpulse-m*Math.hypot(.4,.4))<1e-8);assert.equal(c.external.vectorImpulseComplete,true);
});
test('a planet death occurring on a terminal stellar frame is archived exactly once',()=>{
 const sim=new Simulation(settingsFromInitial({},initial()));sim.tick();const c=sim.controlled;sim.shared.civilizationAlive=true;sim.civilization.phase='active';sim.shared.civilizationStartTime=0;sim.statistics.observe(sim.shared.xntime,sim.shared);
 c.advanceFrame=()=>{c.frameStartTime=c.integrator.time;c.frameStartFrame=c.frame;c.losePlanet('engulfed');c.stellarFailure={kind:'stellar-contact',year:c.year};return false;};
 sim.tick();assert.equal(sim.events.filter(e=>e.type==='civilization:death').length,1);assert.equal(sim.shared.civilizationAlive,false);sim.tick();assert.equal(sim.events.filter(e=>e.type==='civilization:death').length,1);
});
test('planet absence publishes no living planet, no stable era and a meaningful central status',()=>{
 const b=initial();b[3].x=1.82;b[3].y=1;const sim=new Simulation(settingsFromInitial({},b));sim.tick();const s=sim.snapshot();assert.equal(s.world.planet.present,false);assert.equal(s.world.epoch.kind,'chaotic');assert.equal(s.alive,false);assert.match(s.text[0],/等待新行星/);assert.ok(s.physics.planetRespawnInYears>0);assert.equal(sim.generation,1);
});
test('playback schedules complete ticks and retains unprocessed credited time',()=>{
 const clock=new PlaybackClock();let count=0;for(let i=0;i<10;i++){clock.accrue(.1,4);while(clock.takeStep())count++;}
 assert.ok(count>=239&&count<=240);assert.ok(Math.abs(count/60+clock.remainder-4)<1e-12);clock.accrue(.1,4);assert.ok(clock.takeStep());assert.ok(clock.remainder>0);clock.reset();assert.equal(clock.takeStep(),false);
});
test('older checkpoints do not pretend their unmeasured P5 vector budget is complete',()=>{
 const sim=new Simulation();sim.tick();const saved=checkpointV2(sim);delete saved.controlled.external.vectorImpulse;delete saved.controlled.external.vectorImpulseComplete;
 const restored=restoreV2(saved);assert.equal(restored.controlled.external.vectorImpulse,0);assert.equal(restored.controlled.external.vectorImpulseComplete,false);restored.tick();assert.equal(restored.controlled.external.vectorImpulseComplete,false);
});
test('P5 rejects a zero regeneration mass instead of reporting a nonexistent successful respawn',()=>{
 assert.throws(()=>new ControlledSystem(initial(),G,normalizeSettings({newproperty8:0})),/正的行星质量/);
});
test('pending mode changes are marked until a complete accepted frame is available',()=>{
 const sim=new Simulation();assert.equal(sim.snapshot().initializing,true);sim.tick();assert.equal(sim.snapshot().initializing,false);
 sim.configure({stabilityMode:'off'});assert.equal(sim.snapshot().initializing,true);sim.tick();const s=sim.snapshot();assert.equal(s.initializing,false);assert.equal(typeof s.physics.cageActive,'boolean');assert.ok(!s.algorithm.startsWith('v2-'));
 sim.restart();assert.equal(sim.snapshot().initializing,true);sim.tick();assert.equal(sim.snapshot().initializing,false);
});
