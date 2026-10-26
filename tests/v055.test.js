import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {GravityIntegrator} from '../src/physics/gravity.js';
import {FixedDisplayFrame} from '../src/fixed-display-frame.js';
import {TrailRibbon} from '../src/trail-ribbon.js';
import {TrailHistory,selectTrail} from '../src/adaptive-trails.js';
import {OrbitTrace} from '../src/orbit-trace.js';
import {Simulation} from './support/legacy-v055.js';
import {normalizeSettings,migrateSettings} from './support/legacy-v055.js';
const body=(x,y=0,mass=1)=>({x,y,z:0,vx:0,vy:0,vz:0,mass});

test('fixed display frame remains at the initial four-body center during stellar and planetary recoil',()=>{
 const initial=[body(-1),body(1),body(0,1),body(6000,0,.001)],before=structuredClone(initial),frame=new FixedDisplayFrame(),origin={...frame.reset(initial)};
 const escaping=initial.map(b=>({...b,x:b.x+100}));const shown=frame.position(escaping[0]);assert.equal(shown.x,escaping[0].x-origin.x);assert.deepEqual(frame.origin,origin);assert.deepEqual(initial,before);
 const reset=frame.reset(initial.map(b=>({...b,x:b.x-200})));assert.ok(Math.abs(reset.x-(origin.x-200))<1e-12);
});
test('legacy follow preferences cannot enable camera translation again',()=>{
 assert.equal(normalizeSettings({centerOnSystem:true}).centerOnSystem,false);assert.equal(migrateSettings({centerOnSystem:true}).centerOnSystem,false);
});
test('inertial diagnostics reveal a common velocity injection that internal energy cannot see',()=>{
 const b=[body(-1),body(1),body(0,1),body(0,-1)],integrator=new GravityIntegrator(b,1);
 for(const p of b)p.vx+=2;
 const d=integrator.diagnostics();assert.ok(d.relativeEnergyError<1e-14);assert.ok(d.relativeInertialEnergyError>1);assert.equal(d.centerVelocityDrift,2);assert.ok(d.normalizedMomentumDrift>1);
});
test('fixed-frame COM diagnostic allows correct inertial drift from explicit nonzero initial momentum',()=>{
 const b=[body(-1),body(1),body(0,1),body(0,-1)];for(const p of b)p.vx=2;
 const solver=new GravityIntegrator(b,0);solver.advance(2,{maxStep:.1,adaptive:false});const d=solver.diagnostics();
 assert.ok(Math.abs(d.center[0]-4)<1e-12);assert.ok(d.centerPositionDrift<1e-12);assert.equal(d.centerVelocityDrift,0);assert.ok(d.relativeInertialEnergyError<1e-14);
});
test('physical step observers leave every trajectory and conservation value unchanged',()=>{
 const a=new Simulation({seed:'V055-TRACE',autorestart:false}),b=new Simulation({seed:'V055-TRACE',autorestart:false},{},{trace:true});
 for(let i=0;i<300;i++){a.tick();b.tick();}
 assert.deepEqual(a.snapshot().bodies,b.snapshot().bodies);assert.deepEqual(a.snapshot().physics,b.snapshot().physics);assert.ok(b.orbitTrace.drain().some(p=>p.length>20));
});
test('fast orbit trace captures curvature between render messages and retains bounded queues',()=>{
 const trace=new OrbitTrace();for(let i=0;i<10000;i++){const a=i*.02;trace.observe([body(Math.cos(a),Math.sin(a))],i/100000);}
 const path=trace.drain()[0];assert.ok(path.length>100);assert.ok(path.length<=512);assert.ok(path.every(p=>Math.abs(Math.hypot(p.x,p.y)-1)<1e-12));assert.ok(trace.drain().every(p=>p.length===0));
});
test('trace simplification preserves both curved positions and accelerating straight motion at their timestamps',()=>{
 for(const curved of [true,false]){
  const trace=new OrbitTrace(),source=[];
  for(let i=0;i<=2000;i++){const time=i/2000,p=curved?body(.3*Math.cos(time*2*Math.PI),.3*Math.sin(time*2*Math.PI)):body(time*time);source.push({...p,time});trace.observe([p],time);}
  const h=new TrailHistory();for(const p of trace.drain()[0])h.push(p,p.time);
  for(const p of source){const sample=h.atTime(p.time);assert.ok(Math.hypot(p.x-sample.x,p.y-sample.y)<.00076);}
 }
});
test('interpolated trail head uses the same physical position as the body and never draws future samples',()=>{
 const h=new TrailHistory();h.push({x:0,y:0,z:0},0);h.push({x:100,y:20,z:0},1);h.push({x:200,y:0,z:0},2);
 const head=h.atTime(.5);assert.deepEqual(head,{x:50,y:10,z:0,time:.5});const trail=selectTrail(h,p=>p,{now:.5,viewport:1000});assert.deepEqual(trail.points.at(-1),head);assert.ok(trail.points.every(p=>p.time<=.5));assert.equal(trail.fractions.at(-1),1);
});
test('continuous ribbon shares join vertices, uses normal alpha blending and fades to transparency',()=>{
 const ribbon=new TrailRibbon(8),p=[body(0),body(1),body(2,1)];ribbon.setPath(p,[0,.5,1],new THREE.Color(1,.5,.25));
 assert.equal(ribbon.material.blending,THREE.NormalBlending);assert.equal(ribbon.geometry.drawRange.count,12);assert.deepEqual([...ribbon.geometry.index.array.slice(0,12)],[0,1,2,2,1,3,2,3,4,4,3,5]);assert.equal(ribbon.geometry.attributes.fade.array[0],0);assert.equal(ribbon.geometry.attributes.fade.array[4],1);
 assert.equal(ribbon.geometry.attributes.color.array[0],1);ribbon.setPath([],[],new THREE.Color());assert.equal(ribbon.geometry.drawRange.count,0);ribbon.geometry.dispose();ribbon.material.dispose();
});
