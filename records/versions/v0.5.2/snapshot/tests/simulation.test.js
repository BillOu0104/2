import test from 'node:test';
import assert from 'node:assert/strict';
import { Simulation } from '../src/simulation.js';
import { normalizeSettings, settingsFromInitial } from '../src/settings.js';
import { propertySchema } from '../src/original-data.js';
import { readFileSync } from 'node:fs';

function run(s, ticks) { for (let i = 0; i < ticks; i++) s.tick(); return s.snapshot(); }
function finite(s) { assert.ok(s.bodies.every(b => ['x','y','z','vx','vy','vz','mass'].every(k => Number.isFinite(b[k])))); assert.ok(Number.isFinite(s.temperature)); }

test('ported trajectories match independently executed original SceneScript reference', () => {
  const fixture = JSON.parse(readFileSync(new URL('./fixtures/original-reference.json', import.meta.url), 'utf8'));
  const state = run(new Simulation({...fixture.settings,gravityModel:'legacy'}), fixture.ticks);
  // Independent fixtures may differ in the last bits across V8 versions.
  for (let i = 0; i < 4; i++) for (const key of ['x','y','z','vx','vy','vz','mass']) assert.ok(Math.abs(state.bodies[i][key]-fixture.bodies[i][key])<=1e-12*Math.max(1,Math.abs(fixture.bodies[i][key])), `body ${i} ${key}`);
});

test('183 original controls retain definitions, with the requested trails enabled by default', () => {
  const controls = Object.entries(propertySchema).filter(([, p]) => p.type && p.type !== 'group');
  assert.equal(controls.length, 183);
  const config = normalizeSettings();
  for (const [key, def] of controls) assert.deepEqual(config[key], ({newproperty60:false,newproperty14:true,brfontcoloraaaaaarandomposrange:3.2,rc:1.6,k2:.3,newproperty67:4,newproperty39:true,newproperty45:-20,newproperty46:40,newproperty51:.01,newproperty61:1,newproperty3:0,newproperty68:0})[key] ?? def.value, key);
  const sim = new Simulation();
  assert.equal(sim.modules['008'].scriptProperties.fourthMass, 5000);
  assert.equal(sim.modules['008'].scriptProperties.constraint_M, 15000000);
  assert.equal(sim.modules['079'].scriptProperties.k_temp_dist, 7);
  assert.equal(sim.modules['042'].scriptProperties.rocheLimit, .21);
});

test('same Seed and configuration produce identical trajectories, civilizations and events', () => {
  const first = run(new Simulation({ seed: 'determinism' }), 2400);
  const second = run(new Simulation({ seed: 'determinism' }), 2400);
  assert.deepEqual(first, second);
  const another = run(new Simulation({ seed: 'different' }), 2400);
  assert.notDeepEqual(first.bodies, another.bodies);
});

test('manual initial conditions override random Seed', () => {
  const a = run(new Simulation({ newproperty50: true, seed: 'a' }), 100);
  const b = run(new Simulation({ newproperty50: true, seed: 'b' }), 100);
  assert.deepEqual(a.bodies, b.bodies);
});

test('exported actual initial conditions replay the same random orbit across generations', () => {
  const original = new Simulation({seed:'seed-roundtrip'}); original.restart(); const state=run(original,120);
  const replay = new Simulation(settingsFromInitial(original.settings, state.initialBodies)); const other=run(replay,120);
  assert.deepEqual(other.bodies,state.bodies);
});

test('pairwise force conserves linear momentum when the cage is off', () => {
  const s = new Simulation({ newproperty50: true, newproperty60: false, autorestart: false });
  s.tick();
  const momentum = bodies => ['vx','vy','vz'].map(k => bodies.reduce((sum,b) => sum+b.mass*b[k],0));
  const initial = momentum(s.snapshot().bodies);
  const final = momentum(run(s, 3000).bodies);
  for (let i=0;i<3;i++) assert.ok(Math.abs(initial[i]-final[i]) < Math.max(1,Math.abs(initial[i])) * 1e-10);
});

test('Yoshida integration is time reversible in a smooth far-field trajectory', () => {
  const s = new Simulation({ newproperty50: true, newproperty60: false, autorestart: false, newproperty28: .001 });
  s.tick(); const p=s.modules['008']; const before=structuredClone(p.state().bodies);
  for(let i=0;i<200;i++)p.directStep(.0001);
  for(let i=0;i<200;i++)p.directStep(-.0001);
  for(let i=0;i<4;i++) for(const k of ['x','y','z','vx','vy','vz']) assert.ok(Math.abs(before[i][k]-p.state().bodies[i][k])<1e-11);
});

test('step-size changes recreate the integrator with the requested step', () => {
  const s=new Simulation();s.tick();assert.equal(s.modules['008'].state().step,.00075);
  s.configure({newproperty53:2});s.tick();assert.equal(s.modules['008'].state().step,.002);finite(s.snapshot());
});

test('all six measured distances are available independently of UI visibility', () => {
  const a=new Simulation({menul:false,audiobar:false,newproperty65:false});
  const b=new Simulation({menul:true,audiobar:true,newproperty65:true});
  const x=run(a,120),y=run(b,120);
  assert.deepEqual(x.bodies,y.bodies);assert.deepEqual(x.distances,y.distances);
  for(const key of ['d12','d13','d23','d14','d24','d34'])assert.ok(Number.isFinite(a.shared[key]));
});

test('temperature matches radiative equilibrium including snow feedback and oscillation', () => {
  const s=new Simulation();s.shared.d14=1;s.shared.d24=2;s.shared.d34=3;s.engine.runtime=0;
  s.modules['079'].update('');
  const factor=1e12/7/1.496e11;
  const flux=1361*(1.5+0.5/4+0.1/9)/(factor*factor);
  const expected=Math.pow(flux*.7/(4*5.67e-8),.25)-273.15;
  assert.equal(Number(s.shared.tem),Number(expected.toFixed(2)));
  s.shared.d14=s.shared.d24=s.shared.d34=100;s.modules['079'].update('');assert.ok(s.shared.tem<0);assert.ok(s.shared.tem>=-270);
});

test('legacy mode preserves original birth, thermal death and Roche priority', () => {
  const s=new Simulation({civilizationMode:'legacy'});const module=s.modules['042'];
  Object.assign(s.shared,{tem:20,d14:1,d24:1,d34:1,d12:1,d13:1,d23:1,xntime:0,ktime:1,rst:0});
  for(let i=0;i<49;i++)module.update('');assert.equal(s.shared.civilizationAlive,false);
  module.update('');assert.equal(s.shared.civilizationAlive,true);
  s.shared.xntime=10;s.shared.tem=500;module.update('');
  assert.equal(s.shared.civilizationAlive,false);assert.equal(s.shared.civilizationRecords[0].lifespan,10);assert.equal(s.shared.civilizationRecords[0].destructionEvent,'高温');
  s.shared.tem=20;for(let i=0;i<50;i++)module.update('');
  s.shared.d14=.1;module.update('');assert.match(s.shared.civilizationRecords.at(-1).destructionEvent,/大撕裂/);
});

test('manual restart records one death and does not secretly reinitialize 120 ticks later', () => {
  const s=new Simulation({seed:'TRISOLARIS',civilizationMode:'legacy'});run(s,60);assert.equal(s.shared.civilizationAlive,true);
  s.restart();s.tick();const initial=structuredClone(s.initialBodies);run(s,140);
  assert.deepEqual(s.initialBodies,initial);assert.equal(s.generation,2);
  const event=s.events.find(e=>e.type==='civilization:death');assert.ok(event);assert.equal(event.detail.initialBodies.length,4);
});

test('zero masses and unsoftened noncoincident initial bodies remain finite', () => {
  for(const config of [
    {_110:0,_26:0,_34:0,newproperty8:0},
    {newproperty28:0,newproperty60:false}
  ]) finite(run(new Simulation(config),300));
});

test('long reference run remains finite and has bounded in-memory event buffers', () => {
  const s=new Simulation({seed:'long-session'});finite(run(s,20000));
  assert.ok(s.events.length<=100);assert.ok(s.shared.civilizationRecords.length<=1000);
});

test('settings clamp malformed numeric values and reject invalid combo/color data', () => {
  const s=normalizeSettings({timespeed:Infinity,newproperty53:-100,newproperty17:'nope',datacolor:'bad bad bad',seed:99});
  assert.equal(s.timespeed,1);assert.equal(s.newproperty53,propertySchema.newproperty53.min);assert.equal(s.newproperty17,'4');assert.equal(s.datacolor,propertySchema.datacolor.value);assert.equal(s.seed,'TRISOLARIS');
});

// A terminal world remains visible while awaiting the explicit universe restart.
test('planetary loss has one archive entry, no rebirth and a complete four-body snapshot through restart',()=>{
  const s=new Simulation({autorestart:false});s.tick();
  s.shared.civilizationAlive=true;s.shared.civilizationStartTime=0;s.civilization.reset();
  s.world.terminal={kind:'disrupted',zh:'大撕裂',en:'Great Tear'};
  run(s,360);assert.equal(s.snapshot().alive,false);assert.equal(s.shared.civilizationRecords.length,1);assert.equal(s.snapshot().world.planet.terminal.kind,'disrupted');assert.equal(s.generation,1);
  s.restart();assert.equal(s.snapshot().bodies.length,4);s.tick();assert.equal(s.snapshot().world.planet.terminal,null);assert.equal(s.generation,2);
});

test('automatic planetary restart publishes a complete new generation on the next tick',()=>{
  const s=new Simulation({autorestart:true});s.tick();s.world.terminal={kind:'disrupted',zh:'大撕裂',en:'Great Tear'};
  let previous=s.snapshot();for(let i=0;i<250;i++){s.tick();const state=s.snapshot();assert.equal(state.bodies.length,4);if(state.generation!==previous.generation)assert.equal(state.world.planet.terminal,null);previous=state;}
  assert.equal(s.generation,2);
});
