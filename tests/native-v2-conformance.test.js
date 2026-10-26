import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Simulation} from '../src/simulation.js';
const fixture=JSON.parse(readFileSync(new URL('./fixtures/deflect-v2-native-summary.json',import.meta.url)));
for(const {kind,input,expected:r}of fixture.cases)test(`frozen native h4 deflect-v2: ${kind}, 20 years`,()=>{
 const sim=new Simulation(input.settings);let births=0,deaths=0,alive=0,active=0,stable=0,lastEvent=0;
 for(let i=0;i<1200;i++){
  sim.tick();assert.equal(sim.controlled.stellarFailure,null);assert.equal(sim.controlled.numericalUnknown,null);
  for(const e of sim.events){if(e.id<=lastEvent)continue;lastEvent=e.id;if(e.type==='civilization:birth')births++;if(e.type==='civilization:death')deaths++;}
  if(sim.shared.civilizationAlive){alive++;if(sim.civilization.phase==='active')active++;}
  if(sim.controlled.bodies[3].mass&&sim.world.state?.epoch.kind==='stable')stable++;
 }
 const c=sim.controlled;let max=0;
 for(let i=0;i<4;i++)for(let k=0;k<6;k++){const key=['x','y','z','vx','vy','vz'][k];max=Math.max(max,Math.abs(c.bodies[i][key]-(k<3?r.finalBodies[i].r[k]:r.finalBodies[i].v[k-3])));}
 assert.ok(max<1e-7,`maximum state deviation ${max}`);assert.equal(c.integrator.steps,r.steps);
 assert.equal(c.planetLosses,r.planetLosses);assert.equal(c.planetRespawns,r.planetRespawns);assert.equal(sim.generation,1);
 for(const key of ['projectionEvents','deflectionEvents','reflectionEvents','activeFrames'])assert.equal(c.cost[key],r.control[key]);
 for(const [actual,expected]of [[c.cost,r.control],[c.external,r.planetExternal]]){
  for(const [key,scale]of [['work',Math.max(1,expected.absoluteWork)],['absoluteWork',Math.max(1,expected.absoluteWork)],['impulse',Math.max(1,expected.impulse)]])assert.ok(Math.abs(actual[key]-expected[key])/scale<1e-7);
  for(const key of ['deltaP','deltaL'])assert.ok(Math.hypot(...actual[key].map((x,i)=>x-expected[key][i]))/Math.max(1,Math.hypot(...expected[key]))<1e-7);
 }
 assert.equal(births,r.civilizationBirths);assert.equal(deaths,r.civilizationDeaths);assert.equal(!!sim.shared.civilizationAlive,r.civilizationCurrentlyAlive);
 assert.ok(Math.abs(stable/1200-r.stableFraction)<1e-12);assert.ok(Math.abs(alive/1200-r.civilizationAliveFraction)<1e-12);assert.ok(Math.abs(active/1200-r.civilizationActiveFraction)<1e-12);
});
