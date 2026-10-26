import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {checkpointV2,restoreV2,encodeV2,decodeV2} from '../src/v2-checkpoint.js';
import {settingsFromInitial} from '../src/settings.js';
const b=(x,y=0,mass=5e6)=>({x,y,z:0,vx:0,vy:0,vz:0,mass});
for(const absent of [false,true])test(`full-state resume is bitwise through controls/civilization/planet lifecycle; checkpoint while ${absent?'absent':'present'}`,()=>{
 const initial=[b(-1.2),b(.4),b(1.8,1),b(absent?1.82:1.8,absent?1:1.3,5000)],s=new Simulation(settingsFromInitial({stabilityMode:'deflect-v2',newproperty60:true,autorestart:true},initial),{},{trace:true});
 for(let i=0;i<30;i++)s.tick();assert.equal(s.controlled.bodies[3].mass>0,!absent);
 const data=decodeV2(encodeV2(checkpointV2(s))),resumed=restoreV2(data);
 assert.deepEqual(resumed.snapshot(),s.snapshot());for(let i=0;i<600;i++){s.tick();resumed.tick();}
 assert.deepEqual(resumed.snapshot(),s.snapshot());assert.deepEqual(checkpointV2(resumed),checkpointV2(s));
 if(absent)assert.ok(resumed.controlled.planetRespawns>0);
});
test('checkpoint format guards and nonfinite diagnostics survive JSON without becoming null',()=>{assert.throws(()=>restoreV2({version:2}));assert.deepEqual(decodeV2(encodeV2({a:Infinity,b:-Infinity,c:NaN})),{a:Infinity,b:-Infinity,c:NaN});});

test('checkpoint preserves RNG state across subsequent physical reinitialization',()=>{const s=new Simulation({stabilityMode:'deflect-v2',seed:'V2-RNG-RESTORE'});s.tick();s.configure({_110:6e6});s.tick();const resumed=restoreV2(decodeV2(encodeV2(checkpointV2(s))));s.configure({_110:7e6});resumed.configure({_110:7e6});s.tick();resumed.tick();assert.deepEqual(s.initialBodies,resumed.initialBodies);assert.deepEqual(s.snapshot(),resumed.snapshot());});
