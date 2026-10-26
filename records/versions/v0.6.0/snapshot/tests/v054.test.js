import test from 'node:test';
import assert from 'node:assert/strict';
import {escapeCandidates,EscapeState} from '../src/escape-state.js';
import {normalizeSettings,migrateSettings,settingsFromInitial} from './support/legacy-v055.js';
import {Simulation} from './support/legacy-v055.js';
const G=1.3275440274585598e-8;
const body=(x,y=0,vx=0,mass=5e6)=>({x,y,z:0,vx,vy:0,vz:0,mass});
const escapedPlanet=()=>[body(-.5),body(.5),body(0,.5),body(30,0,1,1000)];
const settings=normalizeSettings();

test('galaxy default doubles slightly, migrates v0.5.3 once and preserves custom speeds',()=>{
 assert.equal(settings.newproperty51,.006);
 const upgraded=migrateSettings({galaxyReturnRevision:1,newproperty51:.003});assert.equal(upgraded.newproperty51,.006);assert.equal(upgraded.galaxyReturnRevision,2);
 for(const value of [.001,.004,.01,0])assert.equal(migrateSettings({galaxyReturnRevision:1,newproperty51:value}).newproperty51,value);
 assert.equal(migrateSettings({...upgraded,newproperty51:.003}).newproperty51,.003);
});
test('escaping planet is observed without any mutation and only confirmed after three continuous years',()=>{
 const b=escapedPlanet(),before=structuredClone(b),monitor=new EscapeState();
 assert.ok(escapeCandidates(b,G,settings).some(c=>c.kind==='planet-escape'));
 assert.equal(monitor.update(b,G,settings,2.9).confirmed,false);assert.equal(monitor.update(b,G,settings,.11).confirmed,true);assert.deepEqual(b,before);
});
test('bound outbound apoapsis, incoming passage and near-system high velocities are not escape',()=>{
 const b=escapedPlanet();b[3].vx=.01;assert.deepEqual(escapeCandidates(b,G,settings),[]);
 b[3].vx=-1;assert.deepEqual(escapeCandidates(b,G,settings),[]);
 b[3].x=1.5;b[3].vx=10;assert.deepEqual(escapeCandidates(b,G,settings),[]);
});
test('transient positive energy cannot accumulate through recapture; cage prevents escape resets',()=>{
 const b=escapedPlanet(),m=new EscapeState();m.update(b,G,settings,2.9);b[3].vx=-1;assert.equal(m.update(b,G,settings,1).years,0);b[3].vx=1;assert.equal(m.update(b,G,settings,.2).confirmed,false);
 assert.equal(m.update(b,G,{...settings,newproperty60:true},100).confirmed,false);assert.equal(m.result.years,0);
});
test('unbound star and a departing host-planet cluster can be detected, including frame boosts',()=>{
 const b=[body(30,0,1),body(-.3),body(.3),body(30.1,0,1,1000)];b[3].vy=Math.sqrt(G*5e6/.1);
 assert.ok(escapeCandidates(b,G,settings).some(c=>c.kind==='stellar-separation'));
 const boosted=b.map(c=>({...c,x:c.x+1000,y:c.y-2000,vx:c.vx+10,vy:c.vy-20}));
 assert.deepEqual(escapeCandidates(boosted,G,settings).map(c=>c.partition),escapeCandidates(b,G,settings).map(c=>c.partition));
});
test('separation during a complex close interaction and marginal parabolic energy are deferred',()=>{
 const b=escapedPlanet();b[0].x=-10;b[1].x=10;assert.deepEqual(escapeCandidates(b,G,settings),[]);
 const c=escapedPlanet();const base=escapeCandidates(c,G,settings).find(x=>x.partition===7),potential=base.specificEnergy-.5;c[3].vx=Math.sqrt(-2*potential*1.01);assert.ok(!escapeCandidates(c,G,settings).some(x=>x.partition===7));
});
test('confirmation drives one normal universe restart, preserving historical time and reason',()=>{
 const b=escapedPlanet();b[0].y=-1;b[1].y=1;b[2].x=2;
 const s=new Simulation(settingsFromInitial({...settings,autorestart:true},b));let confirmed=false;
 for(let i=0;i<250;i++){s.tick();if(s.snapshot().escapeStatus.confirmed)confirmed=true;if(s.generation>1)break;}
 assert.equal(confirmed,true);assert.equal(s.generation,2);const state=s.snapshot();assert.ok(state.year>=3);assert.equal(state.statisticsCheckpoint.universes[0].reason,'escape');assert.equal(s.events.filter(e=>e.type==='system:escape').length,1);assert.equal(state.escapeStatus.confirmed,false);
});
test('automatic restart off retains escaped bodies and emits one notification; manual restart archives escape',()=>{
 const b=escapedPlanet();b[0].y=-1;b[1].y=1;b[2].x=2;
 const s=new Simulation(settingsFromInitial({...settings,autorestart:false},b));for(let i=0;i<240;i++)s.tick();
 assert.equal(s.generation,1);assert.equal(s.snapshot().escapeStatus.confirmed,true);assert.ok(s.snapshot().bodies[3].x>30);assert.equal(s.events.filter(e=>e.type==='system:escape').length,1);
 s.restart();assert.equal(s.statistics.universes[0].reason,'escape');assert.equal(s.escape.result.confirmed,false);
});
test('disabling auto restart or enabling the cage cancels an escape queued on the preceding frame',()=>{
 for(const patch of [{autorestart:false},{newproperty60:true}]){
  const s=new Simulation({autorestart:true});s.pendingRestart='escape';s.configure(patch);assert.equal(s.pendingRestart,null);
 }
});
