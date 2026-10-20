import test from 'node:test';
import assert from 'node:assert/strict';
import { Habitability } from '../src/habitability.js';
import { WorldState, largestEigenvalue } from '../src/world-state.js';
import { CivilizationState } from '../src/civilization-state.js';
import { Simulation } from '../src/simulation.js';
import { normalizeSettings, migrateSettings } from '../src/settings.js';
const settings=normalizeSettings({stellarBreathing:false,autorestart:false});
const body=(x,y=0,mass=1000,vx=0,vy=0)=>({x,y,z:0,mass,vx,vy,vz:0});
const bodies=()=>[body(1,0,1e6,0,1),body(20,1,1e3),body(-20,2,1e3),body(0,0,5000)];
function fixture(){
 const shared={civilizationAlive:false,civilizationCount:1,civilizationStartTime:0,lastCivilizationLifespan:0,civilizationRecords:[]};
 const civ=new CivilizationState(shared),hab=new Habitability();let runtime=0;
 return {shared,civ,hab,tick(temperature=20,options={}){runtime+=1/60;const world={epoch:{kind:options.epoch||'stable'},planet:{temperature,terminal:options.terminal||null},phenomena:[],safeToWake:options.safe!==false};const h=hab.update({tem:temperature},settings,1/60,{alive:shared.civilizationAlive,number:shared.civilizationCount,developmentYears:civ.developmentYears,phase:civ.phase,terminal:world.planet.terminal});return civ.update(world,h,settings,runtime,runtime);},run(n,t=20,o={}){for(let i=0;i<n;i++)this.tick(t,o);}};
}

test('only -20 through 40 C supports activity, independently of era',()=>{
 for(const [temperature,expected]of[[-21,false],[-20,true],[40,true],[41,false]])assert.equal(new Habitability().update({tem:temperature},settings).canGrow,expected);
 const f=fixture();f.run(240,20,{epoch:'chaotic'});assert.equal(f.civ.phase,'active');assert.equal(f.shared.civilizationCount,1);
});
test('dehydration preserves the same civilization; safe rehydration resumes it',()=>{
 const f=fixture();f.run(240);assert.equal(f.civ.phase,'active');f.run(180,100);assert.equal(f.civ.phase,'dormant');assert.equal(f.shared.civilizationAlive,true);
 f.run(360);assert.equal(f.civ.phase,'active');assert.equal(f.shared.civilizationCount,1);assert.equal(f.shared.civilizationRecords.length,0);assert.equal(f.civ.logs.filter(l=>l.kind==='birth').length,1);
});
test('unsafe fluctuating climate interrupts rehydration instead of creating new civilizations',()=>{
 const f=fixture();f.run(240);f.run(180,80);f.run(75);assert.equal(f.civ.phase,'rehydrating');f.tick(20,{safe:false});assert.equal(f.civ.phase,'dormant');assert.equal(f.shared.civilizationCount,1);
});
test('dry storage is finite and prolonged extreme heat or cold destroys it once',()=>{
 for(const temp of[-250,1000]){const f=fixture();f.run(240);f.run(24000,temp);assert.equal(f.shared.civilizationAlive,false);assert.equal(f.shared.civilizationRecords.length,1);assert.equal(f.civ.phase,'destroyed');}
});
test('destroyed planet permanently blocks local rebirth even with comfortable temperature',()=>{
 const f=fixture();f.run(240);const terminal={kind:'disrupted',zh:'大撕裂',en:'Great Tear'};f.run(2400,20,{terminal});assert.equal(f.shared.civilizationAlive,false);assert.equal(f.shared.civilizationRecords.length,1);assert.equal(f.civ.phase,'destroyed');
});
test('orbital stable era can be frozen; distant flying stars do not require cold weather',()=>{
 const w=new WorldState();let state;for(let i=0;i<180;i++)state=w.update(bodies(),1e-6,-150,settings,i/60);
 assert.equal(state.epoch.kind,'stable');assert.equal(state.planet.condition,'frozen');assert.ok(state.phenomena.some(p=>p.kind==='flying'));
 const warm=new WorldState().update(bodies(),1e-6,20,settings,0);assert.ok(warm.phenomena.some(p=>p.kind==='flying'));assert.equal(warm.epoch.kind,'chaotic');assert.equal(warm.planet.condition,'temperate');
});
test('stationary flying star requires a closing radial velocity, not zero camera motion',()=>{
 const b=bodies();b[1]=body(20,0,1000,-1);let s=new WorldState().update(b,1e-6,20,settings,0);assert.ok(s.phenomena.some(p=>p.kind==='stationary'));
 b[1].vx=1;s=new WorldState().update(b,1e-6,20,settings,0);assert.ok(!s.phenomena.some(p=>p.kind==='stationary'));
});
test('alignment requires three stars on the same ray; opposite directions do not count',()=>{
 const b=[body(2),body(3),body(4),body(0,0,5000)];let s=new WorldState().update(b,1e-6,20,settings,0);assert.ok(s.phenomena.some(p=>p.kind==='alignment'));assert.equal(s.planet.terminal,null);assert.equal(s.stars[1].visibleFraction,0);
 b[2].x=-4;s=new WorldState().update(b,1e-6,20,settings,0);assert.ok(!s.phenomena.some(p=>p.kind==='alignment'));
});
test('differential gravity tensor is rotation invariant and combines all stellar tides',()=>{
 assert.equal(largestEigenvalue([[2,0,0],[0,-1,0],[0,0,-1]]),2);assert.ok(Math.abs(largestEigenvalue([[.5,1.5,0],[1.5,.5,0],[0,0,-1]])-2)<1e-12);
 const w=new WorldState(),b=[body(.2,0,1e7),body(10,0,0),body(-10,0,0),body(0,0,5000)];
 const s=w.update(b,1e-6,20,{...settings,newproperty20:.02},0);assert.ok(Math.abs(s.planet.tideRatio-4)<1e-10);assert.ok(s.planet.integrity<1);
 const integrity=s.planet.integrity;b[0].x=10;assert.equal(w.update(b,1e-6,20,settings,1).planet.integrity,integrity);
});
test('stellar contact is irreversible, and thermal inertia softens instantaneous radiative spikes',()=>{
 const w=new WorldState(),b=bodies();w.update(b,1e-6,20,settings,0);let s=w.update(b,1e-6,1000,settings,1/60);assert.ok(s.planet.temperature>20&&s.planet.temperature<40);
 b[0].x=.001;s=w.update(b,1e-6,20,settings,1);assert.equal(s.planet.terminal.kind,'engulfed');b[0].x=100;assert.equal(w.update(b,1e-6,20,settings,2).planet.terminal.kind,'engulfed');
});
test('climate damage depends on elapsed time instead of sampling frequency',()=>{
 const a=new Habitability(),b=new Habitability();for(let i=0;i<60;i++)a.update({tem:300},settings,1/60,{alive:true,number:1});for(let i=0;i<120;i++)b.update({tem:300},settings,1/120,{alive:true,number:1});assert.ok(Math.abs(a.health-b.health)<1e-12);
});
test('tail visibility and color never reset physical trajectories',()=>{
 const a=new Simulation(),b=new Simulation();for(let i=0;i<120;i++){a.tick();b.tick();}a.configure({newproperty14:false,brfontcoloraaaaaatrail1color:'1 0 0',trailsLength:120});for(let i=0;i<120;i++){a.tick();b.tick();}assert.deepEqual(a.snapshot().bodies,b.snapshot().bodies);
});
test('previous settings migrate the requested slow rotation, activity bounds and clarity',()=>{
 const migrated=migrateSettings({newproperty51:3,newproperty45:-55,newproperty46:70},2);assert.equal(migrated.newproperty51,.01);assert.equal(migrated.newproperty45,-20);assert.equal(migrated.newproperty46,40);assert.equal(migrated.newproperty68,0);assert.equal(migrateSettings({newproperty51:.001},2).newproperty51,.001);
});
