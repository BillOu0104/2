import test from 'node:test';
import {replaySettings} from '../src/seed-compatibility.js';
import assert from 'node:assert/strict';
import {GravityIntegrator,invariants,pairPotential,PhysicsError} from '../src/physics/gravity.js';
import {Simulation} from './support/legacy-v055.js';
import {normalizeSettings,settingsFromInitial,migrateSettings} from './support/legacy-v055.js';
import {initial as researchInitial,planetOrbit,angular,G,runTrial as referenceTrial} from '../tools/v052/research-reference.mjs';
import {runTrial} from '../tools/v052/benchmark-engine.mjs';
const body=(x,mass=1,vx=0,vy=0)=>({x,y:0,z:0,vx,vy,vz:0,mass});
const binary=()=>[body(-.5,1,0,-Math.sqrt(.5)),body(.5,1,0,Math.sqrt(.5)),body(8,0),body(-8,0)];
const norm=v=>Math.hypot(...v),fields=['x','y','z','vx','vy','vz'];

test('Newton pair force has no former .1/.28 amplification or discontinuity and conserves momentum',()=>{
 for(const r of [.099999,.1,.100001,.279999,.28,.280001,.5]){
  const b=[body(0,2),body(r,3),body(8,0),body(-8,0)],p=new GravityIntegrator(b,1);p.kick(1e-6);
  assert.ok(Math.abs(b[0].vx/(3e-6/r**2)-1)<1e-14);
  assert.ok(Math.abs(2*b[0].vx+3*b[1].vx)<1e-18);
 }
});
test('Plummer acceleration is continuous and is the gradient of its stated potential',()=>{
 for(const r of [0,.05,.099999,.1,.100001,.279999,.28,.280001,.5]){
  const b=[body(0),body(r),body(8,0),body(-8,0)],p=new GravityIntegrator(b,1,{model:'plummer',softening:.1});p.kick(1);
  const derivative=(pairPotential(r+1e-7,p)-pairPotential(r-1e-7,p))/2e-7;
  assert.ok(Math.abs(b[0].vx-derivative)<1e-6);
 }
});
test('softened coincident bodies remain finite without a singular artificial radius',()=>{const p=new GravityIntegrator([body(0),body(0),body(8,0),body(-8,0)],1,{model:'plummer',softening:.1});p.advance(.01);assert.ok(Number.isFinite(p.diagnostics().energy));});
test('Yoshida conserves energy/L/P, and decreasing fixed step shows fourth order convergence',()=>{
 const errors=[],stateErrors=[];
 for(const h of [.04,.02,.01]){
  const p=new GravityIntegrator(binary(),1);p.advance(1,{maxStep:h,adaptive:false});const d=p.diagnostics();errors.push(d.relativeEnergyError);stateErrors.push(Math.abs(p.bodies[0].x+.5*Math.cos(Math.sqrt(2))));
  assert.ok(d.relativeAngularMomentumError<2e-14);assert.ok(d.normalizedMomentumDrift<2e-14);
 }
 assert.ok(stateErrors[0]/stateErrors[1]>14&&stateErrors[1]/stateErrors[2]>14,JSON.stringify(stateErrors));
 assert.ok(errors[2]<1e-12);
 const p=new GravityIntegrator(binary(),1);p.advance(10);assert.ok(p.diagnostics().maxRelativeEnergyError<1e-10);
});
test('adaptive substeps resolve close approaches without changing elapsed physical time',()=>{
 const b=binary();b[0].x=-.01;b[1].x=.01;
 const p=new GravityIntegrator(b,1);const n=p.advance(.002,{maxStep:.00075});assert.ok(n>3);assert.ok(Math.abs(p.time-.002)<1e-15);
 assert.ok(p.diagnostics().relativeEnergyError<1e-6);
});
test('contact detection uses accepted segments; singularity/resource failures are explicit, never velocity corrections',()=>{
 const b=[body(-.1,1,1),body(.1,1,-1),body(8,0),body(-8,0)],p=new GravityIntegrator(b,0,{radii:[.05,.05,0,0]});p.advance(.08,{maxStep:.08,adaptive:false});assert.equal(p.contacts.length,1);assert.equal(p.diagnostics().physicalModelValid,false);
 const coincident=[body(0),body(0),body(8,0),body(-8,0)],copy=structuredClone(coincident),bad=new GravityIntegrator(coincident,1);
 assert.throws(()=>bad.advance(.1),PhysicsError);assert.deepEqual(coincident,copy);assert.ok(bad.numericalError);
 const small=new GravityIntegrator(binary(),1);assert.throws(()=>small.advance(.1,{maxSteps:1}),/预算/);assert.ok(small.time<.1);assert.equal(small.numericalError.code,'step-budget');
});
test('cage remains available, but diagnostics label its nonisolated energy budget',()=>{
 const p=new GravityIntegrator(binary(),1,{cageAcceleration:b=>({x:-b.x,y:-b.y,z:-b.z})});p.advance(.01);assert.equal(p.diagnostics().conservationApplicable,false);
 const s=new Simulation({newproperty60:true});s.tick();assert.equal(s.snapshot().physics.cageActive,true);s.configure({newproperty60:false});s.tick();assert.equal(s.snapshot().physics.cageActive,false);
});
test('default research initialization matches validated candidate for predetermined seeds, with recoil, Q≈1 and retrograde circular orbit',()=>{
 for(let i=0;i<16;i++){
  const seed=`V052-INITIAL-${i}`,s=new Simulation({seed,autorestart:false});s.tick();
  const expected=researchInitial(seed,{mode:'chaotic',Q:1,planet:'bound',inPlane:true,radiusFraction:.12,direction:-1}).bodies;
  for(let j=0;j<4;j++)for(const k of [...fields,'mass'])assert.ok(Math.abs(s.initialBodies[j][k]-expected[j][k])<1e-13,`${seed}:${j}:${k}`);
  const d=invariants(s.initialBodies,G),orbit=planetOrbit(s.initialBodies),stars=s.initialBodies.slice(0,3),L=angular(stars),p=s.initialBodies[3],h=stars[2],r=[p.x-h.x,p.y-h.y,p.z-h.z],v=[p.vx-h.vx,p.vy-h.vy,p.vz-h.vz],cross=[r[1]*v[2]-r[2]*v[1],r[2]*v[0]-r[0]*v[2],r[0]*v[1]-r[1]*v[0]];
  assert.ok(norm(d.momentum)<1e-7);assert.ok(norm(d.center)<1e-14);const beforeRecoil=structuredClone(stars);['vx','vy','vz'].forEach((k,j)=>beforeRecoil[2][k]+=p.mass/(h.mass+p.mass)*v[j]);assert.ok(Math.abs(invariants([...beforeRecoil,body(8,0)],G).virialRatio-1)<1e-13);assert.ok(orbit.eccentricity<1e-7);assert.ok(cross.reduce((n,x,j)=>n+x*L[j],0)<0);
  const D=Math.min(...stars.slice(0,2).map(b=>Math.hypot(b.x-h.x,b.y-h.y,b.z-h.z)));assert.ok(Math.abs(orbit.radius/D-.12)<1e-14);
 }
});
test('exact manual initial states beyond legacy slider ranges survive UI changes and are never auto-regenerated',()=>{
 const source=new Simulation({seed:'MANUAL-V052'});source.tick();const initial=structuredClone(source.initialBodies);initial[0].x=4.5;initial[0].vx=3;
 const settings=settingsFromInitial(source.settings,initial),s=new Simulation(settings);s.tick();assert.deepEqual(s.initialBodies,initial);
 const control=new Simulation(settings);control.tick();s.configure({viewSensitivity:.04,dust:false});s.tick();control.tick();assert.deepEqual(s.snapshot().bodies,control.snapshot().bodies);
 assert.equal(s.configure({x11:.25}).includes('manualInitialBodies'),true);s.tick();assert.equal(s.initialBodies[0].x,.25);
});
test('new defaults migrate even oldest profiles while explicit compatibility choices remain available',()=>{
 const s=migrateSettings({seed:'OLD'},2);assert.equal(s.orbitalInitialization,'research');assert.equal(s.gravityModel,'newtonian');assert.equal(s.newproperty60,false);assert.equal(s.epochWindow,1/12);
 const keep=migrateSettings({...normalizeSettings(),orbitalInitialization:'chaotic',gravityModel:'legacy',newproperty60:true});assert.equal(keep.gravityModel,'legacy');assert.equal(keep.orbitalInitialization,'chaotic');assert.equal(keep.newproperty60,true);
 const bad=new Simulation({newproperty50:true,x11:0,y11:0,z1:0,x21:0,y21:0,z2:0});assert.throws(()=>bad.tick(),PhysicsError);assert.equal(bad.events.at(-1).type,'physics:numerical-error');
});
test('production benchmark preserves research first-loss, era denominator and three-arm reference parity',()=>{
 for(const cfg of [{id:'legacy',force:'legacy',dt:.00075},{id:'newton',force:'newton',adaptive:true,eta:.0075}]){
  const a=runTrial('V052-METRIC-0',cfg,10),b=referenceTrial('V052-METRIC-0',{...cfg,mode:'chaotic'},10);
  assert.equal(a.lossAt,b.lossAt);assert.equal(a.stableFraction,b.stableFraction);assert.equal(a.survived,b.survived);assert.equal(a.jointSurvived,b.jointSurvived);
 }
});

test('explicit old Seed/archive imports retain the old force and cage, while new exports retain new physics',()=>{const old=replaySettings({orbitalInitialization:'chaotic',newproperty60:true,seed:'OLD'});assert.equal(old.gravityModel,'legacy');assert.equal(old.newproperty60,true);assert.equal(old.orbitalInitialization,'chaotic');const fresh=replaySettings(normalizeSettings());assert.equal(fresh.gravityModel,'newtonian');assert.equal(fresh.newproperty60,false);});

test('tiny final remainders do not falsely signal an unresolved close encounter',()=>{const p=new GravityIntegrator(binary(),1);p.advance(1.000000000005,{maxStep:.1,adaptive:false});assert.ok(Math.abs(p.time-1.000000000005)<1e-14);});
