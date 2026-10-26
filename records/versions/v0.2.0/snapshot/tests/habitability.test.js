import test from 'node:test';
import assert from 'node:assert/strict';
import { Habitability } from '../src/habitability.js';
import { Simulation } from '../src/simulation.js';
import { normalizeSettings, algorithmId } from '../src/settings.js';

const safe = () => ({ tem:20,d14:1,d24:1,d34:1,d12:1,d13:1,d23:1,xntime:0,ktime:1,rst:0 });
function climateTick(s, temperature, extra = {}) {
  Object.assign(s.shared,safe(),{tem:temperature},extra);
  s.habitability.update(s.shared,s.settings);
  s.modules['042'].update('');
}

test('stable climate supports continuous civilization despite distant stellar encounters', () => {
  const s = new Simulation();
  for(let i=0;i<6000;i++) climateTick(s,20,{d12:.1,xntime:i/60});
  assert.equal(s.shared.civilizationAlive,true); assert.equal(s.shared.civilizationCount,1);
  assert.equal(s.shared.civilizationRecords.length,0); assert.equal(s.habitability.health,1);
  assert.ok(s.habitability.result.score>.99);
});

test('the same distant encounter still destroys civilization in legacy mode', () => {
  const s = new Simulation({civilizationMode:'legacy'});
  for(let i=0;i<60;i++)climateTick(s,20);
  climateTick(s,20,{d12:.1}); assert.equal(s.shared.civilizationAlive,false);
  assert.match(s.shared.civilizationRecords.at(-1).destructionEvent,/恒星1与恒星2/);
});

test('brief climate spikes reduce resilience without instant extinction and stable climate recovers', () => {
  const s = new Simulation(); for(let i=0;i<60;i++)climateTick(s,20);
  for(let i=0;i<30;i++)climateTick(s,300);
  assert.equal(s.shared.civilizationAlive,true); const stressed=s.habitability.health;assert.ok(stressed<1&&stressed>0);
  for(let i=0;i<600;i++)climateTick(s,20);
  assert.equal(s.shared.civilizationAlive,true);assert.ok(s.habitability.health>stressed);assert.equal(s.shared.civilizationRecords.length,0);
});

test('sustained extreme heat and cold still destroy civilization', () => {
  for(const temperature of [-250,1000]) {
    const s=new Simulation();for(let i=0;i<60;i++)climateTick(s,20);
    for(let i=0;i<600;i++)climateTick(s,temperature);
    assert.equal(s.shared.civilizationAlive,false);assert.equal(s.shared.civilizationRecords.length,1);
    assert.match(s.shared.civilizationRecords[0].destructionEvent,temperature<0?/低温/:/高温/);
  }
});

test('planetary collision and tidal destruction stay immediate, and hazards block rebirth loops', () => {
  for(const [distance,cause]of [[.1,/大撕裂/],[.18,/相撞/]]){
    const s=new Simulation({brfontcoloraaaaaarochelimitt:.15});for(let i=0;i<60;i++)climateTick(s,20);
    for(let i=0;i<200;i++)climateTick(s,20,{d14:distance});
    assert.equal(s.shared.civilizationAlive,false);assert.equal(s.shared.civilizationRecords.length,1);
    assert.match(s.shared.civilizationRecords[0].destructionEvent,cause);
  }
});

test('edited stable thresholds remain consistent with climate habitability', () => {
  const s=new Simulation({newproperty43:-10,newproperty44:100,newproperty45:-55,newproperty46:70});
  for(let i=0;i<1200;i++)climateTick(s,-50);
  assert.equal(s.habitability.result.stable,true);assert.equal(s.shared.civilizationAlive,true);assert.equal(s.habitability.health,1);
});

test('climate exposure depends on elapsed simulation time, not integration sampling rate', () => {
  const config=normalizeSettings();const a=new Habitability(),b=new Habitability();
  for(let i=0;i<60;i++)a.update({...safe(),tem:300},config,1/60);
  for(let i=0;i<120;i++)b.update({...safe(),tem:300},config,1/120);
  assert.ok(Math.abs(a.health-b.health)<1e-12);
});

test('tail visibility and color changes never reset the orbit', () => {
  const a=new Simulation(),b=new Simulation();for(let i=0;i<120;i++){a.tick();b.tick();}
  a.configure({newproperty14:false,brfontcoloraaaaaatrail1color:'1 0 0',trailsLength:120});
  for(let i=0;i<120;i++){a.tick();b.tick();}
  assert.deepEqual(a.snapshot().bodies,b.snapshot().bodies);assert.equal(a.revision,b.revision);
});

test('balanced simulation reduces stable-era extinction on the reported default Seed', () => {
  const counts=[];
  for(const civilizationMode of ['legacy','balanced']){
    const s=new Simulation({seed:'TRISOLARIS',civilizationMode});let deaths=0;
    for(let i=0;i<18000;i++){const before=s.shared.civilizationRecords.length;s.tick();if(s.era==='恒纪元')deaths+=s.shared.civilizationRecords.length-before;}
    counts.push(deaths);
  }
  assert.ok(counts[0]>20); assert.ok(counts[1]<counts[0]*.2,JSON.stringify(counts));
});

test('seed identifiers distinguish optimized and legacy civilization policies', () => {
  assert.notEqual(algorithmId(normalizeSettings()),algorithmId(normalizeSettings({civilizationMode:'legacy'})));
});
