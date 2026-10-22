import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {normalizeSettings,settingsFromInitial} from '../src/settings.js';
import {GravityIntegrator} from '../src/physics/gravity.js';
import {ControlledSystem,V2_STEP,V2_ETA} from '../src/physics/controlled-system.js';
const mode='deflect-v2',G=1.3275440274585598e-8;
const b=(x,y=0,mass=5e6)=>({x,y,z:0,vx:0,vy:0,vz:0,mass});
const fixture=()=>[b(-1.2),b(.4),b(1.8,1),b(1.82,1,5000)];

test('V2 control off uses the identical Newtonian integrator with zero external control',()=>{
 const s=new Simulation({stabilityMode:mode,newproperty60:false,seed:'V2-CONTROL-OFF'});s.modules['008'].initializePhysics();
 const original=structuredClone(s.initialBodies),reference=new GravityIntegrator(original,G),c=new ControlledSystem(s.initialBodies,G,s.settings);
 for(let i=0;i<120;i++){reference.advance(.0075,{maxStep:V2_STEP,eta:V2_ETA});c.advanceFrame();}
 assert.deepEqual(c.bodies,original);assert.equal(c.integrator.steps,reference.steps);assert.equal(c.cost.impulse,0);assert.equal(c.cost.projectionEvents,0);
});

test('physical planet loss and P5 respawn do not reset the universe even with autorestart enabled',()=>{
 const s=new Simulation(settingsFromInitial({stabilityMode:mode,newproperty60:true,autorestart:true},fixture()),{},{trace:true});s.tick();
 const c=s.controlled,loss=c.firstPlanetLoss,generation=s.generation;assert.equal(c.planetLosses,1);assert.equal(s.snapshot().world.planet.present,false);assert.equal(s.snapshot().bodies[3].mass,0);
 const returnFrame=c.returnFrame;while(c.frame<returnFrame-1)s.tick();
 assert.equal(c.planetRespawns,0);assert.ok(c.year-loss<5);assert.equal(s.generation,generation);s.tick();
 assert.equal(c.planetRespawns,1);assert.ok(c.year-loss>=5-1e-12);assert.equal(s.generation,generation);assert.equal(c.frame,returnFrame);assert.ok(c.external.impulse>0);assert.ok(c.external.absoluteWork>0);assert.equal(s.snapshot().world.planet.present,true);assert.ok(s.events.some(e=>e.type==='planet:respawn'));
 // The planet trace starts afresh; stellar trace histories remain continuous.
 assert.equal(s.orbitTrace.paths[3].raw.length,0);assert.ok(s.orbitTrace.paths[0].pending);
});

test('stellar contact is absorbing and never becomes an automatic new universe or numerical UNKNOWN',()=>{
 const initial=fixture();initial[0].x=0;initial[1].x=.04;initial[3].x=2;
 const s=new Simulation(settingsFromInitial({stabilityMode:mode,newproperty60:false,autorestart:true},initial));s.tick();
 assert.equal(s.controlled.stellarFailure.kind,'stellar-contact');assert.equal(s.controlled.numericalUnknown,null);assert.equal(s.controlled.integrator.numericalError,null);
 const before=s.snapshot();for(let i=0;i<400;i++)s.tick();const after=s.snapshot();
 assert.deepEqual(after.bodies,before.bodies);assert.equal(after.year,before.year);assert.equal(after.generation,before.generation);assert.equal(after.physics.physicalModelValid,false);assert.equal(after.events.filter(e=>e.type==='system:stellar-contact').length,1);assert.equal(after.events.some(e=>e.type==='universe:restart'),false);
});

test('numerical inability remains UNKNOWN with original physical failure field empty',()=>{
 const initial=fixture();initial[0].x=0;initial[1].x=0;
 const c=new ControlledSystem(initial,G,normalizeSettings({stabilityMode:mode,newproperty60:false}));assert.throws(()=>c.advanceFrame(),/步长/);assert.ok(c.numericalUnknown);assert.equal(c.stellarFailure,null);assert.equal(c.frame,0);
});

test('Seed replay, physical changes and display-only changes preserve the intended boundaries',()=>{
 const a=new Simulation({seed:'V2-REPLAY',stabilityMode:mode}),b=new Simulation({seed:'V2-REPLAY',stabilityMode:mode});a.tick();b.tick();assert.deepEqual(a.initialBodies,b.initialBodies);assert.deepEqual(a.snapshot().bodies,b.snapshot().bodies);
 const system=a.controlled;a.configure({bodyLabels:true,cnen2:true,pixelRatio:1,newproperty60:false});a.tick();assert.equal(a.controlled,system);assert.equal(a.controlled.frame,2);
 a.configure({_110:6e6});a.tick();assert.notEqual(a.controlled,system);assert.equal(a.initialBodies[0].mass,6e6);
 const normalized=normalizeSettings({stabilityMode:mode,gravityModel:'plummer',civilizationMode:'legacy',physicsMode:'realtime',newproperty53:5,encounterAccuracy:.03,timespeed:3});assert.equal(normalized.gravityModel,'newtonian');assert.equal(normalized.civilizationMode,'balanced');assert.equal(normalized.newproperty53,.1875);assert.equal(normalized.encounterAccuracy,.001875);assert.equal(normalized.timespeed,1);
 const replay=new Simulation(settingsFromInitial(a.settings,a.initialBodies));replay.tick();assert.deepEqual(replay.initialBodies,a.initialBodies);assert.equal(replay.snapshot().algorithm,a.snapshot().algorithm);
 a.configure({stabilityMode:'off'});a.tick();assert.equal(a.controlled,null);assert.equal(a.snapshot().physics.model,'newtonian');
});
