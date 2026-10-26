import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {normalizeSettings,migrateSettings,settingsFromInitial} from '../src/settings.js';
import {fadeMotion} from '../src/motion-visuals.js';
import {sensitiveDependence} from '../tools/v042-orbital-audit.mjs';

test('v0.4.2 migrates the regular orbit default to a larger chaotic system and preserves UI preferences',()=>{
 const s=migrateSettings({presentationRevision:4,orbitalInitialization:'balanced',brfontcoloraaaaaarandomposrange:2,rc:.2,k2:.5,newproperty67:2.1,layout:{left:{x:4,y:30}},music:true});assert.equal(s.orbitalInitialization,'research');assert.equal(s.brfontcoloraaaaaarandomposrange,3.2);assert.equal(s.rc,1.6);assert.equal(s.k2,.3);assert.deepEqual(s.layout.left,{x:4,y:30});assert.equal(s.music,true);
 const custom=migrateSettings({...s,presentationRevision:5,orbitalInitialization:'balanced',viewSensitivity:.04,compassOpacity:.08});assert.equal(custom.orbitalInitialization,'balanced');assert.equal(custom.viewSensitivity,.04);assert.equal(custom.compassOpacity,.08);
});
test('chaotic initial positions are irregular in 3D and exactly replayable',()=>{
 const s=new Simulation({seed:'V042-REPLAY',orbitalInitialization:'chaotic',gravityModel:'legacy'});for(let i=0;i<120;i++)s.tick();const b=s.initialBodies;assert.ok(b.every(b=>[b.x,b.y,b.z].every(v=>Math.abs(v)<=2)));const edges=[[0,1],[1,2],[0,2]].map(([i,j])=>Math.hypot(b[i].x-b[j].x,b[i].y-b[j].y,b[i].z-b[j].z));assert.ok(Math.max(...edges)/Math.min(...edges)>1.1);
 const replay=new Simulation(settingsFromInitial(s.settings,b));for(let i=0;i<120;i++)replay.tick();assert.deepEqual(replay.snapshot().bodies,s.snapshot().bodies);
});
test('chaotic trajectories show strong finite-time dependence on a tiny velocity change',()=>{const result=sensitiveDependence(12000,{orbitalInitialization:'chaotic',gravityModel:'legacy',newproperty60:true});assert.ok(result.maxStellarRmsSeparation>.01);assert.equal(result.initialVelocityPerturbation,1e-7);});
test('ring fade eases both directions and remains independent of frame rate',()=>{
 let a=0,b=0;for(let i=0;i<30;i++)a=fadeMotion(a,true,1/30);for(let i=0;i<120;i++)b=fadeMotion(b,true,1/120);assert.ok(a>.78&&a<.8);assert.ok(Math.abs(a-b)<1e-12);const before=a;a=fadeMotion(a,false,.1);assert.ok(a>0&&a<before);assert.ok(a<before*.6);assert.equal(fadeMotion(a,false,0),a);
});
test('sensitivity and ring opacity are validated and survive migration without changing the orbit',()=>{
 const settings=normalizeSettings({viewSensitivity:999,compassOpacity:-1});assert.equal(settings.viewSensitivity,2);assert.equal(settings.compassOpacity,0);const a=new Simulation(),b=new Simulation();for(let i=0;i<60;i++){a.tick();b.tick();}a.configure({viewSensitivity:.03,compassOpacity:.1,dust:false});for(let i=0;i<60;i++){a.tick();b.tick();}assert.deepEqual(a.snapshot().bodies,b.snapshot().bodies);
});
