import test from 'node:test';
import assert from 'node:assert/strict';
import {WorldState} from '../src/world-state.js';
import {Simulation} from './support/legacy-v055.js';
import {normalizeSettings,migrateSettings} from './support/legacy-v055.js';
const settings=normalizeSettings({stellarBreathing:false,autorestart:false});
const body=(x,mass=1000,vy=0)=>({x,y:0,z:0,vx:0,vy,vz:0,mass});
const bodies=()=>[body(1,1e6,1),body(20),body(-20),body(0,5000)];
test('stable-era confirmation requires one simulated month, not a two-year window',()=>{
 const w=new WorldState();let state;
 for(let i=0;i<4;i++)state=w.update(bodies(),1e-6,20,settings,i/60,1/60,1/60);
 assert.equal(state.epoch.kind,'chaotic');state=w.update(bodies(),1e-6,20,settings,4/60,1/60,1/60);assert.equal(state.epoch.kind,'stable');assert.ok(Math.abs(state.epoch.stableFor-1/12)<1e-12);assert.equal(state.epoch.stableForUnit,'years');
});
test('slow and fast clocks confirm after the same simulated month',()=>{
 for(const rate of [.25,1,4]){const w=new WorldState(),step=rate/1200;let years=0,first;
  for(let i=0;i<1000;i++){years+=step;const state=w.update(bodies(),1e-6,20,settings,i/60,1/60,step);if(state.epoch.kind==='stable'){first=years;break;}}
  assert.ok(first>=1/12-1e-12&&first<1/12+step+1e-12,JSON.stringify({rate,first}));
 }
});
test('no simulated time means no extra era confirmation progress',()=>{
 const w=new WorldState();for(let i=0;i<240;i++)w.update(bodies(),1e-6,20,settings,i/60,1/60,0);assert.equal(w.state.epoch.kind,'chaotic');assert.equal(w.state.epoch.stableFor,0);
});
test('old default confirmation migrates once; user settings and other v0.5 parameters are preserved',()=>{
 const old=normalizeSettings({epochWindow:2,k2:.27,thermalGrace:41,viewSensitivity:.03});delete old.epochTimebase;const migrated=migrateSettings(old);assert.equal(migrated.epochWindow,1/12);assert.equal(migrated.k2,.27);assert.equal(migrated.thermalGrace,41);assert.equal(migrated.viewSensitivity,.03);
 assert.equal(migrateSettings({...old,epochWindow:.5}).epochWindow,.5);assert.equal(migrateSettings({...migrated,epochWindow:2}).epochWindow,2);
});
test('changing only confirmation duration does not alter the physical trajectory',()=>{
 const a=new Simulation({epochWindow:1/12}),b=new Simulation({epochWindow:2});for(let i=0;i<1200;i++){a.tick();b.tick();}assert.deepEqual(a.snapshot().bodies,b.snapshot().bodies);assert.equal(a.settings.k2,b.settings.k2);
});
test('simulation passes actual year increments to the epoch detector when the time factor changes',()=>{
 const s=new Simulation();s.tick();const original=s.world.update.bind(s.world);let received;
 s.world.update=(...args)=>{received=args[6];return original(...args);};
 for(const timespeed of [.5,1,2]){s.configure({timespeed});const before=s.shared.xntime;s.tick();assert.ok(Math.abs(received-(s.shared.xntime-before))<1e-12);assert.ok(Math.abs(received-timespeed*timespeed/60)<1e-12);}
});
