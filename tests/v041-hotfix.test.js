import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {normalizeSettings,migrateSettings,settingsFromInitial} from '../src/settings.js';
import {measure} from '../tools/orbital-audit.mjs';
import {prepareBalancedOrbits} from '../src/orbital-initialization.js';

test('existing v0.4.1 profiles regain hover follow and slow galaxy return without losing layout',()=>{
 const s=migrateSettings({presentationRevision:3,newproperty61:0,newproperty51:.08,layout:{right:{x:70,y:30}},seed:'KEEP',planetStrength:2});assert.equal(s.newproperty61,1);assert.equal(s.newproperty51,.003);assert.equal(s.orbitalInitialization,'research');assert.deepEqual(s.layout.right,{x:70,y:30});assert.equal(s.seed,'KEEP');assert.equal(s.planetStrength,2);
 const explicit=migrateSettings({...s,presentationRevision:4,newproperty61:0,newproperty51:.001,orbitalInitialization:'original'});assert.equal(explicit.newproperty61,0);assert.equal(explicit.newproperty51,.001);assert.equal(explicit.orbitalInitialization,'original');
});
test('historical v0.4.1 balanced cage profile permits sustained development and planetary passages inside the star system',()=>{
 for(const seed of ['TRISOLARIS','A','B','C','D']){const r=measure(seed,'balanced',6000,{gravityModel:'legacy',newproperty60:true,brfontcoloraaaaaarandomposrange:2,rc:.2,k2:.5,newproperty67:2.1});assert.ok(r.stableFraction>.4,JSON.stringify(r));assert.ok(r.maxContinuousDevelopmentYears>3,JSON.stringify(r));assert.ok(r.insideStellarExtentFraction>.2,JSON.stringify(r));assert.ok(r.maxPlanetRadius<2);assert.equal(r.terminalAtSeconds,null);}
});
test('bound random initial conditions replay exactly through the manual initial-condition pathway',()=>{
 const a=new Simulation({seed:'HOTFIX-REPLAY'});for(let i=0;i<120;i++)a.tick();const b=new Simulation(settingsFromInitial(a.settings,a.initialBodies));for(let i=0;i<120;i++)b.tick();assert.deepEqual(a.snapshot().bodies,b.snapshot().bodies);
});
test('initialization retains zero center-of-mass momentum and the original mode is reproducible',()=>{
 const a=new Simulation({seed:'MOMENTUM'});a.tick();for(const key of ['vx','vy','vz'])assert.ok(Math.abs(a.initialBodies.reduce((n,b)=>n+b[key]*b.mass,0))<1e-7);
 const original=new Simulation({orbitalInitialization:'original'});original.tick();assert.notDeepEqual(a.initialBodies,original.initialBodies);assert.equal(normalizeSettings({orbitalInitialization:'invalid'}).orbitalInitialization,'research');
});
test('nonphysical gravity or zero masses leave the supplied original initialization intact',()=>{
 const bodies=Array.from({length:4},(_,i)=>({x:i,y:0,z:0,vx:0,vy:0,vz:0,mass:i===0?0:1})),copy=structuredClone(bodies);assert.equal(prepareBalancedOrbits(bodies,1,{},normalizeSettings(),()=>.5),false);assert.deepEqual(bodies,copy);
});
