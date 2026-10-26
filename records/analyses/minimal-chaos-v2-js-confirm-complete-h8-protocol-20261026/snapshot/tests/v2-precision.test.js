import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../src/simulation.js';
import {createControlledSystem} from '../src/v2-simulation.js';
import {ChaosObserver} from '../tools/v2/chaos-observer.mjs';
import {applyPrecision} from '../tools/v2/precision-options.mjs';
import {checkpointV2, restoreV2, encodeV2, decodeV2} from '../src/v2-checkpoint.js';
const create=()=>{const s=new Simulation({seed:'V2-PRECISION-RESTORE',stabilityMode:'deflect-v2'});s.controlled=createControlledSystem(s);return s;};
const advance=(s,o,n)=>{for(let i=0;i<n;i++){s.tick();o.observe(s.controlled);}};
test('h4 adapter preserves every primary and observer value',()=>{
 const a=create(),b=create(),oa=new ChaosObserver(a.controlled),ob=new ChaosObserver(b.controlled);
 applyPrecision(a.controlled,oa,{maxStep:.0001875,eta:.001875});
 advance(a,oa,640);advance(b,ob,640);
 assert.deepEqual(checkpointV2(a),checkpointV2(b));assert.deepEqual(oa.checkpoint(),ob.checkpoint());
});
test('h8 uses at least80 steps/frame without changing display or solver clock; full restore remains bitwise',()=>{
 const a=create(),oa=new ChaosObserver(a.controlled),precision={maxStep:.00009375,eta:.0009375};
 applyPrecision(a.controlled,oa,precision);advance(a,oa,380);
 const b=restoreV2(decodeV2(encodeV2(checkpointV2(a)))),ob=ChaosObserver.restore(decodeV2(encodeV2(oa.checkpoint())));
 applyPrecision(b.controlled,ob,precision);advance(a,oa,300);advance(b,ob,300);
 assert.deepEqual(checkpointV2(a),checkpointV2(b));assert.deepEqual(oa.checkpoint(),ob.checkpoint());
 assert.equal(a.controlled.frame,680);assert(a.controlled.integrator.steps>=80*680);
 assert(Math.abs(a.controlled.integrator.time-.0075*680)<1e-9);
 assert.equal(a.controlled.stellarFailure,null);assert.equal(a.controlled.numericalUnknown,null);
 assert.throws(()=>applyPrecision(a.controlled,oa,precision),/once/);
});
